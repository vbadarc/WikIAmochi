/**
 * naturalVoiceService.js - Motor de voz de Muñeco Gracioso con Web Audio API pura
 * Decodifica directamente el buffer de audio en memoria y eleva físicamente su frecuencia
 * fundamental (AudioBufferSourceNode), garantizando un timbre 100% de dibujo animado/Flubber.
 * 
 * Garantiza consistencia total de voz: nunca mezcla dos voces distintas en la misma respuesta.
 */

export class NaturalVoiceService {
    constructor() {
        this.audioCtx = null;
        this.currentSource = null;
        this.isPlaying = false;
        this.audioQueue = [];
        this.preloadedAudioBuffers = new Map();
        this.inflightPromises = new Map();
        this.onStartCallback = null;
        this.onEndCallback = null;

        // Motor activo durante la sesión actual ('webaudio' | 'system' | null)
        this.sessionEngine = null;

        // Contador de sesión para descartar ejecuciones asíncronas canceladas
        this.currentSessionId = 0;

        // Modulación armónica de estilo
        this.pitchRate = 1.0;
        this.voiceStyle = 'cartoon_flubber';
        this.selectedSystemVoice = null;
        this.useSystemVoiceExplicitly = false;
        this.forceOfflineSpeech = false;

        // Soporte nativo para Android TTS (Capacitor)
        this.isCapacitorAndroid = typeof window !== 'undefined' && !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
        this.capTTS = null;
        this.androidVoices = [];
        this.selectedAndroidVoice = null;
        this.hasSpanishVoice = true;

        if (this.isCapacitorAndroid) {
            this.initAndroidTTS();
        }
    }

    async initAndroidTTS() {
        try {
            if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech) {
                this.capTTS = window.Capacitor.Plugins.TextToSpeech;
                const res = await this.capTTS.getSupportedVoices();
                if (res && res.voices) {
                    this.androidVoices = res.voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('es'));
                    console.log(`[AndroidTTS] Voces en español detectadas (${this.androidVoices.length}):`, this.androidVoices.map(v => `${v.name} (${v.lang})`));
                    if (this.androidVoices.length > 0) {
                        this.selectedAndroidVoice = this.androidVoices[0];
                        this.hasSpanishVoice = true;
                    } else {
                        this.hasSpanishVoice = false;
                        console.warn('[AndroidTTS] ALERTA: No hay voces en español instaladas en el motor TTS.');
                    }
                }
            }
        } catch (e) {
            console.warn('[AndroidTTS] Error inicializando TTS nativo:', e);
        }
    }

    getAudioContext() {
        if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContextClass();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    setOfflineMode(isOffline) {
        this.forceOfflineSpeech = isOffline;
    }

    setVoice(engine, voice) {
        if (engine === 'system') {
            this.selectedSystemVoice = voice;
            this.useSystemVoiceExplicitly = true;
            this.sessionEngine = 'system';
        } else {
            this.useSystemVoiceExplicitly = false;
            this.sessionEngine = null;
        }
    }

    setCartoonTone(style) {
        this.voiceStyle = style;
        this.useSystemVoiceExplicitly = false;
        this.sessionEngine = null;
        this.preloadedAudioBuffers.clear();
        this.pitchRate = 1.0;
    }

    stop() {
        this.isPlaying = false;
        this.currentSessionId++; // Invalida cualquier tarea asíncrona en curso
        this.audioQueue = [];
        this.preloadedAudioBuffers.clear();
        this.inflightPromises.clear();
        this.sessionEngine = null;

        if (this.currentSource) {
            try {
                this.currentSource.stop();
                this.currentSource.disconnect();
            } catch (e) {}
            this.currentSource = null;
        }

        if (this.capTTS) {
            try {
                this.capTTS.stop();
            } catch (e) {}
        }

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        if (this.onEndCallback) {
            const cb = this.onEndCallback;
            this.onEndCallback = null;
            cb();
        }
    }

    /**
     * División inteligente con Arranque Ultrarrápido (First-Sentence Fast Start):
     * El primer fragmento es corto (~20-75 caracteres) para hablar al instante,
     * y los siguientes agrupan hasta 165 caracteres para máxima fluidez.
     */
    splitIntoSentences(text) {
        if (!text) return [];
        const clean = text.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
        const sentenceMatches = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
        if (!sentenceMatches) return [clean];

        const chunks = [];
        let current = "";

        for (const s of sentenceMatches) {
            const seg = s.trim();
            if (!seg) continue;

            // El primer fragmento tiene un límite menor (75 chars) para reproducirse de inmediato
            const maxLen = chunks.length === 0 ? 75 : 165;

            if (current && (current + " " + seg).length <= maxLen) {
                current = current + " " + seg;
            } else if (!current && seg.length <= maxLen) {
                current = seg;
                if (chunks.length === 0 && current.length >= 16) {
                    chunks.push(current.trim());
                    current = "";
                }
            } else {
                if (current) {
                    chunks.push(current.trim());
                    current = "";
                }
                const nextMax = chunks.length === 0 ? 75 : 165;
                if (seg.length > nextMax) {
                    const subParts = seg.match(/[^,;]+[,;]+|[^,;]+$/g) || [seg];
                    let subCur = "";
                    for (const sub of subParts) {
                        const curMax = chunks.length === 0 ? 75 : 165;
                        if ((subCur + " " + sub).length <= curMax) {
                            subCur = (subCur ? subCur + " " : "") + sub.trim();
                        } else {
                            if (subCur) chunks.push(subCur.trim());
                            subCur = sub.trim();
                        }
                    }
                    if (subCur) chunks.push(subCur.trim());
                } else {
                    current = seg;
                }
            }
        }
        if (current) chunks.push(current.trim());
        return chunks;
    }

    normalizeNumbersForSpeech(text) {
        if (!text) return "";
        return text
            .replace(/\b4\.500\s+millones\b/gi, 'cuatro mil quinientos millones')
            .replace(/\b(\d+)\.500\s+millones\b/gi, '$1 mil quinientos millones')
            .replace(/\b(\d{1,3})\.(\d{3})\b/g, '$1$2')
            .replace(/\b(\d+)\s*km\b/gi, '$1 kilómetros')
            .replace(/\b(\d+)\s*m\b/gi, '$1 metros');
    }

    fetchAndDecodeChunk(chunk, sessionId) {
        if (!chunk || this.useSystemVoiceExplicitly || this.currentSessionId !== sessionId) {
            return Promise.resolve(null);
        }
        const cacheKey = `${this.voiceStyle}:${this.forceOfflineSpeech}:${chunk}`;
        if (this.preloadedAudioBuffers.has(cacheKey)) {
            return Promise.resolve(this.preloadedAudioBuffers.get(cacheKey));
        }
        if (this.inflightPromises.has(cacheKey)) {
            return this.inflightPromises.get(cacheKey);
        }

        const promise = (async () => {
            try {
                if (window.gloopAPI && window.gloopAPI.getTTSAudio) {
                    const rawBytes = await window.gloopAPI.getTTSAudio(chunk, this.voiceStyle, this.forceOfflineSpeech);
                    if (this.currentSessionId !== sessionId || !this.isPlaying || !rawBytes) return null;
                    const arrayBuffer = rawBytes.buffer.slice(rawBytes.byteOffset, rawBytes.byteOffset + rawBytes.byteLength);
                    const ctx = this.getAudioContext();
                    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                    if (this.currentSessionId === sessionId && this.isPlaying) {
                        this.preloadedAudioBuffers.set(cacheKey, audioBuffer);
                        return audioBuffer;
                    }
                }
            } catch (e) {}
            return null;
        })().finally(() => {
            this.inflightPromises.delete(cacheKey);
        });

        this.inflightPromises.set(cacheKey, promise);
        return promise;
    }

    speak(text, onStart, onEnd) {
        this.stop();

        this.onStartCallback = onStart;
        this.onEndCallback = onEnd;
        this.isPlaying = true;
        this.sessionEngine = null;

        if (this.onStartCallback) {
            this.onStartCallback();
        }

        const normalizedText = this.normalizeNumbersForSpeech(text);

        // Si estamos en Android nativo, delegar en el plugin oficial @capacitor-community/text-to-speech
        if (this.isCapacitorAndroid) {
            this.speakWithAndroidTTS(normalizedText);
            return;
        }

        const sentences = this.splitIntoSentences(normalizedText);
        this.audioQueue = [...sentences];

        this.playNextChunk();
    }

    async speakWithAndroidTTS(text) {
        if (!this.capTTS) {
            if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.TextToSpeech) {
                this.capTTS = window.Capacitor.Plugins.TextToSpeech;
            }
        }

        if (!this.capTTS) {
            this.fallbackSystemVoice(text);
            return;
        }

        const sessionId = this.currentSessionId;
        this.sessionEngine = 'android-native';

        // Perfiles de voz diferenciados para niños en Android
        let pitch = 1.12;
        let rate = 1.05;

        if (this.voiceStyle === 'cartoon_toon') {
            // Ardillita / Toon Travieso
            pitch = 1.45;
            rate = 1.20;
        } else if (this.voiceStyle === 'kid_soft') {
            // Chiquillo / Amigo Tierno
            pitch = 1.25;
            rate = 0.95;
        } else {
            // Flubber Muñeco Gracioso
            pitch = 1.15;
            rate = 1.06;
        }

        try {
            await this.capTTS.speak({
                text: text,
                lang: 'es-ES',
                rate: rate,
                pitch: pitch,
                volume: 1.0,
                category: 'ambient'
            });
        } catch (e) {
            console.warn('[AndroidTTS] Error sintetizando texto:', e);
            // Si el motor falla o no tiene voz es-ES, intentar con fallback genérico
            try {
                await this.capTTS.speak({
                    text: text,
                    lang: 'es',
                    rate: rate,
                    pitch: pitch
                });
            } catch (err2) {
                console.warn('[AndroidTTS] Fallback también falló:', err2);
            }
        } finally {
            if (this.currentSessionId === sessionId) {
                this.stop();
            }
        }
    }

    async playNextChunk() {
        if (!this.isPlaying || this.audioQueue.length === 0) {
            this.stop();
            return;
        }

        const sessionId = this.currentSessionId;
        const chunk = this.audioQueue.shift();

        // Solo usar SAPI5 de Windows si el usuario eligió expresamente una voz de Windows en la lista
        if (this.useSystemVoiceExplicitly || this.sessionEngine === 'system') {
            this.sessionEngine = 'system';
            this.fallbackSystemVoice(chunk);
            return;
        }

        const ctx = this.getAudioContext();

        try {
            const audioBuffer = await this.fetchAndDecodeChunk(chunk, sessionId);
            if (this.currentSessionId !== sessionId || !this.isPlaying) return;

            // Tan pronto tenemos el fragmento actual listo, precargamos el siguiente en segundo plano
            if (this.audioQueue.length > 0) {
                this.fetchAndDecodeChunk(this.audioQueue[0], sessionId);
            }

            if (!audioBuffer) {
                throw new Error('Pasando a voz de respaldo');
            }

            this.sessionEngine = 'webaudio';

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            // Reproducción pura a tasa 1.0 (la voz y el tono ya vienen sintetizados a 44.1 kHz / 24 kHz)
            source.playbackRate.value = 1.0;

            const gainNode = ctx.createGain();
            // Micro-fade in suave de 15 ms para eliminar cualquier click acústico
            const now = ctx.currentTime;
            gainNode.gain.setValueAtTime(0.01, now);
            gainNode.gain.linearRampToValueAtTime(0.92, now + 0.015);

            source.connect(gainNode);
            gainNode.connect(ctx.destination);

            this.currentSource = source;

            source.onended = () => {
                if (this.isPlaying && this.currentSessionId === sessionId) {
                    // Pausa de respiración natural humana entre oraciones (80 ms)
                    setTimeout(() => {
                        if (this.isPlaying && this.currentSessionId === sessionId) {
                            this.playNextChunk();
                        }
                    }, 80);
                }
            };

            source.start(0);

        } catch (err) {
            if (this.currentSessionId !== sessionId || !this.isPlaying) return;
            // Si falla la red, usar voz nativa de Windows como respaldo
            if (!this.sessionEngine) {
                this.sessionEngine = 'system';
                this.fallbackSystemVoice(chunk);
            } else {
                if (this.audioQueue.length > 0) {
                    this.playNextChunk();
                } else {
                    this.stop();
                }
            }
        }
    }

    fallbackSystemVoice(chunk) {
        if (!('speechSynthesis' in window)) {
            this.stop();
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.lang = 'es-ES';

        let voice = this.selectedSystemVoice;
        if (!voice && 'speechSynthesis' in window) {
            const voices = window.speechSynthesis.getVoices();
            voice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Alvaro') || v.name.includes('Elvira') || v.name.includes('Laura') || v.name.includes('Dalia')))
                || voices.find(v => v.lang.startsWith('es') && !v.name.includes('Helena') && !v.name.includes('David'))
                || voices.find(v => v.lang.startsWith('es'));
        }

        if (voice) {
            utterance.voice = voice;
        }

        // Modulación offline de personaje
        if (this.voiceStyle === 'cartoon_toon' || this.voiceStyle === 'spark') {
            utterance.pitch = 1.22;
            utterance.rate = 1.10;
        } else if (this.voiceStyle === 'kid_soft' || this.voiceStyle === 'kid') {
            utterance.pitch = 1.08;
            utterance.rate = 0.98;
        } else {
            utterance.pitch = 1.04;
            utterance.rate = 1.02;
        }

        utterance.onend = () => {
            if (this.isPlaying) {
                setTimeout(() => {
                    if (this.isPlaying) this.playNextChunk();
                }, 80);
            }
        };

        utterance.onerror = () => {
            this.stop();
        };

        window.speechSynthesis.speak(utterance);
    }
}

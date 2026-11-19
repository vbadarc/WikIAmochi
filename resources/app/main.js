'use strict';

const { app, BrowserWindow, ipcMain, nativeImage } = require('electron');
const debugPortArg = process.argv.find(a => a.startsWith('--remote-debugging-port='));
if (debugPortArg) {
    const port = debugPortArg.split('=')[1];
    app.commandLine.appendSwitch('remote-debugging-port', port);
}
const path = require('path');
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { createLibzimHost } = require('./lib/libzimNodeWorker.cjs');
let MsEdgeTTS = null;
let OUTPUT_FORMAT = null;
try {
    const edgeMod = require('msedge-tts');
    MsEdgeTTS = edgeMod.MsEdgeTTS;
    OUTPUT_FORMAT = edgeMod.OUTPUT_FORMAT;
} catch (e) {
    console.warn('msedge-tts no disponible:', e.message);
}

let mainWindow = null;
let zimHost = null;
let isZimReady = false;

// Localizar archivo ZIM de Vikidia en el directorio raíz o adyacente
function findZimFile() {
    const exeDir = path.dirname(app.getPath('exe'));
    const candidates = [
        path.resolve(exeDir, '..', 'vikidia_es_all_maxi_2026-09.zim'),
        path.resolve(exeDir, 'vikidia_es_all_maxi_2026-09.zim'),
        path.resolve(process.cwd(), 'vikidia_es_all_maxi_2026-09.zim'),
        path.resolve(__dirname, '..', '..', 'vikidia_es_all_maxi_2026-09.zim'),
        path.resolve(__dirname, '..', '..', '..', 'vikidia_es_all_maxi_2026-09.zim')
    ];

    for (const cand of candidates) {
        if (fs.existsSync(cand)) {
            console.log('Bóveda ZIM encontrada:', cand);
            return cand;
        }
    }

    const searchDirs = [
        exeDir,
        path.resolve(exeDir, '..'),
        process.cwd()
    ];

    for (const d of searchDirs) {
        if (fs.existsSync(d)) {
            const files = fs.readdirSync(d);
            const zim = files.find(f => f.toLowerCase().endsWith('.zim'));
            if (zim) return path.join(d, zim);
        }
    }
    return null;
}

// Inicializar el lector libzim en memoria mediante WebAssembly
async function initZim() {
    const zimPath = findZimFile();
    if (!zimPath) {
        console.warn('No se localizó el archivo ZIM en el disco.');
        return;
    }

    try {
        console.log('Inicializando motor WebAssembly para Vikidia...');
        zimHost = createLibzimHost({ isAllowedZimFile: () => true });
        await zimHost.call({
            action: 'init',
            files: [{ path: zimPath, name: path.basename(zimPath) }]
        });
        const count = await zimHost.call({ action: 'getArticleCount' });
        console.log(`Bóveda ZIM lista: ${count} artículos disponibles.`);
        isZimReady = true;
    } catch (err) {
        console.error('Error al inicializar ZIM:', err);
    }
}

// Configurar canales IPC internos en memoria
function setupIPC() {
    ipcMain.handle('zim:status', () => {
        return { ok: true, zimReady: isZimReady };
    });

    ipcMain.handle('zim:search', async (event, query) => {
        if (!query) return { error: 'Falta término de búsqueda' };
        if (!isZimReady || !zimHost) return { error: 'Bóveda ZIM aún no lista', found: false };

        try {
            console.log(`[IPC Consulta ZIM] "${query}"`);
            let rawResults = [];

            // 1º Intentar búsqueda por títulos directos con suggest (índice B-tree ultrapreciso)
            try {
                const sug = await zimHost.call({ action: 'suggest', text: query, numResults: 5 });
                if (sug && sug.suggestions && sug.suggestions.length > 0) {
                    const normQ = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
                    const topMatch = sug.suggestions.find(s => {
                        const sTitle = (s.title || s.path || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
                        return sTitle === normQ || sTitle.startsWith(normQ) || normQ.startsWith(sTitle);
                    }) || sug.suggestions[0];

                    if (topMatch) {
                        const topTarget = topMatch.title || topMatch.path;
                        const sRes = await zimHost.call({
                            action: 'searchWithSnippets',
                            text: topTarget,
                            numResults: 5
                        });
                        if (sRes && sRes.results && sRes.results.length > 0) {
                            rawResults = sRes.results;
                        }
                    }
                }
            } catch (sugErr) {}

            // 2º Si suggest no arrojó resultados, usar búsqueda de texto completo con snippets
            if (rawResults.length === 0) {
                const searchResult = await zimHost.call({
                    action: 'searchWithSnippets',
                    text: query,
                    numResults: 6
                });
                rawResults = (searchResult && searchResult.results) ? searchResult.results : [];
            }

            const results = [];

            for (const item of rawResults) {
                let imagePath = null;
                let bestSnippet = item.snippet;

                try {
                    const entry = await zimHost.call({ action: 'getEntryByPath', path: item.path });
                    if (entry && entry.content) {
                        const html = Buffer.from(entry.content).toString('utf8');

                        // 1. Extraer primer párrafo definitorio real del artículo
                        const pMatches = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/gi);
                        if (pMatches) {
                            for (const pTag of pMatches) {
                                const cleanP = pTag
                                    .replace(/<[^>]+>/g, '')
                                    .replace(/&[a-z0-9#]+;/gi, ' ')
                                    .replace(/\[\d+\]/g, '')
                                    .replace(/\s+/g, ' ')
                                    .trim();
                                if (cleanP.length >= 30 && !cleanP.startsWith('Coordenadas') && !cleanP.includes('Creative Commons')) {
                                    bestSnippet = cleanP;
                                    break;
                                }
                            }
                        }

                        // 2. Extraer ilustración principal
                        const imgMatches = html.match(/_assets_\/[^"' \t\r\n<>]+\.(?:jpg|png|webp|svg|jpeg)/gi);
                        if (imgMatches) {
                            for (const m of imgMatches) {
                                if (!m.includes('icon') && !m.includes('disambig') && !m.includes('OOjs')) {
                                    imagePath = m;
                                    break;
                                }
                            }
                        }
                    }
                } catch (e) {}

                results.push({
                    path: item.path,
                    title: item.title,
                    snippet: bestSnippet,
                    imagePath: imagePath
                });
            }

            return { query, found: results.length > 0, results };
        } catch (err) {
            console.error('Error en búsqueda IPC:', err);
            return { error: err.message, found: false };
        }
    });

    // Gestión de memoria persistente de conocimientos aprendidos
    const memoryFilePath = path.join(__dirname, 'learned_knowledge.json');

    ipcMain.handle('memory:get-all', () => {
        try {
            if (fs.existsSync(memoryFilePath)) {
                return JSON.parse(fs.readFileSync(memoryFilePath, 'utf8'));
            }
        } catch (e) {
            console.warn('Error al leer memoria local:', e);
        }
        return {};
    });

    ipcMain.handle('memory:save-concept', (event, concept) => {
        try {
            if (!concept || !concept.key) return false;
            let current = {};
            if (fs.existsSync(memoryFilePath)) {
                try { current = JSON.parse(fs.readFileSync(memoryFilePath, 'utf8')); } catch (e) {}
            }
            current[concept.key.toLowerCase()] = {
                title: concept.title,
                snippet: concept.snippet,
                imageUrl: concept.imageUrl || null,
                source: concept.source || 'online_learned',
                learnedAt: new Date().toISOString()
            };
            fs.writeFileSync(memoryFilePath, JSON.stringify(current, null, 2), 'utf8');
            return true;
        } catch (e) {
            console.warn('Error al guardar en memoria local:', e);
            return false;
        }
    });

    ipcMain.handle('zim:image', async (event, imagePath) => {
        if (!imagePath || !isZimReady || !zimHost) return null;
        try {
            let clean = imagePath.replace(/^\/?api\/image\?path=/, '').replace(/^\//, '');
            clean = decodeURIComponent(clean);
            const entry = await zimHost.call({ action: 'getEntryByPath', path: clean });
            if (entry && entry.content) {
                const mime = entry.mimetype || 'image/webp';
                const b64 = Buffer.from(entry.content).toString('base64');
                return `data:${mime};base64,${b64}`;
            }
        } catch (e) {
            console.warn('Error al extraer imagen por IPC:', e);
        }
        return null;
    });

    // Carpeta de caché en disco para audios neuronales 100% Offline
    const voiceCacheDir = path.join(__dirname, 'voice_cache');
    if (!fs.existsSync(voiceCacheDir)) {
        try { fs.mkdirSync(voiceCacheDir, { recursive: true }); } catch (e) {}
    }

    // Motor local Piper TTS con 2 modelos de estudio (Sharvard Multi-speaker y Claude High)
    const piperDir = path.join(__dirname, 'bin', 'piper');
    const piperExe = path.join(piperDir, 'piper.exe');
    const modelSharvard = path.join(piperDir, 'sharvard.onnx');
    const modelClaude = path.join(piperDir, 'claude.onnx');
    const piperEspeakData = path.join(piperDir, 'espeak-ng-data');
    const isPiperReady = fs.existsSync(piperExe) && fs.existsSync(modelSharvard) && fs.existsSync(modelClaude);

    /**
     * Procesador DSP Anti-Interferencias:
     * Filtra con Butterworth paso-bajo a 6200 Hz y remuestrea con interpolación cúbica Hermite
     * de 22050 Hz a 44100 Hz aplicando el factor de tono del personaje, eliminando al 100% el aliasing.
     */
    function cleanAndUpsampleWav(wavBuf, pitchFactor = 1.0, cutoffHz = 6200) {
        if (!wavBuf || wavBuf.length <= 44) return wavBuf;

        // Buscar offset del chunk 'data'
        let dataOffset = 44;
        for (let i = 12; i < Math.min(wavBuf.length - 8, 128); i++) {
            if (wavBuf[i] === 0x64 && wavBuf[i + 1] === 0x61 && wavBuf[i + 2] === 0x74 && wavBuf[i + 3] === 0x61) {
                dataOffset = i + 8;
                break;
            }
        }

        const inSampleRate = 22050;
        const outSampleRate = 44100;
        const numInSamples = Math.floor((wavBuf.length - dataOffset) / 2);
        if (numInSamples <= 4) return wavBuf;

        const inFloat = new Float32Array(numInSamples);
        for (let i = 0; i < numInSamples; i++) {
            inFloat[i] = wavBuf.readInt16LE(dataOffset + i * 2) / 32768.0;
        }

        // 1. Filtro Butterworth paso-bajo de 2º orden sobre la señal original
        const Q = 0.7071;
        const w0 = (2 * Math.PI * cutoffHz) / inSampleRate;
        const alpha = Math.sin(w0) / (2 * Q);
        const cosW0 = Math.cos(w0);
        const a0 = 1 + alpha;
        const b0 = ((1 - cosW0) / 2) / a0;
        const b1 = (1 - cosW0) / a0;
        const b2 = ((1 - cosW0) / 2) / a0;
        const a1 = (-2 * cosW0) / a0;
        const a2 = (1 - alpha) / a0;

        const filtered = new Float32Array(numInSamples);
        let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
        for (let i = 0; i < numInSamples; i++) {
            const x0 = inFloat[i];
            const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
            x2 = x1; x1 = x0;
            y2 = y1; y1 = y0;
            filtered[i] = y0;
        }

        // 2. Remuestreo a 44100 Hz con interpolación cúbica Hermite de 4 puntos + cambio de tono
        const step = (inSampleRate / outSampleRate) * pitchFactor;
        const numOutSamples = Math.max(1, Math.floor((numInSamples - 2) / step));
        const outBuf = Buffer.alloc(44 + numOutSamples * 2);

        // Cabecera WAV estándar 44100 Hz 16-bit Mono
        outBuf.write('RIFF', 0);
        outBuf.writeUInt32LE(36 + numOutSamples * 2, 4);
        outBuf.write('WAVE', 8);
        outBuf.write('fmt ', 12);
        outBuf.writeUInt32LE(16, 16);
        outBuf.writeUInt16LE(1, 20); // PCM
        outBuf.writeUInt16LE(1, 22); // 1 canal
        outBuf.writeUInt32LE(outSampleRate, 24);
        outBuf.writeUInt32LE(outSampleRate * 2, 28);
        outBuf.writeUInt16LE(2, 32);
        outBuf.writeUInt16LE(16, 34);
        outBuf.write('data', 36);
        outBuf.writeUInt32LE(numOutSamples * 2, 40);

        const fadeSamples = Math.min(400, Math.floor(numOutSamples / 10));

        for (let i = 0; i < numOutSamples; i++) {
            const pos = i * step;
            const idx = Math.floor(pos);
            const frac = pos - idx;

            const p0 = filtered[Math.max(0, idx - 1)];
            const p1 = filtered[idx];
            const p2 = filtered[Math.min(numInSamples - 1, idx + 1)];
            const p3 = filtered[Math.min(numInSamples - 1, idx + 2)];

            // Polinomio Hermite
            const c0 = p1;
            const c1 = 0.5 * (p2 - p0);
            const c2 = p0 - 2.5 * p1 + 2.0 * p2 - 0.5 * p3;
            const c3 = 0.5 * (p3 - p0) + 1.5 * (p1 - p2);
            let val = ((c3 * frac + c2) * frac + c1) * frac + c0;

            // Envolvente suave anti-click al inicio y final
            if (i < fadeSamples) val *= (i / fadeSamples);
            else if (i > numOutSamples - fadeSamples) val *= ((numOutSamples - i) / fadeSamples);

            // Limitador suave anti-clipping al 88%
            const cleanVal = Math.tanh(val * 0.92) * 0.90;
            const intSample = Math.max(-32767, Math.min(32767, Math.round(cleanVal * 32767)));
            outBuf.writeInt16LE(intSample, 44 + i * 2);
        }

        return outBuf;
    }

    let tempIdCounter = 0;

    /**
     * Síntesis 100% Offline con Piper usando archivo binario .wav puro (evita la corrupción CRLF de stdout en Windows)
     */
    function synthesizeWithPiperOffline(text, style = 'cartoon_flubber') {
        if (!isPiperReady || !text || !text.trim()) return Promise.resolve(null);
        return new Promise((resolve) => {
            const tempWavPath = path.join(piperDir, `tts_tmp_${process.pid}_${Date.now()}_${++tempIdCounter}.wav`);
            try {
                const cleanText = text.replace(/[\r\n]+/g, ' ').trim();
                let modelPath = modelSharvard;
                let speakerId = '0';
                let lengthScale = '0.92';
                let pitchFactor = 1.06;
                let cutoffHz = 6000;

                if (style === 'cartoon_toon' || style === 'spark') {
                    // Ardillita / Toon: Hablante Femenina de estudio + elevación aguda de ardilla
                    modelPath = modelSharvard;
                    speakerId = '1';
                    lengthScale = '1.05';
                    pitchFactor = 1.28;
                    cutoffHz = 6800;
                } else if (style === 'kid_soft' || style === 'kid') {
                    // Chiquillo / Amigo Tierno: Modelo Claude High Definition + tono dulce infantil
                    modelPath = modelClaude;
                    speakerId = null;
                    lengthScale = '1.02';
                    pitchFactor = 1.12;
                    cutoffHz = 5800;
                } else {
                    // Flubber Gracioso: Hablante Masculino jovial y elástico
                    modelPath = modelSharvard;
                    speakerId = '0';
                    lengthScale = '0.95';
                    pitchFactor = 1.07;
                    cutoffHz = 6000;
                }

                const args = [
                    '--model', modelPath,
                    '--espeak_data', piperEspeakData,
                    '--length_scale', lengthScale,
                    '--noise_scale', '0.333',
                    '--output_file', tempWavPath
                ];
                if (speakerId !== null) {
                    args.push('--speaker', speakerId);
                }

                const piperProc = spawn(piperExe, args, { cwd: piperDir, windowsHide: true });

                piperProc.on('close', (code) => {
                    try {
                        if (code === 0 && fs.existsSync(tempWavPath)) {
                            const rawWav = fs.readFileSync(tempWavPath);
                            try { fs.unlinkSync(tempWavPath); } catch (e) {}
                            if (rawWav && rawWav.length > 500) {
                                const cleanWav = cleanAndUpsampleWav(rawWav, pitchFactor, cutoffHz);
                                return resolve(cleanWav);
                            }
                        } else if (fs.existsSync(tempWavPath)) {
                            try { fs.unlinkSync(tempWavPath); } catch (e) {}
                        }
                    } catch (e) {}
                    resolve(null);
                });
                piperProc.on('error', () => {
                    try { if (fs.existsSync(tempWavPath)) fs.unlinkSync(tempWavPath); } catch (e) {}
                    resolve(null);
                });

                piperProc.stdin.write(cleanText);
                piperProc.stdin.end();
            } catch (e) {
                try { if (fs.existsSync(tempWavPath)) fs.unlinkSync(tempWavPath); } catch (err) {}
                resolve(null);
            }
        });
    }

    let isEdgeOffline = false;
    const edgeClientPool = new Map();

    async function getWarmEdgeClient(voiceName) {
        if (edgeClientPool.has(voiceName)) {
            return edgeClientPool.get(voiceName);
        }
        const client = new MsEdgeTTS({ connectionTimeoutMs: 2500 });
        await client.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        edgeClientPool.set(voiceName, client);
        return client;
    }

    // Pre-calentar conexiones WebSocket en segundo plano al iniciar la app
    if (MsEdgeTTS) {
        setTimeout(() => {
            getWarmEdgeClient('es-ES-AlvaroNeural').catch(() => {});
            getWarmEdgeClient('es-ES-ElviraNeural').catch(() => {});
            getWarmEdgeClient('es-MX-DaliaNeural').catch(() => {});
        }, 400);
    }

    /**
     * Síntesis Neuronal Hiperrealista con Microsoft Edge Neural TTS (3 actores distintos con WebSocket persistente)
     */
    function synthesizeWithEdgeNeural(text, style = 'cartoon_flubber') {
        if (!MsEdgeTTS || isEdgeOffline || !text || !text.trim()) return Promise.resolve(null);
        return new Promise(async (resolve) => {
            let voiceName = 'es-ES-AlvaroNeural';
            let rate = '+12%';
            let pitch = '+18Hz';

            if (style === 'cartoon_toon' || style === 'spark') {
                voiceName = 'es-ES-ElviraNeural';
                rate = '+24%';
                pitch = '+58Hz';
            } else if (style === 'kid_soft' || style === 'kid') {
                voiceName = 'es-MX-DaliaNeural';
                rate = '+4%';
                pitch = '+28Hz';
            }

            let settled = false;
            const finish = (val, failedNetwork = false) => {
                if (settled) return;
                settled = true;
                if (failedNetwork) {
                    const badClient = edgeClientPool.get(voiceName);
                    if (badClient) {
                        try { badClient.close(); } catch (e) {}
                        edgeClientPool.delete(voiceName);
                    }
                    isEdgeOffline = true;
                    setTimeout(() => { isEdgeOffline = false; }, 12000);
                }
                resolve(val);
            };

            const timer = setTimeout(() => finish(null, true), 2200);

            try {
                const tts = await getWarmEdgeClient(voiceName);
                const { audioStream } = tts.toStream(text.trim(), { rate, pitch });
                const chunks = [];
                audioStream.on('data', c => chunks.push(c));
                audioStream.on('end', () => {
                    clearTimeout(timer);
                    const buf = Buffer.concat(chunks);
                    finish(buf.length > 400 ? buf : null, false);
                });
                audioStream.on('error', () => {
                    clearTimeout(timer);
                    finish(null, true);
                });
            } catch (e) {
                clearTimeout(timer);
                finish(null, true);
            }
        });
    }

    // Caché en memoria, disco y deduplicación de peticiones en curso
    const ttsAudioCache = new Map();
    const inflightTtsRequests = new Map();

    ipcMain.handle('voice:tts', async (event, text, style = 'cartoon_flubber') => {
        if (!text || !text.trim()) return null;
        const clean = text.trim();
        const normalizedStyle = (style === 'cartoon_toon' || style === 'spark')
            ? 'cartoon_toon'
            : (style === 'kid_soft' || style === 'kid')
                ? 'kid_soft'
                : 'cartoon_flubber';

        const cacheKey = `${normalizedStyle}:${clean.toLowerCase()}`;
        if (ttsAudioCache.has(cacheKey)) {
            return ttsAudioCache.get(cacheKey);
        }
        if (inflightTtsRequests.has(cacheKey)) {
            return inflightTtsRequests.get(cacheKey);
        }

        const taskPromise = (async () => {
            const hash = crypto.createHash('sha1').update(cacheKey).digest('hex');
            const diskMp3Path = path.join(voiceCacheDir, `${normalizedStyle}_${hash}.mp3`);

            // 1. Si ya está en la caché persistente en disco, devolver al instante (0ms, funciona 100% Offline)
            if (fs.existsSync(diskMp3Path)) {
                try {
                    const diskBuf = fs.readFileSync(diskMp3Path);
                    if (diskBuf && diskBuf.length > 400) {
                        ttsAudioCache.set(cacheKey, diskBuf);
                        return diskBuf;
                    }
                } catch (e) {}
            }

            // 2. Intentar síntesis neuronal de estudio (AlvaroNeural / ElviraNeural / DaliaNeural) y guardar en caché offline
            const edgeBuf = await synthesizeWithEdgeNeural(clean, normalizedStyle);
            if (edgeBuf && edgeBuf.length > 400) {
                ttsAudioCache.set(cacheKey, edgeBuf);
                try { fs.writeFileSync(diskMp3Path, edgeBuf); } catch (e) {}
                return edgeBuf;
            }

            // 3. Modo 100% Sin Internet: Motor local Piper con archivo binario .wav puro a 44.1 kHz (0% corrupción de bytes)
            if (isPiperReady) {
                const localWav = await synthesizeWithPiperOffline(clean, normalizedStyle);
                if (localWav && localWav.length > 500) {
                    ttsAudioCache.set(cacheKey, localWav);
                    return localWav;
                }
            }

            return null;
        })().finally(() => {
            inflightTtsRequests.delete(cacheKey);
        });

        inflightTtsRequests.set(cacheKey, taskPromise);
        return taskPromise;
    });
}

function createWindow() {
    const iconPath = path.join(__dirname, 'icon.svg');
    let appIcon = null;
    try {
        if (fs.existsSync(iconPath)) {
            appIcon = nativeImage.createFromPath(iconPath);
            const pngPath = path.join(__dirname, 'icon.png');
            if (!fs.existsSync(pngPath)) {
                fs.writeFileSync(pngPath, appIcon.toPNG());
            }
        }
    } catch (e) {
        console.warn('Carga de icono:', e);
    }

    mainWindow = new BrowserWindow({
        width: 520,
        height: 860,
        minWidth: 420,
        minHeight: 700,
        title: 'WikIAmochi - Enciclopedia Tamagotchi para Niños',
        icon: appIcon || (fs.existsSync(path.join(__dirname, 'icon.png')) ? path.join(__dirname, 'icon.png') : undefined),
        autoHideMenuBar: true,
        backgroundColor: '#0a0e1a',
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    setupIPC();
    createWindow();
    initZim();
});

app.on('window-all-closed', () => {
    if (zimHost) {
        try { zimHost.terminate(); } catch (e) {}
    }
    app.quit();
});

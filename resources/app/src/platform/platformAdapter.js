/**
 * platformAdapter.js - Capa de abstracción de plataforma (Electron Desktop vs. Android Capacitor)
 * Si window.gloopAPI ya fue inyectado por preload.js (Electron), lo respeta intacto.
 * Si corre en Android/Capacitor, inicializa el Web Worker de libzim-wasm con lectura por rangos (Candidata A2).
 */

export class AndroidZimBridge {
    constructor() {
        this.worker = null;
        this.isReady = false;
        this.initPromise = null;
        this.zimInitTimeMs = 0;
    }

    callWorker(message) {
        return new Promise((resolve, reject) => {
            if (!this.worker) return reject(new Error('ZIM Web Worker no iniciado'));
            const channel = new MessageChannel();
            channel.port1.onmessage = (e) => {
                channel.port1.close();
                if (e.data && e.data.uncaughtError) {
                    reject(new Error(e.data.uncaughtError));
                } else {
                    resolve(e.data);
                }
            };
            this.worker.postMessage(message, [channel.port2]);
        });
    }

    async init() {
        if (this.isReady) return true;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            const t0 = performance.now();
            try {
                const metaRes = await fetch('https://localhost/__zim_meta__');
                if (!metaRes.ok) throw new Error('Archivo ZIM no encontrado en assets nativos');
                const meta = await metaRes.json();

                this.worker = new Worker('./lib/www/js/zimWorkerBootstrap.js');
                await this.callWorker({
                    action: 'init',
                    files: [{
                        name: meta.name || 'vikidia_es_all_maxi_2026-09.zim',
                        size: meta.size,
                        readMode: 'android-range'
                    }]
                });

                this.zimInitTimeMs = Math.round(performance.now() - t0);
                this.isReady = true;
                console.log(`[AndroidZimBridge] ZIM inicializado en ${this.zimInitTimeMs} ms (${meta.size} bytes, modo=${meta.mode})`);
                return true;
            } catch (err) {
                console.error('[AndroidZimBridge] Error inicializando ZIM:', err);
                this.isReady = false;
                return false;
            }
        })();

        return this.initPromise;
    }

    async searchVikidia(query) {
        const ok = await this.init();
        if (!ok) return { error: 'La bóveda enciclopédica aún se está preparando.', found: false };

        try {
            let rawResults = [];

            // 1º Intentar búsqueda por títulos directos con suggest (índice B-tree ultrapreciso)
            try {
                const sug = await this.callWorker({ action: 'suggest', text: query, numResults: 5 });
                if (sug && sug.suggestions && sug.suggestions.length > 0) {
                    const normQ = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
                    const topMatch = sug.suggestions.find(s => {
                        const sTitle = (s.title || s.path || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
                        return sTitle === normQ || sTitle.startsWith(normQ) || normQ.startsWith(sTitle);
                    }) || sug.suggestions[0];

                    if (topMatch) {
                        const topTarget = topMatch.title || topMatch.path;
                        const sRes = await this.callWorker({
                            action: 'searchWithSnippets',
                            text: topTarget,
                            numResults: 5
                        });
                        if (sRes && sRes.results && sRes.results.length > 0) {
                            rawResults = sRes.results;
                        }
                    }
                }
            } catch (e) {}

            // 2º Si suggest no arrojó resultados, usar búsqueda de texto completo con snippets
            if (rawResults.length === 0) {
                const searchResult = await this.callWorker({
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
                    const entry = await this.callWorker({ action: 'getEntryByPath', path: item.path, follow: true });
                    if (entry && entry.content && entry.content.byteLength > 0) {
                        const html = new TextDecoder('utf-8').decode(entry.content);

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

                        const imgMatches = html.match(/_assets_\/[^"' \t\r\n<>]+\.(?:jpg|png|webp|svg|jpeg)/gi);
                        if (imgMatches) {
                            const isFlagQuery = query.toLowerCase().includes('bandera') || item.title.toLowerCase().includes('bandera');
                            if (isFlagQuery) {
                                for (const m of imgMatches) {
                                    const dec = decodeURIComponent(m).toLowerCase();
                                    if (dec.includes('flag') || dec.includes('bandera')) {
                                        imagePath = m;
                                        break;
                                    }
                                }
                            }
                            if (!imagePath) {
                                for (const m of imgMatches) {
                                    const dec = decodeURIComponent(m).toLowerCase();
                                    if (!dec.includes('icon') && !dec.includes('disambig') && !dec.includes('oojs') && !dec.includes('destacado') && !dec.includes('esbozo') && !dec.includes('question_book') && !dec.includes('searchtool')) {
                                        imagePath = m;
                                        break;
                                    }
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

            return { query, found: results.length > 0, results, initTimeMs: this.zimInitTimeMs };
        } catch (err) {
            return { error: err.message, found: false };
        }
    }

    async getImageData(imagePath) {
        if (!imagePath) return null;
        const ok = await this.init();
        if (!ok) return null;

        try {
            let clean = imagePath.replace(/^\/?api\/image\?path=/, '').replace(/^\//, '');
            clean = decodeURIComponent(clean);
            const entry = await this.callWorker({ action: 'getEntryByPath', path: clean, follow: true });
            if (entry && entry.content && entry.content.byteLength > 0) {
                const mime = entry.mimetype || 'image/webp';
                const bytes = new Uint8Array(entry.content);
                let binary = '';
                const chunkSize = 8192;
                for (let i = 0; i < bytes.byteLength; i += chunkSize) {
                    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
                }
                return `data:${mime};base64,${btoa(binary)}`;
            }
        } catch (e) {
            console.warn('[AndroidZimBridge] Error extrayendo imagen:', e);
        }
        return null;
    }
}

export function ensurePlatformBridge() {
    // Si estamos en Electron (preload.js ya definió window.gloopAPI), no tocar nada
    if (typeof window !== 'undefined' && window.gloopAPI) {
        return window.gloopAPI;
    }

    const zimBridge = new AndroidZimBridge();
    // Iniciar pre-calentamiento del ZIM al arrancar
    zimBridge.init();

    const api = {
        isAndroidCapacitor: true,
        searchVikidia: (query) => zimBridge.searchVikidia(query),
        getImageData: (imagePath) => zimBridge.getImageData(imagePath),
        getTTSAudio: async () => null,
        getStatus: async () => ({
            ready: zimBridge.isReady,
            initTimeMs: zimBridge.zimInitTimeMs,
            engine: 'WikIAmochi Android libzim-wasm (Range A2)'
        }),
        getLearnedMemory: async () => {
            try {
                const raw = localStorage.getItem('gloop_learned_knowledge');
                return raw ? JSON.parse(raw) : {};
            } catch (e) {
                return {};
            }
        },
        saveLearnedConcept: async (concept) => {
            try {
                if (!concept || !concept.key) return false;
                const raw = localStorage.getItem('gloop_learned_knowledge') || '{}';
                const current = JSON.parse(raw);
                current[concept.key.toLowerCase()] = concept;
                localStorage.setItem('gloop_learned_knowledge', JSON.stringify(current));
                return true;
            } catch (e) {
                return false;
            }
        }
    };

    if (typeof window !== 'undefined') {
        window.gloopAPI = api;
    }
    return api;
}

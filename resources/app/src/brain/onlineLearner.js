/**
 * onlineLearner.js - Módulo de aprendizaje por internet seguro para niños
 * Consulta fuentes verificadas (API infantil de Vikidia y Wikipedia escolar),
 * pasa el contenido por el cortafuegos infantil y lo memoriza localmente.
 */

export class OnlineLearner {
    constructor(personalityInstance = null) {
        this.cache = new Map();
        this.personality = personalityInstance;
        this.vikidiaApiUrl = 'https://es.vikidia.org/w/api.php';
        this.wikipediaApiUrl = 'https://es.wikipedia.org/api/rest_v1/page/summary/';
        this.initLocalMemory();
    }

    setPersonality(personality) {
        this.personality = personality;
    }

    /**
     * Carga la memoria persistente guardada en sesiones previas
     */
    async initLocalMemory() {
        try {
            if (typeof window !== 'undefined' && window.gloopAPI && window.gloopAPI.getLearnedMemory) {
                const stored = await window.gloopAPI.getLearnedMemory();
                if (stored && typeof stored === 'object') {
                    for (const [k, v] of Object.entries(stored)) {
                        this.cache.set(k.toLowerCase(), v);
                    }
                }
            } else if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem('gloop_learned_knowledge');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    for (const [k, v] of Object.entries(parsed)) {
                        this.cache.set(k.toLowerCase(), v);
                    }
                }
            }
        } catch (e) {
            console.warn('Aviso al sincronizar memoria local previa:', e);
        }
    }

    /**
     * Revisa si el concepto ya fue memorizado previamente en el disco local
     */
    getCached(query) {
        if (!query) return null;
        const key = query.trim().toLowerCase();
        return this.cache.get(key) || null;
    }

    /**
     * Busca y aprende un nuevo concepto en internet aplicando el cortafuegos infantil
     */
    async learnConcept(query) {
        if (!query || !query.trim()) return null;
        const cleanQuery = query.trim();
        const key = cleanQuery.toLowerCase();

        // 1. Revisar si ya lo aprendió y memorizó antes
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        // 2. Si no hay conexión física a internet comprobada, retornar null en silencio
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return null;
        }

        try {
            // Modo Online restringido exclusivamente a la enciclopedia infantil oficial Vikidia
            let result = await this.fetchFromVikidia(cleanQuery);

            if (!result || !result.snippet) return null;

            // 3. Cortafuegos infantil estricto: comprobar que el contenido sea 100% apto
            if (this.personality && !this.personality.isSnippetSafe(result.snippet)) {
                console.warn('Contenido descartado por el cortafuegos infantil:', result.title);
                return null;
            }

            // 4. Memorización persistente: guardar en memoria local permanente
            const memoryItem = {
                key: key,
                title: result.title,
                snippet: result.snippet,
                imageUrl: result.imageUrl || null,
                source: result.source,
                learnedAt: new Date().toISOString()
            };

            this.cache.set(key, memoryItem);

            // Guardar en archivo del sistema vía IPC de Electron
            if (typeof window !== 'undefined' && window.gloopAPI && window.gloopAPI.saveLearnedConcept) {
                window.gloopAPI.saveLearnedConcept(memoryItem);
            }

            // Respaldo en localStorage
            if (typeof localStorage !== 'undefined') {
                try {
                    const raw = localStorage.getItem('gloop_learned_knowledge') || '{}';
                    const data = JSON.parse(raw);
                    data[key] = memoryItem;
                    localStorage.setItem('gloop_learned_knowledge', JSON.stringify(data));
                } catch (e) {}
            }

            return memoryItem;
        } catch (error) {
            // Si la conexión falla o se corta, fallback transparente sin romper la app
            return null;
        }
    }

    /**
     * Consulta a la API infantil oficial de Vikidia en español
     */
    async fetchFromVikidia(cleanQuery) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const encoded = encodeURIComponent(cleanQuery);
            let url = `${this.vikidiaApiUrl}?action=query&format=json&prop=extracts|pageimages&exintro=1&explaintext=1&pithumbsize=400&titles=${encoded}&origin=*`;
            
            let response = await fetch(url, { signal: controller.signal });
            if (!response.ok) {
                clearTimeout(timeoutId);
                return null;
            }

            let data = await response.json();
            let pages = data.query?.pages;
            let firstKey = pages ? Object.keys(pages)[0] : null;

            // Si no existe con el título exacto, buscar el artículo más relevante en Vikidia
            if (!pages || firstKey === '-1') {
                const searchUrl = `${this.vikidiaApiUrl}?action=query&list=search&srsearch=${encoded}&format=json&origin=*&srlimit=1`;
                const searchRes = await fetch(searchUrl, { signal: controller.signal });
                if (searchRes.ok) {
                    const searchData = await searchRes.json();
                    const topResult = searchData.query?.search?.[0];
                    if (topResult && topResult.title) {
                        const topEncoded = encodeURIComponent(topResult.title);
                        url = `${this.vikidiaApiUrl}?action=query&format=json&prop=extracts|pageimages&exintro=1&explaintext=1&pithumbsize=400&titles=${topEncoded}&origin=*`;
                        response = await fetch(url, { signal: controller.signal });
                        if (response.ok) {
                            data = await response.json();
                            pages = data.query?.pages;
                            firstKey = pages ? Object.keys(pages)[0] : null;
                        }
                    }
                }
            }

            clearTimeout(timeoutId);
            if (!pages || firstKey === '-1') return null;

            const page = pages[firstKey];
            if (!page || !page.extract || page.extract.length < 25) return null;

            return {
                title: page.title,
                snippet: page.extract,
                imageUrl: page.thumbnail?.source || null,
                source: 'vikidia_online',
                learnedAt: new Date().toISOString()
            };
        } catch (e) {
            return null;
        }
    }

    /**
     * Consulta a la API de extractos escolares de Wikipedia
     */
    async fetchFromWikipedia(cleanQuery) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const encoded = encodeURIComponent(cleanQuery);
            let url = `${this.wikipediaApiUrl}${encoded}`;
            
            let response = await fetch(url, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });

            // Si no existe con el título exacto, buscar con la API de búsqueda de Wikipedia
            if (!response.ok || response.status === 404) {
                const searchUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&format=json&origin=*&srlimit=1`;
                const searchRes = await fetch(searchUrl, { signal: controller.signal });
                if (searchRes.ok) {
                    const searchData = await searchRes.json();
                    const topResult = searchData.query?.search?.[0];
                    if (topResult && topResult.title) {
                        const topEncoded = encodeURIComponent(topResult.title);
                        url = `${this.wikipediaApiUrl}${topEncoded}`;
                        response = await fetch(url, {
                            signal: controller.signal,
                            headers: { 'Accept': 'application/json' }
                        });
                    }
                }
            }

            clearTimeout(timeoutId);

            if (!response.ok) return null;

            const data = await response.json();
            if (!data.extract || data.extract.length < 25) return null;

            // Descartar si el tipo de página no es un artículo estándar
            if (data.type === 'disambiguation') return null;

            return {
                title: data.title,
                snippet: data.extract,
                imageUrl: data.thumbnail?.source || null,
                source: 'wikipedia_online',
                learnedAt: new Date().toISOString()
            };
        } catch (e) {
            return null;
        }
    }
}

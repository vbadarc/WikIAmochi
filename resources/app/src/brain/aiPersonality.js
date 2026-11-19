/**
 * aiPersonality.js - Motor de síntesis pedagógica y personalidad de "Gloop"
 * Adapta el conocimiento enciclopédico al vocabulario y calidez de un amigo para niños.
 */

import { findCuratedAnswer } from './kidKnowledgeBase.js';

export class GloopPersonality {
    constructor() {
        this.name = "Gloop";
        this.blockedTopics = [
            'violencia', 'armas', 'pistola', 'rifle', 'bomba', 'asesino', 'asesinato',
            'drogas', 'cocaina', 'heroina', 'marihuana', 'muerte violenta', 'terrorismo',
            'contenido adulto', 'sexo', 'sexual', 'pornografia', 'erotico', 'desnudo',
            'apuestas', 'casino', 'odio', 'matar', 'suicidio', 'sangre',
            'tortura', 'secuestro', 'veneno mortal', 'narco', 'pelear', 'golpear', 'guerra'
        ];
        this.distressTopics = [
            'hacerme daño', 'hacerse daño', 'quiero morir', 'quiero morirme', 'no quiero vivir',
            'me quiero matar', 'estoy muy triste', 'nadie me quiere', 'me siento solo',
            'me pegan', 'me hacen daño', 'tengo mucho miedo'
        ];
    }

    /**
     * Valida que la pregunta del niño sea 100% segura
     */
    _normalize(str) {
        if (!str) return '';
        return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    isContentSafe(query) {
        if (!query) return true;
        const norm = this._normalize(query);
        for (const blocked of this.blockedTopics) {
            if (norm.includes(this._normalize(blocked))) return false;
        }
        for (const distress of this.distressTopics) {
            if (norm.includes(this._normalize(distress))) return false;
        }
        return true;
    }

    /**
     * Comprueba si la consulta refleja malestar o necesidad de ayuda
     */
    isDistressQuery(query) {
        if (!query) return false;
        const norm = this._normalize(query);
        for (const distress of this.distressTopics) {
            if (norm.includes(this._normalize(distress))) return true;
        }
        return false;
    }

    /**
     * Valida que el contenido recuperado de internet o enciclopedia no contenga elementos sensibles
     */
    isSnippetSafe(text) {
        if (!text) return false;
        const lower = text.toLowerCase();
        for (const blocked of this.blockedTopics) {
            if (lower.includes(blocked)) return false;
        }
        return true;
    }

    /**
     * Limpieza profunda de etiquetas HTML, caracteres especiales y notas de enciclopedia
     */
    cleanText(rawText) {
        if (!rawText) return "";
        return rawText
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')                  // Elimina todas las etiquetas HTML (como <b>la</b>)
            .replace(/&nbsp;/gi, ' ')
            .replace(/&[a-z0-9#]+;/gi, ' ')
            .replace(/\[\d+\]/g, '')                  // Elimina citas de Wikipedia como [1]
            .replace(/\(\d{1,3}(?:\.\d{3})*\s*km\/s\)/gi, '') // Quita fórmulas densas entre paréntesis
            .replace(/Referencias.*/gi, '')
            .replace(/Enlaces externos.*/gi, '')
            .replace(/Véase también.*/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Transforma una pregunta y extracto enciclopédico en una respuesta cálida y divertida
     */
    craftResponse(query, topic, rawSnippet, imageUrl = null) {
        // 1. Verificar si hay una respuesta curada para dudas infantiles frecuentes
        const curated = findCuratedAnswer(query);
        if (curated) {
            return {
                topic: curated.title,
                mood: curated.mood,
                speechText: curated.answer,
                imagePath: curated.imagePath || curated.imageUrl,
                imageUrl: curated.imagePath || curated.imageUrl,
                imageCaption: curated.imageCaption,
                expression: 'happy',
                source: 'curated'
            };
        }

        const cleaned = this.cleanText(rawSnippet);

        if (!cleaned || cleaned.length < 15) {
            return {
                topic: topic || query,
                mood: 'thinking',
                speechText: `¡Gloop! He buscado en mi memoria pero no encuentro datos claros sobre "${query}". ¿Quieres que investiguemos sobre dinosaurios o el espacio?`,
                imageUrl: null,
                expression: 'curious',
                source: 'fallback'
            };
        }

        // 2. Extraer una o dos oraciones completas y comprensibles
        const sentences = cleaned
            .split(/(?<=[.?!])\s+/)
            .filter(s => s.length > 20 && !s.toLowerCase().includes('licencia creative commons'));

        let coreThought = "";
        if (sentences.length > 0) {
            coreThought = sentences.slice(0, 2).join(' ');
        } else {
            coreThought = cleaned.slice(0, 220) + '...';
        }

        if (coreThought.length > 260) {
            coreThought = coreThought.slice(0, 250).replace(/\s+\S*$/, '') + '.';
        }

        const friendlyWarmups = [
            `¡Qué curiosidad tan linda! Mira lo que sé sobre esto.`,
            `¡Gloop! Me encanta que me preguntes eso. Escucha con atención.`,
            `¡Es una gran pregunta de explorador! Te cuento.`,
            `¡Uf, qué dato tan genial para aprender juntos!`
        ];
        const warmup = friendlyWarmups[Math.floor(Math.random() * friendlyWarmups.length)];

        return {
            topic: topic || query,
            mood: 'happy',
            speechText: `${warmup} ${coreThought}`,
            imageUrl: imageUrl,
            expression: 'happy',
            source: 'vikidia'
        };
    }

    getSafeFallbackResponse(query = '') {
        if (this.isDistressQuery(query)) {
            return {
                mood: 'comforting',
                speechText: '¡Gloop! Eres muy valioso y especial. Cuando nos sentimos tristes, asustados o con ganas de hacernos daño, lo más importante es hablar con papá, mamá o un adulto de confianza que te quiere. ¡No estás solo y ellos te van a escuchar y cuidar con mucho amor!',
                expression: 'tender',
                isBlocked: true,
                isDistress: true
            };
        }
        return {
            mood: 'thinking',
            speechText: '¡Gloop! Ese tema puede ser un poco confuso o complicado para nosotros. ¿Por qué no exploramos algo asombroso como el mar o los inventos geniales?',
            expression: 'curious',
            isBlocked: true
        };
    }
}

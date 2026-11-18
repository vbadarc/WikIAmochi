/**
 * zimWorkerBootstrap.js - Bootstrap de Web Worker para libzim-wasm en Android WebView (Candidata A2)
 * Intercepta FileReaderSync.prototype.readAsArrayBuffer sobre descriptores por rangos (RangeSlice)
 * para servir lecturas POSIX síncronas de libzim-wasm desde el AssetFileDescriptor nativo sin
 * cargar los 127,36 MB del archivo ZIM en memoria RAM ni duplicarlo en el almacenamiento interno.
 */

'use strict';

const PAGE_SIZE = 131072; // Páginas de 128 KB para localidad espacial en índices Xapian/B-tree de libzim
const MAX_CACHED_PAGES = 32; // Máximo 4 MB en caché LRU dentro del Worker
const pageCache = new Map();

function fetchPageSync(pageIndex, totalFileSize) {
    if (pageCache.has(pageIndex)) {
        const data = pageCache.get(pageIndex);
        pageCache.delete(pageIndex);
        pageCache.set(pageIndex, data);
        return data;
    }

    const offset = pageIndex * PAGE_SIZE;
    const length = Math.min(PAGE_SIZE, totalFileSize - offset);
    if (length <= 0) return new Uint8Array(0);

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://localhost/__zim_slice__?offset=${offset}&length=${length}`, false);
    xhr.responseType = 'arraybuffer';
    xhr.send(null);

    if (xhr.status !== 200 && xhr.status !== 206) {
        throw new Error(`Error leyendo rango ZIM: HTTP ${xhr.status}`);
    }

    const pageBytes = new Uint8Array(xhr.response);
    if (pageCache.size >= MAX_CACHED_PAGES) {
        const oldestKey = pageCache.keys().next().value;
        pageCache.delete(oldestKey);
    }
    pageCache.set(pageIndex, pageBytes);
    return pageBytes;
}

function readRangeSync(start, end, totalFileSize) {
    const clampedEnd = Math.min(end, totalFileSize);
    const totalLen = Math.max(0, clampedEnd - start);
    if (totalLen === 0) return new ArrayBuffer(0);

    const out = new Uint8Array(totalLen);
    let written = 0;

    while (written < totalLen) {
        const curPos = start + written;
        const pageIndex = Math.floor(curPos / PAGE_SIZE);
        const pageOffset = curPos % PAGE_SIZE;
        const pageBytes = fetchPageSync(pageIndex, totalFileSize);
        const available = pageBytes.byteLength - pageOffset;
        if (available <= 0) break;

        const toCopy = Math.min(totalLen - written, available);
        out.set(pageBytes.subarray(pageOffset, pageOffset + toCopy), written);
        written += toCopy;
    }

    return out.buffer;
}

// Parchear FileReaderSync dentro del Worker para soportar objetos RangeSlice virtuales
if (typeof FileReaderSync !== 'undefined') {
    const origReadAsArrayBuffer = FileReaderSync.prototype.readAsArrayBuffer;
    FileReaderSync.prototype.readAsArrayBuffer = function (blobOrSlice) {
        if (blobOrSlice && blobOrSlice.__isZimRangeSlice) {
            return readRangeSync(blobOrSlice.start, blobOrSlice.end, blobOrSlice.totalSize);
        }
        return origReadAsArrayBuffer.call(this, blobOrSlice);
    };
}

// Interceptar el mensaje 'init' cuando se pasa { readMode: 'android-range', name, size }
const origAddEventListener = self.addEventListener.bind(self);
self.addEventListener = function (type, listener, options) {
    if (type === 'message') {
        const wrappedListener = function (e) {
            if (e && e.data && e.data.action === 'init' && Array.isArray(e.data.files)) {
                e.data.files = e.data.files.map(f => {
                    if (f && f.readMode === 'android-range') {
                        const fileSize = f.size;
                        return {
                            name: f.name,
                            size: fileSize,
                            lastModifiedDate: new Date(),
                            slice: function (start, end) {
                                const s = Math.max(0, start || 0);
                                const ePos = end === undefined ? fileSize : Math.min(fileSize, end);
                                return {
                                    __isZimRangeSlice: true,
                                    start: s,
                                    end: ePos,
                                    size: Math.max(0, ePos - s),
                                    totalSize: fileSize
                                };
                            }
                        };
                    }
                    return f;
                });
            }
            return listener.call(this, e);
        };
        return origAddEventListener(type, wrappedListener, options);
    }
    return origAddEventListener(type, listener, options);
};

// Cargar el motor oficial libzim-wasm.js de Kiwix desde el mismo directorio (lib/www/js/)
importScripts('./libzim-wasm.js');

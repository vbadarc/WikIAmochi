'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gloopAPI', {
    searchVikidia: (query) => ipcRenderer.invoke('zim:search', query),
    getImageData: (imagePath) => ipcRenderer.invoke('zim:image', imagePath),
    getTTSAudio: (text, style, isOffline) => ipcRenderer.invoke('voice:tts', text, style, isOffline),
    getStatus: () => ipcRenderer.invoke('zim:status'),
    getLearnedMemory: () => ipcRenderer.invoke('memory:get-all'),
    saveLearnedConcept: (concept) => ipcRenderer.invoke('memory:save-concept', concept)
});

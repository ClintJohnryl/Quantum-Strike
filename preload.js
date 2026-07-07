const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    platform: process.platform,
    isPackaged: true,
    
    // Send messages to main process
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    
    // Receive messages from main process
    on: (channel, callback) => {
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
    },
    
    // Invoke handlers (for async responses)
    invoke: (channel, ...args) => {
        return ipcRenderer.invoke(channel, ...args);
    }
});

console.log('🔒 Preload script loaded');
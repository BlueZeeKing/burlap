const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getKey: () => ipcRenderer.invoke('get-key'),
  saveKey: key => ipcRenderer.send('save-key', key),
})

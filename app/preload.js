const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getKey: () => ipcRenderer.invoke('get-key'),
  saveKey: key => ipcRenderer.send('save-key', key),
  getAvatar: () => ipcRenderer.invoke('get-avatar'),
  getUnread: () => ipcRenderer.invoke('get-unread'),
  getData: url => ipcRenderer.invoke('get-data', url),
})

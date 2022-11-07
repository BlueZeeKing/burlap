const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getData: state => ipcRenderer.send('req-data', state),
  onData: callback => ipcRenderer.on('res-data', callback),
})

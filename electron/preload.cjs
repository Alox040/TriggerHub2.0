const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('triggerHubElectron', {
  clipExporter: {
    exportClip: (buffer, request) => {
      return ipcRenderer.invoke('clip-exporter:export', buffer, request)
    },
  },
})

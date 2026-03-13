const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('triggerHubElectron', {
  clipExporter: {
    exportClip: (buffer, request) => {
      return ipcRenderer.invoke('clip-exporter:export', buffer, request)
    },
  },
  storage: {
    load: (key) => {
      return ipcRenderer.invoke('storage:load', key)
    },
    save: (key, data) => {
      return ipcRenderer.invoke('storage:save', key, data)
    },
  },
})

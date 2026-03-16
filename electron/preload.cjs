const { contextBridge, ipcRenderer } = require('electron')

console.info('[TriggerHub preload] preload start', {
  location: typeof location === 'undefined' ? 'unknown' : location.href,
})

function isValidWindowCommand(command) {
  if (!command || typeof command !== 'object') {
    return false
  }

  return ['focus', 'minimize', 'toggle-fullscreen'].includes(command.type)
}

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
  windowControl: {
    execute: (command) => {
      if (!isValidWindowCommand(command)) {
        return Promise.reject(new Error('Invalid window command'))
      }

      return ipcRenderer.invoke('window:command', command)
    },
  },
})

console.info('[TriggerHub preload] bridge exposed', {
  keys: ['clipExporter', 'storage', 'windowControl'],
})

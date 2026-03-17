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

function registerUpdaterStateListener(listener) {
  const wrappedListener = (_event, state) => {
    listener(state)
  }

  ipcRenderer.on('updater:state', wrappedListener)
  return () => {
    ipcRenderer.removeListener('updater:state', wrappedListener)
  }
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
  updater: {
    getState: () => {
      return ipcRenderer.invoke('updater:get-state')
    },
    checkForUpdates: () => {
      return ipcRenderer.invoke('updater:check')
    },
    downloadUpdate: () => {
      return ipcRenderer.invoke('updater:download')
    },
    installUpdate: () => {
      return ipcRenderer.invoke('updater:install')
    },
    onStateChange: (listener) => {
      if (typeof listener !== 'function') {
        throw new Error('Updater listener must be a function')
      }

      return registerUpdaterStateListener(listener)
    },
  },
})

console.info('[TriggerHub preload] bridge exposed', {
  keys: ['clipExporter', 'storage', 'windowControl', 'updater'],
})

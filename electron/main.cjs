const path = require('node:path')
const fs = require('node:fs')
const { app, BrowserWindow, ipcMain } = require('electron')
const { exportClipToFile } = require('./clipExporter.node.cjs')
const { readJsonFile, writeJsonFile } = require('./jsonFileStorage.cjs')
let storageHandlersRegistered = false
let clipExportHandlerRegistered = false
let windowCommandHandlerRegistered = false
const APP_STORAGE_DIRECTORY = 'TriggerHub2'

function log(level, message, context) {
  const payload = {
    level,
    namespace: 'ElectronMain',
    message,
    timestamp: new Date().toISOString(),
    context,
  }

  const writer = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info
  writer(JSON.stringify(payload))
}

function assertValidStorageKey(key) {
  if (typeof key !== 'string' || !/^[A-Za-z0-9._-]+$/.test(key)) {
    throw new Error('Invalid storage key')
  }
}

function getStorageFilePath(key) {
  assertValidStorageKey(key)
  return path.join(app.getPath('appData'), APP_STORAGE_DIRECTORY, `${key}.json`)
}

function getLegacyStorageFilePath(key) {
  assertValidStorageKey(key)
  return path.join(app.getPath('userData'), APP_STORAGE_DIRECTORY, `${key}.json`)
}

function registerStorageHandlers() {
  if (storageHandlersRegistered) {
    return
  }

  ipcMain.handle('storage:load', async (_event, key) => {
    const storageFilePath = getStorageFilePath(key)
    const storedValue = await readJsonFile(storageFilePath)
    if (storedValue !== null) {
      return storedValue
    }

    const legacyStorageFilePath = getLegacyStorageFilePath(key)
    if (legacyStorageFilePath === storageFilePath) {
      return null
    }

    const legacyValue = await readJsonFile(legacyStorageFilePath)
    if (legacyValue === null) {
      return null
    }

    await writeJsonFile(storageFilePath, legacyValue)
    log('info', 'Migrated legacy storage file', {
      key,
      legacyStorageFilePath,
      storageFilePath,
    })
    return legacyValue
  })
  ipcMain.handle('storage:save', async (_event, key, data) => {
    await writeJsonFile(getStorageFilePath(key), data)
  })

  storageHandlersRegistered = true
}

function registerClipExportHandler(targetApp = app) {
  if (clipExportHandlerRegistered) {
    return
  }

  ipcMain.handle('clip-exporter:export', async (_event, buffer, request) => {
    return exportClipToFile(buffer, request, targetApp)
  })

  clipExportHandlerRegistered = true
}

function assertValidWindowCommand(command) {
  if (!command || typeof command !== 'object') {
    throw new Error('Invalid window command')
  }

  if (!['focus', 'minimize', 'toggle-fullscreen'].includes(command.type)) {
    throw new Error('Invalid window command')
  }
}

async function executeWindowCommand(targetWindow, command) {
  assertValidWindowCommand(command)

  if (!targetWindow) {
    throw new Error('Window command requires a target window')
  }

  switch (command.type) {
    case 'focus':
      targetWindow.focus()
      return
    case 'minimize':
      targetWindow.minimize()
      return
    case 'toggle-fullscreen':
      targetWindow.setFullScreen(!targetWindow.isFullScreen())
      return
    default:
      throw new Error('Invalid window command')
  }
}

function registerWindowCommandHandler(targetIpcMain = ipcMain) {
  if (windowCommandHandlerRegistered) {
    return
  }

  targetIpcMain.handle('window:command', async (event, command) => {
    const targetWindow = BrowserWindow.fromWebContents(event.sender)
    await executeWindowCommand(targetWindow, command)
  })

  windowCommandHandlerRegistered = true
}

function registerIpcHandlers(targetApp = app) {
  registerStorageHandlers()
  registerClipExportHandler(targetApp)
  registerWindowCommandHandler()
}

async function createMainWindow(options = {}) {
  const show = options.show ?? true
  const preloadPath = path.join(__dirname, 'preload.cjs')
  const rendererPath = options.rendererPath ?? path.join(__dirname, '..', 'dist', 'index.html')

  log('info', 'Creating main window', {
    isPackaged: app.isPackaged,
    preloadPath,
    preloadExists: fs.existsSync(preloadPath),
    rendererPath,
    rendererExists: fs.existsSync(rendererPath),
  })

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 980,
    minHeight: 640,
    show,
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  })

  if (show) {
    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })
  }

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    log('error', 'Renderer failed to load', {
      errorCode,
      errorDescription,
      validatedURL,
      rendererPath,
    })
  })

  mainWindow.webContents.on('did-finish-load', () => {
    log('info', 'Renderer finished load', {
      url: mainWindow.webContents.getURL(),
    })
  })

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    log('error', 'Renderer process gone', details)
  })

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    log(level >= 3 ? 'error' : 'info', 'Renderer console message', {
      level,
      message,
      line,
      sourceId,
    })
  })

  await mainWindow.loadFile(rendererPath)
  return mainWindow
}

async function bootMainProcess(options = {}) {
  await app.whenReady()
  log('info', 'Electron app ready', {
    isPackaged: app.isPackaged,
    appPath: app.getAppPath(),
    appData: app.getPath('appData'),
    userData: app.getPath('userData'),
  })
  registerIpcHandlers(options.app ?? app)
  const mainWindow = await createMainWindow(options)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createMainWindow(options)
    }
  })

  return mainWindow
}

if (require.main === module) {
  bootMainProcess().catch((error) => {
    log('error', 'Electron main process boot failed', {
      error,
    })
    if (app?.quit) {
      app.quit()
    }
  })
}

if (app?.on) {
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}

module.exports = {
  assertValidStorageKey,
  assertValidWindowCommand,
  bootMainProcess,
  createMainWindow,
  executeWindowCommand,
  getStorageFilePath,
  getLegacyStorageFilePath,
  registerIpcHandlers,
  registerWindowCommandHandler,
}

const path = require('node:path')
const { app, BrowserWindow, ipcMain } = require('electron')
const { exportClipToFile } = require('./clipExporter.node.cjs')
const { readJsonFile, writeJsonFile } = require('./jsonFileStorage.cjs')
let storageHandlersRegistered = false
let clipExportHandlerRegistered = false
let windowCommandHandlerRegistered = false

function assertValidStorageKey(key) {
  if (typeof key !== 'string' || !/^[A-Za-z0-9._-]+$/.test(key)) {
    throw new Error('Invalid storage key')
  }
}

function getStorageFilePath(key) {
  assertValidStorageKey(key)
  return path.join(app.getPath('userData'), 'TriggerHub2', `${key}.json`)
}

function registerStorageHandlers() {
  if (storageHandlersRegistered) {
    return
  }

  ipcMain.handle('storage:load', async (_event, key) => {
    return readJsonFile(getStorageFilePath(key))
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
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 980,
    minHeight: 640,
    show,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
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

  const rendererPath = options.rendererPath ?? path.join(__dirname, '..', 'dist', 'index.html')
  await mainWindow.loadFile(rendererPath)
  return mainWindow
}

async function bootMainProcess(options = {}) {
  await app.whenReady()
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
    console.error(error)
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
  registerIpcHandlers,
  registerWindowCommandHandler,
}

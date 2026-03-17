const path = require('node:path')
const fs = require('node:fs')
const { app, BrowserWindow, ipcMain } = require('electron')
const { exportClipToFile } = require('./clipExporter.node.cjs')
const { readJsonFile, writeJsonFile } = require('./jsonFileStorage.cjs')
let autoUpdater = null

try {
  ;({ autoUpdater } = require('electron-updater'))
} catch (error) {
  console.warn(
    JSON.stringify({
      level: 'warn',
      namespace: 'ElectronMain',
      message: 'electron-updater not available, auto-update is disabled',
      timestamp: new Date().toISOString(),
      context: {
        error: error instanceof Error ? error.message : String(error),
      },
    })
  )
}

let storageHandlersRegistered = false
let clipExportHandlerRegistered = false
let windowCommandHandlerRegistered = false
let updaterHandlersRegistered = false
let updaterEventsRegistered = false
const APP_STORAGE_DIRECTORY = 'TriggerHub2'
const AUTO_UPDATE_ENABLED = process.env.TRIGGERHUB_DISABLE_AUTO_UPDATE !== '1'
const updaterState = {
  status: 'idle',
  message: 'Update system initialized',
  progressPercent: 0,
  version: null,
}

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

function serializeError(error) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    }
  }

  return {
    message: String(error),
  }
}

async function loadFatalRendererFallback(targetWindow, reason) {
  const message = encodeURIComponent(reason)
  await targetWindow.loadURL(
    `data:text/html;charset=UTF-8,<!doctype html><html><body style="margin:0;background:#0e0e11;color:#f4f4f5;font-family:Segoe UI,sans-serif;display:grid;place-items:center;min-height:100vh"><main style="max-width:520px;padding:24px"><h1 style="margin:0 0 12px;font-size:24px">TriggerHub failed to start</h1><p style="margin:0;color:#a1a1aa;line-height:1.5">The production renderer could not be loaded. Check the desktop logs for details.</p><pre style="margin-top:16px;padding:12px;border-radius:10px;background:#18181b;color:#fda4af;white-space:pre-wrap">${message}</pre></main></body></html>`
  )
}

function updateUpdaterState(nextState) {
  Object.assign(updaterState, nextState)
  const payload = { ...updaterState }

  for (const targetWindow of BrowserWindow.getAllWindows()) {
    if (!targetWindow.isDestroyed()) {
      targetWindow.webContents.send('updater:state', payload)
    }
  }

  log('info', 'Updater state changed', payload)
  return payload
}

function isAutoUpdateSupported(targetApp = app) {
  return Boolean(autoUpdater && AUTO_UPDATE_ENABLED && targetApp.isPackaged)
}

function registerAutoUpdaterEvents() {
  if (!autoUpdater || updaterEventsRegistered) {
    return
  }

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    updateUpdaterState({
      status: 'checking',
      message: 'Checking for updates...',
      progressPercent: 0,
    })
  })

  autoUpdater.on('update-available', (info) => {
    updateUpdaterState({
      status: 'available',
      message: `Version ${info.version} is available`,
      version: info.version,
      progressPercent: 0,
    })
  })

  autoUpdater.on('update-not-available', (info) => {
    updateUpdaterState({
      status: 'not-available',
      message: 'No updates available',
      version: info?.version ?? updaterState.version,
      progressPercent: 0,
    })
  })

  autoUpdater.on('download-progress', (progress) => {
    updateUpdaterState({
      status: 'downloading',
      message: 'Downloading update...',
      progressPercent: Math.round(progress.percent ?? 0),
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    updateUpdaterState({
      status: 'downloaded',
      message: `Version ${info.version} is ready to install`,
      version: info.version,
      progressPercent: 100,
    })
  })

  autoUpdater.on('error', (error) => {
    updateUpdaterState({
      status: 'error',
      message: error?.message ?? 'Auto-update failed',
      progressPercent: 0,
    })
    log('error', 'Auto-update error', {
      error: serializeError(error),
    })
  })

  updaterEventsRegistered = true
}

async function checkForUpdates() {
  if (!isAutoUpdateSupported(app)) {
    return updateUpdaterState({
      status: 'disabled',
      message: AUTO_UPDATE_ENABLED ? 'Auto-update is only enabled in packaged builds' : 'Auto-update disabled by environment',
      progressPercent: 0,
    })
  }

  registerAutoUpdaterEvents()
  await autoUpdater.checkForUpdates()
  return { ...updaterState }
}

async function downloadUpdate() {
  if (!isAutoUpdateSupported(app)) {
    return updateUpdaterState({
      status: 'disabled',
      message: AUTO_UPDATE_ENABLED ? 'Auto-update is only enabled in packaged builds' : 'Auto-update disabled by environment',
      progressPercent: 0,
    })
  }

  registerAutoUpdaterEvents()
  await autoUpdater.downloadUpdate()
  return { ...updaterState }
}

async function installUpdate() {
  if (!isAutoUpdateSupported(app)) {
    throw new Error('Auto-update install is only available in packaged builds')
  }

  if (updaterState.status !== 'downloaded') {
    throw new Error('No downloaded update is ready to install')
  }

  setImmediate(() => {
    autoUpdater.quitAndInstall(false, true)
  })
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

function registerUpdaterHandlers(targetIpcMain = ipcMain, targetApp = app) {
  if (updaterHandlersRegistered) {
    return
  }

  registerAutoUpdaterEvents()
  if (!isAutoUpdateSupported(targetApp)) {
    updateUpdaterState({
      status: 'disabled',
      message: AUTO_UPDATE_ENABLED ? 'Auto-update is only enabled in packaged builds' : 'Auto-update disabled by environment',
      progressPercent: 0,
    })
  }

  targetIpcMain.handle('updater:get-state', async () => {
    return { ...updaterState }
  })

  targetIpcMain.handle('updater:check', async () => {
    return checkForUpdates()
  })

  targetIpcMain.handle('updater:download', async () => {
    return downloadUpdate()
  })

  targetIpcMain.handle('updater:install', async () => {
    await installUpdate()
  })

  updaterHandlersRegistered = true
}

function registerIpcHandlers(targetApp = app) {
  registerStorageHandlers()
  registerClipExportHandler(targetApp)
  registerWindowCommandHandler()
  registerUpdaterHandlers(ipcMain, targetApp)
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

  try {
    await mainWindow.loadFile(rendererPath)
  } catch (error) {
    log('error', 'Renderer entrypoint failed to load', {
      rendererPath,
      error: serializeError(error),
    })
    await loadFatalRendererFallback(mainWindow, error instanceof Error ? error.message : String(error))
  }
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.send('updater:state', { ...updaterState })
  })
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
  if (isAutoUpdateSupported(options.app ?? app)) {
    void checkForUpdates().catch((error) => {
      updateUpdaterState({
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
        progressPercent: 0,
      })
      log('error', 'Initial auto-update check failed', {
        error: serializeError(error),
      })
    })
  }

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

if (process?.on) {
  process.on('uncaughtException', (error) => {
    log('error', 'Uncaught exception in main process', {
      error: serializeError(error),
    })
  })

  process.on('unhandledRejection', (reason) => {
    log('error', 'Unhandled rejection in main process', {
      error: serializeError(reason),
    })
  })
}

module.exports = {
  assertValidStorageKey,
  assertValidWindowCommand,
  bootMainProcess,
  checkForUpdates,
  createMainWindow,
  downloadUpdate,
  executeWindowCommand,
  getStorageFilePath,
  getLegacyStorageFilePath,
  installUpdate,
  registerIpcHandlers,
  registerUpdaterHandlers,
  registerWindowCommandHandler,
}

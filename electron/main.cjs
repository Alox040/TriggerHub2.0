const path = require('node:path')
const { mkdir, writeFile } = require('node:fs/promises')
const { app, BrowserWindow, ipcMain } = require('electron')

function resolveClipOutputPath(buffer, request) {
  const requestedOutputDir =
    request && typeof request.outputDir === 'string' && request.outputDir.length > 0
      ? request.outputDir
      : path.join(app.getPath('videos'), 'TriggerHub 2.0')

  return path.join(requestedOutputDir, `${buffer.id}.json`)
}

async function exportClipToFile(buffer, request) {
  const outputPath = resolveClipOutputPath(buffer, request)
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, JSON.stringify(buffer, null, 2), 'utf-8')

  return {
    clipId: buffer.id,
    path: outputPath,
  }
}

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 980,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  const rendererPath = path.join(__dirname, '..', 'dist', 'index.html')
  mainWindow.loadFile(rendererPath)
}

app.whenReady().then(() => {
  ipcMain.handle('clip-exporter:export', async (_event, buffer, request) => {
    return exportClipToFile(buffer, request)
  })

  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

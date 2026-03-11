const path = require("node:path");
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const { runBuildPipeline } = require("../builder-core/index.js");

function createWindow() {
  const win = new BrowserWindow({
    width: 1080,
    height: 760,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("select-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"]
  });

  if (result.canceled || !result.filePaths[0]) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle("start-build", async (_event, options) => {
  const mainWindow = BrowserWindow.getAllWindows()[0];

  const send = (channel, payload) => {
    mainWindow?.webContents.send(channel, payload);
  };

  try {
    const result = await runBuildPipeline({
      ...options,
      onProgress: (message) => send("build-progress", { level: "progress", message }),
      onLog: (message, stream) => send("build-progress", { level: stream, message })
    });

    return {
      ok: true,
      result
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown build error"
    };
  }
});

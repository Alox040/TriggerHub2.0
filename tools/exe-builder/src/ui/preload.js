const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("exeBuilderApi", {
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  startBuild: (options) => ipcRenderer.invoke("start-build", options),
  onBuildProgress: (handler) => ipcRenderer.on("build-progress", (_event, payload) => handler(payload))
});

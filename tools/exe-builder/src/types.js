const ProjectKind = {
  NODE: "node",
  PYTHON: "python",
  ELECTRON: "electron",
  STATIC: "static",
  TAURI: "tauri",
  UNKNOWN: "unknown"
};

const PackagerKind = {
  AUTO: "auto",
  ELECTRON_BUILDER: "electron-builder",
  PYINSTALLER: "pyinstaller",
  PKG: "pkg",
  TAURI: "tauri"
};

const InstallerKind = {
  NONE: "none",
  NSIS: "nsis",
  INNO_SETUP: "inno-setup"
};

module.exports = { ProjectKind, PackagerKind, InstallerKind };

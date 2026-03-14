# EXE Builder

Ein separates Hilfstool zum lokalen Bauen und Verpacken von Projekten als Windows-Executable oder Installer.

## Role In This Repository

- standalone helper tool under `tools/`
- not part of the TriggerHub desktop runtime
- not part of the TriggerHub website runtime

The tool stays separate so product code and build helpers remain clearly divided.

## Quick Start

1. Install dependencies:
   - `cd tools/exe-builder`
   - `npm install`
2. Start UI:
   - `npm run start`
3. In the app:
   - Select a project folder
   - Select output folder
   - Choose packager and optional installer
   - Start build

From the repository root, start it with `npm run tool:exe-builder:start`.

## Output

Default artifacts are created in:

- `<output>/dist/app.exe`
- `<output>/dist/installer.exe` (if installer was enabled)

The real executable/installer filename can vary by packager. The builder resolves and reports the created files.

## Supported Detection

- Node.js (`package.json`)
- Python (`requirements.txt`, `pyproject.toml`, `setup.py`, `main.py`)
- Electron (`package.json` with `electron`, `electron-builder`, or `main` + preload hints)
- Static app (`index.html`)
- Tauri (`src-tauri/tauri.conf.json`)

## Supported Packagers

- `electron-builder`
- `pyinstaller`
- `pkg`
- `tauri`

## Supported Installers

- NSIS (`makensis`)
- Inno Setup (`ISCC`)

## Notes

- Required external tools must be installed and available in `PATH`.
- The UI streams progress and errors in the log panel.
- Architecture details: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)

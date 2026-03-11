# Decision Log

## 2026-03-09 - Windows Packaging Stack
- Entscheidung: `electron-builder` mit `NSIS` als Packaging-Technologie.
- Grund: stabile Windows-Installationspfade inkl. Startmenü/Desktop-Shortcuts und Deinstallation über `Apps & Features`.
- Auswirkung: Root-Projekt erhält minimale Electron-Entry und Release-Skripte, ohne UI-Refactor.

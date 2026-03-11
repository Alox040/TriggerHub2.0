# Windows Desktop Release

## Ziel
Das Root-Projekt wird als installierbare Windows-Desktop-App gebaut.

## Voraussetzungen
- Windows
- Node.js + npm

## Build Commands
1. `npm install`
2. `npm run desktop:release`

## Ergebnis
Nach erfolgreichem Lauf liegen Artefakte unter `dist/`:
- `Setup.exe`
- `App.exe`
- `Uninstall.exe`

Zusätzlich erzeugt `electron-builder` die vollständigen Ausgabeordner unter `release/`.

## Verteilung
- Setup über `dist/Setup.exe` starten.
- Installation erzeugt Startmenü- und Desktop-Verknüpfungen.
- Deinstallation erfolgt über Windows `Apps & Features`.

## Hinweise
- Wenn `electron-builder` keinen direkten Uninstaller im Output bereitstellt, wird automatisch ein kleiner NSIS-Uninstall-Launcher erzeugt.
- Die eigentliche Deinstallation bleibt der installierte NSIS-Flow über Windows `Apps & Features`.

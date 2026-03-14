# Repo Structure

## Rollenmodell

### Aktiver Produktcode

- Root-Desktop-App
  - `src/`: Renderer, App-Schicht, Desktop-UI und Tests
  - `electron/`: Electron Main- und Preload-Prozess
  - Root-`package.json`: Desktop-Build-, Test- und Release-Einstieg
- `website/`
  - eigenstaendige Website-Anwendung mit eigener Runtime-, Routing- und API-Struktur
  - besitzt ein eigenes `package.json` und eigene Build-Schritte

### Design- und Prototyping-Referenzen

- `design/`
  - separater Design- und Prototyp-Stand
  - keine produktive Runtime fuer Desktop oder Website
  - Referenz fuer visuelle und konzeptionelle Iteration

### Hilfstools

- `tools/exe-builder/`
  - separates Verpackungs- und Build-Hilfstool
  - kein Laufzeitbestandteil der Desktop-App
  - kein Bestandteil der Website

## Root-Skripte

Die Root-Skripte spiegeln diese Trennung jetzt explizit:

- Desktop: `desktop:dev`, `desktop:preview`, `desktop:build`, `desktop:publish`, `desktop:release`
- Website: `website:dev`, `website:build`, `website:preview`
- Design: `design:dev`, `design:build`
- Tools: `tool:exe-builder:start`, `tool:exe-builder:smoke`

Bestehende Skriptnamen bleiben erhalten, damit bestehende Aufrufe weiter funktionieren.

## Bewusst nicht umstrukturiert

- Keine Ordner wurden physisch verschoben oder umbenannt.
- Keine Workspace-Migration wurde eingefuehrt.
- Keine Build- oder Deploymentlogik wurde semantisch veraendert.

Diese Punkte bleiben offen, bis ihre Auswirkungen auf Release-, Hosting- und Tooling-Pfade belastbar geklaert sind.

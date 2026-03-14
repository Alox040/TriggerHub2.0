# TriggerHub 2.0

Dieses Repository enthaelt drei getrennte Arbeitsbereiche:

- Produktcode: Desktop-App im Root (`src/`, `electron/`) und die aktive Website in [`website/`](./website)
- Design- und Prototyping-Referenzen: [`design/`](./design)
- Hilfstools: [`tools/`](./tools), aktuell vor allem [`tools/exe-builder/`](./tools/exe-builder)

Die Trennung ist bewusst ueber Doku und Skripte sichtbar gemacht. Physische Verschiebungen der Teilprojekte wurden nicht vorgenommen, damit Build-, Release- und Deploymentpfade stabil bleiben.

## Einstieg

- Desktop entwickeln: `npm run desktop:dev`
- Desktop bauen: `npm run desktop:build`
- Website entwickeln: `npm run website:dev`
- Website bauen: `npm run website:build`
- Design-Prototyp starten: `npm run design:dev`
- EXE-Builder starten: `npm run tool:exe-builder:start`

## Repo-Struktur

Eine kompakte Rollenbeschreibung der Hauptbereiche steht in [`docs/REPO_STRUCTURE.md`](./docs/REPO_STRUCTURE.md).

## Offene Entscheidungen

- `marketing/`, `project-meta/`, `project-context/` und weitere Root-Hilfsordner bleiben vorerst unveraendert, weil ihre produktive Rolle im Build- oder Releasepfad nicht eindeutig genug dokumentiert ist.
- Eine spaetere Monorepo-Konsolidierung mit Workspaces sollte nur separat und mit expliziten CI-, Build- und Deploymentanpassungen erfolgen.

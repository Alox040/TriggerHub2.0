# Alpha Readiness

## Zweck
Diese Datei beschreibt den aktuell belegten Alpha-Status des Projekts.

## Aktueller Stand (2026-03-13)
- Alle lokalen Qualitätsgates grün: `npm run test` PASS, `npm run typecheck` PASS, `npm run build` PASS, `npm --prefix website run build` PASS.
- Desktop-Kernsysteme (Trigger, Makros, Plugins, OBS, Spotify, Clip-Export) sind implementiert und durch Tests abgedeckt.
- Desktop-Persistenz ist vollständig verdrahtet: Storage-IPC lädt und speichert Trigger/Makros über `electron/main.cjs` + `electron/preload.cjs`, verifiziert durch `ipc-storage-bridge.e2e.test.ts` und `storage.test.ts`.
- Website besitzt Auth-, Gate-, Profil- und Routing-Grundlagen; Zugriffsmodell ist auf `private_prelaunch` (Owner + Prelaunch-Gate) beschränkt.
- Aktuelle Testsuite: 19 Dateien, alle grün.

## Vorhandene Bausteine
- `agents/project-context/active-tasks.md`
- `agents/project-context/known-issues.md`
- `project-meta/status/build-status.json`
- Implementierte Desktop-Kernsysteme für Trigger, Makros, Plugins sowie OBS- und Spotify-Integration
- Vollständige Storage-IPC-Schicht zwischen Electron Main und Renderer
- Website: zwei-schichtige Auth (PrelaunchGateProvider + AuthProvider), serverlose API-Endpunkte

## Verbleibende Lücken (belastbare offene Punkte)
- `website/src/config/runtimeConfig.ts` erzwingt effektiv weiterhin nur `private_prelaunch`; Invite- und Public-Produktpfade sind vorbereitet, aber nicht als aktiver Runtime-Modus betriebsfähig.
- Storage-Payloads werden beim Laden aus dem Electron-Storage noch nicht schema-basiert validiert (nur Array-Shape-Check).
- `deleteMacro()` in `src/app/facade.ts` greift per internem Cast auf `macroMap` der Engine zu statt auf eine offizielle Engine-API.
- Desktop-Release-Packaging (Windows NSIS x64) und reale Hosting-Konfiguration wurden noch nicht im selben Prüfkontext bestätigt.
- `project-meta/product/faq.json` ist weiterhin leer.

## Nächste Schritte
- Website-Access-Modelle über `private_prelaunch` hinaus betriebsfähig machen.
- Storage-Payload-Validierung schema-basiert nachrüsten.
- `deleteMacro()` auf offizielle Engine-API umstellen.
- Release-Artefakte auf Windows verifizieren und Hosting-Konfiguration dokumentieren.

# Alpha Readiness

## Zweck
Diese Datei beschreibt den aktuell belegten Alpha-Status des Projekts.

## Aktueller Stand (2026-03-13)
- Alle lokalen Qualitaetsgates gruen: `npm run test` PASS, `npm run typecheck` PASS, `npm run build` PASS, `npm --prefix website run build` PASS.
- Desktop-Kernsysteme (Trigger, Makros, Plugins, OBS, Spotify, Clip-Export) sind implementiert und durch Tests abgedeckt.
- Desktop-Persistenz ist vollstaendig verdrahtet: Storage-IPC laedt und speichert Trigger/Makros ueber `electron/main.cjs` + `electron/preload.cjs`, verifiziert durch `ipc-storage-bridge.e2e.test.ts` und `storage.test.ts`.
- Persistierte Trigger- und Makrodaten sind versioniert und haben einen Migrationspfad fuer Legacy-Arrays.
- Website besitzt Auth-, Gate-, Profil- und Routing-Grundlagen; das Zugriffsmodell ist auf `private_prelaunch` (Owner + Prelaunch-Gate) beschraenkt.
- Aktuelle Testsuite: 19 Dateien, alle gruen.

## Vorhandene Bausteine
- `agents/project-context/active-tasks.md`
- `agents/project-context/known-issues.md`
- `project-meta/status/build-status.json`
- Implementierte Desktop-Kernsysteme fuer Trigger, Makros, Plugins sowie OBS- und Spotify-Integration
- Vollstaendige Storage-IPC-Schicht zwischen Electron Main und Renderer
- Website: zwei-schichtige Auth (PrelaunchGateProvider + AuthProvider), API-basiertes Profilsystem und lokaler Router

## Verbleibende Luecken
- `website/src/config/runtimeConfig.ts` erzwingt effektiv weiterhin nur `private_prelaunch`; Invite- und Public-Produktpfade sind vorbereitet, aber nicht als aktiver Runtime-Modus betriebsfaehig.
- `deleteMacro()` in `src/app/facade.ts` greift per internem Cast auf `macroMap` der Engine zu statt auf eine offizielle Engine-API.
- Desktop-Release-Packaging (Windows NSIS x64) und reale Hosting-Konfiguration wurden noch nicht im selben Pruefkontext bestaetigt.
- `project-meta/product/faq.json` ist als expliziter Platzhalter vorhanden, aber fachlich noch ungefuellt.

## Naechste Schritte
- Website-Access-Modelle ueber `private_prelaunch` hinaus nur mit belegtem Sicherheitsmodell aktivieren.
- `deleteMacro()` auf offizielle Engine-API umstellen.
- Release-Artefakte auf Windows verifizieren und Hosting-Konfiguration dokumentieren.

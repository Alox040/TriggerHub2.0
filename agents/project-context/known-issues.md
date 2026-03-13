# Known Issues

## Dokumentationsabgleich
Stand: 2026-03-13

### Veraltete oder falsche Aussagen im vorherigen Stand
- `deleteMacro()` wurde als interne Facade-Kopplung ueber `macroMap` beschrieben. Das trifft auf den aktuellen Code in `src/app/facade.ts` nicht mehr zu.
- Offene Punkte zu unverifizierter Storage-IPC oder fehlender Desktop-Persistenz sind ueberholt; `ipc-storage-bridge.e2e.test.ts` und `storage.test.ts` decken diese Pfade ab.
- Build- und Typecheck-Fehler duerfen nicht mehr als aktuelle Produktfehler beschrieben werden, solange `project-meta/status/build-status.json` alle Gates auf `pass` setzt.

### Fehlende Informationen im vorherigen Stand
- Das Desktop-UI ist zwar vorhanden, aber fuer Closed Alpha funktional unvollstaendig: nur das Dashboard ist verdrahtet, weitere Pages sind Skeletons.
- `storage.test.ts` deckt nicht nur Start/Stop ab, sondern auch Reload aus Persistenz, benutzerdefinierte Storage-Keys und CRUD-Persistenz.
- `runtime-hardening.test.ts` deckt strukturierte Logs, Laufzeitmetriken und isolierte Plugin-Lifecycle-Fehler ab.
- `services.test.ts` prueft sowohl Memory- als auch HTTP-Transporte fuer OBS und Spotify sowie Clip-Export-Validierung.

## Korrigierte Fassung

## Verifizierte Probleme

### Aktive technische Risiken
- Dokumentationsdrift:
  - Mehrere Snapshot-, Handoff- und Kontextdateien koennen dem aktuellen Code-, Test- und Statusstand widersprechen.
  - Code, Tests und `project-meta/status/` sind bei Konflikten hoeher zu gewichten.
- Website-Access-Modi:
  - `website/src/config/runtimeConfig.ts` ist laut bestehender Tests weiterhin effektiv auf `private_prelaunch` beschraenkt, obwohl Routing und Policy-Code weitere Modi modellieren.
- Storage-Payload-Validierung:
  - `src/app/bootstrap.ts` prueft geladene Trigger- und Macro-Payloads nur auf Array-Form; ungueltige Eintraege werden zwar defensiv behandelt, aber nicht schema-basiert validiert.
- Plattformabdeckung:
  - `project-meta/status/release-status.json` und `release-status.md` beschreiben Release und Deployment als konfiguriert bzw. dokumentiert, nicht als live verifiziert.
- UI-Abdeckung:
  - Die Desktop-React-UI existiert, aber echte Management-Screens fuer Trigger und Makros fehlen noch.

### Nicht mehr als offene Probleme fuehren
- Die Storage-IPC zwischen Electron Main und Renderer ist durch `src/tests/ipc-storage-bridge.e2e.test.ts` Ende-zu-Ende verifiziert.
- Desktop-Persistenz ist implementiert; `src/tests/storage.test.ts` deckt Seed-, Lade-, Reload- und CRUD-Persistenzpfade ab.
- Runtime-Hardening ist kein unbelegter Anspruch mehr; `src/tests/runtime-hardening.test.ts` verifiziert Logging, Metriken und Plugin-Fehlerisolation.
- `deleteMacro()` ist kein aktueller Architektur-Defekt mehr.

## Produktluecken
- `project-meta/product/faq.json` ist weiterhin leer; Produktmetadaten bleiben unvollstaendig.
- Die Website besitzt Auth-, Gate-, Profil- und Routing-Grundlagen, aber kein belegtes Invite- oder Public-Produkt-Laufzeitmodell.
- Das Desktop-UI bietet bereits ein Dashboard, aber noch keine vollstaendigen Trigger-/Macro-Listen oder Editoren.

## Integrationsstatus
- OBS ist als Desktop-Service implementiert und getestet, inklusive HTTP-Transport-Validierung.
- Spotify ist als Desktop-Service implementiert und getestet, inklusive HTTP-Endpunkten und Response-Validierung.
- Clip-Service ist implementiert und getestet, inklusive Start-/Save-Verhalten und Export-Validierung.
- Discord ist im aktuellen Runtime-Code nicht als Service oder Plugin vorhanden.
- Twitch ist im aktuellen Runtime-Code nicht als Service oder Plugin vorhanden.

## Umgebungs- und Verifikationshinweise
- `project-meta/status/build-status.json` meldet alle Gates auf `pass` mit Stand `2026-03-12`.
- `project-meta/status/release-status.md` und `release-status.json` dokumentieren Konfiguration, nicht den Nachweis eines ausgelieferten Releases.
- Offene Release-Aussagen sollten deshalb vorsichtig formuliert bleiben, bis reale Packaging- und Deployment-Nachweise im selben Pruefkontext vorliegen.

# System Boundaries

## Zweck und Leseregel
Dieses Dokument beschreibt die belegten Systemgrenzen von TriggerHub 2.0 auf Basis des aktuellen Repository-Zustands.

Es enthaelt nur Aussagen, die durch Dateien im Repository nachvollziehbar sind.

Wenn Code, Tests und Projektmetadaten nicht deckungsgleich sind, wird das explizit als Unsicherheit markiert.

## Gesamtbild
TriggerHub 2.0 besteht im Repository aus drei voneinander getrennten Domaenen mit unterschiedlichen Laufzeitmodellen:

1. Desktop Runtime in `src/` plus Electron-Shell in `electron/`
2. Website in `website/`
3. Agent-System in `agents/`

Diese Domaenen teilen weder einen gemeinsamen Entry Point noch einen gemeinsamen Laufzeitzustand.

## Domaene 1: Desktop Runtime

### Scope
Die operative Produktlogik fuer Trigger, Makros, Plugins, Service-Adapter und den Renderer lebt in `src/`.

Der Renderer-Entry ist `src/main.tsx`.

Der Bootstrap der Runtime liegt in `src/app/bootstrap.ts`.

Die Fassade fuer UI-nahe Aufrufe liegt in `src/app/facade.ts`.

### Startpfad
`src/main.tsx` installiert zuerst Runtime-Guards, erzeugt danach `IpcStorageBridge`, ruft `createAppModuleContainer(storage)` auf und startet den Container ueber `container.start()`.

Erst danach wird React ueber `createRoot(...).render(...)` gemountet.

Die Desktop-Runtime ist damit vor dem ersten UI-Render bereits zusammengesetzt und gestartet.

### Composition Root
`src/app/bootstrap.ts` verdrahtet als Composition Root die zentralen Runtime-Bausteine:

- `InMemoryEventBus`
- `TriggerGraph`
- `TriggerEngine`
- `MacroEngine`
- `TriggerExecutor`
- `ObsService`
- `SpotifyService`
- `ClipService`
- `PluginRegistry`
- `AppController`
- `TriggerHubAppFacade`

Die Runtime wird nicht durch React komponiert, sondern durch `createAppModuleContainer(...)`.

### Port-Grenze
Die zentralen Port-Typen liegen in `src/types/ports.ts` und `src/storage/storagePort.ts`.

Repository-belegt sind dort insbesondere:

- `StoragePort`
- `EventBusPort`
- `TriggerEnginePort`
- `MacroEnginePort`
- `ObsServicePort`
- `SpotifyServicePort`
- `ClipServicePort`
- `PluginModule`
- `PluginContext`
- `PluginRegistryPort`
- `AppFacadePort`
- `AppControllerPort`

Wichtig fuer die Abgrenzung: `PluginContext` injiziert Ports und Controller-Referenzen, statt Plugins direkten Zugriff auf Composition-Details zu geben.

Wichtig fuer die Genauigkeit: In `src/core/trigger-engine/triggerExecutor.ts` enthaelt `ActionRegistryPort` nur `register(...)` und `unregister(...)`. Eine `execute(...)`-Methode existiert auf der konkreten Klasse `TriggerExecutor`, aber nicht auf dem Port-Typ.

### Fassade zur UI
`src/app/facade.ts` kapselt Zugriffe auf Trigger- und Makroverwaltung sowie das Dashboard-Read-Model.

Die UI sollte ueber `TriggerHubAppFacade` arbeiten und nicht direkt gegen `TriggerEngine` oder `MacroEngine` verdrahtet werden.

Die Fassade persistiert Trigger und Makros, wenn ein `StoragePort` vorhanden ist.

### Service-Grenze
Die Service-Schicht liegt in `src/services/`.

Alle derzeit belegten Laufzeit-Services folgen demselben Muster:

- Port auf Typebene
- Service-Klasse als Adapter-Wrapper
- Transport-Implementierung
- `OperationPolicy`
- Ausfuehrung ueber `runWithPolicy(...)`

Die gemeinsame Reliability-Schicht liegt in `src/services/shared/reliability.ts`.

Die Default-Policy ist repository-belegt als:

- `timeoutMs: 1000`
- `retries: 2`
- `retryDelayMs: 50`

Die gemeinsamen Fehlertypen an dieser Grenze sind:

- `ServiceOperationError` in `src/services/shared/reliability.ts`
- `HttpRequestError` in `src/services/shared/http.ts`
- `ResponseValidationError` in `src/services/shared/http.ts`
- `ClipExportValidationError` in `src/services/clip-service/clipExporter.interface.ts`

### Implementierte Desktop-Integrationen
Die Runtime verdrahtet aktuell produktiv nur drei Servicebereiche:

- OBS in `src/services/obs-service/`
- Spotify in `src/services/spotify-service/`
- Clip-Service in `src/services/clip-service/`

OBS bietet ueber `ObsServicePort` die Operationen `connect()`, `disconnect()` und `switchScene(sceneName)`.

Spotify bietet ueber `SpotifyServicePort` die Operationen `play()`, `pause()` und `nextTrack()`.

Der Clip-Service bietet ueber `ClipServicePort` die Operationen `startCapture()` und `saveClip()`.

### Konkrete Adaptergrenze
OBS:

- `InMemoryObsTransport`
- `ObsHttpTransport`
- Wrapper: `ObsService`

Spotify:

- `InMemorySpotifyTransport`
- `SpotifyHttpTransport`
- Wrapper: `SpotifyService`

Clip:

- `InMemoryClipExporter`
- `BrowserClipExporter`
- `FileSystemClipExporter`
- Wrapper: `ClipService`

### Action-Grenze
`src/app/bootstrap.ts` registriert die Runtime-Aktionen im `TriggerExecutor`.

Repository-belegt sind mindestens:

- `obs.switchScene`
- `spotify.play`
- `spotify.pause`
- `spotify.nextTrack`
- `clip.startCapture`
- `clip.saveClip`
- `macro.run`
- `macro`

Die Action-Grenze ist damit string-basiert und nicht compile-time gekapselt.

### Persistenz innerhalb der Desktop Runtime
Die Runtime laedt beim Start optionale Persistenz ueber `StoragePort.load(...)` und schreibt beim Stop ueber `StoragePort.save(...)`.

Die Default-Keys kommen aus `src/app/runtimeConfig.ts`:

- `triggers`
- `macros`

Zusatzlich liest `src/app/bootstrap.ts` optional `runtime-config`.

Wenn keine Persistenz vorhanden ist, seedet die Runtime Default-Daten in Memory.

### Electron-Shell innerhalb der Desktop-Domaene

### Scope
`electron/` bildet die privilegierte Desktop-Shell fuer die Runtime in `src/`.

Sie ist die einzige Repository-Stelle, die Electron-Main-API, Dateisystem-Persistenz und nativen Clip-Export zusammenfuehrt.

### Main-Process-Grenze
`electron/main.cjs` kapselt:

- `BrowserWindow`-Erzeugung
- App-Lifecycle
- Registrierung der IPC-Handler
- Delegation an Dateispeicher und Clip-Export

### BrowserWindow-Hardening
Die `BrowserWindow`-Konfiguration ist in `electron/main.cjs` konkret belegt mit:

- `contextIsolation: true`
- `nodeIntegration: false`
- `webSecurity: true`
- `width: 1280`
- `height: 800`
- `minWidth: 980`
- `minHeight: 640`

Die Electron-Shell exponiert damit keine Node-APIs direkt an den Renderer.

### Preload-Grenze
`electron/preload.cjs` benutzt `contextBridge.exposeInMainWorld(...)` und stellt genau eine Renderer-seitige Root-API bereit:

`window.triggerHubElectron`

Unterobjekte:

- `storage.load(key)`
- `storage.save(key, data)`
- `clipExporter.exportClip(buffer, request)`

Diese API ist die explizite Grenze zwischen unprivilegiertem Renderer und privilegiertem Main-Prozess.

### IPC-Grenze
`electron/main.cjs` registriert `ipcMain.handle(...)` fuer drei Channels:

- `storage:load`
- `storage:save`
- `clip-exporter:export`

`storage:load` delegiert an `readJsonFile(...)`.

`storage:save` delegiert an `writeJsonFile(...)`.

`clip-exporter:export` delegiert an `exportClipToFile(...)` aus `electron/clipExporter.node.cjs`.

### Storage-Grenze Main <-> Renderer
Renderer-seitig implementiert `src/storage/ipcStorageBridge.ts` den Port `StoragePort`.

Main-seitig implementiert `electron/jsonFileStorage.cjs` den JSON-Dateizugriff.

`readJsonFile(path)` liefert `null` bei `ENOENT` und wirft andere Fehler durch.

`writeJsonFile(path, data)` erzeugt Verzeichnisse rekursiv und schreibt JSON mit 2 Leerzeichen Einrueckung.

### Effektiver Persistenzpfad
Die Main-Process-Funktion `getStorageFilePath(key)` in `electron/main.cjs` benutzt:

`path.join(app.getPath('userData'), 'TriggerHub2', \`${key}.json\`)`

Unsicherheit:

- In mehreren Projektmetadaten und externen Beschreibungen taucht `TriggerHub2.0` als Persistenzordner auf.
- Der aktuell belegte Code in `electron/main.cjs` verwendet jedoch `TriggerHub2`.
- Fuer dieses Dokument gilt daher der Codepfad `TriggerHub2` als Source of Truth.

### Native Clip-Export-Grenze
`electron/clipExporter.node.cjs` schreibt Exportdateien standardmaessig unter:

`app.getPath('videos')/TriggerHub 2.0/`

Die Export-Funktion ist nur ueber den IPC-Channel `clip-exporter:export` erreichbar.

Der Renderer selbst schreibt keine Dateien direkt in `~/Videos/`.

## Domaene 2: Website

### Scope
`website/` ist ein separates Vite-Projekt mit eigener `package.json`, eigenem `src/main.tsx`, eigener Routing-Schicht und eigener API-Oberflaeche unter `website/api/`.

Es gibt keinen gemeinsamen React-Entry mit der Desktop Runtime.

Es gibt keinen gemeinsamen Bootstrap mit `src/app/bootstrap.ts`.

Es gibt keinen direkten Importpfad von `website/` auf Desktop-Ports wie `EventBusPort`, `TriggerEnginePort`, `MacroEnginePort` oder `StoragePort`.

### Funktionsgrenze
Die Website bildet im aktuellen Codebestand kein Frontend fuer die Desktop-Runtime.

Ihre belegte Funktion ist Access Control und Identity fuer einen geschlossenen Prelaunch-/Owner-Flow.

Die Website ist damit eine eigenstaendige Web-Domaene, nicht eine alternative Darstellung der Desktop-App.

### API-Grenze
Die Website-API-Routen liegen unter `website/api/` und sind als Vercel-Handler implementiert.

Repository-belegte Routen:

- `POST /api/prelaunch-gate/login`
- `GET /api/prelaunch-gate/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Auth- und Cookie-Grenze
Die Website verwendet folgende Cookies:

- `th_prelaunch_gate`
- `th_prelaunch_session`
- `th_csrf`

`th_prelaunch_gate` und `th_prelaunch_session` werden mit `HttpOnly` gesetzt.

Alle drei Cookies verwenden `SameSite=Strict`.

Die CSRF-Pruefung erfolgt ueber `th_csrf` plus Header `X-CSRF-Token`.

Die Session- und Gate-Mechanik lebt in `website/api/_auth.ts` und `website/api/_prelaunchGate.ts`.

### Kryptografische und Security-Grenze
Owner-Login verifiziert Passwoerter ueber `crypto.pbkdf2Sync(..., 'sha256')` in `website/api/_auth.ts`.

Die Session-Cookies sind signierte JWT-aehnliche Token mit `HS256`.

Die Prelaunch-Gate-Cookies sind HMAC-signierte Payloads.

Die API-Antworten setzen Security-Header zentral ueber `sendJson(...)` in `website/api/_auth.ts`.

### Rate-Limiting-Grenze
`website/api/_security.ts` implementiert In-Memory-Rate-Limiting je Fingerprint und Bucket.

Fuer Login-Buckets ist der Default repository-belegt als:

- 5 Versuche
- 5 Minuten Fenster

Diese Grenze gilt fuer:

- `prelaunch_gate_login`
- `owner_login`

Weitere Buckets existieren fuer Session-Read und Logout, sind aber keine Login-Grenze.

### Routing-Grenze
Die Website-Routen und ihre Access-Policies sind in `website/src/app/routing/routeManifest.ts` modelliert.

Repository-belegt sind dort die Modi:

- `private_prelaunch`
- `invite_only`
- `public_product`

Die effektive Runtime-Konfiguration in `website/src/config/runtimeConfig.ts` akzeptiert aktuell jedoch nur `private_prelaunch` und faellt fuer andere Werte auf `private_prelaunch` zurueck.

Die Routing-Schicht modelliert also mehr Modi, als die aktive Runtime-Konfiguration freischaltet.

### Explizite Nicht-Grenzen
Die Website hat nach aktuellem Repository-Stand keinen Zugriff auf:

- `window.triggerHubElectron`
- Electron-IPC
- Desktop-Persistenz unter `app.getPath('userData')`
- `InMemoryEventBus`
- `TriggerEngine`
- `MacroEngine`
- `PluginRegistry`

Es gibt auch keinen belegten Replikations- oder Sync-Pfad zwischen `website/api/` und den JSON-Dateien der Desktop-App.

## Domaene 3: Agent-System

### Scope
`agents/` enthaelt Arbeitsanweisungen, Rollen, Vorlagen und Projektsnapshots fuer KI-gestuetzte Workflows.

Das Agent-System ist eine Repository-interne Wissens- und Prozessschicht.

### Laufzeitgrenze
Es gibt keinen belegten Importpfad aus `src/`, `electron/` oder `website/` in `agents/`, der Teil des Produkt-Runtimes waere.

Es gibt keinen Build- oder Bootpfad, der `agents/` als Anwendung startet.

`agents/` ist damit kein Runtime-Anteil des Produkts.

### Dokumentationsgrenze
Dateien wie `agents/project-context/known-issues.md` oder `agents/project-context/architecture-overview.md` duerfen als Projektmetadaten gelesen werden, sind aber gegenueber produktivem Code nachrangig, wenn Aussagen kollidieren.

## Plugin-Grenze

### Registry
Die Plugin-Registry liegt in `src/plugins/pluginRegistry.ts`.

Belegte Registry-Operationen:

- `register(...)`
- `unregister(...)`
- `list()`
- `activateAll(context)`
- `deactivateAll()`

### Isolation
Aktivierung und Deaktivierung jedes Plugins werden in `try/catch` isoliert ausgefuehrt.

Ein einzelner Plugin-Fehler soll damit die Runtime nicht abstuerzen lassen.

### Injektionsmodell
Plugins erhalten einen `PluginContext` mit:

- `appController`
- `triggerEngine`
- `macroEngine`
- `eventBus`
- `actionRegistry`

Die Plugin-Grenze ist damit port- und context-basiert, nicht dateisystem- oder sandbox-basiert.

Es gibt keine belegte Prozessisolation fuer Plugins.

### Default-Plugin-Stand
`src/plugins/index.ts` registriert standardmaessig genau ein Beispielplugin ueber `createExamplePlugin()`.

Das Plugin lebt in `src/plugins/example-plugin/` und ist damit Beispielcode innerhalb derselben Runtime, nicht ein extern geladenes Plugin-Paket.

## Integrationsstatus

| Integration | Status | Repository-Beleg | Grenze |
| --- | --- | --- | --- |
| OBS | implementiert | `src/services/obs-service/`, `src/app/bootstrap.ts`, `project-meta/integrations/obs.json` | Desktop-Service mit In-Memory- und HTTP-Transport |
| Spotify | implementiert | `src/services/spotify-service/`, `src/app/bootstrap.ts`, `project-meta/integrations/spotify.json` | Desktop-Service mit In-Memory- und HTTP-Transport |
| Clip-Export | implementiert mit Grenzleck | `src/services/clip-service/`, `electron/clipExporter.node.cjs`, `project-meta/features/clip-export.json` | Browser/Electron/Node-Grenze getrennt modelliert, aber Build-Risiko vorhanden |
| Discord | nicht implementiert | `project-meta/integrations/discord.md`, `project-meta/integrations/discord.json` | nur dokumentiert, kein Runtime-Service |
| Twitch | nicht implementiert | `project-meta/integrations/twitch.md`, `project-meta/integrations/twitch.json` | nur dokumentiert, kein Runtime-Service |
| YouTube | nicht implementiert | `project-meta/integrations/youtube.md` | nur Dokumentation und Content-Erwaehnungen |

## Querschnittliche Boundary-Regeln

### Renderer darf nicht direkt auf Node zugreifen
Der Desktop-Renderer ist auf `window.triggerHubElectron` als Bridge beschraenkt.

Direkte Node- oder Dateisystem-Imports im Renderer verletzen diese Grenze.

### Produktiver Dateizugriff liegt im privilegierten Code
Persistenz und Dateiexport laufen ueber `electron/main.cjs`, `electron/jsonFileStorage.cjs` und `electron/clipExporter.node.cjs`.

`src/` soll diese Faehigkeiten nur ueber Ports und Bridge-APIs nutzen.

### Website und Desktop teilen keinen Laufzeitzustand
Website-Auth-Cookies autorisieren Web-Routen, nicht die Desktop-Runtime.

Desktop-JSON-Dateien autorisieren keine Website-Session.

### Agent-System beeinflusst den Runtime-Zustand nicht direkt
Agent-Dateien koennen Architektur und Arbeitsweise dokumentieren, sind aber keine ausfuehrbare Produktgrenze.

## Bekannte Luecken

- `src/tests/ipc-storage-bridge.e2e.test.ts` deckt einen echten Electron-Roundtrip fuer `IpcStorageBridge` ab. Gleichzeitig markiert `agents/project-context/known-issues.md` die Main/Renderer-Verdrahtung noch als nicht abschliessend verifiziert. Das Repository enthaelt also einen E2E-Beleg, aber auch eine offene Verifikationsaussage in den Projektmetadaten. Diese Unsicherheit bleibt bestehen.
- `src/services/clip-service/clipExporter.node.ts` importiert Node-Module dynamisch und ist Teil derselben Quellstruktur wie Browser-Code. Laut `agents/project-context/known-issues.md` fuehrt diese Boundary-Stelle aktuell zu einem Build-Problem, obwohl die Exporte bereits in `clipExporter.browser.ts`, `clipExporter.node.ts` und `clipExporter.interface.ts` getrennt sind.
- `website/src/app/routing/routeManifest.ts` modelliert `invite_only` und `public_product`, aber `website/src/config/runtimeConfig.ts` aktiviert effektiv nur `private_prelaunch`. Die Routing-Grenze ist also weiter als die aktive Laufzeitkonfiguration.
- Der effektive Desktop-Persistenzordner ist im Code `TriggerHub2`, nicht `TriggerHub2.0`. Falls externe Dokumente oder Alt-Snapshots `TriggerHub2.0` nennen, besteht Dokumentationsdrift.

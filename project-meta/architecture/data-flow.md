# Data Flow

## Zweck und Leseregel
Dieses Dokument beschreibt die aktuell belegten Datenfluesse in TriggerHub 2.0.

Es verwendet nur Repository-konkrete Aussagen mit Datei-, Typ- und Interface-Referenzen.

Wenn bereitgestellter Kontext und Implementierung voneinander abweichen, wird die Abweichung explizit markiert.

## Scope
Abgedeckt sind:

- Desktop-Bootstrap in `src/`
- Event-, Trigger-, Action- und Makrofluss in `src/core/`
- Service-Dispatch und Metrics in `src/services/` und `src/runtime/`
- Clip-Export und Storage-IPC zwischen `src/` und `electron/`
- Website-Gate- und Auth-Fluss in `website/`

## Einstiegspunkte

### Desktop
Der Desktop-Start beginnt in `src/main.tsx`.

```text
main()
  -> installRuntimeProcessGuards()
  -> new IpcStorageBridge()
  -> createAppModuleContainer(storage)
  -> container.start()
  -> React render via AppProvider(container)
```

Die zusammengesetzte Runtime hat den Typ `RuntimeContainer` aus `src/app/bootstrap.ts`.

### Website
Die Website startet getrennt ueber `website/src/main.tsx`.

Fuer den hier relevanten Sicherheitsfluss sind `PrelaunchGateProvider` und `AuthProvider` die entscheidenden Client-Einstiege.

## Desktop-Bootstrap-Fluss

### Composition Root
`createAppModuleContainer(storage?)` in `src/app/bootstrap.ts` erzeugt und verdrahtet:

- `InMemoryEventBus`
- `ObsService`
- `SpotifyService`
- `ClipService`
- `TriggerExecutor`
- `MacroEngine`
- `TriggerGraph`
- `TriggerEngine`
- `AppController`
- `PluginRegistry`
- `TriggerHubAppFacade`

### Effektive `start()`-Reihenfolge
Die tatsaechliche Reihenfolge in `src/app/bootstrap.ts` ist:

```text
start()
  -> storage?.load('runtime-config')
  -> loadOrSeedCoreData(triggerEngine, macroEngine, storage, runtimeConfig)
  -> appController.start()
  -> obsService.connect()
  -> spotifyService.play()
  -> clipService.startCapture()
  -> pluginRegistry.activateAll(context)
```

`loadOrSeedCoreData(...)` laeuft also vor `appController.start()` und vor der Plugin-Aktivierung.

### `loadOrSeedCoreData(...)`
Der belegte Fluss ist:

```text
if triggerEngine.getAll().length > 0 or macroEngine.getAllMacros().length > 0
  -> return
if no storage
  -> seedDefaultCoreData()
else
  -> storage.load(runtimeConfig.storageKeys.triggers)
  -> storage.load(runtimeConfig.storageKeys.macros)
  -> register loaded macros
  -> register loaded triggers
  -> if both null -> seedDefaultCoreData()
```

Wichtig:

- geladen werden zuerst Trigger und dann Makros
- registriert werden zuerst Makros und dann Trigger

### Default-Seed-Daten
`seedDefaultCoreData(...)` erzeugt:

- Makro `macro-default-scene`
- Trigger `trigger-main-scene`

```text
macro-default-scene
  -> step[0] = service_call('obs.switchScene', { sceneName: 'Main' })

trigger-main-scene
  -> event = EventTopics.OBS_CONNECTED
  -> action[0] = macro.run({ macroId: 'macro-default-scene' })
```

`EventTopics` liegen aktuell in `src/types/domain.ts`, nicht in `src/types/domain.ts`.

### Effektive `stop()`-Reihenfolge
Die tatsaechliche Reihenfolge in `src/app/bootstrap.ts` ist:

```text
stop()
  -> storage.save(triggers)
  -> storage.save(macros)
  -> triggerEngine.destroy()
  -> pluginRegistry.deactivateAll()
  -> obsService.disconnect()
  -> spotifyService.pause()
  -> appController.stop()
```

Der Code speichert also vor dem Abbau der Runtime-Komponenten.

## Event -> Trigger -> Action

### Beteiligte Typen
Die zentrale Typkette ist:

- `EventBusPort` in `src/types/ports.ts`
- `TriggerEngine` in `src/core/trigger-engine/triggerEngine.ts`
- `TriggerGraphPort` in `src/types/ports.ts`
- `TriggerGraph` in `src/core/trigger-engine/triggerGraph.ts`
- `TriggerAction` und `GraphTriggerRecord` in `src/core/trigger-engine/triggerGraphTypes.ts`
- `ActionRegistryPort` und `TriggerExecutor` in `src/core/trigger-engine/triggerExecutor.ts`
- `TriggerPayload` und `TriggerCondition` in `src/core/trigger-engine/triggerConditions.ts`

### EventBus
`InMemoryEventBus` in `src/core/event-bus/inMemoryEventBus.ts` speichert Subscriber in `Map<string, SubscriberRecord[]>`.

```text
publish(topic, payload)
  -> collectMatchingRecords(topic)
  -> for each subscriber
       -> remove if once
       -> await handler(payload)
```

Handler laufen sequentiell. Fehler propagieren aus `publish(...)`, wenn sie nicht lokal abgefangen werden.

### Trigger-Registrierung
`TriggerEngine.registerTrigger(trigger)` fuehrt aus:

```text
registerTrigger(trigger)
  -> graph.registerTrigger(trigger)
  -> triggerEventIndex.set(trigger.id, trigger.event)
  -> if no subscription for event yet
       -> eventBus.subscribe(eventName, payload => handleEvent(eventName, payload))
```

`TriggerGraph` verwaltet dabei:

- `eventIndex: Map<string, Map<string, GraphTriggerRecord>>`
- `triggerIndex: Map<string, string>`

### Event-Topics
Direkt relevant in den belegten Fluesen sind:

- `EventTopics.OBS_CONNECTED`
- `EventTopics.TRIGGER_EXECUTED`
- `EventTopics.MACRO_COMPLETED`

Zusaetzlich definiert in `src/types/domain.ts`:

- `OBS_SCENE_CHANGED`
- `OBS_DISCONNECTED`
- `SPOTIFY_TRACK_CHANGED`
- `SPOTIFY_PLAYBACK_STARTED`
- `SPOTIFY_PLAYBACK_PAUSED`

### Eventgetriebene Trigger-Ausfuehrung
Der operative Fluss in `TriggerEngine.handleEvent(...)` ist:

```text
eventBus.publish(topic, payload)
  -> TriggerEngine.handleEvent(topic, payload)
     -> graph.getTriggersByEvent(topic)
     -> for each trigger
          if !enabled -> continue
          if conditions fail -> continue
          -> executeSingleTrigger(trigger, payload)
          -> eventBus.publish(EventTopics.TRIGGER_EXECUTED, { triggerId, firedAt })
```

Die Conditions werden ueber `evaluateCondition(...)` aus `src/core/trigger-engine/triggerConditions.ts` geprueft.

### Condition-Operatoren
Belegte Operatoren fuer `TriggerCondition.operator`:

- `equals`
- `not_equals`
- `greater_than`
- `less_than`
- `contains`
- `exists`

`exists` prueft auf `fieldValue !== undefined && fieldValue !== null`.

### Manuelle Trigger-Ausfuehrung
`TriggerHubAppFacade.executeTrigger(triggerId)` delegiert direkt an `TriggerEngine.executeTrigger(triggerId)`.

```text
facade.executeTrigger(triggerId)
  -> triggerEngine.executeTrigger(triggerId)
  -> graph.getAll().find(triggerId)
  -> executeSingleTrigger(trigger, {})
  -> eventBus.publish(EventTopics.TRIGGER_EXECUTED, { triggerId, firedAt })
```

Manuelle Trigger-Ausfuehrung startet also nicht mit `eventBus.publish(...)`.

### Action-Dispatch
`TriggerExecutor` speichert Handler in `Map<string, ActionHandler>`.

```text
executeSingleTrigger(trigger, payload)
  -> for each action
       -> TriggerExecutor.execute(action, payload)
          -> registry.get(action.type)
          -> await handler(action, payload)
```

Fehler einzelner Actions werden in `actionErrors` gesammelt und fliessen in `trigger_dispatch_time` ein.

## Registrierte Action-Handler
`src/app/bootstrap.ts` registriert:

- `obs.switchScene` -> `obsService.switchScene(action.payload.sceneName)`
- `spotify.play` -> `spotifyService.play()`
- `spotify.pause` -> `spotifyService.pause()`
- `spotify.nextTrack` -> `spotifyService.nextTrack()`
- `clip.startCapture` -> `clipService.startCapture()`
- `clip.saveClip` -> `clipService.saveClip()`
- `macro.run` -> `macroEngine.runMacro(action.payload.macroId)`
- `macro` -> Lookup per `action.payload.name`, dann `macroEngine.runMacro(foundMacro.id)`

Unsicherheit:

- Der gelieferte Kontext nennt fuer `macro` den Payload-Key `macroName`.
- Der aktuelle Code liest `payload.name`.

## Makro-Ausfuehrungspipeline

### Einstieg
`MacroEngine.runMacro(macroId, options?)` in `src/core/macro-system/macroEngine.ts` ruft intern `runMacroWithResult(...)` auf.

```text
runMacro(macroId, options)
  -> runMacroWithResult(macroId, options)
  -> if not skipped
       -> eventBus.publish(EventTopics.MACRO_COMPLETED, { macroId, stepCount, executedAt })
```

### Lookup und Kontext
`runMacroWithResult(...)` arbeitet mit `macroMap: Map<string, MacroRecord>`.

```text
macroMap.get(macroId)
  -> if missing: throw Error
  -> if !enabled: return skipped result
  -> runMacro(macroRecord, stepHandler, options, depth, triggerPayload)
```

`runMacro(...)` in `src/core/macro-system/macroRunner.ts` erzeugt `MacroExecutionContext` mit:

- `macroId`
- `variables`
- `triggerPayload`
- `depth`

`variables` entstehen aus `macro.variables` plus `options.variables`.

### Step-Dispatch
Der konkrete Dispatch in `executeMacroStep(...)` aus `src/app/bootstrap.ts` ist:

```text
delay
  -> setTimeout(durationMs)
service_call
  -> executor.execute({ type: `${step.service}.${step.action}`, payload: step.params }, {})
plugin_action
  -> executor.execute({ type: `${step.plugin}.${step.action}`, payload: step.params }, {})
macro_call
  -> macroEngine.runMacroWithResult(step.macroId, mergedOptions, ctx.depth + 1, ctx.triggerPayload)
conditional
  -> evaluate against ctx.variables
parallel
  -> Promise.all(...)
sequence
  -> sequential nested execution
```

Belegte `conditional`-Operatoren:

- `equals`
- `not_equals`
- `greater_than`
- `less_than`
- `contains`
- `exists`

`maxDepth` ist effektiv `options.maxDepth ?? 5`.

`stopOnError` ist effektiv `true`, solange `options.stopOnError` nicht explizit `false` ist.

## Service-Dispatch mit Reliability-Policy

### Gemeinsame Policy
`src/services/shared/reliability.ts` definiert `defaultOperationPolicy` als:

- `timeoutMs: 1000`
- `retries: 2`
- `retryDelayMs: 50`

### Fluss von `runWithPolicy(...)`
```text
runWithPolicy(operation, policy, task)
  -> attempts = policy.retries + 1
  -> withTimeout(operation, policy.timeoutMs, task)
  -> on success/error: recordRuntimeMetric('service_latency', duration, { operation, attempt, success })
  -> on error before final attempt: delay(policy.retryDelayMs)
  -> after final failure: throw ServiceOperationError(operation, attempts, lastError)
```

Timeout wird ueber `Promise.race(...)` in `withTimeout(...)` umgesetzt.

Diese Policy fliesst in:

- `ObsService.connect()`, `disconnect()`, `switchScene(...)`
- `SpotifyService.play()`, `pause()`, `nextTrack()`
- `ClipService.saveClip()`

## Clip-Export-Fluss

### Einstieg ueber Trigger-Action
```text
'clip.saveClip'
  -> clipService.saveClip()
  -> buildClipBuffer({ source: 'default', durationMs: 30000 })
  -> exportClip(buffer, exporter)
  -> exportClipWithValidation(buffer, exporter)
  -> exporter.export(buffer)
```

`ClipBuffer` aus `src/services/clip-service/clipProcessor.ts` enthaelt `id`, `source` und `startedAt`.

### Renderer -> Electron -> Datei
```text
BrowserClipExporter.export(buffer)
  -> window.triggerHubElectron?.clipExporter?.exportClip(buffer, request)
  -> ipcRenderer.invoke('clip-exporter:export', buffer, request)
  -> ipcMain.handle('clip-exporter:export')
  -> exportClipToFile(buffer, request, app)
  -> mkdir(...)
  -> writeFile(outputPath, JSON.stringify(buffer, null, 2))
  -> return { clipId: buffer.id, path: outputPath }
```

Der Default-Zielpfad in `electron/clipExporter.node.cjs` liegt unter `app.getPath('videos')/TriggerHub 2.0/`.

`exportClipWithValidation(...)` validiert das Rueckgabeobjekt gegen `ClipExportResult`.

Bei ungueltiger Struktur wird `ClipExportValidationError` geworfen.

## Storage-Persistenzfluss

### Facade-Schreibpfad
`TriggerHubAppFacade` in `src/app/facade.ts` persistiert sofort, wenn `StoragePort` vorhanden ist.

```text
createTrigger(trigger)
  -> triggerEngine.registerTrigger(trigger)
  -> storage.save('triggers', triggerEngine.getAll().map(stripTriggerRecord))

createMacro(macro)
  -> macroEngine.registerMacro(macro)
  -> storage.save('macros', macroEngine.getAllMacros().map(stripMacroRecord))
```

`deleteTrigger(...)` und `deleteMacro(...)` folgen demselben Persistenzmuster.

### Strip-Helfer
`src/app/storageHelpers.ts` transformiert Runtime-Records vor Persistenz:

- `stripTriggerRecord(record)` entfernt `createdAt`
- `stripMacroRecord(record)` entfernt `createdAt` und `lastRunAt`

### IPC-Storage-Bruecke
```text
IpcStorageBridge.save(key, data)
  -> window.triggerHubElectron.storage.save(key, data)
  -> ipcRenderer.invoke('storage:save', key, data)
  -> ipcMain.handle('storage:save')
  -> writeJsonFile(getStorageFilePath(key), data)

IpcStorageBridge.load(key)
  -> window.triggerHubElectron.storage.load(key)
  -> ipcRenderer.invoke('storage:load', key)
  -> ipcMain.handle('storage:load')
  -> readJsonFile(getStorageFilePath(key))
```

`readJsonFile(...)` liefert `null` bei `ENOENT`.

`electron/main.cjs` verwendet aktuell `path.join(app.getPath('userData'), 'TriggerHub2', \`${key}.json\`)`.

## Metrics- und Logger-Fluss

### Runtime-Metriken
`recordRuntimeMetric(...)` in `src/runtime/runtimeMonitor.ts` schreibt in `runtimeMetrics.record(...)` aus `src/runtime/metrics.ts`.

```text
recordRuntimeMetric(name, durationMs, attributes)
  -> runtimeMetrics.record({ name, durationMs, timestamp: Date.now(), attributes })
```

Belegte Metriknamen:

- `macro_execution_time`
- `trigger_dispatch_time`
- `service_latency`

Abfrage erfolgt ueber `runtimeMetrics.snapshot()`.

### Strukturiertes Logging
`createConsoleLogger(namespace)` in `src/utils/logger.ts` serialisiert Logs als JSON mit:

- `level`
- `namespace`
- `message`
- `timestamp`
- optional `context`

## Website-Prelaunch- und Auth-Fluss

### Layer 1: Prelaunch Gate
Server-Pfad in `website/api/prelaunch-gate/login.ts`:

```text
POST /api/prelaunch-gate/login { accessKey }
  -> enforceLoginRateLimit(..., 'prelaunch_gate_login')
  -> loadPrelaunchGateConfig()
  -> ensureCsrfCookie(...)
  -> compare X-CSRF-Token with th_csrf
  -> verifyPrelaunchAccessKey(accessKey, config)
  -> writePrelaunchGateCookie(res, payload, config)
```

`verifyPrelaunchAccessKey(...)` in `website/api/_prelaunchGate.ts` benutzt `crypto.timingSafeEqual(...)` und kein PBKDF2.

Client-Pfad in `website/src/app/providers/PrelaunchGateProvider.tsx`:

```text
mount -> GET /api/prelaunch-gate/me
authorize(accessKey) -> POST /api/prelaunch-gate/login
```

### Layer 2: Owner Auth
Server-Pfad in `website/api/auth/login.ts`:

```text
POST /api/auth/login { username, password }
  -> enforceLoginRateLimit(..., 'owner_login')
  -> requirePrelaunchGate(req, res)
  -> loadOwnerServerConfig()
  -> ensureCsrfCookie(...)
  -> compare X-CSRF-Token with th_csrf
  -> verifyOwnerPassword(password, config)
  -> createOwnerSessionPayload(config)
  -> writeSessionCookie(res, payload, config)
```

`verifyOwnerPassword(...)` in `website/api/_auth.ts` benutzt `crypto.pbkdf2Sync(..., 'sha256')` plus `crypto.timingSafeEqual(...)`.

### Session-Verifikation und Client-State
```text
GET /api/auth/me
  -> requirePrelaunchGate(req, res)
  -> readSessionCookie(req, config)
  -> return BackendAuthMeResponse

AuthProvider mount
  -> backendAuthApi.getCurrentSession()
  -> fetch('/api/auth/me')
  -> createServerBackedSession(response.session)
  -> setSession(AuthSession)
```

`createServerBackedSession(...)` in `website/src/modules/auth/backendSession.ts` mappt `BackendSessionSnapshot` auf `AuthSession`.

`sessionId` und `guardId` werden dabei lokal aus `crypto.randomUUID()` erzeugt und nicht vom Server geliefert.

`createLocalSessionStore()` in `website/src/modules/auth/sessionStore.ts` schreibt absichtlich nichts in `localStorage` oder `sessionStorage`.

## Bekannte Luecken

- `src/tests/ipc-storage-bridge.e2e.test.ts` spezifiziert einen echten Electron-Roundtrip fuer `IpcStorageBridge`. Gleichzeitig fuehrt `agents/project-context/known-issues.md` die IPC-Storage-Verdrahtung weiterhin als nicht abschliessend bestaetigt.
- `src/services/clip-service/clipExporter.node.ts` enthaelt Node-Imports und kann laut Projektkontext das Browser-Bundle brechen, wenn die falsche Datei aufgeloest wird.
- Zwischen Website und Desktop gibt es keinen belegten Datenaustausch, keinen geteilten State und keine API-Bridge.
- Der bereitgestellte Kontext nennt fuer `start()` und `stop()` eine andere Reihenfolge als der aktuelle Code in `src/app/bootstrap.ts`. Fuer Architekturarbeit sollte deshalb die Implementierung hoeher gewichtet werden.
- Der bereitgestellte Kontext nennt den Storage-Pfad `TriggerHub2.0`, waehrend `electron/main.cjs` aktuell `TriggerHub2` verwendet.

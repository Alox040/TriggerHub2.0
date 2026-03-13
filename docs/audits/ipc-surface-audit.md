# IPC Surface Audit

Stand: 2026-03-13

## Scope

Geprueft wurden:

- `electron/main.cjs`
- `electron/preload.cjs`
- `src/app/`
- `src/services/`
- `src/storage/`
- Renderer-Stellen mit `window.triggerHubElectron`

## IPC-Kanaele

### `storage:load`

- Zweck: JSON-basierten Runtime-Zustand aus dem Electron-Main-Prozess laden.
- Main-Handler: `electron/main.cjs`
- Preload-Zugriff: `electron/preload.cjs` via `triggerHubElectron.storage.load(key)`
- Renderer-Aufrufer:
  - `src/storage/ipcStorageBridge.ts`
  - indirekt `src/main.tsx` -> `new IpcStorageBridge()` -> `createAppModuleContainer(storage)`
  - indirekt `src/app/bootstrap.ts` beim Laden von `runtime-config`, Triggern und Makros
- Rueckgabetyp:
  - technisch `Promise<unknown | null>`
  - Renderer-seitig als generisches `Promise<T | null>` modelliert
- Fehlerverhalten:
  - ungültiger Key: Main wirft `Error('Invalid storage key')`
  - Datei fehlt: `electron/jsonFileStorage.cjs` liefert `null`
  - JSON-Parse- oder I/O-Fehler: werden aus dem Main-Handler bis in den Renderer durchgereicht
  - fehlende Bridge im Renderer: `IpcStorageBridge.load()` liefert `null`

### `storage:save`

- Zweck: JSON-basierten Runtime-Zustand im Electron-Main-Prozess speichern.
- Main-Handler: `electron/main.cjs`
- Preload-Zugriff: `electron/preload.cjs` via `triggerHubElectron.storage.save(key, data)`
- Renderer-Aufrufer:
  - `src/storage/ipcStorageBridge.ts`
  - indirekt `src/app/bootstrap.ts` ueber Persistenz von Triggern, Makros und `runtime-config`-Keys
  - indirekt alle Facade-Mutationen, weil `bootstrap.ts` die Persistenz an die Fassade injiziert
- Rueckgabetyp:
  - `Promise<void>`
- Fehlerverhalten:
  - ungültiger Key: Main wirft `Error('Invalid storage key')`
  - I/O-Fehler: werden bis in den Renderer durchgereicht
  - fehlende Bridge im Renderer: `IpcStorageBridge.save()` wird stiller No-Op

### `clip-exporter:export`

- Zweck: Clip-Daten aus dem Renderer ueber den Main-Prozess in das Dateisystem exportieren.
- Main-Handler: `electron/main.cjs`
- Preload-Zugriff: `electron/preload.cjs` via `triggerHubElectron.clipExporter.exportClip(buffer, request)`
- Renderer-Aufrufer:
  - `src/services/clip-service/clipExporter.browser.ts`
  - indirekt `src/services/clip-service/index.ts`
  - indirekt `src/app/bootstrap.ts` ueber die registrierte Action `clip.saveClip`
- Rueckgabetyp:
  - technisch Objekt `{ clipId: string, path: string }`
  - Renderer-seitig als `ClipExportResult`
- Fehlerverhalten:
  - Dateisystemfehler aus `mkdir`/`writeFile` werden bis in den Renderer durchgereicht
  - wenn keine Electron-Bridge verfuegbar ist, faellt `BrowserClipExporter` auf einen In-Memory-Exporter zurueck und nutzt gar kein IPC
  - die Ergebnisform wird nach Rueckkehr im Renderer validiert; ungueltige Payloads fuehren zu `ClipExportValidationError`

## Bridge-Surface

### Exponierte globale API

`electron/preload.cjs` exponiert genau ein globales Objekt:

```ts
window.triggerHubElectron = {
  storage: {
    load(key),
    save(key, data),
  },
  clipExporter: {
    exportClip(buffer, request?),
  },
}
```

### Kopplungspfad

1. Renderer startet in `src/main.tsx`.
2. Dort wird `IpcStorageBridge` erzeugt und an `createAppModuleContainer(...)` uebergeben.
3. `bootstrap.ts` nutzt `StoragePort` fuer Runtime-Persistenz.
4. `ClipService` nutzt fuer Dateiexport `BrowserClipExporter`, der optional auf `window.triggerHubElectron.clipExporter` zugreift.

## Rueckgabetypen und Fehlergrenzen

### Storage

- Main-Rueckgabewerte sind ungetyptes JSON.
- Typisierung entsteht erst im Renderer durch generische `load<T>()`-Aufrufe und nachgelagerte Shape-Pruefung.
- Die Grenze ist damit flexibel, aber nicht streng schema-validiert.

### Clip-Export

- Die Main-Seite schreibt blind den uebergebenen Buffer als JSON-Datei.
- Die eigentliche Ergebnisvalidierung liegt im Renderer.
- Eine inhaltliche Validierung der Export-Request-Struktur findet im Main-Prozess nicht statt.

## Duplikate und unsaubere Kopplungen

- `window.triggerHubElectron` war teilweise doppelt typisiert:
  - `src/types/globalTypes.ts` kannte `storage`
  - `src/services/clip-service/clipExporter.browser.ts` deklarierte `clipExporter` lokal erneut
- Diese Doppelung wurde bereinigt:
  - `src/types/globalTypes.ts` enthaelt jetzt die gemeinsame globale Bridge-Form
  - `clipExporter.browser.ts` nutzt diese globale Typdefinition
- `electron/main.cjs` hatte fuer Storage bereits eine Idempotenz-Sicherung bei Handler-Registrierung, fuer `clip-exporter:export` aber nicht.
- Diese Asymmetrie wurde bereinigt:
  - der Clip-Export-Handler ist jetzt ebenfalls idempotent registriert

## Risiken fuer spaetere Erweiterungen

- Es gibt keine gemeinsame, zentral versionierte IPC-Kanaldefinition. Kanalnamen sind derzeit String-Literale in Main und Preload.
- `storage:load` und `storage:save` arbeiten mit offenem JSON ohne schema-basierte Validierung; bei wachsender Datenmenge steigen Risiko und Debug-Aufwand fuer Shape-Drift.
- Die Renderer-Seite kennt Fallback-Verhalten, das Main-seitige Nichtverfuegbarkeit still kaschiert:
  - Storage wird ohne Bridge zu `null`/No-Op
  - Clip-Export faellt auf In-Memory-Pfade zurueck
  - Das ist robust fuer Browser-/Testkontexte, kann aber echte Desktop-Fehlkonfigurationen spaet sichtbar machen.
- `clip-exporter:export` akzeptiert derzeit einen generischen Buffer plus optionales Request-Objekt ohne Main-seitige Guard-Validierung.
- `bootstrap.ts` bleibt bewusst der Orchestrierungspunkt fuer Runtime, Persistenz und Service-Actions. Das ist aktuell handhabbar, vergroessert aber die Kopplung zwischen App-Runtime und nativer Surface.

## Refactor-Empfehlung

### Prioritaet A

- Zentrale IPC-Konstanten und gemeinsame Bridge-Typen konsolidieren.
- Begründung: reduziert String-Drift zwischen `main.cjs`, `preload.cjs` und Renderer-Wrappern bei minimalem Risiko.

### Prioritaet B

- Storage-Payloads fuer `runtime-config`, Trigger und Makros mit kleinen Runtime-Guards an der IPC-Nutzungsgrenze absichern.
- Begründung: Fehler werden frueher lokalisiert, ohne das Persistenzmodell zu aendern.

### Prioritaet C

- Optionalen Desktop-Strict-Mode fuer native Fallbacks einfuehren.
- Begründung: Browser-/Testfaelle koennen weiter tolerant bleiben, waehrend echte Desktop-Fehlkonfigurationen deutlicher sichtbar werden.

## Direkt umgesetzte Low-Risk-Aufraeumarbeiten

- `electron/main.cjs`
  - idempotente Registrierung fuer `clip-exporter:export` ergaenzt
- `src/types/globalTypes.ts`
  - globale Bridge-Typen fuer `clipExporter` ergaenzt
- `src/services/clip-service/clipExporter.browser.ts`
  - lokale Doppeltypisierung fuer `window.triggerHubElectron` entfernt

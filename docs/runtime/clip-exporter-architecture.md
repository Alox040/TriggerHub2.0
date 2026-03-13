# Clip Exporter Architecture

Date: 2026-03-11
Responsible agents:
- `30-runtime-architecture-agent`
- `20-build-system-agent`

## Goal

Enforce a strict runtime split for clip exporting so that:

- browser code depends only on browser-safe clip exporter code
- Node/Electron code depends only on Node runtime exporter code
- the shared contract is runtime-neutral
- no Node-only modules leak into browser bundles

## Final Structure

Canonical files:

- [clipExporter.browser.ts](/E:/Programmierung/TriggerHub2.0/src/services/clip-service/clipExporter.browser.ts)
- [clipExporter.node.ts](/E:/Programmierung/TriggerHub2.0/src/services/clip-service/clipExporter.node.ts)
- [clipExporter.interface.ts](/E:/Programmierung/TriggerHub2.0/src/services/clip-service/clipExporter.interface.ts)

Supporting files:

- [clipExporter.shared.ts](/E:/Programmierung/TriggerHub2.0/src/services/clip-service/clipExporter.shared.ts)
- [clipProcessor.ts](/E:/Programmierung/TriggerHub2.0/src/services/clip-service/clipProcessor.ts)
- [index.ts](/E:/Programmierung/TriggerHub2.0/src/services/clip-service/index.ts)

Compatibility shim:

- [contracts.ts](/E:/Programmierung/TriggerHub2.0/src/services/clip-service/contracts.ts)
  This now re-exports the interface contract only, so older imports do not break.

Removed mixed wrapper entrypoints:

- `src/services/clip-service/browser.ts`
- `src/services/clip-service/node.ts`
- `src/services/clip-service/clipExporter.ts`

## Runtime Split

### Browser runtime

[clipExporter.browser.ts](/E:/Programmierung/TriggerHub2.0/src/services/clip-service/clipExporter.browser.ts):

- imports no Node built-ins
- provides `InMemoryClipExporter`
- provides `BrowserClipExporter`
- can optionally call `window.triggerHubElectron.clipExporter` through the preload bridge when running inside Electron renderer
- falls back to in-memory export behavior when Electron is unavailable

This is the runtime path used by [index.ts](/E:/Programmierung/TriggerHub2.0/src/services/clip-service/index.ts), which is what the browser-facing service layer exports.

### Node runtime

[clipExporter.node.ts](/E:/Programmierung/TriggerHub2.0/src/services/clip-service/clipExporter.node.ts):

- imports `node:fs/promises`
- imports `node:path`
- provides `FileSystemClipExporter`
- writes the exported clip payload to disk

This file is Node-only and is imported explicitly by Node-side tests and Node-side integration code.

### Shared contract

[clipExporter.interface.ts](/E:/Programmierung/TriggerHub2.0/src/services/clip-service/clipExporter.interface.ts):

- defines `ClipExporter`
- defines `ClipExportResult`
- defines `ClipExportValidationError`
- defines `isClipExportResult`

[clipExporter.shared.ts](/E:/Programmierung/TriggerHub2.0/src/services/clip-service/clipExporter.shared.ts) performs validation without importing either runtime implementation.

## Build Resolution

### Root browser build

The root browser build uses [index.ts](/E:/Programmierung/TriggerHub2.0/src/services/clip-service/index.ts), which imports:

- `./clipExporter.browser`
- `./clipExporter.interface`
- `./clipProcessor`

It does not import `clipExporter.node.ts`.

Result:

- browser build resolves to the browser exporter
- Node built-ins are not part of the clip-service browser path

### Electron build

Electron main-process clip export handling is now isolated in:

- [clipExporter.node.cjs](/E:/Programmierung/TriggerHub2.0/electron/clipExporter.node.cjs)
- [main.cjs](/E:/Programmierung/TriggerHub2.0/electron/main.cjs)

[main.cjs](/E:/Programmierung/TriggerHub2.0/electron/main.cjs) no longer contains inline mixed export logic. It delegates file exporting to the Node-only helper module, which mirrors the Node runtime behavior.

Result:

- Electron main process uses a Node-only exporter path
- renderer/browser code remains separate from filesystem code

### Website build

The website app under `website/` does not import `src/services/clip-service`.

Result:

- website build does not include clip exporter runtime code
- there is no Node clip exporter leakage into the website bundle

## Verification

Commands run:

```bash
npm run typecheck
npm run test -- services
npm run build
npm --prefix website run build
```

Results:

- `typecheck`: passed
- `services` tests: passed
- root browser build: passed
- website build: passed

Bundle leakage check:

```bash
rg -n "node:fs|node:path|fs/promises|writeFile\\(|mkdir\\(|clipExporter\\.node|clipExporter\\.node\\.cjs" dist website/dist
```

Result:

- no matches

## Architectural Notes

1. The browser exporter is allowed to talk to Electron only through the preload-exposed bridge. That is still a browser-safe dependency because it uses `window.triggerHubElectron`, not direct Node APIs.
2. The Node exporter remains explicit and opt-in. Any future direct import of `clipExporter.node.ts` into browser-facing code should be treated as a regression.
3. `contracts.ts` remains as a compatibility shim only. New code should prefer `clipExporter.interface.ts`.

## Recommendation

For future runtime-specific modules, follow the same pattern:

- `*.browser.ts` for browser-safe implementation
- `*.node.ts` for Node-only implementation
- `*.interface.ts` for shared contracts
- `*.shared.ts` only when logic is runtime-neutral

# NEXT STEPS ROADMAP — TriggerHub 2.0
> Generated: 2026-03-10 | Updated: 2026-03-17 — Priority 1 complete, Priority 3 partially complete

---

## DEVELOPMENT PRIORITIES

### PRIORITY 1 — Connect UI to Backend (CRITICAL)
**Status:** ✅ COMPLETE (2026-03-10)
**Addresses:** RISK-01 (UI Disconnected) — RESOLVED

All tasks delivered:
1. ✅ `src/app/AppContext.tsx` — `AppProvider`, `useAppContext()`, `useAppFacade()`
2. ✅ `src/main.tsx` — calls `createAppModuleContainer()` + `container.start()`; renders inside `<AppProvider>`
3. ✅ `src/App.tsx` — loads from `facade.getDashboardState()`; fires `facade.executeTrigger()`; subscribes to `trigger:executed` + `macro:completed`; loading/error states
4. ✅ `src/ui/components/StatusBar.tsx` — real connection data; fake metrics removed
5. ✅ Tests updated: `ui-dashboard.test.tsx`, new `app-context.test.tsx`, updated `app-facade.test.ts`

**Residual items (not blocking, tracked in TECH_DEBT_AND_RISKS RISK-01):**
- TriggerEngine/MacroRunner do not yet publish `trigger:executed`/`macro:completed` events
- Trigger card active state does not update on click (no enable/disable on facade)
- Trigger error replaces full dashboard (no inline notification)

---

### PRIORITY 2 — Electron IPC Bridge (CRITICAL)
**Status:** NOT STARTED
**Addresses:** RISK-02 (No Electron IPC)
**Impact:** Enables hotkeys, window control, file system, auto-update

**Tasks:**
1. Create `electron/preload.cjs`:
   ```js
   const { contextBridge, ipcRenderer } = require('electron')
   contextBridge.exposeInMainWorld('electronAPI', {
     onUpdateAvailable: (cb) => ipcRenderer.on('update-available', cb),
     toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
     // ... more handlers
   })
   ```
2. Update `electron/main.cjs`: add `preload` to BrowserWindow `webPreferences`
3. Register IPC handlers in `main.cjs`: `ipcMain.handle('toggle-fullscreen', ...)`
4. Update `HotkeyManager` to call `electronAPI.toggleFullscreen()` via IPC
5. Add TypeScript types for `window.electronAPI` in `src/types/globalTypes.ts`

**Files to modify:**
- NEW: `electron/preload.cjs`
- `electron/main.cjs` — add preload + IPC handlers
- `src/core/app-control/hotkeyManager.ts` — real IPC calls
- `src/core/app-control/windowManager.ts` — real IPC calls
- `src/types/globalTypes.ts` — ElectronAPI type

---

### PRIORITY 3 — CI/CD Pipeline (HIGH)
**Status:** ✅ PARTIALLY COMPLETE (2026-03-17)
**Addresses:** RISK-04 (No CI/CD) — PARTIALLY RESOLVED
**Impact:** Quality gate; prevents regressions; enables automated releases

**Completed:**
1. ✅ `.github/workflows/ci-quality.yml` created
   - Quality Gate with typecheck, tests, build
   - Separate jobs for Core and Website
   - Triggers: push to main/develop/release branches, PRs, workflow_dispatch
2. ✅ `.github/workflows/release.yml` exists and enhanced
   - Full validation pipeline
   - Desktop artifact builds (Windows installer + portable)
   - GitHub Release publishing
   - Vercel deployment hook

**Residual tasks:**
- ⚠️ Consider adding CI runs on all feature branches (currently only main/develop/release/**)
- ✅ Release pipeline is comprehensive and production-ready

---

### PRIORITY 4 — Add Error Boundary (HIGH, Low Effort)
**Status:** NOT STARTED
**Addresses:** RISK-07 (No Error Boundary)
**Impact:** Prevents blank-screen crashes; improves UX stability

**Tasks:**
1. Create `src/ui/components/ErrorBoundary.tsx` (class component)
2. Wrap `<App />` in `src/main.tsx` with `<ErrorBoundary>`
3. Design fallback UI with "Reload" button

**Files to modify:**
- NEW: `src/ui/components/ErrorBoundary.tsx`
- `src/main.tsx` — wrap with ErrorBoundary

---

### PRIORITY 5 — Real OBS Integration (HIGH)
**Status:** NOT STARTED (HTTP transport exists but not connected to real OBS)
**Addresses:** RISK-03 (No Real Services)
**Impact:** Core value proposition — stream control

**Tasks:**
1. Install `obs-websocket-js`: `npm install obs-websocket-js`
2. Create `ObsWebSocketTransport` in `src/services/obs-service/obsWebSocketClient.ts`
3. Add OBS settings to app config (host, port, password)
4. Activate WebSocket transport based on config in `bootstrap.ts`
5. Map obs-websocket events to EventBus topics
6. Test: switch scene from TriggerHub → verify OBS responds

**Files to create/modify:**
- NEW: `src/services/obs-service/obsWebSocketClient.ts`
- `src/services/obs-service/index.ts` — add WebSocket transport option
- `src/app/bootstrap.ts` — select transport from config
- `src/config/index.ts` — add OBS settings schema

---

### PRIORITY 6 — Persistent State (HIGH)
**Status:** NOT STARTED
**Addresses:** RISK-09 (No Persistence)
**Impact:** Users can save and restore their automation setups

**Tasks:**
1. Choose storage: Electron `app.getPath('userData')` + JSON files
2. Create `src/services/persistence/persistenceService.ts`
3. Save/load: triggers, macros, plugin configs, user settings
4. Call load at bootstrap (before engine initialization)
5. Save on mutations (trigger registered, macro added, etc.) via EventBus subscription

**Files to create:**
- NEW: `src/services/persistence/persistenceService.ts`
- `src/app/bootstrap.ts` — load persisted state at startup

---

### PRIORITY 7 — Editor Page Implementation (MEDIUM)
**Status:** SCAFFOLD
**Impact:** Users can create and edit triggers/macros via UI

**Tasks:**
1. Design trigger editor form (id, name, event, conditions, actions)
2. Design macro editor (steps: delay, service_call, conditional, etc.)
3. Implement form validation matching engine invariants
4. Connect to `facade.executeTrigger()` for preview/test
5. Connect to `triggerEngine.registerTrigger()` for save
6. Connect to `macroEngine.registerMacro()` for save

**Files to modify:**
- `src/ui/pages/Editor.tsx` — full implementation

---

### PRIORITY 8 — Auto-Update (HIGH)
**Status:** PLANNED (agent prompt exists)
**Addresses:** RISK-05 (No Auto-Update)
**Impact:** Users receive updates seamlessly

**Tasks:**
1. Install `electron-updater`: `npm install electron-updater`
2. Configure update server (GitHub Releases)
3. Add auto-updater to `electron/main.cjs`
4. Add IPC events: update-available, update-downloaded, install-update
5. Add update notification component to UI
6. Set up update channels in electron-builder config

---

### PRIORITY 9 — Spotify Integration (MEDIUM)
**Status:** Transport exists, no OAuth
**Addresses:** RISK-03 (No Real Services)

**Tasks:**
1. Register app at Spotify Developer Portal
2. Implement OAuth 2.0 PKCE flow via Electron protocol handler
3. Store access/refresh tokens via Electron keytar or safeStorage
4. Create `SpotifyOAuthTransport` using official Spotify Web API
5. Map Spotify events to EventBus (track changed, playback state)

---

### PRIORITY 10 — Electron Security Hardening (MEDIUM)
**Status:** NOT STARTED
**Addresses:** RISK-14 (Electron Security)

**Tasks:**
1. Audit `electron/main.cjs` — ensure `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`
2. Add Content Security Policy header
3. Add `webSecurity: true`
4. Run Security Audit Agent

---

## PHASE PLAN

| Phase | Tasks | Outcome |
|-------|-------|---------|
| **Phase 3** | ~~Priority 1 (UI connect)~~ ✅ + Priority 2 (IPC) + Priority 3 (CI) | App is functional, testable, integrated |
| **Phase 4** | Priority 4 (Error boundary) + Priority 5 (OBS) + Priority 6 (Persistence) | Real stream control, persistent config |
| **Phase 5** | Priority 7 (Editor) + Priority 8 (Auto-update) + Priority 10 (Security) | Full UX, production-ready |
| **Phase 6** | Priority 9 (Spotify) + Plugin ecosystem + Marketplace | Creator automation platform |

---

## QUICK WINS (Do These First — Low Effort, High Impact)

1. **Error Boundary** — 1 new file, 1 line change in main.tsx. Prevents blank screen crashes.
2. **CI Workflow** — 1 new YAML file. Catches regressions on every commit.
3. **AppContext Setup** — Wire bootstrap → React context. Makes the entire engine accessible to UI.
4. **electron/preload.cjs** — 1 new file, 1 BrowserWindow option. Enables all IPC communication.

~~AppContext Setup~~ — ✅ done. Remaining quick wins: **Error Boundary**, **CI Workflow**, **electron/preload.cjs**.

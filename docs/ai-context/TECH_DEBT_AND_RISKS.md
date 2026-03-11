# TECH DEBT AND RISKS — TriggerHub 2.0
> Generated: 2026-03-10 | Updated: 2026-03-10 — RISK-01 resolved

Risks ranked by severity: CRITICAL | HIGH | MEDIUM | LOW

---

## CRITICAL RISKS

### RISK-01 — UI Completely Disconnected from Backend
**Severity:** ~~CRITICAL~~ **RESOLVED** (2026-03-10)
**Type:** Architecture Gap

**Resolution:** Phase 1 UI integration complete.
- `src/app/AppContext.tsx` — `AppProvider`, `useAppContext()`, `useAppFacade()` implemented
- `src/main.tsx` — calls `createAppModuleContainer()` + `container.start()`; wraps `<App />` in `<AppProvider>`
- `src/App.tsx` — loads real data via `facade.getDashboardState()` on mount; fires `facade.executeTrigger()` on trigger click; subscribes to EventBus for refresh; has loading/error states
- `src/ui/components/StatusBar.tsx` — shows real service connection state; fake metric fields removed

**Residual gaps (not blocking):**
- `trigger:executed` and `macro:completed` events not yet published by TriggerEngine/MacroRunner — EventBus subscriptions are wired but inert
- Trigger `active` visual does not reflect execution (no enable/disable on facade)
- Trigger execution error replaces full dashboard view (no inline error state)

---

### RISK-02 — No Electron IPC Bridge
**Severity:** CRITICAL
**Type:** Integration Gap

The Electron main process and the React renderer have no communication channel. No `preload.cjs` or `contextBridge` configured.

**Impact:**
- Hotkeys (HotkeyManager) cannot actually control the window
- Window operations (WindowManager) cannot trigger real Electron APIs
- File system operations not accessible from renderer
- System tray cannot be implemented
- Auto-update notifications cannot be displayed

**Fix Required:**
1. Create `electron/preload.cjs` with `contextBridge.exposeInMainWorld()`
2. Add `webPreferences: { preload: ... }` to BrowserWindow creation
3. Register IPC handlers in `main.cjs` for: hotkeys, window control, update events
4. Consume exposed APIs in renderer via `window.electronAPI.*`

---

## HIGH RISKS

### RISK-03 — No Real Service Connections
**Severity:** HIGH
**Type:** Integration Gap

All services (OBS, Spotify, Clip) use InMemory transports that simulate behavior. HTTP transports are implemented but not activated. No real external service integration works.

**Impact:** The app cannot actually control OBS, play/pause Spotify, or capture clips.

**Details:**
- OBS: Uses `InMemoryObsTransport` — no OBS WebSocket connection
- Spotify: Uses `InMemorySpotifyTransport` — no Spotify OAuth / API
- Clip: `ClipProcessor` has no real screen capture (no `desktopCapturer` from Electron)

**Fix Required:**
1. OBS: Integrate `obs-websocket-js` library, configure WebSocket URL in settings
2. Spotify: Implement OAuth 2.0 PKCE flow, store tokens securely (use Electron keystore)
3. Clip: Use Electron `desktopCapturer` API via IPC from renderer
4. Switch transport selection based on config/env in `bootstrap.ts`

---

### RISK-04 — No CI/CD Pipeline
**Severity:** HIGH
**Type:** Operational Risk

Only one GitHub Actions workflow exists: website sync. No automated build, test, or release pipeline.

**Impact:**
- Bugs can reach releases undetected
- Manual builds are error-prone and inconsistent
- No automated artifact publishing

**Fix Required:**
Add `.github/workflows/ci.yml`:
```yaml
on: [push, pull_request]
jobs:
  ci:
    steps:
      - npm ci
      - npm run typecheck
      - npm run test
      - npm run build
```

Add `.github/workflows/release.yml` for automated Windows installer builds.

---

### RISK-05 — No Auto-Update Mechanism
**Severity:** HIGH
**Type:** Release Risk

`electron-updater` is not installed. Users have no way to receive app updates without manually downloading a new installer.

**Impact:** Every update requires users to download and reinstall manually. This severely limits adoption and trust.

**Fix Required:**
1. Install `electron-updater`
2. Configure update server URL (GitHub Releases or self-hosted)
3. Add IPC handler for update events (checking, downloading, ready to install)
4. Add update notification UI component
5. Handle update channels (stable/beta)

---

## MEDIUM RISKS

### RISK-06 — Legacy Module Pollution
**Severity:** MEDIUM
**Type:** Technical Debt

5 legacy folders from v1 exist alongside new architecture:
- `src/deck-engine/`
- `src/event-bus/` (superseded by `src/core/event-bus/`)
- `src/plugin-system/` (superseded by `src/plugins/`)
- `src/profiles/`
- `src/store/`

**Impact:**
- Cognitive overhead for developers
- Risk of accidentally importing from legacy modules instead of new ones
- TypeScript compilation includes these files (potential type conflicts)

**Note:** Preserved intentionally per ADR-003. Safe to remove in Phase 3+.

**Fix (Phase 3):**
- Audit legacy folders for any unique logic not yet migrated
- Migrate needed logic
- Delete legacy folders
- Update import paths

---

### RISK-07 — No Error Boundary in UI
**Severity:** MEDIUM
**Type:** Stability Risk

React UI has no error boundaries. If any component throws during render, the entire app crashes with a blank screen.

**Fix Required:**
Add `<ErrorBoundary>` wrapper in `main.tsx` or `App.tsx` with user-friendly fallback UI.

---

### RISK-08 — ActionRegistry Not Fully Wired
**Severity:** MEDIUM
**Type:** Integration Gap

`PluginContext` includes `actionRegistry: ActionRegistryPort`, but the `ActionRegistryPort` interface is not fully implemented in the DI container. Plugins that try to register custom actions will fail.

**Fix Required:**
Implement and wire `ActionRegistry` in `bootstrap.ts`, make it available in `PluginContext`.

---

### RISK-09 — No Persistent State
**Severity:** MEDIUM
**Type:** Feature Gap

All state (triggers, macros, plugin config) is in-memory only. Restarting the app loses all user configuration.

**Impact:** Users cannot persist their automation setups between sessions.

**Fix Required:**
1. Choose persistence strategy: JSON files via Electron's `userData`, or SQLite
2. Add persistence layer to TriggerGraph and MacroEngine
3. Load state from disk at bootstrap
4. Save state on changes (event-driven or periodic flush)

---

### RISK-10 — Design System Import Gap
**Severity:** MEDIUM
**Type:** Maintenance Risk

The design system (`design/`) is a separate Vite project with 60+ shadcn/ui components. The main app's `src/ui/` has its own simpler components. Components must be manually copied/adapted between projects — there is no shared package or build process.

**Impact:** UI inconsistencies will grow over time as both evolve independently.

**Fix Required:**
Either:
- Make `design/` an npm workspace package importable by root
- OR establish a copy convention with explicit "synced from design/" comments

---

## LOW RISKS

### RISK-11 — HotkeyManager / WindowManager Stubs
**Severity:** LOW (for now — HIGH when users expect hotkeys)
**Type:** Incomplete Feature

`HotkeyManager` and `WindowManager` in `src/core/app-control/` are stubs. No real hotkey registration or window operations happen.

**Fix:** Implement via Electron IPC once RISK-02 is resolved.

---

### RISK-12 — No Clip Export Testing
**Severity:** LOW
**Type:** Quality Risk

`ClipExporter` has only basic implementation with no real test coverage. Clip saving behavior is untested.

---

### RISK-13 — No Coverage Configuration
**Severity:** LOW
**Type:** Quality Risk

`vitest.config.ts` has coverage disabled. No test coverage metrics available.

**Fix:** Enable coverage with V8 provider, set thresholds.

---

### RISK-14 — Electron Security Defaults Not Audited
**Severity:** LOW (escalates if app accesses sensitive data)
**Type:** Security Risk

`electron/main.cjs` creates BrowserWindow without explicit security configuration. Default settings may allow:
- `nodeIntegration` if not explicitly disabled
- Missing CSP headers
- No `sandbox` mode

**Fix:** Run Security Audit Agent. Add explicit `webSecurity: true`, `nodeIntegration: false`, `contextIsolation: true` to BrowserWindow options.

---

## TECHNICAL DEBT SUMMARY TABLE

| Risk | Severity | Effort | Priority |
|------|----------|--------|---------|
| RISK-01 UI Disconnected | ~~CRITICAL~~ RESOLVED | — | — |
| RISK-02 No Electron IPC | CRITICAL | Medium | 2nd |
| RISK-03 No Real Services | HIGH | High | 3rd |
| RISK-04 No CI/CD | HIGH | Low | 4th |
| RISK-05 No Auto-Update | HIGH | High | 5th |
| RISK-06 Legacy Folders | MEDIUM | Low | 6th |
| RISK-07 No Error Boundary | MEDIUM | Low | 7th |
| RISK-08 ActionRegistry | MEDIUM | Low | 8th |
| RISK-09 No Persistence | MEDIUM | High | 9th |
| RISK-10 Design Import Gap | MEDIUM | Medium | 10th |
| RISK-11 HotkeyManager Stub | LOW | Low | After IPC |
| RISK-12 Clip Export | LOW | Low | Later |
| RISK-13 No Coverage | LOW | Low | Anytime |
| RISK-14 Electron Security | LOW | Low | Before release |

# TriggerHub — Rewrite Plan

> Purpose: Phased roadmap for rebuilding TriggerHub v2 in a new repository.
> Based on analysis of v1.0.4 source code.

---

## 1. Why Rewrite

### Pain Points in v1

| Issue | Impact |
|---|---|
| `connect()` and `startAutoReconnect()` are ~160 lines of duplicated code | Bugs fixed in one are silently missed in the other |
| Single 2000-line CSS file | Every style change is a hunt; no component isolation |
| No test coverage | Regressions go undetected; refactoring is risky |
| `panelRegistry.ts` + `BasePanel.tsx` are dead code | Abandoned extension point, misleading |
| SE.Live has no reconnect | Worse UX than OBS connection |
| No error boundaries | One bad render kills the entire app |
| Mixed German/English in code + UI | Inconsistent codebase; hard to open-source or collaborate |
| Manual `fs.writeFileSync` for userData persistence | Brittle, no atomic writes, no schema migration |
| No data migration path for localStorage | Silent data loss on schema changes |

### What to Preserve

- **Architecture** — 3-process Electron model is correct and well-implemented
- **BroadcastChannel pattern** — elegant cross-window sync; keep as-is
- **CSS variables theme system** — works beautifully, real-time application, keep the pattern
- **useOBS structure** — useReducer + polling + event-driven is the right approach; just deduplicate
- **Dockview** — the best available docking solution for Electron/React; keep
- **IPC design** — contextIsolation + contextBridge is correct; keep the same channel structure
- **User soundboard** — feature-complete and well-designed; port directly
- **Auto-updater flow** — manual confirm pattern is correct for a streaming tool

---

## 2. Recommended Stack Changes

| Concern | Old | New | Reason |
|---|---|---|---|
| OBS state | `useReducer` | **Zustand** | Simpler syntax, DevTools, easier to split slices |
| CSS organization | Single `index.css` | **CSS Modules** | Component-scoped, eliminates cascade conflicts |
| Persistence (userData) | `fs.readFileSync/writeFileSync` | **electron-store** | Atomic writes, schema migration, typed |
| Testing | None | **Vitest + @testing-library/react** | Fast, Vite-native, covers hooks and components |
| Linting | None configured | **ESLint + typescript-eslint** | Catch the suppressions, enforce conventions |
| Error handling | None | **React ErrorBoundary** | Isolate panel crashes |

**Keep unchanged:**
- Electron 31+, electron-vite, electron-builder
- React 18, TypeScript 5.5+
- Dockview 5
- obs-websocket-js 5
- electron-updater
- BroadcastChannel API pattern
- CSS custom properties for theme variables

---

## 3. Target Folder Structure

```
src/
├── main/
│   ├── index.ts              # App bootstrap, window creation, updater setup
│   ├── ipc/
│   │   ├── window.ts         # move-to-secondary, fullscreen, display-count, blur
│   │   ├── sounds.ts         # All sound-* handlers
│   │   ├── panels.ts         # open/close/resize panel windows
│   │   ├── twitch.ts         # get-twitch-viewers proxy
│   │   └── updater.ts        # check/download/install-update
│   └── store.ts              # electron-store setup (panel bounds)
│
├── preload/
│   ├── index.ts              # contextBridge (unchanged from v1)
│   └── index.d.ts            # window.electronAPI types
│
└── renderer/
    ├── index.html
    └── src/
        ├── main.tsx           # Entry: detect main vs popout mode
        ├── App.tsx            # Root: OBS connection orchestration
        │
        ├── store/             # Zustand stores
        │   ├── obsStore.ts    # OBS state + actions (replaces useOBS reducer)
        │   ├── layoutStore.ts # Docking layout + profiles
        │   └── themeStore.ts  # Theme + accent + custom palettes
        │
        ├── obs/
        │   ├── client.ts      # OBSWebSocket singleton
        │   ├── connect.ts     # doConnect(params) — shared connect logic
        │   ├── reconnect.ts   # Auto-reconnect logic
        │   └── types.ts       # Scene, AudioInput, OBSStats, SceneItem
        │
        ├── components/        # All UI components (same as v1, CSS Modules)
        │   ├── ConnectionPanel/
        │   │   ├── index.tsx
        │   │   └── styles.module.css
        │   ├── Header/
        │   ├── StreamControl/
        │   ├── SceneGrid/
        │   ├── SourcePanel/
        │   ├── StatsBar/
        │   ├── AudioMixer/
        │   ├── Soundboard/
        │   ├── UserSoundboard/
        │   ├── SettingsPanel/
        │   ├── UpdateNotification/
        │   └── Toast/
        │
        ├── layout/            # Docking system (same as v1)
        │   ├── types.ts
        │   ├── DockingWorkspace.tsx
        │   ├── PanelPopout.tsx
        │   └── useBroadcast.ts
        │
        ├── themes/
        │   ├── ThemeContext.tsx
        │   ├── registry.ts
        │   ├── apply.ts       # applyTheme(palette, accent) → CSS vars
        │   └── palettes/
        │
        ├── hooks/
        │   ├── useTwitch.ts   # Unchanged
        │   ├── useSELive.ts   # + reconnect logic
        │   ├── useToast.ts    # Unchanged
        │   └── useUserSounds.ts # Unchanged
        │
        ├── errors/
        │   └── PanelErrorBoundary.tsx
        │
        └── styles/
            └── global.css     # Only resets + CSS vars baseline (minimal)
```

---

## 4. Critical Fix: useOBS Deduplication

The single most important refactor. Extract shared logic:

```typescript
// obs/connect.ts
export async function doConnect(
  obsClient: OBSWebSocket,
  host: string,
  port: number,
  password: string
): Promise<ConnectedPayload> {
  await obsClient.connect(`ws://${host}:${port}`, password || undefined)

  const [sceneList, streamRes, recordRes, specialInputs, replayRes, replaySettings, vcamRes] =
    await Promise.all([...])

  // ... shared initialization logic ...
  return { scenes, currentScene, sceneItems, audioInputs, streaming, ... }
}

// obsStore.ts
const connect = async (host, port, password) => {
  set({ status: 'connecting' })
  try {
    const payload = await doConnect(obsClient, host, port, password)
    set({ status: 'connected', ...payload })
    startPolling()
  } catch (err) {
    set({ status: 'disconnected', error: err.message })
  }
}

const startAutoReconnect = (attempt = 1) => {
  if (attempt > 5) { set({ status: 'disconnected', error: '...' }); return }
  set({ status: 'reconnecting', reconnectAttempt: attempt })

  const delay = Math.min(1000 * 2 ** (attempt - 1), 16000)
  setTimeout(async () => {
    try {
      const payload = await doConnect(obsClient, ...lastParams)
      set({ status: 'connected', ...payload })
      startPolling()
    } catch {
      startAutoReconnect(attempt + 1)  // same path, zero duplication
    }
  }, delay)
}
```

---

## 5. Phased Rebuild Roadmap

### Phase 1 — Foundation (Days 1–3)

**Goal:** Working Electron app, IPC skeleton, OBS connection.

- [ ] `npx create-electron-vite@latest triggerhub-v2 --template react-ts`
- [ ] Configure `tsconfig`, `eslint` with typescript-eslint
- [ ] Install: `zustand`, `electron-store`, `obs-websocket-js`, `electron-updater`
- [ ] Implement `electron-store` instance in main (panel bounds)
- [ ] Implement all IPC handlers (copy + refactor from v1, split into `ipc/` modules)
- [ ] Implement `preload/index.ts` (identical to v1)
- [ ] Implement `obs/client.ts` + `obs/connect.ts` (deduplicated connect logic)
- [ ] Implement `obsStore.ts` with Zustand (connect, reconnect, disconnect, all actions)
- [ ] Verify: connect to OBS, scene list loads, polling works

**Test:** Connect to OBS, switch scenes, verify state updates.

---

### Phase 2 — Core Panels (Days 4–7)

**Goal:** Main workspace with primary controls functional.

- [ ] `App.tsx` — connection state routing, toast system
- [ ] `ConnectionPanel` — port from v1 with CSS Modules
- [ ] `Header` — port from v1
- [ ] `StreamControl` — port from v1 (stream/record/replay/clip)
- [ ] `SceneGrid` — port from v1 (OBS + TikTok variant)
- [ ] `SourcePanel` — port from v1
- [ ] Reconnect overlay

**Test:** Full stream start/stop flow, scene switching, source toggling.

---

### Phase 3 — Audio & Sounds (Days 8–10)

**Goal:** Audio mixer and both soundboards working.

- [ ] `AudioMixer` — port from v1
- [ ] `Soundboard` (built-in) — port from v1, copy MP3 files
- [ ] `useUserSounds` hook — port from v1
- [ ] IPC sound handlers (`ipc/sounds.ts`) — port from v1
- [ ] `UserSoundboard` — port from v1 (import, manage, play views)

**Test:** Play built-in sounds, import custom sound, categorize, search, drag-reorder.

---

### Phase 4 — Stats & Integrations (Days 11–12)

**Goal:** Stats panel, Twitch, SE.Live.

- [ ] `StatsBar` — port from v1
- [ ] Proactive warnings in App.tsx — port from v1
- [ ] `useTwitch` — port unchanged from v1
- [ ] Twitch IPC handler — port from v1
- [ ] `useSELive` — port + **add reconnect logic** (fix v1 bug)
- [ ] SE.Live panel integration in App.tsx

**Test:** Verify CPU/FPS/disk display, Twitch viewer count, SE.Live scene switch.

---

### Phase 5 — Layout System (Days 13–15)

**Goal:** Dockable workspace with profiles and popout windows.

- [ ] Install `dockview`
- [ ] `DockingWorkspace` — port from v1
- [ ] `layoutStore.ts` with Zustand + localStorage persistence
- [ ] Workspace profiles (save/delete/switch)
- [ ] `PanelPopout` — port from v1
- [ ] `useBroadcast.ts` — port BroadcastChannel hooks from v1
- [ ] Panel window bounds IPC — port from v1 (now via electron-store)

**Test:** Rearrange panels, save profile, open popout window, verify state sync.

---

### Phase 6 — Theme System (Days 16–17)

**Goal:** Full theme system with custom editor.

- [ ] `themes/apply.ts` — CSS variable application
- [ ] Port all 5 built-in palettes
- [ ] `themeStore.ts` — active palette, accent, custom themes
- [ ] `ThemeContext.tsx` — port from v1
- [ ] `SettingsPanel` — Design/System/Panels tabs
- [ ] `PaletteEditor` — custom theme modal
- [ ] `ThemePreviewStrip`
- [ ] Auto-theme (OS dark/light)
- [ ] Import/Export JSON

**Test:** Switch themes, create custom, export/import, verify live preview.

---

### Phase 7 — Polish & Release (Days 18–21)

**Goal:** Production-ready app.

- [ ] `UpdateNotification` — port from v1
- [ ] Auto-updater IPC — port from v1
- [ ] `PanelErrorBoundary` — new, wraps each docked panel
- [ ] Toast system — port from v1
- [ ] Configure `electron-builder` (NSIS + portable, GitHub publish)
- [ ] Write Vitest tests for:
  - `obs/connect.ts` (mock OBSWebSocket)
  - `obsStore.ts` (state transitions)
  - `useUserSounds` (CRUD operations)
  - `layoutStore.ts` (profile management)
- [ ] Audit all `eslint-disable` suppressions
- [ ] Test full release pipeline (build, package, installer)

---

## 6. Migration Notes

### User Data Compatibility

If the rewrite needs to preserve existing user data:
- **User sounds**: `userData/user-sounds/` directory — copy as-is, filenames unchanged
- **User sounds metadata**: `userData/user-sounds-meta.json` — same schema, compatible
- **Panel bounds**: `userData/panel-bounds.json` — same schema, compatible
- **localStorage data**: Not automatically migrated (new app origin) — user must reconfigure

### Breaking Changes to Accept

1. OBS password must be re-entered (same as v1 — not stored)
2. Workspace layout profiles are reset (different localStorage key)
3. Custom themes need to be re-imported (or manually migrate localStorage)

### Not Changing

- App ID: `com.triggerhub.app`
- GitHub publish config: owner `Alox040`, repo `Triggerhub`
- OBS WebSocket default: `localhost:4455`
- All 20 IPC channel names (preserve backward compatibility for any scripts/automation)

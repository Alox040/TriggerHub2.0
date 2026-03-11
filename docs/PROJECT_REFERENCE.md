# TriggerHub — Project Reference

> Generated: 2026-03-09 | Version analyzed: 1.0.4
> Purpose: Complete technical autopsy for rebuilding from scratch.

---

## 1. Project Purpose

TriggerHub is an **Electron desktop application** for streamers that acts as a fully-featured OBS Studio control panel, purpose-built for operation on a **secondary touch screen** (primary target: SpaceDesk tablet). It connects to OBS via the OBS WebSocket protocol and exposes all critical streaming controls in a dockable, themeable panel workspace.

**Target user:** Twitch/TikTok streamers who use OBS Studio and want a dedicated touch-friendly control surface on a second display.

**Primary differentiators:**
- Touch-optimized, large-button UI
- Dockable panel layout with multiple workspace profiles
- Panel pop-out to separate windows (fullscreenable on touch device)
- Built-in + user-imported soundboard
- Dual-OBS support (OBS for Twitch + SE.Live OBS for TikTok simultaneously)

---

## 2. Feature Inventory

| Feature | Status | Notes |
|---|---|---|
| OBS WebSocket connection | ✅ | ws://, port 4455 default |
| Auto-reconnect on disconnect | ✅ | 5 attempts, exponential backoff (1s/2s/4s/8s/16s) |
| Stream start/stop | ✅ | Stop requires countdown confirmation |
| Recording start/stop/pause/resume | ✅ | |
| Replay buffer start/stop | ✅ | |
| Clip save (replay buffer) | ✅ | Auto-starts buffer if inactive |
| Virtual camera toggle | ✅ | |
| Scene switching grid (OBS) | ✅ | Search filter for >6 scenes |
| Scene switching grid (SE.Live/TikTok) | ✅ | Optional second OBS instance |
| Source visibility toggle | ✅ | Current scene items only |
| Audio mixer (volume + mute) | ✅ | Special inputs only (mic, desktop audio) |
| Built-in soundboard | ✅ | 16 MP3 meme sounds, per-device routing |
| User soundboard | ✅ | Import, categorize, search, drag-reorder |
| Stream stats bar | ✅ | CPU, FPS, disk, render drops, bitrate |
| Twitch viewer count | ✅ | Via public GQL API, no auth required |
| Proactive performance warnings | ✅ | CPU >85%, disk <5GB, render drops >2% |
| Dockable panel workspace | ✅ | Dockview v5 |
| Multiple workspace profiles | ✅ | Named, icon-tagged, saved to localStorage |
| Panel pop-out windows | ✅ | Per-panel Electron BrowserWindow |
| Cross-window state sync | ✅ | BroadcastChannel API |
| Panel window bounds persistence | ✅ | Electron userData JSON |
| Theme system (5 built-in palettes) | ✅ | Space, Midnight, Obsidian, Forest, High Contrast |
| Custom palette editor | ✅ | Create, edit, delete custom themes |
| Theme import/export (JSON) | ✅ | |
| Accent color customization | ✅ | 6 presets + free color picker |
| Auto-theme (OS dark/light) | ✅ | Follows prefers-color-scheme |
| Move to secondary screen | ✅ | One-click SpaceDesk support |
| Fullscreen toggle (main + panels) | ✅ | |
| Panel popout auto-resize | ✅ | ResizeObserver → IPC → win.setSize() |
| Auto-updater | ✅ | electron-updater, GitHub Releases, user-confirmed |
| Toast notifications | ✅ | success/warn/info/error variants |
| Settings panel | ✅ | Design/System/Panels tabs |
| SE.Live panel popout | ⚠️ | Not supported in popout mode |
| Keyboard shortcuts | ❌ | Not implemented |
| MIDI controller support | ❌ | Not implemented |
| Macro/automation | ❌ | Not implemented |
| OBS password persistence | ❌ | By design — cleared on restart |

---

## 3. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Desktop runtime | Electron | 31.x |
| Build tool | electron-vite | 5.x |
| Packaging | electron-builder | 26.x |
| Frontend framework | React | 18.3 |
| Language | TypeScript | 5.5 |
| Panel docking | Dockview | 5.1 |
| OBS protocol | obs-websocket-js | 5.0.6 |
| Auto-update | electron-updater | 6.3 |
| Bundler | Vite | 5.3 |
| React transform | @vitejs/plugin-react | 4.3 |
| Styling | Pure CSS, CSS custom properties | — |
| State management | React useReducer + hooks | — |
| Persistence | localStorage + fs (Electron userData) | — |
| Testing | None | — |

**No CSS framework. No routing library. No global state library.**

---

## 4. Architecture Overview

### 4.1 Electron Process Model

```
┌─────────────────────────────────────┐
│         Main Process (Node.js)      │
│  src/main/index.ts                  │
│  - BrowserWindow management         │
│  - 20 IPC handlers                  │
│  - File I/O (user sounds)           │
│  - Auto-updater                     │
│  - Twitch GQL proxy                 │
│  - Panel bounds persistence         │
└────────────┬────────────────────────┘
             │ contextBridge
┌────────────▼────────────────────────┐
│        Preload (isolated context)   │
│  src/preload/index.ts               │
│  - Exposes window.electronAPI       │
│  - 20 typed IPC invoke wrappers     │
│  - 5 IPC event listeners            │
└────────────┬────────────────────────┘
             │ window.electronAPI
┌────────────▼────────────────────────┐
│    Renderer Process (Chromium)      │
│  src/renderer/src/                  │
│  - React 18 SPA                     │
│  - Single HTML entry point          │
│  - Dual mode: main app / panel popup│
└─────────────────────────────────────┘
```

### 4.2 Renderer Dual-Mode

The renderer serves a single `index.html`. It detects its mode at startup:

```typescript
// src/renderer/src/main.tsx
const urlParams = new URLSearchParams(window.location.search)
const panelId = urlParams.get('panel')

if (panelId) {
  // Render PanelPopout component (popout window mode)
} else {
  // Render full App with ThemeProvider + DockingWorkspace
}
```

### 4.3 OBS State Machine

State lives in `useOBS` hook (useReducer pattern):

```
disconnected → connecting → connected
     ↑              ↓           ↓
     └── error ←── ×    reconnecting (×5)
                              ↓ abort
                         disconnected
```

State updates happen via two channels:
1. **Polling** (1s interval): GetStats, GetStreamStatus, GetRecordStatus, GetReplayBufferStatus, GetVirtualCamStatus
2. **Events** (WebSocket push): SceneChanged, StreamStateChanged, RecordStateChanged, VolumeChanged, etc.

### 4.4 Cross-Window State Sync (BroadcastChannel)

```
Main Window                     Popout Window
    │                                 │
    │ ←── CH_REQUEST ─────────────── (init: request state)
    │                                 │
    │ ──► CH_STATE ──────────────────►│ (state snapshot)
    │                                 │
    │ ◄── CH_ACTIONS ────────────────◄│ (user action)
    │                                 │
    │ ◄── CH_EVENTS ─────────────────◄│ (window closing)
```

Channels defined in `src/renderer/src/layout/useObsBroadcast.ts`:
- `scq-obs-state` — broadcasts ObsStateSnapshot on every state change
- `scq-obs-actions` — popout → main, ObsAction union type
- `scq-state-request` — popout requests current state on mount
- `scq-panel-events` — popout notifies main on beforeunload

### 4.5 Persistence Strategy

| Data | Location | Format | Key |
|---|---|---|---|
| OBS host/port | localStorage | string | `obsHost`, `obsPort` |
| Twitch channel | localStorage | string | `twitchChannel` |
| SE.Live port/password | localStorage | string | `seLivePort`, `seLivePassword` |
| Sound device/volume | localStorage | string | `soundOutputDevice`, `soundVolume` |
| Docking layout + profiles | localStorage | JSON | `scq-docking-v1` |
| Theme (palette + accent) | localStorage | JSON | `scq-theme` |
| Auto-theme config | localStorage | JSON | `scq-auto-theme` |
| Custom themes | localStorage | JSON | `scq-custom-themes` |
| Panel window bounds | userData/panel-bounds.json | JSON | per panelId |
| User sound files | userData/user-sounds/*.ext | binary | filename = `usound-{timestamp}.ext` |
| User sound metadata | userData/user-sounds-meta.json | JSON array | — |

---

## 5. Folder Structure

```
e:\Programmierung\TriggerHub\
├── package.json                        # Dependencies, scripts, electron-builder config
├── electron.vite.config.ts             # Vite config for main/preload/renderer
├── tsconfig.json                       # Base TS config
├── tsconfig.node.json                  # Main/preload TS config
├── tsconfig.web.json                   # Renderer TS config
│
├── src/
│   ├── main/
│   │   └── index.ts                    # Electron main process (353 lines)
│   │
│   ├── preload/
│   │   ├── index.ts                    # contextBridge exposure (34 lines)
│   │   └── index.d.ts                  # window.electronAPI type declaration
│   │
│   └── renderer/
│       ├── index.html                  # HTML entry point
│       └── src/
│           ├── main.tsx                # React entry, mode detection
│           ├── App.tsx                 # Root app component (346 lines)
│           ├── types.ts                # Shared TS interfaces
│           │
│           ├── components/
│           │   ├── ConnectionPanel.tsx  # OBS connect form + SE.Live/Twitch config
│           │   ├── Header.tsx           # Top bar: title, VCam, fullscreen, settings
│           │   ├── StreamControl.tsx    # Stream/record/replay/clip controls
│           │   ├── SceneGrid.tsx        # Scene button grid (OBS + TikTok variant)
│           │   ├── SourcePanel.tsx      # Scene item visibility toggles
│           │   ├── StatsBar.tsx         # CPU/FPS/disk/bitrate/Twitch stats
│           │   ├── AudioMixer.tsx       # Volume sliders + mute per audio input
│           │   ├── Soundboard.tsx       # 16 built-in sounds + device/volume settings
│           │   ├── UserSoundboard.tsx   # User-imported sounds with manage view
│           │   ├── SettingsPanel.tsx    # Design/System/Panels settings tabs
│           │   ├── PaletteEditor.tsx    # Custom theme color editor modal
│           │   ├── ThemePreviewStrip.tsx# Live theme preview bar in settings
│           │   ├── UpdateNotification.tsx # Auto-update UI overlay
│           │   └── Toasts.tsx           # Toast notification display
│           │
│           ├── hooks/
│           │   ├── useOBS.ts            # OBS WebSocket state machine (602 lines)
│           │   ├── useTwitch.ts         # Twitch viewer count polling
│           │   ├── useSELive.ts         # SE.Live OBS WebSocket connection
│           │   ├── useToast.ts          # Toast queue management
│           │   ├── useUserSounds.ts     # User sound CRUD + IPC file ops
│           │   ├── useTheme.ts          # Theme CSS variable application
│           │   ├── useAutoTheme.ts      # OS dark/light mode listener
│           │   └── useCustomThemes.ts   # Custom theme CRUD + import/export
│           │
│           ├── layout/
│           │   ├── types.ts             # PanelId union, ObsStateSnapshot, ObsAction
│           │   ├── layoutStorage.ts     # DockingStore localStorage persistence
│           │   ├── useDockingLayout.ts  # Profile management hook
│           │   ├── useObsBroadcast.ts   # BroadcastChannel sender/receiver hooks
│           │   ├── DockingWorkspace.tsx # Dockview integration + profile toolbar
│           │   └── PanelPopout.tsx      # Popout window: panel renderer + chrome bar
│           │
│           ├── panels/
│           │   ├── panelRegistry.ts     # Panel ID registry (currently unused)
│           │   └── BasePanel.tsx        # Base panel wrapper (currently unused)
│           │
│           ├── themes/
│           │   ├── ThemeContext.tsx     # React context + ThemeProvider
│           │   ├── registry.ts          # Map-based theme registry
│           │   └── palettes/
│           │       ├── index.ts         # Registers all built-in themes
│           │       ├── space.ts         # Default: deep purple/black
│           │       ├── midnight.ts      # Dark navy blue
│           │       ├── obsidian.ts      # Neutral dark grey
│           │       ├── forest.ts        # Dark green
│           │       └── highcontrast.ts  # High-contrast accessibility
│           │
│           ├── styles/
│           │   └── index.css            # Single CSS file (~2000+ lines)
│           │
│           └── public/
│               └── sounds/
│                   ├── README.txt
│                   └── *.mp3 (15 files) # Built-in soundboard audio
```

---

## 6. IPC Channel Reference

All channels registered in `src/main/index.ts`, exposed via `src/preload/index.ts`.

| Channel | Direction | Signature | Description |
|---|---|---|---|
| `move-to-secondary` | invoke | `() → boolean` | Move main window to secondary display |
| `toggle-fullscreen` | invoke | `() → boolean` | Toggle main window fullscreen |
| `get-display-count` | invoke | `() → number` | Number of connected displays |
| `blur-window` | invoke | `() → void` | Return focus to game (blur app) |
| `get-twitch-viewers` | invoke | `(channel) → number\|null` | Twitch GQL viewer count proxy |
| `open-panel-window` | invoke | `(panelId) → number` | Open/focus panel in own BrowserWindow |
| `close-panel-window` | invoke | `(panelId) → void` | Close panel window |
| `toggle-panel-fullscreen` | invoke | `() → boolean` | Toggle calling panel's fullscreen |
| `resize-panel-window` | invoke | `(w, h) → void` | Resize panel window to content size |
| `sound-dialog` | invoke | `() → {path, originalName}\|null` | File open dialog for audio import |
| `sound-import` | invoke | `(srcPath, destFilename) → void` | Copy audio file to userData |
| `sound-delete` | invoke | `(filename) → void` | Delete audio file from userData |
| `sound-read` | invoke | `(filename) → string` | Read audio as base64 data URL |
| `sound-meta-load` | invoke | `() → string` | Load user-sounds-meta.json |
| `sound-meta-save` | invoke | `(json) → void` | Save user-sounds-meta.json |
| `check-for-updates` | invoke | `() → void` | Trigger auto-updater check |
| `download-update` | invoke | `() → void` | Start update download |
| `install-update` | invoke | `() → void` | Install update + restart |
| `update-available` | on | `{version, releaseNotes}` | Update found event |
| `update-not-available` | on | `void` | No update event |
| `update-progress` | on | `{percent, transferred, total, bytesPerSecond}` | Download progress |
| `update-downloaded` | on | `{version}` | Download complete event |
| `update-error` | on | `string` | Updater error message |

---

## 7. Data Flow Diagrams

### 7.1 Initial OBS Connection Flow

```
User submits ConnectionPanel form
  → obs.connect(host, port, password)
  → OBSWebSocket.connect()
  → [parallel] GetSceneList, GetStreamStatus, GetRecordStatus,
               GetSpecialInputs, GetReplayBufferStatus,
               GetReplayBufferSettings, GetVirtualCamStatus
  → [for each special input] GetInputVolume, GetInputMute
  → dispatch(CONNECTED, { scenes, audioInputs, ... })
  → startInterval(poll, 1000ms)
  → register WS event listeners
```

### 7.2 Polling Loop

```
Every 1000ms:
  [parallel] GetStats, GetStreamStatus, GetRecordStatus,
             GetReplayBufferStatus, GetVirtualCamStatus
  → compute bitrate from delta outputBytes
  → compute bitrateHistoryRef (rolling 5-sample avg for drop detection)
  → dispatch(POLL, { stats, streaming, bitrate, bitrateDrop, ... })
```

### 7.3 Popout Window Lifecycle

```
User clicks ⧉ popout tab button
  → window.electronAPI.openPanelWindow(panelId)
  → Main: creates BrowserWindow, loads index.html?panel=<id>
  → Popout renderer: detects ?panel=, renders PanelPopout
  → PanelPopout mounts, calls useObsBroadcastReceiver(panelId)
  → Sends request on CH_REQUEST
  → Main window: receives request, posts current snapshot on CH_STATE
  → Popout: receives state, renders panel content
  → ResizeObserver → electronAPI.resizePanelWindow(w, h)
  → User actions → dispatch(ObsAction) → CH_ACTIONS → main window executes
```

---

## 8. UI/UX Structure

### 8.1 App States

1. **Disconnected / Connection Screen** (`obs.status !== 'connected'`):
   - Full-screen `ConnectionPanel` with form: OBS host/port/password, SE.Live port/password, Twitch channel
   - Validates and persists to localStorage on submit

2. **Reconnecting Overlay** (`obs.status === 'reconnecting'`):
   - Full-screen overlay with spinner, attempt counter (x of 5), abort button
   - Shown on top of toasts

3. **Main Workspace** (`obs.status === 'connected'`):
   - `Header` fixed top bar
   - `DockingWorkspace` (fills remaining height)
   - `Toasts` overlay (bottom-right)
   - `UpdateNotification` overlay (when update available)

### 8.2 Panel Layout (Default)

```
┌─────────────────────────────────────────┐
│                  Header                 │
├──────────────┬──────────────────────────┤
│ StreamControl│ Soundboard               │
├──────────────┼──────────────────────────┤
│ UserSoundboard│ Scenes (OBS)            │
├──────────────┼──────────────────────────┤
│ SE.Live Scenes│ Sources                 │
├──────────────┴──────────────────────────┤
│              Statistics                 │
└─────────────────────────────────────────┘
```
All panels are freely rearrangeable, resizable, closeable, and popout-able via Dockview.

### 8.3 Theme Application

`useTheme` applies CSS custom properties to `:root` via `document.documentElement.style.setProperty()`. All components use `var(--property)` — no inline styles except for accent-derived computed values.

---

## 9. Code Quality Issues

### Critical

1. **Massive connect/reconnect duplication** (`src/renderer/src/hooks/useOBS.ts`):
   - `connect()` function (~80 lines) and `startAutoReconnect()` inner try block (~80 lines) are nearly identical.
   - Should be extracted into a shared `doConnect(params)` helper.

2. **No test coverage** — zero test files in the entire project. No test framework configured.

3. **No error boundaries** — a thrown error in any panel component will crash the entire renderer. No `<ErrorBoundary>` wrapping.

### Moderate

4. **Monolithic CSS** (`src/renderer/src/styles/index.css`, ~2000+ lines):
   - All styles in one file. No CSS Modules, no scoping.
   - Component-level selectors rely on class naming conventions with no enforcement.

5. **Mixed language** — UI strings are German, code identifiers and comments are mixed German/English. No i18n system.

6. **`panelRegistry.ts` is effectively dead code**:
   - `getAllPanels()` is imported in `DockingWorkspace.tsx` only to call `void getAllPanels` — no actual use.
   - `BasePanel.tsx` is imported nowhere.

7. **SE.Live reconnect missing** (`src/renderer/src/hooks/useSELive.ts`):
   - `ConnectionClosed` event sets disconnected state but never retries. Requires user to disconnect/reconnect manually.

8. **User sound memory pressure** (`useUserSounds.ts`):
   - Sounds are read as full base64 data URLs via IPC and cached in a `Map` ref. For large sound libraries, this can consume significant memory.

9. **`loadDockingStore` no schema migration**:
   - Only checks `version === 2`. Any stored data with different shape silently falls back to default, losing user data without warning.

10. **OBS password not persisted** — intentional (security), but no UI indication that password must be re-entered after restart.

### Minor

11. **Several `eslint-disable react-hooks/exhaustive-deps`** — suppressions in `App.tsx` for intentional one-shot effects (stream/record toast on status change). Pattern is correct but fragile.

12. **Hardcoded Twitch GQL client ID** (`src/main/index.ts:7`) — unofficial/undocumented, could be revoked by Twitch.

---

## 10. Technical Risks

| Risk | Severity | Likelihood | Notes |
|---|---|---|---|
| Twitch GQL client ID revocation | High | Medium | `kimne78kx3ncx6brgo4mv6wki5h1ko` is the unofficial web client ID — used by many tools, but undocumented |
| OBS WebSocket protocol breaking changes | Medium | Low | obs-websocket v5 protocol is stable; OBS 28+ required |
| BroadcastChannel cross-window reliability | Medium | Low | Works because all windows load same-origin renderer URL; breaks if partitions differ |
| `setSinkId` non-standard | Low | Low | Chromium/Electron only — fine for this use case |
| electron-updater GitHub dependency | Low | Low | Requires GitHub Releases with `latest.yml`; auto-configured via publish config |
| No error boundaries | High | Medium | Any React render error kills the entire app |
| Memory with large sound libraries | Low | Medium | Base64 cache grows unbounded; no eviction |

---

## 11. Build & Release System

### Scripts (package.json)
- `npm run dev` — electron-vite dev mode with HMR
- `npm run build` — electron-vite production build → `out/`
- `npm run package` — runs `scripts/package.mjs` (wraps electron-builder)
- `npm run installer` — runs `scripts/installer.mjs`
- `npm run release` — runs `scripts/release.mjs`
- `npm run release:patch/minor/major` — bumps version + releases

### Output Targets
- **NSIS installer** (x64): standard Windows installer with custom install directory support
- **Portable exe** (x64): `TriggerHub-{version}-portable.exe`
- **GitHub Releases**: publish provider, owner `Alox040`, repo `Triggerhub`

### electron-builder Config (package.json `build` key)
- App ID: `com.triggerhub.app`
- Packaged files: `out/**/*` only
- NSIS: oneClick=false, allowToChangeInstallationDirectory=true

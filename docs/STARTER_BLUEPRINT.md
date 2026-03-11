# TriggerHub v2 — Starter Blueprint

> This document is optimized as context for an AI assistant starting fresh in a new TriggerHub repository.
> Paste this entire file as system context at the start of a new session.

---

## Project Goal

Build **TriggerHub** — an Electron desktop application for streamers that provides a touch-friendly OBS Studio control panel optimized for a secondary display (SpaceDesk tablet). It connects to OBS via WebSocket, supports a dual-OBS setup (Twitch + TikTok), includes a soundboard, audio mixer, scene switching, and a fully themeable dockable panel workspace.

**This is a personal/indie tool, not a SaaS product.** Polish and correctness matter more than scalability.

---

## Must-Have Features (Priority Order)

1. **OBS WebSocket connection** — host/port/password, auto-reconnect (5 attempts, exponential backoff)
2. **Stream control** — start/stop stream (with confirmation), start/stop/pause/resume recording, replay buffer, clip save
3. **Scene switching** — grid of buttons, one per OBS scene, active scene highlighted
4. **Source visibility toggles** — show/hide sources in current scene
5. **Audio mixer** — volume slider + mute per OBS special input (mic, desktop audio)
6. **Stats bar** — CPU%, FPS, disk space remaining, stream bitrate, dropped frame %, Twitch viewer count
7. **Built-in soundboard** — 16 preset MP3 sounds, audio device routing, volume control
8. **User soundboard** — import MP3/WAV/OGG/AAC/FLAC, rename, categorize, search, drag-reorder
9. **Dockable panel workspace** — panels are freely rearrangeable (Dockview), multiple named profiles
10. **Panel popout windows** — each panel can be opened as its own Electron BrowserWindow (for touch screen)
11. **Theme system** — 5 built-in palettes, custom palette editor, accent color, import/export, auto OS theme
12. **SE.Live / TikTok support** — optional second OBS WebSocket connection for scene switching
13. **Second screen support** — one-click move window to secondary display (SpaceDesk)
14. **Auto-updater** — GitHub Releases, manual user confirmation before downloading/installing

---

## Preferred Architecture

### Electron Process Model

```
Main Process (Node.js)
  ├── Window management (main + panel popouts)
  ├── IPC handlers (split into ipc/ modules by domain)
  ├── File I/O for user sounds (copy, read, delete)
  ├── electron-store for userData persistence
  ├── Auto-updater (electron-updater)
  └── Twitch GQL proxy (fetch runs here, avoids CORS)

Preload (contextIsolation=true, nodeIntegration=false)
  └── contextBridge → window.electronAPI
      All IPC invoke/on wrappers are typed here

Renderer (React 18 + TypeScript)
  ├── Single HTML entry (index.html)
  ├── Detects mode via ?panel= URL param at startup
  ├── Main mode: full App with DockingWorkspace
  └── Popout mode: renders single PanelPopout component
```

### Key Architectural Decisions

**OBS State: Zustand store** (not useReducer)
- Store in `src/renderer/src/store/obsStore.ts`
- Never use `useContext` for OBS state — too many re-renders
- One `useObs()` selector hook per component that takes only what it needs

**OBS Connection: extracted `doConnect()` helper**
- `src/renderer/src/obs/connect.ts` exports `doConnect(client, host, port, password): Promise<ConnectedPayload>`
- Both `connect()` and `startAutoReconnect()` call this single function
- This is the single most important structural decision — prevents the v1 bug where fixes diverge

**Cross-window state sync: BroadcastChannel API**
- 4 named channels: `scq-obs-state`, `scq-obs-actions`, `scq-state-request`, `scq-panel-events`
- Main window broadcasts ObsStateSnapshot on every Zustand state change
- Popout windows receive state and dispatch ObsAction back to main
- Main window executes the action against the real OBS connection
- Do NOT use IPC for cross-window state — BroadcastChannel is simpler and synchronous

**Persistence split:**
- `localStorage` — UI preferences (theme, layout, docking profiles, connection params except password)
- `electron-store` (userData) — panel window bounds, user sound metadata
- `userData/user-sounds/` directory — actual audio files

**CSS: CSS Modules per component**
- Each component gets its own `styles.module.css`
- Global `styles/global.css` only for: resets, CSS custom properties (:root variables), and shared utility classes
- NEVER put component styles in global.css
- Theme variables live on `:root` as CSS custom properties applied via JS

**Error handling: ErrorBoundary per panel**
- Wrap each docked panel content in `<PanelErrorBoundary>`
- A crashed panel shows an error card, not a blank app

---

## Folder Structure

```
src/
├── main/
│   ├── index.ts              # App bootstrap only — window creation, updater setup
│   ├── ipc/
│   │   ├── window.ts         # move-to-secondary, fullscreen, display-count, blur
│   │   ├── sounds.ts         # sound-dialog, sound-import, sound-delete, sound-read, sound-meta-*
│   │   ├── panels.ts         # open-panel-window, close-panel-window, resize-panel-window, toggle-panel-fullscreen
│   │   ├── twitch.ts         # get-twitch-viewers (GQL proxy)
│   │   └── updater.ts        # check/download/install-update, on event emitters
│   └── store.ts              # electron-store schema + instance
│
├── preload/
│   ├── index.ts              # contextBridge.exposeInMainWorld('electronAPI', {...})
│   └── index.d.ts            # declare global { interface Window { electronAPI: ElectronAPI } }
│
└── renderer/
    ├── index.html
    └── src/
        ├── main.tsx           # ReactDOM.createRoot, mode detection, ThemeProvider
        ├── App.tsx            # OBS connection state routing + panel orchestration
        │
        ├── obs/
        │   ├── client.ts      # export const obsClient = new OBSWebSocket()
        │   ├── connect.ts     # export async function doConnect(...): Promise<ConnectedPayload>
        │   └── types.ts       # Scene, AudioInput, OBSStats, SceneItem, ConnectedPayload
        │
        ├── store/
        │   ├── obsStore.ts    # Zustand: connection state, scenes, audio, stats, all OBS actions
        │   ├── layoutStore.ts # Zustand: docking profiles, active profile, serialized layout
        │   └── themeStore.ts  # Zustand: active palette, accent, custom themes, auto-theme config
        │
        ├── components/        # One folder per component, each with index.tsx + styles.module.css
        │   ├── ConnectionPanel/
        │   ├── Header/
        │   ├── StreamControl/
        │   ├── SceneGrid/
        │   ├── SourcePanel/
        │   ├── StatsBar/
        │   ├── AudioMixer/
        │   ├── Soundboard/
        │   ├── UserSoundboard/
        │   ├── SettingsPanel/
        │   ├── PaletteEditor/
        │   ├── ThemePreviewStrip/
        │   ├── UpdateNotification/
        │   └── Toast/
        │
        ├── layout/
        │   ├── types.ts              # PanelId union, ObsStateSnapshot, ObsAction
        │   ├── DockingWorkspace.tsx  # Dockview integration, profile toolbar
        │   ├── PanelPopout.tsx       # Popout window renderer
        │   └── useBroadcast.ts       # useObsBroadcastSender, useObsBroadcastReceiver
        │
        ├── themes/
        │   ├── ThemeContext.tsx      # React context + ThemeProvider
        │   ├── registry.ts           # Map<id, ThemePalette>
        │   ├── apply.ts              # applyTheme(palette, accent): sets CSS vars on :root
        │   └── palettes/
        │       ├── index.ts          # imports + registerTheme() for all built-ins
        │       ├── space.ts          # Default palette
        │       ├── midnight.ts
        │       ├── obsidian.ts
        │       ├── forest.ts
        │       └── highcontrast.ts
        │
        ├── hooks/
        │   ├── useTwitch.ts          # Polls window.electronAPI.getTwitchViewers every 30s
        │   ├── useSELive.ts          # Second OBS WebSocket with reconnect
        │   ├── useToast.ts           # Toast queue: addToast, toasts[]
        │   └── useUserSounds.ts      # User sound CRUD via electronAPI IPC
        │
        ├── errors/
        │   └── PanelErrorBoundary.tsx
        │
        └── styles/
            └── global.css            # Minimal: resets + :root CSS vars + dockview overrides
```

---

## Coding Conventions

### TypeScript

- **Strict mode** always (`"strict": true` in tsconfig)
- **No `any`** — use `unknown` and type guards, or explicit cast with comment
- **Explicit return types** on all exported functions
- **Prefer `interface` for object shapes**, `type` for unions/intersects/primitives
- All IPC channel parameters and return types **must be typed in preload/index.d.ts**

### React

- **Functional components only**, no class components
- **No default exports** for hooks — only named exports
- Default exports for components are fine
- **Zustand selectors over full store** — `const streaming = useObsStore(s => s.streaming)` not `const store = useObsStore()`
- Put `useCallback`/`useMemo` only where genuinely needed (event handlers passed to children, expensive computations)
- **Never suppress `react-hooks/exhaustive-deps`** without a comment explaining exactly why it's intentional

### IPC Pattern

```typescript
// Main: register once, outside createWindow()
ipcMain.handle('my-channel', async (_event, param: string): Promise<Result> => {
  return doSomething(param)
})

// Preload: expose typed wrapper
myMethod: (param: string): Promise<Result> => ipcRenderer.invoke('my-channel', param)

// Renderer: call via window.electronAPI
const result = await window.electronAPI.myMethod(param)
```

### CSS Modules

```typescript
import styles from './styles.module.css'
// ...
<div className={styles.container}>
<button className={`${styles.btn} ${active ? styles.btnActive : ''}`}>
```

Never use inline styles except for dynamic values that must be computed in JS (e.g., `style={{ background: accent }}`).

### File Naming

- Components: `PascalCase.tsx` (or `PascalCase/index.tsx`)
- Hooks: `useCamelCase.ts`
- Stores: `camelCaseStore.ts`
- Utilities: `camelCase.ts`
- CSS Modules: `styles.module.css` (always `styles`, not component name)
- Types-only files: `types.ts`

---

## OBS State Model

### ObsStateSnapshot (broadcast to popout windows)

```typescript
interface ObsStateSnapshot {
  streaming: boolean
  streamTimecode: string        // format: "0:00:00.000"
  streamBitrate: number         // kbps
  streamBitrateDrop: boolean    // true if current bitrate < 50% of rolling avg
  recording: boolean
  recordPaused: boolean
  recordTimecode: string
  replayBufferActive: boolean
  replayBufferDuration: number  // seconds
  virtualCameraActive: boolean
  scenes: Scene[]               // { sceneName: string, sceneIndex: number }[]
  currentScene: string
  sceneItems: SceneItem[]       // { sceneItemId, sourceName, sceneItemEnabled, sourceType }[]
  audioInputs: AudioInput[]     // { inputName, volumeMul, volumeDb, muted }[]
  stats: OBSStats | null        // { cpuUsage, memoryUsage, availableDiskSpace, activeFps, ... }
  connectedTo: string           // "host:port"
  twitchViewers: number | null
  twitchLive: boolean
  twitchChannel: string
}
```

### ObsAction (sent from popout windows to main)

```typescript
type ObsAction =
  | { type: 'startStream' }
  | { type: 'stopStream' }
  | { type: 'startRecord' }
  | { type: 'stopRecord' }
  | { type: 'pauseRecord' }
  | { type: 'resumeRecord' }
  | { type: 'startReplayBuffer' }
  | { type: 'stopReplayBuffer' }
  | { type: 'saveClip' }
  | { type: 'toggleVirtualCamera' }
  | { type: 'setScene'; name: string }
  | { type: 'toggleSceneItem'; sceneItemId: number; currentlyEnabled: boolean }
  | { type: 'setVolume'; inputName: string; volumeMul: number }
  | { type: 'toggleMute'; inputName: string }
```

### PanelId Union

```typescript
type PanelId =
  | 'stream-control'
  | 'soundboard'
  | 'user-soundboard'
  | 'scenes-obs'
  | 'scenes-selive'
  | 'sources'
  | 'stats'
  | 'audio-mixer'
  | 'settings'
```

---

## Things to Preserve from the Old Version

1. **The BroadcastChannel pattern** — it's elegant and works reliably. Preserve all 4 channel names: `scq-obs-state`, `scq-obs-actions`, `scq-state-request`, `scq-panel-events`.

2. **CSS custom properties for theming** — applying themes by calling `document.documentElement.style.setProperty('--bg', palette.bg)` for each variable is fast, real-time, and requires no re-renders. Keep this approach.

3. **`ThemePalette` interface shape** — the exported JSON format for custom themes should remain backward-compatible so users can import their v1 themes.

4. **User sound metadata format** (`UserSound[]` in `user-sounds-meta.json`) — files named `usound-{timestamp}.ext` in the `user-sounds/` directory. Keep this so existing sounds are not lost.

5. **Panel bounds persistence key** — `panel-bounds.json` in userData. Keep so popout windows remember their positions.

6. **Polling approach for OBS stats** — 1-second interval is correct. OBS doesn't push stats via events; polling is required.

7. **Stop stream confirmation** — 2-second countdown before allowing confirm. This prevents accidental stream ending on a touch screen.

8. **Bitrate drop detection** — rolling 5-sample average, flag if current < 50% of average. This is a good heuristic for detecting packet loss mid-stream.

9. **Twitch GQL approach** — using public client ID `kimne78kx3ncx6brgo4mv6wki5h1ko` with the GQL endpoint works without OAuth. Proxy through main process to avoid CORS.

10. **Panel popout auto-resize via ResizeObserver** — listening to `ResizeObserver` on panel content and calling `electronAPI.resizePanelWindow(w, h)` makes touch panels snap to their natural size.

---

## Mistakes to Avoid

### Architecture

1. **Do NOT duplicate the OBS connect logic.** The entire `doConnect()` function must be a single shared helper. Both initial connect and auto-reconnect must call it. Duplicating causes bugs where one path gets a fix the other doesn't.

2. **Do NOT put everything in App.tsx.** The v1 App.tsx grew to 346 lines with inline panel definitions. In v2, panels are registered in a separate config and App.tsx only orchestrates connection state.

3. **Do NOT skip ErrorBoundary.** Without it, a single bad render in a panel component kills the entire app. This is unacceptable in a streaming tool where the stream is live.

4. **Do NOT use IPC for cross-window state.** You cannot `ipcMain.broadcast()` to multiple windows easily. BroadcastChannel in the renderer is the correct tool for this.

### State Management

5. **Do NOT store OBS password in state beyond what's needed.** The password should be cleared after a successful connection attempt. Do not log it, serialize it, or persist it.

6. **Do NOT subscribe to the full Zustand store in components.** Always use selectors: `useObsStore(s => s.streaming)`. Full store subscriptions cause unnecessary re-renders of all subscribers on any state change.

### CSS

7. **Do NOT create a single monolithic CSS file.** The v1 `index.css` became unmaintainable at 2000+ lines. Use CSS Modules so styles are co-located with components.

8. **Do NOT override dockview default styles in ways that break on version updates.** Dockview's internal class names can change. Only override via the documented CSS variables it exposes.

### IPC

9. **Do NOT register IPC handlers inside `createWindow()` if they're shared across multiple windows.** This causes "handler already registered" errors on macOS where the window can be recreated. Register all handlers once at app startup.

10. **Do NOT use `nodeIntegration: true`** — ever. contextBridge + contextIsolation is the correct pattern.

### Features

11. **Do NOT attempt to cache audio files as base64 data URLs indefinitely.** For large user sound libraries this accumulates significant memory. Either implement an LRU cache or read files on-demand.

12. **Do NOT try to support SE.Live panel popout.** The SE.Live `useSELive` hook holds its own OBS WebSocket connection in the main renderer process. It cannot be serialized into the BroadcastChannel snapshot because it's a live connection. Just show an "open in main window" message in popout mode — this is the correct limitation to keep.

---

## IPC Channel Quick Reference

```
Invokable (ipcRenderer.invoke → ipcMain.handle):
  move-to-secondary          () → boolean
  toggle-fullscreen          () → boolean
  get-display-count          () → number
  blur-window                () → void
  get-twitch-viewers         (channel: string) → number | null
  open-panel-window          (panelId: string) → number
  close-panel-window         (panelId: string) → void
  toggle-panel-fullscreen    () → boolean
  resize-panel-window        (w: number, h: number) → void
  sound-dialog               () → { path: string, originalName: string } | null
  sound-import               (srcPath: string, destFilename: string) → void
  sound-delete               (filename: string) → void
  sound-read                 (filename: string) → string  // base64 data URL
  sound-meta-load            () → string  // JSON
  sound-meta-save            (json: string) → void
  check-for-updates          () → void
  download-update            () → void
  install-update             () → void

Events (ipcMain.webContents.send → ipcRenderer.on):
  update-available           { version: string, releaseNotes: string | null }
  update-not-available       void
  update-progress            { percent: number, transferred: number, total: number, bytesPerSecond: number }
  update-downloaded          { version: string }
  update-error               string
```

---

## Build Configuration

```json
// package.json build key (electron-builder)
{
  "appId": "com.triggerhub.app",
  "productName": "TriggerHub",
  "directories": { "output": "dist" },
  "win": {
    "target": [
      { "target": "nsis", "arch": ["x64"] },
      { "target": "portable", "arch": ["x64"] }
    ]
  },
  "nsis": { "oneClick": false, "allowToChangeInstallationDirectory": true },
  "portable": { "artifactName": "${productName}-${version}-portable.exe" },
  "publish": { "provider": "github", "owner": "Alox040", "repo": "Triggerhub" },
  "files": ["out/**/*"]
}
```

```typescript
// electron.vite.config.ts
export default defineConfig({
  main: { plugins: [externalizeDepsPlugin()] },
  preload: { plugins: [externalizeDepsPlugin()] },
  renderer: {
    resolve: { alias: { '@renderer': resolve('src/renderer/src') } },
    plugins: [react()]
  }
})
```

---

## UI Design Principles

- **Touch-first button sizing** — minimum 44×44px tap targets, larger for primary actions
- **Dark theme by default** — background `#07070f` (deep space black), accent violet `#8b5cf6`
- **Status dots** — small colored circles indicate live states (green = streaming, red = recording, amber = replay)
- **Immediate feedback** — buttons show loading/success/error states inline, no modal dialogs except stop stream confirmation
- **Autofocus after blur** — after any button click, call `window.electronAPI.blurWindow()` to return keyboard focus to the game/OBS
- **No menu bar** — `autoHideMenuBar: true` on all windows
- **Background color matches first render** — set `backgroundColor: '#0d0d16'` on BrowserWindow to avoid white flash

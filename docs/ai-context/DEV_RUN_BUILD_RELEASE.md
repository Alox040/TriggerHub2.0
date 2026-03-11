# DEV, RUN, BUILD & RELEASE — TriggerHub 2.0
> Generated: 2026-03-10 | Updated: 2026-03-10 — test count and scripts refreshed | CONFIRMED_BY_CODE

---

## PREREQUISITES

- Node.js (version compatible with Electron 36 — recommend Node 20+)
- npm
- Windows 10/11 (x64) for full Electron build support
- (Optional) OBS Studio with HTTP API enabled for real OBS integration
- (Optional) Spotify account + API credentials for real Spotify integration

---

## DEPENDENCY INSTALLATION

```bash
# Install root project dependencies
npm install

# Install design system dependencies (separate project)
cd design && npm install && cd ..
```

---

## LOCAL DEVELOPMENT

### Browser Dev (React only, no Electron)
```bash
npm run dev
```
- Starts Vite dev server
- Opens at `http://localhost:5173` (or next available port)
- Hot module replacement enabled
- **Note:** Engine and AppFacade run in browser; no Electron APIs (IPC, file system) available in this mode

### Desktop Dev (Electron + Vite)
Currently requires two steps:
1. Start Vite dev server: `npm run dev`
2. In a second terminal, launch Electron pointing to the dev server URL

There is no single `npm run desktop:dev` command currently — this is a known gap.

---

## TYPE CHECKING

```bash
npm run typecheck
```
- Runs `tsc --noEmit`
- Covers `src/**/*.ts` and `src/**/*.tsx`
- Does NOT cover `design/` (excluded in tsconfig.json)
- Does NOT cover `electron/main.cjs` (CommonJS, excluded)

---

## TESTING

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Specific test file
npx vitest run src/tests/core-trigger.test.ts
```

**Test configuration (`vitest.config.ts`):**
- Test files: `src/tests/**/*.test.ts`, `src/tests/**/*.test.tsx`
- Environment: `node`
- Globals: enabled (describe, it, expect, vi available without imports)
- Coverage: not yet configured

**Test suite (14 files):**
```
src/tests/
├── app-container.test.ts          # DI container wiring
├── app-context.test.tsx           # AppProvider / useAppFacade()
├── app-facade.test.ts             # AppFacade API behavior
├── core-macro.test.ts             # MacroEngine execution
├── core-trigger.test.ts           # TriggerEngine firing & conditions (432 lines)
├── event-bus.test.ts              # InMemoryEventBus pub/sub (151 lines)
├── plugins.test.ts                # Plugin lifecycle
├── services.test.ts               # Service adapters (InMemory) (258 lines)
├── trigger-executor.test.ts       # TriggerExecutor action dispatch (68 lines)
├── trigger-graph.test.ts          # TriggerGraph dual-index (210 lines)
├── ui-dashboard.test.tsx          # Dashboard component rendering
├── website-auth-v1.test.ts        # Website auth flow (289 lines)
├── website-browser-guards.test.ts # Website route guards
└── website-profile-v1.test.ts     # Website profile (106 lines)
```

All tests use InMemory transports — no external services required.

---

## PRODUCTION BUILD

### Step 1: Vite Build (Web Assets)
```bash
npm run build
```
- Output: `dist/` folder
- Generates: `dist/index.html`, `dist/assets/*`
- These files are loaded by Electron in production mode

### Step 2: Electron NSIS Installer
```bash
npm run desktop:build
```
- Requires `dist/` to exist (run Step 1 first)
- Output: `release/TriggerHubSetup.exe`
- Target: Windows x64, NSIS format

### Combined (Build + Package)
```bash
npm run desktop:release
```
- Runs full pipeline: Vite build → electron-builder → artifact collection

---

## BUILD CONFIGURATION

### Vite Config (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
```
Minimal — uses Vite defaults for everything else.

### Electron-Builder Config (inside `package.json`)
```json
{
  "build": {
    "appId": "com.triggerhub.app",
    "productName": "TriggerHub",
    "directories": {
      "output": "release"
    },
    "files": ["dist/**/*", "electron/**/*"],
    "win": {
      "target": "nsis",
      "arch": ["x64"]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### Electron Main (`electron/main.cjs`)
- Loads `dist/index.html` (production)
- Window: 1280×800px, min 980×640px
- Menu bar: hidden
- No IPC configured yet

---

## DESIGN SYSTEM (Separate Build)

```bash
cd design
npm run dev    # Design preview server
npm run build  # Build design system
```

Design system is NOT imported by the main app. It serves as:
- Visual design reference
- Component prototype exploration
- shadcn/ui component library (60+ components available)

---

## UTILITY SCRIPTS

```bash
# Sync website content from project features
npm run website:sync

# Watch for feature file changes
npm run watch:features

# Validate release pipeline (typecheck + build + project structure checks)
npm run release:validate

# Collect desktop build artifacts (installer, app.exe, uninstaller)
npm run desktop:artifacts
```

---

## MISSING / BROKEN STEPS

### No Electron Dev Mode
- No `electron:dev` script that launches Electron with hot reload
- Manual two-terminal workflow required
- **Recommended fix:** Add `electron-reload` or `electronmon` as devDependency

### No CI Build Pipeline
- Only CI workflow: `.github/workflows/website-update.yml` (website sync)
- No CI for: typecheck, test, build, or release
- **Recommended fix:** Add `ci.yml` workflow with: `npm ci → typecheck → test → build`

### No Auto-Update Integration
- `electron-updater` not installed
- Auto-update agent prompt exists but implementation not started
- **Recommended fix:** Install `electron-updater`, configure update URL, add IPC handler

### No Electron IPC Bridge
- Renderer (React) cannot communicate with main process (Electron)
- Required for: hotkeys, window control, system tray, file system ops
- **Recommended fix:** Add `contextBridge` + `preload.cjs` script

### No Production Transport Selection
- Bootstrap always uses InMemory transports
- HTTP transports exist but need config/env-based selection
- **Recommended fix:** Check env flag or config file to select transport at startup

---

## RELEASE PROCESS (Current — Manual)

1. Update version in `package.json`
2. Run `npm run typecheck` — must pass
3. Run `npm run test` — must pass
4. Run `npm run build` — generate dist/
5. Run `npm run desktop:build` — generate installer
6. Test installer on Windows 10/11
7. Upload `release/TriggerHubSetup.exe` to GitHub Releases manually
8. Update `docs/` changelog and release notes

**Target (Automated):**
Handled by Release Agent via `40-release-agent.md` — not yet implemented.

---

## LOGS

Development logs written to:
- `dev-start.out.log` — stdout from dev server
- `dev-start.err.log` — stderr from dev server

---

## KEY PATHS

| Purpose | Path |
|---------|------|
| Dev server | `http://localhost:5173` |
| Build output | `dist/` |
| Installer output | `release/TriggerHubSetup.exe` |
| Electron binary | `release/win-unpacked/TriggerHub.exe` |
| Electron entry | `electron/main.cjs` |
| React entry | `src/main.tsx` |
| Bootstrap | `src/app/bootstrap.ts` |

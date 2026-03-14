File: docs/PROJECT_SNAPSHOT.md
Location: /docs/PROJECT_SNAPSHOT.md
Consolidated by: Claude Code (manual consolidation of PROJECT_DEEP_SNAPSHOT + ai-context/PROJECT_SNAPSHOT)
Consolidated at: 2026-03-13
Source snapshots: docs/PROJECT_DEEP_SNAPSHOT.md (2026-03-11T16:36), docs/ai-context/PROJECT_SNAPSHOT.md (2026-03-10)
Verification basis: 2026-03-11T16:36 run — all tests/typecheck/builds PASS

# Project Snapshot — TriggerHub 2.0

## Identity

- **Name:** TriggerHub 2.0
- **Version:** 0.1.1
- **Platform:** Windows Desktop (Electron 36)
- **Category:** Creator Automation / Stream Control
- **Vision:** "Das Betriebssystem für Creator-Automation" — a single platform for streamers to build automations, control OBS, manage Spotify, capture clips, and install plugins without switching apps.
- **Purpose:** Desktop automation hub for creator workflows (event → trigger → action and macro orchestration) with a separate public website.
- **Primary targets:** Windows desktop app (Electron + React) and Vite React website (`website/`).
- **Delivery model:** local release scripts + GitHub Actions + optional Vercel deploy hook.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Electron | 36.0.0 |
| UI Framework | React | 18.3.1 |
| Language | TypeScript | 5.8.2 |
| Bundler | Vite | 6.4.1 |
| Test Runner | Vitest | 3.0.8 |
| Desktop Packaging | electron-builder | 26.0.12 |
| File Watching | Chokidar | 5.0.0 |
| Styling | CSS custom properties (design tokens) | |
| Module Format | ESM (type: module) | |

---

## Repository Map

- Core app: `src/`, `electron/`
- Website app: `website/`
- Agent system: `agents/`
- Release and sync workflows: `.github/workflows/`, `scripts/`, `releases/`
- Product metadata: `project-meta/`, `project-context/`
- Tooling and utility workspaces: `tools/`, `marketing/`, `design/`
- Quality surface: `src/tests/`, `tests/`, root scripts (`typecheck`, `test`, `build`)

---

## System Topology

- Desktop runtime: `src/` + `electron/`
- Website runtime: `website/`
- Workflow automation: `scripts/` + `.github/workflows/`
- Agent orchestration layer: `agents/`
- Product/release metadata plane: `project-meta/` + `releases/` + `project-context/`
- Supporting workspaces: `design/`, `marketing/`, `tools/exe-builder/`

---

## Key Architectural Properties

- **Clean Architecture / Hexagonal:** Core domain in `src/core/` has zero framework dependencies. Services are adapters behind port interfaces. UI communicates only via `AppFacade`.
- **Dependency Injection:** All services wired in `src/app/bootstrap.ts` at startup; no global singletons.
- **Dual-Transport Strategy:** Services use InMemoryTransport (dev/test) or HttpTransport (production) — switched at bootstrap time.
- **Plugin Lifecycle:** Plugins registered in registry, activated with full `PluginContext` (access to all engines and event bus).
- **Event-Driven Core:** `InMemoryEventBus` connects all core engines and plugins; async pub/sub.
- **Strict TypeScript:** `strict: true`, `skipLibCheck: true`, `ES2022` target.

---

## Data Flow

```
UI Click → AppFacade → TriggerEngine / MacroEngine
                              ↓
                       TriggerExecutor
                              ↓
            OBS / Spotify / Clip Service → HTTP / In-Memory Transport
                              ↓
                       EventBus.publish()
                              ↓
              Subscribers (Plugins, UI updates, Logging)
```

---

## Desktop Runtime Deep View

### Composition Root and Lifecycle

`createAppModuleContainer()` in `src/app/bootstrap.ts` constructs all runtime modules and returns a `RuntimeContainer` with `start()` and `stop()` lifecycle methods.

Runtime `start()` sequence:
1. `appController.start()` — hotkey/window manager initialization
2. `obsService.connect()` — OBS connection established
3. `spotifyService.play()` — Spotify session activation
4. `clipService.startCapture()` — clip capture buffer opened
5. Service state flags (`obs`, `spotify`, `clip`) set to `true`
6. `pluginRegistry.activateAll()` — plugins activated with full context injection

Runtime `stop()` sequence:
1. `triggerEngine.destroy()` — clears all subscriptions
2. `pluginRegistry.deactivateAll()`
3. `obsService.disconnect()`
4. `spotifyService.pause()`
5. `appController.stop()`
6. All service state flags set to `false`

Default boot seeding (`seedDefaultCoreData`):
- Registers one macro: `macro-default-scene` (OBS switchScene to "Main")
- Registers one trigger: `trigger-main-scene` bound to `OBS_CONNECTED`, calls `macro.run`

### Event → Trigger → Action → Macro Flow

1. Event published via `InMemoryEventBus`.
2. `TriggerEngine` resolves matching triggers by topic from `TriggerGraph`.
3. Trigger conditions evaluated (`evaluateCondition`).
4. Actions dispatched through `TriggerExecutor.toDispatcher()`.
5. Executor handlers call service actions or `macro.run`/`macro` (by-name lookup).
6. `MacroEngine` executes typed steps; supports recursion via `macro_call` with depth tracking.
7. Supported macro step types: `delay`, `service_call`, `plugin_action`, `macro_call`, `conditional`, `parallel`, `sequence`.
8. Conditional steps evaluate `equals`, `not_equals`, `greater_than`, `less_than`, `contains`, `exists` against `ctx.variables`.
9. Completion events re-published (`TRIGGER_EXECUTED`, `MACRO_COMPLETED`).
10. UI subscribes via facade for dashboard state refresh.

### Core Subsystems

- **Event bus** (`src/core/event-bus/`): subscription, one-shot handlers, wildcard topics (`:*`), `InMemoryEventBus` implementation.
- **Trigger domain** (`src/core/trigger-engine/`): `TriggerEngine`, `TriggerGraph`, `TriggerExecutor`, `TriggerExecutorError`, invariant checks, event-indexed graph, dispatch error collection.
- **Macro domain** (`src/core/macro-system/`): `MacroEngine`, `MacroRunner`, step invariant checks, execution context/variables, depth-aware recursion guard.
- **App control** (`src/core/app-control/`): `AppController`, `HotkeyManager`, `WindowManager` abstraction exposed via controller.

### Service Layer

- **OBS service** (`src/services/obs-service/`): in-memory and HTTP transports behind typed `contracts.ts`, `obsClient.ts`, `obsActions.ts`.
- **Spotify service** (`src/services/spotify-service/`): same pattern — in-memory and HTTP transports.
- **Twitch service** (`src/services/twitch-service/`): `twitchClient.ts`, `twitchActions.ts`, `contracts.ts` — same transport pattern.
- **Clip service** (`src/services/clip-service/`): in-memory buffer processing, pluggable exporters. Browser-safe (`clipExporter.browser.ts`) and Node-safe (`clipExporter.node.ts`) split plus platform entry.
- **Shared reliability** (`src/services/shared/reliability.ts`): timeout/retry wrapper with `ServiceOperationError`.

### Plugin Model

- `PluginRegistry` (`src/plugins/pluginRegistry.ts`): register/unregister/list and activation lifecycle.
- `createPluginRegistryWithDefaults()` bootstraps the example plugin at startup.
- Plugin activation receives `{ appController, triggerEngine, macroEngine, eventBus, actionRegistry }`.
- Example plugin in `src/plugins/example-plugin/`.

### Facade and Read Model

- `TriggerHubAppFacade` (`src/app/facade.ts`): thin read facade over trigger engine, macro engine, and service state for UI consumption.
- `readModel.ts` (`src/app/readModel.ts`): derived read-only view of app state.
- `container.ts` (`src/app/container.ts`): `AppModuleContainer` interface definition.

---

## Website Deep View

### Access and Routing

Route definitions are centralized in `website/src/app/routing/routeManifest.ts`.

| Path | Group | Base Policy |
|---|---|---|
| `/access` | `public_auth` | public |
| `/` | `public_marketing` | public (owner-only in `private_prelaunch`) |
| `/features` | `public_marketing` | public (owner-only in `private_prelaunch`) |
| `/pricing` | `public_marketing` | public (owner-only in `private_prelaunch`) |
| `/about` | `public_marketing` | public (owner-only in `private_prelaunch`) |
| `/login` | `public_auth` | public |
| `/signup` | `public_auth` | public except `private_prelaunch` (owner-only) |
| `/app` | `protected_product` | protected (owner-only in `private_prelaunch`) |
| `/dashboard` | `protected_product` | protected (mode-specific overrides) |
| `/profile` | `protected_product` | protected (mode-specific overrides) |
| `/settings` | `protected_product` | protected (mode-specific overrides) |
| `/forbidden` | `system` | public |
| `/logout` | `system` | protected (owner-only in `private_prelaunch`) |
| `/internal` | `system` | protected (owner-only in `private_prelaunch`) |

Access modes: `private_prelaunch`, `invite_only`, `public_product`. Resolved via `getResolvedRoutePolicy(path, mode, options)`.

### Auth and Identity — Two-Layer Gate Architecture

#### Layer 1: PrelaunchGateProvider (`website/src/app/providers/PrelaunchGateProvider.tsx`)

- Active only when `appAccessMode === 'private_prelaunch'`.
- On mount, calls `GET /api/prelaunch-gate/me` to verify existing gate session.
- Exposes `authorize(accessKey)` which calls `POST /api/prelaunch-gate/login`.
- Gate state: `isGateEnabled`, `isGateOpen`, `isGateInitializing`, `gateUnavailableReason`.
- `AccessPage` (`website/src/pages/AccessPage.tsx`) renders the gate entry form.

#### Layer 2: AuthProvider (`website/src/app/providers/AuthProvider.tsx`)

- Depends on `PrelaunchGateProvider` via `usePrelaunchGate()`.
- Waits for gate to resolve before initializing owner session.
- If gate is enabled and closed: sets session to null, does not call backend.
- Session initialization: calls `GET /api/auth/me`; maps `BackendSessionSnapshot` → `AuthSession` via `createServerBackedSession()`.
- Exposes `AuthContextValue`: `session`, `identity`, `isAuthenticated`, `isInitializing`, `isAuthAvailable`, `authUnavailableReason`, `login`, `logout`.

#### Session Types

- `AuthSession` (client-side): `sessionId`, `guardId`, `userId`, `role`, `email`, `identityCreatedAt`, `createdAt`, `expiresAt`.
- `BackendSessionSnapshot`: `userId`, `role` (must be `'owner'`), `email`, `issuedAt`, `expiresAt`, `lastAuthenticatedAt`, `sessionVersion` (integer >= 1).
- `createServerBackedSession()` validates snapshot, checks `expiresAt > issuedAt`, maps to `AuthSession` with `crypto.randomUUID()`.

#### Deleted Auth Modules (Breaking Change in v0.1.1 / OW-003)

Removed: `authService.ts`, `backendAuthProvider.ts`, `ownerAuthProvider.ts`, `passwordHashing.ts`.
Replaced by: `backendSession.ts`, `errors.ts`, `backendAuthContract.ts`, two-provider architecture.

---

## Workflow and Deployment

- Local release pipeline: `scripts/run-release.ts` → `scripts/release-orchestrator.ts`.
- Validation command: `npm run release:validate` (content sync, checks, typecheck, tests, builds, metadata validation).
- Context sync: `scripts/context-sync.ts` (run via `npm run context:sync`).
- Generate AI context: `scripts/generate-ai-context.ts`.
- Feature change watcher: `scripts/feature-change-watcher.ts`.
- CI release pipeline: validates, syncs, builds Windows artifacts, publishes GitHub release, optionally triggers Vercel.
- CI website sync: `website-update.yml` — regenerates content on metadata changes, auto-commits.
- Desktop distribution: `electron-builder` targeting Windows NSIS x64, artifact `TriggerHubSetup.exe`, GitHub publish (`Alox040/Triggerhub`).
- Security verification: `website/scripts/verify-prelaunch-security.mjs` runs as `prebuild` step.
- `ts-node` config in root `package.json` → `tsconfig.scripts.json` with `esm: true`, `transpileOnly: true`.

### Development Scripts

```bash
npm run dev              # Vite dev server (browser)
npm run build            # Production Vite build → dist/
npm run desktop:build    # NSIS installer → release/TriggerHubSetup.exe
npm run typecheck        # TypeScript validation
npm run test             # Vitest test suite
npm run test:watch       # Watch mode
npm run context:sync     # Sync context docs
npm run website:sync     # Sync website content
npm run watch:features   # Watch feature changes
```

### Release Artifact

- **Installer:** `release/TriggerHubSetup.exe` (NSIS, Windows x64)
- **Build output:** `dist/` (SPA web files loaded by Electron)
- **Desktop shortcuts:** Desktop + Start Menu

---

## Agent System

Canonical agent tree: `agents/`. Master orchestrator: `agents/master-orchestrator.md`.

**Core Agents:**
- `agents/core/00-agent-rules.md` — global rules
- `agents/core/01-orchestrator.md` through `09-autoupdate.md` — standard roles
- `agents/core/10-marketing-ops.md`, `11-debug-agent.md`, `12-review-agent.md` — newer additions
- `agents/core/40-security-audit-agent.md`

**Workflow Agents:**
- `agents/10-super-snapshot-agent.md`
- `agents/15-context-snapshot-agent.md`
- `agents/20-content-sync-agent.md`
- `agents/25-context-sync-agent.md`
- `agents/40-release-agent.md`

**Project Context:** `agents/project-context/` — active-tasks, architecture-overview, changelog, decision-log, design-guidelines, known-issues, product-overview.

**Orchestrator routing:** Security Audit Agent mandatory for security-trigger tasks. Standard order: Architecture/Product → Implementation → QA → Security Audit (if triggered) → Ops → QA → Docs → Release.

---

## Test Suite (16 files, 121 tests — verified 2026-03-11)

| File | Domain |
|---|---|
| `src/tests/app-container.test.ts` | Container wiring |
| `src/tests/app-facade.test.ts` | Facade read model |
| `src/tests/core-macro.test.ts` | Macro engine |
| `src/tests/core-trigger.test.ts` | Trigger engine |
| `src/tests/event-bus.test.ts` | Event bus |
| `src/tests/plugins.test.ts` | Plugin registry |
| `src/tests/services.test.ts` | Service adapters |
| `src/tests/trigger-executor.test.ts` | Trigger executor |
| `src/tests/trigger-graph.test.ts` | Trigger graph |
| `src/tests/website-auth-v1.test.ts` | Website auth v1 |
| `src/tests/website-browser-guards.test.ts` | Browser route guards |
| `src/tests/website-owner-only-access.test.ts` | Owner-only access |
| `src/tests/website-prelaunch-gate.test.ts` | Prelaunch gate |
| `src/tests/website-profile-v1.test.ts` | Profile module |
| `src/tests/app-context.test.tsx` | App context (React) |
| `src/tests/ui-dashboard.test.tsx` | UI dashboard (React) |

---

## Build / Test / Typecheck Status (verified 2026-03-11T16:36)

| Check | Status | Detail |
|---|---|---|
| `npm run test` | **PASS** | 16 files, 121 tests, 1.48s |
| `npm run typecheck` | **PASS** | 0 errors (exit 0) |
| `npm run build` | **PASS** | 85 modules, 524ms |
| `npm --prefix website run build` | **PASS** | 2029 modules, 2.15s |

Note: Builds require unrestricted process spawning — validate separately in CI/sandboxed environments.

---

## Development Debt and Structural Risks

1. **Build status is environment-sensitive:** Both builds passed in the verified run but required unrestricted process spawning. CI/restricted environments need separate validation.
2. **Metadata completeness:** Many files in `project-meta/product`, `project-meta/features`, `project-meta/integrations`, `project-meta/status` remain empty/near-empty. Generated content pipeline quality is low.
3. **Auto-update not implemented:** `agents/core/09-autoupdate.md` spec exists; no runtime implementation in `src/`.
4. **No durable persistence:** All trigger/macro data seeded in-memory at startup; no persistence layer across restarts.
5. **Documentation drift risk:** Large working tree — snapshot-style docs must be regenerated after each significant change.
6. **Security enforcement gap:** Security audit is policy-mandated but not a blocking CI stage; depends on manual orchestrator discipline.
7. **Electron IPC bridge not implemented (RISK-02):** Hotkeys, window control, file system, auto-update all depend on it.

---

## Key Changes in v0.1.1

- OW-003 security hardening: removed old auth modules; two-provider gate architecture introduced.
- Typecheck errors resolved (4 → 0).
- Test count grew from 106 → 121 (+15); 14 → 16 test files.
- New scripts: `context-sync.ts`, `generate-ai-context.ts`.
- New agents: `10-marketing-ops`, `11-debug-agent`, `12-review-agent`, `15-context-snapshot-agent`.
- `tsconfig.scripts.json` added for `ts-node` ESM script execution.
- Clip service split into browser/node entry points.
- `src/config/index.ts` deleted.

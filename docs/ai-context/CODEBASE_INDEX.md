# CODEBASE INDEX — TriggerHub 2.0
> Generated: 2026-03-10 | Updated: 2026-03-10 — Phase 1 UI integration reflected | CONFIRMED_BY_CODE

All important files with path, purpose, and status.

---

## ENTRYPOINTS

| File | Purpose | Status |
|------|---------|--------|
| `electron/main.cjs` | Electron main process, BrowserWindow creation | COMPLETE |
| `index.html` | HTML shell loaded by Vite/Electron | COMPLETE |
| `src/main.tsx` | React DOM mount — initializes bootstrap, wraps in AppProvider | COMPLETE |
| `src/App.tsx` | Root React component — live data via useAppFacade() + EventBus refresh | COMPLETE |

---

## APP LAYER (`src/app/`)

| File | Purpose | Status |
|------|---------|--------|
| `src/app/bootstrap.ts` | Composition root — wires all services and engines | COMPLETE |
| `src/app/container.ts` | `AppModuleContainer` typed interface | COMPLETE |
| `src/app/facade.ts` | `TriggerHubAppFacade` — public API for UI | COMPLETE |
| `src/app/AppContext.tsx` | React context — AppProvider, useAppContext(), useAppFacade() | COMPLETE |
| `src/app/readModel.ts` | `DashboardState` schema validation | COMPLETE |
| `src/app/index.ts` | Re-exports | COMPLETE |

---

## CORE DOMAIN (`src/core/`)

### Trigger Engine
| File | Purpose | Status |
|------|---------|--------|
| `src/core/trigger-engine/triggerEngine.ts` | TriggerEngine — event subscription + execution | COMPLETE |
| `src/core/trigger-engine/triggerExecutor.ts` | Action dispatcher (maps types to handlers) | COMPLETE |
| `src/core/trigger-engine/triggerGraph.ts` | Dual-indexed trigger registry | COMPLETE |
| `src/core/trigger-engine/triggerGraphTypes.ts` | GraphTrigger, GraphTriggerRecord types | COMPLETE |
| `src/core/trigger-engine/triggerTypes.ts` | TriggerAction, TriggerPayload types | COMPLETE |
| `src/core/trigger-engine/triggerConditions.ts` | Condition evaluation logic | COMPLETE |
| `src/core/trigger-engine/index.ts` | Re-exports | COMPLETE |

### Macro System
| File | Purpose | Status |
|------|---------|--------|
| `src/core/macro-system/macroEngine.ts` | MacroEngine — registry + execution orchestration | COMPLETE |
| `src/core/macro-system/macroRunner.ts` | Step-by-step macro execution | COMPLETE |
| `src/core/macro-system/macroTypes.ts` | MacroDefinition, MacroStep, MacroExecutionContext | COMPLETE |
| `src/core/macro-system/index.ts` | Re-exports | COMPLETE |

### Event Bus
| File | Purpose | Status |
|------|---------|--------|
| `src/core/event-bus/inMemoryEventBus.ts` | Async pub/sub with wildcards | COMPLETE |
| `src/core/event-bus/eventBusTypes.ts` | EventHandler, EventRecord types | COMPLETE |
| `src/core/event-bus/index.ts` | Re-exports | COMPLETE |

### App Control
| File | Purpose | Status |
|------|---------|--------|
| `src/core/app-control/appController.ts` | Start/stop lifecycle, hotkey registration | COMPLETE |
| `src/core/app-control/hotkeyManager.ts` | Global hotkey management | PARTIAL — stub impl |
| `src/core/app-control/windowManager.ts` | Window operations (fullscreen, etc.) | PARTIAL — stub impl |
| `src/core/app-control/index.ts` | Re-exports | COMPLETE |

---

## SERVICES LAYER (`src/services/`)

### OBS Service
| File | Purpose | Status |
|------|---------|--------|
| `src/services/obs-service/obsClient.ts` | ObsTransport interface + InMemory + HTTP impls | COMPLETE |
| `src/services/obs-service/obsActions.ts` | ObsService wrapper (switchScene) | COMPLETE |
| `src/services/obs-service/contracts.ts` | ObsApiResponse type guards | COMPLETE |
| `src/services/obs-service/index.ts` | Factory: createObsService() | COMPLETE |

### Spotify Service
| File | Purpose | Status |
|------|---------|--------|
| `src/services/spotify-service/spotifyClient.ts` | SpotifyTransport + InMemory + HTTP impls | COMPLETE |
| `src/services/spotify-service/spotifyActions.ts` | SpotifyService wrapper (play/pause/next) | COMPLETE |
| `src/services/spotify-service/contracts.ts` | SpotifyApiResponse type guards | COMPLETE |
| `src/services/spotify-service/index.ts` | Factory: createSpotifyService() | COMPLETE |

### Clip Service
| File | Purpose | Status |
|------|---------|--------|
| `src/services/clip-service/clipProcessor.ts` | Clip capture logic, ClipBuffer builder | COMPLETE |
| `src/services/clip-service/clipExporter.ts` | Clip export logic | PARTIAL — basic impl |
| `src/services/clip-service/contracts.ts` | ClipCaptureInput, ClipBuffer types | COMPLETE |
| `src/services/clip-service/index.ts` | ClipService factory | COMPLETE |

### Shared Infrastructure
| File | Purpose | Status |
|------|---------|--------|
| `src/services/shared/http.ts` | HttpClient — fetch wrapper with error mapping | COMPLETE |
| `src/services/shared/reliability.ts` | OperationPolicy (retry/timeout) | COMPLETE |
| `src/services/shared/index.ts` | Re-exports | COMPLETE |

---

## PLUGIN SYSTEM (`src/plugins/`)

| File | Purpose | Status |
|------|---------|--------|
| `src/plugins/pluginRegistry.ts` | PluginRegistry — register/activate/deactivate | COMPLETE |
| `src/plugins/example-plugin/plugin.ts` | ExamplePlugin — reference implementation | COMPLETE |
| `src/plugins/example-plugin/pluginActions.ts` | Plugin-specific actions | COMPLETE |
| `src/plugins/example-plugin/pluginConfig.ts` | Plugin config schema | COMPLETE |
| `src/plugins/example-plugin/index.ts` | Re-exports | COMPLETE |
| `src/plugins/index.ts` | Registry factory | COMPLETE |

---

## UI LAYER (`src/ui/`)

### Pages
| File | Purpose | Status |
|------|---------|--------|
| `src/ui/pages/Dashboard.tsx` | Main dashboard — TriggerGrid + Automations | COMPLETE (live data) |
| `src/ui/pages/Editor.tsx` | Trigger/macro editor | PARTIAL — scaffold |
| `src/ui/pages/Plugins.tsx` | Plugin management view | PARTIAL — scaffold |
| `src/ui/pages/Settings.tsx` | App settings view | PARTIAL — scaffold |
| `src/ui/pages/index.ts` | Re-exports | COMPLETE |

### Components
| File | Purpose | Status |
|------|---------|--------|
| `src/ui/components/TriggerCard.tsx` | Trigger card with active state toggle | COMPLETE |
| `src/ui/components/StatusBar.tsx` | CPU/FPS/stream status display | COMPLETE |
| `src/ui/components/PanelCard.tsx` | Panel container with title | COMPLETE |
| `src/ui/components/DeckButton.tsx` | Macro/trigger execution button | COMPLETE |
| `src/ui/components/Button.tsx` | Base button component | COMPLETE |
| `src/ui/components/Modal.tsx` | Generic modal dialog | COMPLETE |
| `src/ui/components/index.ts` | Re-exports | COMPLETE |

### Layout
| File | Purpose | Status |
|------|---------|--------|
| `src/ui/layout/MainLayout.tsx` | 3-column layout (sidebar + main + rightPanel) | COMPLETE |
| `src/ui/layout/Header.tsx` | App header / title bar | COMPLETE |
| `src/ui/layout/Sidebar.tsx` | Navigation sidebar | COMPLETE |
| `src/ui/layout/index.ts` | Re-exports | COMPLETE |

### Styles
| File | Purpose | Status |
|------|---------|--------|
| `src/ui/styles/tokens.css` | Design tokens (--th-* CSS custom properties) | COMPLETE |
| `src/ui/styles/dashboard.css` | Dashboard-specific styles | COMPLETE |
| `src/ui/styles/index.css` | Global styles | COMPLETE |

---

## TYPE SYSTEM (`src/types/`)

| File | Purpose | Status |
|------|---------|--------|
| `src/types/domain.ts` | Trigger, Macro, DashboardState, EventTopics | COMPLETE |
| `src/types/ports.ts` | All service port interfaces | COMPLETE |
| `src/types/globalTypes.ts` | Utility types | COMPLETE |
| `src/types/index.ts` | Re-exports | COMPLETE |

---

## UTILITIES (`src/utils/`)

| File | Purpose | Status |
|------|---------|--------|
| `src/utils/logger.ts` | Logging utility | COMPLETE |
| `src/utils/helpers.ts` | General helpers | PLANNED — file exists but is empty (0 bytes) |
| `src/utils/fileSystem.ts` | File system utilities | PLANNED — file exists but is empty (0 bytes) |
| `src/utils/index.ts` | Re-exports | COMPLETE |

---

## TESTS (`src/tests/`)

| File | Purpose | Status |
|------|---------|--------|
| `src/tests/app-container.test.ts` | DI container test | COMPLETE |
| `src/tests/app-context.test.tsx` | AppProvider / useAppFacade() test | COMPLETE |
| `src/tests/app-facade.test.ts` | AppFacade API test | COMPLETE |
| `src/tests/core-macro.test.ts` | MacroEngine test | COMPLETE |
| `src/tests/core-trigger.test.ts` | TriggerEngine test (432 lines) | COMPLETE |
| `src/tests/event-bus.test.ts` | InMemoryEventBus test (151 lines) | COMPLETE |
| `src/tests/plugins.test.ts` | Plugin lifecycle test | COMPLETE |
| `src/tests/services.test.ts` | Service adapters test (258 lines) | COMPLETE |
| `src/tests/trigger-executor.test.ts` | TriggerExecutor action dispatch (68 lines) | COMPLETE |
| `src/tests/trigger-graph.test.ts` | TriggerGraph dual-index (210 lines) | COMPLETE |
| `src/tests/ui-dashboard.test.tsx` | Dashboard component render test | COMPLETE |
| `src/tests/website-auth-v1.test.ts` | Website auth flow (289 lines) | COMPLETE |
| `src/tests/website-browser-guards.test.ts` | Website route guards | COMPLETE |
| `src/tests/website-profile-v1.test.ts` | Website profile (106 lines) | COMPLETE |

---

## LEGACY / PRESERVED (`src/` — Phase 1 preserved, do not modify)

| Folder | Status | Note |
|--------|--------|------|
| `src/deck-engine/` | LEGACY | Preserved from v1 |
| `src/event-bus/` | LEGACY | Superseded by `src/core/event-bus/` |
| `src/plugin-system/` | LEGACY | Superseded by `src/plugins/` |
| `src/profiles/` | LEGACY | Not yet migrated |
| `src/store/` | LEGACY | Not yet migrated |

---

## CONFIG FILES

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, electron-builder config |
| `tsconfig.json` | TypeScript compiler options (ES2022, strict) |
| `vite.config.ts` | Vite bundler configuration |
| `vitest.config.ts` | Vitest test runner configuration |
| `index.html` | HTML entrypoint |
| `.github/workflows/website-update.yml` | CI — website sync workflow |

---

## DESIGN SYSTEM (`design/` — SEPARATE PROJECT)

| Path | Purpose |
|------|---------|
| `design/package.json` | Standalone design project deps |
| `design/src/app/components/` | 60+ shadcn/ui components |
| `design/src/app/components/Sidebar.tsx` | Sidebar design prototype |
| `design/src/app/components/DashboardHeader.tsx` | Header prototype |
| `design/src/app/components/TriggerGrid.tsx` | Trigger grid prototype |
| `design/src/app/components/AutomationPanel.tsx` | Automation panel prototype |
| `design/src/styles/tokens.css` | Design tokens (source of truth) |
| `design/guidelines/Guidelines.md` | Design guidelines |

---

## AGENT SYSTEM FILES (`agents/`)

| File | Purpose |
|------|---------|
| `agents/core/00-agent-rules.md` | Global agent rules |
| `agents/core/01-orchestrator.md` | Coordination agent |
| `agents/core/02-product.md` | Product strategy agent |
| `agents/core/03-architecture.md` | Architecture agent |
| `agents/core/04-implementation.md` | Implementation agent |
| `agents/core/05-uiux.md` | UI/UX agent |
| `agents/core/06-qa.md` | QA agent |
| `agents/core/07-ops.md` | Ops/DevOps agent |
| `agents/core/08-docs.md` | Documentation agent |
| `agents/core/09-autoupdate.md` | Auto-update agent |
| `agents/core/40-security-audit-agent.md` | Security audit agent |
| `agents/master-orchestrator.md` | Master orchestrator |
| `agents/20-content-sync-agent.md` | Website content sync agent |
| `agents/40-release-agent.md` | Release management agent |
| `agents/project-context/active-tasks.md` | Current task list |
| `agents/project-context/architecture-overview.md` | Living architecture doc |
| `agents/project-context/known-issues.md` | Known issues tracker |
| `agents/project-context/decision-log.md` | Decision history |
| `agents/project-context/project_snapshot_deep.md` | Deep technical analysis |

---

## DOCUMENTATION FILES (`docs/`)

| File | Purpose |
|------|---------|
| `docs/PROJECT_REFERENCE.md` | Project reference |
| `docs/REWRITE_PLAN.md` | Architecture rewrite plan |
| `docs/STARTER_BLUEPRINT.md` | Starting blueprint |
| `docs/WINDOWS_DESKTOP_RELEASE.md` | Windows release guide |
| `docs/triggerhub_architecture.md` | Architecture overview |
| `docs/triggerhub_roadmap.md` | Product roadmap |
| `docs/triggerhub_master_prompt.md` | Master AI prompt |
| `architecture-decisions.md` | 20 ADRs (AD-001 to AD-020) |
| `PROJECT_AGENT_SYSTEM_SNAPSHOT.md` | 57.8KB full system snapshot |

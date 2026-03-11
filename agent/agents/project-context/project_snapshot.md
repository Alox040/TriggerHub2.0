# Project Snapshot

> Generated: 2026-03-10 | TriggerHub 2.0

---

## Product Overview

TriggerHub 2.0 is a desktop automation application for Windows, built with React and Electron. It allows users to define **triggers** (event-condition-action rules) and **macros** (reusable, multi-step automation sequences) that interact with external services such as OBS Studio, Spotify, and a clip capture system. The application follows a strict layered architecture with dependency injection, port/adapter boundaries, and a plugin system for extensibility.

---

## Product Goal

Enable streamers and content creators to automate their production workflows — switching OBS scenes, controlling Spotify playback, capturing clips, and chaining complex multi-step sequences — through a unified, configurable desktop application. The system is designed to be extended via plugins and triggered both manually and automatically through event-driven conditions.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18.3 |
| Language | TypeScript 5.8 (strict mode) |
| Build Tool | Vite 6.4 |
| Test Runner | Vitest 3.0 |
| Desktop Runtime | Electron 36 |
| Packaging | electron-builder 26 + NSIS (Windows x64) |
| Module System | ESM (`"type": "module"`) |
| TypeScript Target | ES2022, moduleResolution: Bundler |

No external UI library or state management framework is used. All domain logic is framework-free TypeScript.

---

## Project Structure

```
TriggerHub2.0/
├── electron/             # Electron main process entry (main.cjs)
├── src/
│   ├── types/            # Port interfaces and shared domain types
│   ├── core/             # Pure domain engines (no framework deps)
│   │   ├── trigger-engine/
│   │   ├── macro-system/
│   │   ├── event-bus/
│   │   └── app-control/
│   ├── services/         # External service adapters
│   │   ├── obs-service/
│   │   ├── spotify-service/
│   │   ├── clip-service/
│   │   └── shared/       # HttpClient, reliability policies
│   ├── plugins/          # Plugin registry + example plugin
│   ├── app/              # Composition root, facade, bootstrap
│   ├── ui/               # React components, pages, layout, styles
│   ├── config/           # AppConfig
│   ├── utils/            # Logger, filesystem helpers
│   └── tests/            # Multi-layer integration tests
├── agent/                # AI agent system definitions
│   └── agents/
│       ├── core/         # Role-specific agent prompts
│       ├── project-context/ # Living project documentation
│       ├── optional/     # Utility agents (snapshot, etc.)
│       └── system/       # Templates (handoff, review, tasks)
├── tools/                # Auxiliary tooling (exe-builder)
├── scripts/              # Release, sync, watcher scripts
├── architecture-decisions.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

---

## Core Systems

### Trigger Engine (`src/core/trigger-engine/`)

Implements `TriggerEnginePort`. Manages event-based trigger execution:

- **TriggerGraph** — in-memory index of triggers keyed by event name
- **TriggerEngine** — subscribes to EventBus topics lazily (only when a trigger exists for that event), evaluates conditions, dispatches actions
- **TriggerExecutor** — dynamic string-keyed action registry (`register(type, handler)`)
- **triggerConditions.ts** — evaluates `TriggerCondition` via `OperatorEvaluators` record (discriminated map pattern)

Trigger shape: `{ id, name, enabled, event, conditions[], actions[] }`

### Macro System (`src/core/macro-system/`)

Implements `MacroEnginePort`. Executes `MacroDefinition` objects containing typed, nested steps:

- **MacroEngine** — registers macros, validates invariants per step type, delegates execution to `MacroRunner`
- **MacroRunner** — iterates steps, calls injected `MacroStepHandler`, handles `stopOnError`, tracks `MacroExecutionContext`
- **macroTypes.ts** — full discriminated union type system

**MacroStep discriminated union (7 variants):**

| Type | Key Fields |
|------|-----------|
| `delay` | `durationMs` |
| `service_call` | `service`, `action`, `params?` |
| `plugin_action` | `plugin`, `action`, `params?` |
| `macro_call` | `macroId`, `options?` |
| `conditional` | `condition`, `then`, `else?` |
| `parallel` | `steps[]` |
| `sequence` | `steps[]` |

Recursion depth is enforced via `MacroExecutionContext.depth` + `MacroRunOptions.maxDepth` (default: 5).

### Event Bus (`src/core/event-bus/`)

`InMemoryEventBus` implements `EventBusPort`:

- Generic typed payloads: `publish<TPayload>()`, `subscribe<TPayload>()`
- Wildcard topic support: `"obs:*"` matches all `"obs:…"` topics
- One-shot subscriptions via `once()`
- Handlers awaited sequentially per publish call

### App Control (`src/core/app-control/`)

- **AppController** — starts/stops the application, registers hotkeys (F11 → fullscreen)
- **HotkeyManager** — maps key strings to async handlers
- **WindowManager** — executes window commands (`focus`, `minimize`, `toggle-fullscreen`)

---

## Event / Trigger Architecture

```
External Event
    │
    ▼
EventBus.publish(topic, payload)
    │
    ▼
TriggerEngine (subscribed to topic)
    │  evaluates TriggerCondition[] against payload
    ▼
TriggerExecutor.dispatch(action, payload)
    │  looks up handler by action.type string
    ▼
Action Handler
    │  e.g. "macro.run" → MacroEngine.runMacro(macroId)
    ▼
MacroEngine.runMacro(id)
    │
    ▼
MacroRunner iterates MacroStep[]
    │  calls MacroStepHandler(step, ctx)
    ▼
bootstrap.executeMacroStep switch(step.type)
    │
    ├── delay         → setTimeout
    ├── service_call  → TriggerExecutor.execute("service.action")
    ├── plugin_action → TriggerExecutor.execute("plugin.action")
    ├── macro_call    → MacroEngine.runMacroWithResult (depth+1)
    ├── conditional   → evaluate ctx.variables → run then/else steps
    ├── parallel      → Promise.all(steps)
    └── sequence      → for...of steps
```

The `MacroStepHandler` is a closure created in `bootstrap.ts` that bridges the typed macro step union to the `TriggerExecutor` action registry. This is the central wiring point for the entire execution pipeline.

---

## Plugin System

Defined by `PluginModule` interface:

```typescript
interface PluginModule {
  id: string
  name: string
  activate(context: PluginContext): Promise<void>
  deactivate(): Promise<void>
}
```

**PluginContext** provides full access to the runtime:

- `appController`, `triggerEngine`, `macroEngine`, `eventBus`, `actionRegistry`

**PluginRegistry** manages lifecycle:

- `register()` / `unregister()` — before app start
- `activateAll(context)` / `deactivateAll()` — called by bootstrap on start/stop

**Example Plugin** (`src/plugins/example-plugin/`) demonstrates optional config, conditional auto-start, and initial trigger/macro execution.

---

## Agent System

Located in `agent/agents/`. Defines AI agent roles for development assistance:

| File | Role |
|------|------|
| `core/00-agent-rules.md` | Global rules for all agents |
| `core/01-orchestrator.md` | Master orchestration |
| `core/02-product.md` | Product decisions |
| `core/03-architecture.md` | Architecture analysis |
| `core/04-implementation.md` | Code implementation |
| `core/05-uiux.md` | UI/UX guidance |
| `core/06-qa.md` | Quality assurance |
| `core/07-ops.md` | Operations / DevOps |
| `core/08-docs.md` | Documentation |
| `core/09-autoupdate.md` | Auto-update strategy |
| `core/40-security-audit-agent.md` | Security auditing |
| `optional/10-snapshot.md` | Project snapshot generation |
| `20-content-sync-agent.md` | Content sync |
| `40-release-agent.md` | Release management |
| `master-orchestrator.md` | Top-level orchestration |

Living project docs are maintained in `project-context/` (active-tasks, decision-log, design-guidelines, known-issues, changelog, architecture-overview).

---

## Current Development Status

| System | Status | Notes |
|--------|--------|-------|
| Type system (`src/types/`) | ✅ Complete | Port interfaces, domain types, re-exports |
| Macro type system (`macroTypes.ts`) | ✅ Complete | Full discriminated union, 7 step types, execution context |
| Trigger Engine | ✅ Complete | Condition eval, event subscriptions, action dispatch |
| Macro Engine | ✅ Complete | Registration, validation, runner, recursion guard |
| Event Bus | ✅ Complete | Wildcard topics, generics, once, unsubscribe |
| App Control | ✅ Complete | Hotkeys, window manager, lifecycle |
| OBS Service | ✅ Complete | Dual transport (HTTP + InMemory), contracts |
| Spotify Service | ✅ Complete | Dual transport, contracts |
| Clip Service | ✅ Complete | Capture/export, file system and in-memory exporters |
| Shared Infrastructure | ✅ Complete | HttpClient, reliability policies (timeout, retry) |
| Plugin System | ✅ Complete | Registry, lifecycle, example plugin |
| Composition Root (`bootstrap.ts`) | ✅ Complete | Full wiring, seeded default trigger + macro |
| App Facade | ✅ Complete | Dashboard state, trigger/macro execution |
| Test Suite | ✅ Complete | 10 test files covering all layers |
| Electron packaging | ✅ Complete | `electron/main.cjs`, electron-builder NSIS (2026-03-09) |
| UI — Components | 🟡 Partial | Built, wired to mock/static data only |
| UI — Pages | 🟡 Partial | Dashboard renders; Settings/Editor/Plugins are stubs |
| UI — Live Integration | ❌ Incomplete | Not connected to `AppModuleContainer` / `AppFacadePort` |
| Profile persistence | ❌ Not started | `src/profiles/` exists but is empty |
| Auto-update | ❌ Not started | Planned per AD-009 |

---

## Known Issues

1. **UI not connected to live backend.** `App.tsx` uses a static `mockViewModel`. The `AppFacadePort` is implemented but there is no bridge from `createAppModuleContainer()` to the React render tree. The UI operates in isolation.

2. **MacroStepHandler is a bootstrap closure, not an injected port.** The step dispatch logic lives inline in `bootstrap.ts` as a large `switch` block, making it impossible to unit-test step execution without reconstructing the full container.

3. **Condition evaluation duplicated.** `triggerConditions.ts` and the `conditional` step handler in `bootstrap.ts` both implement the same operator logic. There is no shared evaluator.

4. **No persistence layer.** Triggers and macros are seeded at runtime and lost on restart. No profile storage or configuration loading is implemented.

5. **Legacy folders unused.** `src/deck-engine/`, top-level `src/event-bus/`, and `src/plugin-system/` are preserved per AD-003 but not used in Phase 1.

6. **Duplicate action type string convention.** Trigger actions use `"macro.run"` and `"macro"` as separate registered types for the same logical operation (run a macro). This should be unified.

---

## Next Development Steps

1. **Connect UI to live AppFacadePort** — Replace `mockViewModel` in `App.tsx` with real calls to `appFacade.getDashboardState()`. Wire EventBus subscriptions to trigger re-renders.

2. **Electron IPC bridge** — Establish IPC channels between the Electron main process and renderer so the UI can call `AppFacadePort` methods across the process boundary.

3. **Extract MacroStepExecutor** — Move the `executeMacroStep` closure from `bootstrap.ts` into a dedicated, testable class. Register it as a module in the container.

4. **Shared condition evaluator** — Unify trigger and macro condition evaluation logic into a single exported `evaluateCondition` function used by both systems.

5. **Profile persistence** — Implement a profile store in `src/profiles/` that serializes/deserializes `MacroDefinition[]` and `GraphTrigger[]` to disk. Load on bootstrap, save on changes.

6. **Complete UI pages** — Implement Trigger Editor (`Editor.tsx`), Plugins (`Plugins.tsx`), and Settings (`Settings.tsx`) beyond stubs.

7. **Plugin action registry exposure** — Allow plugins to register custom `service_call` / `plugin_action` handlers into `TriggerExecutor` at activate time, so macro steps can invoke plugin-defined actions.

8. **Auto-update integration** — Implement the auto-update strategy (AD-009) using `electron-updater` or a custom update endpoint check.

9. **Error surface in UI** — Add error boundary handling and user-visible error states for failed service connections, macro execution failures, and trigger dispatch errors.

10. **Remove legacy folders** — Once Phase 1 is confirmed complete, remove `src/deck-engine/`, top-level `src/event-bus/`, and `src/plugin-system/` per AD-003.

---

## Context For External AI

TriggerHub 2.0 is a Windows desktop app (React + Electron, TypeScript strict, Vite + Vitest) that lets streamers automate OBS, Spotify, and clip capture through a trigger/macro system. The architecture is strictly layered: shared port interfaces (`src/types/`) → pure domain engines (`src/core/`: TriggerEngine, MacroEngine with 7-variant discriminated union step types, InMemoryEventBus, AppControl) → service adapters with dual transport (`src/services/`: OBS, Spotify, Clip, shared HTTP + reliability) → plugin registry with DI context (`src/plugins/`) → composition root that wires everything (`src/app/bootstrap.ts`) → React UI (`src/ui/`). The trigger flow is: EventBus publishes a topic → TriggerEngine matches event + evaluates conditions → dispatches action type strings → TriggerExecutor routes to registered handlers → handlers call services or run macros. Macros support delay, service_call, plugin_action, macro_call (recursive with depth guard), conditional (variable-based branching), parallel, and sequence steps. An AI agent system in `agent/agents/` defines role-specific prompts for orchestration, architecture, implementation, QA, ops, docs, and security. Current gap: the UI is wired to mock data and not yet connected to the live `AppFacadePort`. Electron packaging with NSIS installer was added 2026-03-09.

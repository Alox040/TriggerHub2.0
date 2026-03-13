# PROJECT SNAPSHOT — TriggerHub 2.0
> Generated: 2026-03-10 | Updated: 2026-03-10 — Phase 1 UI integration reflected | Mode: FULL_REPOSITORY_ANALYSIS | Depth: MAXIMUM

---

## IDENTITY

**Name:** TriggerHub 2.0
**Version:** 0.1.0
**Platform:** Windows Desktop (Electron 36)
**Category:** Creator Automation / Stream Control
**Vision:** "Das Betriebssystem für Creator-Automation" — a single platform for streamers to build automations, control OBS, manage Spotify, capture clips, and install plugins without switching apps.

---

## TECH STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Electron | 36.0.0 |
| UI Framework | React | 18.3.1 |
| Language | TypeScript | 5.8.2 |
| Bundler | Vite | 6.4.1 |
| Test Runner | Vitest | 3.0.8 |
| Desktop Packaging | electron-builder | 26.0.12 |
| File Watching | Chokidar | 5.0.0 |
| Styling | CSS custom properties (design tokens) |
| Module Format | ESM (type: module) |

---

## PROJECT STRUCTURE (Top Level)

```
TriggerHub2.0/
├── src/                    # Main application source
│   ├── app/                # Composition root, DI, bootstrap, AppContext
│   ├── core/               # Domain logic (framework-free)
│   ├── services/           # Service adapters (OBS, Spotify, Clip)
│   ├── plugins/            # Plugin system
│   ├── ui/                 # React components and pages
│   ├── types/              # Shared type system
│   ├── utils/              # Shared utilities
│   ├── tests/              # Vitest test suite (14 files)
│   ├── App.tsx             # Root React component (live data via AppFacade)
│   └── main.tsx            # React DOM entrypoint (initializes bootstrap)
├── electron/
│   └── main.cjs            # Electron main process
├── agents/                 # AI agent prompt system (primary)
│   ├── core/               # 11+ specialized agent prompts
│   ├── project-context/    # Living project docs
│   ├── system/             # Templates
│   └── master-orchestrator.md
├── agent/                  # AI agent system (mirror / legacy path)
│   └── agents/
│       ├── core/
│       └── project-context/
├── website/                # Separate marketing website (Vite + Tailwind + Radix UI)
├── design/                 # Separate design system project (Vite + shadcn/ui)
├── scripts/                # Build and release scripts
├── tools/                  # exe-builder and tooling
├── docs/                   # Documentation
│   └── ai-context/         # AI-optimized context (this folder)
├── releases/               # Post-processed release artifacts
├── index.html              # Vite HTML entrypoint
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

---

## CURRENT MATURITY

**Phase:** Phase 0–2 complete; Phase 3 partial
**State:** Architecture baseline established; all modules scaffolded; tests passing; Electron packaging configured; UI connected to backend.
**UI:** Live — `App.tsx` calls `facade.getDashboardState()` on mount; subscribes to EventBus for refresh; `executeTrigger()` dispatches real engine calls. Phase 1 complete (2026-03-10).
**Next blocker:** Electron IPC bridge not implemented (RISK-02) — hotkeys, window control, file system, auto-update all depend on it.
**Services:** In-memory transports by default; HTTP transports implemented but not activated in production.

---

## KEY ARCHITECTURAL PROPERTIES

- **Clean Architecture / Hexagonal:** Core domain in `src/core/` has zero framework dependencies. Services are adapters behind port interfaces. UI communicates only via `AppFacade` (through `AppContext.tsx` / `useAppFacade()`).
- **Dependency Injection:** All services wired in `src/app/bootstrap.ts` at startup; no global singletons.
- **Dual-Transport Strategy:** Services use InMemoryTransport (dev/test) or HttpTransport (production) — switched at bootstrap time.
- **Plugin Lifecycle:** Plugins registered in registry, activated with full `PluginContext` (access to all engines and event bus).
- **Event-Driven Core:** `InMemoryEventBus` connects all core engines and plugins; async pub/sub.
- **Strict TypeScript:** `strict: true`, `skipLibCheck: true`, `ES2022` target.

---

## DATA FLOW SUMMARY

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

## DEVELOPMENT SCRIPTS

```bash
npm run dev              # Vite dev server (browser)
npm run build            # Production Vite build → dist/
npm run desktop:build    # NSIS installer → release/TriggerHubSetup.exe
npm run typecheck        # TypeScript validation
npm run test             # Vitest test suite
npm run test:watch       # Watch mode
npm run website:sync     # Sync website content
npm run watch:features   # Watch feature changes
```

---

## RELEASE ARTIFACT

- **Installer:** `release/TriggerHubSetup.exe` (NSIS, Windows x64)
- **Build output:** `dist/` (SPA web files loaded by Electron)
- **Desktop shortcuts:** Desktop + Start Menu

---

## AGENT SYSTEM

The project uses an AI multi-agent system (11+ specialized agents in `agents/core/`):
- Master orchestrator (`agents/master-orchestrator.md`) coordinates all agents
- Specialized agents: product, architecture, implementation, UI/UX, QA, ops, docs, autoupdate, security, content-sync, release
- Living project-context docs track active tasks, decisions, known issues (`agents/project-context/`)
- Canonical location: `agents/`

---

## SNAPSHOT FILES IN THIS FOLDER

| File | Purpose |
|------|---------|
| `PROJECT_SNAPSHOT.md` | This file — high-level overview |
| `ARCHITECTURE_MAP.md` | Detailed architecture diagram and layer descriptions |
| `CODEBASE_INDEX.md` | Every important file with purpose and status |
| `IMPLEMENTATION_STATUS.md` | COMPLETE/PARTIAL/PLANNED/BROKEN for all modules |
| `AGENT_AND_PROMPT_SYSTEM.md` | AI agent system structure and responsibilities |
| `DEV_RUN_BUILD_RELEASE.md` | How to run, build, test, and release |
| `TECH_DEBT_AND_RISKS.md` | Technical risks ranked by severity |
| `NEXT_STEPS_ROADMAP.md` | Recommended next development steps |
| `CONTEXT_FOR_EXTERNAL_AI.md` | Compact AI onboarding context |

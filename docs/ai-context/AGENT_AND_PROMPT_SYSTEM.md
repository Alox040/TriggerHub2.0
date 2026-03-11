# AGENT AND PROMPT SYSTEM — TriggerHub 2.0
> Generated: 2026-03-10 | Updated: 2026-03-10 — Active tasks and agent paths refreshed | CONFIRMED_BY_CODE

---

## OVERVIEW

TriggerHub 2.0 uses a structured AI multi-agent system to coordinate development, architecture decisions, QA, documentation, and releases. Agents are defined as markdown prompt files stored in `agents/` (primary) and also mirrored at `agent/agents/`.

The system follows a **hierarchical orchestration model**:
- A Master Orchestrator delegates tasks to specialized agents
- Each agent has a defined scope and responsibility
- Shared project-context docs serve as the "working memory" between sessions

---

## AGENT DIRECTORY STRUCTURE

```
agents/                                # PRIMARY agent directory
├── core/                              # 11 specialized agents
│   ├── 00-agent-rules.md              # Global rules (all agents)
│   ├── 01-orchestrator.md             # Coordination & task distribution
│   ├── 02-product.md                  # Product strategy & roadmap
│   ├── 03-architecture.md             # Architecture decisions
│   ├── 04-implementation.md           # Code implementation
│   ├── 05-uiux.md                     # UI/UX design
│   ├── 06-qa.md                       # Quality assurance & testing
│   ├── 07-ops.md                      # DevOps & deployment
│   ├── 08-docs.md                     # Documentation
│   ├── 09-autoupdate.md               # Auto-update mechanism
│   └── 40-security-audit-agent.md     # Security audits
├── project-context/                   # Living project documents
│   ├── active-tasks.md                # Current task board
│   ├── architecture-overview.md       # Living architecture doc
│   ├── changelog.md                   # Change history
│   ├── decision-log.md                # Architecture decision history
│   ├── design-guidelines.md           # UI/UX design rules
│   ├── known-issues.md                # Bug tracker
│   ├── product-overview.md            # Product vision & features
│   └── project_snapshot*.md           # Project snapshots
├── system/                            # Templates for structured docs
│   ├── context-template.md
│   ├── decision-log-template.md
│   ├── handoff-template.md
│   ├── review-template.md
│   └── task-template.md
├── master-orchestrator.md             # Top-level orchestrator prompt
├── 20-content-sync-agent.md           # Website content sync
└── 40-release-agent.md                # Release management

agent/agents/                          # Mirror / legacy path (same content)
```

---

## AGENT RESPONSIBILITIES

### Master Orchestrator (`master-orchestrator.md`)
- Top-level coordination across all agents
- Receives high-level goals, breaks them into tasks
- Assigns tasks to appropriate specialized agents
- Manages agent handoffs and context passing

### 00 — Agent Rules (`00-agent-rules.md`)
Global constraints for ALL agents:
- Precision: make only requested changes
- No wild modifications beyond scope
- Always read before editing
- Follow ADR decisions
- Update project-context docs after changes

### 01 — Orchestrator Agent (`01-orchestrator.md`)
- Distributes work across agents
- Resolves agent conflicts
- Tracks cross-cutting concerns

### 02 — Product Agent (`02-product.md`)
- Maintains product vision and roadmap
- Prioritizes features by creator value
- Manages feature flags and milestones

### 03 — Architecture Agent (`03-architecture.md`)
- Makes and records architecture decisions (ADRs)
- Ensures clean architecture compliance
- Reviews module boundaries and port contracts
- Updates `architecture-decisions.md`

### 04 — Implementation Agent (`04-implementation.md`)
- Writes TypeScript/React code
- Implements features according to ADRs
- Writes unit tests for new code
- Respects existing module structure

### 05 — UI/UX Agent (`05-uiux.md`)
- Designs and implements UI components
- Enforces design token usage (--th-* properties)
- Bridges design system prototypes → src/ui/
- Maintains visual consistency

### 06 — QA Agent (`06-qa.md`)
- Writes and maintains test suite
- Validates edge cases and invariants
- Runs typecheck + test before releases
- Identifies coverage gaps

### 07 — Ops Agent (`07-ops.md`)
- Manages build pipeline (Vite + electron-builder)
- Configures CI/CD workflows
- Manages installer configuration (NSIS)
- Handles release packaging and distribution

### 08 — Docs Agent (`08-docs.md`)
- Writes and updates documentation
- Maintains project-context living docs
- Generates snapshots (like this file)
- Keeps README and changelogs current

### 09 — Auto-Update Agent (`09-autoupdate.md`)
- Designs and implements auto-update mechanism
- Integrates electron-updater
- Manages update channels (stable/beta)
- Handles update notifications in UI

### 20 — Content Sync Agent (`20-content-sync-agent.md`)
- Syncs project features/changelog to website
- Runs via `npm run website:sync`
- Generates website-ready markdown content

### 40 — Release Agent (`40-release-agent.md`)
- Manages full release cycle
- Runs: typecheck → test → build → package → publish
- Creates GitHub releases with artifacts
- Updates changelog and version numbers

### 40 — Security Audit Agent (`40-security-audit-agent.md`)
- Reviews code for security vulnerabilities
- Audits dependencies
- Checks Electron security best practices
- Reports and prioritizes security issues

---

## PROJECT CONTEXT DOCUMENTS (Working Memory)

These files are updated by agents after each session to maintain shared state:

| Document | Updated By | Contents |
|----------|-----------|---------|
| `active-tasks.md` | All agents | Current task board with status |
| `architecture-overview.md` | Architecture agent | Current architecture state |
| `changelog.md` | Release agent | Version history |
| `decision-log.md` | Architecture agent | ADR decisions with rationale |
| `design-guidelines.md` | UI/UX agent | Visual design rules |
| `known-issues.md` | QA agent | Bug tracker |
| `product-overview.md` | Product agent | Feature list and vision |

---

## SYSTEM TEMPLATES

Structured templates for agent communication:

- **`handoff-template.md`**: For passing context between agent sessions
- **`review-template.md`**: For code/design review outputs
- **`task-template.md`**: For specifying new tasks
- **`decision-log-template.md`**: ADR documentation format
- **`context-template.md`**: Context-setting for new agent sessions

---

## AGENT EXECUTION FLOW

```
User Goal
    ↓
Master Orchestrator (reads active-tasks.md, project context)
    ↓ assigns task to →
Specialized Agent (reads relevant docs + source files)
    ↓ implements →
Code changes + doc updates
    ↓
Updates project-context/ docs
    ↓
Handoff via handoff-template.md if session ends
```

---

## ACTIVE TASKS (as of 2026-03-10)

From `agents/project-context/active-tasks.md`:

**Completed (Phase 1):**
- ✅ Configure root project as Windows desktop distribution (Electron + NSIS)
- ✅ Connect UI to backend via AppFacade + AppContext
- ✅ Collect release artifacts

**Current priorities (Phase 3):**
1. Implement Electron IPC bridge (`electron/preload.cjs` + contextBridge) — RISK-02
2. Add CI/CD pipeline (`.github/workflows/ci.yml`) — RISK-04
3. Add React ErrorBoundary component
4. Begin real OBS WebSocket integration

---

## ARCHITECTURE DECISIONS LOG (Summary)

20 ADRs recorded in `architecture-decisions.md`:

| ADR | Decision |
|-----|---------|
| AD-001 | Fixed target architecture (strict layers) |
| AD-002 | Contract-first modules via ports.ts |
| AD-003 | Preserve legacy folders in Phase 1 |
| AD-004 | Service adapter pattern with replaceable transports |
| AD-005 | Figma visual language, no demo logic import |
| AD-006 | UI type safety without React global namespace |
| AD-007 | Plugin registry with explicit lifecycle |
| AD-008 | Core engines as pure domain modules |
| AD-009 | Composition root in src/app/ |
| AD-010 | Root validation toolchain (typecheck + smoke tests) |
| AD-011 | Multi-layer test baseline |
| AD-012 | Service reliability policy as shared infrastructure |
| AD-013 | Dual transport strategy (InMemory/HTTP) |
| AD-014 | Typed service contracts per domain |
| AD-015 | Unified HTTP error mapping |
| AD-016 | Runtime response guards for HTTP integrations |
| AD-017 | Runtime guard for clip export contracts |
| AD-018 | App facade read model validation boundary |
| AD-019 | Core domain invariants at registration boundaries |
| AD-020 | Trigger-to-macro binding integrity check |

---

## NOTES FOR AI AGENTS PICKING UP WORK

1. **Always read `agents/core/00-agent-rules.md` first** — global constraints apply (also at `agent/agents/core/00-agent-rules.md`)
2. **Check `agents/project-context/active-tasks.md`** for current work items before starting
3. **Check `agents/project-context/known-issues.md`** for existing bugs before adding features
4. **Respect ADRs** — never contradict architecture decisions without creating a new ADR
5. **Update project-context docs** after completing any significant work
6. **The UI IS connected** — `App.tsx` uses live `AppFacade` data via `useAppFacade()`. Top current priority is Electron IPC bridge (RISK-02).
7. **Don't touch legacy folders** (deck-engine, event-bus, plugin-system, profiles, store) — preserved intentionally per ADR-003
8. **Design system lives in `design/`** — don't import from it into `src/`; copy/adapt instead

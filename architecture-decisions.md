# Architecture Decisions

## AD-001: Keep Target Architecture Fixed
- Date: 2026-03-09
- Decision:
  Use the structure from `project-architecture.md` without modifying the architectural layers.
- Rationale:
  Migration plan is binding and requires strict separation of UI, core logic, services, and plugins.

## AD-002: Define Contract-First Module Interfaces
- Date: 2026-03-09
- Decision:
  Introduce shared ports in `src/types/ports.ts` and an app composition contract in `src/app/container.ts`.
- Rationale:
  This enforces boundaries: `UI -> AppFacade`, `App -> Core/Services/Plugins`.

## AD-003: Preserve Existing Legacy Folders During Phase 1
- Date: 2026-03-09
- Decision:
  Keep existing folders (`src/deck-engine`, `src/event-bus`, `src/plugin-system`, `src/profiles`, `src/store`) untouched in phase 1.
- Rationale:
  No feature loss and no risky deletions before service/UI migration phases.

## AD-004: Service Adapter Pattern with Replaceable Transports
- Date: 2026-03-09
- Decision:
  Implement services as adapter classes behind port contracts and inject transport implementations.
- Rationale:
  Keeps business-facing contracts stable while external API clients can be swapped without touching UI/core layers.

## AD-005: Figma Visual Language, No Demo Logic Import
- Date: 2026-03-09
- Decision:
  Adopt the Figma export's visual system (color, spacing, layout rhythm) but rebuild UI components in `src/ui` without importing demo data or framework-heavy generated UI code.
- Rationale:
  Preserves visual target while keeping long-term maintainability and clean UI/business separation.

## AD-006: UI Type Safety Without React Global Namespace Coupling
- Date: 2026-03-09
- Decision:
  Replace `React.ReactNode` references with explicit `ReactNode` type imports in UI files.
- Rationale:
  Improves TypeScript compatibility and avoids implicit global React namespace assumptions.

## AD-007: Plugin Registry with Explicit Lifecycle Control
- Date: 2026-03-09
- Decision:
  Use a registry-managed plugin lifecycle (`register/list/activateAll/deactivateAll`) with default plugin bootstrap support.
- Rationale:
  Keeps plugin extensibility explicit and testable without leaking plugin behavior into core modules.

## AD-008: Core Engines as Pure Domain Modules
- Date: 2026-03-09
- Decision:
  Implement Trigger Engine, Macro Engine, and App Controller as framework-free domain modules behind ports.
- Rationale:
  Keeps core logic testable and reusable while preserving strict UI/service separation.

## AD-009: Composition Root in src/app with Explicit Runtime Lifecycle
- Date: 2026-03-09
- Decision:
  Introduce `createAppModuleContainer()` as a composition root that wires core, services, plugins, and app facade, and exposes explicit `start/stop` lifecycle methods.
- Rationale:
  Central wiring keeps dependencies controlled and prevents UI/services from creating ad-hoc module graphs.

## AD-010: Root Validation Toolchain with Typecheck + Smoke Tests
- Date: 2026-03-09
- Decision:
  Establish a root-level TypeScript and Vitest toolchain (`typecheck`, `test`) as the baseline validation path for migration phases.
- Rationale:
  Enables fast architectural feedback and prevents regressions while modules are still being migrated.

## AD-011: Multi-Layer Test Baseline (Core, Services, Plugins, UI)
- Date: 2026-03-09
- Decision:
  Maintain a layered test baseline in `src/tests` that validates domain logic, service behavior, plugin lifecycle, app composition, and UI rendering contracts.
- Rationale:
  Keeps migration risks visible across layers and catches boundary regressions early.

## AD-012: Service Reliability Policy as Shared Infrastructure
- Date: 2026-03-09
- Decision:
  Introduce a shared service reliability layer (`runWithPolicy`) with timeout and retry semantics across OBS, Spotify, and Clip flows.
- Rationale:
  Consolidates error-handling behavior and avoids per-service retry/timeout drift.

## AD-013: Dual Transport Strategy for Integrations
- Date: 2026-03-09
- Decision:
  Support both in-memory and HTTP/file-system adapters via service factories (`createObsService`, `createSpotifyService`, `createClipService`).
- Rationale:
  Keeps local development deterministic while enabling progressive migration to real integrations.

## AD-014: Typed Service Contracts per Integration Domain
- Date: 2026-03-09
- Decision:
  Define explicit request/response contract types in service domains (`obs-service/contracts.ts`, `spotify-service/contracts.ts`).
- Rationale:
  Reduces implicit payload assumptions and makes endpoint integration safer to evolve.

## AD-015: Unified HTTP Error Mapping via HttpClient
- Date: 2026-03-09
- Decision:
  Route HTTP requests through a shared `HttpClient` and map non-2xx responses to a typed `HttpRequestError`.
- Rationale:
  Provides consistent diagnostics and interoperates cleanly with retry/timeout policy wrapping.

## AD-016: Runtime Response Guards for HTTP Integrations
- Date: 2026-03-09
- Decision:
  Validate HTTP response payloads at runtime using domain-specific type guards and raise `ResponseValidationError` on schema mismatch.
- Rationale:
  Prevents silently accepting malformed external payloads and improves failure diagnostics.

## AD-017: Runtime Guard for Clip Export Contracts
- Date: 2026-03-09
- Decision:
  Validate clip exporter outputs with `isClipExportResult` and raise `ClipExportValidationError` on mismatch.
- Rationale:
  Prevents invalid exporter payloads from propagating into application state and paths.

## AD-018: App Facade ReadModel Validation Boundary
- Date: 2026-03-09
- Decision:
  Validate `DashboardState` in facade boundary (`getDashboardState`) and raise `DashboardReadModelValidationError` if malformed.
- Rationale:
  Makes read-model integrity explicit and catches invalid internal aggregation early.

## AD-019: Core Domain Invariants at Registration Boundaries
- Date: 2026-03-09
- Decision:
  Enforce trigger/macro invariants during registration (non-empty identifiers/names/actions, uniqueness).
- Rationale:
  Prevents invalid domain objects from entering runtime execution paths.

## AD-020: Trigger-to-Macro Binding Integrity Check
- Date: 2026-03-09
- Decision:
  Validate trigger/macro binding integrity and fail execution when a binding exists but no resolvable macro is available.
- Rationale:
  Avoids silent no-op behavior for broken automation wiring.

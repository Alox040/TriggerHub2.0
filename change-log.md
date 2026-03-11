# Change Log

## 2026-03-09 - Windows Desktop Distribution (Agent Workflow)

### Summary
Configured the root app for Windows desktop packaging with Electron + NSIS and added a release workflow that collects desktop artifacts into `dist/`.

### Changed Files
- `package.json`
- `electron/main.cjs`
- `scripts/collect-desktop-artifacts.mjs`
- `docs/WINDOWS_DESKTOP_RELEASE.md`

### Verification
- `npm run desktop:release` builds frontend + installer and then copies desktop artifacts into `dist/`.

### Risks
- `dist/Uninstall.exe` is a launcher that delegates to the installed Windows uninstall entry.
- App icon/branding assets are currently default and should be replaced with project-specific resources for release quality.

## 2026-03-09 - Phase 1 (Architecture Agent)

### Summary
Initialized the required target architecture foundation and introduced contract-first module interfaces.

### Changed Files
- `src/types/domain.ts`
- `src/types/ports.ts`
- `src/types/index.ts`
- `src/app/container.ts`
- `src/app/index.ts`
- `src/agents/index.ts`
- `src/config/index.ts`
- `src/tests/README.md`
- `src/core/index.ts`
- `src/services/index.ts`
- `src/plugins/index.ts`
- `src/ui/index.ts`
- `architecture-decisions.md`
- `change-log.md`

### New Modules
- App module container contract
- Shared domain and port interfaces
- Agent task and execution log interfaces
- Base config module
- Test structure placeholder

### Risks
- Existing legacy folders remain in parallel and may create ambiguity until later phases reconcile ownership.
- Current source files are mostly placeholders; integration work in phases 2-7 is still required.
- No runtime validation yet because build tooling is not migrated to root in this phase.

## 2026-03-09 - Phase 2 (Service Agent)

### Summary
Migrated OBS, Spotify, and Clip services to port-compliant adapter modules with replaceable transport abstractions.

### Changed Files
- `src/services/obs-service/obsClient.ts`
- `src/services/obs-service/obsActions.ts`
- `src/services/obs-service/index.ts`
- `src/services/spotify-service/spotifyClient.ts`
- `src/services/spotify-service/spotifyActions.ts`
- `src/services/spotify-service/index.ts`
- `src/services/clip-service/clipProcessor.ts`
- `src/services/clip-service/clipExporter.ts`
- `src/services/clip-service/index.ts`
- `architecture-decisions.md`
- `change-log.md`

### New Modules
- OBS transport interface + in-memory transport
- Spotify transport interface + in-memory transport
- Clip processing and clip export pipeline
- Service factory exports for composition root wiring

### Risks
- Current transports are in-memory placeholders and not yet bound to real external APIs.
- Error handling/retry/backoff is basic and must be extended during integration hardening.
- Clip export path is currently deterministic placeholder logic and needs real file-system integration.

## 2026-03-09 - Phase 3 (UI Agent)

### Summary
Implemented a Figma-aligned UI skeleton in `src/ui` with a clean separation between presentation and business logic.

### Changed Files
- `src/ui/styles/tokens.css`
- `src/ui/styles/dashboard.css`
- `src/ui/types.ts`
- `src/ui/components/TriggerCard.tsx`
- `src/ui/components/PanelCard.tsx`
- `src/ui/components/StatusBar.tsx`
- `src/ui/components/index.ts`
- `src/ui/components/Button.tsx`
- `src/ui/components/DeckButton.tsx`
- `src/ui/components/Modal.tsx`
- `src/ui/layout/Sidebar.tsx`
- `src/ui/layout/Header.tsx`
- `src/ui/layout/MainLayout.tsx`
- `src/ui/pages/Dashboard.tsx`
- `src/ui/pages/Settings.tsx`
- `src/ui/pages/Plugins.tsx`
- `src/ui/pages/Editor.tsx`
- `src/ui/pages/index.ts`
- `src/ui/index.ts`
- `architecture-decisions.md`
- `change-log.md`

### New Modules
- Design-token CSS foundation
- Dashboard shell/layout system
- Trigger card, status bar, and panel card components
- Dashboard page as view-model driven composition

### Risks
- UI currently provides structured placeholders for pages outside dashboard and still needs real app-facade wiring.
- Root build system is still pending; runtime validation is limited to static code inspection.
- Some legacy UI files were preserved and minimally implemented for compatibility and may need consolidation later.

## 2026-03-09 - Phase 5 (Code Quality Agent)

### Summary
Applied targeted type-safety and consistency fixes across UI composition components.

### Changed Files
- `src/ui/components/PanelCard.tsx`
- `src/ui/components/Modal.tsx`
- `src/ui/layout/MainLayout.tsx`
- `architecture-decisions.md`
- `change-log.md`

### New Modules
- None

### Risks
- Root TypeScript/build toolchain is still not active, so full compile-time validation is pending.

## 2026-03-09 - Phase 6 (Debug Agent)

### Summary
Performed static stability checks for imports/exports and file integrity in migrated `services`, `ui`, and `plugins` modules.

### Changed Files
- `change-log.md`

### New Modules
- None

### Risks
- Full runtime and integration stability tests are blocked until root build/test pipeline is available.
- Core modules are still placeholders, so end-to-end feature stability is not yet verifiable.

## 2026-03-09 - Phase 4 (Plugin Agent)

### Summary
Implemented the plugin foundation with registry, lifecycle orchestration, and a runnable default example plugin.

### Changed Files
- `src/plugins/pluginRegistry.ts`
- `src/plugins/example-plugin/plugin.ts`
- `src/plugins/example-plugin/pluginActions.ts`
- `src/plugins/example-plugin/pluginConfig.ts`
- `src/plugins/example-plugin/index.ts`
- `src/plugins/index.ts`
- `architecture-decisions.md`
- `change-log.md`

### New Modules
- Plugin registry with bulk lifecycle operations
- Example plugin with configurable activation behavior
- Default plugin bootstrap factory

### Risks
- Plugin sandboxing/capability enforcement is not yet implemented.
- Plugin execution isolation and failure containment need dedicated tests.

## 2026-03-09 - Core Agent (Trigger/Macro/App-Control)

### Summary
Implemented the core domain modules with explicit execution flows and in-memory state suitable for later wiring to services and UI facades.

### Changed Files
- `src/core/trigger-engine/triggerTypes.ts`
- `src/core/trigger-engine/triggerEngine.ts`
- `src/core/trigger-engine/triggerExecutor.ts`
- `src/core/trigger-engine/index.ts`
- `src/core/macro-system/macroTypes.ts`
- `src/core/macro-system/macroEngine.ts`
- `src/core/macro-system/macroRunner.ts`
- `src/core/macro-system/index.ts`
- `src/core/app-control/windowManager.ts`
- `src/core/app-control/hotkeyManager.ts`
- `src/core/app-control/appController.ts`
- `src/core/app-control/index.ts`
- `architecture-decisions.md`
- `change-log.md`

### New Modules
- Trigger execution context and trigger executor pipeline
- Macro runner with configurable error handling behavior
- App controller with hotkey/window command collaboration

### Risks
- Core-to-service orchestration is currently interface-level and needs concrete app-facade composition.
- No persistence layer yet for trigger/macro state.
- Runtime behavior still requires integration tests once root build/test setup is available.

## 2026-03-09 - App Composition (Core+Services+Plugins Wiring)

### Summary
Implemented a runtime composition root in `src/app` with concrete module wiring and a first executable app facade.

### Changed Files
- `src/app/container.ts`
- `src/app/facade.ts`
- `src/app/bootstrap.ts`
- `src/app/index.ts`
- `architecture-decisions.md`
- `change-log.md`

### New Modules
- `TriggerHubAppFacade` for dashboard state and command entrypoints
- `createAppModuleContainer()` runtime container factory
- App lifecycle contract (`start/stop`) for controlled startup/shutdown

### Risks
- Startup currently uses simplified placeholder behavior (e.g. immediate spotify play/capture start) and should be refined per real UX requirements.
- Macro action routing is string-based; capability/validation hardening is still required.
- No automated tests executed yet because root test pipeline is still pending.

## 2026-03-09 - Validation Foundation (TypeScript + Vitest)

### Summary
Created root build/test baseline and added smoke tests for runtime container composition.

### Changed Files
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `vitest.config.ts`
- `src/tests/app-container.test.ts`
- `architecture-decisions.md`
- `change-log.md`

### New Modules
- Root scripts: `typecheck`, `test`, `test:watch`
- Vitest node test configuration
- App container smoke tests (`createAppModuleContainer`, app facade trigger execution)

### Verification
- `npm run typecheck`: passed
- `npm run test`: passed (2 tests)

### Risks
- Current tests cover composition smoke paths only; broader core/service/plugin behavior still needs dedicated suites.
- UI rendering tests are not yet included.

## 2026-03-09 - Test Expansion (Core/Services/Plugins/UI)

### Summary
Expanded the validation suite from composition smoke tests to multi-layer checks and fixed test discovery to include TSX UI tests.

### Changed Files
- `src/tests/core-trigger.test.ts`
- `src/tests/core-macro.test.ts`
- `src/tests/services.test.ts`
- `src/tests/plugins.test.ts`
- `src/tests/ui-dashboard.test.tsx`
- `vitest.config.ts`
- `package.json`
- `package-lock.json`
- `architecture-decisions.md`
- `change-log.md`

### New Modules
- Core trigger and macro behavior tests
- Service adapter behavior tests
- Plugin registry lifecycle test
- Dashboard UI rendering contract test

### Verification
- `npm run typecheck`: passed
- `npm run test`: passed (11 tests in 6 files)

### Risks
- UI test is currently render-contract focused and does not yet cover interactive browser events.
- Integration with real external APIs is still mocked/in-memory and needs dedicated end-to-end coverage later.

## 2026-03-09 - Service Hardening (Retry/Timeout + Real Adapter Options)

### Summary
Hardened service integrations with shared reliability policies and added optional HTTP/FileSystem adapters while preserving in-memory defaults.

### Changed Files
- `src/services/shared/reliability.ts`
- `src/services/shared/index.ts`
- `src/services/obs-service/obsClient.ts`
- `src/services/obs-service/obsActions.ts`
- `src/services/obs-service/index.ts`
- `src/services/spotify-service/spotifyClient.ts`
- `src/services/spotify-service/spotifyActions.ts`
- `src/services/spotify-service/index.ts`
- `src/services/clip-service/clipExporter.ts`
- `src/services/clip-service/index.ts`
- `src/services/index.ts`
- `src/tests/services.test.ts`
- `architecture-decisions.md`
- `change-log.md`

### New Modules
- Shared operation policy runner (`runWithPolicy`, timeout + retries)
- HTTP transport adapters for OBS and Spotify
- File-system clip exporter option

### Verification
- `npm run typecheck`: passed
- `npm run test`: passed (16 tests in 6 files)

### Risks
- HTTP adapter endpoints are contract placeholders and must be aligned with real backend/API contracts.
- Retry policy is generic and may require per-operation tuning once production telemetry is available.

## 2026-03-09 - API Contract Tightening (OBS/Spotify HTTP)

### Summary
Added typed API contracts and a shared HTTP client with explicit error mapping, then aligned OBS/Spotify transports to these contracts.

### Changed Files
- `src/services/shared/http.ts`
- `src/services/shared/index.ts`
- `src/services/obs-service/contracts.ts`
- `src/services/obs-service/obsClient.ts`
- `src/services/obs-service/index.ts`
- `src/services/spotify-service/contracts.ts`
- `src/services/spotify-service/spotifyClient.ts`
- `src/services/spotify-service/index.ts`
- `src/tests/services.test.ts`
- `architecture-decisions.md`
- `change-log.md`

### New Modules
- Shared typed `HttpClient`
- `HttpRequestError` error model
- OBS/Spotify API contract definition files

### Verification
- `npm run typecheck`: passed
- `npm run test`: passed (18 tests in 6 files)

### Risks
- Contract files currently represent expected endpoint shapes and must stay synchronized with real backend implementations.
- HTTP success payload validation is minimal and may require runtime schema guards for untrusted responses.

## 2026-03-09 - Runtime Schema Guards (OBS/Spotify Responses)

### Summary
Added runtime response validation through contract guards and integrated it into shared HTTP request flow.

### Changed Files
- `src/services/shared/http.ts`
- `src/services/shared/index.ts`
- `src/services/obs-service/contracts.ts`
- `src/services/obs-service/obsClient.ts`
- `src/services/spotify-service/contracts.ts`
- `src/services/spotify-service/spotifyClient.ts`
- `src/tests/services.test.ts`
- `architecture-decisions.md`
- `change-log.md`

### New Modules
- `ResponseValidationError` for schema mismatch diagnostics
- Contract guard helpers: `isObsApiResponse`, `isSpotifyApiResponse`

### Verification
- `npm run typecheck`: passed
- `npm run test`: passed (20 tests in 6 files)

### Risks
- Guards currently validate critical fields only; deeper schema validation may still be required for richer payloads.
- JSON parsing errors are surfaced directly and may need transport-level normalization later.

## 2026-03-09 - Guard Expansion (Clip Outputs + App ReadModel)

### Summary
Extended runtime guard strategy to clip exporter outputs and app facade read-model responses.

### Changed Files
- `src/services/clip-service/contracts.ts`
- `src/services/clip-service/clipExporter.ts`
- `src/services/clip-service/index.ts`
- `src/app/readModel.ts`
- `src/app/facade.ts`
- `src/app/index.ts`
- `src/tests/services.test.ts`
- `src/tests/app-facade.test.ts`
- `architecture-decisions.md`
- `change-log.md`

### New Modules
- `ClipExportValidationError` + `isClipExportResult`
- `DashboardReadModelValidationError` + `isDashboardState`

### Verification
- `npm run typecheck`: passed
- `npm run test`: passed (23 tests in 7 files)

### Risks
- Read-model guard currently validates structural integrity, not domain-level invariants (e.g. forbidden state combinations).
- Clip guard validates output shape, not semantic path safety policies.

## 2026-03-09 - Domain Invariant Enforcement (Core + Binding Consistency)

### Summary
Added business-level invariants for trigger/macro registration and binding consistency checks in the runtime composition path.

### Changed Files
- `src/core/trigger-engine/triggerTypes.ts`
- `src/core/trigger-engine/triggerEngine.ts`
- `src/core/macro-system/macroTypes.ts`
- `src/core/macro-system/macroEngine.ts`
- `src/app/bootstrap.ts`
- `src/tests/core-trigger.test.ts`
- `src/tests/core-macro.test.ts`
- `architecture-decisions.md`
- `change-log.md`

### New Modules
- None (invariants integrated into existing domain modules)

### Verification
- `npm run typecheck`: passed
- `npm run test`: passed (27 tests in 7 files)

### Risks
- Invariants currently focus on identity and binding integrity; richer domain policies (e.g. trigger priority, step compatibility matrices) are still pending.
- Runtime binding errors are explicit now and may require UI-level handling paths in later integration phases.

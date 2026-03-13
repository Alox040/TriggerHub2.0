# TriggerHub Stability Audit Phase 1

Date: 2026-03-11
Scope: root app, desktop packaging path, and website sub-application
Audit lenses used: 03-architecture, 11-debug-agent, 06-qa

## Executive Summary

The requested root validation suite is functionally green:

- `npm run typecheck`: passed
- `npm run test`: passed, 16 test files and 121 tests
- `npm run build`: passed
- `npm run desktop:build`: passed and produced `release/TriggerHubSetup.exe`
- `npm run preview`: passed as a smoke run and served on `http://127.0.0.1:4174/`

The only hard failure observed during execution was environmental: inside the sandbox, `vite build` failed with `Error: spawn EPERM` while starting `esbuild`. Re-running outside the sandbox succeeded immediately, which isolates the issue to process restrictions rather than project code.

There are no confirmed build-breaking import errors, missing modules, or active node/browser boundary violations in the validated build path. The main risk is incomplete validation coverage: the root `typecheck` command does not cover the Electron entrypoints, most scripts, or the separate `website/` app.

## Validation Results

### Requested commands

| Command | Result | Notes |
| --- | --- | --- |
| `npm run typecheck` | Pass | Root TS compile check passed |
| `npm run test` | Pass | 121 tests passed |
| `npm run build` | Pass | Failed only in sandbox due to `spawn EPERM`; passed outside sandbox |
| `npm run desktop:build` | Pass with warnings | Built installer successfully |
| `npm run preview` | Pass with warning | Port `4173` was occupied; Vite auto-selected `4174` |

### Additional validation performed

These checks were run because the repo contains a second application under `website/`, which is not covered by the root validation commands:

- `website: npm run build`: passed
- `website: npx tsc --noEmit`: passed

## Errors

### E-01 Sandbox-only build failure

- Symptom: `npm run build` failed in the sandbox with `Error: spawn EPERM`
- Root cause: `vite` could not spawn `esbuild` under sandbox process restrictions
- Confirmation: identical command succeeded outside the sandbox
- Impact: not a repository defect, but it can produce false negatives in constrained CI or agent environments

## Warnings

### W-01 Desktop packaging metadata is incomplete

Observed during `npm run desktop:build`:

- `description is missed in the package.json`
- `author is missed in the package.json`
- `default Electron icon is used`

Impact:

- installer quality and trust signals are reduced
- release artifacts look unfinished

References:

- `package.json:2-4`
- `package.json:50-87`

### W-02 Preview default port was already occupied

Observed during `npm run preview`:

- Vite reported `Port 4173 is in use, trying another one...`
- server came up on `http://127.0.0.1:4174/`

Impact:

- low severity
- indicates another dev server or stale process was already bound to the standard preview port

### W-03 Duplicate dependency declaration in root package

`chokidar` is declared in both `dependencies` and `devDependencies`.

Impact:

- unnecessary lockfile churn
- packaging noise
- increases risk of version drift during future upgrades

Reference:

- `package.json:26-43`

### W-04 Packaging output uses generic executable naming

The Windows executable name is set to `App` even though the product is `TriggerHub 2.0`.

Impact:

- installed application naming is inconsistent
- reduces release polish and can confuse support/debugging

Reference:

- `package.json:70-71`

## Architecture Violations

### A-01 Root typecheck does not validate the whole repository

The root `typecheck` script is `tsc --noEmit`, but the root `tsconfig.json` only includes:

- `src/**/*.ts`
- `src/**/*.tsx`
- `vitest.config.ts`
- `website/src/types/**/*.d.ts`

It does not cover:

- `website/src/**/*`
- `website/api/**/*`
- `electron/**/*`
- most of `scripts/**/*`

This creates a false sense of repository-wide safety because the command is named globally but only validates the root frontend/test surface.

References:

- `package.json:11`
- `tsconfig.json:14-15`
- `tsconfig.scripts.json:12`
- `website/tsconfig.json:14`

### A-02 Scripts validation is effectively limited to one file

There is a dedicated `tsconfig.scripts.json`, but it includes only `scripts/context-sync.ts`.

Impact:

- new TS scripts can compile-fail without being caught by the standard validation path
- release tooling and maintenance tooling are under-validated

Reference:

- `tsconfig.scripts.json:12`

### A-03 Website is a separate app but is not part of the root release gate

The repo contains an independent app under `website/` with its own `package.json`, lockfile, build output, API handlers, and TS config. Root validation does not execute its build or typecheck.

Impact:

- repository can be reported as healthy while `website/` is broken
- CI and local audit results will under-report regressions

References:

- `website/package.json:1-95`
- `website/tsconfig.json:14`

### A-04 Repository metadata and package naming indicate unfinished packaging boundaries

The website package is still named `@figma/my-make-file`, which appears to be template residue rather than project-specific metadata.

Impact:

- weak ownership and release identity
- increases risk of accidental publishing or confusion in tooling

Reference:

- `website/package.json:2`

## Node/Browser Boundary Review

### Current status

No active boundary conflict was reproduced in the validated build path.

Positive findings:

- Electron main-process file system access is isolated to `electron/main.cjs`
- the preload bridge is explicit in `electron/preload.cjs`
- browser-side clip export uses a guarded bridge lookup in `src/services/clip-service/clipExporter.browser.ts`
- node-specific clip export logic is isolated in `src/services/clip-service/clipExporter.node.ts`

Relevant files:

- `electron/main.cjs`
- `electron/preload.cjs`
- `src/services/clip-service/clipExporter.browser.ts`
- `src/services/clip-service/clipExporter.node.ts`

### Residual risk

Tests currently import the node-specific clip exporter directly:

- `src/tests/services.test.ts:23`

That is acceptable in tests, but it reinforces the need for explicit build targets and typecheck scopes so node-only helpers do not accidentally leak into browser-facing exports later.

## Missing Modules / Incorrect Imports

No confirmed missing-module or incorrect-import failures were found in the exercised build paths.

Evidence:

- root build succeeded
- website build succeeded
- root tests succeeded
- desktop packaging succeeded

## Suggested Fixes

1. Split validation by surface and make the names explicit.
   - Add root scripts such as `typecheck:app`, `typecheck:website`, `typecheck:scripts`, and `typecheck:electron`.
   - Add a top-level `validate` script that runs them all.

2. Expand TypeScript coverage.
   - Update the root validation strategy so `website/`, `electron/`, and all TS scripts are checked intentionally rather than incidentally.

3. Promote the website app into the release gate.
   - Include `website` build and typecheck in CI and in any orchestrated audit command.

4. Clean package metadata.
   - Add `description`, `author`, and a custom Electron icon.
   - Rename the website package from `@figma/my-make-file` to a TriggerHub-specific identifier.
   - Reconsider `executableName: "App"` if the shipped product should present as TriggerHub.

5. Remove duplicate dependency declarations.
   - Keep `chokidar` in exactly one dependency section unless there is a deliberate packaging reason.

6. Add a preview/build environment note to internal docs.
   - Document that sandboxed process restrictions can cause false `vite build` failures due to `esbuild` spawning.

## QA Assessment

### Critical

- None confirmed in the validated build path

### Medium

- Validation coverage gaps across repository surfaces
- Packaging metadata quality issues
- Separate website app not included in the root release gate

### Low

- Preview port contention on `4173`
- Duplicate dependency declaration
- Generic Windows executable naming

## Overall Assessment

Phase 1 status: functionally stable, structurally under-validated

The shipped root desktop path is currently buildable and testable. The highest-priority follow-up is not a code fix for a failing build, but tightening validation boundaries so repository health claims match the actual multi-application structure of TriggerHub.

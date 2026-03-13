# Release Path Audit

Date: 2026-03-13
Scope: desktop release path only (`build -> electron -> artifacts -> release`)

## Actual Pipeline

The executable desktop release path currently consists of these repo-backed steps:

1. `npm run build`
   - Runs `vite build`.
   - Produces renderer assets in `dist/`.
2. `npm run desktop:build`
   - Runs the root build first.
   - Executes `electron-builder --win nsis --x64 --publish never`.
   - Uses the `build` section in the root `package.json`.
   - Writes Electron packaging output to `release/`.
3. `npm run desktop:artifacts`
   - Runs `scripts/collect-desktop-artifacts.mjs`.
   - Copies selected packaging outputs from `release/` into `dist/`.
4. `npm run desktop:release`
   - Runs `desktop:build` and then `desktop:artifacts`.
5. `npm run release`
   - Runs `release:validate` first.
   - Runs `desktop:release` second.
   - This is a broader release preflight, not a desktop-only command.

## Required Commands

Local desktop artifact build:

```powershell
npm ci
npm run desktop:release
```

Full local preflight plus desktop artifact build:

```powershell
npm ci
npm run release
```

CI desktop job entrypoint:

```powershell
npm ci
npm run desktop:release
```

## Expected Artifacts

Direct `electron-builder` output in `release/`:

- `release/TriggerHubSetup.exe`
- `release/TriggerHubSetup.exe.blockmap`
- `release/latest.yml`
- `release/win-unpacked/App.exe`
- `release/builder-debug.yml`

Post-processed artifacts from `scripts/collect-desktop-artifacts.mjs` in `dist/`:

- `dist/Setup.exe`
- `dist/App.exe`
- `dist/Uninstall.exe`
- `dist/latest.yml`

Notes:

- `dist/Uninstall.exe` is not a native primary build output. The script first looks for an existing uninstaller candidate in `release/`. If none exists, it tries to generate a launcher with cached `makensis.exe`.
- `dist/latest.yml` is optional in the collector script, but is expected by the GitHub Actions upload step when present.

## Build Inputs And Dependencies

Repo-local dependencies:

- root `package.json`
- root `node_modules`
- `electron/main.cjs`
- `electron/preload.cjs`
- renderer build output from `vite build`
- `scripts/collect-desktop-artifacts.mjs`

Tooling dependencies:

- Node.js and npm
- `electron-builder` from root dependencies
- Windows environment for the actual desktop packaging path
- NSIS tooling as provided through `electron-builder` cache for installer and optional uninstaller launcher generation

CI/runtime dependencies:

- GitHub Actions workflow at `.github/workflows/release.yml`
- GitHub release permissions (`contents: write`) for publish job

## Platform Limits

- Desktop packaging is Windows-only in the current repo path.
- The root desktop build hardcodes `--win nsis --x64`.
- CI uses `windows-latest` only for the `build_desktop` job.
- `scripts/collect-desktop-artifacts.mjs` assumes Windows executable names (`.exe`) and NSIS-style outputs.
- `tools/exe-builder/` is also Windows-oriented and PowerShell-driven, but it is not part of the root release pipeline.

## Observed Boundaries

What is part of the real desktop release path:

- root `build`
- `electron-builder` packaging
- artifact collection from `release/` to `dist/`
- GitHub Actions artifact upload and GitHub Release publish

What exists but is not part of the desktop release execution backbone:

- `tools/exe-builder/`
  - Separate utility application.
  - Not invoked by root release scripts or `.github/workflows/release.yml`.
- broad release validation concerns in `scripts/release-orchestrator.ts`
  - Includes website, content sync, agent files, and security-report presence checks.
  - This is a release gate around the desktop path, not the desktop packaging path itself.

## Breakpoints And Manual Steps

1. `desktop:build` depends on `vite build` writing to `dist/`, while `desktop:artifacts` later also writes release binaries into the same directory.
   - This works, but mixes web build output and packaged release assets in one target directory.
2. `dist/Uninstall.exe` is not guaranteed by `electron-builder`.
   - The collector script falls back to generating a launcher from cached NSIS tooling.
   - If the NSIS cache is unavailable, the script only warns and continues without `dist/Uninstall.exe`.
3. `npm run release` is not desktop-only.
   - It includes website/content/security preflight checks that can block a desktop artifact build even when the Electron path itself is healthy.
4. The publish step in `.github/workflows/release.yml` depends on artifacts already uploaded from the Windows build job.
   - There is no separate integrity check that all expected files exist before GitHub release publication.
5. Existing repo docs mix current behavior and target-state/process text.
   - `docs/devops/release-pipeline.md` is explicitly a proposed target design, not an exact execution spec.

## Open Uncertainties

- No code-signing step is configured in the root `package.json` or release workflow.
- The executable is named `App.exe` via `build.executableName`, while the product and installer names are `TriggerHub`.
  - Technically valid, but easy to misread in downstream docs and tooling.
- `release/latest.yml` exists in a checked build output, but the collector treats update-manifest copying as optional.
- Older docs still mention `run release` as a command even though the executable repo command is `npm run release`.
- The root release workflow includes website deployment after GitHub release publication, which is adjacent process automation, not part of the desktop artifact pipeline itself.

## Concrete Technical To-dos

- Separate renderer build output from collected desktop release assets so `dist/` is not used for both concerns.
- Decide whether `Uninstall.exe` is a required deliverable or a best-effort convenience artifact, then enforce that contract consistently in CI.
- Add a narrow validation step for desktop release outputs after `desktop:release` that fails if required files are missing.
- Align artifact naming more explicitly around product naming, especially `App.exe` versus `TriggerHubSetup.exe`.
- Clean up stale documentation that still references `run release` or describes target-state automation as if already implemented.

## Small Repo-Backed Adjustment Applied

Updated machine-readable release metadata to reference the actual local command:

- `releases/release-manifest.json`
- `project-meta/status/release-status.json`

Both now use `npm run release` instead of `run release`.

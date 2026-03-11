# Release Workflow Status

Date: 2026-03-11
Status: Validated

## Pipeline Steps

1. `npm run website:sync` updates public website content from `project-meta/` and `releases/`.
2. `npm run release:validate` runs content sync, project checks, typecheck, tests, root build, security audit gate, website build, and release metadata validation.
3. `npm run desktop:release` builds the desktop app with `electron-builder` and exports release artifacts.
4. `.github/workflows/release.yml` uses branch-only write-back for generated metadata/content.
5. In non-branch contexts (tags/manual refs), the workflow runs in no-write mode and fails if generated files are dirty.
6. The workflow uploads desktop artifacts, publishes a GitHub Release, and triggers Vercel via deploy hook.

## Connected Agents

- Release Agent: `agents/40-release-agent.md`
- Website Content Sync Agent: `agents/20-content-sync-agent.md`
- Snapshot Agent: `agents/optional/10-snapshot.md`
- Security Audit Agent: `agents/core/40-security-audit-agent.md`

## Artifact Outputs

- `dist/Setup.exe`
- `dist/App.exe`
- `dist/Uninstall.exe`
- `dist/latest.yml`
- `release/*.blockmap`

## Deployment Targets

- GitHub Releases for downloadable desktop artifacts and update metadata
- Vercel via `VERCEL_DEPLOY_HOOK_URL`
- GitHub repository content sync via `.github/workflows/website-update.yml`

## Trigger

- Local preflight/build trigger: `npm run release`
- CI trigger: Git tag push `v*` or manual GitHub Actions dispatch

## Branch Strategy

- Canonical default branch strategy: `main`
- Transitional compatibility: branch-sensitive automation also listens to `master` to avoid silent trigger failures during migration or mixed repositories.

## Latest Validation

- Last verified locally on `2026-03-11`.
- Result: `npm run release:validate` completed successfully.
- Outstanding operational requirement: hosting platform must provide the private prelaunch server env vars before deployment.

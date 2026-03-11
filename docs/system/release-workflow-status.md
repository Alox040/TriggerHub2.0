# Release Workflow Status

Date: 2026-03-10
Status: Configured

## Pipeline Steps

1. `npm run website:sync` updates public website content from `project-meta/` and `releases/`.
2. `npm run release:validate` runs content sync, project checks, typecheck, tests, root build, website build, and release metadata validation.
3. `npm run desktop:release` builds the desktop app with `electron-builder` and exports release artifacts.
4. `.github/workflows/release.yml` uploads desktop artifacts, publishes a GitHub Release, and triggers Vercel via deploy hook.

## Connected Agents

- Release Agent: `agent/agents/40-release-agent.md`
- Website Content Sync Agent: `agent/agents/20-content-sync-agent.md`
- Snapshot Agent: `agent/agents/optional/10-snapshot.md`
- Security Audit Agent: `agent/agents/core/40-security-audit-agent.md`

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

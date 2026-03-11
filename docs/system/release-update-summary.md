# Release Update Summary

Date: 2026-03-11
Release version: `0.1.0`
Release trigger command: `run release`

## Release Agent and Workflow Location

- Expected file `agents/40-release-agent.md` was not present.
- Equivalent Release Agent found and verified at `agents/40-release-agent.md` and canonical path `agent/agents/40-release-agent.md`.
- Main release workflow: `.github/workflows/release.yml`.
- Website sync workflow: `.github/workflows/website-update.yml`.

## Updated Components

- Release workflow now validates additional connected client apps if client directories exist (`mobile`, `web-client`, `client`, `apps/mobile`, `apps/web-client`).
- Release workflow sequencing updated so Vercel deploy runs after successful release publishing.
- Release metadata now registers the trigger command as `run release` in:
- `project-meta/status/release-status.json`
- `releases/release-manifest.json`
- Release Agent docs updated to include `run release` trigger command in:
- `agent/agents/40-release-agent.md`
- `agents/40-release-agent.md`

## Build Artifacts Produced or Expected

Desktop release artifacts configured in pipeline:
- `dist/Setup.exe`
- `dist/App.exe`
- `dist/Uninstall.exe`
- `dist/latest.yml`
- `release/*.blockmap`
- `release/latest.yml`

Website artifacts:
- `website/dist/**` via `npm --prefix website run build` (validated by release orchestrator step definition)

## Deployment Targets

- GitHub repository: generated release metadata/content can be committed by workflow (`git-auto-commit-action`) on branch runs.
- GitHub Releases: desktop artifacts published via `softprops/action-gh-release@v2`.
- Vercel website deployment: deploy hook trigger via `VERCEL_DEPLOY_HOOK_URL` after publish job.
- Connected client apps: additional mobile/web-client style apps are now release-validated when present.

## Verification Results

Executed release command:
- `run release` (via `run.cmd` -> `npm run release` -> `scripts/run-release.ts`)

Observed pipeline execution:
- Content sync: executed successfully.
- Project checks: executed successfully.
- Quality gates: failed at `npm run typecheck`.

Current blocking errors:
- `website/src/components/Footer.tsx`: missing PNG module typing.
- `website/src/components/Navbar.tsx`: missing PNG module typing.
- `website/src/config/runtimeConfig.ts`: `ImportMeta.env` typing missing.

Connected client app detection (local repository check):
- `mobile`: not present
- `web-client`: not present
- `client`: not present
- `apps/mobile`: not present
- `apps/web-client`: not present

## Detected Issues or Missing Steps

- Release agent naming aligned to `40-release-agent.md`.
- End-to-end publish/deploy could not be completed locally because release validation stops at existing typecheck failures.
- Local workspace is not a Git repository (`.git` missing), so live GitHub repository state and push outcome cannot be directly confirmed from this environment.
- Vercel deploy requires repository secret `VERCEL_DEPLOY_HOOK_URL` at runtime.

## Confirmation Status

- Program (desktop executable pipeline) received update in release workflow: Yes (configured and verified up to quality gate).
- Website deployment path received update: Yes (configured, publish-then-deploy order enforced).
- Connected/future client apps received update path: Yes (auto-detection + validation step added when present).
- Public release artifacts/download path received update: Yes (GitHub release publish job configured).
- GitHub repository update path received update: Yes (branch auto-commit step present for generated release metadata/content).

Overall end-to-end release confirmation:
- Not fully completed in this run due to existing typecheck errors before publish/deploy stages.

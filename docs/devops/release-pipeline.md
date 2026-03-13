# Release Pipeline

Date: 2026-03-11
Status: Proposed target design
Scope: automated desktop release pipeline for TriggerHub 2.0

## Goal

Implement a full automated release pipeline that:

- builds the desktop app
- creates the Windows EXE installer
- generates release notes
- publishes a GitHub release
- automates versioning

## Agent Use

Requested agent `90-release-agent` maps directly to:

- `agents/40-release-agent.md`

Requested agent `20-build-system-agent` is not present in this repository.

Closest GodAI equivalent used:

- `agents/core/07-ops.md`

## Current State

Existing release/build assets already present:

- GitHub workflow: `.github/workflows/release.yml`
- local release entrypoint: `npm run release`
- release validation: `npm run release:validate`
- Windows desktop build: `npm run desktop:release`
- Electron packaging via `electron-builder`
- GitHub publish provider configured in `package.json`

Current workflow already covers most of the target:

1. validate release inputs and quality gates
2. build Windows desktop artifacts on `windows-latest`
3. upload artifacts
4. publish a GitHub release
5. trigger website deployment

The missing piece for "full automated release pipeline" is version automation with a clear release source of truth and deterministic release-note generation.

## Target Pipeline

### Trigger Strategy

Use two triggers with distinct responsibilities:

1. `push` to `main`
   - validates release readiness
   - decides whether a new version should be cut
   - computes next version
   - updates release metadata
   - creates and pushes release tag

2. `push` tag `v*`
   - performs the actual release build
   - packages Windows artifacts
   - generates final release notes
   - publishes the GitHub release

This split avoids rebuilding release logic inside a single mutable branch run and keeps artifact publishing tied to immutable tags.

## Required Pipeline Stages

### 1. Validate

Run on every release-eligible change:

- `npm ci`
- `npm run release:validate`

This already includes:

- content sync
- root typecheck
- tests
- root build
- security audit gate
- website build
- release metadata validation

### 2. Version Automation

Introduce one source of truth for release increments.

Recommended rule:

- derive version bumps from Conventional Commits
- `feat:` => minor
- `fix:` => patch
- `BREAKING CHANGE` or `!` => major
- docs/chore-only changes => no release

Recommended implementation options:

- `semantic-release`
- or `release-please`

Preferred choice: `release-please`

Reason:

- simpler GitHub-native flow
- good fit for tag creation + GitHub release notes
- lower custom scripting burden than maintaining bespoke version logic

### 3. Version Writeback

When a releasable change is detected:

- update root `package.json` version
- update `package-lock.json`
- update any release manifest/version metadata under `releases/`
- optionally mirror version into website-visible generated content if needed

Version writeback should happen in a dedicated release PR or bot-authored release commit, not ad hoc inside the tag build job.

### 4. Tag Creation

After version update is merged:

- create annotated tag `v<version>`
- push tag to GitHub

The tag is the immutable release input for artifact generation and publication.

### 5. Desktop Build

Run on `windows-latest` because Windows packaging is the target artifact.

Required steps:

1. checkout repository at tag
2. install dependencies with `npm ci`
3. run root app build via `vite build`
4. run `electron-builder --win nsis --x64`
5. collect packaged artifacts

Existing script alignment:

- `npm run desktop:build`
- `npm run desktop:artifacts`
- `npm run desktop:release`

Expected outputs:

- installer EXE
- unpacked executable if produced
- `latest.yml`
- blockmaps for updater delivery

### 6. Release Notes

Release notes should be generated from merged commits since the previous tag, not handwritten in the workflow.

Recommended note sections:

- Features
- Fixes
- Internal / maintenance
- Breaking changes

Sources:

- Conventional Commit history
- optional release metadata from `releases/changelog-source.json`

Recommended behavior:

- automated generated notes are the default
- optional curated intro block can be prepended from repository metadata if needed

### 7. Publish GitHub Release

Publish from the tag workflow using:

- computed tag name
- generated release notes
- uploaded Windows artifacts

Artifacts to attach:

- `*.exe`
- `latest.yml`
- `*.blockmap`

### 8. Post-Release

After GitHub release succeeds:

- optionally trigger website deployment
- optionally publish update metadata for desktop auto-update
- record release status artifact

## Recommended GitHub Actions Design

### Workflow A: `release-prepare.yml`

Trigger:

- push to `main`

Responsibilities:

- install dependencies
- run `npm run release:validate`
- run version automation tool
- open/update release PR or create release commit
- produce next version and changelog

### Workflow B: `release.yml`

Trigger:

- push tags `v*`
- optional manual dispatch for recovery

Responsibilities:

- checkout tagged source
- install dependencies
- build desktop app
- create Windows EXE
- gather artifacts
- generate/publish GitHub release notes
- publish GitHub release

## Concrete Tooling Recommendation

### Version Automation

Use `release-please`.

Suggested behavior:

- maintain version in root `package.json`
- create/update release PR automatically
- when release PR is merged, create Git tag and GitHub release entry

Important adjustment for this repository:

- artifact publishing should happen after the tag exists
- if `release-please` creates the GitHub release too early, configure it to manage the version/tag and let the tag-triggered workflow update the release with final artifacts

### Build/Publish

Keep `electron-builder` for packaging and GitHub asset compatibility.

Use the existing scripts as the stable interface:

- `npm run release:validate`
- `npm run desktop:release`

This keeps local and CI release flows aligned.

## Version Source of Truth

Primary source:

- root `package.json` version

Secondary derived sources:

- Git tag `v<version>`
- release metadata files under `releases/`
- GitHub Release title/body

Rule:

- the tag and GitHub release version must always match `package.json`

## Proposed Flow End to End

1. Developer merges releasable commits into `main`.
2. `release-prepare.yml` runs validation.
3. Version automation computes next semantic version.
4. Automation opens or updates release PR.
5. Release PR is merged.
6. Automation creates tag `vX.Y.Z`.
7. Tag triggers `release.yml`.
8. Windows build job runs `npm run desktop:release`.
9. Workflow uploads EXE and update metadata.
10. Workflow generates final release notes.
11. Workflow publishes or updates GitHub release with attached assets.

## Integration With Existing Files

### Reuse As-Is

- `.github/workflows/release.yml`
- `scripts/run-release.ts`
- `scripts/release-orchestrator.ts`
- `package.json` desktop scripts
- `electron-builder` config in `package.json`

### Extend

- add a dedicated version automation workflow
- make release-note generation deterministic from commit history
- ensure asset names and upload paths match actual `electron-builder` outputs
- persist release version data into `releases/` as part of the release prepare step

## Required Secrets and Permissions

### GitHub

- `GITHUB_TOKEN` with `contents: write`

### Optional

- `VERCEL_DEPLOY_HOOK_URL` for website deployment

### Future if Code Signing Is Added

- Windows signing certificate secret(s)
- signing password secret(s)

Code signing is not required to satisfy the current goal, but unsigned installers will create Windows trust friction.

## Risks

1. Building Windows artifacts anywhere except Windows runners is fragile and should be avoided.
2. Letting multiple tools write the version independently will desynchronize tags, package metadata, and release notes.
3. Publishing GitHub releases from branch state instead of tags risks mutable releases.
4. If release notes depend on manually edited files only, they will drift from actual shipped changes.
5. Current artifact paths in the workflow should be rechecked against actual `electron-builder` output names before relying on them as the final contract.

## Implementation Plan

### Phase 1

- keep current `release.yml`
- verify artifact paths against actual desktop build output
- formalize tag-first release publishing

### Phase 2

- add `release-please` workflow for version automation
- generate release PRs from Conventional Commits
- sync version into release metadata

### Phase 3

- update tag workflow to publish final notes and assets onto the GitHub release created from the version automation step
- ensure manual dispatch remains available for recovery

## Acceptance Criteria

The pipeline is complete when:

1. a merged releasable change causes an automated version bump
2. a matching Git tag `vX.Y.Z` is created automatically
3. the tag build produces a Windows EXE installer
4. release notes are generated automatically from shipped changes
5. a GitHub release is published with the EXE and update metadata attached

## Recommended Next Step

Implement the version automation layer first, using `release-please`, then tighten `.github/workflows/release.yml` around tag-only artifact publishing so the current build/release scripts remain the execution backbone.

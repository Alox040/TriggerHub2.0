# Project Cleanup Phase 1

Date: 2026-03-11
Agents used: 11-debug-agent, 03-architecture, 04-implementation

## Scope

Phase 1 focused on safe cleanup only:

- transient local artifacts
- zero-value placeholders
- duplicate and legacy candidates that could be verified without risking runtime behavior

The repository had a heavily dirty worktree before this pass, so cleanup was limited to files with clear evidence of being unused.

## Detection Summary

### Duplicate / legacy candidates detected

- Legacy agent tree: `agent/**`
  - Status: already pending deletion before this pass
  - Verification: canonical references point to `agents/**`, not `agent/**`
- Prototype workspace: `design/**`
  - Status: detected, not removed
  - Reason: duplicate-like with `website/**`, but still internally coherent and not safe to delete without product confirmation
- Legacy source folders:
  - `src/deck-engine/`
  - `src/event-bus/`
  - `src/plugin-system/`
  - `src/profiles/`
  - `src/store/`
  - Status: detected, not removed
  - Reason: documented as legacy-preserved in existing architecture docs

### Unused files detected

- `scripts/sync-website-content.ts`
  - Zero bytes
  - No package script references
  - No workflow references
  - No code references
  - Only mentioned in generated inventory/cleanup documentation

### Transient artifacts detected

- `dev-start.err.log`
- `dev-start.out.log`
- `dev-start-5174.err.log`
- `dev-start-5174.out.log`
- `preview.err.log`
- `preview.out.log`
- `website-dev-check.err.log`
- `website-dev-check.out.log`
- `triggerhub_project_snapshot.zip`
- `triggerhub_snapshot_20260310_145824.zip`

These were local run artifacts and archives, not runtime dependencies.

## Reference Verification

### Verified runtime dependencies retained

- `scripts/collect-desktop-artifacts.mjs`
  - Referenced by `package.json` script `desktop:artifacts`
- `scripts/export-website-status.mjs`
  - Referenced by `website/README.md` and `website/src/data/projectStatus.ts`
- `scripts/feature-change-watcher.ts`
  - Referenced by root `package.json`, `website/package.json`, and workflow/docs
- `scripts/generate-ai-context.ts`
  - Referenced by project documentation and context snapshot docs
- `design/**`
  - Detected as a likely prototype workspace, but not proven unused from repository references alone
- `src/deck-engine/`, `src/event-bus/`, `src/plugin-system/`, `src/profiles/`, `src/store/`
  - Explicitly documented as legacy-preserved, so excluded from deletion

### Verified unused before deletion

- `scripts/sync-website-content.ts`
  - `rg` found no runtime, script, or workflow call sites
  - File size was `0`
  - `git ls-files` showed it was tracked, so it was removed explicitly

### Verified non-runtime before deletion

- Local `*.log` files listed above
  - No runtime call sites
  - Covered by `.gitignore`
  - Only referenced in cleanup/docs inventory files
- Local snapshot `.zip` files listed above
  - No runtime call sites
  - Covered by `.gitignore`
  - Only referenced in cleanup/docs inventory files

## Deleted Files

- `scripts/sync-website-content.ts`
- `dev-start.err.log`
- `dev-start.out.log`
- `dev-start-5174.err.log`
- `dev-start-5174.out.log`
- `preview.err.log`
- `preview.out.log`
- `website-dev-check.err.log`
- `website-dev-check.out.log`
- `triggerhub_project_snapshot.zip`
- `triggerhub_snapshot_20260310_145824.zip`

## Moved Files

- None in Phase 1

## Files Intentionally Not Removed

- `agent/**`
  - Already pending deletion in the existing worktree; not modified again in this pass
- `design/**`
  - High duplicate potential versus `website/**`, but still a strategic/product decision
- `docs/TriggerHub2_Projektpraesentation_2026-03-11_045254.pdf`
- `docs/TriggerHub2_Projektstatusbericht_2026-03-11.docx`
  - Generated-looking documents, but not deleted because they may be intentional deliverables
- Legacy source folders documented as preserved:
  - `src/deck-engine/`
  - `src/event-bus/`
  - `src/plugin-system/`
  - `src/profiles/`
  - `src/store/`

## Verification

Post-cleanup validation:

- `npm run build`: passed

Additional operational note:

- Two stale `vite preview` processes were found listening on `127.0.0.1:4173` and `127.0.0.1:4174`
- They were confirmed as TriggerHub-local preview processes and terminated so the locked `preview` logs could be deleted

## Follow-up Recommendations

1. Regenerate context/inventory artifacts after cleanup so generated docs stop listing the removed logs, zips, and placeholder script.
2. Decide whether `design/**` is still a maintained workspace or should be removed as a separate cleanup phase.
3. Finish the already-started legacy `agent/**` tree removal in a dedicated commit once all downstream references are confirmed.

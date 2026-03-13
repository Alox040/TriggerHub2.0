# PROJECT_CLEANUP_REPORT

Generated: 2026-03-10T23:46:30.647Z

## 1. Duplicate Files

- Exact duplicate groups found: 75
- High-confidence duplicate tree was `agent/agents` vs `agents/` before consolidation.
- High-confidence duplicate tree: `design/` vs `website/` (57 exact duplicate groups). Most exact matches are copied UI primitives, shared styles, and metadata files.
- Near-duplicate candidates found: 12. Strongest pairs include `design/package.json` vs `website/package.json`, `design/index.html` vs `website/index.html`, and `design/vite.config.ts` vs `website/vite.config.ts`.

Recommended canonical files:
- Keep `agents/**` as the canonical agent system tree.
- Keep `website/**` as canonical for the live marketing/product website.
- Treat `design/**` as a separate prototype workspace only if it is still intentionally maintained; otherwise remove/archive it wholesale.

## 2. Safe Removals

- `dev-start.err.log`
- `dev-start.out.log`
- `dev-start-5174.err.log`
- `dev-start-5174.out.log`
- `triggerhub_project_snapshot.zip`
- `triggerhub_snapshot_20260310_145824.zip`
- `website/dist/index.html`
- `website/dist/assets/index-B1lCGpyz.js`
- `website/dist/assets/index-BvU5fwc0.css`
- `website/dist/assets/41208bd857a758438641cb275dc7de957fd9fa9f-D6ScAN3P.png`

## 3. Manual Review Required

- Legacy duplicate tree `agent/agents/**` has been removed after migrating legacy-only files into `agents/**`.
- Entire `design/**` workspace: internally consistent and buildable, but separate from the active root app. Remove only if the prototype is no longer needed.
- Unreferenced UI/component leaves: 97 files, concentrated in `website/src/components/**`, `website/src/components/ui/**`, `design/src/app/components/ui/**`, and a few root `src/ui/components/**` leaves.
- Standalone analysis/context documents such as `architecture-decisions.md`, `change-log.md`, and `dependency_report.txt` are not in the active code path. Keep them only if they still serve documentation or audit purposes.
- Empty placeholder files detected: 27. These include root utility placeholders, generated content placeholders, and empty project-meta JSON files.

## 4. Legacy Artifacts

- Empty legacy directories from earlier architecture stages: `src/deck-engine`, `src/event-bus`, `src/plugin-system`, `src/profiles`, `src/store`.
- Duplicate legacy agent tree: `agents/**`.
- Prototype workspace likely left from an earlier design/import stage: `design/**`.
- Generated artifacts committed into the repo: `website/dist/**`, local logs, and zip snapshots.

## 5. Cleanup Recommendations

1. Remove transient artifacts (`website/dist/**`, logs, zip snapshots).
2. Delete `agents/**` after a final grep outside this repo for any external references.
3. Decide whether `design/**` remains strategic. If not, remove it as a single archive candidate.
4. Prune unreferenced UI leaf components only after the `design/**` decision, because many duplicates exist across both trees.
5. Clean up empty placeholder files/directories that are not required by generators.
6. Fix the existing root desktop build failure in `src/services/clip-service/clipExporter.ts` before treating build green-ness as a cleanup gate for desktop runtime code.

## 6. Optional Refactoring

- Extract duplicated UI primitives and styles from `design/**` and `website/**` into a shared package/module if both workspaces must survive.
- Collapse the agent system to a single canonical tree and update `.github/workflows/release.yml` to point only at that tree.
- Replace zero-byte placeholders with explicit fixtures or remove them to reduce false duplicate noise.

## 7. Optional Automation

- Add a CI cleanup audit that hashes project-owned files and flags duplicate trees.
- Add a dead-file scan for `src/` and `website/src/` rooted at current entry points, scripts, and workflows.
- Add a CI rule preventing accidental commits to generated output paths (`website/dist/**`, ad-hoc logs, zip snapshots).

## Validation Notes

- `npm run test`: passed (106 tests).
- `npm.cmd run build`: failed due to an existing app issue in `src/services/clip-service/clipExporter.ts`, unrelated to this cleanup analysis.
- `npm --prefix website run build`: passed.

## Full Index

- The full indexed inventory with path, type, size, hash, duplicate groups, and classifications is stored in `cleanup-plan.json`.

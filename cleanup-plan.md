# Cleanup Plan

Generated: 2026-03-10T23:46:30.647Z

This file is the execution-oriented companion to `PROJECT_CLEANUP_REPORT.md`. No files were deleted.

## Immediate Safe Actions

- Remove local logs and zip snapshots.
- Remove `website/dist/**` from version control if generated artifacts are not intentionally tracked.

## Approval-Gated Actions

- Delete `agents/**` after confirming no off-repo tooling still points to it.
- Remove/archive `design/**` only as a whole-workspace decision.
- Review the unreferenced UI leaf components before deleting them individually.

## Preconditions

- Preserve `agent/agents/**`, `.github/workflows/**`, `project-meta/**`, and the website content generation scripts.
- Fix the existing root desktop build issue before using build success as the final safety gate for desktop-side deletions.

## Evidence

- Indexed files: 499
- Exact duplicate groups: 75
- Manual-review items: 238
- Safe removals: 10
- Empty legacy directories: src/deck-engine, src/event-bus, src/plugin-system, src/profiles, src/store

## Machine-Readable Data

- See `cleanup-plan.json` for the full file index, hashes, duplicate groups, classifications, and validation results.

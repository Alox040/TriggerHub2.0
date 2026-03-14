# Project Meta

This folder contains structured product metadata and supporting architecture/status notes.

## Repository Role

- Secondary source of truth for generated website content and release metadata
- Inputs for `npm run website:sync`
- Reference layer for docs and agent workflows

## What Is Actively Used

- `features/*.json`
- `integrations/*.json`
- `status/platform-support.json`
- `status/build-status.json`
- `status/release-status.json`

The website content generator reads JSON metadata from this tree. Markdown files in this folder are supporting documentation and must not contradict the current code, tests, or verified build state.

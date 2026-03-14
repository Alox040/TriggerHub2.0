# Project Context

This folder holds stable cross-cutting context and evidence that is separate from product runtime code.

## Repository Role

- `website-status.json` is the source of truth for exported website status content
- `security-reports/` is a required evidence folder for release/security workflow checks
- Dated plans and point-in-time reports are historical reference, not runtime truth

## Priority Rules

When statements conflict:

1. Executable code, tests, and current build results win
2. `project-meta/` machine-readable status wins over narrative notes
3. Historical plans and reports stay as context only

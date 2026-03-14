# Project Context Index

This file is a stable pointer for the role of `project-context/`.

## Current Role

- product-independent reference context
- website status source via `project-context/website-status.json`
- security and release evidence via `project-context/security-reports/`
- historical planning material that should not outrank code or tests

## Source Of Truth Rules

1. Code, tests, and verified build output outrank context notes.
2. `project-meta/` and generated artifacts outrank historical plans.
3. Dated planning files in this folder are reference only unless a script explicitly consumes them.

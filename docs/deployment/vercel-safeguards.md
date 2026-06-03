# Vercel deployment safeguards

Minimal safeguards to avoid deploying the wrong project (desktop app instead of website).

## 1. Monorepo clarity

- **Root README** states that only `website/` is deployed to Vercel and Root Directory must be `website`.
- **website/README** states that this directory must be set as Root Directory in Vercel; deploying from repo root builds the desktop app.
- **Naming:** Root project is `triggerhub2` (desktop); website is `@triggerhub/website`. Scripts are namespaced: `website:build` vs `build`/`desktop:build:renderer`.

## 2. Documentation

- **docs/deployment/vercel-deployment.md** has a **Critical: Root Directory** section at the top and step-by-step setup with Root Directory = `website`.
- **docs/deployment/website-smoke-test.md** describes how to confirm the correct site is live (title, routes, API, wrong-app detection).
- Use the checklist in the main Vercel doc (or your runbook) before/after production deploys.

## 3. Developer mistakes

- **Build guard:** Root `package.json` has a `prebuild` script that runs `scripts/vercel-root-guard.mjs`. On Vercel (`VERCEL=1`), if the build runs from the repo root (no `vercel.json` in cwd), the script exits with code 1 and a clear message: set Root Directory to `website`. Local and non-Vercel CI do not set `VERCEL`, so the guard is a no-op.
- **Single source of truth:** Required Vercel settings (Root Directory, Build Command, Output Directory, env vars) are documented in `vercel-deployment.md`; point new setups there.

## 4. Vercel configuration pitfalls

- **Root Directory:** Must be `website`. If blank or `/`, the wrong app is built; the guard will fail the build on Vercel.
- **Framework:** Set to **Vite** so Build Command and Output Directory match the website (e.g. `npm run build`, `dist`).
- **Domains:** Assign `triggerhub.de` and `www.triggerhub.de` only to the project whose Root Directory is `website`. If the dashboard UI appears on the domain, domains are on the wrong project—remove them from that project and add them to the website project.
- **Post-deploy:** Run the smoke test (title, routes, `/api/auth/me`, no desktop sidebar) to confirm the correct app is live.

## Quick reference

| Item | Correct | Wrong |
|------|--------|--------|
| Root Directory | `website` | (blank) or `/` |
| Build output | Marketing SPA + `website/api` | Desktop UI, no `/api` |
| Page title on live site | "TriggerHub \| Automation" / "Creator Workflow" | "TriggerHub 2.0" |
| Nav on live site | Hero, Features, Pricing, Login | Sidebar: Dashboard, Triggers, Macros, Plugins, Settings |

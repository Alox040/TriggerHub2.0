# Vercel deployment: diagnosis and fix

**Goal:** Only the marketing website (`website/`) is deployed; the domain must not serve the desktop app dashboard.

---

## Diagnosis (completed in repo)

| Step | Result |
|------|--------|
| **1. Vercel projects in repo** | Only one deployable app: `website/` (has `vercel.json`). Root is desktop app (`triggerhub2`). |
| **2. Dashboard vs marketing** | Dashboard UI (Dashboard, Triggers, Macros, Plugins, Settings) = root app (`src/ui/navigation.tsx`). Marketing = `website/` (hero, Features, Pricing, nav from i18n). |
| **3. Website project** | Path `website/`, `package.json` with `build: vite build`, output `dist`. |
| **4. Website build** | Valid. `npm run build` in `website/` with `VITE_ACCESS_MODE=public_product` and `VITE_SESSION_TTL_MS` succeeds; output in `dist/`. |
| **5. Wrong-root behavior** | If Vercel Root Directory is `/` or blank: root `npm run build` runs → desktop renderer built to root `dist` → domain serves dashboard UI; no `website/api`. |
| **6. Correct Vercel config** | Root Directory: `website`; Framework: Vite; Build: `npm run build`; Output: `dist`; env: `VITE_ACCESS_MODE=public_product`, `VITE_SESSION_TTL_MS`. |
| **7. Domain fix steps** | In `vercel-deployment.md`: remove domains from wrong project → add to website project → set `triggerhub.de` as primary. |
| **8. Checklist** | In `vercel-deployment.md`: build settings, env, domains, live check, build logs. |
| **9. Smoke test** | `website-smoke-test.md`: title, routes, `/api/auth/me`, wrong-app detection. |
| **10. Safeguards** | Root `prebuild` runs `scripts/vercel-root-guard.mjs`; when `VERCEL=1` and build is from root, build fails with clear message. |

---

## What you must do in Vercel (manual)

1. **Fix Root Directory**  
   In the Vercel project that should serve triggerhub.de: **Settings → General → Root Directory** → set to **`website`** (not blank). Save.

2. **Fix domain assignment** (if the domain currently shows the dashboard)  
   - In the **wrong** project (the one that shows the dashboard): **Settings → Domains** → remove `triggerhub.de` and `www.triggerhub.de`.  
   - In the **website** project (Root Directory = `website`): **Settings → Domains** → add `triggerhub.de` and `www.triggerhub.de`.  
   - In the website project Domains, set **`triggerhub.de`** as primary.

3. **Environment variables**  
   In the website project: **Settings → Environment Variables**. Ensure **`VITE_ACCESS_MODE`** = **`public_product`** and **`VITE_SESSION_TTL_MS`** is a positive integer (e.g. `3600000`).

4. **Redeploy**  
   Trigger a new production deployment for the website project. Build logs should show build running from `website` and no Electron/electron-builder.

5. **Validate**  
   Follow `docs/deployment/website-smoke-test.md`: open https://triggerhub.de in incognito; confirm marketing site (hero, Features, Pricing), not sidebar (Dashboard, Triggers, Macros); `GET https://triggerhub.de/api/auth/me` returns 200.

---

## Reference

- **Exact settings & checklist:** `docs/deployment/vercel-deployment.md`
- **Smoke test:** `docs/deployment/website-smoke-test.md`
- **Safeguards:** `docs/deployment/vercel-safeguards.md`

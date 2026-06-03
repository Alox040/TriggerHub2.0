# Website smoke test – confirm correct site is live

Minimal checks to confirm the **marketing website** (not the desktop app) is deployed at the production domain.

**Base URL:** `https://triggerhub.de` (or your deployment URL)

---

## 1. Expected landing page indicators (correct site)

| Check | Expected |
|-------|----------|
| **Page title** | Contains `TriggerHub \| Automation` or `TriggerHub \| Creator Workflow` (from `website/index.html`). |
| **Meta description** | Refers to "creator and streaming workflows" or "Creator Workflow Automation". |
| **Visible nav / hero** | Marketing content: hero section, links like Features, Pricing, About, FAQ, Benefits, Login. No sidebar with "Triggers" or "Macros". |
| **Login link** | Link or button to `/login` (website login page). |

**Quick assertion:** Page title is **not** exactly `TriggerHub 2.0` (that is the desktop app title).

---

## 2. Routes to test

Open each URL; all should return **200** and the **marketing SPA** (same app, client-side routes).

| Route | Expected |
|-------|----------|
| `/` | Landing / hero. |
| `/features` | Features section. |
| `/pricing` | Pricing section. |
| `/about` | About section. |
| `/login` | Login page. |
| `/imprint` | Imprint (or redirect). |
| `/privacy` | Privacy (or redirect). |

**Optional:** `/impressum` → redirects to `/imprint`; `/datenschutz` → redirects to `/privacy` (per `vercel.json`).

---

## 3. API endpoints (correct site only)

Only the **website** project deploys Vercel Functions under `/api`. If these return **404**, the wrong project is likely deployed.

| Method | Endpoint | Expected (correct site) |
|--------|----------|---------------------------|
| GET | `/api/auth/me` | **200** with JSON (e.g. `{ "user": null }` or session payload). Not 404. |
| GET | `/api/profile/me` | **200** or **401**; not **404**. |

**Quick assertion:** `GET https://triggerhub.de/api/auth/me` must **not** be 404. If it is 404, the deployed project has no `website/api` (wrong app).

---

## 4. How to detect the wrong app (desktop UI)

If the **desktop app** is deployed by mistake, you will see:

| Indicator | Wrong app (desktop) |
|-----------|----------------------|
| **Page title** | Exactly `TriggerHub 2.0` (root `index.html`). |
| **Layout** | Sidebar navigation with: **Dashboard**, **Triggers**, **Macros**, **Plugins**, **Settings**. |
| **Content** | Dashboard/Triggers/Macros editor UI, not marketing hero/Features/Pricing. |
| **API** | `GET /api/auth/me` and `GET /api/profile/me` return **404** (no `website/api` in build). |

**Single decisive check:** If the first thing you see is a **sidebar with “Triggers” and “Macros”**, the wrong app is live. The marketing site has no such sidebar.

---

## 5. Minimal runbook

1. Open `https://triggerhub.de` in an incognito/private window.
2. **Title check:** Document title must contain "TriggerHub | Automation" or "Creator Workflow", and must **not** be exactly "TriggerHub 2.0".
3. **Content check:** Page shows marketing content (hero, Features/Pricing/About), **not** a sidebar with Dashboard / Triggers / Macros / Plugins / Settings.
4. **API check:** `curl -s -o /dev/null -w "%{http_code}" https://triggerhub.de/api/auth/me` → expect **200**, not **404**.

If all pass → correct website is live. If title is "TriggerHub 2.0" or sidebar shows Triggers/Macros or `/api/auth/me` is 404 → wrong project is deployed.

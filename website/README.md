# TriggerHub Website

This project is an isolated Vite frontend located in `website/`.

**Vercel:** This directory must be set as **Root Directory** in the Vercel project. Do not deploy from the repo root (that builds the desktop app).

## Auth v1

The website includes a minimal auth/access foundation with three access modes:

- `private_prelaunch` (legacy mode kept in the type model)
- `invite_only`
- `public_product` (current default and active mode)

Current behavior:

- Public marketing pages are reachable without a password.
- Public registration is disabled.
- Owner login is still required for protected routes such as `/app`, `/dashboard`, `/profile`, and `/settings`.
- Owner credentials are verified only on the server through `/api/auth/*`.
- Session is carried by an HMAC-signed JWT in an HttpOnly cookie and revalidated through `GET /api/auth/me`.
- Mutating auth endpoints require a double-submit CSRF token delivered through `th_csrf`.
- Browser builds are blocked if sensitive auth env values would be bundled or if required public website env values are missing.

Main files:

- `src/config/runtimeConfig.ts` (client-visible access mode flags only)
- `src/modules/auth/*` (server-backed login/logout/session state)
- `src/modules/access-control/*` (policy evaluation)
- `src/modules/identity/*` (user identity records, role source of truth)
- `src/modules/profile/*` (profile records, validation, profile service/runtime)
- `src/app/providers/AuthProvider.tsx`
- `src/app/providers/ProfileProvider.tsx`
- `src/app/routing/*` (route manifest + guard + router)
- `src/pages/LoginPage.tsx`, `src/pages/InternalPage.tsx`, `src/pages/ProfilePage.tsx`, `src/pages/ForbiddenPage.tsx`
- `api/auth/*.ts`

Target route model:

- Public: `/`, `/features`, `/pricing`, `/about`, `/login`
- Legacy redirects: `/signup` -> `/login`, `/access` -> `/`
- Protected: `/app`, `/dashboard`, `/profile`, `/settings`

Configuration:

1. Copy `.env.example` to `.env`.
2. Set client/runtime flags explicitly:
   - `VITE_ACCESS_MODE=public_product`
   - `VITE_SESSION_TTL_MS` to a positive integer
3. If you want protected owner routes to work, set server-side owner auth env values:
   - `OWNER_USER_ID`
   - `OWNER_EMAIL`
   - `OWNER_LOGIN_USERNAME`
   - `OWNER_LOGIN_PASSWORD_HASH`
   - `OWNER_LOGIN_PASSWORD_SALT`
   - `OWNER_LOGIN_PASSWORD_ITERATIONS`
   - `PRELAUNCH_SESSION_SECRET`

Important setup rule:

- Do not keep generic defaults such as `owner` or `owner@example.com` in deployed configuration. Use deployment-specific owner identity values.

Important:

- There are no bundled credential fallbacks, hashes, salts, session secrets or access keys.
- The website build fails if sensitive auth vars use a `VITE_*` prefix.
- The public website build requires `VITE_ACCESS_MODE=public_product` and a valid `VITE_SESSION_TTL_MS`.
- Owner auth remains server-backed through the Vercel API handlers and HttpOnly cookies for protected routes.
- Later production solution: full backend auth/session boundary with rotation, revocation and CSRF handling.

## Status Content Pipeline

The website status content is centralized and generated:

1. Source of truth: `project-context/website-status.json`
2. Export script: `scripts/export-website-status.mjs`
3. Generated website data: `website/src/data/projectStatus.ts`
4. UI rendering: `website/src/components/*` consume `projectStatus`

Update flow:

1. Edit `project-context/website-status.json`
2. Run `node scripts/export-website-status.mjs` from repository root
3. Build the website

## Local Development

```bash
cd website
npm install
npm run dev
```

## Production Build

```bash
cd website
npm install
npm run build
npm run preview
```

Build output is generated in `website/dist`.

## Tests

Auth/access tests are currently executed via the root Vitest suite:

```bash
npm run test
```

## Vercel

Use these settings:

- Root Directory: `website`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Deployment notes:

1. Set `VITE_ACCESS_MODE=public_product`.
2. Keep `VITE_SESSION_TTL_MS` set to a positive integer.
3. Keep owner auth env vars set only if you want protected owner routes to stay usable.
4. Add `triggerhub.de` and `www.triggerhub.de` in the Vercel Domains settings and set `triggerhub.de` as the primary domain if you want `www` redirected to the apex domain.

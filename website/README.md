# TriggerHub Website

This project is an isolated Vite frontend located in `website/`.

## Auth v1 (Owner-Only Prelaunch)

The website now includes a minimal auth/access foundation with three access modes:

- `private_prelaunch` (current default and active mode)
- `invite_only` (prepared)
- `public_product` (prepared)

Current behavior:

- A separate server-side prelaunch gate must be opened before the owner login is reachable.
- Public registration is disabled.
- Owner login is required for protected routes.
- Owner credentials are verified only on the server through `/api/auth/*`.
- Session is carried by an HMAC-signed JWT in an HttpOnly cookie and revalidated through `GET /api/auth/me`.
- Mutating auth endpoints require a double-submit CSRF token delivered through `th_csrf`.
- Browser builds are blocked if sensitive auth env values would be bundled or if required prelaunch env values are missing.

Main files:

- `src/config/runtimeConfig.ts` (client-visible access mode flags only)
- `src/modules/auth/*` (server-backed login/logout/session state)
- `src/modules/access-control/*` (policy evaluation)
- `src/modules/identity/*` (user identity records, role source of truth)
- `src/modules/profile/*` (profile records, validation, profile service/runtime)
- `src/app/providers/AuthProvider.tsx`
- `src/app/providers/PrelaunchGateProvider.tsx`
- `src/app/providers/ProfileProvider.tsx`
- `src/app/routing/*` (route manifest + guard + router)
- `src/pages/AccessPage.tsx`
- `api/_prelaunchGate.ts`
- `api/prelaunch-gate/login.ts`
- `api/prelaunch-gate/me.ts`
- `src/pages/LoginPage.tsx`, `src/pages/InternalPage.tsx`, `src/pages/ProfilePage.tsx`, `src/pages/ForbiddenPage.tsx`

Target route model:

- Public: `/access`, `/`, `/features`, `/pricing`, `/about`, `/login`
- Legacy redirect: `/signup` -> `/login`
- Protected: `/app`, `/dashboard`, `/profile`, `/settings`

Configuration:

1. Copy `.env.example` to `.env`.
2. Set server-side owner auth env values:
   - `OWNER_USER_ID`
   - `OWNER_EMAIL`
   - `OWNER_LOGIN_USERNAME`
   - `OWNER_LOGIN_PASSWORD_HASH`
   - `OWNER_LOGIN_PASSWORD_SALT`
   - `OWNER_LOGIN_PASSWORD_ITERATIONS`
   - `PRELAUNCH_SESSION_SECRET`
   - `PRELAUNCH_ACCESS_KEY`
3. Set client/runtime flags explicitly:
   - `VITE_ACCESS_MODE=private_prelaunch`
   - `VITE_SESSION_TTL_MS` to a positive integer
4. Set `PRELAUNCH_GATE_TTL_MS` to a positive integer.

Important setup rule:

- Do not keep generic defaults such as `owner` or `owner@example.com` in deployed configuration. Use deployment-specific owner identity values.

Important:

- There are no bundled credential fallbacks, hashes, salts, session secrets or access keys.
- The website build fails if sensitive auth vars use a `VITE_*` prefix.
- For `private_prelaunch`, the website build fails if required prelaunch env vars are missing or invalid.
- Temporary prelaunch solution: Vercel API login + JWT HttpOnly cookie + CSRF cookie.
- Additional prelaunch gate: Vercel API shared-secret gate + signed HttpOnly cookie.
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

1. Add `PRELAUNCH_ACCESS_KEY` as a long random shared secret in the Vercel project env.
2. Keep `PRELAUNCH_ACCESS_KEY` distinct from the owner login password.
3. Keep `PRELAUNCH_SESSION_SECRET` set; it signs the owner JWT session and the prelaunch gate cookie.
4. The new access lock is enforced in `website/api/_prelaunchGate.ts` and checked before all `/api/auth/*` handlers.
5. The gate entry page is routed through `/access` and wired in `website/src/app/routing/AppRouter.tsx`.

# TriggerHub Website

This project is an isolated Vite frontend located in `website/`.

## Auth v1 (Owner-Only Prelaunch)

The website now includes a minimal auth/access foundation with three access modes:

- `private_prelaunch` (current default and active mode)
- `invite_only` (prepared)
- `public_product` (prepared)

Current behavior:

- Public registration is disabled.
- Owner login is required for protected routes.
- Session requires a guard token pair (`localStorage` + `sessionStorage`) and is rejected on mismatch.
- Password verification uses PBKDF2 (`SHA-256`, configurable iterations/salt/hash).
- Owner auth is fail-closed when required runtime config is missing.

Main files:

- `src/config/runtimeConfig.ts` (access mode + auth config)
- `src/modules/auth/*` (login/logout/session/password hashing/auth service)
- `src/modules/auth/ownerAuthProvider.ts` (owner identity adapter)
- `src/modules/access-control/*` (policy evaluation)
- `src/modules/identity/*` (user identity records, role source of truth)
- `src/modules/profile/*` (profile records, validation, profile service/runtime)
- `src/app/providers/AuthProvider.tsx`
- `src/app/providers/ProfileProvider.tsx`
- `src/app/routing/*` (route manifest + guard + router)
- `src/pages/LoginPage.tsx`, `src/pages/InternalPage.tsx`, `src/pages/ProfilePage.tsx`, `src/pages/ForbiddenPage.tsx`

Target route model:

- Public: `/`, `/features`, `/pricing`, `/about`, `/login`, `/signup`
- Protected: `/app`, `/dashboard`, `/profile`, `/settings`

Configuration:

1. Copy `.env.example` to `.env`.
2. Set owner credentials via:
   - `VITE_OWNER_USER_ID`
   - `VITE_OWNER_EMAIL`
   - `VITE_OWNER_PASSWORD_HASH`
   - `VITE_OWNER_PASSWORD_SALT`
   - `VITE_OWNER_PASSWORD_ITERATIONS`
3. Set mode via `VITE_ACCESS_MODE`.
   - Route model is prepared for `private_prelaunch`, `invite_only`, `public_product`.
   - Signup page behavior can be toggled via `VITE_ENABLE_SIGNUP`.
4. Optionally set `VITE_SESSION_TTL_MS`.

Important:

- There are no bundled credential fallbacks.
- Missing owner config causes fail-closed auth behavior.
- For production/prelaunch deployment, all owner credential env values are mandatory.

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

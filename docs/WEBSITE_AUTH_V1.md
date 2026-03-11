# Website Auth v1

Date: 2026-03-10

## Goal

Minimal, extensible auth baseline for website mode `private_prelaunch` with owner-only protected access.

## Implemented Capabilities

- Login (owner account)
- Logout
- Additional prelaunch access gate before owner login
- Temporary prelaunch server auth via `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`
- Session handling via signed HttpOnly cookie
- Password hashing/verification (PBKDF2 SHA-256) on the server side
- In-memory rate limiting for `POST /api/prelaunch-gate/login` and `POST /api/auth/login`
- Minimal server-side security logging for login success/failure and rate-limit events
- Protected route handling with configurable access mode
- Build-time fail-closed behavior if sensitive client-side owner auth env vars are present
- Generic auth errors for invalid username/password combinations
- Prepared mode variants:
  - `private_prelaunch` (active default)
  - `invite_only` (prepared)
  - `public_product` (prepared)

## New/Updated Files

- `website/src/config/runtimeConfig.ts`
- `website/src/modules/auth/types.ts`
- `website/src/modules/auth/passwordHashing.ts`
- `website/src/modules/auth/ownerAuthProvider.ts`
- `website/api/_auth.ts`
- `website/api/auth/login.ts`
- `website/api/auth/me.ts`
- `website/api/auth/logout.ts`
- `website/api/_prelaunchGate.ts`
- `website/api/prelaunch-gate/login.ts`
- `website/api/prelaunch-gate/me.ts`
- `website/src/modules/auth/sessionStore.ts`
- `website/src/modules/auth/authService.ts`
- `website/src/modules/access-control/types.ts`
- `website/src/modules/access-control/policy.ts`
- `website/src/app/providers/AuthProvider.tsx`
- `website/src/app/providers/PrelaunchGateProvider.tsx`
- `website/src/app/routing/routeManifest.ts`
- `website/src/app/routing/accessGuard.ts`
- `website/src/app/routing/AppRouter.tsx`
- `website/src/pages/LoginPage.tsx`
- `website/src/pages/AccessPage.tsx`
- `website/src/pages/InternalPage.tsx`
- `website/src/pages/ForbiddenPage.tsx`
- `website/src/pages/WebsiteLandingPage.tsx`
- `website/src/App.tsx`
- `website/.env.example`
- `website/README.md`
- `src/tests/website-auth-v1.test.ts`

## Configuration

Environment variables:

- `VITE_ACCESS_MODE` (`private_prelaunch|invite_only|public_product`)
- `VITE_SESSION_TTL_MS`
- `OWNER_USER_ID`
- `OWNER_EMAIL`
- `OWNER_LOGIN_USERNAME`
- `OWNER_LOGIN_PASSWORD_HASH` (base64 PBKDF2 output)
- `OWNER_LOGIN_PASSWORD_SALT` (base64 salt)
- `OWNER_LOGIN_PASSWORD_ITERATIONS`
- `PRELAUNCH_SESSION_SECRET`
- `PRELAUNCH_ACCESS_KEY`
- `PRELAUNCH_GATE_TTL_MS`

## Validation

- Root test suite: `npm run test`
- Website build: `npm --prefix website run build`

## Constraints in v1

- No public registration flow implemented yet
- Temporary prelaunch server auth is intentionally minimal and owner-only
- Owner-only account model (single identity path)
- Rate limit state is in-memory per serverless instance (no cross-instance/global guarantees)
- Security logs are emitted via runtime logging only (no centralized audit backend in v1)
- Final production trust boundary still requires a fuller backend auth/session implementation

## Auth Architecture

- Temporary prelaunch path:
- Shared prelaunch access key is verified first on the server.
- Successful gate authorization issues a signed HttpOnly gate cookie.
- Owner credentials are read only on the server.
- Login issues a signed HttpOnly cookie.
- `/api/auth/*` requires an active prelaunch gate cookie before owner auth is evaluated.
- Client hydrates auth state from `GET /api/auth/me`.
- Future production path:
- Replace the temporary cookie-signing approach with the planned backend auth/session boundary.

## Related

- Profile extension based on separated identity/profile stores: `docs/WEBSITE_PROFILE_V1.md`
- Provider boundary details: `docs/WEBSITE_AUTH_PROVIDER_ARCHITECTURE.md`

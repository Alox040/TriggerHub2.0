# Website Auth v1

Date: 2026-03-10

## Goal

Minimal, extensible auth baseline for website mode `private_prelaunch` with owner-only protected access.

## Implemented Capabilities

- Login (owner account)
- Logout
- Session handling with TTL and storage guard pairing
- Password hashing/verification (PBKDF2 SHA-256)
- Auth identity is provided via provider interface (`AuthIdentityProvider`) instead of hardcoded in `AuthService`
- Protected route handling with configurable access mode
- Fail-closed owner auth behavior when mandatory runtime config is missing
- Prepared mode variants:
  - `private_prelaunch` (active default)
  - `invite_only` (prepared)
  - `public_product` (prepared)

## New/Updated Files

- `website/src/config/runtimeConfig.ts`
- `website/src/modules/auth/types.ts`
- `website/src/modules/auth/passwordHashing.ts`
- `website/src/modules/auth/ownerAuthProvider.ts`
- `website/src/modules/auth/sessionStore.ts`
- `website/src/modules/auth/authService.ts`
- `website/src/modules/access-control/types.ts`
- `website/src/modules/access-control/policy.ts`
- `website/src/app/providers/AuthProvider.tsx`
- `website/src/app/routing/routeManifest.ts`
- `website/src/app/routing/accessGuard.ts`
- `website/src/app/routing/AppRouter.tsx`
- `website/src/pages/LoginPage.tsx`
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
- `VITE_OWNER_USER_ID`
- `VITE_OWNER_EMAIL`
- `VITE_OWNER_USERNAME`
- `VITE_OWNER_PASSWORD_HASH` (base64 PBKDF2 output)
- `VITE_OWNER_PASSWORD_SALT` (base64 salt)
- `VITE_OWNER_PASSWORD_ITERATIONS`
- `VITE_SESSION_TTL_MS`

## Validation

- Root test suite: `npm run test`
- Website build: `npm --prefix website run build`

## Constraints in v1

- No public registration flow implemented yet
- No backend-issued HttpOnly cookie session yet
- Owner-only account model (single identity path)
- Client-side auth hardening is limited; final trust boundary still requires server-side session/auth

## Auth Architecture

- `AuthService` owns session lifecycle only.
- `AuthIdentityProvider` owns credential verification and identity issuance.
- `OwnerAuthProvider` is the current adapter using ENV-backed owner credentials.
- Future backend auth integration should add a new provider adapter without changing `AuthService`.

## Related

- Profile extension based on separated identity/profile stores: `docs/WEBSITE_PROFILE_V1.md`
- Provider boundary details: `docs/WEBSITE_AUTH_PROVIDER_ARCHITECTURE.md`

# Website Auth Provider Architecture

Date: 2026-03-10

## Goal

`AuthService` must not decide identity details itself. Identity issuance is delegated to a replaceable provider adapter.

## Contracts

### `AuthIdentity`

- `userId`
- `role`
- `email`
- `createdAt` (optional)

### `AuthIdentityProvider`

- `authenticate(request)` -> returns `AuthIdentity`
- `isSessionIdentityValid(identity)` -> validates hydrated identity against provider rules

## Current Adapter

### `OwnerAuthProvider`

- Legacy client-side adapter retained for tests and migration context
- Must not be used for deployed prelaunch builds because client env values are bundle-visible

### Temporary Prelaunch Server Auth

- Uses server-side env values (`OWNER_*`, `PRELAUNCH_SESSION_SECRET`)
- Uses an additional server-side shared secret gate (`PRELAUNCH_ACCESS_KEY`) before owner auth
- Performs password verification on the server
- Issues signed HttpOnly cookie
- Hydrates browser auth state via `GET /api/auth/me`

### Prelaunch Gate Layer

- Separate from owner identity/authentication
- Verified through `/api/prelaunch-gate/*`
- Issues its own signed HttpOnly gate cookie
- Enforced ahead of `/api/auth/*`

## Service Boundary

`AuthService` responsibilities:

- session lifecycle (create/hydrate/logout)
- session invariants (id format, ttl checks)
- calling provider contracts

`AuthService` no longer hardcodes:

- `userId: 'owner'`
- `role: 'owner'`

## Migration Path

To integrate backend auth later:

1. Replace the temporary signed-cookie prelaunch endpoints with the planned backend auth service.
2. Keep the browser-side contract centered on `GET /auth/me`, `POST /auth/login`, `POST /auth/logout`.
3. Remove the legacy client-side `OwnerAuthProvider` path from deployment wiring.

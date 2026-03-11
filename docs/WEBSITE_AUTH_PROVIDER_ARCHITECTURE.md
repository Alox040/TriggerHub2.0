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

- Uses ENV-backed owner credentials (`VITE_OWNER_*`)
- Performs password verification
- Returns owner identity for session creation
- Validates hydrated session identity against configured owner

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

1. Add a new provider adapter (e.g. `BackendAuthProvider`).
2. Keep `AuthService` unchanged.
3. Swap provider wiring in `AuthProvider`.

# Security Phase 2.1

Date: 2026-03-11
Scope: `website/` auth/API hardening, CI dependency auditing, security documentation
Status: Implemented in code, pending full CI verification in target hosting/runtime

## Summary

Phase 2.1 hardens the prelaunch website auth boundary without changing the existing architecture shape:

- secrets remain server-only and are blocked from `VITE_*` client exposure
- owner auth now uses an HMAC-signed JWT session cookie instead of a custom signed payload blob
- mutating auth endpoints require a CSRF token
- server-side auth and role checks are centralized in shared middleware
- route policy now supports explicit RBAC role lists
- API responses emit Helmet-style hardening headers through a shared response helper
- CI now runs `npm audit` for root and website production dependencies

Phase 2.1 also closes and re-verifies the earlier Electron IPC storage traversal concern documented as `SEC-007` in [docs/security/security-audit-phase2.md](/E:/Programmierung/TriggerHub2.0/docs/security/security-audit-phase2.md).

## Security Change Log

1. Removed credential exposure paths from frontend runtime.
   - Client providers only read the non-sensitive `th_csrf` cookie.
   - The prebuild guard now also blocks additional sensitive `VITE_*` names such as `VITE_OWNER_PASSWORD` and `VITE_JWT_SECRET`.

2. Moved secrets behind server-only environment variables.
   - Auth and gate handlers continue to read `OWNER_*`, `PRELAUNCH_SESSION_SECRET`, and `PRELAUNCH_ACCESS_KEY` only on the server.
   - Build validation now fails when `PRELAUNCH_SESSION_SECRET` and `PRELAUNCH_ACCESS_KEY` are identical.

3. Switched to JWT-based authentication.
   - `website/api/_auth.ts` now issues and verifies HS256 JWT session cookies.
   - Session claims include `sub`, `email`, `role`, `iat`, `exp`, `ver`, `jti`, and `lat`.
   - The cookie name stays `th_prelaunch_session` to avoid client routing changes.

4. Added server-side auth middleware.
   - `website/api/_middleware.ts` now centralizes:
     - method enforcement
     - authenticated session loading
     - role enforcement
     - CSRF validation
   - `POST /api/auth/logout` now relies on middleware instead of endpoint-local checks.

5. Introduced RBAC policy support.
   - Route policies now support `allowedRoles`.
   - Owner-only routes resolve to `allowedRoles: ['owner']`.
   - The current product mode remains `private_prelaunch`, so only owner sessions are issued today.

6. Enabled security headers.
   - `sendJson()` now applies Helmet-aligned API headers:
     - `Content-Security-Policy`
     - `Strict-Transport-Security`
     - `X-Frame-Options`
     - `X-Content-Type-Options`
     - `Referrer-Policy`
     - `Cross-Origin-Opener-Policy`
     - `Cross-Origin-Resource-Policy`
     - related hardening headers

7. Expanded rate limiting.
   - Existing in-memory login throttling remains in place for:
     - prelaunch gate login
     - owner login
   - Additional rate limiting now covers:
     - auth session reads
     - logout requests

8. Added dependency auditing to CI.
   - `.github/workflows/quality-gate.yml` now includes a blocking `dependency-audit` job.
   - `.github/workflows/ci-quality.yml` now runs `npm audit --omit=dev --audit-level=high`.

9. Re-verified the Electron IPC storage boundary.
   - `electron/main.cjs` validates storage keys with `assertValidStorageKey()` before deriving filesystem paths.
   - The current allowlist regex `^[A-Za-z0-9._-]+$` rejects `/`, `\\`, drive separators, and traversal tokens such as `../`.
   - `electron/preload.cjs` exposes only `load(key)` and `save(key, data)` for storage, keeping the renderer-side IPC surface minimal.
   - `src/storage/ipcStorageBridge.ts` remains a thin renderer bridge and does not derive paths locally.

## Migration Notes

1. Frontend request expectations changed.
   - `POST /api/prelaunch-gate/login`
   - `POST /api/auth/login`
   - `POST /api/auth/logout`
   All now require `X-CSRF-Token` matching the `th_csrf` cookie.

2. Bootstrap flow changed.
   - The browser must hit `GET /api/prelaunch-gate/me` or `GET /api/auth/me` before the first mutating auth request so the CSRF cookie is issued.
   - The existing providers now do this automatically.

3. Session cookie contents changed.
   - The `th_prelaunch_session` cookie is now a JWT, not the previous custom `payload.signature` format.
   - Any tooling that inspected the old cookie format must be updated.

4. Logout semantics changed.
   - Logout now requires both a valid authenticated session and a valid CSRF token.
   - Logging out with only the gate cookie no longer succeeds.

5. Route policy extension is backward compatible.
   - Existing `ownerOnly` checks still work.
   - New code should prefer `allowedRoles` for explicit RBAC.

## Required Environment Variables

- `OWNER_USER_ID`
- `OWNER_EMAIL`
- `OWNER_LOGIN_USERNAME`
- `OWNER_LOGIN_PASSWORD_HASH`
- `OWNER_LOGIN_PASSWORD_SALT`
- `OWNER_LOGIN_PASSWORD_ITERATIONS`
- `PRELAUNCH_SESSION_SECRET`
- `PRELAUNCH_ACCESS_KEY`
- `PRELAUNCH_GATE_TTL_MS`
- `VITE_SESSION_TTL_MS`
- `VITE_ACCESS_MODE=private_prelaunch`
- `VITE_ENABLE_SIGNUP=false`

## Residual Risks

- Rate limiting is still in-memory and therefore per-instance. Multi-instance or edge deployments should replace it with shared storage. Reference: `SEC-004` in [docs/security/security-audit-phase2.md](/E:/Programmierung/TriggerHub2.0/docs/security/security-audit-phase2.md).
- JWT revocation is still TTL-based. There is no server-side denylist or rotation store yet. Reference: `SEC-004` in [docs/security/security-audit-phase2.md](/E:/Programmierung/TriggerHub2.0/docs/security/security-audit-phase2.md).
- CSRF protection is applied to auth mutations, but not yet generalized to every future state-changing API route. Reference: website hardening scope in [docs/security/security-audit-phase2.md](/E:/Programmierung/TriggerHub2.0/docs/security/security-audit-phase2.md).
- The IPC storage channel now blocks path traversal via key validation, but stored payloads are still application-trust data rather than schema-validated records. A renderer compromise could still overwrite allowed keys such as `triggers`, `macros`, or `runtime-config`. Reference: `SEC-007` remediation in [docs/security/security-audit-phase2.md](/E:/Programmierung/TriggerHub2.0/docs/security/security-audit-phase2.md).
- The preload storage API is intentionally narrow, but it is not yet versioned or runtime-typed across the Electron boundary. Any future channel expansion should keep main-process validation mandatory. Reference: `SEC-007` in [docs/security/security-audit-phase2.md](/E:/Programmierung/TriggerHub2.0/docs/security/security-audit-phase2.md).

## IPC Storage Review Addendum

Date: 2026-03-12
Scope:
- `electron/main.cjs`
- `electron/preload.cjs`
- `src/storage/ipcStorageBridge.ts`

Findings:
- No path traversal finding remains in the current storage IPC implementation.
- `getStorageFilePath()` in [electron/main.cjs](/E:/Programmierung/TriggerHub2.0/electron/main.cjs) validates the key before calling `path.join(...)`, so traversal segments never reach filesystem path construction.
- The renderer cannot choose arbitrary directories through `src/storage/ipcStorageBridge.ts`; it can only pass a logical key through the preload bridge.
- The remaining risk is integrity of allowed logical keys after renderer compromise, not filesystem escape from `userData`.

Assessment:
- `SEC-007` is verified as remediated for the current implementation.
- Residual IPC risk is now limited to trusted-data abuse within approved storage slots, not host filesystem traversal.

## Verification Notes

Expected verification commands:

```bash
npm run test
npm run typecheck
npm --prefix website run build
```

Additional local verification completed for the Electron IPC storage boundary:

```bash
npm run test
```

- `src/tests/ipc-storage-bridge.e2e.test.ts` verifies a real Electron-process `save()` -> `load()` roundtrip through the storage IPC channel.
- Manual code review confirms the traversal fix from `SEC-007`: invalid keys are rejected in the main process before path derivation.

CI additionally runs `npm audit --omit=dev --audit-level=high` for root and website production dependencies.

# Security Audit Phase 2

Date: 2026-03-11
Primary agent: `40-security-audit-agent`
Scope: full repository scan with emphasis on website auth, owner access, secrets handling, frontend auth remnants, and release-facing security posture

## Executive Summary

The current website authentication boundary is substantially improved versus the earlier frontend-driven model:

- credentials are verified on backend endpoints under `website/api/auth/*`
- session integrity is enforced with a server-signed JWT cookie in [website/api/_auth.ts](/E:/Programmierung/TriggerHub2.0/website/api/_auth.ts)
- route-level RBAC on the client is present, but it is no longer the authoritative trust boundary for login/session integrity
- legacy browser session persistence is fail-closed and actively cleared in [website/src/modules/auth/sessionStore.ts](/E:/Programmierung/TriggerHub2.0/website/src/modules/auth/sessionStore.ts)

No live embedded production secrets were found in tracked application code. The remaining issues are mostly:

- example/default owner identity values in configuration templates
- client-side UX guards that must not be confused with backend authorization
- non-authoritative local profile/identity storage that duplicates role data for UI state
- outdated documentation that still describes older frontend auth behavior

One safe hardening change was implemented during this audit:

- removed default owner identity values from [website/.env.example](/E:/Programmierung/TriggerHub2.0/website/.env.example)

## Scope

Reviewed areas:

- `website/api/**`
- `website/src/**`
- `src/tests/**`
- `.github/workflows/**`
- `docs/**`
- `project-context/**`
- tracked env templates and README guidance

Scan focus:

- embedded credentials
- hardcoded auth secrets
- default owner accounts
- client-side auth enforcement
- server-side auth verification
- role integrity and session signing

## Findings

### SEC-001

- Bereich: Default owner identity in env template
- Schweregrad: Medium
- Betroffene Dateien/Komponenten:
  - [website/.env.example](/E:/Programmierung/TriggerHub2.0/website/.env.example)
- Risiko:
  - The repository template previously shipped `OWNER_USER_ID=owner`, `OWNER_EMAIL=owner@example.com`, and `OWNER_LOGIN_USERNAME=owner`.
  - These were not secrets, but they normalized a predictable owner identity and increased the chance of copied defaults reaching deployment.
- Empfehlung:
  - Keep owner identity values deployment-specific and server-only.
  - Do not ship generic owner identifiers in repo templates.
- Umsetzungsaufwand: niedrig
- Status:
  - Fixed in this audit by replacing the defaults with `SET_IN_HOSTING_PLATFORM_ONLY`.

### SEC-002

- Bereich: Client-side route enforcement still exists as a UX layer
- Schweregrad: Low
- Betroffene Dateien/Komponenten:
  - [website/src/app/routing/AppRouter.tsx](/E:/Programmierung/TriggerHub2.0/website/src/app/routing/AppRouter.tsx)
  - [website/src/modules/access-control/policy.ts](/E:/Programmierung/TriggerHub2.0/website/src/modules/access-control/policy.ts)
  - [website/src/app/routing/routeManifest.ts](/E:/Programmierung/TriggerHub2.0/website/src/app/routing/routeManifest.ts)
- Risiko:
  - Client route guards still redirect based on `identity`, `ownerOnly`, and `allowedRoles`.
  - This is acceptable only if treated as presentation logic. If future protected data or mutations are exposed without backend checks, these client guards could be mistaken for security controls.
- Empfehlung:
  - Keep all sensitive reads and writes behind backend endpoints with server-side auth checks.
  - Document clearly that route guards are non-authoritative.
  - For every new protected API, reuse middleware equivalent to [website/api/_middleware.ts](/E:/Programmierung/TriggerHub2.0/website/api/_middleware.ts).
- Umsetzungsaufwand: niedrig
- Status:
  - No code change required now; current auth endpoints do enforce server-side checks.

### SEC-003

- Bereich: Local UI data stores duplicate role-bearing identity state
- Schweregrad: Low
- Betroffene Dateien/Komponenten:
  - [website/src/modules/identity/userStore.ts](/E:/Programmierung/TriggerHub2.0/website/src/modules/identity/userStore.ts)
  - [website/src/modules/profile/profileStore.ts](/E:/Programmierung/TriggerHub2.0/website/src/modules/profile/profileStore.ts)
  - [website/src/app/providers/ProfileProvider.tsx](/E:/Programmierung/TriggerHub2.0/website/src/app/providers/ProfileProvider.tsx)
- Risiko:
  - The UI persists identity/profile records in `localStorage`, including a local `role` field.
  - A user can modify these browser values. Current code rehydrates auth from backend session state, not from these stores, so this does not currently grant authenticated access.
  - It can still create misleading UI state and becomes risky if future code starts trusting these stores for authorization.
- Empfehlung:
  - Treat these stores as cache-only, not identity truth.
  - Prefer deriving role directly from authenticated backend session snapshots for all sensitive UI decisions.
  - If multi-user features expand, move profile/identity storage server-side.
- Umsetzungsaufwand: mittel
- Status:
  - Residual risk only; no direct auth bypass identified in current flow.

### SEC-004

- Bereich: In-memory rate limiting and JWT revocation limitations
- Schweregrad: Medium
- Betroffene Dateien/Komponenten:
  - [website/api/_security.ts](/E:/Programmierung/TriggerHub2.0/website/api/_security.ts)
  - [website/api/_auth.ts](/E:/Programmierung/TriggerHub2.0/website/api/_auth.ts)
- Risiko:
  - Rate limiting is process-local and does not coordinate across multiple instances.
  - JWT sessions are signed and expiry-bound, but there is no shared revocation store or rotation denylist.
- Empfehlung:
  - Move rate-limit counters to shared storage for multi-instance deployment.
  - Introduce server-side revocation/rotation state if logout invalidation across replicas or emergency session kill is required.
- Umsetzungsaufwand: mittel
- Status:
  - Known residual risk; acceptable for current prelaunch scope only with documented limitation.

### SEC-005

- Bereich: Documentation drift around older frontend auth model
- Schweregrad: Low
- Betroffene Dateien/Komponenten:
  - [docs/phase-1-architecture-inventory.md](/E:/Programmierung/TriggerHub2.0/docs/phase-1-architecture-inventory.md)
  - [docs/WEBSITE_OWNER_ONLY_PRELAUNCH_SETUP.md](/E:/Programmierung/TriggerHub2.0/docs/WEBSITE_OWNER_ONLY_PRELAUNCH_SETUP.md)
  - [docs/WEBSITE_BACKEND_AUTH_CONTRACT.md](/E:/Programmierung/TriggerHub2.0/docs/WEBSITE_BACKEND_AUTH_CONTRACT.md)
- Risiko:
  - Several documents still describe older signed-cookie/session or client-auth-adjacent behavior.
  - Drift in security docs causes operational mistakes more often than code mistakes in prelaunch setups.
- Empfehlung:
  - Align all auth docs with the current JWT + CSRF + middleware implementation.
  - Mark obsolete flow descriptions as historical if they must remain.
- Umsetzungsaufwand: niedrig
- Status:
  - Partially mitigated by [docs/security/security-phase2-1.md](/E:/Programmierung/TriggerHub2.0/docs/security/security-phase2-1.md), but repository-wide doc sync is still pending.

### SEC-006

- Bereich: Release workflow could bypass mandatory quality validation
- Schweregrad: High
- Betroffene Dateien/Komponenten:
  - [release.yml](/E:/Programmierung/TriggerHub2.0/.github/workflows/release.yml)
  - [quality-gate.yml](/E:/Programmierung/TriggerHub2.0/.github/workflows/quality-gate.yml)
  - [ci-quality.yml](/E:/Programmierung/TriggerHub2.0/.github/workflows/ci-quality.yml)
- Risiko:
  - The release workflow validated release metadata, but it did not itself enforce the same typecheck, test, audit, and website-build requirements as the main quality gate.
  - A tag-triggered or manual release could therefore package and publish artifacts without rerunning the repository's mandatory release-readiness checks.
  - A second CI workflow duplicated parts of the quality gate and created status ambiguity.
- Empfehlung:
  - Make release packaging rerun the mandatory validation set.
  - Remove the overlapping CI workflow so one workflow remains the authoritative merge quality signal.
- Umsetzungsaufwand: niedrig
- Status:
  - Fixed in this audit by removing the overlapping workflow and binding `release.yml` to the mandatory validation set before packaging.

### SEC-007

- Bereich: Electron IPC storage key accepted unsanitized file identifiers
- Schweregrad: High
- Betroffene Dateien/Komponenten:
  - [main.cjs](/E:/Programmierung/TriggerHub2.0/electron/main.cjs)
  - [preload.cjs](/E:/Programmierung/TriggerHub2.0/electron/preload.cjs)
- Risiko:
  - The renderer-accessible storage IPC accepted arbitrary keys and mapped them directly into a filesystem path under `userData`.
  - While storage stayed in the main process, malformed keys still widened the trusted input boundary unnecessarily and increased path traversal risk.
- Empfehlung:
  - Validate storage keys in the main process before deriving file paths.
  - Keep renderer-exposed persistence APIs minimal and explicitly typed.
- Umsetzungsaufwand: niedrig
- Status:
  - Fixed in this audit by adding main-process storage key validation and keeping the IPC boundary narrow.

## Verification Results

### 1. Embedded credentials / hardcoded secrets

Findings:

- No live production secrets were found in tracked application code.
- CI uses explicit placeholder values in [quality-gate.yml](/E:/Programmierung/TriggerHub2.0/.github/workflows/quality-gate.yml); these are non-production placeholders and are documented as such.
- Test files contain test-only values such as `test-session-secret`, `shared-gate-secret`, and `change-me-owner-password`. These are isolated to test setup and not used by runtime code.

Assessment:

- No production credential leak found in frontend runtime code.

### 2. Default owner accounts

Findings:

- The repo template previously included generic owner identity defaults in `website/.env.example`.
- Example strings like `owner@example.com` remain in docs and tests as documentation/test fixtures.

Assessment:

- Template issue existed and was safe to harden.
- Example values in tests/docs are not runtime vulnerabilities by themselves.

### 3. Hardcoded auth secrets

Findings:

- Runtime auth reads secrets from server-side env only in:
  - [website/api/_auth.ts](/E:/Programmierung/TriggerHub2.0/website/api/_auth.ts)
  - [website/api/_prelaunchGate.ts](/E:/Programmierung/TriggerHub2.0/website/api/_prelaunchGate.ts)
- The frontend build guard blocks `VITE_*` prefixed secret leakage in [website/scripts/verify-prelaunch-security.mjs](/E:/Programmierung/TriggerHub2.0/website/scripts/verify-prelaunch-security.mjs).

Assessment:

- Current runtime implementation does not embed auth secrets in the browser bundle.

### 4. Client-side auth enforcement

Findings:

- Client route access is evaluated in:
  - [website/src/modules/access-control/policy.ts](/E:/Programmierung/TriggerHub2.0/website/src/modules/access-control/policy.ts)
  - [website/src/app/routing/AppRouter.tsx](/E:/Programmierung/TriggerHub2.0/website/src/app/routing/AppRouter.tsx)
- These checks determine redirects and rendering, not credential validation.
- Login, logout, gate access, and session checks are executed via backend endpoints:
  - [website/api/prelaunch-gate/login.ts](/E:/Programmierung/TriggerHub2.0/website/api/prelaunch-gate/login.ts)
  - [website/api/prelaunch-gate/me.ts](/E:/Programmierung/TriggerHub2.0/website/api/prelaunch-gate/me.ts)
  - [website/api/auth/login.ts](/E:/Programmierung/TriggerHub2.0/website/api/auth/login.ts)
  - [website/api/auth/me.ts](/E:/Programmierung/TriggerHub2.0/website/api/auth/me.ts)
  - [website/api/auth/logout.ts](/E:/Programmierung/TriggerHub2.0/website/api/auth/logout.ts)

Assessment:

- Authentication checks happen on backend endpoints.
- Client-side auth enforcement remains for UX/navigation only.

### 5. Session integrity

Findings:

- Session tokens are created and verified server-side in [website/api/_auth.ts](/E:/Programmierung/TriggerHub2.0/website/api/_auth.ts).
- Authenticated endpoint enforcement is centralized in [website/api/_middleware.ts](/E:/Programmierung/TriggerHub2.0/website/api/_middleware.ts).
- Browser storage is not used as authoritative session state; legacy session storage is cleared in [website/src/modules/auth/sessionStore.ts](/E:/Programmierung/TriggerHub2.0/website/src/modules/auth/sessionStore.ts).

Assessment:

- Session integrity is server-signed and browser-side tampering of auth state is fail-closed in the current implementation.

### 6. Role integrity

Findings:

- Authoritative role checks for protected auth operations are enforced server-side with `allowedRoles` in [website/api/_middleware.ts](/E:/Programmierung/TriggerHub2.0/website/api/_middleware.ts).
- The frontend receives a backend session snapshot and validates that the current prelaunch mode only accepts owner sessions in [website/src/modules/auth/backendSession.ts](/E:/Programmierung/TriggerHub2.0/website/src/modules/auth/backendSession.ts).
- Local UI stores can duplicate role data, but they do not currently mint or validate authenticated sessions.

Assessment:

- Roles cannot currently be escalated into authenticated backend access by editing frontend state alone.
- Client-side role duplication should still be treated as non-authoritative cache.

## Secure Replacements

1. Replace generic owner template identities with deployment-specific placeholders.
   - Implemented.

2. For future protected APIs, require server middleware by default.
   - Use a shared pattern equivalent to [website/api/_middleware.ts](/E:/Programmierung/TriggerHub2.0/website/api/_middleware.ts).

3. Reduce duplicated role state in browser storage.
   - Prefer deriving profile/role views from backend session or backend profile APIs instead of local `identity` persistence.

4. Add shared revocation and distributed rate limiting before broader rollout.
   - Needed for multi-instance deployment and stronger incident response.

## Implemented During Audit

- Updated [website/.env.example](/E:/Programmierung/TriggerHub2.0/website/.env.example) to remove generic owner identity defaults.
- Updated [website/README.md](/E:/Programmierung/TriggerHub2.0/website/README.md) to state that deployed owner identity values must be deployment-specific.
- Removed the overlapping CI workflow [ci-quality.yml](/E:/Programmierung/TriggerHub2.0/.github/workflows/ci-quality.yml) so `quality-gate.yml` remains the single authoritative merge gate.
- Tightened [quality-gate.yml](/E:/Programmierung/TriggerHub2.0/.github/workflows/quality-gate.yml) so root build smoke is blocking instead of advisory.
- Updated [release.yml](/E:/Programmierung/TriggerHub2.0/.github/workflows/release.yml) to rerun mandatory typecheck, tests, audits, and website validation before packaging.
- Hardened [main.cjs](/E:/Programmierung/TriggerHub2.0/electron/main.cjs) with storage key validation and explicit `webSecurity: true`.

## Quick Wins

- Sync all auth docs to the JWT + CSRF flow.
- Keep example/test identities clearly marked non-production.
- Add a lint or validation rule that rejects generic owner values like `owner@example.com` in deployment manifests if those manifests are ever checked in.

## Release Gate

- Audit erforderlich: ja
- Freigabestatus: freigegeben mit Restrisiko
- Offene kritische oder hohe Findings:
  - none after SEC-006 and SEC-007 remediation
- Offene mittlere Findings:
  - SEC-004 distributed rate limit and revocation gap

## Offene Fragen / Unsicherheiten

- This audit was local-code focused. Hosting-platform secret configuration was not directly inspected.
- Electron/service integrations outside website auth were scanned for obvious secret patterns, but not subjected to deep protocol-level testing in this pass.

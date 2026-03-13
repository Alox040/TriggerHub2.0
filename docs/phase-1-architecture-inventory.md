# Phase 1 Architektur-Inventur – TriggerHub 2.0

**Erstellt:** 2026-03-11
**Scope:** Authentifizierung, Autorisierung, Session-Handling, Runtime-Config, Route-Protection, Owner-only Zugriff, API-/Server-Grenzen, sicherheitsrelevante Zustände im Frontend
**Methode:** Vollständige Codebase-Analyse (src/, website/, website/api/, docs/)
**Hinweis:** Annahmen (nicht vollständig verifiziert) sind explizit markiert.

---

## 1. Architekturübersicht Ist-Zustand

### Schichtenmodell

```
BROWSER (React SPA)
  ├── AuthProvider            → React Context, In-Memory Session, KEIN Browser-Storage
  ├── PrelaunchGateProvider   → Gate-Status (isGateOpen), fetch-only
  ├── AppRouter               → Route Guard: wartet auf Init, dann evaluateRouteAccess()
  └── runtimeConfig.ts        → Build-time VITE_* vars, appAccessMode hardcoded 'private_prelaunch'

VERCEL SERVERLESS FUNCTIONS (website/api/)
  ├── POST /api/prelaunch-gate/login  → Verifiziert PRELAUNCH_ACCESS_KEY, setzt th_prelaunch_gate Cookie
  ├── GET  /api/prelaunch-gate/me     → Validiert Gate Cookie
  ├── POST /api/auth/login            → Erfordert Gate, verifiziert PBKDF2-Passwort, setzt th_prelaunch_session
  ├── GET  /api/auth/me               → Erfordert Gate, gibt Session-Snapshot zurück
  └── POST /api/auth/logout           → Erfordert Gate, löscht Session Cookie

SHARED KERNEL (website/api/)
  ├── _auth.ts           → HMAC-SHA256 Session-Cookie-Signing, PBKDF2-Verify, Config-Loader
  └── _prelaunchGate.ts  → HMAC-SHA256 Gate-Cookie-Signing, Access-Key-Verify, requirePrelaunchGate() Middleware
```

### Zwei-Layer-Gate-Architektur

```
Zugriff auf Owner-Bereich:

[Browser]
    │
    ▼
[Layer 1: Prelaunch Gate]
  POST /api/prelaunch-gate/login
  Input: PRELAUNCH_ACCESS_KEY (Shared Secret)
  Output: th_prelaunch_gate Cookie (HMAC-signiert, HttpOnly, 12h TTL)
    │
    ▼ (Gate-Cookie als Vorbedingung)
[Layer 2: Owner Auth]
  POST /api/auth/login
  Input: username + password (PBKDF2-SHA256, 210.000 Iterationen)
  Output: th_prelaunch_session Cookie (HMAC-signiert, HttpOnly, 8h TTL)
    │
    ▼ (Session-Cookie als Vorbedingung)
[Alle /api/auth/* Endpoints]
  requirePrelaunchGate() → readPrelaunchGateCookie() → Cookie-Signatur + Expiry
  readSessionCookie()     → Cookie-Signatur + role==='owner' + Expiry
```

### Key-Dateien

| Datei | Funktion | Zuständigkeit |
|---|---|---|
| [website/api/_auth.ts](../website/api/_auth.ts) | Session-Cookie-Signing, PBKDF2-Verify, Config-Loader | Server |
| [website/api/_prelaunchGate.ts](../website/api/_prelaunchGate.ts) | Gate-Cookie-Signing, Access-Key-Verify, `requirePrelaunchGate()` | Server |
| [website/api/auth/login.ts](../website/api/auth/login.ts) | POST /api/auth/login Handler | Server |
| [website/api/auth/me.ts](../website/api/auth/me.ts) | GET /api/auth/me Handler | Server |
| [website/api/auth/logout.ts](../website/api/auth/logout.ts) | POST /api/auth/logout Handler | Server |
| [website/api/prelaunch-gate/login.ts](../website/api/prelaunch-gate/login.ts) | POST /api/prelaunch-gate/login Handler | Server |
| [website/src/config/runtimeConfig.ts](../website/src/config/runtimeConfig.ts) | Build-time Env-Vars, Modus-Hardcoding | Client (Build) |
| [website/src/modules/auth/sessionStore.ts](../website/src/modules/auth/sessionStore.ts) | Deliberat `null`: KEIN Browser-Storage | Client |
| [website/src/modules/auth/backendSession.ts](../website/src/modules/auth/backendSession.ts) | `isOwnerSessionSnapshot()` Validierung | Client |
| [website/src/modules/auth/ownerAuthProvider.ts](../website/src/modules/auth/ownerAuthProvider.ts) | Client-side Auth-Provider (**ANNAHME:** nicht im aktiven Prod-Flow) | Client |
| [website/src/modules/auth/passwordHashing.ts](../website/src/modules/auth/passwordHashing.ts) | PBKDF2 via Web Crypto API (Client-side) | Client |
| [website/src/app/providers/AuthProvider.tsx](../website/src/app/providers/AuthProvider.tsx) | React Context, Session-Hydration, Login/Logout | Client |
| [website/src/app/providers/PrelaunchGateProvider.tsx](../website/src/app/providers/PrelaunchGateProvider.tsx) | Gate-Status, `authorize()` | Client |
| [website/src/app/routing/AppRouter.tsx](../website/src/app/routing/AppRouter.tsx) | Route Guard, Init-Synchronisation | Client |
| [website/src/app/routing/routeManifest.ts](../website/src/app/routing/routeManifest.ts) | Route-Definitionen mit Mode-Overrides | Client |
| [website/src/modules/access-control/policy.ts](../website/src/modules/access-control/policy.ts) | `evaluateRouteAccess()` Policy-Engine | Client |
| [website/src/pages/AccessPage.tsx](../website/src/pages/AccessPage.tsx) | Prelaunch-Gate UI | Client |

---

## 2. Sicherheitskritische Datenflüsse

### FLOW-1: Prelaunch Gate Opening — KRITISCH

```
AccessPage.tsx:24
  → authorize(accessKey)                                         [User-Input im State]
  → PrelaunchGateProvider.tsx:99
  → fetch('POST /api/prelaunch-gate/login', {body: {accessKey}}) [Plaintext JSON via HTTPS]
  → prelaunch-gate/login.ts:36
  → verifyPrelaunchAccessKey(accessKey, config)
  → _prelaunchGate.ts:105
  → accessKey === config.accessKey                               [⚠ STRING ===, KEIN timingSafeEqual!]
  → _prelaunchGate.ts:118
  → writePrelaunchGateCookie()
     Cookie: th_prelaunch_gate=<base64url(payload)>.<HMAC-SHA256>
     Flags: HttpOnly; SameSite=Strict; Secure(prod); Max-Age=43200000 (12h)
  → Client: setIsGateOpen(true) [in-memory only]
```

**Schwachstelle:** Zeile 105 in `_prelaunchGate.ts` – String-Vergleich ermöglicht Timing-Attack.

---

### FLOW-2: Owner Login — KRITISCH

```
LoginPage
  → backendAuthApi.login({username, password})
  → AuthProvider.tsx:44
  → fetch('POST /api/auth/login', {body: {username, password}})  [Klartext via HTTPS]
  → auth/login.ts:17
  → requirePrelaunchGate(req, res)
     → readPrelaunchGateCookie(req, config)
     → decodeGateCookieValue(cookieValue, secret)
        • timingSafeEqual(signature) ✓
        • scope === 'prelaunch_gate' ✓
        • expiresAt > Date.now() ✓
  → auth/login.ts:30: username.trim().toLowerCase()
  → auth/login.ts:36
  → verifyOwnerPassword(password, config)
     → _auth.ts:119: crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256')
     → _auth.ts:128: crypto.timingSafeEqual(derived, expected) ✓
  → createOwnerSessionPayload(config)
     → {userId, email, role: 'owner', issuedAt, expiresAt, sessionVersion: 1}
  → writeSessionCookie()
     Cookie: th_prelaunch_session=<base64url(payload)>.<HMAC-SHA256>
     Flags: HttpOnly; SameSite=Strict; Secure(prod); Max-Age=28800000 (8h)
```

---

### FLOW-3: Session Hydration (Page Reload) — HOCH

```
AuthProvider.tsx:111
  → fetch('GET /api/auth/me', {credentials: 'same-origin'})
     Sendet: Cookie: th_prelaunch_gate + th_prelaunch_session
  → auth/me.ts:11: requirePrelaunchGate(req, res)        [Gate-Cookie validieren]
  → auth/me.ts:23: readSessionCookie(req, config)
     → decodeSessionCookieValue(cookieValue, secret)
        • timingSafeEqual(signature) ✓
        • payload.role === 'owner' ✓
        • expiresAt > Date.now() ✓
  → Response: { authenticated: true, session: { userId, role, email, issuedAt, expiresAt, ... } }
  → AuthProvider.tsx:124: createServerBackedSession(response.session)
     → backendSession.ts:32: isOwnerSessionSnapshot(session)    [Typ-Validierung]
        • role === 'owner' ✓
        • alle Felder vorhanden ✓
        • ISO-Datumsprüfung ✓
        • sessionVersion >= 1 ✓
     → crypto.randomUUID() für sessionId/guardId (client-only UX)
  → setSession(identity) [in-memory]
```

---

### FLOW-4: Route Guard Evaluation — HOCH

```
AppRouter.tsx:86
  → useAuth() → { identity, isInitializing }
  → usePrelaunchGate() → { isGateEnabled, isGateInitializing, isGateOpen }

  [Warte auf isInitializing=false, isGateInitializing=false]

  → getResolvedRoutePolicy(currentPath, appAccessMode)
     → routeManifest.ts:170
     → Route Definition + modeOverrides['private_prelaunch']
  → resolveRouteDecision(policy, mode, identity, path)
     → evaluateRouteAccess()
        • allowInModes check
        • visibility === 'public' → allow
        • !identity → redirect /login
        • policy.ownerOnly && identity.role !== 'owner' → redirect /forbidden
        • sonst → allow
  → Render Route ODER Redirect
```

**Wichtig:** Clientseitiger Guard ist NICHT die letzte Linie. Server validiert unabhängig per Cookie.

---

### FLOW-5: Logout — MITTEL

```
useAuth().logout()
  → AuthProvider.tsx:157
  → fetch('POST /api/auth/logout', {credentials: 'same-origin'})
  → auth/logout.ts:11: requirePrelaunchGate(req, res)
  → auth/logout.ts:14: clearSessionCookie(res)
     → Set-Cookie: th_prelaunch_session=; Max-Age=0; HttpOnly; ...
  → setSession(null) [in-memory]
```

**Lücke:** Kein serverseitiges Blacklisting. Bereits ausgestellte Session-Cookies bleiben bis TTL gültig.

---

### Cookie-Signatur-Mechanismus (beide Cookies)

**Datei:** [website/api/_auth.ts:75-83](../website/api/_auth.ts)

```
Cookie-Value Format: <base64url(JSON.stringify(payload))>.<base64url(HMAC-SHA256)>

Signing:   createHmac('sha256', secret).update(encodedPayload).digest()
Verifying: timingSafeEqual(Buffer.from(provided), Buffer.from(expected)) ✓
```

---

## 3. Clientseitig vertrauenswürdig behandelte Zustände

| Zustand | Herkunft | Validierung clientseitig | Risikobewertung |
|---|---|---|---|
| `identity.role` (='owner') | GET /api/auth/me | `isOwnerSessionSnapshot()`: role==='owner' erzwungen | **NIEDRIG** – Server ist autoritativ |
| `identity.userId` | GET /api/auth/me | `isOwnerSessionSnapshot()`: string.length>0 | **NIEDRIG** |
| `identity.email` | GET /api/auth/me | `isOwnerSessionSnapshot()`: string.length>0 | **NIEDRIG** |
| `identity.expiresAt` | GET /api/auth/me | `isOwnerSessionSnapshot()`: ISO-Datum-Prüfung | **NIEDRIG** |
| `isGateOpen` | GET /api/prelaunch-gate/me | Server validiert Cookie-Signatur | **NIEDRIG** – nur UX, kein API-Schutz |
| `isInitializing` | AuthProvider intern | React-State-Machine, kein Netzwerkwert | **NIEDRIG** |
| `appAccessMode` | `runtimeConfig.ts` Build-time | Hardcoded 'private_prelaunch'; andere Werte ignoriert | **NIEDRIG** |
| Route-Policy | `routeManifest.ts` statisch | Statisch im Bundle, bypassbar via DevTools | **MITTEL** – Server-Gate bleibt unabhängig |
| `sessionId` / `guardId` | `crypto.randomUUID()` client | Client-generiert, nur für UX-Tracking | **NIEDRIG** – keine Server-Authority |
| `isSignupEnabled` | `runtimeConfig.ts` Build-time | `VITE_ENABLE_SIGNUP=false` → routing blockiert | **NIEDRIG** |

**Wichtige Einschränkung:** Route-Policy-Bypass im Client hat keine Auswirkung auf Server-Side-Endpoints. `requirePrelaunchGate()` wird in jedem `/api/auth/*`-Handler als erstes aufgerufen – unabhängig vom Client-State.

---

## 4. Stellen, an denen Secrets, Rollen oder Sessions im Frontend landen

### VERIFIZIERT SICHER – kein Problem

| Was | Wo im Frontend | Bewertung |
|---|---|---|
| `role: 'owner'` | React Context (in-memory) | OK – serverseitig validiert, kein Credential |
| `userId: string` | React Context (in-memory) | OK – kein Secret |
| `email: string` | React Context (in-memory) | OK – kein Credential |
| `VITE_SESSION_TTL_MS` | Bundle ([runtimeConfig.ts](../website/src/config/runtimeConfig.ts)) | OK – öffentlicher Konfig-Wert, kein Secret |
| `VITE_ACCESS_MODE` | Bundle | OK – 'private_prelaunch' ist kein Secret |
| `VITE_ENABLE_SIGNUP` | Bundle | OK – Feature-Flag |

### KEIN RISIKO MEHR – Legacy bereinigt

| Was | Datei | Zeile | Status |
|---|---|---|---|
| `localStorage['th.website.auth.session.v1']` | [sessionStore.ts](../website/src/modules/auth/sessionStore.ts) | 6 | Wird beim ersten Zugriff **aktiv gelöscht** |
| `sessionStorage['th.website.auth.session.guard.v1']` | [sessionStore.ts](../website/src/modules/auth/sessionStore.ts) | 8 | Wird beim ersten Zugriff **aktiv gelöscht** |

### DESIGN-RISIKO – dokumentierter Befund

| Was | Datei | Zeile | Schweregrad | Befund |
|---|---|---|---|---|
| `hashPasswordPbkdf2()` im Browser | [passwordHashing.ts](../website/src/modules/auth/passwordHashing.ts) | 41–67 | **MITTEL** | Klartext-Passwort geht im POST-Body an Server. Client-seitiger Hash wird **nicht** zum Server gesendet – Server hashiert eigenständig. Modul ist damit clientseitig vorhanden aber nicht im aktiven Auth-Flow genutzt. |
| `ownerAuthProvider.ts` mit Password-Config | [ownerAuthProvider.ts](../website/src/modules/auth/ownerAuthProvider.ts) | 8–37 | **ANNAHME** | Scheint nicht im aktiven Login-Flow (POST /api/auth/login) verwendet zu werden. Falls doch, würde Passwort clientseitig verarbeitet. Klärung erforderlich. |

### VERIFIZIERT SICHER – Env-Vars nicht im Bundle

Alle sensitiven Env-Vars sind ohne `VITE_`-Prefix und landen damit **nicht** im Browser-Bundle:
- `OWNER_LOGIN_PASSWORD_HASH` – PBKDF2-Hash (Server-only)
- `OWNER_LOGIN_PASSWORD_SALT` – Salt (Server-only)
- `OWNER_LOGIN_PASSWORD_ITERATIONS` – Iterations-Count (Server-only)
- `PRELAUNCH_SESSION_SECRET` – HMAC-Signing-Secret (Server-only)
- `PRELAUNCH_ACCESS_KEY` – Gate-Shared-Secret (Server-only)
- `OWNER_USER_ID`, `OWNER_EMAIL`, `OWNER_LOGIN_USERNAME` – Owner-Identity (Server-only)

Build-Guard: [website/scripts/verify-prelaunch-security.mjs](../website/scripts/verify-prelaunch-security.mjs) blockiert den Build, wenn `VITE_OWNER_*`-Variablen gesetzt sind.

---

## 5. Release-Blocker

### KRITISCH – Build/TypeCheck blockiert

| ID | Problem | Datei | Details |
|---|---|---|---|
| **RB-1** | `npm run build` FAIL | [src/services/clip-service/clipExporter.ts](../src/services/clip-service/clipExporter.ts) | `node:fs/promises` und `node:path` im Browser-Bundle – Rollup kann Node-Module nicht auflösen |
| **RB-2** | `npm run typecheck` FAIL | [website/src/components/Footer.tsx](../website/src/components/Footer.tsx), [Navbar.tsx](../website/src/components/Navbar.tsx) | PNG-Asset-Import ohne Module-Declaration |
| **RB-3** | `npm run typecheck` FAIL | [website/src/config/runtimeConfig.ts](../website/src/config/runtimeConfig.ts) | `ImportMeta.env` Typing fehlt |

### HOCH – Sicherheitsrisiko

| ID | Risiko | Datei | Zeile | Details |
|---|---|---|---|---|
| **OW-001** | Access Key Vergleich nicht timing-safe | [website/api/_prelaunchGate.ts](../website/api/_prelaunchGate.ts) | 105–106 | `accessKey === config.accessKey` (String-`===`) statt `crypto.timingSafeEqual()` – Timing-Attack möglich |
| **SEC-008** | Kein serverseitiges Session-Revocation | [website/api/_auth.ts](../website/api/_auth.ts) | 155–160 | Sessions nur via TTL-Ablauf; kein Blacklist; ausgestellte Cookies bleiben bis TTL gültig |
| **OW-003** | Kein Rate-Limiting | Alle `website/api/auth/*`, `website/api/prelaunch-gate/*` | – | Brute-Force auf Access-Key und Owner-Password nicht begrenzt |
| **OW-002** | Kein expliziter CSRF-Token | [website/api/auth/login.ts](../website/api/auth/login.ts):11, [logout.ts](../website/api/auth/logout.ts):11 | – | Nur `SameSite=Strict` als CSRF-Schutz; kein Double-Submit-Cookie oder CSRF-Token |
| **OW-004** | Kein Audit-Logging | Alle Auth-Handler | – | Failed Auth-Attempts, erfolgreiche Logins, Logouts nicht protokolliert |

### MITTEL – Architektur/Qualität

| ID | Risiko | Datei | Details |
|---|---|---|---|
| **OW-005** | Session Refresh nicht implementiert | [website/src/app/providers/AuthProvider.tsx](../website/src/app/providers/AuthProvider.tsx):87–89 | `refresh()` wirft Error; keine sliding-window-Erneuerung; User muss nach 8h re-auth |
| **OW-006** | Security-Header nicht dokumentiert/konfiguriert | – | CSP, HSTS, X-Frame-Options, Referrer-Policy nicht in Code/Vercel-Config sichtbar |
| **OW-007** | `passwordHashing.ts` clientseitig – Rolle unklar | [website/src/modules/auth/passwordHashing.ts](../website/src/modules/auth/passwordHashing.ts) | Modul im Frontend-Bundle, aber scheinbar nicht im aktiven Auth-Flow verwendet |

---

## 6. Priorisierte Umbauempfehlung für Phase 1

### Sofort – vor erstem Alpha-Zugang

**1. [KRITISCH] RB-1: Node-Module aus Browser-Bundle entfernen**
- Problem: `src/services/clip-service/clipExporter.ts` importiert `node:fs/promises`, `node:path`
- Ursache: Fehlende Build-Target-Trennung (Electron vs. Web)
- Maßnahme: Clip-Service mit Electron-IPC-Boundary isolieren; Vite-Konfiguration prüfen auf `external` für Node-APIs

**2. [KRITISCH] RB-2/RB-3: TypeScript-Fehler beheben**
- PNG-Asset-Typen: `vite-env.d.ts` mit `declare module '*.png'` ergänzen
- `ImportMeta.env`: `interface ImportMeta { readonly env: ImportMetaEnv }` in `vite-env.d.ts`

**3. [HOCH] OW-001: Access Key Timing-Attack schließen**
- Datei: [website/api/_prelaunchGate.ts:105](../website/api/_prelaunchGate.ts)
- Fix: `accessKey === config.accessKey` → `crypto.timingSafeEqual(Buffer.from(accessKey), Buffer.from(config.accessKey))`
- Einzeilige Änderung, sehr hohe Sicherheitswirkung

### Phase 1 – parallel zu Alpha (innerhalb von 2 Wochen)

**4. [HOCH] OW-003: Rate-Limiting auf Auth-Endpoints**
- Option A: Vercel Firewall-Regeln (einfachste Lösung, keine Code-Änderung)
- Option B: IP-basiertes In-Memory-Tracking in Serverless-Handler
- Ziel: Max. 5–10 Fehlversuche pro IP / Zeitfenster

**5. [MITTEL] OW-002: CSRF-Bewertung abschließen**
- `SameSite=Strict` ist für Prelaunch-Owner-Only-Scope ausreichend
- Für invite_only/public: Double-Submit-Cookie-Pattern implementieren
- Dokumentations-Entscheidung: explizit festhalten warum `SameSite=Strict` für Phase 1 akzeptiert wird

**6. [MITTEL] OW-007: passwordHashing.ts klären**
- Prüfen: Wird `ownerAuthProvider.ts` irgendwo im aktiven Flow genutzt?
- Falls nein: Modul entfernen oder als `@internal` / deprecated markieren
- Falls ja: Dokumentieren warum Client-Hash + Server-Hash (redundante Berechnung)

**7. [MITTEL] OW-006: Security-Header via vercel.json**
- `vercel.json` mit `headers`-Block ergänzen:
  - `Content-Security-Policy`
  - `Strict-Transport-Security`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: no-referrer`

### Vor invite_only / Public Beta (nicht Phase 1)

**8. [HOCH] SEC-008: Session Revocation**
- Vercel KV als Session-Blacklist implementieren
- `clearSessionCookie()` invalidiert serverseitig zusätzlich zum Cookie-Löschen
- Admin-Logout kann Sessions aller Clients invalidieren

**9. [MITTEL] OW-005: Session Refresh**
- `/api/auth/refresh`-Endpoint implementieren
- `refresh()` in `AuthProvider.tsx` aktivieren
- Sliding-Window-Expiry oder Re-Auth-Prompt nach TTL

**10. [MITTEL] OW-004: Audit-Logging**
- Security-Events strukturiert loggen (Vercel-Logs, externes SIEM)
- Events: `LOGIN_SUCCESS`, `LOGIN_FAIL`, `LOGOUT`, `GATE_FAIL`, `SESSION_EXPIRED`

---

## Anhang: Environment-Variablen-Übersicht

### Browser-sichtbar (VITE_-Prefix – im Bundle)

| Variable | Default | Sensitiv |
|---|---|---|
| `VITE_ACCESS_MODE` | `private_prelaunch` | Nein |
| `VITE_ENABLE_SIGNUP` | `false` | Nein |
| `VITE_SESSION_TTL_MS` | `28800000` (8h) | Nein |

### Server-only (kein VITE_-Prefix – nicht im Bundle)

| Variable | Verwendung | Sensitiv |
|---|---|---|
| `OWNER_USER_ID` | Owner-Identity | Nein (UUID) |
| `OWNER_EMAIL` | Owner-Identity | Mittel |
| `OWNER_LOGIN_USERNAME` | Auth | Mittel |
| `OWNER_LOGIN_PASSWORD_HASH` | PBKDF2-Verification | **Hoch** |
| `OWNER_LOGIN_PASSWORD_SALT` | PBKDF2-Verification | **Hoch** |
| `OWNER_LOGIN_PASSWORD_ITERATIONS` | PBKDF2-Config | Niedrig |
| `PRELAUNCH_SESSION_SECRET` | HMAC-Cookie-Signing | **Kritisch** |
| `PRELAUNCH_ACCESS_KEY` | Gate-Verification | **Hoch** |
| `PRELAUNCH_GATE_TTL_MS` | Gate-Cookie-TTL | Niedrig |

---

## Anhang: Sicherheitsstärken (verifikate Positiva)

| Maßnahme | Implementierung | Bewertung |
|---|---|---|
| HMAC-SHA256 Cookie-Signing | `_auth.ts:75-83`, `_prelaunchGate.ts:67-103` | Schützt vor Cookie-Tampering |
| `crypto.timingSafeEqual()` für Signatur-Vergleich | `_auth.ts:101`, `_prelaunchGate.ts:83` | Verhindert Timing-Attacken auf Cookies |
| `crypto.timingSafeEqual()` für Passwort | `_auth.ts:128` | Verhindert Timing-Attacken auf Passwort |
| HttpOnly Cookies | `_auth.ts:151`, `_prelaunchGate.ts:123` | JavaScript-Zugriff verhindert (XSS-Schutz) |
| SameSite=Strict | `_auth.ts:150`, `_prelaunchGate.ts:122` | CSRF-Basisschutz |
| Secure-Flag (Production) | `_auth.ts:147`, `_prelaunchGate.ts:119` | Nur über HTTPS |
| PBKDF2-SHA256, 210.000 Iterationen | `_auth.ts:119-128` | Brute-Force-resistentes Passwort-Hashing |
| Deliberat leerer Browser-Storage | `sessionStore.ts:11-23` | Kein Session-Hijacking via Storage-Manipulation |
| Legacy-Storage-Clearing | `sessionStore.ts:6-9` | Alte Sessions automatisch entfernt |
| `isOwnerSessionSnapshot()` Typ-Guard | `backendSession.ts:7-29` | Server-Response wird vor Nutzung validiert |
| `appAccessMode` hardcoded | `runtimeConfig.ts:4`, `parseAccessMode()` | Unbeabsichtigter Mode-Wechsel unmöglich |
| Build-Guard für sensitive VITE_-Vars | `website/scripts/verify-prelaunch-security.mjs` | Verhindert Credential-Leak in Bundle |
| Fail-closed bei fehlender Config | `_auth.ts:43-54`, `_prelaunchGate.ts:31-46` | Kein unsicherer Betrieb ohne Credentials |
| `requirePrelaunchGate()` in allen Auth-Handlern | `auth/login.ts:17`, `me.ts:11`, `logout.ts:11` | Gate-Bypass serverseitig unmöglich |

---

*Analyse-Basis: Vollständige Lektüre aller relevanten Dateien in `src/`, `website/`, `website/api/`, `docs/` am 2026-03-11.*

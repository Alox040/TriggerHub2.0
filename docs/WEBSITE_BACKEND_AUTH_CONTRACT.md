# Website Backend Auth Contract

Date: 2026-03-10
Status: Draft for migration planning
Scope: `website/` client contract for future server-side auth

## Ziel

Die aktuelle Website-Auth arbeitet noch mit einer clientseitig erzeugten Session. Fuer die naechste Produktversion wird eine serverseitige Auth-Grenze vorbereitet, ohne jetzt bereits ein komplettes Backend zu implementieren.

Dieser Contract definiert:

- minimale Backend-Endpunkte
- Request/Response-Schemas
- Session-Strategie mit HttpOnly-Cookie
- Fehler- und CSRF-Grundschutz
- Client-Adapter `BackendAuthProvider`
- Migrationspfad von Client-Auth zu Server-Auth

## Agenten-Koordination

### 01-orchestrator

- Aufgabe in Produkt-, Architektur-, Dokumentations- und Security-Scope zerlegt
- Minimal-Contract priorisiert, keine Vollimplementierung

### 02-product

- Aktueller Produktpfad bleibt owner-first
- Contract ist erweiterbar fuer spaeteres Signup und Multiuser

### 03-architecture

- Bestehende `AuthIdentityProvider`-Grenze bleibt erhalten
- Serverseitige Session wird als neue Trust Boundary eingefuehrt
- Client konsumiert Session-Status, bestimmt Auth nicht mehr selbst

### 08-docs

- API-Vertrag, Lifecycle, Migrationspfad und Diagramm dokumentiert

### 40-security-audit-agent

- Session-Hardening ueber HttpOnly-Cookie, SameSite, Rotation und CSRF-Basisschutz beruecksichtigt
- Keine neue Backend-Sicherheitsbewertung als Fakt behauptet; nur Contract- und Hardening-Vorgaben definiert

## Produktkontext

### Produktziel

- Owner-only Prelaunch heute
- spaeter oeffentliche Produktwebsite mit geschuetzten Bereichen

### MVP fuer diesen Contract

- Login
- Logout
- aktuelle Session abfragen
- Session refreshen

### Erweiterungspfad

- Signup
- Invite-only
- Multiuser mit Rollenmodell ueber `owner | user`

## Architekturziel

Der Browser speichert keine autoritative Session mehr in `localStorage` oder `sessionStorage`. Die autoritative Session liegt serverseitig. Der Browser haelt nur:

- ein HttpOnly Session-Cookie, das JavaScript nicht lesen kann
- optional ein nicht-sensitives CSRF-Cookie fuer mutierende Requests
- einen im Speicher gehaltenen Session-Snapshot aus `GET /auth/me`

Die bestehende Provider-Grenze bleibt erhalten:

- `AuthIdentityProvider.authenticate()` nutzt spaeter `POST /auth/login`
- `AuthIdentityProvider.isSessionIdentityValid()` validiert spaeter ueber `GET /auth/me`

## API-Endpunkte

### `POST /auth/login`

Zweck:
- Credentials pruefen
- serverseitige Session erstellen
- Session-Cookie setzen
- Session-Snapshot zur UI zurueckgeben

Request:

```json
{
  "username": "owner",
  "password": "plaintext-user-input"
}
```

Response `200 OK`:

```json
{
  "session": {
    "userId": "owner",
    "role": "owner",
    "email": "owner@example.com",
    "displayName": "Owner",
    "issuedAt": "2026-03-10T10:00:00.000Z",
    "expiresAt": "2026-03-10T18:00:00.000Z",
    "lastAuthenticatedAt": "2026-03-10T10:00:00.000Z",
    "sessionVersion": 1
  }
}
```

Set-Cookie:

```text
th_sid=<opaque-session-id>; HttpOnly; Secure; SameSite=Lax; Path=/
th_csrf=<random-csrf-token>; Secure; SameSite=Lax; Path=/
```

Fehler:
- `400` invalid payload
- `401` invalid credentials
- `423` account locked
- `429` rate limited

### `POST /auth/logout`

Zweck:
- serverseitige Session invalidieren
- Session-Cookie leeren

Request:
- leerer Body erlaubt
- CSRF-Schutz fuer mutierenden Request verpflichtend

Response `204 No Content`

Set-Cookie:

```text
th_sid=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0
th_csrf=; Secure; SameSite=Lax; Path=/; Max-Age=0
```

### `GET /auth/me`

Zweck:
- aktuelle Session pruefen
- Session-Snapshot fuer Guard und Hydration liefern

Request:
- kein Body
- liest Session nur aus Cookie

Response `200 OK`:

```json
{
  "authenticated": true,
  "session": {
    "userId": "owner",
    "role": "owner",
    "email": "owner@example.com",
    "displayName": "Owner",
    "issuedAt": "2026-03-10T10:00:00.000Z",
    "expiresAt": "2026-03-10T18:00:00.000Z",
    "lastAuthenticatedAt": "2026-03-10T10:00:00.000Z",
    "sessionVersion": 1
  }
}
```

Response `401 Unauthorized`:

```json
{
  "authenticated": false,
  "error": {
    "code": "AUTH_UNAUTHENTICATED",
    "message": "Authentication required"
  }
}
```

### `POST /auth/refresh`

Zweck:
- aktive Session verlaengern oder Session-ID rotieren
- neuen Session-Snapshot zurueckgeben

Request:
- leerer Body erlaubt
- CSRF-Schutz verpflichtend

Response `200 OK`:

```json
{
  "session": {
    "userId": "owner",
    "role": "owner",
    "email": "owner@example.com",
    "displayName": "Owner",
    "issuedAt": "2026-03-10T10:00:00.000Z",
    "expiresAt": "2026-03-10T20:00:00.000Z",
    "lastAuthenticatedAt": "2026-03-10T10:00:00.000Z",
    "sessionVersion": 2
  }
}
```

Fehler:
- `401` session missing or expired
- `409` session revoked or version conflict
- `429` refresh throttled

## Request/Response Schemas

### Login Request

```ts
interface BackendLoginRequest {
  username: string
  password: string
}
```

### Session Snapshot

```ts
interface BackendSessionSnapshot {
  userId: string
  role: 'owner' | 'user'
  email: string
  displayName?: string
  issuedAt: string
  expiresAt: string
  lastAuthenticatedAt: string
  sessionVersion: number
}
```

### Login Response

```ts
interface BackendLoginResponse {
  session: BackendSessionSnapshot
}
```

### Current Session Response

```ts
interface BackendAuthMeResponse {
  authenticated: boolean
  session?: BackendSessionSnapshot
  error?: BackendAuthErrorPayload
}
```

### Refresh Response

```ts
interface BackendRefreshResponse {
  session: BackendSessionSnapshot
}
```

### Error Payload

```ts
type BackendAuthErrorCode =
  | 'AUTH_INVALID_REQUEST'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_UNAUTHENTICATED'
  | 'AUTH_FORBIDDEN'
  | 'AUTH_SESSION_EXPIRED'
  | 'AUTH_SESSION_REVOKED'
  | 'AUTH_CSRF_REQUIRED'
  | 'AUTH_RATE_LIMITED'
  | 'AUTH_ACCOUNT_LOCKED'

interface BackendAuthErrorPayload {
  code: BackendAuthErrorCode
  message: string
  retryAfterSeconds?: number
}
```

## Session-Strategie

### Zielbild

- Serverseitige Session als Single Source of Truth
- Opaque Session-ID im HttpOnly-Cookie
- kein JWT-Zwang fuer den Browser
- `SameSite=Lax` als Baseline, `Secure` ausserhalb lokaler Dev-Umgebungen verpflichtend

### Cookie-Strategie

- Cookie-Name: `th_sid`
- Inhalt: opaker, zufaelliger Session-Identifier
- Attribute:
  - `HttpOnly`
  - `Secure`
  - `SameSite=Lax`
  - `Path=/`
- Optional spaeter:
  - `Domain=<product-domain>`
  - getrennte Cookies fuer Access/Refresh nur wenn ein echter Cross-Origin- oder Long-Lived-Refresh-Use-Case entsteht

### Session-Lifecycle

- Session wird bei `POST /auth/login` erstellt
- Session wird bei `GET /auth/me` validiert, aber nicht zwingend rotiert
- Session kann bei `POST /auth/refresh` rotiert und verlaengert werden
- Session wird bei `POST /auth/logout` serverseitig invalidiert

## Token-/Sessionstruktur

### Client-seitig sichtbar

Der Client sieht nur den Session-Snapshot:

```ts
interface BackendSessionSnapshot {
  userId: string
  role: 'owner' | 'user'
  email: string
  displayName?: string
  issuedAt: string
  expiresAt: string
  lastAuthenticatedAt: string
  sessionVersion: number
}
```

### Serverseitig empfohlen

```ts
interface PersistedAuthSession {
  sessionId: string
  userId: string
  role: 'owner' | 'user'
  email: string
  csrfToken: string
  issuedAt: string
  expiresAt: string
  lastAuthenticatedAt: string
  revokedAt?: string
  sessionVersion: number
  userAgentHash?: string
  ipHash?: string
}
```

Hinweise:

- `sessionId` bleibt opak und wird nie im JSON-Body an den Client zurueckgegeben.
- `csrfToken` ist von der Session-ID getrennt.
- `sessionVersion` erlaubt spaetere Revocation-/Rotation-Strategien.
- `userAgentHash` und `ipHash` sind optionale Hardening-Signale, keine harte Vertragsvorgabe.

## Auth-Error-Handling

### HTTP-Regeln

- `400` fuer syntaktisch oder semantisch ungueltige Requests
- `401` fuer fehlende, abgelaufene oder ungueltige Auth
- `403` fuer authentifiziert, aber nicht berechtigt
- `409` fuer Session-Konflikte oder serverseitige Revocation-Zustaende
- `423` fuer gelockte Accounts
- `429` fuer Rate-Limits

### Error-Body

Jeder Fehler liefert ein stabiles Fehlerobjekt:

```json
{
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid username or password"
  }
}
```

### Client-Verhalten

- `401` bei `GET /auth/me`: Session lokal auf `null` setzen
- `401` bei `POST /auth/refresh`: Session lokal auf `null` setzen und Login verlangen
- `403`: Access Guard zeigt Forbidden-Zustand
- `429`: UI kann Retry-Hinweis aus `retryAfterSeconds` ableiten

## CSRF-Grundschutz

Minimaler Basisschutz fuer mutierende Endpunkte:

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`

Empfohlene Strategie:

1. `SameSite=Lax` fuer Session-Cookie.
2. Double-submit-CSRF-Cookie `th_csrf` ohne `HttpOnly`.
3. Client sendet `X-CSRF-Token` Header mit dem Wert aus `th_csrf`.
4. Backend akzeptiert mutierende Requests nur, wenn Cookie und Header zusammenpassen.

Nicht erforderlich:

- `GET /auth/me` benoetigt keinen CSRF-Header.

## Auth-Lifecycle

### Login

1. Client sendet Credentials an `POST /auth/login`.
2. Backend validiert Credentials und erstellt Session.
3. Backend setzt `th_sid` und `th_csrf`.
4. Backend antwortet mit Session-Snapshot.
5. Client cached nur den Session-Snapshot im Speicher.

### Session-Validierung

1. App-Start oder Route-Guard triggert `GET /auth/me`.
2. Backend validiert Cookie-basierte Session.
3. Bei Erfolg erhaelt der Client den Session-Snapshot.
4. Bei `401` gilt die Session als beendet.

### Refresh

1. Kurz vor Ablauf oder bei App-Resume sendet der Client `POST /auth/refresh`.
2. Backend rotiert bei Bedarf Session-ID und Ablaufzeit.
3. Client ersetzt seinen lokalen Snapshot.

### Logout

1. Client sendet `POST /auth/logout` mit CSRF-Header.
2. Backend invalidiert Session und loescht Cookies.
3. Client setzt lokalen Snapshot auf `null`.

## Session-Validierung im Client

Der Client validiert spaeter keine Session mehr anhand eigener IDs oder TTLs als autoritative Wahrheit. Er darf nur noch:

- Session-Snapshot vorhanden oder nicht vorhanden unterscheiden
- Guard-Entscheidungen auf Basis des Snapshots treffen
- auf `401` fail-closed reagieren

Clientseitige Plausibilitaetspruefungen bleiben erlaubt, aber nur defensiv:

- fehlende `userId`
- unbekannte `role`
- ungueltiges `expiresAt`-Format

Die endgueltige Entscheidung liegt immer beim Backend.

## Definition `BackendAuthProvider`

Der neue Adapter wird spaeter das bestehende `AuthIdentityProvider`-Interface bedienen. Er kapselt den HTTP-Zugriff auf das Backend und mappt den Session-Snapshot auf `AuthIdentity`.

Verantwortung:

- `POST /auth/login` aufrufen
- `GET /auth/me` fuer Session-Validierung und Hydration nutzen
- serverseitige Fehler in stabile Client-Fehler uebersetzen

Keine Verantwortung:

- Session-ID selbst generieren
- Cookie direkt lesen oder schreiben
- Rollenlogik im UI erfinden

## Migration ClientAuth -> ServerAuth

### Phase 1: Contract First

- Dokument und Typen anlegen
- `BackendAuthProvider` als Adapter-Skelett vorbereiten
- noch keine Produktverdrahtung

### Phase 2: Dual-Path Vorbereitung

- `OwnerAuthProvider` bleibt aktiv
- `BackendAuthProvider` wird ueber Feature-Flag oder Runtime-Config waehlbar
- `AuthProvider` bekommt austauschbares Provider-Wiring

### Phase 3: Session-Hydration umstellen

- lokale `sessionStore`-Hydration nicht mehr autoritativ verwenden
- Hydration ueber `GET /auth/me`
- `AuthService` darf langfristig zu einem duennen Client-Auth-Orchestrator schrumpfen oder ersetzt werden

### Phase 4: Clientseitige Session entfernen

- `localStorage`- und `sessionStorage`-Sessionpfad deprecaten
- Guard-Pair-Logik nur noch fuer Legacy-Kompatibilitaet voruebergehend behalten
- nach erfolgreicher Umstellung alten Client-Session-Code entfernen

## Erweiterung zu Signup / Multiuser

Dieser Contract ist absichtlich so geschnitten, dass spaeter folgende Endpunkte kompatibel ergaenzt werden koennen:

- `POST /auth/signup`
- `POST /auth/password/forgot`
- `POST /auth/password/reset`
- `GET /users/me`
- `PATCH /users/me/profile`

Erweiterungsvorgaben:

- `role` im Session-Snapshot bleibt offen fuer zusaetzliche Rollen
- `userId` bleibt stabile serverseitige Identitaet
- `displayName` ist optional und darf spaeter aus `profile` statt `identity` kommen
- Invite-only oder Multiuser darf auf derselben Session-Struktur aufbauen

## Risiken und offene Punkte

- Solange `AuthService` noch lokal Sessions erzeugt, ist `BackendAuthProvider` nur vorbereitend nutzbar.
- Fuer Cross-Site- oder Subdomain-Setups kann `SameSite=Lax` spaeter angepasst werden.
- Rate-Limits, Lockout-Dauer und Audit-Logging sind bewusst noch keine finalen Produktregeln.

## Empfohlene naechste Umsetzungsschritte

1. `BackendAuthProvider` per Runtime-Flag vorbereiten.
2. `GET /auth/me` als erste echte Server-Integration priorisieren.
3. Danach `POST /auth/login` und `POST /auth/logout` anbinden.
4. Erst nach erfolgreicher Server-Hydration den lokalen SessionStore zurueckbauen.

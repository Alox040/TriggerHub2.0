# Website Auth Sequence Diagram

Date: 2026-03-10
Status: Draft

## Login -> Session -> Guard

```mermaid
sequenceDiagram
  autonumber
  participant U as User
  participant C as Website Client
  participant G as Access Guard
  participant A as Auth API
  participant S as Session Store

  U->>C: Submit username + password
  C->>A: POST /auth/login
  A->>S: Validate credentials and create session
  S-->>A: Persisted session
  A-->>C: 200 session snapshot + Set-Cookie(th_sid, th_csrf)
  C->>G: Update in-memory auth state
  G-->>C: Allow protected route

  Note over C,A: App reload or protected navigation
  C->>A: GET /auth/me
  A->>S: Resolve session via th_sid cookie
  S-->>A: Active session or miss
  A-->>C: 200 authenticated session OR 401 unauthenticated
  C->>G: Recompute access decision
  alt Session valid
    G-->>C: Allow route
  else Session invalid
    G-->>C: Redirect to /login
  end

  Note over C,A: Before expiry or after app resume
  C->>A: POST /auth/refresh + X-CSRF-Token
  A->>S: Rotate/extend session
  S-->>A: Updated session
  A-->>C: 200 session snapshot + Set-Cookie(th_sid)
  C->>G: Refresh in-memory auth state

  U->>C: Logout
  C->>A: POST /auth/logout + X-CSRF-Token
  A->>S: Revoke session
  S-->>A: Session invalidated
  A-->>C: 204 + clear cookies
  C->>G: Clear auth state
  G-->>C: Redirect to /login
```

## Guard-Regeln

- Protected routes trusten nur `GET /auth/me` bzw. den zuletzt serverseitig bestaetigten Snapshot.
- `401` fuehrt immer zu fail-closed.
- Rollenpruefung bleibt im Access-Control-Layer, nicht im HTTP-Adapter.

# Website Owner-Only Prelaunch Setup

Date: 2026-03-11

## 1. Aktueller Access-Modus

- Aktiver Modus: `private_prelaunch`
- Quelle: `website/src/config/runtimeConfig.ts`
- Effekt:
  - Marketing-Routen bleiben im aktuellen Modus effektiv owner-only.
  - Produkt-Routen (`/app`, `/dashboard`, `/profile`, `/settings`) sind owner-only.
  - Vor dem eigentlichen Owner-Login liegt zusaetzlich ein serverseitiges Prelaunch-Gate.

## 2. Relevante Dateien

### Laufzeit- und Routing-Konfiguration

- `website/src/config/runtimeConfig.ts`
- `website/src/app/routing/routeManifest.ts`
- `website/src/app/routing/accessGuard.ts`
- `website/src/app/routing/AppRouter.tsx`

### Prelaunch-Gate

- `website/api/_prelaunchGate.ts`
- `website/api/prelaunch-gate/login.ts`
- `website/api/prelaunch-gate/me.ts`
- `website/src/app/providers/PrelaunchGateProvider.tsx`
- `website/src/pages/AccessPage.tsx`

### Owner-Login und Session

- `website/api/_auth.ts`
- `website/api/auth/login.ts`
- `website/api/auth/me.ts`
- `website/api/auth/logout.ts`
- `website/src/app/providers/AuthProvider.tsx`
- `website/src/modules/auth/backendSession.ts`
- `website/src/modules/auth/sessionStore.ts`

### Dokumentation und Betrieb

- `website/.env.example`
- `website/scripts/verify-prelaunch-security.mjs`
- `website/README.md`
- `docs/WEBSITE_AUTH_V1.md`
- `docs/WEBSITE_AUTH_PROVIDER_ARCHITECTURE.md`

## 3. Wie der Owner-Login funktioniert

### Ablauf

1. Der Browser trifft zuerst auf das Prelaunch-Gate.
2. `POST /api/prelaunch-gate/login` prueft den serverseitigen `PRELAUNCH_ACCESS_KEY`.
3. Bei Erfolg wird ein signierter HttpOnly-Cookie `th_prelaunch_gate` gesetzt.
4. Erst danach ist der Owner-Login erreichbar.
5. `POST /api/auth/login` verifiziert `OWNER_LOGIN_USERNAME` und das PBKDF2-Passwort serverseitig.
6. Bei Erfolg wird ein signierter HttpOnly-Cookie `th_prelaunch_session` gesetzt.
7. Der Client hydriert den Auth-Zustand ausschliesslich ueber `GET /api/auth/me`.

### Wichtige Eigenschaften

- Owner-Credentials liegen nur serverseitig in Env-Variablen.
- Browser-Storage ist keine autoritative Sessionquelle.
- Der Client akzeptiert im Prelaunch nur servervalidierte Owner-Snapshots.
- `/api/auth/*` wird nur verarbeitet, wenn das Prelaunch-Gate bereits offen ist.

## 4. Sicherheitsgrenzen des aktuellen Setups

### Aktuelle Schutzgrenzen

- Serverseitiges Shared-Secret-Prelaunch-Gate vor dem Login
- Serverseitige Passwortpruefung fuer den Owner
- Signierte HttpOnly-Cookies fuer Gate und Session
- In-Memory Rate-Limit auf `POST /api/prelaunch-gate/login` und `POST /api/auth/login`
- Minimales Security-Logging fuer Login-Erfolg/Fehler und Rate-Limit-Ereignisse (ohne Klartext-Credentials)
- Fail-closed Build-/Runtime-Checks fuer notwendige Env-Werte
- Keine nutzbare Rolleneskalation ueber `localStorage` oder `sessionStorage`

### Aktuelle Grenzen

- Nur ein echter Benutzerpfad: `owner`
- Keine serverseitige Revocation-/Rotation-Strategie
- Kein dedizierter CSRF-Schutz fuer state-changing Auth-Endpunkte
- Rate-Limit ist pro Serverless-Instanz in-memory (kein globaler Counter ueber alle Instanzen/Regionen)
- Security-Logging ist minimal und ohne zentrales SIEM/Audit-Backend
- Noch keine vollstaendige produktionsreife Backend-Auth/AuthZ-Grenze

## 5. Spaetere Schritte fuer `invite_only`

- Invite-Modell festlegen:
  - Invite-Token, Invite-Code oder explizite Benutzerfreischaltung
- Mehrbenutzer-Identity statt nur `owner` einfuehren
- Rollenmodell erweitern:
  - mindestens `owner` und `user`
- Signup-/Invite-Redemption-Backend bauen
- Session- und Identity-Contracts fuer Nicht-Owner oeffnen
- Guard-/Policy-Logik anpassen:
  - geschuetzte Routen fuer eingeladene Benutzer erlauben
  - owner-only nur fuer Admin-/Owner-Bereiche behalten
- Profil-/Identity-Store vom Single-Owner-Pfad auf Multiuser erweitern
- Abuse-Schutz fuer Invite-Flows ergaenzen

## 6. Spaetere Schritte fuer `public_product`

- Oeffentliche Marketing-Routen wirklich oeffnen
- Produktive Signup- und Login-Flows fuer normale Benutzer bereitstellen
- Vollstaendige Backend-Auth mit Benutzerverwaltung einfuehren
- Session-Management produktionsreif machen:
  - Revocation
  - Rotation
  - CSRF
  - Audit-Logging
- Policy-Layer auf public + authenticated + owner-only sauber aufteilen
- Rate-Limits, Monitoring und Security-Header verbindlich aktivieren
- Signup erst freischalten, wenn Validierung, Abuse-Schutz und Recovery-Flows vorhanden sind

## 7. Temporäre Prelaunch-Lösungen, die später ersetzt werden müssen

- `PRELAUNCH_ACCESS_KEY` als Shared-Secret-Gate
  - spaeter ersetzen durch hostseitige oder produktive Access-Control-Strategie
- Signierte Cookie-Loesung in `website/api/_auth.ts`
  - spaeter ersetzen durch vollwertigen Backend-Session-Service
- Minimale Vercel-API-Auth unter `website/api/auth/*`
  - spaeter ersetzen durch produktive Auth-Endpoints mit Revocation/Rotation/CSRF
- Owner-only-Single-Identity-Modell
  - spaeter ersetzen durch echtes Multiuser-Identity-Modell
- Clientseitige Prelaunch-Gate-Seite `/access`
  - spaeter nur behalten, wenn das Produkt weiterhin eine vorgelagerte Zugangsebene braucht

## Einordnung

- Das aktuelle Setup ist fuer einen realistisch abgesicherten Owner-Only-Prelaunch geeignet.
- Es ist bewusst minimal und nicht als finale Produkt-Auth-Architektur gedacht.
- Die spaetere Zielrichtung bleibt:
  - `invite_only` als kontrollierter Mehrbenutzerzugang
  - `public_product` als oeffentliche Produkt-Website mit vollwertiger Backend-Auth

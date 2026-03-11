# Kontextdatei: Website Access/Auth/Identity/Profile Architekturplan

Datum: 2026-03-10
Scope: `website/` (oeffentliche Website), kompatibel mit bestehenden Architekturregeln und ADRs.

## Agenten-Koordination (aktiviert)

### 01-orchestrator
- Ziel in Teilaufgaben zerlegt
- Prioritaeten und Reihenfolge festgelegt
- Security-Trigger fuer spaetere Auth/AuthZ-Implementierung markiert

### 02-product
- Produktpfad beruecksichtigt:
  - Heute: nur Owner-Zugang
  - Spaeter: oeffentliche Produktwebsite
  - Optionales Nutzerkonto
  - Login nur fuer persoenliche/berechtigte Bereiche

### 03-architecture
- Saubere Grenzziehung definiert zwischen:
  - Access Control
  - Authentication
  - User Identity
  - Profile
  - Public Pages
  - Protected Pages
- Migrationsfaehige Zielstruktur ohne vorschnelle Vollimplementierung erstellt

### 08-docs
- Ergebnis als neue Kontextdatei dokumentiert
- ADR-Empfehlung formuliert (noch nicht final beschlossen)

## 1. Analyse der bestehenden Struktur

### Ist-Stand Architektur
- Es existieren zwei getrennte Flaechen:
  1. Desktop-App in `src/` (React + Electron, Clean/Hexagonal, Ports & Adapters)
  2. Website in `website/` (separates Vite-Frontend)
- `website/src/App.tsx` ist aktuell eine statische Landing-Komposition ohne Auth- oder Routing-Grenzlogik.
- Es gibt derzeit keine aktive Web-Implementierung fuer:
  - Authentifizierung
  - Autorisierung/Access Control
  - Session-Management
  - User-Identity-Modell
  - Profilsystem

### Relevante Regeln/ADRs
- `architecture-decisions.md` AD-001..AD-020: stabile Schichten, Contract-First, keine wilden Strukturbrueche.
- Agent-Regeln: Architektur nicht ohne Architecture-Logik umwerfen, dokumentationspflichtig arbeiten.
- Auth/AuthZ-Aenderungen sind Security-Trigger (spaeter verpflichtend Security-Audit-Phase einplanen).

## 2. Zielarchitektur (sauber getrennt)

### A. Access Control
Verantwortung:
- Entscheidung ueber Zugriff auf Seiten/Ressourcen
- Policy-Auswertung: `allow | deny | redirect`

Nicht enthalten:
- Login-Flow
- Profilfelder

### B. Authentication
Verantwortung:
- Sign-in / Sign-out
- Session-Lifecycle
- Token/Claims

Nicht enthalten:
- Seitenfreigabe-Policy
- Profilverwaltung

### C. User Identity
Verantwortung:
- Kanonische Nutzeridentitaet (stabile `userId`)
- Provider-Bindings (z. B. provider + subject)
- Account-Status

Nicht enthalten:
- Darstellungsprofil

### D. Profile
Verantwortung:
- Nutzerdarstellung (Display Name, Bio, Avatar, Sichtbarkeit)
- Getrennt von Identitaet; referenziert `userId`

Nicht enthalten:
- Auth-Session oder Berechtigungsregeln

### E. Public Pages
Verantwortung:
- Marketing-/Produktseiten ohne Login

### F. Protected Pages
Verantwortung:
- Owner-/Nutzerbereiche mit Auth + Access-Control-Pruefung

## 3. Empfohlene Ordner-/Modulstruktur

### Frontend (`website/src/`)

```text
website/src/
  app/
    routing/
      routeManifest.ts
      accessGuard.tsx
    providers/
      authProvider.tsx
      sessionProvider.tsx
  modules/
    access-control/
      policy.ts
      decisions.ts
      prelaunchMode.ts
    auth/
      authPort.ts
      authService.ts
      authAdapter.stub.ts
    identity/
      identityPort.ts
      identityService.ts
      identityTypes.ts
    profile/
      profilePort.ts
      profileService.ts
      profileTypes.ts
    public-pages/
      landing/
      pricing/
      docs/
    protected-pages/
      owner/
      account/
      profile/
```

### API-Grenze (zunaechst vorbereiten)

```text
platform/api/
  access-control/
  auth/
  identity/
  profile/
```

Hinweis:
- Falls vorerst kein eigener Backend-Service aufgebaut wird, bleiben dies zunaechst Vertragsgrenzen fuer spaetere Adapter.

## 4. Saubere Datenmodell-Trennung (logisch)

### `user_identity`
- `id` (stabile UUID)
- `primary_email`
- `auth_provider`
- `provider_subject`
- `account_status`
- `created_at`, `updated_at`

### `user_profile`
- `user_id` (FK -> user_identity.id)
- `display_name`
- `bio`
- `avatar_url`
- `visibility` (`private|public|unlisted`)
- `created_at`, `updated_at`

### `access_policy_binding`
- `subject_type` (`user|role|group`)
- `subject_id`
- `resource_pattern`
- `action`
- `effect` (`allow|deny`)

Wichtig:
- Session-/Token-Speicher bleibt getrennt von Profil-Daten.

## 5. Migrationspfad

### Phase 0 (jetzt): Private Prelaunch
Ziel:
- Nur Owner kommt auf die Seite.

Massnahmen:
- Infrastruktur-/Edge-Gate fuer gesamte Website (kein rein clientseitiger Schutz).
- Owner-Konfiguration per Env-Variablen.
- Route-Manifest bereits vorbereiten.

### Phase 1 (jetzt): Architektur-Fundament ohne Vollausbau
Ziel:
- Saubere Grenzen im Code, ohne sofortige Full-Auth-Implementierung.

Massnahmen:
- Ports/Services fuer auth/identity/profile anlegen (stubbed Adapter).
- Access-Control-Modul und Policy-Entscheidungen etablieren.
- Trennung public/protected Routen in Routing-Struktur.

### Phase 2 (naechster Schritt): Oeffentliche Produktseiten + Owner-Bereich
Ziel:
- Hauptseite oeffentlich erreichbar, Owner-Bereich geschuetzt.

Massnahmen:
- Oeffentliche Routen freigeben (`/`, `/pricing`, `/docs` etc.).
- Protected-Routen (`/owner/*`, `/account/*`) mit Auth + Access-Control absichern.
- Reale Auth-Provider-Integration beginnen.

### Phase 3 (spaeter): Optionale Registrierung + Profilsystem
Ziel:
- Nutzer koennen optional Konto erstellen und Profil pflegen.

Massnahmen:
- Registrierung/Login optional aktivieren.
- Identity-Record bei erster erfolgreicher Auth erstellen.
- Profilfluss separat anbieten (nicht Teil des Login-Flows).

### Phase 4 (nach Auth/AuthZ-Einbau): Hardening
Ziel:
- Sicherheits- und Betriebsreife.

Massnahmen:
- Security-Audit-Agent verpflichtend einplanen.
- Session-Hardening, CSRF/XSS/Rate-Limit-Pruefungen, Audit-Logging.

## 6. Was sofort gebaut vs nur vorbereitet wird

### Sofort bauen
1. Private Prelaunch-Zugangssteuerung auf Infrastruktur-Ebene.
2. `routeManifest` + `accessGuard` Grundstruktur.
3. `modules/access-control` Basismodule (Policy + Decision).
4. `auth/identity/profile` Port-Interfaces und Service-Skeletons.
5. Owner-only Policy-Pfad (konfigurationsbasiert, ohne vollen Self-Service-Account-Flow).

### Nur vorbereiten
1. Vollstaendige Auth-Provider-Implementierung.
2. Registrierung, Passwort-Reset, Recovery UX.
3. Vollstaendige Profilseiten inkl. Sichtbarkeitsmodi.
4. Erweiterte Rollenmodelle (RBAC/ABAC ueber Owner/User hinaus).
5. Persistente Backend-Admin-Tools.

## 7. Risiken

1. Vermischung von Identity und Profile
- Folge: schwer migrierbare Daten- und Rechtekopplung.
- Gegenmassnahme: getrennte Modelle/Ports von Anfang an.

2. Prelaunch nur clientseitig geschuetzt
- Folge: Seite bleibt direkt erreichbar.
- Gegenmassnahme: Edge/Infra-Gate verpflichtend.

3. Anbieterlogik in UI verteilt
- Folge: starker Vendor-Lock-in.
- Gegenmassnahme: Provider-spezifisches nur im Adapter.

4. Unscharfe Route-Policies
- Folge: versehentlich blockierte Public Pages oder offene Protected Pages.
- Gegenmassnahme: zentrales `routeManifest` + Policy-Tests.

5. Kein Security-Audit nach Auth-Aenderungen
- Folge: erhoehte Session-/Token-Risiken.
- Gegenmassnahme: Security-Audit-Agent als Pflicht-Phase nach Implementierung.

## 8. ADR-Empfehlung

Vorgeschlagene neue ADR:
- AD-021: Web Identity Boundary and Access Policy Separation

Entscheidungsvorschlag:
- Verbindliche Modultrennung fuer Website:
  - Access Control
  - Authentication
  - User Identity
  - Profile
  - Public Pages
  - Protected Pages
- Route-Policy-Manifest als Source of Truth.
- Auth-Provider nur hinter `authPort`-Adapter.

Begruendung:
- Erlaubt den Wechsel von Owner-only Prelaunch zu oeffentlicher Produktwebsite mit optionalem Account ohne Architekturbruch.

## 9. Klare Umsetzungsempfehlung fuer Codex-Folgeschritte

1. Routing-/Access-Skeleton erstellen:
- `website/src/app/routing/routeManifest.ts`
- `website/src/app/routing/accessGuard.tsx`

2. Domainen entkoppelt als Vertraege anlegen:
- `website/src/modules/auth/*`
- `website/src/modules/identity/*`
- `website/src/modules/profile/*`
- `website/src/modules/access-control/*`

3. Betriebsmodi per Env einfuehren:
- `PRELAUNCH_MODE=true|false`
- `OWNER_USER_ID=<id>`

4. Minimale Tests direkt mitliefern:
- Policy-Decision-Tests
- Owner-only-Decision-Tests
- Public-vs-Protected-Routen-Tests

5. Danach separaten Implementierungsauftrag fuer reale Auth-Integration starten und im Anschluss Security-Audit-Agent ausfuehren.

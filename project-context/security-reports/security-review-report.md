# Security Review Report

## 1. Executive Summary
- Sicherheitsstatus:
  - Die Owner-Only-Prelaunch-Website wurde gegen einfache clientseitige Rollen- und Session-Manipulation weiter gehaertet.
- Groesste Risiken:
  - Es bleibt ein Restrisiko durch die bewusst minimale Prelaunch-Auth ohne serverseitige Revocation, CSRF-Haertung und Logging.
- Wichtigste Sofortmassnahmen:
  - Legacy-`localStorage`-/`sessionStorage`-Sessionpfad fail-closed deaktiviert.
  - Owner-Only-Session-Snapshots werden clientseitig nur noch aus servervalidierten Daten akzeptiert.
  - Reload-Initialisierung blockiert Guards, bis `/api/auth/me` abgeschlossen ist.
  - Zusaetzliche serverseitige Prelaunch-Gate-Sperre vor `/api/auth/*` eingefuehrt.
  - `/signup` bleibt policy-seitig blockierbar.

## 2. Scope
- Gepruefte Bereiche:
  - `website/api/auth/*`
  - `website/api/prelaunch-gate/*`
  - `website/api/_prelaunchGate.ts`
  - `website/src/config/runtimeConfig.ts`
  - `website/src/modules/auth/*`
  - `website/src/modules/access-control/*`
  - `website/src/app/routing/*`
  - `website/src/app/providers/AuthProvider.tsx`
  - `website/src/pages/LoginPage.tsx`
  - Tests in `src/tests/website-auth-v1.test.ts`, `src/tests/website-browser-guards.test.ts`
- Nicht gepruefte Bereiche:
  - Infrastruktur/Hosting-Header/CSP/Rate-Limits
  - serverseitige Revocation-/Rotation-Mechanismen jenseits des signierten Prelaunch-Cookies

## 3. Findings
### SEC-001
- Titel: Produktive Credential-Fallbacks im Frontend entfernt
- Bereich: Secrets und Konfiguration
- Schweregrad: behoben (vorher kritisch)
- Beschreibung:
  - Harte Default-Credentials wurden entfernt; Owner-Konfiguration ist jetzt mandatory.
- Betroffene Dateien / Komponenten:
  - `website/src/config/runtimeConfig.ts`
  - `website/.env.example`
- Risiko / Schadensszenario:
  - Vorher konnten Bundle-extrahierte Defaults den Owner-Zugang kompromittieren.
- Empfehlung:
  - Beibehalten und zusaetzlich Build-/Deploy-Checks auf erforderliche Env-Werte ergaenzen.
- Umsetzungsaufwand: klein

### SEC-002
- Titel: Fail-closed bei fehlender Owner-Konfiguration
- Bereich: Authentifizierung und Autorisierung
- Schweregrad: behoben (vorher kritisch)
- Beschreibung:
  - Fehlt Owner-Konfiguration, wird `authConfig` nicht erzeugt; Login bleibt deaktiviert.
- Betroffene Dateien / Komponenten:
  - `website/src/config/runtimeConfig.ts`
  - `website/src/app/providers/AuthProvider.tsx`
  - `website/src/pages/LoginPage.tsx`
- Risiko / Schadensszenario:
  - Vorher bestand Risiko eines unsicheren Startup-Pfads.
- Empfehlung:
  - Zusaetzlich CI/Predeploy Gate einfuehren (Env-Validation vor Build/Deploy).
- Umsetzungsaufwand: klein

### SEC-003
- Titel: Browser-Storage ist kein autoritativer Sessionpfad mehr
- Bereich: Session-Sicherheit
- Schweregrad: behoben (vorher hoch)
- Beschreibung:
  - `createLocalSessionStore()` liest keine persistierten Sessions mehr und entfernt verbliebene Legacy-Eintraege aktiv.
  - Dadurch fuehrt Manipulation von `localStorage` oder `sessionStorage` nicht mehr zu einer nutzbaren Session-Hydration.
- Betroffene Dateien / Komponenten:
  - `website/src/modules/auth/sessionStore.ts`
  - `website/src/modules/auth/authService.ts`
  - `src/tests/website-browser-guards.test.ts`
  - `src/tests/website-auth-v1.test.ts`
- Risiko / Schadensszenario:
  - Vorher existierte ein naheliegender Eskalationspfad ueber manipulierbaren Browser-Storage.
  - Jetzt ist Browser-Storage fuer Prelaunch-Auth nur noch Legacy-Muell, nicht mehr Autoritaetsquelle.
- Empfehlung:
  - Legacy-Sessionstore mittelfristig ganz entfernen, sobald keine Altpfade mehr darauf referenzieren.
- Umsetzungsaufwand: mittel

### SEC-004
- Titel: Owner-Only-Session-Snapshots werden strikt validiert
- Bereich: Rollenpruefung / Policy-Vorbedingung
- Schweregrad: behoben (vorher hoch)
- Beschreibung:
  - Der Client akzeptiert im Prelaunch nur Backend-Snapshots mit `role: owner`, valider Zeitlogik und vollstaendigen Pflichtfeldern.
  - Manipulierte oder fehlerhafte Session-Responses werden fail-closed verworfen.
- Betroffene Dateien / Komponenten:
  - `website/src/modules/auth/backendSession.ts`
  - `website/src/app/providers/AuthProvider.tsx`
  - `src/tests/website-auth-v1.test.ts`
- Risiko / Schadensszenario:
  - Ohne diese Invarianten koennte eine fehlerhafte oder manipulierte Response eine unzulaessige Identitaet in den Guard-Layer einspeisen.
- Empfehlung:
  - Die gleiche Snapshot-Validierung spaeter serverseitig mit Schema- und Policy-Checks absichern.
- Umsetzungsaufwand: klein

### SEC-005
- Titel: Reload-Initialisierung war vor Session-Validierung offen fuer Fehlentscheidungen
- Bereich: Guards / Initialisierung nach Reload
- Schweregrad: behoben (vorher mittel)
- Beschreibung:
  - Protected-Routen konnten beim Reload vor Abschluss von `/api/auth/me` auf `/login` umgelenkt werden.
  - Der Router wartet jetzt auf die Initialisierung, bevor Guard-Redirects greifen.
- Betroffene Dateien / Komponenten:
  - `website/src/app/providers/AuthProvider.tsx`
  - `website/src/app/routing/AppRouter.tsx`
- Risiko / Schadensszenario:
  - Vorher entstand ein inkonsistenter Reload-Pfad, in dem Guard-Entscheidungen mit ungeprueftem `null`-State getroffen wurden.
- Empfehlung:
  - Bei Ausbau auf Multiuser diesen Initialisierungsstatus auch fuer Refresh-/Revocation-Pfade beibehalten.
- Umsetzungsaufwand: klein

### SEC-006
- Titel: `/signup` policy-seitig blockierbar
- Bereich: Route-Protection / Access-Mode
- Schweregrad: behoben (vorher mittel)
- Beschreibung:
  - Signup wird nicht nur per UI-Hinweis, sondern ueber Route-Policy (`allowInModes`) und Feature-Flag blockiert.
- Betroffene Dateien / Komponenten:
  - `website/src/app/routing/routeManifest.ts`
  - `website/src/app/routing/AppRouter.tsx`
  - `src/tests/website-auth-v1.test.ts`
- Risiko / Schadensszenario:
  - Vorher war Signup-Route trotz deaktiviertem Signup erreichbar.
- Empfehlung:
  - Bei echtem Signup zusaetzlich Backend-Endpoint-Protection und Rate-Limits.
- Umsetzungsaufwand: klein

### SEC-005
### SEC-007
- Titel: Zusaetzliche serverseitige Prelaunch-Gate-Sperre vor Owner-Auth
- Bereich: Website-/Frontend-Sicherheit
- Schweregrad: behoben (neu)
- Beschreibung:
  - Vor dem eigentlichen Owner-Login ist jetzt eine separate serverseitige Zugriffssperre mit signiertem HttpOnly-Gate-Cookie erforderlich.
  - `/api/auth/login`, `/api/auth/me` und `/api/auth/logout` werden nur noch nach erfolgreicher Gate-Freigabe verarbeitet.
- Betroffene Dateien / Komponenten:
  - `website/api/_prelaunchGate.ts`
  - `website/api/prelaunch-gate/login.ts`
  - `website/api/prelaunch-gate/me.ts`
  - `website/api/auth/login.ts`
  - `website/api/auth/me.ts`
  - `website/api/auth/logout.ts`
  - `website/src/app/providers/PrelaunchGateProvider.tsx`
  - `website/src/app/routing/AppRouter.tsx`
- Risiko / Schadensszenario:
  - Selbst wenn clientseitige Guards manipuliert werden, bleibt die vorgelagerte serverseitige Zugriffssperre vor der Owner-Auth bestehen.
- Empfehlung:
  - Zugangsschluessel getrennt vom Owner-Passwort verwalten und regelmaessig rotieren.
- Umsetzungsaufwand: klein

### SEC-008
- Titel: Restrisiko durch minimale Prelaunch-Sessiongrenze
- Bereich: Architektur
- Schweregrad: hoch (offen)
- Beschreibung:
  - Die aktuelle Loesung nutzt serverseitig signierte HttpOnly-Cookies, bleibt aber bewusst minimal:
  - keine serverseitige Revocation-Liste
  - keine CSRF-Haertung fuer Logout/kuenftige state-changing Endpoints
  - kein dediziertes Security-Logging oder Rate-Limit
- Betroffene Dateien / Komponenten:
  - `website/api/auth/*`
  - gesamte Website-Auth-Schicht
- Risiko / Schadensszenario:
  - Die triviale Rolleneskalation ueber Storage ist geschlossen, aber die Prelaunch-Session ist noch keine vollwertige produktionsreife Backend-Auth.
- Empfehlung:
  - Vor breiterem Rollout Revocation, CSRF-Schutz, Rate-Limits und Security-Logging nachziehen.
- Umsetzungsaufwand: hoch

## 4. Quick Wins
- CI-Check fuer notwendige Owner-Env-Werte vor Build und Deploy.
- Security-Header/CSP fuer Deployment ergaenzen.
- Audit-Logging fuer Login-Fehler und fail-closed-Zustaende einfuehren.
- CSRF-Strategie fuer kuenftige state-changing Auth-Endpoints festziehen.

## 5. Rebuild Input
- Client darf keine Session mehr aus Browser-Storage hydrieren.
- Client darf nur servervalidierte Owner-Snapshots in den Guard-Layer uebernehmen.
- Reload-Guards duerfen erst nach abgeschlossener Session-Initialisierung entscheiden.
- Signup-Enablement nur mit Backend-Rate-Limits + Abuse-Schutz freigeben.

## 6. Release Gate
- Audit erforderlich: ja
- Freigabestatus: freigegeben mit Restrisiko
- Offene kritische oder hohe Findings:
  - SEC-007 bleibt als offenes hohes Restrisiko bestehen, bis Revocation, CSRF-Schutz und Logging nachgezogen sind.

## 7. Offene Fragen / Unsicherheiten
- Welche Hosting-Umgebung setzt Security-Header bereits (Vercel/Edge-Konfiguration)?
- Soll `invite_only` ueber Invite-Tokens oder nur ueber Rollenmodell implementiert werden?
- Wann werden Revocation und CSRF fuer die Prelaunch-Auth nachgezogen?

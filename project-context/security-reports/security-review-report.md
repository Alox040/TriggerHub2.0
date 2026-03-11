# Security Review Report

## 1. Executive Summary
- Sicherheitsstatus:
  - Die identifizierten P0-Probleme aus dem letzten Review wurden in der clientseitigen Prelaunch-Architektur gezielt gehaertet.
- Groesste Risiken:
  - Es bleibt ein strukturelles Restrisiko, solange Auth/Session vollstaendig im Client laufen (kein serverseitiger Trust Boundary, keine HttpOnly-Session).
- Wichtigste Sofortmassnahmen:
  - Produktive Credential-Fallbacks entfernt.
  - Fail-closed bei fehlender Owner-Konfiguration umgesetzt.
  - Session-Hydration gegen Storage-Tampering gehaertet (Guard-Pair + Invariant-Checks).
  - `/signup` policy-seitig blockierbar gemacht.

## 2. Scope
- Gepruefte Bereiche:
  - `website/src/config/runtimeConfig.ts`
  - `website/src/modules/auth/*`
  - `website/src/modules/access-control/*`
  - `website/src/app/routing/*`
  - `website/src/app/providers/AuthProvider.tsx`
  - `website/src/pages/LoginPage.tsx`
  - Tests in `src/tests/website-auth-v1.test.ts`, `src/tests/website-browser-guards.test.ts`
- Nicht gepruefte Bereiche:
  - Infrastruktur/Hosting-Header/CSP/Rate-Limits
  - serverseitige Auth-API (nicht vorhanden)

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
- Titel: Ungepruefte LocalStorage-Session-Hydration gehaertet
- Bereich: Session-Sicherheit
- Schweregrad: teilweise behoben (vorher hoch)
- Beschreibung:
  - Session wird nur akzeptiert, wenn Guard-Pair zwischen `localStorage` und `sessionStorage` stimmt.
  - Zusaetzlich werden Session-Invarianten geprueft: IDs, Owner-Bindung, TTL-Grenzen.
- Betroffene Dateien / Komponenten:
  - `website/src/modules/auth/sessionStore.ts`
  - `website/src/modules/auth/authService.ts`
  - `src/tests/website-browser-guards.test.ts`
  - `src/tests/website-auth-v1.test.ts`
- Risiko / Schadensszenario:
  - Direkte, triviale Tampering-Pfade wurden reduziert.
  - Vollstaendige Sicherheit ist clientseitig nicht erreichbar.
- Empfehlung:
  - Mittelfristig serverseitige Session mit HttpOnly-Cookie und Signatur/Revocation einfuehren.
- Umsetzungsaufwand: mittel

### SEC-004
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
- Titel: Restrisiko durch rein clientseitige Vertrauensgrenze
- Bereich: Architektur
- Schweregrad: hoch (offen)
- Beschreibung:
  - Solange Session/Auth vollstaendig im Browser laufen, bleibt Manipulations-/Replay-Risiko grundsaetzlich bestehen.
- Betroffene Dateien / Komponenten:
  - Gesamte Website-Auth-Schicht
- Risiko / Schadensszenario:
  - Angreifer mit Script-Ausfuehrung oder lokalem Control kann Client-State weiterhin beeinflussen.
- Empfehlung:
  - Serverseitige AuthN/AuthZ-Grenze zeitnah priorisieren.
- Umsetzungsaufwand: hoch

## 4. Quick Wins
- CI-Check fuer notwendige Owner-Env-Werte vor Build.
- Security-Header/CSP fuer Deployment ergaenzen.
- Audit-Logging fuer Login-Fehler und fail-closed-Zustaende einfuehren.

## 5. Rebuild Input
- Auth-Trust auf serverseitige Session (HttpOnly + SameSite + Secure) umstellen.
- Client darf nur Session-Status konsumieren, nicht selbst authoritativ bestimmen.
- Signup-Enablement nur mit Backend-Rate-Limits + Abuse-Schutz freigeben.

## 6. Release Gate
- Audit erforderlich: ja
- Freigabestatus: blockiert
- Offene kritische oder hohe Findings:
  - SEC-005 bleibt als offenes hohes Restrisiko bestehen, solange Auth und Session vollstaendig clientseitig laufen.

## 7. Offene Fragen / Unsicherheiten
- Welche Hosting-Umgebung setzt Security-Header bereits (Vercel/Edge-Konfiguration)?
- Soll `invite_only` ueber Invite-Tokens oder nur ueber Rollenmodell implementiert werden?
- Wann ist die serverseitige Session-Einfuehrung terminlich geplant?

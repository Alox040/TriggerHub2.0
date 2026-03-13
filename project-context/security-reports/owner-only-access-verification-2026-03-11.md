# Owner-Only Access Verification

Date: 2026-03-11

## Executive Summary

- Ergebnis: Die Website ist im aktuellen Stand nicht oeffentlich zugaenglich.
- Zugriff erfordert zuerst die serverseitige Prelaunch-Gate-Freigabe und danach den Owner-Login.
- Die geprueften Owner-Only-Pfade waren in der Verifikation bestanden.
- Es bleiben operative und sicherheitstechnische Restrisiken, die fuer spaeteren breiteren Rollout relevant sind.

## Scope

- `website/api/_prelaunchGate.ts`
- `website/api/prelaunch-gate/*`
- `website/api/auth/*`
- `website/src/app/providers/AuthProvider.tsx`
- `website/src/app/providers/PrelaunchGateProvider.tsx`
- `website/src/app/routing/*`
- `website/src/modules/auth/sessionStore.ts`
- `src/tests/website-owner-only-access.test.ts`
- `src/tests/website-auth-v1.test.ts`
- `src/tests/website-browser-guards.test.ts`
- `src/tests/website-prelaunch-gate.test.ts`

## Test Protocol

| ID | Prueffall | Methode | Ergebnis |
| --- | --- | --- | --- |
| T1 | Zugriff ohne Login | Handler-Test: `GET /api/auth/me` ohne Gate-Cookie | Bestanden |
| T2 | Zugriff mit falschem Login | Handler-Test: falscher Gate-Key und falsches Owner-Passwort | Bestanden |
| T3 | Zugriff mit korrektem Owner-Login | Handler-Test: korrekter Gate-Key + korrekter Owner-Login | Bestanden |
| T4 | Direktaufruf geschuetzter Routen | Policy-/Guard-Test fuer `/dashboard` mit `null`, `user`, `owner` | Bestanden |
| T5 | Verhalten nach Browser-Reload | Handler-/Hydration-Test ueber `GET /api/auth/me` mit/ohne Session-Cookie | Bestanden |
| T6 | Verhalten nach Logout | Handler-Test: `POST /api/auth/logout` + anschliessend `GET /api/auth/me` | Bestanden |
| T7 | Umgehung ueber `localStorage` oder DevTools | Browser-Storage-Guard-Tests | Bestanden |
| T8 | Build-/Run-Verhalten der Website | Root-Testlauf, Website-Build, kontrollierter Dev-Start | Bestanden mit Hinweis |

## Evidence

### T1 Zugriff ohne Login

- Ohne Prelaunch-Gate blockiert `GET /api/auth/me` mit `403 PRELAUNCH_GATE_REQUIRED`.
- Verifiziert in `src/tests/website-owner-only-access.test.ts`.

### T2 Zugriff mit falschem Login

- Falscher Prelaunch-Key liefert `401 PRELAUNCH_GATE_INVALID_KEY`.
- Falsches Owner-Passwort nach geoeffnetem Gate liefert `401 AUTH_INVALID_CREDENTIALS`.

### T3 Zugriff mit korrektem Owner-Login

- Korrekter Gate-Key setzt `th_prelaunch_gate`.
- Korrekter Owner-Login setzt `th_prelaunch_session`.
- Rueckgabe enthaelt `session.userId=owner` und `role=owner`.

### T4 Direktaufruf geschuetzter Routen

- `/dashboard` ist in `private_prelaunch`:
  - ohne Identitaet: blockiert
  - mit Rolle `user`: blockiert
  - mit Rolle `owner`: erlaubt
- Der Router leitet zusaetzlich vorab auf `/access`, solange das Gate noch nicht geoeffnet ist.

### T5 Verhalten nach Browser-Reload

- Nach Reload ist eine Session nur gueltig, wenn Gate-Cookie und Owner-Session-Cookie vorhanden sind.
- Mit Gate-Cookie aber ohne Owner-Session liefert `GET /api/auth/me` `401`.
- Der Client hydriert keine Session mehr aus Browser-Storage.

### T6 Verhalten nach Logout

- `POST /api/auth/logout` setzt `th_prelaunch_session` auf `Max-Age=0`.
- Anschliessend liefert `GET /api/auth/me` wieder `401`.
- Das Prelaunch-Gate bleibt offen; nur die Owner-Session wird beendet.

### T7 Umgehung ueber `localStorage` oder DevTools

- Der Legacy-Sessionstore entfernt gespeicherte Session-Werte aktiv.
- `localStorage` und `sessionStorage` koennen keine Owner-Session mehr hydrieren.
- Reine Storage-Manipulation reicht daher nicht fuer Owner-Rechte.

### T8 Build-/Run-Verhalten

- Root-Testlauf erfolgreich.
- Website-Typecheck erfolgreich.
- Website-Produktionsbuild erfolgreich.
- Kontrollierter Dev-Start erfolgreich; Vite startet lokal auf `http://127.0.0.1:4174/`.
- Hinweis: Vite-Dev prueft nur die Frontend-Laufzeit. Die serverseitigen `/api/*`-Auth-Pfade muessen weiter ueber Handler-Tests oder Vercel-Umgebung verifiziert werden.

## Executed Checks

- `npm run test -- src/tests/website-owner-only-access.test.ts src/tests/website-auth-v1.test.ts src/tests/website-browser-guards.test.ts src/tests/website-prelaunch-gate.test.ts`
- `npm run typecheck`
- `npm --prefix website run typecheck`
- `npm --prefix website run build`
- kontrollierter `npm --prefix website run dev -- --host 127.0.0.1 --port 4174 --strictPort`

## Open Weaknesses

### OW-001

- Titel: Keine serverseitige Revocation/Session-Invalidation jenseits Cookie-Ablauf
- Schweregrad: hoch
- Risiko:
  - Session-Gueltigkeit endet derzeit primaer ueber TTL, nicht ueber serverseitige Revocation-Liste.

### OW-002

- Titel: Kein CSRF-Schutz fuer state-changing Auth-Endpunkte
- Schweregrad: mittel
- Risiko:
  - `POST /api/auth/logout` und spaetere state-changing Endpunkte sind noch nicht mit dediziertem CSRF-Schutz versehen.

### OW-003

- Titel: Kein Rate-Limit oder Security-Logging auf Gate-/Login-Ebene
- Schweregrad: mittel
- Risiko:
  - Fehlversuche gegen Prelaunch-Gate oder Owner-Login werden nicht begrenzt und nicht auditierbar protokolliert.

### OW-004

- Titel: Dev-Run bildet die serverseitige Vercel-API-Laufzeit nicht vollstaendig ab
- Schweregrad: niedrig
- Risiko:
  - Lokaler Vite-Start validiert nicht den kompletten Deploy-Stack inklusive Serverless-Handler.

## Restmassnahmen

1. Revocation/Rotation fuer Prelaunch- und Owner-Session serverseitig nachziehen.
2. CSRF-Schutz fuer Logout und kuenftige state-changing Auth-Endpunkte einfuehren.
3. Rate-Limits und Security-Logging fuer `/api/prelaunch-gate/*` und `/api/auth/*` ergänzen.
4. Optional hostseitige Zusatzsperre aktivieren, z. B. Vercel Password Protection oder vorgeschalteter Reverse-Proxy-Basic-Auth.
5. Eine echte Deploy-Umgebungspruefung in Vercel oder vergleichbarer Laufzeit als separaten Ops-Check ergaenzen.

## Gesamtbewertung

- QA: bestanden
- Security Audit: freigegeben mit Restrisiko
- Ops: Build und lokaler Dev-Start bestanden
- Fazit: Im aktuellen Projektstand ist die Website praktisch owner-only, nicht oeffentlich frei zugaenglich und nicht per einfacher Client-Manipulation eskalierbar.

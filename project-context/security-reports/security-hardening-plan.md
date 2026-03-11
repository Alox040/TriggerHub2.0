# Security Hardening Plan

## Ziel
- P0-Hardening der aktuellen Prelaunch-Auth loesen, ohne Produktumfang zu erweitern.

## Sofortmassnahmen
- [x] Produktive Credential-Fallbacks entfernen.
- [x] Fail-closed bei fehlender Owner-Konfiguration erzwingen.
- [x] Session-Hydration gegen Storage-Tampering absichern.
- [x] `/signup` routing-/policy-seitig blockieren, wenn deaktiviert.
- [x] Gezielte Sicherheits- und Guard-Tests ergaenzen.

## Massnahmen vor Beta/Release
- [ ] Build/Deploy-Validation fuer Pflicht-Env-Werte automatisieren.
- [ ] Security-Header (CSP, HSTS, X-Frame-Options, Referrer-Policy) fuer Hosting konfigurieren.
- [ ] Login-Failure- und Security-Event-Logging definieren.

## Mittel- und langfristige Massnahmen
- [ ] Serverseitige Session mit HttpOnly-Cookie und Revocation einfuehren.
- [ ] Clientseitige Rollen-/Session-Entscheidungen auf serververifizierte Claims umstellen.
- [ ] Signup erst mit Abuse-Schutz (Rate-Limit, ggf. CAPTCHA, Monitoring) aktivieren.

## Priorisierung
- Kritisch:
  - Vermeidung von unsicheren Credential-Fallbacks
  - Fail-closed-Konfiguration
- Hoch:
  - Serverseitige Trust-Boundary fuer Auth/Session
- Mittel:
  - Security-Header und Observability
- Niedrig:
  - Weitere UX-Hinweise fuer Fehlkonfiguration

## Umsetzung & Verantwortliche
- Massnahme: P0-Hardening Client-Prelaunch
- Owner: Implementation + Security-Audit-Agent
- Zieltermin: 2026-03-10
- Status: abgeschlossen

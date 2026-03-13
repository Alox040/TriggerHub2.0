# Security Rebuild Input

## Verbindliche Anforderungen
- [x] Keine produktiven Credential-Fallbacks im Frontend-Bundle.
- [x] Ohne valide Owner-Config muss Auth fail-closed reagieren.
- [x] Session aus localStorage oder sessionStorage darf nicht als vertrauenswuerdig gelten.
- [x] Der Client darf im Prelaunch nur `role: owner` aus servervalidierten Session-Snapshots akzeptieren.
- [x] Guard-Entscheidungen nach Reload duerfen erst nach abgeschlossener Session-Initialisierung fallen.
- [x] Vor der Owner-Auth muss eine zusaetzliche serverseitige Zugriffssperre liegen.
- [x] Signup-Route muss bei deaktiviertem Signup policy-seitig blockiert sein.

## Sicherheitsrelevante Architekturvorgaben
- [x] Trennung zwischen Authentication, Authorization, Access Mode und Profile beibehalten.
- [x] Access-Entscheidungen zentral im Routing-Policy-Layer halten.
- [ ] Mittelfristig: serverseitige Auth-Trust-Boundary als Pflichtziel.

## Auth/AuthZ Anforderungen
- [x] Owner-Login nur bei vollstaendiger Runtime-Konfiguration.
- [x] Session-Hydration mit Invariant-Pruefung (ID-Format, Owner-Bindung, TTL) absichern.
- [x] Login/Session serverseitig signieren und ueber HttpOnly-Cookies ausgeben.
- [ ] Revocation/Rotation fuer signierte Sessions nachziehen.
- [ ] CSRF-Schutz fuer state-changing Auth-Endpoints nachziehen.

## Deployment/Infra Anforderungen
- [ ] Predeploy-Check fuer Pflicht-Env-Werte (`VITE_OWNER_*`).
- [ ] Security-Header/CSP verbindlich fuer produktive Website.

## Abnahmekriterien
- [x] Testfall fuer Storage-Tampering / Role-Escalation vorhanden.
- [x] Testfall fuer Ablehnung nicht-owner Backend-Sessions vorhanden.
- [x] Testfall fuer fehlende Owner-Konfiguration (fail-closed) vorhanden.
- [x] Testfall fuer Router-/Guard-Entscheidungen vorhanden.
- [ ] E2E-Validierung mit serverseitiger Session nach Backend-Einfuehrung.

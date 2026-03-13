Release prerequisites

## Verbindliche Release-Gates

- `quality-gate.yml` muss erfolgreich sein
- Root typecheck: `npm run typecheck`
- Root tests: `npm run test`
- Root dependency audit: `npm audit --omit=dev --audit-level=high`
- Website typecheck: `./node_modules/.bin/tsc --noEmit --project website/tsconfig.json`
- Website build: `npm --prefix website run build`
- Website dependency audit: `npm --prefix website audit --omit=dev --audit-level=high`
- Root build smoke: `npm run build`
- Release validation: `npm run release:validate`
- Desktop release build on Windows: `npm run desktop:release`
- Aktueller Security-Review in `docs/security/` vorhanden und geprüft

## Release-Blocker

- Offene High- oder Critical-Vulnerabilities in Root- oder Website-Dependencies
- Fehlgeschlagene Tests, Typechecks oder Builds in einem der verbindlichen Gates
- Kein aktueller Security-Review für Website-Auth, CI/Release-Pfad oder Electron-Grenzen
- Dirty generated release metadata/content bei Tag- oder Manual-Release

## Bekannte Restrisiken

- Website rate limiting und Session-Revocation sind weiter nur für den aktuellen Prelaunch-Scope akzeptabel
- Electron bleibt nur freigabefähig, solange neue IPC-Kanäle dieselbe Main-Process-only-Regel und Eingabevalidierung einhalten

## Hinweise

- `quality-gate.yml` ist der verbindliche Merge-Gate-Workflow
- `ci.yml` liefert nur ein Desktop-Build-Artefakt und ist kein vollständiger Qualitätsnachweis
- `release.yml` erzwingt die Pflicht-Gates erneut, damit Tag- und Manual-Releases sie nicht umgehen

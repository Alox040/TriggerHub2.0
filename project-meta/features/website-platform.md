# Website Platform

## Zweck des Moduls
Die Website-Plattform bildet das getrennte Web-Surface von TriggerHub fuer Zugang, Auth, Profil und Marketing-/Produktseiten.

## Relevante Codebereiche / Ordner
- `website/src/App.tsx`
- `website/src/app/routing/`
- `website/src/config/runtimeConfig.ts`
- `website/src/modules/access-control/`
- `website/src/modules/auth/`
- `website/src/modules/profile/`
- `website/api/auth/`
- `website/api/prelaunch-gate/`
- `website/scripts/verify-prelaunch-security.mjs`

## Aktueller Umsetzungsstand
- Die Website ist als separates Vite-React-Projekt implementiert und nicht mit der Desktop-Runtime zusammengeschaltet.
- `App.tsx` verdrahtet `PrelaunchGateProvider`, `AuthProvider`, `ProfileProvider` und `AppRouter`.
- Das Routing modelliert bereits die Modi `private_prelaunch`, `invite_only` und `public_product` ueber `modeOverrides`.
- Die Runtime-Konfiguration in `website/src/config/runtimeConfig.ts` akzeptiert aktuell effektiv nur `private_prelaunch`.
- Der Website-Build ist laut verifiziertem Projektkontext erfolgreich; vor dem Build laeuft ein Prelaunch-Sicherheitscheckskript.

## Verifizierte Staerken
- Routing, Access-Control, Auth und Profil sind als getrennte Module organisiert.
- Das Route-Manifest bildet Policies pro Pfad und Access-Mode explizit ab.
- Das Prebuild-Skript verhindert unsichere Prelaunch-Builds, etwa durch sensible Client-Env-Variablen, falschen Access-Mode oder fehlende notwendige Server-Env-Werte.
- Die Website hat einen eigenen Buildpfad und ist damit architektonisch klar vom Desktop getrennt.

## Verifizierte Luecken
- Trotz vorbereitetem Routing laesst die aktuelle Runtime-Konfiguration effektiv nur `private_prelaunch` zu.
- Laut verifiziertem Projektkontext besitzt die Website derzeit kein belegtes oeffentliches oder invite-basiertes Laufzeitmodell jenseits des Owner-/Prelaunch-Flows.
- Im Root-Projekt faellt `npm run typecheck` unter anderem wegen fehlender PNG-Asset-Deklarationen und fehlender `ImportMeta.env`-Typisierung in Website-Dateien aus.
- Die Datei beschreibt keine direkte Anbindung der Website an die operative Desktop-Runtime, weil eine solche Kopplung in den geprueften Quellen nicht belegt ist.

## Naechste sinnvolle Entwicklungsschritte
- `runtimeConfig.ts` auf den bereits im Route-Manifest modellierten Modusumfang bringen.
- Typecheck-Probleme in den betroffenen Website-Dateien beheben.
- Access-Control-, Auth- und Profilpfade nach Implementierungsstand als konsolidierte Website-Laufzeitdoku weiterziehen.

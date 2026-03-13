# Website Access Model

Stand: 2026-03-13

## Ist-Zustand

Die Website trennt die Zugangskontrolle bereits in mehrere technische Schichten:

- `website/src/config/runtimeConfig.ts`
  - bestimmt den aktuell aktiven Access-Mode fuer die Client-Runtime
- `website/src/app/routing/routeManifest.ts`
  - beschreibt Route-Policies und mode-spezifische Overrides
- `website/src/modules/access-control/policy.ts`
  - wertet Route-Policies gegen `mode` und `identity` aus
- `website/src/app/routing/AppRouter.tsx`
  - setzt Redirects und rendert Seiten anhand der Guard-Entscheidung
- `website/src/app/providers/PrelaunchGateProvider.tsx`
  - steuert den vorgeschalteten Prelaunch-Gate-Zustand
- `website/src/app/providers/AuthProvider.tsx`
  - steuert die Owner-Session
- `website/src/app/providers/ProfileProvider.tsx`
  - haengt browserlokale Profile an eine bereits authentifizierte Identity

Serverseitig liegen die Owner-/Gate-Schutzpfade in:

- `website/api/_prelaunchGate.ts`
- `website/api/_auth.ts`
- `website/api/_middleware.ts`
- `website/api/auth/*`
- `website/api/prelaunch-gate/*`

## Technische Modistruktur

Modi im Repository:

- `private_prelaunch`
  - aktuell einziger aktivierbarer Runtime-Modus
  - mit vorgeschaltetem Gate und owner-only geschuetzten Produkt- und Marketing-Routen
- `invite_only`
  - im Routing bereits modelliert
  - aktuell noch nicht als aktive Runtime auswählbar
- `public_product`
  - im Routing bereits modelliert
  - aktuell noch nicht als aktive Runtime auswählbar

## Schutzlogik heute

### Owner-only

- in `private_prelaunch` werden Marketing-, Produkt- und interne Routen im Manifest owner-only ueberschrieben
- serverseitige Auth-Session akzeptiert nur Owner-Snapshots
- ohne geoeffnetes Prelaunch-Gate blocken Auth-API und Router den Zugriff frueh

### Invite-only / spaetere Public-Routen

- im Route-Manifest sind bereits policy-seitige Unterschiede modelliert
- `signup` ist auf `invite_only` und `public_product` begrenzt
- Produktseiten wie `/dashboard`, `/profile`, `/settings` bleiben auch in `public_product` geschuetzt
- die Client-Runtime laesst diese Modi aktuell bewusst noch nicht aktiv werden

## Umgesetzte kleine Aufraeumarbeiten

- `website/src/modules/access-control/types.ts`
  - zentrale `ACCESS_MODES` ergaenzt
  - `DEFAULT_ACCESS_MODE`, `ACTIVE_ACCESS_MODES`, `FUTURE_PUBLIC_ACCESS_MODES` eingefuehrt
  - `isAccessMode(...)` als zentrale Guard-Funktion hinzugefuegt
- `website/src/config/runtimeConfig.ts`
  - Access-Mode-Aufloesung nutzt jetzt zentrale Mode-Konstanten statt lokale String-Logik
  - damit ist explizit sichtbar: weitere Modi sind modelliert, aber aktuell nicht freigeschaltet
- `website/src/app/routing/routeManifest.ts`
  - bekannte Route-Menge zentralisiert
  - `normalizeRoutePath(...)` aus dem lokalen Router in das Manifest verschoben
- `website/src/app/routing/AppRouter.tsx`
  - lokale Routen-Duplikation entfernt, nutzt jetzt zentrale Normalisierung

## Kritische Doppelwege, bewusst nicht gross umgebaut

- Access-Mode-Wissen liegt weiterhin in zwei Ebenen:
  - policy-/routing-seitig sind alle drei Modi modelliert
  - runtime-seitig ist nur `private_prelaunch` aktiv
- Das ist aktuell absichtlich, damit invite/public technisch vorbereitet bleiben, aber nicht versehentlich aktiv werden.

- Owner-Schutz existiert sowohl:
  - clientseitig in Route-Policies
  - serverseitig in Session-/Gate-Middleware
- Diese Doppelung ist notwendig und kein unmittelbarer Umbau-Kandidat.

- Profile laufen browserlokal und getrennt von Server-Auth.
  - Das ist technisch konsistent mit der aktuellen Prelaunch-Situation
  - fuer spaetere invite/public-Modi bleibt hier aber ein Integrationspunkt offen

## Tests

Relevante bestehende Testbereiche:

- `src/tests/website-auth-v1.test.ts`
  - Route-Policy, Runtime-Konfiguration, Normalisierung
- `src/tests/website-owner-only-access.test.ts`
  - Gate, Owner-Login, Session, Logout, serverseitige Schutzpfade
- `src/tests/website-prelaunch-gate.test.ts`
  - Prelaunch-Gate-Konfiguration und Cookie-Flows
- `src/tests/website-profile-v1.test.ts`
  - Identity/Profile-Trennung

Ergaenzt wurde:

- Test fuer zentrale Access-Mode-Konstanten und Guard-Funktion

## Ergebnis

Das Access-Modell ist jetzt technisch klarer strukturiert:

- Modi sind zentral typisiert
- aktive und spaetere Modi sind explizit getrennt
- Route-Normalisierung und bekannte Pfade sind nicht mehr lokal im Router dupliziert
- owner-only, invite-only und spaetere public-Routen bleiben im Code sauber unterscheidbar, ohne die Website bereits zur vollstaendigen Produktseite auszubauen

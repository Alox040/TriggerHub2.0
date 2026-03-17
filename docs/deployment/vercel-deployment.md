# Vercel Deployment

## Ergebnis der Projektanalyse

Der deploybare Web-Teil dieses Repos ist `website/`.

Erkannt aus vorhandenem Code:

- Framework: Vite + React
- Client-Routing: eigene Router-Implementierung unter `website/src/app/routing/`
- Server-Endpunkte: Vercel Functions unter `website/api/`
- Produktions-Build: `website/package.json` -> `npm run build`
- Build-Ausgabe: `website/dist`

Relevante Dateien:

- `website/package.json`
- `website/vite.config.ts`
- `website/vercel.json`
- `website/src/app/routing/routeManifest.ts`
- `website/src/app/routing/routeRenderer.tsx`
- `website/api/auth/*.ts`
- `website/api/profile/me.ts`
- `website/.env.example`
- `website/README.md`
- `website/scripts/verify-prelaunch-security.mjs`

## Deploy Anleitung

### 1. Vercel-Projekt anlegen

1. Repository in Vercel importieren.
2. Als **Root Directory** `website` setzen.
3. Framework Preset auf **Vite** setzen.

Diese Werte passen zum vorhandenen Projekt:

- Build Command: `npm run build`
- Output Directory: `dist`

### 2. Environment Variables setzen

Pflichtwerte laut `website/.env.example`, `website/README.md` und `website/scripts/verify-prelaunch-security.mjs`:

- `VITE_ACCESS_MODE=public_product`
- `VITE_SESSION_TTL_MS`

Optional nur fuer geschuetzte Owner-Routen:

- `OWNER_USER_ID`
- `OWNER_EMAIL`
- `OWNER_LOGIN_USERNAME`
- `OWNER_LOGIN_PASSWORD_HASH`
- `OWNER_LOGIN_PASSWORD_SALT`
- `OWNER_LOGIN_PASSWORD_ITERATIONS`
- `PRELAUNCH_SESSION_SECRET`

Wichtig:

- keine sensiblen Server-Werte als zusaetzliche `VITE_*`-Variablen anlegen
- der Build bricht absichtlich ab, wenn `VITE_ACCESS_MODE` nicht auf `public_product` steht oder Pflichtwerte fehlen

### 3. Deployment ausloesen

Nach dem Setzen der Variablen:

1. erstes Production Deployment starten
2. Build-Logs pruefen
3. danach Seiten und API-Routen testen:
   - `/`
   - `/features`
   - `/pricing`
   - `/about`
   - `/api/auth/me`
   - `/api/auth/login`
   - `/api/auth/logout`
   - `/api/profile/me`

## Vercel-Konfiguration im Repo

`website/vercel.json` wurde auf die vorhandene Architektur ausgerichtet.

Enthalten:

- Redirect von `/signup` auf `/login`
- SPA-Rewrites fuer die bekannten Client-Routen aus `website/src/app/routing/routeManifest.ts`

Abgedeckte Rewrites:

- `/access`
- `/features`
- `/pricing`
- `/about`
- `/login`
- `/app`
- `/dashboard`
- `/profile`
- `/settings`
- `/forbidden`
- `/logout`
- `/internal`

Damit funktionieren direkte Seitenaufrufe und Reloads auf diesen Routen in Production, ohne die bestehenden `/api/*`-Functions zu ueberschreiben.

## Package- und Build-Scripts

Vorhandene Deploy-relevante Scripts in `website/package.json`:

- `prebuild`: `node --env-file-if-exists=.env.local scripts/verify-prelaunch-security.mjs`
- `build`: `vite build`
- `dev`: `vite`
- `preview`: `vite preview`

Deploy-relevant:

- `prebuild` validiert die Pflicht-Umgebungsvariablen
- `build` erzeugt `website/dist`
- zusaetzliche Aenderungen an den Build-Scripts waren dafuer nicht noetig

## Domain Setup

Fuer dieses Projekt ist die Domain `triggerhub.de` vorgesehen.

Vorgehen in Vercel:

1. unter **Project -> Settings -> Domains** die Root-Domain `triggerhub.de` hinzufuegen
2. danach die `www`-Subdomain `www.triggerhub.de` hinzufuegen
3. Domain-Verifikation mit den von Vercel angezeigten DNS-Werten abschliessen
4. Root-Domain als primaere Domain festlegen

## DNS Records

Die konkreten DNS-Zielwerte stammen nicht aus dem Projektcode, sondern aus der aktuellen Vercel-Dokumentation fuer Custom Domains.

Wenn die DNS-Verwaltung ausserhalb von Vercel liegt, ist das uebliche Setup:

### Root-Domain

- Typ: `A`
- Name: `@`
- Wert: `76.76.21.21`

### www-Subdomain

- Typ: `CNAME`
- Name: `www`
- Wert: `cname.vercel-dns.com`

Wichtig:

- massgeblich sind immer die Werte, die Vercel im Domain-Dialog fuer `triggerhub.de` anzeigt

## Redirect www -> root

Im Code ist keine konkrete Host-Domain definiert. Deshalb wurde kein harter host-spezifischer Redirect ins Repo geschrieben.

Fuer das gewuenschte Zielbild:

1. beide Domains in Vercel hinzufuegen
   - `triggerhub.de`
   - `www.triggerhub.de`
2. die Root-Domain als primaere Domain markieren
3. Vercel die sekundaere Domain auf die primaere Domain umleiten lassen

Zielbild:

- primaer: `https://triggerhub.de`
- Redirect: `https://www.triggerhub.de` -> `https://triggerhub.de`

## Troubleshooting

### Build schlaegt auf Vercel fehl

Pruefen:

- Root Directory ist `website`
- Build Command ist `npm run build`
- Output Directory ist `dist`
- `VITE_ACCESS_MODE=public_product`
- `VITE_SESSION_TTL_MS` ist gesetzt

Besonders wichtig:

- `website/scripts/verify-prelaunch-security.mjs` laeuft als `prebuild`
- fehlende oder ungueltige Variablen fuehren absichtlich zu einem Build-Fehler

### Direkter Aufruf von `/features` oder `/dashboard` liefert 404

Pruefen:

- `website/vercel.json` ist Teil des Deployments
- das Projekt deployt wirklich mit Root Directory `website`
- keine andere Vercel-Konfiguration ueberschreibt die Rewrites

### `/api/*` funktioniert nicht

Pruefen:

- das Projekt laeuft auf Vercel und nicht nur als statisches Export-Artefakt
- `website/api/` ist im Deployment enthalten
- die benoetigten Server-Variablen fuer Owner-Login oder Profilzugriffe sind gesetzt

### Login funktioniert nicht

Pruefen:

- `OWNER_LOGIN_*` vollstaendig gesetzt
- `OWNER_USER_ID` und `OWNER_EMAIL` gesetzt
- `PRELAUNCH_SESSION_SECRET` gesetzt
- `VITE_SESSION_TTL_MS` ist ein positiver Integer

### Cookies werden in Production nicht gesetzt

Der vorhandene API-Code setzt in Production `Secure`-Cookies.

Pruefen:

- Deployment laeuft ueber HTTPS
- Domain ist korrekt mit dem Vercel-Projekt verbunden
- keine vorgeschaltete Proxy-Konfiguration veraendert Header oder Cookies

## Lokale Verifikation

```bash
npm --prefix website run build
```

Das verifiziert den Vite-Produktions-Build lokal. Die API-Routen unter `website/api/` werden im Hosting-Fall von Vercel als Functions ausgefuehrt.

## Quellenbasis

Diese Anleitung basiert auf vorhandenen Projektdateien:

- `website/package.json`
- `website/vite.config.ts`
- `website/vercel.json`
- `website/README.md`
- `website/.env.example`
- `website/scripts/verify-prelaunch-security.mjs`
- `website/src/app/routing/routeManifest.ts`
- `website/api/*`

Ergaenzend fuer DNS-Zielwerte und Domain-Verhalten:

- Vercel Domains Dokumentation
- Vercel Redirects Dokumentation

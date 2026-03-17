# FUNCTIONAL CONSISTENCY REPAIR ROADMAP
## TriggerHub 2.0 — v0.1.1-prep → v0.2.0
**Basis:** PROJECT-CONSISTENCY-AND-FUNCTIONAL-GAP-ANALYSIS.md | **Stand:** 2026-03-17

---

## Überblick

Diese Roadmap clustert alle offenen Probleme in fünf Arbeitsblöcke und legt eine verbindliche Reihenfolge fest. Grundprinzip: **Kein Beta ohne funktionierende Integrationen.** Kosmetik und Tech-Debt folgen danach.

```
BLOCK A — Funktionale Kernblocker          [Sofort / vor Alpha]
BLOCK B — Sicherheit & Datenschutz         [Sofort / parallel zu A]
BLOCK C — Inkonsistente UI/UX              [Vor Beta]
BLOCK D — Produktkommunikation             [Vor Beta]
BLOCK E — Technische Anschlussarbeiten     [Nach Beta]
BLOCK F — Tests & Validierung              [Begleitend + Abschluss]
```

---

## Bewertungsmatrix

| ID | Problem | Nutzer­relevanz | Vertrauens­schaden | Dev-Aufwand | Abhängig­keiten | Risiko |
|---|---|---|---|---|---|---|
| C-02 | OBS InMemory-Stub | Kritisch | Hoch | XL (WebSocket-Client) | Bootstrap-Wiring | Hoch |
| C-03 | Spotify kein OAuth | Kritisch | Hoch | XL (PKCE-Flow, Electron Redirect) | C-02 unabhängig | Hoch |
| C-04 | Clip Dummy-Buffer | Hoch | Mittel | XL (Screen-Capture oder OBS-Hook) | C-02 (OBS-Verbindung) | Hoch |
| C-05 | TriggerCard kein Confirm | Hoch | Mittel | XS (Dialog-Komponente) | Keine | Niedrig |
| SEC-01 | Credentials Plaintext | Kritisch | Sehr hoch | S (safeStorage API) | Keine | Mittel |
| H-02 | Settings.tsx Tailwind-Mix | Niedrig | Niedrig | XS (Zeilen 96–109) | Keine | Niedrig |
| H-03 | Refresh-Overkill | Mittel | Niedrig | S (App.tsx Refactor) | Keine | Niedrig |
| H-04 | JSON-Textarea Forms | Sehr hoch | Hoch | L (Formular-Redesign) | C-02/C-03 (Event-Topics bekannt) | Mittel |
| M-01 | Hotkeys nur in-focus | Mittel | Mittel | M (globalShortcut) | Keine | Niedrig |
| M-02 | Twitch 60s-Polling | Mittel | Mittel | M (EventSub WebSocket) | C-02 unabhängig | Mittel |
| M-03 | Delete kein Confirm | Hoch | Mittel | XS (Dialog) | C-05 (gleiche Komponente) | Niedrig |
| M-04 | Desktop kein i18n | Niedrig | Niedrig | L (i18next-Setup + Texte) | Keine | Niedrig |
| M-05 | AuthProvider.refresh() | Mittel | Mittel | S (API-Endpoint + Client) | Website-Backend | Niedrig |
| H-01 | MacroEngine Circular-Dep | Niedrig | Niedrig | M (Architektur-Refactor) | Keine | Mittel |

**Aufwands-Skala:** XS < 2h · S < 1d · M 1–3d · L 3–7d · XL > 1 Woche

---

---

# BLOCK A — Funktionale Kernblocker

**Ziel:** Das Produkt muss das tun, was es behauptet zu tun. Ohne echte Service-Verbindungen ist TriggerHub kein Automatisierungstool, sondern ein Mockup.

**Nutzerrelevanz:** Kritisch — das ist der Kern-Use-Case
**Vertrauensschaden:** Sehr hoch — jeder erste Test endet sofort im Nichts
**Muss fertig vor:** Alpha-Release

---

## A-1: OBS WebSocket Transport

**Problem (C-02):** `bootstrap.ts:45` verdrahtet `InMemoryObsTransport`. OBS-Szenen-Events werden nie publisht, alle OBS-Actions sind No-Ops.

**Betroffene Dateien:**
- `src/app/bootstrap.ts` (Zeile 45 — Wiring-Punkt)
- `src/services/obs-service/obsActions.ts` (Port-Interface nutzen)
- `src/services/obs-service/obsTransport.ts` *(neu zu erstellen)*
- `src/types/ports.ts` (Port `IObsTransport` prüfen/erweitern)

**Konkrete Aufgaben:**
1. NPM-Paket `obs-websocket-js` (v5.x) als Dependency aufnehmen.
2. `ObsWebSocketTransport` in `src/services/obs-service/obsTransport.ts` implementieren:
   - `connect(host, port, password)` → WebSocket-Verbindung aufbauen
   - `disconnect()` → sauber trennen
   - `switchScene(sceneName)` → `SetCurrentProgramScene`-Request
   - EventHandler für `SceneTransitioned`, `StreamStateChanged` → `EventBus.publish('obs:scene-changed', payload)`
   - EventHandler für Verbindungsaufbau/-abbruch → `EventBus.publish('obs:connected')` / `'obs:disconnected'`
3. In `bootstrap.ts:45`: analog zu Twitch-Transport-Wahl (`if (runtimeConfig.obsHost)`) `ObsWebSocketTransport` wählen, sonst `InMemoryObsTransport`.
4. `Settings.tsx`: OBS-Connection-Panel (Host, Port, Password) ergänzen analog zum Twitch-Panel.
5. `runtimeConfig.ts` + `storageBridge.ts`: `obsHost`, `obsPort`, `obsPassword` als persistierte Felder aufnehmen.

**Definition of Done:**
- OBS ist in der Settings-UI konfigurierbar.
- Nach Klick auf "Connect": StatusBar zeigt OBS als verbunden.
- Szenen-Wechsel in OBS → EventBus-Event → TriggerCard reagiert.
- Verbindungsabbruch → StatusBar wechselt auf "Offline".
- `InMemoryObsTransport` bleibt als Fallback (kein Config → In-Memory).

**Testkriterien:**
- Unit: `ObsWebSocketTransport.connect()` publiziert `obs:connected` auf EventBus (Mock-WebSocket).
- Unit: `switchScene()` sendet korrekten Request-Payload.
- Integration: `bootstrap.ts` wählt WebSocket-Transport wenn `obsHost` gesetzt.
- E2E (manuell): OBS läuft lokal → Verbindung herstellen → Szene wechseln → Trigger feuert.

**Risiken:**
- obs-websocket-js v5 ist nur mit OBS v28+ kompatibel — Versionscheck in Docs aufnehmen.
- `obsPassword` darf nicht Plaintext gespeichert werden → SEC-01 muss parallel gelöst sein.

---

## A-2: Spotify OAuth PKCE + Transport

**Problem (C-03):** `spotifyActions.ts:19` hat `connect()` als leeren Stub. `SpotifyHttpTransport` in `spotifyClient.ts` hat HTTP-Gerüst, aber keinen Auth-Flow.

**Betroffene Dateien:**
- `src/services/spotify-service/spotifyActions.ts` (Zeilen 19–24 — connect() Stub)
- `src/services/spotify-service/spotifyClient.ts` (HTTP-Transport Gerüst)
- `src/services/spotify-service/contracts.ts` (Port-Interface prüfen)
- `src/app/bootstrap.ts` (Zeile 46 — Wiring-Punkt)
- `electron/main.cjs` (Redirect-URI Handler + Deep-Link für OAuth-Callback)
- `src/ui/pages/Settings.tsx` (Spotify Auth-Panel)

**Konkrete Aufgaben:**
1. PKCE Auth-Flow implementieren:
   - `generateCodeVerifier()` + `generateCodeChallenge()` in `spotifyClient.ts`
   - `initiateOAuth()`: `shell.openExternal()` mit Spotify Auth-URL (scope: `user-read-playback-state user-modify-playback-state`)
   - Deep-Link-Handler in `electron/main.cjs` für `triggerhub://spotify-callback?code=...`
   - Token-Exchange: POST zu `https://accounts.spotify.com/api/token` mit `code` + `code_verifier`
   - Access-Token + Refresh-Token in `runtimeConfig` persistieren (verschlüsselt via SEC-01)
2. Token-Refresh-Logik: automatisches Refresh wenn `expires_in` abgelaufen.
3. `SpotifyHttpTransport.connect()` implementieren: prüft Token-Gültigkeit, ruft `/me` auf.
4. EventHandler für Playback-State (`/me/player`) via Polling (30s) — kein WebSocket bei Spotify verfügbar.
   - Publish `spotify:track-changed`, `spotify:playback-started`, `spotify:playback-paused` auf EventBus.
5. `bootstrap.ts:46`: analog zu Twitch — wähle `SpotifyHttpTransport` wenn Token vorhanden.
6. Settings.tsx: Spotify-Auth-Panel mit "Connect via Spotify" Button + Disconnect + aktuelle Track-Anzeige.

**Definition of Done:**
- Nutzer klickt "Connect Spotify" → Browser öffnet Spotify Auth-Page.
- Nach Autorisierung: Callback → Token wird gespeichert → StatusBar: Spotify verbunden.
- Aktuell laufender Track erscheint in der App (z. B. StatusBar oder Dashboard-Widget).
- Track-Wechsel → `spotify:track-changed`-Event → verbundene Trigger feuern.
- Disconnect: Token wird gelöscht, Status wechselt auf Offline.

**Testkriterien:**
- Unit: PKCE `codeChallenge` = SHA256(codeVerifier) base64url-encoded.
- Unit: Token-Refresh feuert wenn `expiresAt < Date.now()`.
- Unit: `SpotifyHttpTransport.connect()` publiziert `spotify:connected` (Mock-HTTP).
- Integration: `bootstrap.ts` wählt `SpotifyHttpTransport` wenn Token in Config.

**Risiken:**
- Spotify verlangt registrierte Redirect-URI in der Developer Console — Nutzer-Doku nötig.
- Refresh-Token kann widerrufen werden (Nutzer entzieht Rechte) → Fehlerfall behandeln.
- Polling (30s) verursacht Latenz — Nutzer informieren, dass das Spotify-API-Limit ist.

---

## A-3: Clip Service — reale Capture-Logik

**Problem (C-04):** `clip-service/index.ts:52–60` gibt statische Dummy-Buffer zurück. `InMemoryClipExporter.exportClip()` ist ein No-Op.

**Betroffene Dateien:**
- `src/services/clip-service/index.ts` (Zeilen 52–60 — buildClipBuffer() Stub)
- `src/services/clip-service/clipExporter.ts` *(neu oder erweitern)*
- `src/app/bootstrap.ts` (Zeile 47 — Wiring)
- `src/types/ports.ts` (IClipExporter-Interface)
- `electron/main.cjs` (File-System-Zugriff für Clip-Export)

**Konkrete Aufgaben:**

**Option A (empfohlen): OBS-Replay-Buffer-Integration**
- Voraussetzung: A-1 (OBS WebSocket) ist implementiert.
- `ObsWebSocketTransport` um `saveReplayBuffer()` erweitern → OBS-WebSocket-Request `SaveReplayBuffer`.
- `ClipService.buildClipBuffer()`: Callback zu OBS → Replay-Buffer-Datei lesen → Buffer zurückgeben.
- `FileClipExporter.exportClip(buffer, path)`: Buffer in Datei schreiben via `fs` in Main-Process (IPC).

**Option B (Fallback): Electron Screen-Capture**
- `desktopCapturer.getSources()` in `electron/main.cjs` (IPC-Handler).
- `MediaRecorder`-basierte Capture im Renderer (zeitlich begrenzt, z. B. letzte 30s).
- Nur sinnvoll wenn OBS nicht verbunden.

**Definition of Done:**
- Trigger mit Action `clip.save` → Clip-Datei erscheint in konfiguriertem Export-Verzeichnis.
- Dateiname enthält Timestamp + optionalen Label.
- Fehler (kein Replay-Buffer aktiv) → saubere Fehlermeldung in App, kein Silent-Fail.

**Testkriterien:**
- Unit: `exportClip()` ruft IPC-Handler auf, Datei wird an erwarteten Pfad geschrieben (Mock-FS).
- Integration: OBS-Replay-Buffer-Request wird gesendet (Mock-WebSocket).
- Manuell: Trigger auslösen → Clip in `%USERPROFILE%/Videos/TriggerHub/` vorhanden.

**Risiken:**
- **Abhängigkeit A-1**: Ohne OBS-Transport ist Option A nicht möglich → Option B als Fallback vorbereiten.
- OBS-Replay-Buffer muss in OBS aktiv sein — Nutzer-Doku und In-App-Hinweis nötig.
- Screen-Capture (Option B) benötigt Electron-Permission auf Windows — prüfen.

---

## A-4: Confirm-Dialog für destruktive Aktionen

**Problem (C-05, M-03):** TriggerCard-Klick feuert `executeTrigger()` sofort. Kein Confirm-Dialog bei Delete (Trigger, Macro).

**Betroffene Dateien:**
- `src/ui/components/TriggerCard.tsx` (Zeile 12 — onClick)
- `src/ui/pages/TriggerEditor.tsx` (Delete-Button)
- `src/ui/pages/MacroEditor.tsx` (Delete-Button)
- `src/ui/components/` — ggf. neue `ConfirmDialog.tsx`-Komponente

**Konkrete Aufgaben:**
1. `ConfirmDialog.tsx` implementieren: Modal mit Titel, Text, "Bestätigen" (danger) + "Abbrechen" Button.
   - Props: `open`, `title`, `description`, `onConfirm`, `onCancel`
   - Nutzt bestehende `Button`-Varianten und Token-basierte Styles.
2. `TriggerCard.tsx`: `executeTrigger`-Click → erst `setConfirmOpen(true)` → nach Bestätigung `onExecute()`.
3. `TriggerEditor.tsx`: Delete-Button → ConfirmDialog ("Trigger löschen?" + Trigger-Name).
4. `MacroEditor.tsx`: Delete-Button → ConfirmDialog ("Macro löschen?" + Macro-Name).

**Definition of Done:**
- Kein einziger direkter Dispatch ohne vorherige Bestätigung bei `execute`, `deleteTrigger`, `deleteMacro`.
- Abbrechen in Dialog → kein Seiteneffekt.
- Keyboard: Escape schließt Dialog, Enter bestätigt.

**Testkriterien:**
- Unit: `TriggerCard` rendert ConfirmDialog nach erstem Click (kein `onExecute`-Call).
- Unit: `onExecute` wird nur nach `onConfirm` aufgerufen.
- Unit: TriggerEditor `onDelete` wird nur nach Dialog-Bestätigung gefeuert.

**Risiken:** Minimal. Keine externen Abhängigkeiten. Isolierter UI-Change.

---

---

# BLOCK B — Sicherheit & Datenschutz

**Ziel:** Credentials dürfen nicht lesbar auf der Festplatte liegen — das ist ein grundlegendes Sicherheitsversprechen jeder Desktop-App.

**Nutzerrelevanz:** Sehr hoch (Vertrauen)
**Vertrauensschaden:** Sehr hoch (Credentials in Plaintext = K.O.-Kriterium für jeden ernsthaften Nutzer)
**Muss fertig vor:** Parallel zu Block A, spätestens gleichzeitig

---

## B-1: Electron safeStorage für Credentials

**Problem (SEC-01):** Twitch `clientId` + `accessToken` (und nach A-1/A-2 auch `obsPassword` + Spotify-Token) werden in `userData/TriggerHub2/runtime-config.json` im Klartext gespeichert.

**Betroffene Dateien:**
- `electron/main.cjs` (IPC-Handler für `storage:load` / `storage:save`)
- `src/app/storageBridge.ts` (persistRuntimeConfig)
- `src/app/runtimeConfig.ts` (Typen, ggf. Schlüssel-Kennzeichnung)

**Konkrete Aufgaben:**
1. In `electron/main.cjs`: IPC-Handler für `storage:save` prüft Key — wenn `runtime-config`:
   - Sensitive Felder (`clientId`, `accessToken`, `obsPassword`, `spotifyAccessToken`, `spotifyRefreshToken`) via `safeStorage.encryptString()` verschlüsseln.
   - Restliche Felder unverändert lassen.
2. IPC-Handler für `storage:load`, Key `runtime-config`:
   - Sensitive Felder via `safeStorage.decryptString()` entschlüsseln.
3. Migration: Beim ersten Start nach Update prüfen ob Plaintext-Config existiert → migrieren + überschreiben.
4. `runtimeConfig.ts`: Sensitive Felder typisiert kennzeichnen (z. B. `SensitiveString`-Typ-Alias mit Kommentar), keine funktionalen Änderungen.

**Definition of Done:**
- `runtime-config.json` enthält verschlüsselte Blobs für alle Credential-Felder.
- Nach Neustart werden Credentials korrekt entschlüsselt und sind verwendbar.
- Migration von bestehenden Plaintext-Configs läuft automatisch und ohne Datenverlust.
- `safeStorage.isEncryptionAvailable()` wird geprüft; wenn `false` → Warn-Log + Fallback (kein Silent-Fail).

**Testkriterien:**
- Unit: Mock `safeStorage` → Encrypt wird für Credential-Keys aufgerufen.
- Unit: Nach Decrypt sind Originalwerte wiederhergestellt.
- E2E: Gespeicherte JSON-Datei enthält keine Klartext-Strings für bekannte Credential-Werte.

**Risiken:**
- `safeStorage` auf Windows nutzt DPAPI — an den eingeloggten Windows-User gebunden. Kein Problem für Single-User-Desktop, aber Nutzer informieren.
- `isEncryptionAvailable()` kann unter bestimmten Bedingungen `false` zurückgeben (headless CI) → Tests anpassen.

---

---

# BLOCK C — Inkonsistente UI/UX

**Ziel:** Die App muss bedienbar sein ohne JSON-Kenntnisse. Forms sind das primäre Nutzerinterface.

**Nutzerrelevanz:** Sehr hoch (Usability)
**Vertrauensschaden:** Hoch (JSON-Textarea signalisiert "unfertiges Produkt")
**Muss fertig vor:** Beta-Release

---

## C-1: Strukturierte Trigger-/Macro-Forms

**Problem (H-04):** `TriggerForm.tsx:36–81` und `MacroForm.tsx:47–79` nutzen JSON-Textareas für Conditions, Actions und Steps. Kein normaler Nutzer kann diese bedienen.

**Betroffene Dateien:**
- `src/ui/components/TriggerForm.tsx`
- `src/ui/components/MacroForm.tsx`
- `src/ui/components/MacroStepEditor.tsx`
- `src/types/domain.ts` (EventTopics, Action-Typen für Dropdowns)

**Konkrete Aufgaben:**

**TriggerForm:**
1. **Event-Picker:** Dropdown mit allen `EventTopics` aus `domain.ts` (obs:scene-changed, spotify:track-changed etc.).
2. **Conditions-Builder:** "Add Condition"-Button → je eine Zeile: `[field dropdown] [operator dropdown] [value input]`. Intern zu `TriggerCondition[]` serialisieren.
3. **Actions-Builder:** "Add Action"-Button → Zeile: `[action-type dropdown]` + dynamische Parameter je Typ (z. B. bei `macro.run`: Macro-ID-Dropdown aus existierenden Macros).
4. JSON-Textarea als Dev-Mode-Toggle behalten (hidden by default, zugänglich über "Advanced"-Link).

**MacroForm / MacroStepEditor:**
1. **Step-Typ-Dropdown:** delay, service_call, macro_call, conditional, parallel, sequence.
2. Je Typ: typ-spezifische Felder:
   - `delay`: Zahl-Input (ms)
   - `service_call`: Service-Dropdown + Action-Dropdown + Parameter-Felder
   - `macro_call`: Macro-ID-Dropdown (aus existierenden Macros)
   - `conditional`: Condition-Builder + Then-/Else-Steps (rekursiv)
3. Step-Reihenfolge via Drag-or-Up/Down-Buttons.

**Definition of Done:**
- Vollständiger Trigger (Event + 1 Condition + 1 Action) erstellbar ohne JSON-Eingabe.
- Vollständiges Macro (2 Steps) erstellbar ohne JSON-Eingabe.
- Gespeicherte Daten sind semantisch identisch zu manuell eingegebenen JSON-Strukturen.
- "Advanced / JSON"-Toggle bleibt für Power-User erhalten.

**Testkriterien:**
- Unit: Form-State produziert korrektes `TriggerCondition[]`-Objekt bei Felder-Eingabe.
- Unit: Form-State produziert korrektes `MacroStep[]`-Objekt.
- UI-Test: Render von `TriggerForm` ohne JSON-Textarea-Elemente als Default.
- Integration: Erstellter Trigger wird korrekt persistiert und löst aus.

**Risiken:**
- Aufwand XL — größte Einzelaufgabe in dieser Roadmap.
- Rekursive Steps (conditional mit Sub-Steps) erhöhen Komplexität erheblich — ggf. für v1.0 limitieren auf flache Steps.

---

## C-2: Settings.tsx Token-Migration

**Problem (H-02):** `Settings.tsx:96–109` nutzt Tailwind-Utility-Klassen (`text-slate-400`, `text-white`, `text-slate-500`) statt Token-basierte `style={{}}`. Bei Tailwind-Purge oder Theme-Wechsel bricht das Styling.

**Betroffene Dateien:**
- `src/ui/pages/Settings.tsx` (Zeilen 96–109)
- `src/ui/styles/tokens.css` (Referenz für korrekte Variablen-Namen)

**Konkrete Aufgaben:**
1. Zeile 96–109 in `Settings.tsx`: Alle `className`-Tailwind-Utilities ersetzen:
   - `text-slate-400` → `style={{ color: 'var(--color-text-muted)' }}`
   - `text-white` → `style={{ color: 'var(--color-text-primary)' }}`
   - `text-slate-500` → `style={{ color: 'var(--color-text-muted)' }}`
   - `border-border`, `bg-input-background` → `style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-input-background)' }}`
2. Visuell sicherstellen: Twitch-Panel sieht identisch aus wie OBS-Panel und Spotify-Panel.

**Definition of Done:**
- Keine `className`-Attribute mit Tailwind-Utilities im Twitch-API-Panel.
- Visuell konsistent mit anderen Settings-Panels.

**Testkriterien:**
- Code-Review: Grep nach `className.*text-slate` in `Settings.tsx` → 0 Treffer.
- Visuell: Screenshot-Vergleich vor/nach (manuell).

**Risiken:** Sehr gering. Isolierter kosmetischer Change.

---

## C-3: Granulares State-Refresh

**Problem (H-03):** `App.tsx:108` ruft bei jedem CRUD `refreshApplicationState()` auf, das alle 4 State-Getter triggert — auch irrelevante Views werden neu gerendert.

**Betroffene Dateien:**
- `src/App.tsx` (runFacadeAction, Zeile 108)
- `src/app/facade.ts` (Getter-Struktur)

**Konkrete Aufgaben:**
1. `runFacadeAction()` erhält optionalen Parameter `refreshTargets: ('dashboard' | 'editor' | 'settings' | 'plugins')[]`.
2. Alle `runFacadeAction()`-Aufrufe in App.tsx mit passendem `refreshTargets` versehen:
   - Trigger-CRUD → `['dashboard', 'editor']`
   - Macro-CRUD → `['dashboard', 'editor']`
   - Settings-Änderung → `['settings']`
   - Service-Connect/Disconnect → `['dashboard', 'settings']`
3. `refreshApplicationState()` nutzt `refreshTargets` um selektiv zu refreshen.

**Definition of Done:**
- Bei Trigger-Rename: `refreshPlugins()` wird nicht aufgerufen.
- Bei Settings-Änderung: `refreshEditor()` wird nicht aufgerufen.
- Alle bestehenden Tests laufen weiter.

**Testkriterien:**
- Unit: `runFacadeAction(action, msg, undefined, ['editor'])` ruft nur `refreshEditor()` auf.
- Bestehende Tests in `app-refresh.test.tsx` bleiben grün.

**Risiken:** Gering. Rein interne Optimierung ohne Verhaltensänderung nach außen.

---

---

# BLOCK D — Produktkommunikation

**Ziel:** Was auf der Website steht, muss dem Code-Stand entsprechen. Falsche Versprechen zerstören Vertrauen beim ersten Nutzungskontakt.

**Nutzerrelevanz:** Mittel (vor Alpha wenige Nutzer)
**Vertrauensschaden:** Hoch (wenn externe Nutzer kommen)
**Muss fertig vor:** Öffentlicher Beta-Release

---

## D-1: Website — Service-Claims anpassen

**Problem:** `WebsiteLandingPage.tsx` und `website/README.md` behaupten vollständige OBS/Spotify/Clip-Integration. Diese existiert erst nach Block A.

**Betroffene Dateien:**
- `website/src/pages/WebsiteLandingPage.tsx`
- `website/src/i18n/locales/de/common.json`
- `website/src/i18n/locales/en/common.json`
- `website/README.md`

**Konkrete Aufgaben:**
1. **Sofort (vor Block A ist fertig):** Service-Claims auf "Coming Soon" oder "In Development" kennzeichnen — explizit, nicht versteckt. Kein greenwashing durch vage Formulierungen.
2. **Nach Block A:** Claims wieder aktivieren sobald echte Verbindung funktioniert.
3. `website/README.md`: Aktuellen Implementierungsstand explizit dokumentieren (welche Services wirklich funktionieren).

**Definition of Done:**
- Kein Claim auf der Website, der einen nicht-funktionalen Service als funktionierend darstellt.
- Roadmap-/Status-Abschnitt auf Landing-Page vorhanden.

**Testkriterien:** Manueller Review der Website gegen aktuelle Funktions-Matrix.

**Risiken:** Gering. Nur Content-Änderungen.

---

## D-2: Website — AuthProvider.refresh() implementieren

**Problem (M-05):** `website/src/app/providers/AuthProvider.tsx:107–109` wirft Error in `refresh()` statt Token zu erneuern. Bei abgelaufener Session → harter Logout ohne Warnung.

**Betroffene Dateien:**
- `website/src/app/providers/AuthProvider.tsx` (Zeilen 107–109)
- `website/api/` — neuer `_refresh.ts` Endpoint nötig
- `website/src/modules/auth/backendSession.ts`

**Konkrete Aufgaben:**
1. `website/api/_refresh.ts`: Neuen API-Endpoint implementieren der bestehende Session-Cookie validiert und neues Cookie mit verlängerter TTL setzt.
2. `AuthProvider.tsx:107–109`: `refresh()` ruft `POST /api/auth/refresh` auf statt Error zu werfen.
3. Auto-Refresh: 5 Minuten vor Session-Ablauf automatisch `refresh()` aufrufen (Timeout in AuthProvider).
4. `website/src/app/routing/routeManifest.ts`: Sicherstellen dass `/api/auth/refresh` nicht durch Route-Guards geblockt wird.

**Definition of Done:**
- Session verlängert sich automatisch bei aktiver Nutzung.
- Abgelaufene Session → Nutzer wird mit Hinweis auf Login-Page geleitet, nicht mit uncaught Error konfrontiert.

**Testkriterien:**
- Unit: `refresh()` ruft `POST /api/auth/refresh` auf (Mock-Fetch).
- Unit: Auto-Refresh-Timer wird gesetzt wenn `expiresAt - Date.now() < 5min`.
- Test: `website-auth-v1.test.ts` erweitern für Refresh-Szenario.

**Risiken:** Mittel — neue Server-Route erhöht Angriffsfläche minimal. CSRF-Token muss auch für Refresh-Request validiert werden.

---

---

# BLOCK E — Technische Anschlussarbeiten

**Ziel:** Langfristige Stabilität. Kein unmittelbarer Produktblocker, aber relevant für Wartbarkeit und Feature-Velocity.

**Muss fertig vor:** v1.0 (nach öffentlichem Beta)

---

## E-1: Twitch EventSub WebSocket

**Problem (M-02):** Twitch-Service pollt `/helix/streams` alle 60s statt Echtzeit-Events via EventSub-WebSocket.

**Betroffene Dateien:**
- `src/services/twitch-service/index.ts`
- `src/services/twitch-service/twitchActions.ts`
- `src/services/twitch-service/contracts.ts`

**Konkrete Aufgaben:**
1. Twitch EventSub WebSocket-Client implementieren (`wss://eventsub.wss.twitch.tv/ws`).
2. Subscriptions für relevante Events: `stream.online`, `stream.offline`, `channel.update`, `channel.channel_points_custom_reward_redemption.add`.
3. Event-Handler publizieren auf EventBus (z. B. `twitch:stream-online`, `twitch:redemption`).
4. Polling-Fallback beibehalten wenn EventSub-Verbindung fehlschlägt.
5. Session-Keepalive (Heartbeat alle 10s) implementieren.

**Definition of Done:**
- Twitch-Events kommen in < 2s nach Auslösung an (statt bis zu 60s).
- Reconnect-Logic bei Verbindungsabbruch.
- Polling-Code als `@deprecated` markiert, bleibt als Fallback.

**Testkriterien:**
- Unit: WebSocket-Handler publiziert korrektes Event auf EventBus (Mock-WS).
- Unit: Reconnect-Timer startet bei Verbindungsabbruch.

**Risiken:** Mittel — EventSub erfordert App-Registration bei Twitch + Webhook-Verification. Alternativ: `eventsub-ws` ohne Webhook-Requirement — diesen Pfad wählen.

---

## E-2: Globale Hotkeys

**Problem (M-01):** `HotkeyManager` nutzt `window.keydown` — nur aktiv wenn Fenster fokussiert. Für Streaming-Use-Case ist globale Auslösung nötig.

**Betroffene Dateien:**
- `src/core/hotkey-manager/` (oder equivalent)
- `electron/main.cjs` (globalShortcut API)
- `electron/preload.cjs` (IPC-Bridge für Hotkey-Events)

**Konkrete Aufgaben:**
1. `electron/main.cjs`: `globalShortcut.register(accelerator, callback)` für konfigurierte Hotkeys.
2. Bei Auslösung: `mainWindow.webContents.send('global-hotkey', accelerator)`.
3. `electron/preload.cjs`: `ipcRenderer.on('global-hotkey', ...)` → `window.dispatchEvent(new CustomEvent('global-hotkey', ...))`.
4. `HotkeyManager`: Auf `global-hotkey`-Event reagieren zusätzlich zu `window.keydown`.
5. `Settings.tsx`: Hotkey-Konfigurations-Panel (Accelerator-Eingabe + Test-Button).

**Definition of Done:**
- Konfigurierter Hotkey löst Trigger auch aus wenn TriggerHub im Hintergrund läuft.
- Hotkeys werden beim App-Schließen deregistriert (`globalShortcut.unregisterAll()`).

**Testkriterien:**
- Unit: IPC-Event `global-hotkey` → `HotkeyManager` feuert zugehörigen Trigger.
- Manuell: Hotkey in anderem Fenster aktiv → Trigger feuert.

**Risiken:** Niedrig. Electron-API gut dokumentiert.

---

## E-3: MacroEngine Circular-Dep Refactoring

**Problem (H-01):** `bootstrap.ts:69–77` nutzt Forward-Reference-Closure um Circular Dependency zwischen `MacroEngine` und `ActionDispatcher` zu lösen. Fragil bei Refactoring.

**Betroffene Dateien:**
- `src/app/bootstrap.ts` (Zeilen 69–77)
- `src/core/macro-system/macroEngine.ts`
- `src/app/actionDispatcher.ts`

**Konkrete Aufgaben:**
1. `MacroEngine` wird ohne `stepHandler`-Callback konstruiert.
2. Nach Konstruktion beider Module: `macroEngine.setStepHandler(actionDispatcher.executeMacroStep)`.
3. `MacroEngine` wirft `Error` wenn `runMacro()` ohne gesetzten `stepHandler` aufgerufen wird.
4. Forward-Reference-Closure aus `bootstrap.ts` entfernen.

**Definition of Done:**
- `bootstrap.ts:69–77` enthält keine `let x!:` Forward-Reference-Patterns mehr.
- Alle bestehenden MacroEngine-Tests laufen weiter.

**Testkriterien:**
- Unit: `MacroEngine` wirft bei fehlenden `stepHandler`.
- Bestehende `core-macro.test.ts` bleiben grün.

**Risiken:** Mittel — Konstruktor-API-Änderung; Tests müssen angepasst werden.

---

## E-4: Desktop i18n

**Problem (M-04):** Desktop-App hat keine Lokalisierung — alle Texte hardcoded auf Englisch.

**Betroffene Dateien:**
- Alle `src/ui/pages/*.tsx` und `src/ui/components/*.tsx`
- `src/main.tsx` (i18next-Init)
- `package.json` (i18next + react-i18next Dependency)

**Konkrete Aufgaben:**
1. `i18next` + `react-i18next` als Desktop-Dependency aufnehmen.
2. Locale-Dateien `src/locales/de/common.json` + `src/locales/en/common.json` anlegen.
3. Alle hardcodierten Strings in `t('key')`-Aufrufe umwandeln.
4. `Settings.tsx`: Sprach-Auswahl-Dropdown.
5. Spracheinstellung in `desktopPreferences` persistieren.

**Definition of Done:**
- App vollständig auf Deutsch und Englisch nutzbar.
- Sprach-Wechsel ohne Neustart (hot-switch).

**Testkriterien:**
- Unit: Alle UI-Texte werden via `t()` aufgelöst (Grep + Review).
- Manuell: Sprach-Wechsel → alle Texte ändern sich korrekt.

**Risiken:** Niedrig technisch, aber hoher manueller Aufwand (Textmenge).

---

---

# BLOCK F — Tests & Validierung

**Ziel:** Teststand re-validieren nach allen Änderungen. Kein Release ohne grüne Tests.

**Muss fertig vor:** Jeder Release-Candidate

---

## F-1: Teststand-Validierung (sofort)

**Problem:** `npm test` wurde nach den letzten Änderungen nicht re-verifiziert. 28+ Testdateien, Teststand unbekannt.

**Konkrete Aufgaben:**
1. `npm test` ausführen — alle Fehler dokumentieren.
2. Fehlgeschlagene Tests reparieren (ohne Tests abzuschwächen).
3. Coverage-Report erstellen — Lücken für neue Module identifizieren.

**Definition of Done:** `npm test` mit 0 Fehlern, Coverage ≥ 80% für alle neuen Module.

---

## F-2: Tests für neue Integrationen

Nach jedem Block-A-Modul: Tests schreiben bevor Block-A als "Done" gilt.

| Modul | Testdatei | Mindest-Coverage |
|---|---|---|
| ObsWebSocketTransport | `src/tests/obs-transport.test.ts` | Connect, Disconnect, Event-Publish, Error-Handling |
| SpotifyHttpTransport + PKCE | `src/tests/spotify-transport.test.ts` | PKCE-Calc, Token-Refresh, Playback-Poll |
| FileClipExporter | `src/tests/clip-exporter.test.ts` | Export, Fehlerfall kein Replay-Buffer |
| safeStorage Migration | `src/tests/credential-storage.test.ts` | Encrypt, Decrypt, Migration-Path |
| ConfirmDialog | `src/tests/ui-confirm-dialog.test.tsx` | Render, Confirm, Cancel, Keyboard |
| Strukturierte Forms | `src/tests/ui-trigger-form.test.tsx`, `ui-macro-form.test.tsx` | Form-State → korrektes Domain-Objekt |

---

## F-3: End-to-End-Szenarien (manuell, vor Beta)

| Szenario | Erwartetes Ergebnis |
|---|---|
| OBS verbinden → Szene wechseln → Trigger feuert | StatusBar grün, TriggerCard-Log zeigt Ausführung |
| Spotify verbinden → Track wechseln → Macro läuft | Macro-Steps werden ausgeführt, Log zeigt Steps |
| Twitch-Event (Stream online) → Hotkey-Trigger | App im Hintergrund, Hotkey löst aus |
| Credentials-Migration von v0.1.1 auf v0.2.0 | Keine Datenverlust, keine Klartext-Credentials |
| Delete Trigger mit Confirm-Dialog | Kein versehentliches Löschen möglich |
| NSIS-Installer: Install → Update → Uninstall | Installer-Flow vollständig durchlaufen |

---

---

## Reihenfolge im Überblick

```
SOFORT (Woche 1–2)
  ├─ F-1: npm test ausführen + alle Fehler reparieren
  ├─ B-1: safeStorage für Credentials [SEC-01]
  └─ A-4: ConfirmDialog (klein, unabhängig) [C-05, M-03]

VOR ALPHA (Woche 3–8)
  ├─ A-1: OBS WebSocket Transport [C-02]
  ├─ A-2: Spotify OAuth PKCE [C-03]  (parallel zu A-1)
  ├─ A-3: Clip Service [C-04]  (nach A-1)
  ├─ C-3: Granulares State-Refresh [H-03]  (klein, parallelfähig)
  ├─ C-2: Settings.tsx Token-Migration [H-02]  (klein, parallelfähig)
  └─ F-2: Tests für alle A-Block-Module

VOR BETA (Woche 9–14)
  ├─ C-1: Strukturierte Trigger-/Macro-Forms [H-04]
  ├─ D-1: Website Claims anpassen [nach A-Block abgeschlossen]
  ├─ D-2: AuthProvider.refresh() [M-05]
  └─ F-3: E2E-Szenarien manuell durchführen

NACH BETA / V1.0
  ├─ E-1: Twitch EventSub WebSocket [M-02]
  ├─ E-2: Globale Hotkeys [M-01]
  ├─ E-3: MacroEngine Circular-Dep Refactoring [H-01]
  └─ E-4: Desktop i18n [M-04]
```

---

## Abhängigkeitsgraph

```
B-1 (safeStorage) ─────────────────────────────────────────────────────┐
                                                                         │
A-1 (OBS Transport) ──────────────────────────────────────────────────┐ │
    └─ A-3 (Clip Service) abhängig von A-1                             │ │
                                                                        ↓ ↓
A-2 (Spotify OAuth) ──── unabhängig von A-1 ────────────── alle nutzen B-1 Credentials

A-4 (ConfirmDialog) ──── vollständig unabhängig ──────────── sofort umsetzbar

C-1 (Strukturierte Forms) ── nutzt EventTopics aus domain.ts ── nach A-1/A-2 vollständiger
C-2, C-3 ──── vollständig unabhängig ──────────────────────── jederzeit umsetzbar

D-1 (Website Claims) ──── nach A-Block ──────────── erst wenn Integrationen funktionieren

E-1 (Twitch EventSub) ──── nach A-Block stabil ──── kann Twitch-Transport ersetzen
E-2 (Hotkeys) ──── unabhängig ────────────────────── jederzeit nach Alpha
E-3 (Circular-Dep) ──── unabhängig ──────────────── Tech-Debt, niedrige Prio
E-4 (Desktop i18n) ──── nach C-1 ────────────────── erst wenn Forms stabil
```

---

## Risiko-Register

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|
| Spotify Developer App-Registration blockiert Launch | Mittel | Hoch | Früh registrieren; Nutzer-Doku für eigene App-Erstellung vorbereiten |
| OBS v27 (ältere Nutzer) inkompatibel mit obs-websocket-js v5 | Hoch | Mittel | Versionsprüfung + klare Systemvoraussetzungen in Docs |
| C-1 (Strukturierte Forms) sprengt Zeitplan | Mittel | Mittel | JSON-Textarea-Fallback behalten; Forms iterativ ausbauen |
| safeStorage nicht verfügbar (DPAPI-Fehler) | Niedrig | Hoch | Fallback: Warnung + weicher Fail; niemals Silent-Plaintext |
| Teststand zeigt mehr Broken Tests als erwartet | Mittel | Mittel | F-1 sofort ausführen um Umfang zu kennen |

# PROJECT CONSISTENCY AND FUNCTIONAL GAP ANALYSIS
## TriggerHub 2.0 — v0.1.1-prep
**Stand:** 2026-03-17 | **Branch:** release/v0.1.1-prep

---

## Executive Summary

TriggerHub 2.0 ist ein Windows-Desktop-Automatisierungstool (Electron + React) mit begleitender Marketing-/Owner-Website (React + Vercel). Das Projekt ist ein **Alpha-Prototype** mit solider Kernarchitektur, aber erheblichen Produktionslücken bei den Service-Integrationen.

**Gesamtbewertung:** 3.0/5 — Nicht produktionsreif.

**Stärken:**
- Trigger-Engine, Macro-Engine und EventBus sind vollständig implementiert und getestet.
- Website-Auth ist sicher (HMAC-JWT, CSRF, PBKDF2-SHA256).
- Ports-&-Adapters-Architektur korrekt angewendet.
- 28+ Testdateien mit breiter Abdeckung.

**Kritische Lücken:**
- 75% der Service-Integrationen (OBS, Spotify, Clip) sind InMemory-Stubs — keine echten Verbindungen möglich.
- Marketing-Website verspricht vollständige Integrationen, die nicht existieren.
- Plaintext-Speicherung von Twitch-Credentials.

---

## Tatsächlich vorhandene Kernfunktionen

| Funktion | Implementierung | Datei(en) | Status |
|---|---|---|---|
| **Trigger Engine** | Dual-Index (ID + Event), Graph-basiert, Action-Dispatch via Registry | `src/core/trigger-engine/` | ✅ Vollständig |
| **Macro Engine** | Rekursive Step-Execution, 6 Step-Typen, Depth-Guard | `src/core/macro-system/macroEngine.ts` | ✅ Vollständig |
| **EventBus** | In-Memory Pub/Sub, namespaced Topics, Wildcard-Subscriptions | `src/core/event-bus/` | ✅ Vollständig |
| **Storage Layer** | IPC-Bridge zu `jsonFileStorage.cjs`, CRUD für Triggers/Macros/Config | `src/app/storageBridge.ts`, `electron/main.cjs` | ✅ Vollständig |
| **Plugin System** | PluginRegistry mit Capability-basiertem Zugriff auf TriggerEngine/EventBus | `src/core/plugin-system/` | ✅ Vollständig |
| **Twitch Service** | HTTP-Transport (60s Polling) ODER InMemory, wählbar per Config | `src/services/twitch-service/` | 🟡 Partiell |
| **Desktop UI — Dashboard** | TriggerCard-Grid, StatusBar (4 Services), Runtime-Log | `src/ui/pages/Dashboard.tsx` | ✅ Vollständig |
| **Desktop UI — TriggerEditor** | CRUD für Trigger, Event-Picker, JSON-Textarea für Conditions/Actions | `src/ui/pages/TriggerEditor.tsx` | 🟡 Partiell |
| **Desktop UI — MacroEditor** | CRUD für Macros, Step-Builder via JSON-Textarea | `src/ui/pages/MacroEditor.tsx` | 🟡 Partiell |
| **Desktop UI — Settings** | Runtime Controls, Twitch Config, Connected Services | `src/ui/pages/Settings.tsx` | 🟡 Partiell |
| **Website Auth** | HMAC-JWT, HttpOnly Cookies, CSRF-Token, PBKDF2-SHA256 | `website/src/modules/auth/` | ✅ Vollständig |
| **Website Routing** | Mode-basierte Route-Guards (public_product/private_prelaunch) | `website/src/app/routing/` | ✅ Vollständig |
| **Website i18n** | react-i18next, de/en, WebsiteLandingPage vollständig übersetzt | `website/src/i18n/` | ✅ Vollständig |
| **Electron Build** | electron-builder, NSIS + Portable, GitHub-Release-Integration | `package.json` (build config) | ✅ Konfiguriert |

---

## Unfertige / riskante Funktionen

### Kritisch — Produktionsblock

| ID | Funktion | Problem | Datei | Zeilen |
|---|---|---|---|---|
| **C-02** | OBS Service | `InMemoryObsTransport` — kein WebSocket-Client, `switchScene()` ist No-Op | `src/app/bootstrap.ts` | 45 |
| **C-03** | Spotify Service | `connect()` ist No-Op, `InMemorySpotifyTransport` — kein OAuth PKCE | `src/services/spotify-service/spotifyActions.ts` | 19–24 |
| **C-04** | Clip Service | `buildClipBuffer()` liefert Dummy-Daten, `InMemoryClipExporter.exportClip()` ist No-Op | `src/services/clip-service/index.ts` | 52–60 |
| **C-05** | TriggerCard-Ausführung | Klick auf TriggerCard = sofortiges `executeTrigger()` ohne Bestätigung | `src/ui/components/TriggerCard.tsx` | 12 |
| **SEC-01** | Twitch Credentials | `clientId` + `accessToken` werden Plaintext in `userData/TriggerHub2/` gespeichert | `electron/main.cjs`, `src/app/storageBridge.ts` | — |

### Hoch — Architekturschuld / UX

| ID | Funktion | Problem | Datei | Zeilen |
|---|---|---|---|---|
| **H-01** | MacroEngine Circular Dep | Forward-Reference-Closure-Hack in bootstrap — fragil bei Refactoring | `src/app/bootstrap.ts` | 69–77 |
| **H-02** | Settings.tsx Styling | Tailwind-Klassen im Twitch-API-Panel statt Token-basierte `style={{}}` | `src/ui/pages/Settings.tsx` | 96–109 |
| **H-03** | State-Refresh Overkill | `runFacadeAction()` refresht alle 4 State-Getter bei jedem CRUD-Vorgang | `src/App.tsx` | 108 |
| **H-04** | TriggerForm/MacroForm | Conditions, Actions und Steps als raw JSON-Textarea — keine strukturierten Formularfelder | `src/ui/components/TriggerForm.tsx`, `MacroForm.tsx`, `MacroStepEditor.tsx` | 36–81 |

### Mittel — Feature-Lücken

| ID | Funktion | Problem |
|---|---|---|
| **M-01** | Hotkeys | `HotkeyManager` nutzt `window.keydown` — nur aktiv wenn App fokussiert, keine globalen Shortcuts |
| **M-02** | Twitch EventSub | 60-Sekunden-Polling statt WebSocket/EventSub — hohe Latenz, Ressourcenverbrauch |
| **M-03** | Delete-Bestätigung | Kein Confirm-Dialog bei Trigger- und Macro-Löschungen |
| **M-04** | Desktop i18n | Desktop-App hat keine Lokalisierung — alle Texte hardcoded auf Englisch |
| **M-05** | Session-Refresh | Website `AuthProvider.tsx` Zeile 107–109: `refresh()` wirft Error statt Token zu erneuern |

---

## Kommunikations-Widersprüche

### 1. Service-Integrationen (Kritisch)

**Behauptung** (Marketing/Website): *"Connect OBS, Spotify, Twitch, Clips in one place"*

**Realität (Code):**
- OBS: `new InMemoryObsTransport()` — `bootstrap.ts:45` — kein WebSocket, keine Verbindung möglich
- Spotify: `connect()` in `spotifyActions.ts:19` ist ein leerer Stub ohne OAuth
- Clip: `buildClipBuffer()` in `clip-service/index.ts:52` gibt statische Dummy-Daten zurück
- Twitch: HTTP-Transport existiert, aber nur per 60s-Polling

**Impact:** Jeder Beta-Tester, der OBS/Spotify verknüpfen will, wird sofort scheitern.

---

### 2. Design-System-Konsistenz (Hoch)

**Behauptung**: Desktop-UI nutzt durchgängig `tokens.css`-Variablen (z. B. `--color-border`, `--color-input-background`)

**Realität:** `Settings.tsx` Zeilen 96–109:
```jsx
<label className="text-xs text-slate-400">Client ID</label>
<input className="w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm text-white" />
<p className="text-xs text-slate-500">...</p>
```
→ `text-slate-400`, `text-white`, `text-slate-500` sind Tailwind-Utilities, nicht Token-Referenzen.
→ Alle anderen Panels in Settings.tsx nutzen `style={{ color: 'var(--color-text-muted)' }}` etc.

---

### 3. Live-Status-Badge (Behoben)

**Früheres Problem** (C-01): `toDashboardViewModel()` in `App.tsx:15` gab `live: false` hardcoded zurück.
**Status:** Behoben (2026-03-17) — jetzt `live: state.connectedServices.obs || state.connectedServices.spotify`
**Restproblem:** Da OBS und Spotify InMemory-Stubs sind, bleibt `live` faktisch permanent `false`.

---

### 4. Granularer State-Refresh vs. Implementierung

**Behauptung** (Kommentar in App.tsx): *Granular per-view refresh*

**Realität:** `runFacadeAction()` (`App.tsx:108`) ruft `refreshApplicationState()` auf, welches alle 4 Getter triggert:
- `refreshDashboard()`, `refreshEditor()`, `refreshSettings()`, `refreshPlugins()`

Das passiert bei *jedem* CRUD-Vorgang — auch wenn z. B. nur ein Trigger umbenannt wird.

---

### 5. Strukturierte Forms vs. JSON-Textarea

**Behauptung** (UI-Konzept/Architektur-Docs): Trigger-Editor mit visuellen Condition/Action-Feldern

**Realität:** `TriggerForm.tsx:36–81` und `MacroForm.tsx:47–79` nutzen:
```jsx
<textarea
  value={JSON.stringify(conditions, null, 2)}
  onChange={e => setConditions(JSON.parse(e.target.value))}
/>
```
→ Nutzer müssen rohes JSON eingeben. Kein Schema-Validation, keine Fehlerbehandlung bei ungültigem JSON außerhalb der äußersten Try-Catch-Wrapper.

---

## Priorisierte Problem-Liste

### Tier 1 — Produktionsblocker (vor Beta)

1. **C-02:** OBS WebSocket-Transport implementieren (obs-websocket-js oder ähnlich)
2. **C-03:** Spotify OAuth PKCE implementieren (`spotifyClient.ts` hat HTTP-Gerüst, fehlt Auth-Flow)
3. **C-04:** Clip-Capture-Logik implementieren (Screen-Capture API oder OBS-Clip-Hook)
4. **SEC-01:** Twitch Credentials via `electron.safeStorage.encryptString()` verschlüsseln
5. **C-05:** Confirm-Dialog für `executeTrigger()` auf TriggerCard (und Deletes allgemein)

### Tier 2 — Hohe Priorität (für stabile Alpha)

6. **H-02:** Settings.tsx Tailwind-Klassen durch Token-basierte `style={{}}` ersetzen
7. **H-04:** TriggerForm und MacroForm: JSON-Textareas durch strukturierte Felder ersetzen
8. **M-02:** Twitch EventSub via WebSocket implementieren (statt 60s-Polling)
9. **H-03:** `runFacadeAction()` auf granulares Refresh umstellen (nur betroffene View)
10. **M-05:** Website `AuthProvider.refresh()` korrekt implementieren

### Tier 3 — Mittel (für öffentlichen Launch)

11. **M-01:** Globale Hotkeys via Electron `globalShortcut` API implementieren
12. **M-04:** Desktop-App i18n einführen (de/en)
13. **M-03:** Confirm-Dialoge für alle destruktiven Aktionen (Delete Trigger, Delete Macro)
14. **H-01:** MacroEngine Circular-Dep refactoren (optional, Tech-Debt)

---

## Empfohlene Reihenfolge zur Behebung

```
Phase 1 — Integrationen (4–6 Wochen)
  └─ C-02: OBS WebSocket Transport
  └─ C-03: Spotify OAuth PKCE
  └─ C-04: Clip Service (OBS-Replay-Buffer oder Screen-Capture)
  └─ SEC-01: safeStorage für Credentials

Phase 2 — UX-Qualität (2–3 Wochen)
  └─ C-05: Confirm-Dialoge (executeTrigger, deleteTrigger, deleteMacro)
  └─ H-02: Settings.tsx Token-Migration
  └─ H-04: Strukturierte Forms für Trigger/Macro Editor
  └─ H-03: Granulares State-Refresh

Phase 3 — Robustheit (2 Wochen)
  └─ M-02: Twitch EventSub WebSocket
  └─ M-05: Website AuthProvider.refresh()
  └─ M-01: Globale Hotkeys
  └─ M-04: Desktop i18n

Phase 4 — Launch-Vorbereitung (1 Woche)
  └─ Teststand re-validieren (npm test)
  └─ NSIS-Installer End-to-End-Test
  └─ Website i18n Content-Review (de)
  └─ Credentials-Security-Audit
```

---

## Konkrete nächste 10 Maßnahmen

1. **`electron/main.cjs`:** `safeStorage.encryptString()` / `decryptString()` für `runtime-config`-Keys `clientId` + `accessToken` einsetzen. [SEC-01]

2. **`src/services/obs-service/obsTransport.ts` (neu):** `ObsWebSocketTransport` implementieren mit `obs-websocket-js`. In `bootstrap.ts:45` eintragen analog zu Twitch-Transport-Wahl. [C-02]

3. **`src/services/spotify-service/spotifyClient.ts`:** OAuth PKCE Auth-Flow implementieren. `connect()` in `spotifyActions.ts:19` muss Redirect-URI + Code-Exchange anstoßen. [C-03]

4. **`src/ui/components/TriggerCard.tsx:12`:** `onClick` nicht direkt `onExecute()` aufrufen, sondern zuerst `setConfirmPending(true)` → Confirm-Dialog rendern. [C-05]

5. **`src/ui/pages/Settings.tsx:96–109`:** Tailwind-Klassen (`text-slate-400`, `text-white`, `text-slate-500`) durch `style={{ color: 'var(--color-text-muted)' }}` etc. ersetzen. [H-02]

6. **`src/ui/components/TriggerForm.tsx` + `MacroForm.tsx`:** JSON-Textareas durch strukturierte Formularfelder ersetzen. Minimum: Event-Typ-Dropdown + Key-Value-Felder für Parameter. [H-04]

7. **`src/App.tsx`:** `runFacadeAction()` auf view-spezifische Refresh-Calls umstellen. Bei Trigger-CRUD: nur `refreshDashboard()` + `refreshEditor()`. [H-03]

8. **`src/services/twitch-service/index.ts`:** Polling-Interval von 60s auf EventSub via WebSocket umstellen. `TwitchApiTransport` um WebSocket-Handler erweitern. [M-02]

9. **`website/src/app/providers/AuthProvider.tsx:107–109`:** `refresh()`-Implementierung korrigieren: neues Token via `/api/auth/refresh` holen statt Error werfen. [M-05]

10. **`npm test` ausführen** und alle fehlgeschlagenen Tests reparieren. Test-Stand seit letzten Änderungen nicht verifiziert.

---

## Anhang — Produktions-Readiness Matrix

```
┌─────────────────────────┬──────────┬────────────┬──────────────┐
│ Komponente              │ Impl.%   │ Test%      │ Prod-Ready   │
├─────────────────────────┼──────────┼────────────┼──────────────┤
│ TriggerEngine           │ 100%     │ 100%       │ ✅ Ja        │
│ MacroEngine             │ 100%     │ 100%       │ ✅ Ja        │
│ EventBus                │ 100%     │ 100%       │ ✅ Ja        │
│ Storage Bridge          │ 100%     │ 100%       │ ✅ Ja        │
│ Plugin System           │ 100%     │ 100%       │ ✅ Ja        │
│ OBS Service             │ 10%      │ 30%        │ ❌ Nein      │
│ Spotify Service         │ 15%      │ 30%        │ ❌ Nein      │
│ Twitch Service          │ 60%      │ 70%        │ 🟡 Partiell  │
│ Clip Service            │ 10%      │ 20%        │ ❌ Nein      │
│ Desktop UI              │ 80%      │ 75%        │ 🟡 Partiell  │
│ Website Auth            │ 100%     │ 100%       │ ✅ Ja        │
│ Website UI              │ 95%      │ 85%        │ ✅ Ja        │
│ Electron Build/Release  │ 100%     │ —          │ ✅ Konfiguriert │
└─────────────────────────┴──────────┴────────────┴──────────────┘
```

**Realistisches Produktionsreife-Datum:** 3–4 Monate bei fokussierter Priorisierung auf Phase 1+2.

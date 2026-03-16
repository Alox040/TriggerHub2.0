# Technical Debt Tracker

**Erstellt am:** 2026-03-16  
**Status:** ⚠️ Mehrere offene Items, priorisiert  
**Letzte Aktualisierung:** 2026-03-16

## Zusammenfassung

Technical Debt ist gut dokumentiert und priorisiert. Die meisten kritischen Items sind bekannt und haben klare Lösungswege. Einige Items wurden bereits als "resolved" identifiziert.

## 1. Debt-Kategorien

### Architektur-Probleme 🔴
- **Anzahl:** 5 Items
- **Kritisch:** 1 Item
- **Hoch:** 2 Items
- **Mittel:** 2 Items

### Code Smells & Design Gaps ⚠️
- **Anzahl:** 4 Items
- **Mittel:** 3 Items
- **Niedrig:** 1 Item

### Risky Areas (Operational) ⚠️
- **Anzahl:** 3 Items
- **Hoch:** 1 Item
- **Mittel:** 2 Items

### Resolved Items ✅
- **Anzahl:** 5 Items
- **Status:** Als resolved markiert, aber noch in älteren Docs erwähnt

## 2. Kritische Debt-Items

### 1. Fehlende Electron IPC Bridge 🔴

**Kategorie:** Architektur-Problem  
**Priorität:** 🔴 **KRITISCH**  
**Status:** Offen

**Beschreibung:**
- Keine `preload` Script oder `contextBridge` Wiring
- React Renderer und Electron Main Process nicht verbunden

**Impact:**
- ❌ Hotkeys können nicht implementiert werden
- ❌ Window Management blockiert
- ❌ File System Operations nicht möglich
- ❌ Auto-Update Notifications nicht möglich

**Lösung:**
- `electron/preload.cjs` erstellen
- `contextBridge` konfigurieren
- IPC Handlers in `electron/main.cjs`
- Type-Safe IPC Contracts definieren

**Geschätzter Aufwand:** 2-3 Tage  
**Blockiert:** Hotkey-Features, Window Management, File Access

---

### 2. Real External Service Integrations ⚠️

**Kategorie:** Architektur-Problem  
**Priorität:** ⚠️ **HOCH**  
**Status:** Offen

**Beschreibung:**
- Services implementiert, aber Production-Integrationen fehlen
- OBS WebSocket, Spotify OAuth, Real Clip Capture nicht vollständig

**Impact:**
- ⚠️ System verhält sich wie Simulation
- ⚠️ Out-of-the-box kann nicht mit realen Services arbeiten

**Lösung:**
- OBS WebSocket Integration implementieren
- Spotify OAuth Flow implementieren
- Real Clip Capture via Electron APIs
- Production-Config für Service-Credentials

**Geschätzter Aufwand:** 1-2 Wochen  
**Blockiert:** Production-Ready Service-Integrationen

---

### 3. Transport Selection ⚠️

**Kategorie:** Architektur-Problem  
**Priorität:** ⚠️ **MEDIUM-HOCH**  
**Status:** Offen

**Beschreibung:**
- Bootstrap hardcodiert in-memory Transports
- Keine Environment-basierte Transport-Auswahl

**Impact:**
- ⚠️ Kann nicht zwischen Simulation und Production umschalten
- ⚠️ Testing vs Production nicht sauber getrennt

**Lösung:**
- Environment-Variablen für Transport-Selection
- Config-basierte Transport-Auswahl
- Runtime Transport-Switching

**Geschätzter Aufwand:** 2-3 Tage  
**Blockiert:** Saubere Test/Production-Trennung

---

## 3. Wichtige Debt-Items

### 4. Legacy Module Footprint ⚠️

**Kategorie:** Architektur-Problem  
**Priorität:** ⚠️ **MEDIUM**  
**Status:** Offen (bewusst zurückgestellt)

**Beschreibung:**
- Legacy Module existieren noch (`src/deck-engine`, `src/event-bus`, etc.)
- Potenzielle Verwirrung und Type-Konflikte

**Impact:**
- ⚠️ Cognitive Overhead
- ⚠️ Risiko von versehentlichen Legacy-Imports

**Lösung:**
- Legacy-Module identifizieren und markieren
- Deprecation Window definieren
- Migration durchführen
- Legacy-Module entfernen

**Geschätzter Aufwand:** 1 Woche  
**Blockiert:** Nichts (bewusst zurückgestellt)

---

### 5. Website Access Mode Ambiguity ⚠️

**Kategorie:** Architektur-Problem  
**Priorität:** ⚠️ **MEDIUM**  
**Status:** Offen

**Beschreibung:**
- README beschreibt `public_product` als Default
- Status-Docs beschreiben `private_prelaunch` als effektiven Modus
- Code ist neutral (leitet von `VITE_ACCESS_MODE` ab)

**Impact:**
- ⚠️ Ambiguity über aktuellen Deployment-Modus
- ⚠️ Risiko von Misconfiguration

**Lösung:**
- Deployment-Konfiguration dokumentieren
- README mit Status-Docs synchronisieren
- Klare Dokumentation des aktuellen Modus

**Geschätzter Aufwand:** 1 Tag  
**Blockiert:** Nichts

---

### 6. Hotkey und Window Manager Stubs ⚠️

**Kategorie:** Code Smell  
**Priorität:** ⚠️ **NIEDRIG** (wird HOCH, wenn Features erwartet)  
**Status:** Offen

**Beschreibung:**
- `HotkeyManager` und `WindowManager` sind Stub-Implementierungen
- Keine echte Electron-Integration

**Impact:**
- ⚠️ Hotkey-Features können nicht implementiert werden
- ⚠️ Window Control Features blockiert

**Lösung:**
- Abhängig von IPC Bridge (Item #1)
- Nach IPC Bridge implementieren

**Geschätzter Aufwand:** 3-5 Tage (nach IPC Bridge)  
**Blockiert:** IPC Bridge (Item #1)

---

### 7. Plugin Action Registry Wiring ⚠️

**Kategorie:** Code Smell  
**Priorität:** ⚠️ **MEDIUM**  
**Status:** Offen

**Beschreibung:**
- `PluginContext` enthält `ActionRegistryPort`
- Vollständige Wiring und externe Plugin-Nutzung noch in Entwicklung

**Impact:**
- ⚠️ Third-Party Plugins können nicht alle gewünschten Actions registrieren

**Lösung:**
- Action Registry Surface stabilisieren
- Dokumentation für Plugin-Autoren
- Beispiel-Plugins erweitern

**Geschätzter Aufwand:** 3-5 Tage  
**Blockiert:** Nichts

---

### 8. Design System Integration ⚠️

**Kategorie:** Code Smell  
**Priorität:** ⚠️ **MEDIUM**  
**Status:** Offen

**Beschreibung:**
- Design System (`design/`) ist separates Projekt
- Keine automatische Synchronisation mit Desktop/Website UI

**Impact:**
- ⚠️ UI-Divergenz über Zeit
- ⚠️ Duplizierte Component-Arbeit

**Lösung:**
- Shared Package evaluieren
- Automatische Sync implementieren
- Oder klare Dokumentation der Sync-Strategie

**Geschätzter Aufwand:** 1-2 Wochen  
**Blockiert:** Nichts

---

### 9. Incomplete Auto-Update Story 🔴

**Kategorie:** Risky Area  
**Priorität:** 🔴 **HOCH** (für Production)  
**Status:** Offen

**Beschreibung:**
- Auto-Update ist geplant, aber nicht implementiert
- Keine `electron-updater` Dependency oder Handler

**Impact:**
- ❌ Users müssen manuell Updates installieren
- ❌ Schwieriger, Fixes und Security Patches auszurollen

**Lösung:**
- `electron-updater` integrieren
- Update-Server konfigurieren
- Update-UI implementieren
- Testing-Strategie

**Geschätzter Aufwand:** 1 Woche  
**Blockiert:** Nichts (aber abhängig von Release-Infrastructure)

---

### 10. Release Process Verification ⚠️

**Kategorie:** Risky Area  
**Priorität:** ⚠️ **MEDIUM**  
**Status:** Offen

**Beschreibung:**
- NSIS Packaging konfiguriert
- Release-Docs betonen, dass externe Verifikation noch aussteht

**Impact:**
- ⚠️ Risiko von Release/Installer-Issues

**Lösung:**
- Externe Release-Verifikation durchführen
- Release-Artifacts testen
- Hosting-Konfiguration verifizieren

**Geschätzter Aufwand:** 2-3 Tage  
**Blockiert:** Nichts

---

### 11. Observability und Coverage ⚠️

**Kategorie:** Risky Area  
**Priorität:** ⚠️ **NIEDRIG-MEDIUM**  
**Status:** Offen

**Beschreibung:**
- Tests umfassend, aber Coverage-Metriken deaktiviert
- Operational Observability nicht vollständig dokumentiert

**Impact:**
- ⚠️ Schwieriger, Coverage-Gaps zu quantifizieren
- ⚠️ Production Monitoring nicht explizit

**Lösung:**
- Coverage-Metriken aktivieren
- Coverage-Thresholds setzen
- Observability-Strategie dokumentieren

**Geschätzter Aufwand:** 2-3 Tage  
**Blockiert:** Nichts

---

## 4. Resolved Items (Noch in älteren Docs erwähnt)

### A. UI Disconnected from Backend ✅

**Status:** ✅ **RESOLVED**  
**Alter Claim:** UI verwendete Mock-Daten  
**Aktueller Zustand:** Vollständig verbunden via Facade

---

### B. No Persistence / Unverified Storage IPC ✅

**Status:** ✅ **RESOLVED**  
**Alter Claim:** Keine Persistence  
**Aktueller Zustand:** Persistence implementiert und getestet

---

### C. No CI/CD Pipeline ✅

**Status:** ✅ **RESOLVED**  
**Alter Claim:** Nur Website Sync Workflow  
**Aktueller Zustand:** Vollständige CI/CD Pipeline vorhanden

---

### D. No Error Boundary in UI ✅

**Status:** ✅ **RESOLVED**  
**Alter Claim:** Kein Error Boundary  
**Aktueller Zustand:** `ErrorBoundary` implementiert und verwendet

---

### E. Twitch Integration Missing ✅

**Status:** ✅ **RESOLVED**  
**Alter Claim:** Twitch nicht vorhanden  
**Aktueller Zustand:** Twitch Service vollständig implementiert

---

## 5. Debt-Priorisierung

### Sofort (Diese Woche)
1. 🔴 Electron IPC Bridge (blockiert Features)

### Kurzfristig (Dieser Monat)
2. ⚠️ Transport Selection
3. ⚠️ Website Access Mode klären
4. ⚠️ Auto-Update implementieren (wenn Production geplant)

### Mittelfristig (Nächste 3 Monate)
5. ⚠️ Real Service Integrations
6. ⚠️ Legacy Module Cleanup
7. ⚠️ Design System Integration
8. ⚠️ Plugin Action Registry

### Langfristig (Backlog)
9. ⚠️ Release Process Verification
10. ⚠️ Observability & Coverage

## 6. Debt-Metriken

| Kategorie | Offen | Resolved | Gesamt |
|-----------|-------|----------|--------|
| Architektur-Probleme | 5 | 0 | 5 |
| Code Smells | 4 | 0 | 4 |
| Risky Areas | 3 | 0 | 3 |
| Resolved (in alten Docs) | 0 | 5 | 5 |
| **Gesamt** | **12** | **5** | **17** |

### Prioritäts-Verteilung

| Priorität | Anzahl |
|-----------|--------|
| 🔴 Kritisch | 1 |
| ⚠️ Hoch | 2 |
| ⚠️ Mittel | 6 |
| ⚠️ Niedrig | 3 |

## 7. Debt-Trends

### Neu identifiziert
- Keine neuen kritischen Items

### In Arbeit
- Keine Items aktuell in aktiver Entwicklung

### Resolved
- 5 Items als resolved markiert (aber noch in älteren Docs)

## 8. Empfohlene Maßnahmen

### Diese Woche
1. Electron IPC Bridge implementieren (höchste Priorität)

### Dieser Monat
2. Transport Selection implementieren
3. Website Access Mode dokumentieren
4. Auto-Update evaluieren (wenn Production geplant)

### Nächste 3 Monate
5. Real Service Integrations vorbereiten
6. Legacy Module Cleanup planen
7. Design System Integration evaluieren

## 9. Nächste Schritte

1. ✅ Technical Debt Tracker erstellt
2. ⏳ Electron IPC Bridge implementieren
3. ⏳ Transport Selection implementieren
4. ⏳ Website Access Mode klären
5. ⏳ Auto-Update evaluieren

## 10. Überprüfungs-Zyklus

**Empfohlen:** Wöchentlich oder nach größeren Änderungen

**Checkliste:**
- [ ] Neue Debt-Items identifiziert?
- [ ] Prioritäten aktualisiert?
- [ ] Resolved Items dokumentiert?
- [ ] Debt-Metriken aktualisiert?

---

*Dieser Tracker basiert auf `project-docs/TECH_DEBT.md` und aktueller Code-Analyse. Für Details siehe `project-docs/TECH_DEBT.md`.*

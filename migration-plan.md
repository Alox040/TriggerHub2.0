# Migrationsplan TriggerHub 2.0 (Architektur + Figma-Integration)

## Ausgangsanalyse

### 1) Bestehende Projektstruktur
- `src/`: Zielstruktur vorhanden, alle Dateien aktuell leer (0 Bytes).
- `design/`: Figma-Export als lauffähiger React/Vite-Prototyp.
- `docs/`: Referenz zu historischer Feature-Tiefe und Rewrite-Leitlinien.
- `project-context/`: Architektur- und Arbeitsregeln.
- `agents/`: vorhandene Agent-Rollen, plus neue Spezifikation in `agents/agent-specification.md`.

### 2) Vorhandene Features (Ist)
- Implementiert im Figma-Export-Prototyp (`design/src/app`):
  - Sidebar-Navigation
  - Dashboard-Header mit Fokusmodus
  - Trigger-Grid (Scene/Audio/Quick Actions) mit lokalem UI-State
  - Automation Panel
  - Statusbar
- Dokumentiert, aber im aktuellen `src/` nicht implementiert:
  - Trigger Engine, Macro System, OBS/Spotify/Clip-Services, Plugin-Lifecycle

### 3) Bestehende UI-Komponenten
- Domänenspezifische Komponenten: `Sidebar`, `DashboardHeader`, `TriggerGrid`, `AutomationPanel`, `StatusBar`
- UI-Toolkit-Bausteine unter `design/src/app/components/ui/*` (Radix/shadcn-orientiert)
- Design-Token-Basis in `design/src/styles/theme.css`

### 4) Vorhandene Services und Core-Module
- Struktur vorhanden unter `src/core`, `src/services`, `src/plugins`, aber ohne Implementierung.
- Konsequenz: Migration ist keine klassische Code-Portierung, sondern strukturierte Re-Implementierung mit Wiederverwendung von Design und Dokumentationswissen.

### 5) Figma-Export-Analyse (`design/`)

#### Farbpalette
- Primäre Flächen: `#0E0E11`, `#121214`, `#18181B` (soft-dark neutral)
- Text: `zinc`-Skala (z. B. `text-zinc-100`, `text-zinc-400`, `text-zinc-500`)
- Akzente/Status: Teal (aktiv), Rose/Red (kritisch), Purple (Plattformindikator)
- Tokenisiert in `theme.css` über `--background`, `--foreground`, `--primary`, `--accent`, `--radius`

#### Typografie
- Sans-Serif-Basis (`font-sans`), UI-Schriften überwiegend 11px-18px
- Klare Hierarchie: `font-medium`/`font-semibold`, kompakte Labels für schnelle Live-Bedienung
- Monospace für Zeit-/Statuswerte (`font-mono`)

#### Layoutstruktur
- Dreispaltige Desktop-Struktur:
  - linke Navigation (`w-[240px]`)
  - zentrale Arbeitsfläche
  - rechte Automationsspalte (`w-[300px]`)
- Header-Höhe `72px`, Karten-/Panel-orientiertes Raster in der Mitte

#### UI-Komponenten, Karten/Panels, Interaktionsmuster
- Große, klickstarke Trigger-Karten mit klaren Active/Hover-States
- Panelartige Gruppen: Scenes, Audio Mixer, Quick Actions
- Statusbar als schwebende, abgerundete Infoeinheit
- Interaktion: Toggle, Fokusmodus, visuelle Zustandsindikatoren, dezente Animationen

#### Designsystem-Befund
- Positiv: tokenbasierte Themes, konsistente Rundungen, Abstände, Zustandssprache
- Risiko: Prototyp enthält Demo-Daten (`design/src/app/data/mock.ts`) und sehr breites UI-Dependency-Set
- Migrationsregel:
  - visuelle Sprache übernehmen
  - keine Demo-Daten in Produktivlogik
  - nur benötigte UI-Bausteine übernehmen, keine unnötigen Frameworks parallel betreiben

## Migrationsstrategie (10 Phasen)

## PHASE 1 - Stabilisierung
- Ziel der Phase:
  - Ist-Zustand einfrieren, kritische Lücken und Risiken dokumentieren, Arbeitsgrundlage absichern.
- Betroffene Ordner:
  - `docs/`, `project-context/`, `agents/`, `design/`, `src/`
- Beteiligte Agents:
  - Architecture Agent, Code Quality Agent
- Risiken:
  - unvollständige Bestandsaufnahme
  - Kontextverlust durch nicht dokumentierte Annahmen
- Erwartetes Ergebnis:
  - Baseline-Report, Migrations-Backlog, gesicherter Snapshot (Tag/Branch + Datei-Backup)

## PHASE 2 - Neue Projektstruktur
- Ziel der Phase:
  - Zielstruktur herstellen ohne Featureänderungen.
- Betroffene Ordner:
  - `src/`
  - Zielstruktur:
    - `src/core/`
    - `src/services/`
    - `src/plugins/`
    - `src/ui/`
    - `src/agents/`
    - `src/utils/`
- Beteiligte Agents:
  - Architecture Agent
- Risiken:
  - vorschnelles Vermischen von UI und Domänenlogik
- Erwartetes Ergebnis:
  - freigegebene Ordner-/Importgrenzen und Architektur-ADR-Startdokument

## PHASE 3 - Figma Design Analyse
- Ziel der Phase:
  - Figma-Export in ein internes, produktionsfähiges Designsystem überführen.
- Betroffene Ordner:
  - `design/src/styles/`, `design/src/app/components/`, `src/ui/styles/`, `docs/`
- Beteiligte Agents:
  - UI Agent, Architecture Agent
- Risiken:
  - Übernahme von Demo-Patterns statt Produktanforderungen
  - Token-Drift zwischen Figma-Export und Ziel-UI
- Erwartetes Ergebnis:
  - Design-Tokens (Farbe, Typo, Radius, Spacing), UI-Pattern-Katalog, Mapping-Liste Figma -> Zielkomponenten

## PHASE 4 - UI Architektur
- Ziel der Phase:
  - UI-Struktur sauber trennen und Figma-Elemente systematisch zuordnen.
- Betroffene Ordner:
  - `src/ui/components/`
  - `src/ui/layout/`
  - `src/ui/pages/`
  - `src/ui/styles/`
- Beteiligte Agents:
  - Architecture Agent, UI Agent
- Risiken:
  - Logik in Komponenten eingebettet
  - Wiederverwendbarkeit sinkt durch zu große Views
- Erwartetes Ergebnis:
  - UI-Schichtenmodell mit Zuordnung:
    - `layout/`: Sidebar, Header, Main Shell
    - `components/`: TriggerCard, StatusChip, ControlButton, PanelCard
    - `pages/`: Dashboard, Plugins, Settings, Editor
    - `styles/`: Tokens, Theme, Utilities

## PHASE 5 - Core Migration
- Ziel der Phase:
  - Kernlogik unabhängig von UI/Framework implementieren.
- Betroffene Ordner:
  - `src/core/`, `src/types/`, `src/utils/`
- Beteiligte Agents:
  - Architecture Agent, Code Quality Agent, Debug Agent
- Risiken:
  - implizite Zustandskopplung
  - unklare Verantwortlichkeit zwischen Trigger/Macro/Controller
- Erwartetes Ergebnis:
  - lauffähige Core-Module:
    - Trigger Engine
    - Macro System
    - zentrale Steuerlogik (App-Control)

## PHASE 6 - Service Migration
- Ziel der Phase:
  - Integrationen als austauschbare Adapter migrieren.
- Betroffene Ordner:
  - `src/services/`, `src/types/`, `src/config/`
- Beteiligte Agents:
  - Service Agent (entspricht Integration Agent), Debug Agent
- Risiken:
  - instabile externe APIs
  - fehlende Retry-/Timeout-/Fehlerpfade
- Erwartetes Ergebnis:
  - Service-Adapter für:
    - OBS Service
    - Spotify Service
    - Clip Service
    - weitere APIs über einheitliche Contracts

## PHASE 7 - UI Implementierung
- Ziel der Phase:
  - Figma-Design produktiv in die neue UI-Architektur überführen.
- Betroffene Ordner:
  - `src/ui/layout/`, `src/ui/components/`, `src/ui/pages/`, `src/ui/styles/`
- Beteiligte Agents:
  - UI Agent, Code Quality Agent
- Risiken:
  - Import unnötiger Demo-Abhängigkeiten
  - harte Verdrahtung von UI direkt an Service-Clients
- Erwartetes Ergebnis:
  - implementierte Layout- und Panel-Komponenten mit sauberer Trennung:
    - UI konsumiert nur App/Core-Facades
    - kein Demo-State aus `mock.ts` in produktiven Flows
    - visuelle Parität mit Figma-Export

## PHASE 8 - Plugin System
- Ziel der Phase:
  - erweiterbare Plugin-Architektur mit klaren Grenzen bereitstellen.
- Betroffene Ordner:
  - `src/plugins/`, `src/core/`, `src/types/`, `src/agents/`
- Beteiligte Agents:
  - Architecture Agent, Service Agent, Code Quality Agent
- Risiken:
  - Plugins greifen direkt in Core-Interna ein
  - fehlende Sicherheits-/Capability-Grenzen
- Erwartetes Ergebnis:
  - Plugin-SDK, Plugin-Registry, Lifecycle-Hooks, isoliertes Beispielplugin

## PHASE 9 - Testing
- Ziel der Phase:
  - Funktionale und nicht-funktionale Qualität absichern.
- Betroffene Ordner:
  - `src/tests/` (plus modulnahe Tests in `src/*`)
- Beteiligte Agents:
  - Code Quality Agent, Debug Agent
- Risiken:
  - geringe Coverage in Kernflüssen
  - instabile Integrationstests mit externen Diensten
- Erwartetes Ergebnis:
  - Testpaket aus:
    - UI-Tests
    - Feature-Tests
    - Performance-Tests
    - Integrationstests

## PHASE 10 - Finalisierung
- Ziel der Phase:
  - Produktionsreife herstellen.
- Betroffene Ordner:
  - gesamtes `src/`, `docs/`, Build-/Release-Konfigurationen
- Beteiligte Agents:
  - Code Quality Agent, Debug Agent, Architecture Agent
- Risiken:
  - unvollständige Doku
  - Release ohne reproduzierbare Build-Checks
- Erwartetes Ergebnis:
  - Code Cleanup, aktualisierte Dokumentation, Deployment-Readiness

## Abhängigkeiten (Abhaengigkeiten) und Reihenfolge
- Feste Reihenfolge: Phase 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10
- Kritische Abhängigkeiten:
  - Phase 3 vor Phase 7 (Designsystem zuerst)
  - Phase 5 und 6 vor finaler UI-Produktivverdrahtung
  - Phase 8 vor Abschluss der Integrationstests

## Agentenregeln während der Migration
- Agents ändern nur ihre freigegebenen Bereiche.
- Architekturentscheidungen werden als ADR dokumentiert.
- Änderungen müssen in Task-/Changelog nachvollziehbar sein.
- Kontextdateien bleiben unverändert (read-only Referenz).
- UI und Business-Logik bleiben strikt getrennt:
  - `src/ui` enthält Darstellung und Interaktion
  - `src/core` enthält Regeln und State-Übergänge
  - `src/services` enthält externe Integrationen

## Validierung des Plans

### 1) Figma-Export korrekt berücksichtigt?
- Ja. Farbpalette, Typografie, Layout, Panelmuster, Interaktionen und Tokenisierung wurden analysiert und in Phase 3/4/7 verankert.

### 2) UI und Logik sauber getrennt?
- Ja. Die Phasen 4-7 erzwingen die Trennung über Ordnergrenzen und Facade-Regel (keine direkte Service-Kopplung in UI).

### 3) Wichtige Features im Plan enthalten?
- Ja. Trigger Engine, Macro System, zentrale Steuerlogik, OBS/Spotify/Clip, Plugin-System und Testpaket sind explizit eingeplant.

### 4) Risiken/Abhängigkeiten vollständig?
- Ja. Jede Phase enthält Risiken; zusätzliche kritische Pfadabhängigkeiten sind separat ausgewiesen.

## Qualitätskriterien für Umsetzung
- Visuelle Übernahme des Figma-Designs ohne unnötige Framework-Übernahme.
- Keine Demo-Daten in Produktionspfaden.
- Wiederverwendung vorhandener Komponenten, wo sinnvoll.
- Pluginfähigkeit bleibt Kernanforderung in Architektur und Delivery.


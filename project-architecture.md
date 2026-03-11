# Neue Projektarchitektur TriggerHub 2.0

## Zielbild

Die modernisierte Architektur trennt strikt:
- UI-Darstellung
- Domain/Core-Logik
- Integrationen/Services
- Erweiterungen (Plugins)
- Agenten-Orchestrierung

## Zielstruktur

```text
src/
  app/
  core/
  services/
  plugins/
  ui/
  agents/
  utils/
  types/
  config/
  tests/
```

## Ordneraufgaben

- `src/app/`
  Anwendungseinstieg, Composition Root, App-Lifecycle, Dependency Wiring.

- `src/core/`
  Fachlogik ohne Framework-Abhängigkeit: Trigger Engine, Macro Engine, Regeln, State-Modelle.

- `src/services/`
  Adapter zu externen Systemen (OBS, Spotify, Clips, Dateisystem, APIs). Nur über definierte Service-Interfaces.

- `src/plugins/`
  Plugin-Lifecycle, Plugin-SDK, Registry, Discovery, Capability-Prüfung, Sandboxing-Regeln.

- `src/ui/`
  Views, Komponenten, Layouts, UI-States und User-Interaktionen. Keine direkte Integrationslogik.

- `src/agents/`
  Orchestrator-Logik, Agent-Contracts, Task-Routing, Ausführungsprotokollierung.

- `src/utils/`
  Kleine generische Hilfsfunktionen (Logging, Guards, Fehlerobjekte, Dateihilfen).

- `src/types/`
  Geteilte Typsysteme, DTOs, Event-Verträge, Plugin-Interfaces.

- `src/config/`
  Laufzeitkonfiguration, Feature Flags, Umgebungsprofile, Validierung.

- `src/tests/`
  Unit-/Integration-/Contract-Teststruktur entlang der Module.

## Modulschnittstellen

Regel: Jede Schicht spricht nur mit ihrer direkten Nachbarschicht.

- UI -> App Facades
- App -> Core + Services + Plugins
- Core -> keine UI/Framework-Abhängigkeit
- Services -> externe APIs/IO
- Plugins -> nur über Plugin-SDK und freigegebene Capabilities

## Architekturprinzipien

- Single Responsibility pro Modul
- Dependency Inversion zwischen Core und Services
- Event-basierte Erweiterungspunkte für Plugins
- Strikte Importgrenzen (Lint-Regeln)
- Dokumentierte ADRs für alle Strukturentscheidungen

## Erhalt und Migration

Zu erhalten:
- bestehende Domänenstruktur (`core/services/plugins/ui`)
- Design-Tokens und UI-Bausteine aus `design/`
- Kontext- und Agentenregeln

Neu aufzubauen:
- `app/`, `config/`, `types/`, `tests/` als produktive Basis
- Plugin-SDK und Registry
- Agenten-Contracts und Orchestrator-Laufmodell

## Agentenfreundliche Entwicklung

- Jeder Agent arbeitet nur in zugewiesenen Ordnern.
- Änderungen erfolgen über klar definierte Contracts statt Querverweisen.
- Architekturentscheidungen werden vor Implementierung im ADR-Log festgehalten.
- Kontextdateien sind read-only Referenz und werden nicht überschrieben.

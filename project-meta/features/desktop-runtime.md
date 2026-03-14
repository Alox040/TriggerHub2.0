# Desktop Runtime

## Zweck des Moduls
Die Desktop-Runtime ist der Composition Root der App. Sie verdrahtet Kernsysteme, Services, Plugins und die UI-nahe Facade zu einem start- und stoppbaren Laufzeitcontainer.

## Relevante Codebereiche / Ordner
- `src/app/bootstrap.ts`
- `src/app/facade.ts`
- `src/app/runtimeConfig.ts`
- `src/core/`
- `src/services/`
- `src/plugins/`
- `src/storage/`
- `src/tests/app-container.test.ts`
- `src/tests/app-facade.test.ts`

## Aktueller Umsetzungsstand
- `createAppModuleContainer()` erstellt Event-Bus, Trigger-Engine, MacroEngine, Service-Adapter, AppController, Plugin-Registry und App-Facade.
- Beim Start werden vorhandene Trigger- und Makrodaten geladen oder Standarddaten fuer ein OBS-Szenenwechsel-Makro und den dazugehoerigen Trigger gesaet.
- Der Startpfad bootstrappt nur Kernzustand, Persistenz und Runtime-Konfiguration; aktive Service-Seiteneffekte laufen erst ueber explizite Runtime-Kommandos.
- Die Runtime-Aktivierung erfolgt separat ueber `appFacade.activateRuntime()`, die Deaktivierung ueber `appFacade.deactivateRuntime()`.
- Der Stop-Pfad persistiert Trigger und Makros bei vorhandenem Storage, deaktiviert die Runtime bei Bedarf und zerlegt danach die Trigger-Subscriptions.
- `TriggerHubAppFacade` stellt Dashboard-Lesemodelle sowie Create/Delete/Execute-Operationen fuer Trigger und Makros sowie Runtime-Use-Cases fuer Editor, Plugins und Settings bereit.

## Verifizierte Staerken
- Die Runtime verdrahtet die Kernmodule zentral und nachvollziehbar in einem Container statt verteilt ueber UI-Code.
- Seed-Daten fuer Makro und Trigger sind vorhanden und ueber `app-container.test.ts` verifiziert.
- Die App-Facade kapselt Trigger-, Makro- und Runtime-Operationen fuer die UI.
- Persistenz ist optional; ohne Storage kann die Runtime trotzdem starten und faellt auf Seed-Daten zurueck.
- Persistierte Trigger- und Makrodaten sind versioniert und koennen Legacy-Arrays beim Laden migrieren.

## Verifizierte Luecken
- `deleteMacro()` in der Facade greift weiterhin ueber einen Cast direkt auf die interne `macroMap` der Engine zu.
- `activateRuntime()` startet weiterhin mehrere Services gesammelt; eine feinere servicebezogene Aktivierungsstrategie ist im aktuellen Code nicht modelliert.
- Desktop-Packaging und reale Windows-Release-Verifikation sind weiterhin getrennt vom reinen Repo-Typecheck zu betrachten.

## Naechste sinnvolle Entwicklungsschritte
- Feinere Runtime-Commands fuer einzelne Services modellieren, falls die UI differenzierte Aktivierung braucht.
- Interne Facade-Abhaengigkeit von `macroMap` durch eine offizielle Engine-API ersetzen.
- Release-Artefakte auf Windows gesondert verifizieren.

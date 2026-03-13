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
- Der Startpfad verbindet OBS, startet Spotify-Wiedergabe, startet Clip-Capture und aktiviert Plugins.
- Der Stop-Pfad persistiert Trigger und Makros bei vorhandenem Storage, deinitialisiert Trigger-Subscriptions, deaktiviert Plugins und stoppt bzw. pausiert Services.
- `TriggerHubAppFacade` stellt Dashboard-Lesemodelle sowie Create/Delete/Execute-Operationen fuer Trigger und Makros bereit.

## Verifizierte Staerken
- Die Runtime verdrahtet die Kernmodule zentral und nachvollziehbar in einem Container statt verteilt ueber UI-Code.
- Seed-Daten fuer Makro und Trigger sind vorhanden und ueber `app-container.test.ts` verifiziert.
- Die App-Facade validiert ihr Dashboard-Read-Model und kapselt Trigger-/Makro-Operationen fuer die UI.
- Persistenz ist optional; ohne Storage kann die Runtime trotzdem starten und faellt auf Seed-Daten zurueck.
- Ungueltige gespeicherte Trigger- und Makropayloads werden defensiv uebersprungen und nur geloggt.

## Verifizierte Luecken
- Laut `agents/project-context/known-issues.md` ist die IPC-Bruecke zwischen Electron Main und Renderer fuer Storage noch nicht vollstaendig verifiziert.
- Der Startpfad startet OBS, Spotify und Clip-Service fest mit; eine differenziertere servicebezogene Startstrategie ist in den geprueften Quellen nicht belegt.
- `deleteMacro()` in der Facade greift ueber einen Cast direkt auf die interne `macroMap` der Engine zu.
- Der Root-Build ist aktuell durch den Clip-Export-Boundary-Fehler blockiert; damit ist die Runtime zwar implementiert, aber nicht releasebereit.

## Naechste sinnvolle Entwicklungsschritte
- Storage-Pfad zwischen Renderer und Electron Main Ende-zu-Ende verifizieren.
- Den Clip-Export-Build-Blocker beheben, damit die Runtime wieder releasefaehig gebaut werden kann.
- Interne Facade-Abhaengigkeit von `macroMap` durch eine offizielle Engine-API ersetzen.

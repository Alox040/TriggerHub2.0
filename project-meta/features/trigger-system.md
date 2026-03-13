# Trigger System

## Zweck des Moduls
Das Trigger-System verbindet eingehende Events mit konfigurierten Aktionen. Es indexiert Trigger nach Event-Topic, prueft Bedingungen und dispatcht anschliessend die konfigurierten Aktionen.

## Relevante Codebereiche / Ordner
- `src/core/trigger-engine/triggerEngine.ts`
- `src/core/trigger-engine/triggerGraph.ts`
- `src/core/trigger-engine/triggerConditions.ts`
- `src/core/trigger-engine/triggerTypes.ts`
- `src/tests/core-trigger.test.ts`
- `src/tests/trigger-graph.test.ts`
- `src/tests/trigger-executor.test.ts`

## Aktueller Umsetzungsstand
- Das Modul ist in der Desktop-Runtime implementiert.
- `TriggerGraph` speichert Trigger pro Event und fuehrt zusaetzlich einen Trigger-ID-Index.
- `TriggerEngine` registriert pro Event-Topic hoechstens eine Event-Bus-Subscription und fuehrt bei passenden Events die Trigger-Aktionen aus.
- Direkte Trigger-Ausfuehrung per Trigger-ID ist ebenfalls vorhanden.
- Nach erfolgreicher eventgetriebener oder manueller Ausfuehrung wird `TRIGGER_EXECUTED` publiziert.

## Verifizierte Staerken
- Validierung fuer leere IDs, Namen und Event-Namen ist in Engine und Graph vorhanden und getestet.
- Mehrere Trigger koennen auf dasselbe Event zeigen, ohne dass doppelte Event-Bus-Subscriptions angelegt werden.
- Bedingungspruefung ist vorhanden; Trigger ohne Bedingungen feuern direkt, Trigger mit fehlschlagenden Bedingungen werden uebersprungen.
- Deaktivierte Trigger werden bei Event-Verarbeitung und manueller Ausfuehrung nicht ausgefuehrt.
- Fehler einzelner Aktionen brechen nicht den gesamten Triggerlauf ab; spaetere Aktionen desselben Triggers und weitere Trigger desselben Events laufen weiter.
- Das Entfernen des letzten Triggers eines Events raeumt die zugehoerige Subscription wieder auf.
- Laufzeitmetriken fuer Dispatch-Dauer werden aufgezeichnet.

## Verifizierte Luecken
- Die Datei beschreibt keine belegte persistente Speicherung des Trigger-Graphs innerhalb des Moduls selbst; Persistenz wird ausserhalb ueber die App-Facade und Storage-Schicht angesteuert.
- Es ist keine Priorisierung, Entprellung oder parallele Trigger-Ausfuehrungsstrategie im Modul belegt.
- Die Dokumentation der unterstuetzten Bedingungsoperatoren lebt aktuell im Code, nicht in einer eigenen Metadatenquelle.

## Naechste sinnvolle Entwicklungsschritte
- Unterstuetzte Trigger-Bedingungen und Action-Typen in `project-meta/` explizit nachziehen.
- Persistenz- und UI-Pfade fuer Triggerverwaltung separat referenzieren, damit die Modulbeschreibung nicht auf `bootstrap.ts` ausweichen muss.
- Erst bei belegter Implementierung weitere Laufzeitregeln wie Priorisierung oder Scheduling dokumentieren.

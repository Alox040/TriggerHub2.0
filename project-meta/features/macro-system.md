# Macro System

## Zweck des Moduls
Das Makro-System registriert Makrodefinitionen, validiert ihre Schrittstruktur und fuehrt Makros ueber einen injizierten Step-Handler aus.

## Relevante Codebereiche / Ordner
- `src/core/macro-system/macroEngine.ts`
- `src/core/macro-system/macroRunner.ts`
- `src/core/macro-system/macroTypes.ts`
- `src/tests/core-macro.test.ts`
- `src/app/bootstrap.ts`

## Aktueller Umsetzungsstand
- Das Modul ist implementiert und Teil der Desktop-Runtime.
- `MacroEngine` verwaltet Makros in einer internen Map und versieht sie bei Registrierung mit `createdAt`.
- `macroRunner.ts` fuehrt Makros schrittweise aus, unterstuetzt Variablen-Merging, optionale Fehlerfortsetzung und Rekursion mit Tiefenlimit.
- In `src/app/bootstrap.ts` ist ein Step-Handler verdrahtet, der die Schritt-Typen `delay`, `service_call`, `plugin_action`, `macro_call`, `conditional`, `parallel` und `sequence` ausfuehrt.
- Nach erfolgreichem Lauf eines aktivierten Makros publiziert die Engine `MACRO_COMPLETED`.

## Verifizierte Staerken
- Leere Makro-IDs, leere Namen und unvollstaendige Schrittdefinitionen werden validiert und abgewehrt.
- Doppelte Makro-IDs werden verhindert.
- Deaktivierte Makros werden nicht ausgefuehrt und liefern ein `skipped`-Ergebnis.
- Rekursive Makroaufrufe sind ueber `maxDepth` begrenzt.
- `stopOnError` ist im Runner vorgesehen; bei deaktivierter Fehlerstopp-Option koennen spaetere Schritte weiterlaufen.
- Laufzeitmetriken fuer Makro-Ausfuehrungsdauer werden bei Erfolg und Fehler aufgezeichnet.
- Die Kernpfade sind per Test fuer Registrierung, Validierung, Eindeutigkeit und Ausfuehrung abgedeckt.

## Verifizierte Luecken
- Makros werden in der Engine selbst nur in-memory gehalten.
- Ein oeffentliches Delete-API existiert im Kernmodul nicht; Loeschung erfolgt aktuell indirekt ueber die App-Facade per Zugriff auf die interne Makro-Map.
- Die offiziell belegten Schritt-Typen ergeben sich aus `bootstrap.ts`; das Kernmodul allein kennt nur die strukturelle Validierung und den injizierten Handler.

## Naechste sinnvolle Entwicklungsschritte
- Makro-Loeschung ohne internen Map-Zugriff als explizite Engine-API nachziehen.
- Dokumentation der aktuell verdrahteten Schritt-Typen und ihrer Payload-Annahmen gemeinsam mit der Runtime pflegen.
- Persistenz- und Editor-Pfade erst dann genauer dokumentieren, wenn sie als stabile Modulgrenzen vorliegen.

# Plugin System

## Zweck des Moduls
Das Plugin-System verwaltet den Lifecycle registrierter Plugins und bindet sie kontrolliert in die Desktop-Runtime ein.

## Relevante Codebereiche / Ordner
- `src/plugins/pluginRegistry.ts`
- `src/plugins/example-plugin/plugin.ts`
- `src/plugins/example-plugin/pluginActions.ts`
- `src/app/bootstrap.ts`

## Aktueller Umsetzungsstand
- Das Plugin-System ist implementiert.
- `PluginRegistry` kann Plugins registrieren, deregistrieren, auflisten, gesammelt aktivieren und gesammelt deaktivieren.
- Die Desktop-Runtime erstellt in `bootstrap.ts` eine Plugin-Registry und aktiviert bzw. deaktiviert sie beim Starten und Stoppen des Containers.
- Ein `ExamplePlugin` dient als Referenz fuer das erwartete `PluginModule`-Verhalten mit `id`, `name`, idempotenter Aktivierung und `deactivate()`.

## Verifizierte Staerken
- Doppelte Plugin-IDs werden bei der Registrierung verhindert.
- Aktivierungs- und Deaktivierungsfehler einzelner Plugins werden isoliert behandelt und nur geloggt; der Gesamtlauf wird nicht abgebrochen.
- Die Registry bietet einen klaren Lifecycle mit `register`, `unregister`, `list`, `activateAll` und `deactivateAll`.
- Das Example-Plugin zeigt, dass Plugins ueber `PluginContext` Runtime-Zugriff erhalten und bei wiederholter Aktivierung keinen Doppellauf starten.

## Verifizierte Luecken
- In den geprueften Quellen gibt es nur ein Example-Plugin als belegte Referenzimplementierung.
- Es ist kein Mechanismus fuer Discovery, Laden externer Plugin-Pakete oder Versionierung belegt.
- Eigenstaendige Tests fuer die Plugin-Registry oder fuer Plugin-Fehlerpfade sind in den geprueften Testdateien nicht vorhanden.

## Naechste sinnvolle Entwicklungsschritte
- Registry- und Lifecycle-Tests direkt fuer das Plugin-System ergaenzen.
- Plugin-Konventionen fuer Action-Registrierung, Konfiguration und Fehlerverhalten explizit dokumentieren.
- Weitere Plugin-Typen erst dann als Faehigkeit erfassen, wenn sie im Runtime-Code und Testbestand vorhanden sind.

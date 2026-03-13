# OBS Integration

## Integrationsziel
OBS soll als Desktop-Service fuer die Runtime ansprechbar sein, damit Trigger und Makros OBS-bezogene Aktionen ausloesen koennen.

## Bestehende Codeartefakte
- `src/services/obs-service/index.ts`
- `src/services/obs-service/obsClient.ts`
- `src/services/obs-service/obsActions.ts`
- `src/services/obs-service/contracts.ts`
- `src/app/bootstrap.ts`
- `src/tests/services.test.ts`

## Aktueller Realisierungsgrad
- Implementiert.
- Die Integration ist im Runtime-Code vorhanden, in `bootstrap.ts` verdrahtet und durch Servicetests abgedeckt.
- Der aktuell belegte Funktionsumfang beschraenkt sich auf Verbindungsaufbau, Verbindungsabbau und Szenenwechsel.

## Vorhandene Services / Adapter / Schnittstellen
- `createObsService()` als Einstieg fuer Memory- oder HTTP-Transport
- `ObsService` mit `connect()`, `disconnect()` und `switchScene(sceneName)`
- `InMemoryObsTransport` fuer lokale Laufzeit-/Testnutzung
- `ObsHttpTransport` mit POST-Endpunkten `/connect`, `/disconnect` und `/scene`
- Trigger-/Makro-Anbindung ueber die registrierte Action `obs.switchScene` in `src/app/bootstrap.ts`

## Bekannte Luecken
- Die HTTP-Variante benoetigt zwingend `http.baseUrl`.
- Weitere OBS-Aktionen ausser `switchScene` sind in den geprueften Quellen nicht belegt.
- Es gibt keine belegte direkte OBS-WebSocket-Implementierung; vorhanden ist nur das abstrahierte Memory-/HTTP-Modell.

## Risiken
- Der tatsaechliche Integrationsumfang ist klein; Marketing oder Doku duerfen OBS nicht als breit integrierte Steuerflaeche darstellen.
- HTTP-Fehler und ungueltige Payloads sind zwar im Servicepfad behandelt, aber die Verfuegbarkeit eines externen OBS-Backends ist ausserhalb des Repositories nicht abgesichert.
- Ohne vorheriges `connect()` schlaegt `switchScene()` fehl; Runtime-Aufrufer muessen diese Reihenfolge einhalten.

## Naechste Schritte
- Falls benoetigt, weitere OBS-Aktionen nur mit eigener Service-API, Testabdeckung und Runtime-Verdrahtung ergaenzen.
- Dokumentieren, welches externe Backend fuer den HTTP-Transport erwartet wird.
- Konfigurations- und Fehlerfaelle fuer produktive OBS-Nutzung getrennt von der In-Memory-Testvariante festhalten.

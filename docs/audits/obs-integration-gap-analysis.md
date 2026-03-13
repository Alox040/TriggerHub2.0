# OBS Integration Gap Analysis

Stand: 2026-03-13

## Kurzfazit

Die bestehende OBS-Schicht ist eine kleine, testbare Service-Abstraktion fuer:

- `connect()`
- `disconnect()`
- `switchScene(sceneName)`

Sie ist derzeit als lokale In-Memory-Implementierung und als generischer HTTP-Transport modelliert. Eine belastbare erste OBS-Kernintegration im Sinne einer echten Produktintegration fehlt aber noch deutlich: Es gibt keine nachgewiesene OBS-WebSocket-Anbindung, keine Authentifizierung, keine Event-Synchronisation, keine Szenenabfrage und keine Runtime-Konfiguration fuer reale OBS-Ziele.

## Vorhanden

### Service-API

- `src/services/obs-service/obsActions.ts`
  - `ObsService` implementiert `connect`, `disconnect` und `switchScene`
  - Aufrufe laufen durch die gemeinsame Reliability-Policy
- `src/types/ports.ts`
  - `ObsServicePort` bildet genau diese drei Methoden ab

### Adapter / Transports

- `src/services/obs-service/obsClient.ts`
  - `InMemoryObsTransport`
  - `ObsHttpTransport`
- `src/services/obs-service/index.ts`
  - Factory `createObsService(...)` mit `transport: 'memory' | 'http'`
  - HTTP-Transport verlangt `http.baseUrl`

### Vertrage und Basistypen

- `src/services/obs-service/contracts.ts`
  - `ObsApiResponse`
  - `ObsSetSceneRequest`
  - Response-Guard `isObsApiResponse(...)`

### Runtime-Anbindung

- `src/app/bootstrap.ts`
  - erzeugt `obsService` ueber `createObsService()`
  - registriert Trigger-/Makro-Action `obs.switchScene`
  - verbindet beim Start `obsService.connect()`
  - pflegt `serviceState.obs` fuer den Dashboard-Read-Path

### UI-Nutzung

- `src/App.tsx`
  - Dashboard liest nur `connectedServices.obs`
- `src/ui/components/StatusBar.tsx`
  - visualisiert lediglich `OBS connected` / `OBS not connected`

### Tests

- `src/tests/services.test.ts`
  - Connect-/Switch-Flow
  - Retry-/Timeout-Verhalten
  - HTTP-Fehler und Response-Validierung

## Angedeutet

- Event-Themen fuer OBS existieren in `src/types/domain.ts`:
  - `OBS_CONNECTED`
  - `OBS_DISCONNECTED`
  - `OBS_SCENE_CHANGED`
- Trigger und Event-Bus koennen OBS-bezogene Events verarbeiten.
- Das Repository modelliert also bereits einen Event-Raum fuer eine spaetere echte OBS-Integration.

## Geplant / naechster realistischer Schritt

Der naechste belastbare Implementierungsschritt ist nicht "mehr Mock", sondern eine erste echte Adapter-Grenze fuer reales OBS-Verhalten:

1. konfigurierbare reale OBS-Verbindung fuer die Desktop-Runtime
2. klarer Transportvertrag fuer Auth-/Session-Aufbau
3. echte Zustands- und Event-Rueckmeldung an die Runtime

Praktisch bedeutet das als naechsten kleinen, aber echten Produkt-Schritt:

- statt generischem HTTP-Placeholder einen expliziten produktiven OBS-Adapter definieren
- Runtime-Konfiguration fuer Endpoint / Credentials / Verbindungsmodus einfuehren
- Verbindungserfolg und Verbindungsverlust in die Runtime als Event oder Status-Update rueckspiegeln

## Nicht implementiert

- keine nachgewiesene OBS-WebSocket-Integration
- keine OBS-Authentifizierung
- keine Szenenliste / Source-Liste / Profilabfrage
- keine Subscription auf echte OBS-Ereignisse
- keine Synchronisation von OBS-Zustand in die UI
- keine separate Fehlerklassifikation fuer Netzwerk-, Auth- und Protokollfehler spezifisch fuer OBS
- keine runtime-seitige Auswahl oder Konfiguration eines realen OBS-Ziels in `src/app/runtimeConfig.ts`

## Realistische Restluecken

### 1. Transport ist noch kein echter OBS-Produktadapter

- `ObsHttpTransport` spricht nur drei generische Endpunkte an:
  - `/connect`
  - `/disconnect`
  - `/scene`
- Im Repository ist kein dazugehoeriger OBS-Server oder offizielles OBS-Protokoll belegt.
- Der HTTP-Transport ist deshalb eher Adapter-Skelett als reale Integration.

### 2. Runtime kennt OBS nur als booleschen Service-Status

- `bootstrap.ts` setzt `serviceState.obs` beim Start und Stop manuell.
- Die UI sieht nur dieses Boolean-Flag.
- Es gibt keinen realen OBS-Zustandsfluss fuer:
  - aktuelle Szene
  - Verbindungsfehler
  - Reconnect
  - externe Szenenwechsel

### 3. OBS-Events sind modelliert, werden aber vom Service nicht emittiert

- `EventTopics.OBS_CONNECTED`, `OBS_DISCONNECTED` und `OBS_SCENE_CHANGED` existieren.
- Der aktuelle OBS-Service publiziert diese Events aber nicht selbst.
- Damit fehlt die Bruecke zwischen Service-Lebenszyklus und Trigger-/UI-Ebene.

### 4. Keine produktive Konfigurationskante

- `createObsService({ transport: 'http', http: { baseUrl } })` existiert.
- Die Desktop-Runtime verwendet aktuell aber `createObsService()` ohne reale Zielkonfiguration.
- Damit bleibt der Laufzeitpfad effektiv beim In-Memory-Transport.

## Direkt umgesetzte kleine Verbesserungen

- `src/services/obs-service/contracts.ts`
  - `ObsSceneValidationError` und `normalizeObsSceneName(...)` ergänzt
- `src/services/obs-service/obsActions.ts`
  - `switchScene(...)` validiert und normalisiert Szenennamen jetzt explizit
- `src/services/obs-service/obsClient.ts`
  - Transportebene verteidigt dieselbe Szenennamen-Grenze ebenfalls

## Warum diese kleine Aenderung sinnvoll ist

- Leere oder reine Whitespace-Szenennamen waren bisher moeglich und haetten als scheinbar erfolgreiche Operation durchlaufen koennen.
- Das ist eine echte Luecke in der vorhandenen Kernfunktion `switchScene(...)`.
- Die Härtung ist repo-basiert, klein und verbessert den vorhandenen Service ohne eine Schein-Integration zu behaupten.

## Ergaenzte Tests

- OBS lehnt leere Szenennamen explizit ab
- OBS-HTTP-Transport verlangt weiterhin `http.baseUrl`
- OBS-HTTP-Transport trimmt Szenennamen vor dem Request

## Empfehlung fuer den naechsten echten Umsetzungsschritt

Der naechste realistische Schritt mit gutem Nutzen-Risiko-Verhaeltnis ist:

- einen produktiven OBS-Transport als klar getrennten Adapterpfad einzufuehren
- die benoetigte Runtime-Konfiguration in `src/app/` explizit zu modellieren
- Verbindungsstatus und mindestens `OBS_CONNECTED` / `OBS_DISCONNECTED` sauber in die Runtime zurueckzuspiegeln

Nicht sinnvoll waere aktuell:

- UI fuer Szenen-/Source-Management ohne reale Datenquelle
- simulierte OBS-Event-Streams ohne echten Adaptervertrag
- weitere Marketing-/Metadaten-Aussagen, die ueber den Codebestand hinausgehen

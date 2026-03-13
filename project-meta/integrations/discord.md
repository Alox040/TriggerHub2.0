# Discord Integration

## Integrationsziel
Discord waere eine externe Plattformintegration fuer die Runtime, ist im aktuellen Repository aber nur als nicht implementierter Statusfall dokumentiert.

## Bestehende Codeartefakte
- `project-meta/integrations/discord.json`
- Erwaehnungen in Projektkontext und generierten Website-Inhalten, aber keine Runtime-Dateien unter `src/services/` oder `src/plugins/`

## Aktueller Realisierungsgrad
- Nicht implementiert.
- Es gibt im geprueften Repository keinen Discord-Service, keinen Discord-Adapter, kein Discord-Plugin und keine belegte API-Anbindung.

## Vorhandene Services / Adapter / Schnittstellen
- Keine im Runtime-Code belegten Services, Adapter oder Schnittstellen.

## Bekannte Luecken
- Kein Service unter `src/services/` fuer Discord
- Kein Plugin unter `src/plugins/` fuer Discord
- Keine Tests unter `src/tests/` fuer Discord-Integration
- Keine Runtime-Verdrahtung in `src/app/bootstrap.ts`

## Risiken
- Website- oder Content-Erwaehnungen koennen einen groesseren Integrationsstand suggerieren, als im Code existiert.
- Ohne Runtime-Artefakte gibt es keine belastbare Aussage zu API-Modell, Authentifizierung oder Betriebsverhalten.
- Dokumentationsdrift ist hier besonders riskant, weil bereits Metadaten und generierte Inhalte existieren koennen, ohne dass eine echte Integration vorliegt.

## Naechste Schritte
- Discord weiter klar als nicht implementiert markieren, bis echte Runtime-Artefakte vorliegen.
- Bei Umsetzung zuerst Servicegrenze, Auth-/API-Modell und Tests definieren.
- Marketing- und Website-Erwaehnungen erst nach realer Implementierung aufwerten.

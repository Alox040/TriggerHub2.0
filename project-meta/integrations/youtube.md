# YouTube Integration

## Integrationsziel
YouTube waere eine externe Plattformintegration fuer Creator-Workflows, ist im aktuellen Repository aber nur indirekt ueber Website- und Marketing-Erwaehnungen sichtbar.

## Bestehende Codeartefakte
- Erwaehnungen in `website/src/components/IntegrationLibrary.tsx`
- Erwaehnungen in `website/src/components/Features.tsx`
- Erwaehnungen in weiteren Website-/Content-Dateien
- Keine belegte Runtime-Datei unter `src/services/`, `src/plugins/` oder `src/tests/`

## Aktueller Realisierungsgrad
- Nicht implementiert im Runtime-Code.
- Anders als bei Discord und Twitch gibt es nicht einmal eine bestehende JSON-Integrationsmetadatei fuer eine Runtime-Implementierung; sichtbar sind nur Content-Erwaehnungen.

## Vorhandene Services / Adapter / Schnittstellen
- Keine im Runtime-Code belegten Services, Adapter oder Schnittstellen.

## Bekannte Luecken
- Kein YouTube-Service unter `src/services/`
- Kein YouTube-Plugin unter `src/plugins/`
- Keine Tests fuer YouTube-Integration
- Keine Runtime-Verdrahtung im Desktop-Container
- Keine belastbare technische Metadatei, nur Content-Erwaehnungen

## Risiken
- YouTube erscheint bereits in Website-Komponenten und kann dadurch als vorhandene Produktfaehigkeit gelesen werden.
- Ohne Runtime-Code gibt es keine belastbare Aussage zu Upload-, Auth-, API- oder Event-Faehigkeiten.
- Die Diskrepanz zwischen Marketing-Nennung und fehlender Implementierung ist ein Dokumentations- und Erwartungsrisiko.

## Naechste Schritte
- Zunaechst klarstellen, ob YouTube ueberhaupt als Runtime-Integration oder nur als Content-/Roadmap-Thema gefuehrt werden soll.
- Wenn Runtime-Integration gewuenscht ist, zuerst eine technische Metadatei und eine klare Servicegrenze anlegen.
- Content-Erwaehnungen erst nach realer Implementierung als Produktfaehigkeit formulieren.

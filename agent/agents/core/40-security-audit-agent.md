Sicherheitsprüfungsbereiche
1. Architektur- und Angriffsflächenanalyse

Prüfe:

Welche Komponenten existieren?

Welche Datenflüsse bestehen zwischen App, Website, APIs, lokalen Dateien und externen Diensten?

Wo sind Angriffsflächen vorhanden?

Wo werden Nutzereingaben, Dateien, URLs, Tokens oder externe Daten verarbeitet?

Liefere:

kurze Auflistung der kritischen Angriffsflächen

Einschätzung pro Angriffsfläche: niedrig / mittel / hoch / kritisch

2. Secrets und Konfiguration

Prüfe:

hartcodierte API-Keys, Tokens, Passwörter, Webhooks, Secrets

unsichere .env-Nutzung

versehentlich committete Zugangsdaten

unsichere Default-Werte

öffentliche Exposition sensibler Konfigurationswerte im Frontend

Liefere:

Fundstelle

Risiko

konkrete Hardening-Empfehlung

3. Authentifizierung und Autorisierung

Prüfe:

fehlende Zugriffskontrollen

unklare Rollenlogik

ungeschützte Admin-Funktionen

fehlende Session-/Token-Absicherung

fehlende Trennung zwischen öffentlicher und interner Funktionalität

Liefere:

welche Bereiche aktuell unzureichend abgesichert sind

Vorschläge für Rollen, Berechtigungen und Schutzmechanismen

4. Input-Validierung und Injection-Risiken

Prüfe:

fehlende Validierung von Formularen, Query-Parametern, IPC-Nachrichten, JSON-Payloads und Dateiinhalten

XSS-Risiken

Command Injection

Path Traversal

unsichere dynamische Ausführung

unsichere Markdown-/HTML-/Template-Verarbeitung

Liefere:

konkretes Risiko

betroffene Stelle

Beispiel für sichere Gegenmaßnahme

5. Electron-/Desktop-Sicherheit

Prüfe besonders bei Desktop-/Electron-Projekten:

nodeIntegration

contextIsolation

enableRemoteModule

unsichere IPC-Handler

ungefilterte shell.openExternal-Aufrufe

unsichere Dateizugriffe

fehlende Trennung von Main/Renderer-Verantwortlichkeiten

automatische Update-Pfade und Signatur-/Quellenvertrauen

Liefere:

klare Hardening-Maßnahmen

empfohlene sichere Defaults

6. Website- und Frontend-Sicherheit

Prüfe:

exponierte interne Informationen

unsichere Client-Logik

CSP-/Header-Probleme

fehlende Sicherheitsheader

unnötig sichtbare interne Routen, IDs oder Debug-Daten

offene Formulare ohne Rate-Limit-/Spam-Schutz

Liefere:

Priorisierung der Webrisiken

konkrete Verbesserungsvorschläge für Hosting und Frontend

7. Abhängigkeiten und Supply Chain

Prüfe:

bekannte Risikoquellen durch Dependencies

veraltete oder unnötige Pakete

Pakete mit hohem Sicherheitsrisiko

ungeprüfte Postinstall-/Build-Skripte

unnötig breite Berechtigungen in Tooling oder CI/CD

Liefere:

Liste kritischer Abhängigkeiten oder Risikoklassen

Vorschläge zum Entfernen, Ersetzen oder Isolieren

8. Deployment, CI/CD und Infrastruktur

Prüfe:

unsichere GitHub-Actions-Konfigurationen

zu weit gefasste Tokens/Berechtigungen

unsichere Deploy-Pipelines

fehlende Umgebungs-Trennung

unsichere Preview-/Production-Konfigurationen

versehentliche Offenlegung durch Logs oder Build-Artefakte

Liefere:

konkrete Härtungsmaßnahmen für GitHub, Vercel und Release-Prozesse

9. Datenschutz und Datenminimierung

Prüfe:

unnötige Speicherung sensibler Daten

zu ausführliche Logs

fehlende Lösch-/Reduktionsstrategie

unnötige Telemetrie oder Debug-Ausgaben

Liefere:

Vorschläge zur Datenminimierung

Logging-Empfehlungen

10. Priorisierte Umsetzungsplanung

Erstelle am Ende:

Sofortmaßnahmen

Wichtige Maßnahmen vor Beta/Release

Empfohlene mittel- und langfristige Hardening-Maßnahmen

Arbeitsweise

Arbeite immer nach diesem Muster:

Projektstruktur und sicherheitsrelevante Dateien identifizieren

Angriffsflächen und Vertrauensgrenzen bestimmen

Risiken nach Schweregrad bewerten

Nur reale oder plausible Risiken nennen, keine leeren Standardfloskeln

Für jedes Problem konkrete Verbesserungsvorschläge liefern

Ergebnisse als Datei exportierbar strukturieren

Unsicherheiten offen benennen statt Annahmen als Fakten darzustellen

Ausgabeformat

Die Ausgabe soll immer als strukturierter Bericht formuliert werden.

Verwende dieses Format:

Security Review Report
1. Executive Summary

kurzer Überblick über den Sicherheitszustand

größte Risiken

wichtigste Sofortmaßnahmen

2. Scope

welche Teile des Projekts geprüft wurden

welche Teile nicht geprüft werden konnten

3. Findings

Für jeden Fund:

ID: SEC-001, SEC-002, ...

Titel

Bereich

Schweregrad: niedrig / mittel / hoch / kritisch

Beschreibung

Betroffene Dateien / Komponenten

Risiko / mögliches Schadensszenario

Empfehlung

Umsetzungsaufwand: klein / mittel / hoch

4. Quick Wins

direkt umsetzbare Maßnahmen mit hoher Wirkung

5. Rebuild Input

konkrete Punkte, die in den Rebuild übernommen werden sollen

bevorzugt als klare technische Anforderungen formuliert

6. Offene Fragen / Unsicherheiten

Punkte, die vor finaler Bewertung noch geprüft werden sollten

Exportdatei

Wenn möglich, exportiere den Bericht als Datei mit einem dieser Namen:

security-review-report.md

security-review-report.txt

security-hardening-plan.md

Wenn zusätzlich sinnvoll, erstelle eine zweite Datei:

security-rebuild-input.md

Diese zweite Datei enthält nur die umsetzbaren Anforderungen für den Rebuild, ohne lange Erklärungen.

Regeln

Keine Beschönigung.

Keine generischen Aussagen ohne Bezug zum Projekt.

Keine Panikmache.

Sicherheitslücken priorisieren nach realem Risiko.

Verbesserungsvorschläge müssen konkret und technisch umsetzbar sein.

Bei fehlendem Kontext klar sagen, was nur Vermutung ist.

Fokus auf reale Hardening-Maßnahmen statt theoretischer Vollständigkei
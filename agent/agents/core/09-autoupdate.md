Aktiviere den Auto-Update-Agenten für dieses Projekt.

Ziel:
Die Anwendung soll ein automatisches Update-System erhalten, sodass Endnutzer das Programm bzw. die EXE nicht mehr manuell aktualisieren müssen. Updates sollen erkannt, heruntergeladen und installiert werden, sofern der verwendete Tech-Stack dies unterstützt.

Arbeitsmodus:

1. Projektanalyse
Scanne zuerst den gesamten Projektordner und ermittle:
- verwendete Technologien (Electron, Tauri, .NET, Node, Web-App etc.)
- vorhandene Build-Tools
- vorhandene Release-Konfiguration
- Installer- oder Packaging-Systeme
- vorhandene Versionslogik
- mögliche Update-Mechanismen

Untersuche insbesondere:
- package.json
- build-Konfigurationen
- CI/CD Workflows
- Installer- oder Release-Skripte
- Konfigurationsdateien für Distribution oder Publishing

2. Bestandsaufnahme
Erstelle eine kurze Analyse:
- Welche Plattformen werden unterstützt
- Wie Releases aktuell erstellt werden
- Ob bereits eine Update-Struktur existiert
- Welche Komponenten fehlen, um Auto-Updates zu ermöglichen

3. Strategie festlegen
Bestimme die technisch sinnvollste Update-Strategie für dieses Projekt.

Bevorzuge Standardlösungen des verwendeten Frameworks, z.B.:

Electron → electron-updater  
Tauri → Tauri Updater  
.NET Desktop → NetSparkle / ClickOnce / MSIX  
Web-App → Version Check + Cache Refresh

Begründe kurz, warum diese Strategie gewählt wird.

4. Implementierung
Wenn möglich, implementiere die Auto-Update-Struktur direkt.

Das kann beinhalten:
- Integration eines Update-Frameworks
- Versionsprüfung beim App-Start
- Download-Mechanismus für Updates
- Installationslogik
- Benutzerhinweise im UI
- Anpassung der Build-Konfiguration
- Vorbereitung von Release-Pipelines

Ändere nur Dateien, die tatsächlich notwendig sind.

5. Release-Integration
Falls erforderlich:
- passe Build- oder Release-Skripte an
- definiere Update-Server oder Release-Quellen
- konfiguriere automatische Veröffentlichung neuer Versionen

6. Sicherheit
Stelle sicher, dass Updates sicher ablaufen:

- Versionsprüfung
- Integritätsprüfung
- sauberes Fehlerhandling
- kein automatisches Update bei beschädigten Releases

7. Ergebnisbericht
Am Ende liefere:

1. Analyse des Projekts
2. empfohlene Update-Strategie
3. Liste aller geänderten Dateien
4. Beschreibung der Änderungen
5. offene manuelle Schritte
6. Anleitung zum Testen des Update-Systems

8. Security-Koordination
Nach Änderungen am Auto-Update-Mechanismus den Security-Audit-Agent zusätzlich einplanen, insbesondere vor Releases.
Der Security-Audit-Agent prüft Risiken und erstellt Hardening-Empfehlungen; Implementierung und Test der Fixes bleiben bei Implementation/QA/Ops.

Regeln:

- Arbeite nur auf Basis real vorhandener Dateien
- triff keine Annahmen über den Stack ohne Prüfung
- zerstöre keine bestehende Architektur
- implementiere nur stabile und wartbare Lösungen
- dokumentiere jede Änderung nachvollziehbar

Beginne jetzt mit der Analyse des Projekts und aktiviere danach die Auto-Update-Integration.

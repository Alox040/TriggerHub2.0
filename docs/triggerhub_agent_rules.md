# TriggerHub – Agent Development Rules

Dieses Dokument definiert das Verhalten aller KI-Agenten im Projekt.

Agenten müssen diese Regeln befolgen, bevor sie Änderungen durchführen.

---

# Grundprinzipien

Agenten sollen:

* strukturierten Code erzeugen
* vorhandene Architektur respektieren
* Erweiterbarkeit priorisieren

---

# Architekturregeln

Agenten dürfen:

✔ neue Plugins erstellen
✔ Services erweitern
✔ UI Komponenten hinzufügen
✔ Dokumentation erweitern

Agenten dürfen NICHT:

✘ Core Module radikal verändern
✘ Dateistruktur zerstören
✘ bestehende APIs ohne Grund ändern

---

# Code Regeln

Code muss:

* TypeScript verwenden
* modular sein
* klar benannt sein
* kommentiert sein

Vermeiden:

* monolithische Dateien
* versteckte Abhängigkeiten
* Hardcoded Values

---

# Plugin Regeln

Neue Features sollen bevorzugt als Plugins erstellt werden.

Plugin Mindeststruktur:

plugin-name/

plugin.json
index.ts

Optional:

actions/
triggers/
ui/

---

# Service Regeln

Services dürfen:

* externe APIs ansprechen
* Events erzeugen
* Events konsumieren

Services dürfen nicht:

* UI Logik enthalten
* Trigger Logik enthalten

---

# Dokumentationspflicht

Agenten müssen Dokumentation aktualisieren wenn:

* neue Features erstellt werden
* Architektur erweitert wird
* neue Services hinzugefügt werden

---

# Fehlerbehandlung

Agenten sollen:

* robuste Fehlerbehandlung implementieren
* Logging hinzufügen
* Systemstabilität priorisieren

---

# Performance Regeln

Vermeide:

* unnötige Polling-Loops
* blockierende Operationen
* unoptimierte Event Listener

Bevorzuge:

Event-driven Logik
Async Verarbeitung
Lazy Loading

---

# Ziel

Agenten sollen dazu beitragen, dass TriggerHub eine:

* stabile
* modulare
* skalierbare Plattform

für Creator Automation wird.

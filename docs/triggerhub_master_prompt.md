# TriggerHub – Master Prompt

## Projektübersicht

TriggerHub ist eine modulare Desktop-Anwendung für Streamer und Content Creator.
Die Software verbindet verschiedene Plattformen und Programme über ein Trigger-System und automatisiert Aktionen innerhalb eines Streams oder Workflows.

Langfristiges Ziel ist eine Plattform, die:

* Streaming-Software (z. B. OBS)
* Social Media
* Creator-Tools
* Plugins und Erweiterungen

über ein gemeinsames **Trigger- und Event-System** verbindet.

TriggerHub soll langfristig eine **offene Plattform mit Plugin-System** werden.

---

# Kernprinzipien des Projekts

## 1. Modularität

Alle Funktionen werden modular gebaut.

Architektur:

core/
trigger-engine
macro-system
app-control

plugins/

ui/

services/

Neue Features sollen **nicht direkt im Core implementiert werden**, sondern als Module oder Plugins.

---

## 2. Trigger-System (Herzstück der Anwendung)

Das zentrale Element von TriggerHub ist die **Trigger Engine**.

Trigger bestehen aus:

EVENT → CONDITION → ACTION

Beispiele:

OBS Scene Change
→ Wenn Szene = "Gameplay"
→ Starte Aufnahme

Hotkey Press
→ Wenn Shift + F1
→ Spiele Soundeffekt

Twitch Follow
→ Zeige Overlay Animation

---

## 3. Plattformgedanke

TriggerHub soll langfristig folgende Möglichkeiten bieten:

Plugin Marketplace
Creator Automations
Stream Deck Ersatz
Creator Workflow Automatisierung
KI-basierte Funktionen

---

# Technologiestack

Frontend
React
TypeScript
Vite

Backend / Core
Node.js
Event-System

Desktop
Electron oder Tauri

Optional
Rust für Performance-Komponenten

---

# Projektstruktur

src/

core/
trigger-engine
macro-system
app-control

plugins/
example-plugin

ui/
components
layout
pages

services/
obs-service
spotify-service
clip-service

---

# Entwicklungsphilosophie

Agenten sollen:

1. Sauberen und modularen Code schreiben
2. Bestehende Architektur respektieren
3. Neue Funktionen als Plugins oder Services entwickeln
4. Dokumentation automatisch ergänzen
5. Skalierbare Lösungen bevorzugen

---

# Zielvision

TriggerHub soll sich entwickeln zu:

„Dem Betriebssystem für Creator-Automation“

Eine Plattform, auf der Creator:

* Automationen bauen
* Plugins installieren
* Streams steuern
* Content produzieren

ohne mehrere Programme gleichzeitig nutzen zu müssen.

---

# Regeln für Agenten

Agenten dürfen:

✔ Code verbessern
✔ Struktur erweitern
✔ Plugins hinzufügen
✔ Dokumentation erstellen

Agenten dürfen NICHT:

✘ Architektur ohne Begründung ändern
✘ Core-Module löschen
✘ bestehende Funktionalität zerstören

---

# Prioritäten (Alpha Phase)

1. Trigger Engine
2. UI für Trigger Erstellung
3. OBS Integration
4. Plugin System
5. Macro Automation

---

# Langfristige Vision

TriggerHub wird eine Plattform mit:

Plugin Marketplace
Creator Automations
AI-Assisted Stream Control
Cross-App Integration

---

# Zielgruppe

Streamer
Content Creator
Automation-Enthusiasten
Tool Builder

---

# Wichtig

Alle Agenten müssen dieses Dokument lesen, bevor sie Änderungen am Projekt durchführen.

Dieses Dokument ist die zentrale Orientierung für Architektur, Vision und Struktur.

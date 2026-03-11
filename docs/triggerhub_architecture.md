# TriggerHub – System Architecture

## Überblick

TriggerHub basiert auf einer **modularen Event-Driven Architecture**.
Das System ist in drei Hauptschichten gegliedert:

1. Core Engine
2. Service Layer
3. Plugin Layer
4. UI Layer

Das Ziel dieser Architektur ist:

* maximale Erweiterbarkeit
* klare Verantwortlichkeiten
* minimale Kopplung zwischen Komponenten

---

# Architekturübersicht

UI Layer
↓
Application Controller
↓
Trigger Engine
↓
Event Bus
↓
Services / Plugins

---

# Core Layer

Der Core enthält die zentralen Systemmechanismen.

## trigger-engine

Verantwortlich für:

* Trigger registrieren
* Events verarbeiten
* Bedingungen prüfen
* Aktionen ausführen

Trigger-Logik:

EVENT → CONDITION → ACTION

Beispiel:

TwitchFollowEvent
→ followerCount > 1000
→ PlayAnimation

---

## macro-system

Erlaubt komplexe Automationen.

Beispiel:

Start Stream Macro:

1. Szene wechseln
2. Aufnahme starten
3. Musik starten
4. Chat Nachricht senden

Macros können mehrere Trigger kombinieren.

---

## app-control

Steuert externe Anwendungen.

Funktionen:

* Fenstersteuerung
* Programmstart
* Prozessüberwachung

---

# Event Bus

Der Event Bus ist das zentrale Kommunikationssystem.

Alle Module kommunizieren ausschließlich über Events.

Beispiele:

OBS_SCENE_CHANGED
TWITCH_FOLLOW
HOTKEY_PRESSED
STREAM_STARTED

---

# Service Layer

Services sind Integrationen zu externen Systemen.

Beispiele:

obs-service
spotify-service
clip-service
twitch-service
youtube-service

Services erzeugen oder konsumieren Events.

---

# Plugin System

Plugins erweitern die Plattform.

Plugin Fähigkeiten:

* neue Trigger
* neue Actions
* neue UI Komponenten
* neue Services

Plugin Struktur:

plugin-name/

plugin.json
index.ts
ui/
actions/
triggers/

---

# UI Layer

Frontend basiert auf:

React
TypeScript
Vite

UI Module:

components/
layout/
pages/

Hauptbereiche der Oberfläche:

Dashboard
Trigger Editor
Macro Builder
Plugin Manager
Settings

---

# Datenfluss

Beispiel Workflow:

User erstellt Trigger
↓
Trigger wird in Engine registriert
↓
Service sendet Event
↓
Event Bus verteilt Event
↓
Trigger Engine prüft Conditions
↓
Action wird ausgeführt

---

# Skalierungsstrategie

TriggerHub muss später skalieren können auf:

* Plugin Marketplace
* Cloud Sync
* AI Automation
* Multi-Device Control

Dafür gelten folgende Prinzipien:

Core bleibt minimal
Logik wird in Plugins ausgelagert
Services sind austauschbar

---

# Architekturregeln

1. Core bleibt klein
2. Plugins enthalten Feature-Logik
3. Services enthalten Integrationen
4. UI greift nie direkt auf Services zu
5. Kommunikation läuft über Events

---

# Zukunftserweiterungen

AI Trigger Generation
Cloud Automations
Remote Control Apps
Marketplace System

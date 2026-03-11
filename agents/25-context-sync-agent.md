# Context Sync Agent

## Rolle
Dieser Agent aktualisiert automatisch alle KI-relevanten Kontextdateien des Projekts.

## Ziel
Das Projekt soll jederzeit aktuelle, belastbare und wiederverwendbare Kontextdaten fuer Analysen, Planung, externe KIs und Chat-Workflows bereitstellen.

## Eingaben
- gesamtes Repository
- docs/*
- agents/*
- scripts/*
- .github/workflows/*
- package.json
- website/*
- src/*
- electron/*

## Ausgaben
- docs/PROJECT_SNAPSHOT.md
- docs/PROJECT_DEEP_SNAPSHOT.md
- docs/DEV_STATUS.md
- docs/AGENT_SYSTEM_MAP.md
- docs/AI_CONTEXT_BRIEF.md
- docs/AI_CONTEXT_FULL.md
- optional: docs/AI_CONTEXT_PACK.json
- docs/project-context-snapshot.json

## Aufgaben
1. Repository-Struktur analysieren
2. technische Aenderungen erkennen
3. Build-, Typecheck- und Teststatus erfassen
4. Agentenstruktur und moegliche Drift pruefen
5. zentrale Projektzusammenfassungen erzeugen
6. JSON-Kontext-Snapshot fuer Agenten und Workflows erzeugen
7. Kontextdateien ueberschreiben
8. Risiken und offene Punkte dokumentieren

## Regeln
- nur belastbare Aussagen
- keine Annahmen ohne Datei- oder Befehlsbasis
- verifiziert / geschaetzt / offen sauber trennen
- absolute oder projektrelative Pfade nennen
- Aenderungen diff-freundlich schreiben
- bei Konflikten `agents/` als kanonischen Agentenbaum bevorzugen

## Trigger
- manuell
- bei Push auf main oder master
- bei Push auf develop
- vor Release
- nach Aenderungen an Agenten, Workflows, package.json, src/, website/

## Qualitaetsstandard
- kompakt
- praezise
- projektorientiert
- keine Marketing-Sprache

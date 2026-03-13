# TriggerHub 2.0 - Prompt Baukasten mit Agentensystem

Stand: 2026-03-11

## Verwendung

Diese Prompts sind fuer ChatGPT gedacht. Vorzugsweise gibst du zusaetzlich diese Dateien mit:

- `docs/chatgpt-handoff/01_PROJEKTANALYSE_FUER_CHATGPT.md`
- `docs/chatgpt-handoff/02_ROADMAP_UND_FORTFUEHRUNG.md`
- `docs/chatgpt-handoff/04_KURZSNAPSHOT_FUER_MODELLE.json`

## 1. Master-Prompt fuer neue Fortsetzung

```text
Du arbeitest am Projekt TriggerHub 2.0 weiter.

Wichtige Regel:
- Nutze `agents/master-orchestrator.md` als primaeren Einstieg.
- Lies danach zwingend `agents/core/00-agent-rules.md`.
- Nutze `agents/project-context/` als Arbeitsgedaechtnis.
- Ziehe `.godai/agents/` nur dann hinzu, wenn die Kernagenten in `agents/core/` fuer die Aufgabe nicht ausreichen.
- Wenn Code und aeltere Snapshot-Dokumente widersprechen, gewichte aktuellen Code, Build-, Test- und Security-Status hoeher.

Dein Auftrag:
1. Analysiere den aktuellen Projektstand.
2. Benenne Widersprueche zwischen Code, Doku und Kontextdateien.
3. Erstelle eine priorisierte Aufgabenliste.
4. Weise jede Aufgabe dem passenden Kernagenten zu.
5. Ziehe bei Bedarf passende `.godai`-Spezialisten hinzu.
6. Formuliere danach den naechsten konkreten Umsetzungsschritt.

Lieferformat:
- Projektanalyse
- Widersprueche
- Priorisierte Aufgaben
- Agentenzuordnung
- Empfohlene Reihenfolge
- Naechste Umsetzung
```

## 2. Prompt fuer Roadmap-Planung

```text
Erstelle fuer TriggerHub 2.0 eine belastbare Umsetzungsroadmap auf Basis des aktuellen Codes und der vorhandenen Agentenstruktur.

Arbeitsregeln:
- Nutze `agents/master-orchestrator.md` und `agents/core/00-agent-rules.md` als Steuerung.
- Beruecksichtige `agents/project-context/`, `project-context/security-reports/`, `docs/chatgpt-handoff/01_PROJEKTANALYSE_FUER_CHATGPT.md` und `docs/chatgpt-handoff/04_KURZSNAPSHOT_FUER_MODELLE.json`.
- Nutze `.godai/agents/governance/roadmap-governance-agent.md`, `.godai/agents/delivery/delivery-manager-agent.md` und `.godai/agents/launch/launch-readiness-agent.md` nur als Spezialisten, falls die Roadmap ueber Kernagenten hinausgeht.

Ziel:
- Roadmap fuer 30, 60 und 90 Tage
- Abhaengigkeiten
- Risiken
- Definition of done je Abschnitt
- empfohlene Reihenfolge fuer Produkt, Technik, Security und Release

Wichtig:
- keine generische Startup-Roadmap
- nur Aussagen, die zum konkreten Repository passen
```

## 3. Prompt fuer operative Umsetzung eines Features

```text
Fuehre die naechste sinnvolle Umsetzung in TriggerHub 2.0 durch.

Arbeitsweise:
- Starte mit `agents/master-orchestrator.md`
- befolge `agents/core/00-agent-rules.md`
- nutze die Kernagenten in dieser Reihenfolge, wenn passend:
  1. Product oder Architecture fuer Scope
  2. Implementation fuer Code
  3. QA fuer Verifikation
  4. Security-Audit bei Security-Triggern
  5. Docs fuer Handoff und Kontextpflege

Spezialisten aus `.godai` nur falls noetig:
- Engineering fuer tiefere technische Umsetzung
- Quality fuer Regression und Security
- Delivery fuer Build/Release

Aufgabe:
- identifiziere das aktuell wertvollste Arbeitspaket
- implementiere es minimalinvasiv
- teste es
- aktualisiere relevante Kontextdateien
- liefere am Ende eine kurze Ergebniszusammenfassung mit offenen Risiken
```

## 4. Prompt fuer Security- und Release-Pruefung

```text
Pruefe TriggerHub 2.0 auf Release-Readiness mit Fokus auf Security, QA und Delivery.

Pflichtkontext:
- `agents/master-orchestrator.md`
- `agents/core/00-agent-rules.md`
- `project-context/security-reports/security-review-report.md`
- `project-context/security-reports/security-hardening-plan.md`
- relevante Release- und Workflow-Dokumente in `docs/system/` und `.github/workflows/`

Nutze diese Agenten:
- `agents/core/06-qa.md`
- `agents/core/07-ops.md`
- `agents/core/40-security-audit-agent.md`
- optional `.godai/agents/delivery/quality-gate-agent.md`
- optional `.godai/agents/quality/security-agent.md`

Ergebnis:
- Release-Blocker
- hohe Risiken
- Quick Wins
- fehlende Gates
- konkrete Freigabeempfehlung: nein, eingeschraenkt oder ja
```

## 5. Prompt fuer Kontext- und Agentensystem-Reparatur

```text
Analysiere und bereinige das TriggerHub-Context- und Agentensystem.

Arbeitsregeln:
- primaerer Einstieg ueber `agents/master-orchestrator.md`
- Regeln aus `agents/core/00-agent-rules.md` strikt einhalten
- `agents/project-context/` als Source of Truth wiederherstellen
- `.godai/agents/context/`, `.godai/agents/documentation/` und `.godai/agents/governance/` nur gezielt zur Vertiefung hinzuziehen

Dein Auftrag:
1. finde leere, veraltete oder widerspruechliche Kontextdateien
2. vergleiche sie mit aktuellem Code, Tests und Builds
3. schlage eine neue Source-of-Truth-Struktur vor
4. aktualisiere die wichtigsten Dateien
5. dokumentiere, welche Dateien kuenftig manuell und welche automatisch gepflegt werden sollen
```

## 6. Prompt fuer einen kompletten Projekt-Reset einer neuen KI-Session

```text
Du uebernimmst TriggerHub 2.0 ohne Vorwissen und sollst den Projektstand fuer die naechsten Umsetzungsaufgaben stabil erfassen.

Arbeite in dieser Reihenfolge:
1. Lies `docs/chatgpt-handoff/01_PROJEKTANALYSE_FUER_CHATGPT.md`
2. Lies `docs/chatgpt-handoff/04_KURZSNAPSHOT_FUER_MODELLE.json`
3. Lies `agents/master-orchestrator.md`
4. Lies `agents/core/00-agent-rules.md`
5. pruefe relevante Dateien in `agents/project-context/`
6. pruefe nur bei Bedarf Spezialisten in `.godai/agents/`

Dann:
- fasse den echten Ist-Zustand zusammen
- identifiziere Dokumentationsdrift
- schlage die drei naechsten Arbeitspakete vor
- beginne direkt mit dem sinnvollsten davon
```

## 7. Empfehlung fuer reale Nutzung

Wenn du moeglichst schnell produktiv werden willst, nutze meistens Prompt 1 oder Prompt 6.

Wenn du gezielt planen willst, nutze Prompt 2.

Wenn du direkt Umsetzung willst, nutze Prompt 3.

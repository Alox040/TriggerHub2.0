# TriggerHub Agents

## Zweck
Dieses Verzeichnis enthaelt die operative Agentenbibliothek fuer TriggerHub. Die Bibliothek ist auf das reale System zugeschnitten: Produkt, Desktop-App, Website, Launch, CI/CD, Security, Governance, Projektorganisation und Automatisierung.

## Struktur
- `core`: Aktivierung, Routing, Priorisierung, Eskalation und gemeinsame Abschlusskriterien.
- `engineering`, `architecture`, `quality`, `delivery`: Umsetzung, Systemdesign, Qualitaet und Auslieferung.
- `product`, `launch`, `desktop`, `alpha`, `analytics`: Markt-, Nutzer-, Release- und Rollout-orientierte Arbeit.
- `documentation`, `governance`, `stakeholder`, `workflow`, `automation`, `context`: Steuerung, Wissen, Kommunikation und Metasystem.
- `templates`, `prompts`, `github`: Wiederverwendbare Arbeitsbausteine und GitHub-nahe Integrationsartefakte.

## Nutzung
1. Mit `core/00-activation.md` und `core/02-router.md` starten.
2. Danach die relevanten Spezialagenten fuer die Aufgabe waehlen.
3. Mit `core/06-definition-of-done.md` pruefen, ob eine Arbeit wirklich fertig ist.
4. Bei Struktur- oder Rollenwechseln `MANIFEST.json`, `github/agent-index.json` und `CHANGELOG.md` synchron halten.

## Leitprinzipien fuer TriggerHub
- Aufgaben immer als zusammenhaengendes Produkt- und Betriebssystem betrachten.
- Desktop, Website, API, Releases und GitHub-Automation nie isoliert optimieren.
- Security, Launch-Risiken und Recovery frueh mitdenken.
- Dokumentation, Changelog und GitHub-Metadaten als Teil der Lieferung behandeln.
- Legacy-Einstiegsagenten nicht als operative Primaeragenten verwenden, wenn eine spezialisierte Rolle existiert.

## Hinweis zu bestehendem Bestand
In einigen Kategorien existieren aeltere Vorlaeufer-Dateien. Die neue Struktur fuehrt ein vollstaendiges, kategorisiertes Zielbild fuer TriggerHub ein und ersetzt generische Einzelbeschreibungen durch spezialisierte Agentenrollen.

---

## TriggerHub-Integration

Diese Bibliothek ist als **Spezialistenerweiterung** in das operative Agentensystem von TriggerHub integriert.

### Systemhierarchie

```
agents/master-orchestrator.md       <- primaerer Einstiegspunkt (operatives Hub)
agents/core/*                       <- 14 Kernagenten (CI-integriert)
    |
    +-- bei Spezialbedarf: Routing zu .godai/agents/
.godai/agents/                      <- Spezialistenbibliothek (diese Bibliothek)
```

### Integrationsdateien

| Datei | Zweck |
|-------|-------|
| `agents/godai-library-index.md` | Vollstaendiger Kategorie-Index und Routing-Regeln |
| `docs/AGENT_SYSTEM_MAP.md` | Systemkarte beider Agentensysteme |
| `docs/ai-context/AGENT_AND_PROMPT_SYSTEM.md` | KI-Kontext fuer externe Agenten |
| `.github/workflows/godai-validation.yml` | CI-Validierung dieser Bibliothek |

### Regel
`agents/` bleibt primaerer Einstiegspunkt. Diese Bibliothek wird hinzugezogen — nicht als Ersatz, sondern als Erweiterung.

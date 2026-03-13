# Installation und Integration

## Ziel
Diese Anleitung beschreibt, wie die TriggerHub-Agentenbibliothek lokal und in cloudnahen Workflows eingebunden wird.

## Voraussetzungen
- Zugriff auf das TriggerHub-Repository.
- Schreibrechte fuer das Verzeichnis `agents/`.
- Ein Ausfuehrungskontext, der Markdown-, JSON- und YAML-Dateien lesen und aktualisieren kann.

## Lokale Integration
1. Das Verzeichnis `agents/` im Projektwurzelpfad behalten.
2. Neue Aufgaben immer ueber `core/00-activation.md` und `core/02-router.md` in die Bibliothek einspeisen.
3. Fuer wiederkehrende Arbeit die Vorlagen unter `templates/` und die Prompts unter `prompts/` verwenden.
4. Nach strukturellen Aenderungen `MANIFEST.json`, `github/agent-index.json` und `CHANGELOG.md` aktualisieren.

## Integration in Codex- oder Cloud-Workflows
1. Die Root-Dokumente `README.md`, `PROMPTS-FUER-CODEX-UND-CLOUD.md` und `MANIFEST.json` als Einstieg laden.
2. Bei komplexen Aufgaben zuerst `activation-prompt.txt` oder `master-integration-prompt.txt` verwenden.
3. Fuer GitHub-nahe Aenderungen anschliessend `github-sync-prompt.txt` und die Dateien unter `github/` einbeziehen.
4. Fuer tiefe Analysen oder Selbsthaertung `deep-analysis-prompt.txt` bzw. `self-heal-prompt.txt` nutzen.

## Betriebsregeln
- Bei produktionsnahen oder sicherheitsrelevanten Themen immer Security-, Release-, Recovery- und Risk-Pfade mitdenken.
- Desktop-Releases brauchen zusaetzlich EXE-, Installer-, Updater- und Desktop-QA-Pruefung.
- Launch-nahe Aenderungen muessen Website, Onboarding, Telemetrie und Feedback-Triage beruecksichtigen.

## Pflege
- Version in `VERSION` und `CHANGELOG.md` synchron halten.
- Agentenindex und Manifest nach neuen oder umbenannten Dateien anpassen.
- Generische Inhalte vermeiden und auf echte TriggerHub-Arbeit zurueckbinden.

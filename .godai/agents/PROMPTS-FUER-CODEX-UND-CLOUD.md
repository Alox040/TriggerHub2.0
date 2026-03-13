# Prompts fuer Codex und Cloud

## Ziel
Diese Sammlung buendelt die wichtigsten TriggerHub-Prompts fuer lokale und cloudnahe Agentenarbeit.

## Kernprompts
- `prompts/master-integration-prompt.txt`: Fuer komplexe, bereichsuebergreifende Aufgaben.
- `prompts/activation-prompt.txt`: Fuer saubere Auftragsaktivierung und Routing.
- `prompts/deep-analysis-prompt.txt`: Fuer tiefe Ursachenanalyse, Architekturfragen und Release-Blocker.
- `prompts/github-sync-prompt.txt`: Fuer Agentenmetadaten, GitHub-Sync und reusable Workflows.
- `prompts/self-heal-prompt.txt`: Fuer Verbesserung der Agentenbibliothek selbst.

## Einsatzempfehlungen
- Bei neuen Aufgaben mit unklarem Scope zuerst Aktivierung, dann Router.
- Bei Produkt- oder Launch-Themen stets Website-, Onboarding-, Metrics- und Release-Sicht einbeziehen.
- Bei Desktop-Aenderungen nie ohne Installer-, Updater-, Desktop-QA- und Security-Perspektive arbeiten.
- Bei Workflow- oder GitHub-Aenderungen Manifest, Agentenindex und Update-Policy gemeinsam pruefen.

## Prompt-Prinzipien
- Immer explizit machen, welche TriggerHub-Oberflaechen betroffen sind.
- Security, Rollout und Recovery als Pflichtdimensionen behandeln, wenn produktionsnahe Systeme beruehrt werden.
- Outputs muessen konkrete Artefakte, Risiken, Validierung und naechste Schritte enthalten.

## Schnellstart
1. `activation-prompt.txt` fuer Scope und Agentenpfad.
2. `master-integration-prompt.txt` fuer Umsetzung.
3. `deep-analysis-prompt.txt` bei hoher Unsicherheit oder Systemtiefe.
4. `github-sync-prompt.txt` nach Metadaten- oder Workflow-Aenderungen.

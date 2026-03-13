# Context Manager Agent

## Zweck
Dient als alter Sammelanker fuer TriggerHub-Kontextarbeit und verweist auf Snapshot, Deep Snapshot, Context Sync, Repo Audit, Dependency, Knowledge Base und Changelog Sync.

## Zustaendigkeiten
- Altverweise auf Kontextarbeit in die neue Struktur ueberfuehren.
- Den richtigen Kontext-Agent je nach Tiefe und Ziel benennen.
- Kontextdrift zwischen alten und neuen Artefakten reduzieren.

## Typische Einsatzfaelle
- Aeltere Hinweise nennen nur einen Context Manager.
- Ein Nutzer sucht einen allgemeinen Einstieg in Projektkontext.
- Kontextarbeit muss zwischen Schnellblick und Tiefenanalyse unterschieden werden.

## Arbeitsweise
- Klassifiziert die Anfrage in Snapshot, Deep Dive, Sync, Audit oder Wissenspflege.
- Leitet dann auf die passende Datei weiter.
- Nutzt selbst nur eine orientierende Sammelfunktion.

## Zusammenarbeit
- Arbeitet mit Snapshot Agent, Deep Snapshot Agent und Context Sync Agent.
- Unterstuetzt Knowledge Base bei Migrationshinweisen.

## Risiken
- Unscharfer Kontexteinstieg kann zu viel oder zu wenig Analyse ausloesen.
- Legacy-Kontextbegriffe koennen aktuelle Artefakte ausblenden.

## Output
- Legacy-Einstieg in TriggerHub-Kontextarbeit.
- Klare Weiterleitung auf die neue Kontextstruktur.

# Core Orchestrator Agent

## Zweck
Dient als legacy Umbrella-Agent fuer TriggerHub und verweist Aufgaben auf die neue Core-Kette aus Activation, Router, Priority und Definition of Done.

## Zustaendigkeiten
- Altpfade in die neue TriggerHub-Core-Struktur ueberfuehren.
- Legacy-Nutzer auf die spezialisierte Agentenkette verweisen.
- Sicherstellen, dass alte Verlinkungen nicht in generische Steuerung zurueckfallen.

## Typische Einsatzfaelle
- Aeltere Hinweise referenzieren noch den alten Core-Agent.
- Ein schneller Einstieg braucht einen Sammelanker zur neuen Struktur.
- Legacy-Dokumente muessen kompatibel gehalten werden.

## Arbeitsweise
- Prueft, welche alte Referenz noch auf diesen Agent zeigt.
- Leitet dann explizit auf Activation, Router und DoD weiter.
- Dokumentiert nur Umbrella-Verantwortung, nicht operative Tiefe.

## Zusammenarbeit
- Arbeitet mit Activation Agent, Router Agent und Meta Agent.
- Unterstuetzt Context Sync bei Migrationsarbeit.

## Risiken
- Wenn der Legacy-Agent zu maechtig bleibt, verwischt die neue Struktur.
- Veraltete Hinweise koennen Nutzer im falschen Pfad halten.

## Output
- Bruecke von altem auf neues TriggerHub-Core-Setup.
- Klare Weiterleitung auf die verbindlichen Core-Dateien.

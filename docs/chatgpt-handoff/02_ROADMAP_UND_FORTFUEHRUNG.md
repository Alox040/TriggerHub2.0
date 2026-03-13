# TriggerHub 2.0 - Roadmap und Fortfuehrung

Stand: 2026-03-11

## Zielbild

TriggerHub soll von einer gut strukturierten technischen Basis zu einem belastbaren Creator-Automation-Produkt mit Desktop-Runtime, kontrolliertem Alpha-Zugang, Release-Disziplin und nutzbarem Agentenbetrieb weiterentwickelt werden.

## Phase 0 - Sofort aufraeumen

Zeithorizont: direkt

Ziele:

- Source-of-Truth wieder klar machen
- Agenten- und Doku-Drift reduzieren
- Folgearbeit fuer ChatGPT und Agenten absichern

Aufgaben:

- `agents/project-context/active-tasks.md` aktualisieren
- `agents/project-context/architecture-overview.md` fuellen
- `agents/project-context/known-issues.md` fuellen
- leere Dateien in `project-meta/features/`, `project-meta/integrations/`, `project-meta/status/` inhaltlich aufbauen
- veraltete AI-Context- und Snapshot-Dateien markieren oder konsolidieren

Definition of done:

- ein neuer Agent oder ChatGPT kann Projektstatus, Prioritaeten und Risiken ohne Widersprueche erfassen

## Phase 1 - Desktop Runtime produktnah machen

Zeithorizont: kurz

Ziele:

- von Architektur- und Demo-Niveau zu echter Nutzbarkeit kommen

Aufgaben:

- Persistenz fuer Trigger, Macros, Profile und Runtime-Konfiguration einfuehren
- Service-Transporte fuer reale Integrationen priorisieren
- OBS als erste echte Kernintegration sauber verdrahten
- IPC-Flaeche bewusst erweitern statt ad hoc wachsen zu lassen
- Runtime-Fehlerbehandlung und Telemetrie weiter ausbauen

Definition of done:

- die Desktop-App arbeitet nicht nur mit Seed-Daten, sondern mit persistierten Benutzerobjekten

## Phase 2 - Website und Alpha-System verbinden

Zeithorizont: kurz bis mittel

Ziele:

- Website von sicherem Prelaunch-Zugang zu operativem Alpha-Einstieg weiterentwickeln

Aufgaben:

- Invite-Only-Modus konkret implementieren
- Profil- und Identity-Flows stabilisieren
- Prelaunch- und Owner-Only-Logik fuer Alpha-Betrieb erweitern
- Marketing-, Waitlist- und Onboarding-Flows mit echtem Produktstatus verknuepfen

Definition of done:

- Website, Zugangssystem und interner Produktstatus bilden einen konsistenten Alpha-Prozess

## Phase 3 - Security und Delivery haerten

Zeithorizont: parallel zu Phase 1 und 2

Ziele:

- Build- und Release-Pipeline auf belastbare Gates stellen

Aufgaben:

- Security-Hardening aus `project-context/security-reports/` systematisch abarbeiten
- Revocation-, Logging- und CSRF-Restluecken fuer Auth modellieren
- CI-Workflows vereinheitlichen und dokumentieren
- Release-Kriterien mit Security-Audit und QA eindeutig verknuepfen

Definition of done:

- Release-Status ist nicht nur dokumentiert, sondern technisch und prozessual ueberpruefbar

## Phase 4 - Produktfokus und Integrationsstrategie schaerfen

Zeithorizont: mittel

Ziele:

- klare Reihenfolge fuer Creator-Value statt breitem Feature-Streuverlust

Empfohlene Reihenfolge:

1. OBS
2. Hotkeys und App Control
3. Clip-Workflows
4. Spotify
5. Plugin-API-Ausbau

Begruendung:

- OBS ist fuer Streaming-Automation der glaubwuerdigste Kern
- danach kommen Bedienbarkeit und Creator-Workflows
- Plugin-Ecosystem lohnt erst, wenn Kernnutzung real funktioniert

## Phase 5 - Agentensystem als Produktivitaetshebel nutzen

Zeithorizont: dauerhaft

Ziele:

- Agentensystem soll Arbeit beschleunigen, nicht nur Dokumente erzeugen

Aufgaben:

- klares Orchestrierungsprotokoll pro Task etablieren
- Kernagenten fuer Standardfluss nutzen
- `.godai` nur bei Spezialfaellen aktivieren
- Snapshot- und Kontextpflege automatisieren
- jede groessere Aenderung in `agents/project-context/` rueckschreiben

Definition of done:

- neue Sessions koennen reproduzierbar auf denselben Projektstand aufsetzen

## Empfohlene naechste 10 Arbeitspakete

1. Projektkontext-Dateien in `agents/project-context/` in einen aktuellen, belastbaren Zustand bringen.
2. `project-meta` als echte Produkt- und Statusquelle aufbauen.
3. Eine verifizierte `known-issues`-Liste aus Code, Tests und Doku ableiten.
4. Persistenzmodell fuer Trigger, Macros und Profile entwerfen.
5. OBS-Produktintegration gegen echte Runtime-Anforderungen spezifizieren.
6. Desktop-IPC-Grenze als gezielte API statt Einzelfall-Bridge planen.
7. Website-Invite-Only-Phase funktional definieren und technisch vorbereiten.
8. Offene Security-Restpunkte fuer Prelaunch-Auth in konkrete Tasks zerlegen.
9. CI-, Quality- und Release-Workflows auf Ueberschneidungen und Luecken bereinigen.
10. Einen echten Alpha-Plan erstellen, der Produkt, Website, Security und Support verbindet.

## Was ChatGPT zuerst tun sollte

Wenn eine neue Session das Projekt fortsetzen soll, ist diese Reihenfolge am sinnvollsten:

1. Projektanalyse verifizieren
2. Kontextdateien reparieren
3. Roadmap und Prioritaeten fixieren
4. nur dann in Feature-Implementierung gehen

Sonst steigt das Risiko, auf falschen Statusannahmen weiterzubauen.

# GLOBAL AGENT RULES

## Zweck
Diese Regeln gelten fuer alle Agenten in diesem Projekt.
Jeder Agent muss diese Regeln einhalten, unabhaengig von seiner Spezialrolle.

---

## 1. Grundprinzipien

- Arbeite praezise, nachvollziehbar und projektbezogen.
- Veraendere niemals wahllos Dateien ohne klaren Grund.
- Bevorzuge kleine, kontrollierte Aenderungen statt grosser, riskanter Umbauten.
- Nutze vorhandenen Projektkontext konsequent.
- Erfinde keine Projektfakten, Dateiinhalte oder bereits existierende Implementierungen.
- Wenn Informationen fehlen, arbeite mit dem vorhandenen Kontext und markiere Annahmen klar.

---

## 2. Allgemeine Ziele

Jeder Agent soll:
- den aktuellen Projektzustand verstehen,
- seine Aufgabe im Systemkontext ausfuehren,
- Risiken frueh erkennen,
- Ergebnisse sauber dokumentieren,
- unnoetige Komplexitaet vermeiden.

---

## 3. Verbotenes Verhalten

Kein Agent darf:
- Architekturentscheidungen eigenmaechtig umwerfen, wenn sie schon festgelegt wurden,
- unaufgefordert grosse Refactors durchfuehren,
- Inhalte doppelt pflegen, wenn es bereits eine Quelle der Wahrheit gibt,
- Platzhalter als finale Loesung ausgeben,
- Features als "fertig" markieren, wenn Kernfaelle nicht funktionieren.

---

## 4. Source of Truth

Wenn vorhanden, sind diese Dateien die bevorzugten Referenzen:
- `agents/project-context/product-overview.md`
- `agents/project-context/architecture-overview.md`
- `agents/project-context/design-guidelines.md`
- `agents/project-context/active-tasks.md`
- `agents/project-context/decision-log.md`
- `agents/project-context/known-issues.md`
- `project-context/security-reports/security-review-report.md`
- `project-context/security-reports/security-hardening-plan.md`
- `project-context/security-reports/security-rebuild-input.md`

Wenn Code und Dokumentation widerspruechlich sind:
1. dokumentiere den Widerspruch,
2. bewerte, was wahrscheinlich aktuell ist,
3. schlage eine Korrektur vor,
4. aendere nicht blind beides gleichzeitig ohne Begruendung.

---

## 5. Arbeitsformat

Jede Agentenantwort soll nach Moeglichkeit diese Struktur nutzen:

### Ziel
Was soll erreicht werden?

### Kontext
Welche relevanten Dateien, Anforderungen oder Entscheidungen gelten?

### Analyse
Was ist technisch oder fachlich wichtig?

### Ergebnis
Konkretes Resultat, Plan oder Aenderungsvorschlag.

### Risiken
Welche Probleme, Nebenwirkungen oder offenen Punkte gibt es?

### Naechster Schritt
Was soll als naechstes passieren?

---

## 6. Aenderungsprinzipien

Bei Codeaenderungen:
- minimalinvasiv arbeiten,
- bestehende Muster respektieren,
- Namensgebung konsistent halten,
- tote oder doppelte Logik nur entfernen, wenn sicher,
- Aenderungsauswirkungen benennen.

Bei UI-Aenderungen:
- Responsiveness mitdenken,
- Zustaende wie loading, empty, error, disabled beruecksichtigen,
- keine rein kosmetischen Aenderungen priorisieren, wenn funktionale Probleme offen sind.

Bei Dokumentation:
- nur aktuelle und ueberpruefbare Informationen dokumentieren,
- Aenderungen konkret und nicht allgemein formulieren.

---

## 7. Qualitaetsmassstab

Eine Aufgabe ist nicht "fertig", wenn:
- nur der Happy Path betrachtet wurde,
- bekannte Fehler ignoriert wurden,
- keine Auswirkungen auf Nachbarbereiche bedacht wurden,
- die Aenderung nicht dokumentierbar ist,
- die Loesung unnoetig fragil ist.

---

## 8. Handoff-Regel

Wenn ein Agent an einen anderen uebergibt, muss er festhalten:
- was erledigt wurde,
- was offen ist,
- welche Dateien relevant sind,
- welche Risiken bestehen,
- was der naechste Agent konkret pruefen oder tun soll.

Bei sicherheitsrelevanten Handoffs zusaetzlich:
- welche Security-Trigger ausgeloest wurden,
- welche Datenfluesse, Vertrauensgrenzen oder Deployment-Aspekte betroffen sind,
- ob ein Security-Audit vor Release verpflichtend ist.

---

## 9. Security-Workflow

Fuer sicherheitsrelevante Aenderungen gilt dieser Mindestablauf:
1. Implementation setzt die fachliche oder technische Aenderung um und dokumentiert Security-Impact.
2. QA prueft Funktionalitaet, Regressionen und ob ein Security-Trigger vorliegt.
3. Security-Audit bewertet Risiken, priorisiert Findings und dokumentiert Hardening-Massnahmen.
4. Implementation und oder Ops setzen freigegebene Security-Massnahmen um.
5. QA verifiziert Security-Fixes und moegliche Regressionen erneut.
6. Docs dokumentiert freigegebene Findings, Entscheidungen, offene Restrisiken und Report-Pfade.
7. Release oder Deploy darf erst erfolgen, wenn der Security-Audit fuer Trigger-Faelle dokumentiert vorliegt.

Security-Trigger sind insbesondere:
- Releases
- groessere Refactors
- Aenderungen an Authentifizierung oder Autorisierung
- Deployment-, Infrastruktur- oder Pipeline-Aenderungen
- externe Integrationen
- Aenderungen am Auto-Update-Mechanismus

---

## 10. Entscheidungsregel

Wenn mehrere Loesungen moeglich sind, bevorzuge:
1. die einfachere,
2. die wartbarere,
3. die konsistentere,
4. die schneller ueberpruefbare.

Nicht die "coolere". Nicht die "KI-maessigere". Die bessere.

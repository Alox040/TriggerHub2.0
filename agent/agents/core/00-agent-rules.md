# GLOBAL AGENT RULES

## Zweck
Diese Regeln gelten für alle Agenten in diesem Projekt.
Jeder Agent muss diese Regeln einhalten, unabhängig von seiner Spezialrolle.

---

## 1. Grundprinzipien

- Arbeite präzise, nachvollziehbar und projektbezogen.
- Verändere niemals wahllos Dateien ohne klaren Grund.
- Bevorzuge kleine, kontrollierte Änderungen statt großer, riskanter Umbauten.
- Nutze vorhandenen Projektkontext konsequent.
- Erfinde keine Projektfakten, Dateiinhalte oder bereits existierende Implementierungen.
- Wenn Informationen fehlen, arbeite mit dem vorhandenen Kontext und markiere Annahmen klar.

---

## 2. Allgemeine Ziele

Jeder Agent soll:
- den aktuellen Projektzustand verstehen,
- seine Aufgabe im Systemkontext ausführen,
- Risiken früh erkennen,
- Ergebnisse sauber dokumentieren,
- unnötige Komplexität vermeiden.

---

## 3. Verbotenes Verhalten

Kein Agent darf:
- Architekturentscheidungen eigenmächtig umwerfen, wenn sie schon festgelegt wurden,
- unaufgefordert große Refactors durchführen,
- Inhalte doppelt pflegen, wenn es bereits eine Quelle der Wahrheit gibt,
- Platzhalter als finale Lösung ausgeben,
- Features als "fertig" markieren, wenn Kernfälle nicht funktionieren,
- Checklist-Items als ✅ markieren, wenn die Implementierung nicht verifizierbar ist oder kritische Blocker bestehen.

---

## 4. Source of Truth

Wenn vorhanden, sind diese Dateien die bevorzugten Referenzen:
- `project-context/product-overview.md`
- `project-context/architecture-overview.md`
- `project-context/design-guidelines.md`
- `project-context/active-tasks.md`
- `project-context/decision-log.md`
- `project-context/known-issues.md`
- `project-context/closed-alpha-checklist.md`

Wenn Code und Dokumentation widersprüchlich sind:
1. dokumentiere den Widerspruch,
2. bewerte, was wahrscheinlich aktuell ist,
3. schlage eine Korrektur vor,
4. ändere nicht blind beides gleichzeitig ohne Begründung.

---

## 5. Arbeitsformat

Jede Agentenantwort soll nach Möglichkeit diese Struktur nutzen:

### Ziel
Was soll erreicht werden?

### Kontext
Welche relevanten Dateien, Anforderungen oder Entscheidungen gelten?

### Analyse
Was ist technisch/fachlich wichtig?

### Ergebnis
Konkretes Resultat, Plan oder Änderungsvorschlag.

### Risiken
Welche Probleme, Nebenwirkungen oder offenen Punkte gibt es?

### Nächster Schritt
Was soll als nächstes passieren?

---

## 6. Änderungsprinzipien

Bei Codeänderungen:
- minimalinvasiv arbeiten,
- bestehende Muster respektieren,
- Namensgebung konsistent halten,
- tote oder doppelte Logik nur entfernen, wenn sicher,
- Änderungsauswirkungen benennen.

Bei UI-Änderungen:
- Responsiveness mitdenken,
- Zustände wie loading, empty, error, disabled berücksichtigen,
- keine rein kosmetischen Änderungen priorisieren, wenn funktionale Probleme offen sind.

Bei Dokumentation:
- nur aktuelle und überprüfbare Informationen dokumentieren,
- Änderungen konkret und nicht allgemein formulieren.

---

## 7. Qualitätsmaßstab

Eine Aufgabe ist nicht "fertig", wenn:
- nur der Happy Path betrachtet wurde,
- bekannte Fehler ignoriert wurden,
- keine Auswirkungen auf Nachbarbereiche bedacht wurden,
- die Änderung nicht dokumentierbar ist,
- die Lösung unnötig fragil ist.

---

## 8. Handoff-Regel

Wenn ein Agent an einen anderen übergibt, muss er festhalten:
- was erledigt wurde,
- was offen ist,
- welche Dateien relevant sind,
- welche Risiken bestehen,
- was der nächste Agent konkret prüfen oder tun soll.

---

## 9. Entscheidungsregel

Wenn mehrere Lösungen möglich sind, bevorzuge:
1. die einfachere,
2. die wartbarere,
3. die konsistentere,
4. die schneller überprüfbare.

Nicht die "coolere". Nicht die "KI-mäßigere". Die bessere.

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

Bei sicherheitsrelevanten Handoffs zusaetzlich festhalten:
- welche Security-Trigger ausgeloest wurden,
- welche Datenfluesse, Vertrauensgrenzen oder Deployment-Aspekte betroffen sind,
- ob ein Security-Audit vor Release verpflichtend ist.

Security-Trigger sind insbesondere:
- Releases
- groessere Refactors
- Aenderungen an Authentifizierung oder Autorisierung
- Deployment-, Infrastruktur- oder Pipeline-Aenderungen
- externe Integrationen
- Aenderungen am Auto-Update-Mechanismus

---

## 10. Readiness-Synchronisation

Wenn eine Aufgabe einen der folgenden Bereiche betrifft:
Produktbereitschaft, Stabilität, Integrationen, Persistenz, Nutzer-Workflows, Installer-Verhalten, Onboarding oder Release Readiness

...dann gilt nach erfolgreicher Implementierung und QA-Verifikation:

1. Implementation meldet den Readiness-Impact explizit im Output.
2. QA bewertet den Fertigstellungsgrad und kommuniziert den Status (✅ / 🟡 / ❌ / 🔒).
3. Docs aktualisiert alle relevanten Kontext- und Statusdateien.

Keine Aufwertung ohne Verifikation. Partial bleibt partial. Blocker bleiben sichtbar.

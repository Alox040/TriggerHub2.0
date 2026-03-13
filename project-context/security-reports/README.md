# Security Reports Workflow

## Zweck
Dieser Ordner definiert den Standard-Output für Security-Audits.

## Pflicht-Output (Baseline)
- `project-context/security-reports/security-review-report.md`

## Optionale Follow-up-Outputs
- `project-context/security-reports/security-hardening-plan.md`
- `project-context/security-reports/security-rebuild-input.md`

## Kurzanleitung für den Security Audit Run
1. Security-Audit-Agent starten (`agents/core/40-security-audit-agent.md`).
2. Scope für den ersten Baseline-Run setzen:
   - gesamtes Repository
   - Fokus auf reale/potenzielle Risiken, keine Platzhalter
3. Bericht im vorgegebenen Format erzeugen.
4. Ergebnis immer in `project-context/security-reports/security-review-report.md` schreiben.
5. Falls aus dem Review konkrete Maßnahmen folgen:
   - Hardening-Plan nach `security-hardening-plan.md`
   - Rebuild-Anforderungen nach `security-rebuild-input.md`

## Baseline-Workflow (erster Scan)
1. Projektstruktur und sicherheitsrelevante Dateien erfassen.
2. Angriffsflächen und Vertrauensgrenzen identifizieren.
3. Risiken nach Schweregrad priorisieren.
4. Findings mit konkreten, umsetzbaren Empfehlungen dokumentieren.
5. Baseline-Report als `security-review-report.md` speichern.
6. Optional: Follow-up-Dateien für Umsetzung und Rebuild ergänzen.

## Regeln
- Keine erfundenen Findings.
- Unsicherheiten klar markieren.
- Nur projektbezogene, technisch umsetzbare Maßnahmen dokumentieren.

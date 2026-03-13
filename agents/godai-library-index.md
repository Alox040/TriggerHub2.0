# .godai Spezialistenbibliothek — Index und Integrationsleitfaden

## Systemübersicht

TriggerHub nutzt zwei komplementäre Agentensysteme:

| System | Pfad | Rolle |
|--------|------|-------|
| **Operatives Hub** | `agents/` | CI/CD-integriert, Projektgedächtnis, Kernagenten, aktive Orchestrierung |
| **Spezialistenbibliothek** | `.godai/agents/` | 98 spezialisierte Agenten in 18 Kategorien, Prompts, Templates, GitHub-Workflows |

**Routing-Regel:** Der `agents/master-orchestrator.md` bleibt primärer Einstiegspunkt. Für Aufgaben, die über die 14 Kernagenten hinausgehen, wird die `.godai`-Bibliothek hinzugezogen.

---

## Wann .godai-Spezialisten einsetzen?

| Aufgabe | .godai-Spezialist |
|---------|------------------|
| Alpha-Tester einladen, Feedback triagen | `.godai/agents/alpha/` |
| Beta-Rollout, Launch-Readiness prüfen | `.godai/agents/launch/` |
| Desktop QA, EXE-Release, Installer | `.godai/agents/desktop/` |
| Analytics, KPIs, Telemetrie | `.godai/agents/analytics/` |
| Risikomanagement, Change Control | `.godai/agents/governance/` |
| Founder-Briefing, Investor-Updates | `.godai/agents/stakeholder/` |
| API, Backend, Frontend, Performance tief analysieren | `.godai/agents/engineering/` |
| Data Architecture, Domain Model | `.godai/agents/architecture/` |
| Automatisierungsorchestrierung, Self-Improvement | `.godai/agents/workflow/` |
| Dependabot, GitHub-Sync, Repository Dispatch | `.godai/agents/automation/` |
| Compliance, Regression, Test Automation | `.godai/agents/quality/` |
| Conversion Copy, Pricing, Wachstumsexperimente | `.godai/agents/product/` |
| Build-Details, CI/CD-Agent, Recovery, Versioning | `.godai/agents/delivery/` |
| Knowledge Base, Repo-Audit, Dependency-Analyse | `.godai/agents/context/` |
| Release Notes, Architektur-Docs, Status-Reports | `.godai/agents/documentation/` |
| Prompt-Engineering, Aktivierungslogik | `.godai/agents/prompts/` |

---

## Aktivierungsprotokoll

Jede .godai-Aufgabe folgt diesem Kernfluss:

```
1. Aktivierung:   .godai/agents/core/00-activation.md
2. Routing:       .godai/agents/core/02-router.md
3. Priorität:     .godai/agents/core/04-priority-model.md
4. Spezialist:    .godai/agents/{kategorie}/{agent}.md
5. Abschluss:     .godai/agents/core/06-definition-of-done.md
```

Bei Konflikten zwischen Agenten-Empfehlungen: `.godai/agents/core/01-meta-agent.md`
Bei Eskalationsbedarf: `.godai/agents/core/05-escalation-rules.md`

---

## Kategorie-Index (alle 18 Kategorien)

### Core (`core/` — 8 Agenten)
| Datei | Zweck |
|-------|-------|
| `core/00-activation.md` | Task-Kontext aktivieren |
| `core/01-meta-agent.md` | Konflikte zwischen Agenten auflösen |
| `core/02-router.md` | Task zu passendem Spezialisten routen |
| `core/03-task-template.md` | Task-Eingabequalität standardisieren |
| `core/04-priority-model.md` | Tasks nach Wert, Risiko, Launch-Relevanz priorisieren |
| `core/05-escalation-rules.md` | Eskalationskriterien und -prozesse |
| `core/06-definition-of-done.md` | Abschlusskriterien für alle Bereiche |
| `core/core-orchestrator-agent.md` | Legacy-Bridge zur neuen Core-Struktur |

### Engineering (`engineering/` — 12 Agenten)
`coding`, `debug`, `refactor`, `frontend`, `backend`, `api`, `integration`, `platform`, `performance`, `state-management`, `desktop-runtime`, `engineering-implementer`

### Architecture (`architecture/` — 6 Agenten)
`architecture-designer`, `data-architecture`, `domain-model`, `modularity`, `scalability`, `system-architecture`

### Product (`product/` — 8 Agenten)
`product-strategy`, `pricing`, `product-website`, `onboarding`, `conversion-copy`, `growth-experiment`, `feature-prioritization`, `user-feedback`

### Delivery (`delivery/` — 7 Agenten)
`release`, `build`, `cicd`, `quality-gate`, `versioning`, `recovery`, `delivery-manager`

### Quality (`quality/` — 7 Agenten)
`qa`, `quality-assurance`, `security`, `compliance`, `access-control`, `test-automation`, `regression`

### Context (`context/` — 8 Agenten)
`context-manager`, `context-sync`, `deep-snapshot`, `snapshot`, `changelog-sync`, `knowledge-base`, `dependency`, `repo-audit`

### Launch (`launch/` — 4 Agenten)
`launch-readiness`, `beta-rollout`, `closed-alpha`, `feedback-triage`

### Desktop (`desktop/` — 5 Agenten)
`desktop-experience`, `desktop-qa`, `exe-release`, `installer`, `updater`

### Alpha (`alpha/` — 4 Agenten)
`bug-intake`, `tester-feedback`, `tester-onboarding`, `alpha-experiments`

### Analytics (`analytics/` — 5 Agenten)
`metrics`, `kpi-review`, `telemetry`, `funnel`, `analytics-insights`

### Documentation (`documentation/` — 5 Agenten)
`docs`, `documentation-writer`, `architecture-doc`, `release-notes`, `status-report`

### Governance (`governance/` — 5 Agenten)
`risk`, `decision-log`, `change-control`, `governance-compliance`, `roadmap-governance`

### Stakeholder (`stakeholder/` — 4 Agenten)
`founder-briefing`, `investor-update`, `internal-sync`, `stakeholder-communication`

### Workflow (`workflow/` — 5 Agenten)
`automation-orchestrator`, `workflow-optimization`, `workflow-hardening`, `task-routing-auditor`, `self-improvement`

### Automation (`automation/` — 5 Agenten)
`github-sync`, `workflow-dispatch`, `repository-dispatch`, `dependabot-maintenance`, `automation-operator`

### Templates (`templates/` — 7 Dateien)
`alpha-feedback`, `decision-log`, `integration-checklist`, `release-checklist`, `risk-register`, `status-report`, `template-curation`

### Prompts (`prompts/` — 6 Dateien)
`activation-prompt.txt`, `master-integration-prompt.txt`, `deep-analysis-prompt.txt`, `github-sync-prompt.txt`, `self-heal-prompt.txt`, `prompt-engineering-agent.md`

---

## Maschinenlesbarer Index

Vollständige Agentenliste mit Metadaten:
`.godai/agents/github/agent-index.json` (98 Agenten, generiert 2026-03-11)

Gesamtmanifest:
`.godai/agents/MANIFEST.json` (Version 1.0.0)

Update-Policy:
`.godai/agents/github/update-policy.json`

---

## Wichtige Prompts

| Datei | Einsatz |
|-------|---------|
| `.godai/agents/prompts/activation-prompt.txt` | Standard-Einstieg für TriggerHub-Tasks |
| `.godai/agents/prompts/master-integration-prompt.txt` | Komplexe Tasks über alle Systeme |
| `.godai/agents/prompts/deep-analysis-prompt.txt` | Tiefe Problemanalyse |
| `.godai/agents/prompts/github-sync-prompt.txt` | Agentenbibliothek → GitHub-Metadaten synchronisieren |
| `.godai/agents/prompts/self-heal-prompt.txt` | Agentensystem-Drift erkennen und beheben |

---

## Konsistenzregeln

Bei Änderungen am `.godai/agents`-System müssen aktualisiert werden:
- `.godai/agents/MANIFEST.json`
- `.godai/agents/github/agent-index.json`
- `.godai/agents/CHANGELOG.md`

CI-Validierung: `.github/workflows/godai-validation.yml`

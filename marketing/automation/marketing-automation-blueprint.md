# Marketing Automation Blueprint

## Agents
- Orchestrator
- Product
- Implementation
- Ops
- Docs

## Ziel
Design a marketing automation architecture for TriggerHub that fits the existing agent system, current repo tooling, and early-stage product reality.

## Projektanalyse
- TriggerHub already has a structured multi-agent system, project-context working memory, local scripts, release flows, and website content sync.
- The project is still in an early product stage, so automation should optimize for assisted operations and draft generation, not fully autonomous publishing.
- Marketing automation fits best as a coordination layer around existing project signals: releases, feature changes, waitlist events, and weekly metrics.

## Orchestrator Output

### Where Marketing Automation Fits
Marketing automation should sit as a cross-functional layer between:
- source signals from product and engineering work
- agent-based interpretation and draft generation
- local scripts that transform structured repo data
- external workflow tools for delivery, CRM, and notifications

### Role In The Agent System
- Orchestrator coordinates marketing automations when source events affect messaging, waitlist operations, or reporting.
- Product defines the interpretation rules: what matters, what is safe to say, and what should stay internal.
- Implementation defines the pipeline inputs, artifact outputs, and folder conventions.
- Ops decides which automations stay local and which belong in external SaaS workflows.
- Docs keeps the blueprint and project context current so automations remain understandable and auditable.

### Priorisierte Tasks
1. Formalize the automation use cases that already map well to TriggerHub workflows.
2. Define artifact-first pipelines so outputs land in versioned markdown files instead of disappearing into chats.
3. Separate agent-driven interpretation from script-driven transformation and external workflow execution.
4. Prioritize low-risk draft and reporting automations before anything user-facing or public-posting.

## Product Agent Output

### Automation Use Cases

#### 1. Release update -> social post draft
- Purpose: turn a confirmed release or changelog delta into a safe draft for social and website content.
- Product rule: only use merged, documented, and approved release facts.
- Best output: draft markdown in `marketing/post-drafts/` plus optional website sync input.

#### 2. Feature change -> content idea
- Purpose: convert meaningful product or engineering changes into new backlog ideas.
- Product rule: only generate `safe_now` ideas from implemented changes; roadmap-only changes must be labeled accordingly.
- Best output: appendable backlog items in `marketing/content-ideas/`.

#### 3. Waitlist signup -> lead segmentation
- Purpose: classify incoming leads into closed alpha, early access, research, or nurture buckets.
- Product rule: prioritize workflow pain clarity, Windows fit, and expectation realism over volume.
- Best output: structured lead record plus segment decision.

#### 4. Weekly metrics -> performance report
- Purpose: summarize top-of-funnel and activation quality for the team each week.
- Product rule: optimize around qualified leads, Discord activation, and first feedback, not vanity impressions alone.
- Best output: weekly markdown report in `marketing/analytics/`.

## Implementation Agent Output

### Automation Pipeline Design

#### Pipeline A: Release Update -> Social Post Draft
- Trigger:
  - release artifact collected
  - changelog updated
  - release workflow completed
- Input Data:
  - `agent/agents/project-context/changelog.md`
  - release metadata
  - approved messaging from `marketing/messaging/messaging-core.md`
- Processing Logic:
  1. detect latest release notes delta
  2. extract user-relevant changes
  3. map changes to safe proof angles
  4. generate channel draft variants
- Output Artifacts:
  - `marketing/post-drafts/release-update-{date}.md`
  - optional website-ready summary input

#### Pipeline B: Feature Change -> Content Idea
- Trigger:
  - feature watcher output
  - merged implementation note
  - updated implementation status
- Input Data:
  - `docs/ai-context/IMPLEMENTATION_STATUS.md`
  - `scripts/feature-change-watcher.ts` output
  - `marketing/messaging/messaging-core.md`
- Processing Logic:
  1. detect meaningful product-facing change
  2. classify as `safe_now`, `vision_only`, or blocked
  3. map change to a content series
  4. draft a backlog entry template
- Output Artifacts:
  - new entry in `marketing/content-ideas/content-backlog.md`
  - optional queue note in `marketing/content-ideas/content-series.md`

#### Pipeline C: Waitlist Signup -> Lead Segmentation
- Trigger:
  - waitlist form submission
- Input Data:
  - waitlist fields from `marketing/waitlist/waitlist-form-spec.md`
  - segmentation rules from `marketing/waitlist/lead-segmentation.md`
  - alpha criteria from `marketing/waitlist/alpha-application-questions.md`
- Processing Logic:
  1. assign `lead_id`
  2. score workflow clarity, Windows fit, technical comfort, and expectation fit
  3. assign segment A/B/C/D
  4. determine next step: invite, application, nurture, hold
- Output Artifacts:
  - lead record in CRM/spreadsheet/database
  - lifecycle update in analytics system
  - optional Discord invite queue for accepted leads

#### Pipeline D: Weekly Metrics -> Performance Report
- Trigger:
  - scheduled weekly run
- Input Data:
  - event data from `marketing/analytics/marketing-events-spec.md`
  - lead stage updates
  - content campaign metadata
- Processing Logic:
  1. aggregate weekly funnel and activation metrics
  2. compare channel quality and conversion quality
  3. extract notable wins, drop-offs, and experiments
  4. generate human-readable summary with next actions
- Output Artifacts:
  - `marketing/analytics/weekly-report-{yyyy-mm-dd}.md`
  - optional digest posted to team Discord or notes channel

## Ops Agent Output

### Recommended Automation Ownership

#### Best handled by the agent system
- release summary interpretation
- feature-to-content idea generation
- draft performance narrative generation
- claim-safety validation before content moves downstream

Reason:
These tasks require contextual judgment, messaging discipline, and reference to project state.

#### Best handled by local scripts
- reading changelog diffs
- detecting feature-change file deltas
- generating structured markdown stubs
- aggregating weekly local metrics exports
- preparing website-sync inputs

Reason:
These tasks are deterministic, repo-local, and easy to rerun.

#### Best handled by external workflow tools
- waitlist form capture
- CRM or spreadsheet updates
- Discord invite sending
- email notifications
- scheduled trigger execution
- web analytics collection

Reason:
These depend on external user events, webhooks, hosted forms, or team communication channels.

### Recommended Stack
- Agent system:
  - orchestrator + product + implementation + ops + docs
- Local scripts:
  - existing `scripts/feature-change-watcher.ts`
  - existing `scripts/generate-website-content.ts`
  - future `scripts/generate-marketing-draft.ts`
  - future `scripts/generate-weekly-marketing-report.ts`
- External tools:
  - waitlist form provider
  - Airtable / Notion / Google Sheets as lightweight CRM
  - Discord for onboarding and internal alerts
  - analytics source such as Plausible, PostHog, or simple event warehouse
  - automation relay such as Zapier, Make, or n8n if webhook routing is needed

## Automation Architecture

### Layer Model
1. Source Signals Layer
- release outputs
- feature changes
- waitlist submissions
- weekly analytics exports

2. Interpretation Layer
- agent system reads source signals and applies product-safe rules

3. Transformation Layer
- local scripts convert signals into structured markdown, CSV, or JSON artifacts

4. Delivery Layer
- external tools distribute outputs to CRM, Discord, dashboards, or draft workspaces

5. Review Layer
- human review approves anything externally visible

### Flow Diagram
```text
Repo / Forms / Analytics
        |
        v
Source Signal Detected
        |
        v
Orchestrator routes task
        |
        +--> Product agent applies messaging and claim rules
        |
        +--> Implementation agent defines artifact format
        |
        +--> Ops selects execution path
        v
Local script or external workflow runs
        |
        v
Artifact written to marketing/ or lead system
        |
        v
Human review / approval
        |
        v
Publish, invite, report, or hold
```

## Priority List
1. Feature change -> content idea
Reason: lowest risk, directly useful, and fits existing watcher patterns.

2. Weekly metrics -> performance report
Reason: strengthens decision quality without public claim risk.

3. Release update -> social post draft
Reason: useful and bounded, but requires stronger release hygiene.

4. Waitlist signup -> lead segmentation
Reason: highest operational value, but depends on external forms, tracking, and CRM setup.

## Operating Rules
- Do not autopublish public content.
- Keep every automation artifact reviewable in files or structured systems.
- Separate “draft generation” from “distribution”.
- Always check messaging against current implementation status before external use.
- Prefer low-complexity workflows over broad automation sprawl.

## Recommendation
Start with a hybrid model:
- agents for interpretation
- local scripts for repo-based transformations
- external tools only for form/webhook-driven operational steps

This matches TriggerHub's current maturity and avoids building a fragile marketing automation stack before the product and GTM surfaces stabilize.

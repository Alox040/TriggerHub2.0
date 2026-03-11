# Marketing Operations Workspace

## Purpose
This folder is the operating layer for TriggerHub marketing work. It translates the current product reality into reusable messaging, campaigns, content, waitlist operations, analytics, and automation assets.

## Current Product Stage
TriggerHub should currently be marketed as an early-stage Windows desktop automation product for creators and streamers:
- core trigger and macro logic exists
- desktop packaging exists
- dashboard runtime connection is partially working
- real service integrations and broader product UX are still incomplete

Do not market TriggerHub as fully production-ready, fully integrated with OBS/Spotify, or as a live plugin marketplace.

## Folder Guide
- `messaging/`: source of truth for positioning, segments, and approved claims
- `content-ideas/`: backlog of themes, hooks, and educational content
- `post-drafts/`: channel-ready draft posts based on approved messaging
- `scripts/`: demo, video, and outreach scripts
- `assets/`: asset requests, inventory, and production notes
- `campaigns/`: campaign briefs and launch checklists
- `analytics/`: KPI definitions, experiments, and reporting templates
- `waitlist/`: signup flow, nurture plan, and qualification notes
- `automation/`: internal marketing workflows and handoff maps

## How To Add Content
1. Start in `messaging/messaging-core.md` and verify the claim is already allowed.
2. Add the idea or request in the relevant template folder.
3. Draft channel-specific content only after the message matches the approved positioning.
4. Record assumptions when a claim depends on planned but unshipped functionality.
5. Run a QA pass against `docs/ai-context/IMPLEMENTATION_STATUS.md` before publishing.

## Agent Workflow Integration
- Orchestrator Agent scopes marketing work and routes tasks across product, implementation, docs, and QA.
- Product Agent maintains messaging truth and claim boundaries.
- Implementation Agent creates or updates the operational templates in this workspace.
- Docs Agent keeps instructions and project-context aligned.
- QA Agent validates that messaging still matches the real implementation state.

## Source References
- `docs/triggerhub_gesamtuebersicht.md`
- `docs/ai-context/PROJECT_SNAPSHOT.md`
- `docs/ai-context/IMPLEMENTATION_STATUS.md`
- `docs/ai-context/NEXT_STEPS_ROADMAP.md`
- `docs/ai-context/AGENT_AND_PROMPT_SYSTEM.md`

# Content Sync Flows

## Agents
- Orchestrator
- Implementation
- Ops
- Docs

## Ziel
Document how marketing content generation should integrate with the existing Content Sync Agent and Release Agent without creating parallel release or publishing workflows.

## Orchestrator Analysis

### Existing Agent Roles
#### 20 Content Sync Agent
- Source of truth is structured public project metadata plus public-safe release data.
- Generates website-ready content artifacts under `website/src/content/generated/`.
- Owns public website content synchronization, not social or community content generation.

#### 30 Release Agent
- Runs the website sync step first.
- Validates generated website content.
- Performs release checks and publication steps.
- Owns release execution and deployment, not marketing interpretation.

### Integration Position
Marketing content generation should sit upstream and adjacent to these agents:
- upstream of release publishing for draft generation
- adjacent to website sync for public-safe derivative content
- downstream of product and implementation signals for content ideation

The Release Agent remains the release authority. The Content Sync Agent remains the website content authority. Marketing automation adds derivative marketing artifacts around those outputs.

## Full Pipeline Descriptions

### Flow 1: Feature Update -> Content Idea -> Social Draft -> Discord Announcement

#### Purpose
Turn meaningful product-facing changes into marketing-ready internal artifacts without claiming more than the implementation status supports.

#### Trigger
- meaningful git commit on product-facing code or docs
- feature watcher detects a change
- implementation status or project snapshot is updated

#### Source Inputs
- `scripts/feature-change-watcher.ts`
- `docs/ai-context/IMPLEMENTATION_STATUS.md`
- `docs/ai-context/PROJECT_SNAPSHOT.md`
- `marketing/messaging/messaging-core.md`
- `marketing/content-ideas/content-backlog.md`

#### Pipeline Steps
1. Source Detection
   - a git commit or watcher output flags a product-facing change

2. Orchestrator Routing
   - Orchestrator determines whether the change is public-facing enough to justify marketing artifacts

3. Content Idea Generation
   - Implementation-oriented marketing pipeline creates or proposes a new idea in `marketing/content-ideas/content-backlog.md`
   - label as `safe_now`, `vision_only`, or blocked based on current implementation truth

4. Social Draft Preparation
   - create a draft in `marketing/post-drafts/feature-update-{date}.md`
   - include hook, proof points, blocked claims, and CTA

5. Discord Announcement Preparation
   - create a shorter internal/community-ready announcement draft in `marketing/post-drafts/discord-feature-update-{date}.md`
   - keep this scoped to what actually changed and why it matters

6. Review Gate
   - verify against `marketing/messaging/messaging-core.md`
   - confirm no unimplemented integrations or UX flows are implied

#### Output Artifacts
- updated `marketing/content-ideas/content-backlog.md`
- `marketing/post-drafts/feature-update-{date}.md`
- `marketing/post-drafts/discord-feature-update-{date}.md`

#### Notes
- This flow should not write directly to website generated JSON.
- If the feature update changes public website positioning, hand off to the Content Sync Agent instead of patching website content manually.

### Flow 2: Release -> Website Changelog -> Social Thread -> Demo Script

#### Purpose
Use the existing release pipeline as the confirmed signal for public-facing marketing outputs.

#### Trigger
- release tag created
- release workflow started or completed
- release manifest and changelog source updated

#### Source Inputs
- `releases/release-manifest.json`
- `releases/changelog-source.json`
- `agents/project-context/changelog.md`
- `website/src/content/generated/changelog.json`
- `marketing/messaging/messaging-core.md`

#### Pipeline Steps
1. Release Signal
   - Release Agent begins release workflow

2. Website Changelog Sync
   - Content Sync Agent generates or updates `website/src/content/generated/changelog.json`
   - Release Agent validates website content and treats it as the public changelog basis

3. Social Thread Draft
   - marketing pipeline reads validated release deltas
   - generates `marketing/post-drafts/release-thread-{version}.md`
   - include:
     - short opener
     - 3 to 5 concrete user-relevant changes
     - early-stage framing where appropriate
     - CTA to follow, test, or join waitlist

4. Demo Script Draft
   - generate `marketing/scripts/release-demo-{version}.md`
   - focus on the clearest demonstrable improvement from the release
   - avoid implying broader feature completion than the release actually contains

5. Optional Discord Release Announcement
   - generate `marketing/post-drafts/discord-release-{version}.md`
   - optimized for alpha testers or community members already following the project

6. Review Gate
   - use only validated release facts
   - no extrapolated roadmap promises
   - if release touches partially implemented areas, describe the delta narrowly

#### Output Artifacts
- existing website changelog via Content Sync Agent
- `marketing/post-drafts/release-thread-{version}.md`
- `marketing/scripts/release-demo-{version}.md`
- optional `marketing/post-drafts/discord-release-{version}.md`

#### Notes
- Release Agent remains responsible for publishing the release.
- Marketing artifacts are derivative outputs that should never outrun the validated release record.

## Ops Trigger Model

### Git Commits
Use for:
- feature update detection
- internal content-idea generation candidates

Recommended handling:
- local watcher script inspects changed files and commit metadata
- do not generate public drafts from every commit
- only escalate commits that materially affect user-facing behavior or positioning

### Release Tags
Use for:
- release-driven marketing generation
- social thread draft creation
- demo script creation
- Discord release announcement preparation

Recommended handling:
- bind release marketing generation to the same event that starts or completes the Release Agent workflow
- only generate website-facing release content after Content Sync validation

### Snapshot Updates
Use for:
- periodic backlog refresh
- weekly or milestone-level messaging recalibration
- content safety review when implementation maturity changes

Recommended handling:
- when `PROJECT_SNAPSHOT.md` or related AI-context docs change materially, review whether content backlog labels or draft claims need updates
- snapshot updates are better for backlog maintenance than for immediate publish actions

## Recommended Automation Ownership

### Agent System
- decide if a code or release event is marketing-relevant
- interpret what is safe to say
- route work between marketing artifacts, website sync, and release outputs

### Local Scripts
- watch feature changes
- diff changelog sources
- generate markdown draft stubs for posts and scripts
- prepare structured handoff data for website sync

### External Workflow Tools
- optional Discord webhook delivery
- optional social scheduling tooling
- optional notifications when new drafts are generated

## Flow Diagram
```text
Git Commit / Release Tag / Snapshot Update
                  |
                  v
         Orchestrator decides relevance
                  |
        +---------+----------+
        |                    |
        v                    v
Feature-update path     Release path
        |                    |
        v                    v
Content idea draft      Content Sync Agent updates website changelog
        |                    |
        v                    v
Social draft            Release Agent validates and publishes release
        |                    |
        v                    v
Discord draft           Social thread + demo script draft
        |                    |
        +---------+----------+
                  |
                  v
            Human review gate
                  |
                  v
     Publish / schedule / hold for later
```

## Guardrails
- Do not bypass the Content Sync Agent for website generated content.
- Do not bypass the Release Agent for release publication.
- Do not generate public-facing drafts from unvalidated implementation assumptions.
- Treat Discord announcements as community communication, not proof of production readiness.
- Keep all generated marketing artifacts reviewable in `marketing/`.

## Recommendation
Start with two bounded integrations:
1. `feature update -> content idea -> social draft -> Discord announcement`
2. `release -> website changelog -> social thread -> demo script`

These align with the existing agent system, reuse current scripts and release flows, and create a clean bridge between product signals and marketing outputs without merging unrelated responsibilities.

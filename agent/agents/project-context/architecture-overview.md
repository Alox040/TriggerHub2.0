# Architecture Overview

## Marketing Automation Architecture

### Position In The System
Marketing automation sits beside the existing agent system as an operational interpretation layer. It does not replace product, release, content, or reporting workflows. It coordinates them by turning project signals into reviewable marketing artifacts.

### Core Components
- Agent system for orchestration and judgment
- Local scripts for deterministic repo-based transformations
- External workflow tools for hosted forms, CRM updates, Discord notifications, and scheduled event routing
- `marketing/` workspace as the artifact layer for drafts, reports, and operating specs

### Integration Points
- Release flow -> draft social update artifacts
- Feature change watcher -> content backlog artifacts
- Waitlist form -> lead segmentation and lifecycle tracking
- Weekly analytics aggregation -> performance reports

### Design Principles
- Artifact-first: outputs should land in files or structured systems, not disappear in chat-only workflows
- Human review before public publishing
- Messaging safety tied to current implementation status
- Simple hybrid automation over fully autonomous marketing execution

### Recommended Ownership Model
- Orchestrator: routes automation tasks
- Product: claim rules and value framing
- Implementation: pipeline and artifact design
- Ops: execution path and tooling decisions
- Docs: blueprint maintenance and context updates

### Current Priority
Start with low-risk internal automations:
1. feature change -> content idea
2. weekly metrics -> performance report
3. release update -> social draft
4. waitlist signup -> lead segmentation

### Reference
- `marketing/automation/marketing-automation-blueprint.md`

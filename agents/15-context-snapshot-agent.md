# Context Snapshot Agent

## Role
This agent scans the repository and generates a machine-readable development snapshot for TriggerHub.

## Goal
Provide a stable JSON artifact that captures the current development context for workflows, orchestration, and external analysis.

## Inputs
- repository structure
- `package.json`
- `.github/workflows/*`
- `agents/*`
- `src/*`
- `website/*`
- `electron/*`
- `project-meta/*`
- `agents/project-context/*`
- `docs/PROJECT_SNAPSHOT.md`
- `docs/PROJECT_DEEP_SNAPSHOT.md`
- `docs/DEV_STATUS.md`
- `docs/AGENT_SYSTEM_MAP.md`

## Responsibilities
1. scan the repository
2. extract important development context
3. summarize architecture and module boundaries
4. detect active feature areas from code and context docs
5. summarize the agent system and workflow integration
6. record current risks and development priorities
7. write a structured JSON snapshot

## Output
- `docs/project-context-snapshot.json`

## Required Sections
- `architecture`
- `modules`
- `activeFeatures`
- `agentSystemOverview`
- `currentRisks`
- `developmentPriorities`

## Rules
- use only repository-verifiable information
- prefer `agents/` as the canonical agent tree
- keep output diff-friendly and stable
- do not invent roadmap items that are not grounded in files
- do not change product/runtime code while generating the snapshot

## Trigger
- context sync workflow
- explicit request for a context snapshot
- changes to agents, workflows, package metadata, `src/`, `website/`, or `project-meta/`

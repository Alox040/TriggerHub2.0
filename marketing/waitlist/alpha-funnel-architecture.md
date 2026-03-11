# TriggerHub Early-Access Funnel Architecture

## Agents
- Orchestrator
- Product
- Docs

## Ziel
Design a closed-alpha and early-access funnel that attracts technically suitable creator testers without overstating TriggerHub's current product maturity.

## Projektanalyse
- TriggerHub has credible technical proof in its trigger engine, macro engine, desktop packaging, partially connected dashboard, and plugin registry groundwork.
- The current risk profile still includes no Electron IPC bridge, no production-ready real OBS/Spotify integrations, no real clip capture flow, no persistence, and scaffold-only editor/settings/plugin pages.
- The funnel must therefore optimize for selective recruitment, expectation setting, and feedback quality instead of broad top-of-funnel volume.

## Priorisierte Tasks
1. Define who the right early adopters are and what pain qualifies them.
2. Build a waitlist and alpha application flow that filters for technically comfortable Windows creators.
3. Route accepted leads into a guided Discord onboarding process for feedback and support.
4. Track conversion and qualification events without implying a public launch state.
5. QA-check all funnel copy and logic against the current closed-alpha maturity.

## Zustaendige Agenten
- Orchestrator: funnel structure, sequence, acceptance criteria
- Product: personas, pain points, alpha value proposition
- Implementation: waitlist docs, selection criteria, onboarding flow
- Ops: events, metrics, lead tracking logic
- Docs: architecture and operating instructions
- QA: phase alignment review

## Funnel Stages
1. Awareness
Creators encounter TriggerHub through build-in-public content, alpha recruitment posts, and workflow pain narratives.

2. Waitlist Capture
Interested creators submit a short form optimized for signal, not volume. The form emphasizes Windows usage, workflow complexity, and willingness to test early software.

3. Qualification
Applicants are scored based on workflow pain, technical comfort, stack fit, and feedback quality. High-fit applicants move to the alpha application review.

4. Alpha Selection
Selected creators receive Discord onboarding and explicit expectations: early-stage desktop product, evolving integrations, and active feedback requirements.

5. Discord Activation
Accepted testers join Discord, confirm setup details, review alpha rules, and receive structured guidance for reporting issues and sharing workflows.

6. Feedback Loop
Insights from Discord and funnel analytics feed back into product prioritization, messaging refinement, and future early-access expansion.

## Product Agent Output

### Early Adopter Personas
#### 1. Workflow-heavy solo streamer
- Runs streams on Windows with repeated manual switching between tools.
- Comfortable trying unfinished software if the workflow payoff is clear.
- Values time savings and consistency more than polished breadth.

#### 2. Technical creator operator
- Uses hotkeys, macros, or custom setups already and understands workflow bottlenecks.
- More likely to describe bugs precisely and tolerate setup friction.
- Strong fit for closed alpha because they can compare TriggerHub to current workaround stacks.

#### 3. Experiment-friendly power creator
- Small but serious creator who wants operational leverage, not just content editing tools.
- Interested in shaping workflow tooling early if their use case is heard.
- Best suited for early access after closed-alpha patterns stabilize.

### Alpha Tester Profile
- Uses Windows as the main operating system.
- Has a repeatable live or creator workflow with real friction today.
- Can clearly describe their current tool stack and failure points.
- Is willing to test a prototype with rough edges and incomplete integrations.
- Can provide structured feedback in Discord within days, not weeks.

### Main Creator Pain Points
- Too many repeated steps across multiple creator tools.
- High risk of mistakes during live sessions because workflows are manual and scattered.
- Hotkeys and fragmented workarounds stop scaling as workflow complexity grows.
- Low visibility into what happened, what fired, and what failed across a creator setup.

### Value Proposition For Alpha Testers
- Direct influence on how TriggerHub evolves before workflows are locked in.
- Early access to a real trigger-and-macro desktop foundation rather than another button-only control layer.
- Faster iteration because the product is still close to core architecture decisions and workflow design.
- A feedback channel where real creator workflow pain directly affects prioritization.

## Acceptance Criteria
- Funnel positioning remains closed alpha / early access only.
- Waitlist capture prioritizes qualification signal over list size.
- Discord onboarding includes expectation setting and feedback structure.
- Analytics cover awareness, submission, qualification, invite, activation, and feedback milestones.
- No funnel asset suggests a feature-complete public product.

## Naechste Schritte
Use the supporting waitlist and analytics specs in this folder to turn the architecture into forms, outreach, and onboarding operations.

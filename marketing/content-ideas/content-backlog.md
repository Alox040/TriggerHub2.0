# TriggerHub Content Backlog

## Agent
Product Agent

## Purpose
Build-in-public content ideas for TriggerHub grouped into four repeatable series. Every entry includes a claim safety label so marketing can separate publishable proof from future-facing or blocked claims.

## Claim Safety Levels
- `safe_now`: matches the current documented implementation state
- `vision_only`: acceptable only when clearly framed as roadmap or product direction
- `not_publishable`: useful for internal ideation, not for external publication right now

## Series 1: Dev Log

### 1. Dev Log
- Title: From mock dashboard to real runtime data
- Hook: TriggerHub stopped being just a concept the moment the dashboard began loading real runtime state.
- Platform: LinkedIn, X, founder update blog
- Content Outline:
  1. Explain the move from mock-driven UI to `AppFacade`-driven reads.
  2. Show what the dashboard now reflects: triggers, macros, and service connection state.
  3. Be explicit that some live refresh paths are wired but not fully complete yet.
- CTA: Follow TriggerHub if you want to watch the desktop automation layer get connected piece by piece.
- Claim Safety Level: safe_now

### 2. Dev Log
- Title: Why TriggerHub starts with triggers and macros, not a marketplace
- Hook: We are deliberately building the boring core before the flashy ecosystem layer.
- Platform: LinkedIn, blog, newsletter
- Content Outline:
  1. Explain why workflow logic is the moat.
  2. Describe the implemented trigger engine and macro system as the current foundation.
  3. State that marketplace and plugin distribution come later.
- CTA: Join the waitlist if you care more about reliable workflow automation than feature theater.
- Claim Safety Level: safe_now

### 3. Dev Log
- Title: Packaging the prototype into a Windows desktop app
- Hook: A creator tool becomes more real when it installs like software instead of living only in a dev server.
- Platform: X thread, LinkedIn, short founder video
- Content Outline:
  1. Show that TriggerHub already ships through Electron plus NSIS packaging.
  2. Explain why desktop delivery matters for creator workflows.
  3. Clarify that packaging maturity is ahead of integration maturity.
- CTA: Want to test a Windows desktop automation build early? Join the alpha list.
- Claim Safety Level: safe_now

### 4. Dev Log
- Title: What the current TriggerHub architecture already gets right
- Hook: The fastest way to ship unstable creator software is to ignore architecture until integrations start breaking.
- Platform: Dev blog, LinkedIn
- Content Outline:
  1. Summarize the clean core, service adapters, and app facade boundary.
  2. Connect architecture choices to future integration speed.
  3. Keep the language technical but grounded in creator outcomes.
- CTA: Follow for more build-in-public notes on turning architecture into actual creator value.
- Claim Safety Level: safe_now

### 5. Dev Log
- Title: The hard truth: UI progress is ahead of polished workflows, not finished UX
- Hook: A lot of early products fake maturity by showing polished screens and hiding the gaps. We are doing the opposite.
- Platform: LinkedIn, X
- Content Outline:
  1. Share that dashboard connectivity improved.
  2. State that editor, plugins, and settings pages are still scaffold-level.
  3. Explain why honest status updates build better alpha expectations.
- CTA: If you want transparent early access instead of inflated launch copy, join the waitlist.
- Claim Safety Level: safe_now

### 6. Dev Log
- Title: Why we treat live creator workflows as a reliability problem first
- Hook: A stream automation tool is useless if it works only in perfect conditions.
- Platform: LinkedIn, blog
- Content Outline:
  1. Highlight retry, timeout, and policy layers in the service design.
  2. Explain that real-world integrations still need hardening.
  3. Position reliability as a product promise still being earned.
- CTA: Tell us which failure case would make you stop trusting an automation tool.
- Claim Safety Level: safe_now

### 7. Dev Log
- Title: Building for plugin extensibility before building the plugin hype
- Hook: It is easy to say “plugin-ready.” It is harder to ship the boring foundations that make extensibility real.
- Platform: LinkedIn, blog, developer community post
- Content Outline:
  1. Describe the current plugin registry and example plugin.
  2. Clarify that there is no marketplace or installation flow yet.
  3. Frame extensibility as a direction, not a launch feature.
- CTA: Follow if you want to see how we turn a plugin foundation into a real creator ecosystem later.
- Claim Safety Level: safe_now

### 8. Dev Log
- Title: The next blocker is not another feature, it is the Electron IPC bridge
- Hook: Sometimes the highest-leverage milestone is an invisible systems task that unlocks everything else.
- Platform: X, LinkedIn, dev log
- Content Outline:
  1. Explain what IPC unlocks: hotkeys, window control, filesystem, update flows.
  2. Tie the blocker to product usefulness.
  3. Share why this sits ahead of more surface-level polish.
- CTA: Follow the build if you want to see the unglamorous technical work behind creator tools.
- Claim Safety Level: safe_now

## Series 2: Automation Demo

### 9. Automation Demo
- Title: What a trigger-first creator workflow looks like
- Hook: Most creator tools show buttons. We want to show repeatable logic.
- Platform: Short video, X, LinkedIn
- Content Outline:
  1. Explain the event -> condition -> action model.
  2. Use a conceptual example instead of claiming a finished OBS production flow.
  3. Show why trigger thinking is more reusable than one-off controls.
- CTA: Follow for more examples of creator workflows translated into automation logic.
- Claim Safety Level: safe_now

### 10. Automation Demo
- Title: Clicking a TriggerCard now fires the real engine
- Hook: One small UI interaction matters when it stops being cosmetic and starts hitting the actual runtime.
- Platform: X clip, LinkedIn video, dev reel
- Content Outline:
  1. Show a trigger card click.
  2. Explain that it dispatches through the app facade into the real trigger engine.
  3. Avoid claiming full end-to-end real-world external integrations.
- CTA: Join the alpha list if you want early access to the runtime as the workflow layer matures.
- Claim Safety Level: safe_now

### 11. Automation Demo
- Title: Desktop automation without app switching
- Hook: The real promise is fewer frantic alt-tabs during a live session.
- Platform: Short form video, LinkedIn
- Content Outline:
  1. Frame the problem of switching between creator tools.
  2. Show how TriggerHub is being built as the desktop coordination layer.
  3. Be clear that some integrations are simulated today.
- CTA: What tool-switching sequence wastes the most time in your setup? Reply and tell us.
- Claim Safety Level: safe_now

### 12. Automation Demo
- Title: A concept demo of scene plus music plus clip chaining
- Hook: This is the kind of chained creator workflow TriggerHub is being built for.
- Platform: X thread, storyboard post, blog
- Content Outline:
  1. Describe the multi-step workflow idea.
  2. Label it clearly as a roadmap or vision demo, not a shipped feature.
  3. Explain what must be completed before it is truly production-ready.
- CTA: If this workflow matches how you stream, join the alpha waitlist and tell us your exact stack.
- Claim Safety Level: vision_only

### 13. Automation Demo
- Title: Why macro depth matters more than more buttons
- Hook: Repeated creator work is rarely one action. It is usually a chain.
- Platform: LinkedIn, X, founder note
- Content Outline:
  1. Explain sequential and nested macro logic at a high level.
  2. Tie it to creator use cases.
  3. Keep examples generic enough to avoid implying unshipped integrations.
- CTA: Follow if you want more examples of creator workflows broken down into macro logic.
- Claim Safety Level: safe_now

### 14. Automation Demo
- Title: Dashboard state as an automation control surface
- Hook: A useful creator dashboard should show what the runtime knows, not just what the UI designer imagined.
- Platform: LinkedIn, blog
- Content Outline:
  1. Show that the dashboard loads real trigger and macro data.
  2. Mention connection state visibility for OBS and Spotify services.
  3. Clarify that “connected” UI does not mean fully production-ready external auth and transport coverage.
- CTA: Join the waitlist if you want to test the desktop control layer early.
- Claim Safety Level: safe_now

### 15. Automation Demo
- Title: Live OBS control from TriggerHub today
- Hook: Change scenes from one desktop hub without touching OBS directly.
- Platform: Short video, X
- Content Outline:
  1. Present a scene-switch demo as if it is already production-ready.
  2. Position OBS control as stable and fully integrated.
  3. Invite creators to switch immediately.
- CTA: Download the app and control OBS now.
- Claim Safety Level: not_publishable

### 16. Automation Demo
- Title: What a future plugin-powered workflow library could unlock
- Hook: The endgame is not just one app. It is reusable creator workflow building blocks.
- Platform: LinkedIn, blog, roadmap thread
- Content Outline:
  1. Describe a future where plugins add new workflow capabilities.
  2. Tie the idea to the current plugin registry groundwork.
  3. Explicitly frame this as future direction rather than present availability.
- CTA: Follow if you want to help shape which plugin workflows would matter first.
- Claim Safety Level: vision_only

## Series 3: Creator Problem

### 17. Creator Problem
- Title: Streamers do not need more tabs, they need fewer repeated decisions
- Hook: Most live workflow pain is not lack of tools. It is too many tiny actions under pressure.
- Platform: LinkedIn, X, creator community post
- Content Outline:
  1. Describe repetitive creator handoffs and tool switching.
  2. Position TriggerHub around workflow reduction rather than novelty.
  3. Invite examples from real creators.
- CTA: What repeated live sequence would you automate first?
- Claim Safety Level: safe_now

### 18. Creator Problem
- Title: Manual stream workflows fail at the worst possible moment
- Hook: If a workflow breaks during a live moment, the audience does not care which tab caused it.
- Platform: LinkedIn, newsletter, X
- Content Outline:
  1. Talk about reliability pressure during live production.
  2. Connect that pressure to TriggerHub’s focus on repeatable logic and reliability layers.
  3. Avoid presenting reliability as already fully proven in production.
- CTA: Reply with the one manual live task that feels most fragile in your setup.
- Claim Safety Level: safe_now

### 19. Creator Problem
- Title: Why “just use hotkeys” stops scaling
- Hook: Hotkeys are useful until your workflow becomes a private memory test.
- Platform: X thread, LinkedIn
- Content Outline:
  1. Explain the limits of scattered shortcut-based setups.
  2. Position trigger and macro logic as a more explicit workflow layer.
  3. Keep the message conceptual and grounded in today’s implemented core.
- CTA: If you have a shortcut stack you barely trust anymore, tell us what broke first.
- Claim Safety Level: safe_now

### 20. Creator Problem
- Title: A control deck is not the same thing as automation
- Hook: Pressing a button faster is still manual work.
- Platform: LinkedIn, blog
- Content Outline:
  1. Contrast one-off controls with event-driven workflow logic.
  2. Explain why TriggerHub’s positioning is different.
  3. Avoid claiming market dominance or broad feature superiority.
- CTA: Follow if you care about workflow design, not just button count.
- Claim Safety Level: safe_now

### 21. Creator Problem
- Title: The hidden tax of context switching in creator setups
- Hook: Every extra app switch adds friction, latency, and room for mistakes.
- Platform: LinkedIn, X, short video voiceover
- Content Outline:
  1. List common context-switch patterns in creator setups.
  2. Position TriggerHub as a desktop coordination layer in progress.
  3. Keep claims anchored to the actual prototype stage.
- CTA: What are the three tools you bounce between most during a session?
- Claim Safety Level: safe_now

### 22. Creator Problem
- Title: Why creators need workflow visibility, not invisible automation magic
- Hook: Automation gets scary fast when you cannot tell what fired, why, or what it touched.
- Platform: LinkedIn, founder memo
- Content Outline:
  1. Explain the need for observable automation.
  2. Connect it to the dashboard and runtime-status direction.
  3. Clarify that product transparency is a design principle still being developed.
- CTA: What would make you trust an automation tool during a live stream?
- Claim Safety Level: safe_now

### 23. Creator Problem
- Title: TriggerHub replaces every creator tool in one app
- Hook: One install, zero other tools, complete creator operating system.
- Platform: Landing page hero, X, LinkedIn
- Content Outline:
  1. Position TriggerHub as a full replacement for OBS, Spotify, clip tools, and plugin ecosystems.
  2. Promise no need for existing setup complexity.
  3. Imply finished breadth and production readiness.
- CTA: Move your entire creator stack today.
- Claim Safety Level: not_publishable

## Series 4: Alpha Tester Recruitment

### 24. Alpha Tester Recruitment
- Title: We are looking for Windows creators who enjoy testing workflow tools early
- Hook: TriggerHub is at the best stage for hands-on feedback: real foundation, honest gaps, fast iteration.
- Platform: LinkedIn, Discord, X
- Content Outline:
  1. Define who should apply: technically comfortable Windows creators.
  2. Explain the current product stage clearly.
  3. Ask for workflow pain points and stack details.
- CTA: Join the alpha waitlist if you want to shape the product while core workflows are still being defined.
- Claim Safety Level: safe_now

### 25. Alpha Tester Recruitment
- Title: Help us pressure-test creator automation before the polish phase
- Hook: We do not need passive signups. We need builders and streamers willing to break things and explain why.
- Platform: X, Discord, founder email
- Content Outline:
  1. Invite high-signal testers.
  2. Set expectations around incomplete UX and evolving integrations.
  3. Explain the feedback loop they will influence.
- CTA: Apply if you can share repeatable workflows, failure cases, and blunt feedback.
- Claim Safety Level: safe_now

### 26. Alpha Tester Recruitment
- Title: If your stream setup is held together by habits and hotkeys, we want to talk
- Hook: The more manual glue your workflow needs, the more useful your feedback will be.
- Platform: LinkedIn, X
- Content Outline:
  1. Call out creators with messy but real workflows.
  2. Position TriggerHub around workflow structure rather than finished convenience.
  3. Ask applicants to describe one repeated sequence they want to automate.
- CTA: Join the waitlist and send your current workflow stack.
- Claim Safety Level: safe_now

### 27. Alpha Tester Recruitment
- Title: Looking for early testers who care about reliability more than shiny UI
- Hook: A good alpha tester sees value in the engine, not just the screenshots.
- Platform: Discord, X, creator communities
- Content Outline:
  1. Explain that the dashboard is usable but some areas remain scaffold-level.
  2. Invite testers focused on workflow logic and edge cases.
  3. Set expectations about rough edges.
- CTA: Apply if you are comfortable testing an early-stage desktop prototype.
- Claim Safety Level: safe_now

### 28. Alpha Tester Recruitment
- Title: Want to help shape the future plugin workflow layer?
- Hook: The plugin story is still early enough that strong use cases can shape what gets built.
- Platform: LinkedIn, developer communities, Discord
- Content Outline:
  1. Describe plugin extensibility as a future direction.
  2. Mention the current plugin registry groundwork.
  3. Ask what plugin-powered workflow would matter most.
- CTA: Join the alpha if you want to influence the plugin roadmap early.
- Claim Safety Level: vision_only

### 29. Alpha Tester Recruitment
- Title: We need creators who can show us where automation breaks trust
- Hook: The fastest way to improve TriggerHub is to learn which failures would make you stop using it.
- Platform: LinkedIn, Discord, X
- Content Outline:
  1. Ask for edge cases and trust-breaking scenarios.
  2. Tie the request to the current early-stage build.
  3. Position the alpha around honesty and iteration.
- CTA: Join the waitlist if you are willing to test workflows and report failure modes clearly.
- Claim Safety Level: safe_now

### 30. Alpha Tester Recruitment
- Title: Closed alpha for full OBS, Spotify, clip capture, and plugin workflows is open now
- Hook: Everything is ready. We just need users.
- Platform: Landing page, X, LinkedIn
- Content Outline:
  1. Present all major integrations as complete and production-ready.
  2. Position the product as feature-complete for advanced creator stacks.
  3. Encourage immediate broad adoption.
- CTA: Download and start automating your full workflow today.
- Claim Safety Level: not_publishable

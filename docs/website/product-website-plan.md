# Product Website Plan

Date: 2026-03-11
Requested agents:
- `70-product-strategy-agent`
- `60-website-agent`
- `80-marketing-agent`

Note:
- These agent files are not present in the local agent system.
- This plan is based on the current `website/` codebase, product context, and approved claim boundaries in the repository.

## Goal

Transform the current website from a project-status / placeholder marketing site into a product website that explains TriggerHub as a creator automation product and supports alpha-stage conversion.

## Current State Analysis

### Website structure today

The `website/` folder already contains:

- a Vite frontend
- auth and prelaunch gate handling
- route-level marketing pages:
  - `/`
  - `/features`
  - `/pricing`
  - `/about`
  - `/login`
  - `/signup`
- reusable visual sections such as:
  - [Hero.tsx](/E:/Programmierung/TriggerHub2.0/website/src/components/Hero.tsx)
  - [Features.tsx](/E:/Programmierung/TriggerHub2.0/website/src/components/Features.tsx)
  - [IntegrationHub.tsx](/E:/Programmierung/TriggerHub2.0/website/src/components/IntegrationHub.tsx)
  - [Pricing.tsx](/E:/Programmierung/TriggerHub2.0/website/src/components/Pricing.tsx)
  - [EarlyAccess.tsx](/E:/Programmierung/TriggerHub2.0/website/src/components/EarlyAccess.tsx)
  - [AutomationRecipes.tsx](/E:/Programmierung/TriggerHub2.0/website/src/components/AutomationRecipes.tsx)
  - [IntegrationLibrary.tsx](/E:/Programmierung/TriggerHub2.0/website/src/components/IntegrationLibrary.tsx)
  - [WorkflowDemo.tsx](/E:/Programmierung/TriggerHub2.0/website/src/components/WorkflowDemo.tsx)

### Main gap

The current public website still reads more like:

- a status portal
- a visual concept
- a generic placeholder with shallow route pages

It does not yet present a full product-information architecture for:

- what TriggerHub is
- who it is for
- how workflows work
- what integrations and plugins mean
- what clips and automations actually enable
- how alpha access works

### Product and claim constraint

Based on repo marketing guidance, the site must position TriggerHub as:

- an early-stage Windows desktop automation product for creators and streamers

The site should not imply:

- full production maturity
- complete OBS / Spotify / Discord integrations in shipping form
- a live plugin marketplace
- a finished cloud SaaS

The site should therefore be a product website for an alpha-stage desktop product, not a polished “already scaled SaaS” site.

## Target Website Structure

Recommended public information architecture:

1. Landing
2. Features
3. Automation
4. Integrations
5. Clips
6. Plugins
7. Pricing
8. Alpha Access

Recommended utility routes:

- `/login`
- `/access`
- `/signup` only when enabled

## Navigation Model

Primary nav:

- Product
- Features
- Automation
- Integrations
- Clips
- Plugins
- Pricing
- Alpha Access

Header CTA:

- `Request Alpha Access`

Secondary CTA:

- `See Product Workflow`

Footer groups:

- Product
- Resources
- Early Access
- Legal / Contact

## Route Plan

Recommended route map:

- `/` → Landing
- `/features` → Features
- `/automation` → Automation
- `/integrations` → Integrations
- `/clips` → Clips
- `/plugins` → Plugins
- `/pricing` → Pricing
- `/alpha-access` → Alpha Access

Optional later:

- `/docs`
- `/templates`
- `/changelog`

## Page-by-Page Content Plan

## 1. Landing

Purpose:

- explain TriggerHub in one screen
- establish audience fit
- move visitors into deeper product pages or alpha conversion

Core message:

- TriggerHub helps creators automate live production workflows across triggers, macros, tools, and clips from a local desktop runtime.

Recommended sections:

1. Hero
   - headline:
     - `Automate your creator workflow from one desktop control layer`
   - subheadline:
     - `TriggerHub connects stream events, tools, macros, clips, and integrations so repetitive creator actions become one flow instead of ten manual steps.`
   - CTA:
     - `Request Alpha Access`
     - `Explore Workflows`

2. Who It’s For
   - streamers
   - content creators
   - live producers
   - creator-operators running multi-tool setups

3. Core Value Pillars
   - Trigger-based automation
   - Local desktop control
   - Workflow composition
   - Integration-ready architecture

4. Product Workflow Preview
   - use existing workflow-demo / diagram components
   - show:
     - Trigger
     - Condition
     - Action chain
     - Result

5. Featured Automation Use Cases
   - stream start routine
   - clip capture on command
   - scene-based automations
   - creator routine templates

6. Integration Snapshot
   - OBS
   - Spotify
   - Discord
   - Stream Deck
   - Webhooks

7. Alpha Access CTA
   - explain alpha is limited and feedback-driven

## 2. Features

Purpose:

- explain the product capability model more concretely than the landing page

Recommended sections:

1. Feature Hero
   - `A desktop automation system built for creator workflows`

2. Feature Grid
   - visual workflow editor direction
   - trigger engine
   - macro system
   - service orchestration
   - plugin foundation
   - local runtime reliability

3. Capability Deep Dives
   - Trigger system
   - Macro chaining
   - Multi-step action logic
   - Error-tolerant service calls
   - Extensible plugin architecture

4. Product Maturity Framing
   - label which capabilities are:
     - available in foundation
     - in active development
     - planned for alpha expansion

5. FAQ
   - Is it cloud or local?
   - Does it replace OBS?
   - Is this for streamers only?
   - How technical do I need to be?

## 3. Automation

Purpose:

- make TriggerHub’s automation model legible
- turn abstract “automation” into concrete creator recipes

Recommended sections:

1. Automation Hero
   - `From event to action in one workflow`

2. How Automation Works
   - Trigger
   - Conditions
   - Actions
   - Macro chaining

3. Automation Recipe Library
   - use the existing recipe component pattern
   - recipes should include:
     - title
     - use case
     - trigger → condition → action chain
     - expected creator outcome

4. Real Creator Workflows
   - Starting Soon → intro playlist → scene switch
   - chat command → clip capture → Discord note
   - stream event → macro run → follow-up actions

5. Template / Reusability Message
   - position templates as workflow starters, not a finished marketplace

## 4. Integrations

Purpose:

- show TriggerHub as a control layer that connects tools

Recommended sections:

1. Integrations Hero
   - `Connect the tools already in your setup`

2. Integration Categories
   - streaming tools
   - media / audio tools
   - community tools
   - input devices
   - extensibility endpoints

3. Integration Library
   - OBS
   - Spotify
   - Discord
   - Stream Deck
   - Webhooks / custom actions

4. Example Automation Per Integration
   - OBS: switch scene after routine
   - Spotify: trigger playlist on event
   - Discord: send creator workflow notification
   - Stream Deck: launch automation chain

5. Integration Reality Statement
   - explain that integration depth is evolving during alpha

## 5. Clips

Purpose:

- turn the current clip service concept into a user-understandable product page

Recommended sections:

1. Clips Hero
   - `Capture moments as part of the workflow`

2. What Clips Mean in TriggerHub
   - clip capture as an automation action
   - not just manual recording, but workflow-linked clip logic

3. Clip Workflow Examples
   - chat command creates clip marker
   - event-triggered clip export
   - clip action inside a larger macro

4. Creator Outcomes
   - faster highlight collection
   - repeatable short-form content capture
   - less missed moments during live sessions

5. Alpha-State Framing
   - explain current clip system is foundational and evolving

## 6. Plugins

Purpose:

- position plugins as a product expansion model without overstating maturity

Recommended sections:

1. Plugins Hero
   - `Extend TriggerHub beyond built-in workflows`

2. Plugin Value Proposition
   - new actions
   - new integrations
   - custom creator workflows

3. Plugin Architecture Overview
   - registry foundation exists
   - plugin lifecycle
   - future community / SDK direction

4. Example Plugin Concepts
   - Streamlabs alerts plugin
   - smart scene routine plugin
   - webhook connector plugin

5. Developer-Facing CTA
   - `Join Alpha as a creator`
   - `Request developer updates`

Important phrasing:

- do not claim a live plugin marketplace today
- do claim an extensible plugin foundation and roadmap

## 7. Pricing

Purpose:

- support conversion without pretending pricing is finalized

Recommended sections:

1. Pricing Hero
   - `Simple pricing for early creators`

2. Current Recommendation
   - do not lead with three polished SaaS tiers yet unless pricing is already decided
   - instead use alpha-stage pricing framing:
     - Alpha Access
     - Future Creator Plan
     - Future Pro / Team Direction

3. Suggested pricing content model
   - Alpha:
     - limited access
     - direct feedback loop
     - early feature exposure
   - Creator:
     - planned core plan
   - Pro:
     - planned advanced / team plan

4. FAQ
   - Is alpha paid?
   - Will pricing change after alpha?
   - Is desktop included?
   - Are plugins included?

## 8. Alpha Access

Purpose:

- replace generic waitlist language with a product-focused alpha program page

Recommended sections:

1. Alpha Access Hero
   - `Get early access to TriggerHub`

2. Who Alpha Is For
   - creators with real workflow pain
   - streamers with multi-tool setups
   - users willing to provide feedback

3. What Participants Get
   - early builds
   - direct feedback channel
   - product influence
   - possible workflow onboarding

4. What Alpha Is Not
   - not a fully polished production app
   - not complete integration coverage
   - not guaranteed for every workflow yet

5. Application Form
   - creator role
   - main tools used
   - workflow pain points
   - use case priority
   - audience size optional

6. Trust Section
   - privacy / local runtime angle
   - early-stage transparency

## Content System Recommendations

The site should move from one generic marketing copy layer to three content layers:

1. Positioning layer
   - what TriggerHub is
   - who it is for
   - why local creator automation matters

2. Capability layer
   - features
   - workflows
   - integrations
   - plugin direction
   - clips

3. Conversion layer
   - alpha access
   - pricing direction
   - trust / maturity framing

## Reuse of Existing Components

Recommended reuse:

- `Hero` → landing hero rewrite
- `Features` → features page base
- `AutomationRecipes` → automation page
- `WorkflowDemo` → landing + automation
- `IntegrationHub` and `IntegrationLibrary` → integrations page
- `Pricing` → pricing page, but with alpha-stage messaging update
- `EarlyAccess` → alpha access page and site-wide CTA module

Components likely to need replacement or major adaptation:

- [WebsiteLandingPage.tsx](/E:/Programmierung/TriggerHub2.0/website/src/pages/WebsiteLandingPage.tsx)
  because it is still centered on project status
- [MarketingPage.tsx](/E:/Programmierung/TriggerHub2.0/website/src/pages/MarketingPage.tsx)
  because it is a placeholder shell rather than a real content page
- [Hero.tsx](/E:/Programmierung/TriggerHub2.0/website/src/components/Hero.tsx)
  because its current headline is “project status portal”

## Recommended Implementation Phases

### Phase 1

- replace status-portal landing copy
- add real public routes for:
  - `/automation`
  - `/integrations`
  - `/clips`
  - `/plugins`
  - `/alpha-access`
- convert placeholder marketing page into page-specific compositions

### Phase 2

- centralize page content in data files
- add page-specific SEO metadata model
- align navigation, footer, and CTA strategy

### Phase 3

- connect alpha access form to a real intake flow
- add product screenshots / workflow visuals from actual runtime
- refine maturity labels and proof elements

## Page Section Inventory Summary

Landing:

- Hero
- Audience fit
- Value pillars
- Workflow preview
- Featured use cases
- Integration snapshot
- Alpha CTA

Features:

- Feature hero
- Capability grid
- Deep dives
- Maturity framing
- FAQ

Automation:

- Automation hero
- How it works
- Recipe library
- Real workflows
- Templates CTA

Integrations:

- Integrations hero
- Categories
- Integration library
- Use-case examples
- Reality / maturity note

Clips:

- Clips hero
- Clip workflow explanation
- Clip examples
- Creator outcomes
- Alpha framing

Plugins:

- Plugins hero
- Why plugins matter
- Architecture overview
- Example plugin concepts
- Developer CTA

Pricing:

- Pricing hero
- Alpha pricing framing
- Future plan structure
- FAQ

Alpha Access:

- Alpha hero
- Who it’s for
- What you get
- What to expect
- Application form
- Trust section

## Success Criteria

The website should feel like:

- a real product website
- for a creator automation product
- in alpha
- with honest maturity framing

It should no longer feel like:

- a status dashboard site
- a generic SaaS placeholder
- a “coming soon” shell without clear product architecture

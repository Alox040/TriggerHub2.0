# Lead Segmentation

## Agent
Implementation Agent

## Aufgabe
Define how waitlist leads are segmented for closed alpha, early access, or future nurture.

## Betroffene Dateien
- `marketing/waitlist/lead-segmentation.md`

## Segments

### Segment A: Closed Alpha Priority
- Windows-first creators
- Clear repeated workflow pain
- Comfortable with incomplete software
- Strong Discord feedback willingness
- Relevant stack and realistic expectations

### Segment B: Early Access Candidate
- Good workflow fit but lower tolerance for rough edges
- Interested in using the product once key blockers improve
- Better suited after more stable onboarding and integrations

### Segment C: Insight Lead
- Valuable pain points or use-case detail
- May not fit current alpha constraints
- Keep for interviews, messaging research, and roadmap validation

### Segment D: Low Fit / Long-Term Nurture
- Non-Windows primary environment
- Expects polished public product immediately
- Vague workflow pain or low engagement willingness

## Lead Tracking Logic
- Assign a primary segment at first form review.
- Re-score after alpha application answers.
- Upgrade or downgrade segment after Discord activation behavior.
- Preserve source attribution so conversion quality can be tied to content and campaigns.

## Recommended Lead Fields
- lifecycle_stage
- persona_type
- workflow_pain_category
- stack_relevance
- technical_comfort
- feedback_reliability
- expectation_fit
- source_channel
- segment
- invite_status
- discord_activation_status

## Qualification Rules
- High workflow clarity plus realistic expectations outweigh follower size or vanity audience.
- Creator-operator and workflow-heavy streamer profiles should be prioritized first.
- Avoid filling alpha with low-signal curiosity signups.

## Conversion Paths
1. Waitlist submission -> qualification review -> alpha application -> invite -> Discord activation
2. Waitlist submission -> nurture for early access
3. Waitlist submission -> research/interview pool
4. Waitlist submission -> hold / no action

## Risiken
- Segment drift happens if the team starts inviting based on audience size instead of workflow fit.
- Without lifecycle tracking, it will be hard to separate content performance from qualification quality.

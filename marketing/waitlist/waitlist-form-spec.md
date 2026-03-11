# Waitlist Form Specification

## Agent
Implementation Agent

## Aufgabe
Define the top-of-funnel waitlist form for closed alpha and early access.

## Betroffene Dateien
- `marketing/waitlist/waitlist-form-spec.md`

## Form Goal
Collect enough signal to identify high-fit creator testers without creating a long public application barrier.

## Form Fields
| Field | Type | Required | Purpose |
|---|---|---|---|
| full_name | text | yes | Identify applicant |
| email | email | yes | Primary contact for invites |
| discord_handle | text | yes | Discord onboarding route |
| country_or_timezone | text | yes | Scheduling and support coverage |
| primary_platform | select | yes | Streamer, creator, editor, mixed |
| windows_primary_device | boolean | yes | Confirm fit with current desktop focus |
| creator_role_description | textarea | yes | Understand current workflow context |
| current_tool_stack | textarea | yes | Capture OBS, Spotify, clip tools, decks, scripts, etc. |
| biggest_repetitive_workflow | textarea | yes | Core pain qualification |
| current_workaround | textarea | yes | Learn how they solve the problem today |
| technical_comfort_level | select | yes | beginner, intermediate, advanced |
| early_software_comfort | select | yes | willingness to test prototype software |
| willing_to_share_feedback_in_discord | boolean | yes | Community fit requirement |
| can_join_alpha_calls_or_async_feedback | select | yes | sync, async, both, neither |
| what_outcome_would_make_triggerhub_useful | textarea | yes | Measures desired value |
| referral_source | select | no | Attribution for content and channel performance |
| permission_to_contact | checkbox | yes | Consent for follow-up |

## Recommended Form Logic
- If `windows_primary_device = no`, mark as low priority for current alpha.
- If `willing_to_share_feedback_in_discord = no`, keep on waitlist but do not prioritize for closed alpha.
- If `early_software_comfort = low`, route to future early access nurture instead of immediate alpha.
- If the workflow description is vague or generic, request follow-up clarification before inviting.

## Copy Guardrails
- Describe TriggerHub as an early-stage Windows desktop automation product.
- Do not promise production-ready OBS, Spotify, clip capture, or plugin workflows.
- Position the form as an application for closed alpha interest, not instant access.

## Selection Signal Summary
High-value submissions usually include:
- a concrete repeatable workflow
- a real current workaround
- Windows fit
- clear Discord participation willingness
- technical comfort and tolerance for rough edges

## Risiken
- A broad low-friction form can inflate lead count while lowering tester quality.
- Overly technical copy can filter out useful creators who are not engineers but still have strong workflow pain.

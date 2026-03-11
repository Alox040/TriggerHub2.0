# Marketing Events Specification

## Agent
Ops Agent

## Problem
The early-access funnel needs consistent event tracking and lead lifecycle logic so TriggerHub can measure content-to-waitlist conversion quality during closed alpha and early access.

## Ursache
Without a shared analytics spec, content, waitlist, qualification, invite, and Discord activation signals will be inconsistent and impossible to compare across channels.

## Analyse
- TriggerHub is not at a public launch stage, so the most important analytics signals are qualification quality and activation, not raw signups.
- Funnel tracking must separate awareness, form completion, manual review, invite, activation, and feedback contribution.
- Lead tracking should support a lightweight CRM or spreadsheet workflow before heavier automation exists.

## Analytics Events
| Event Name | Trigger | Properties |
|---|---|---|
| marketing_content_viewed | user views a content asset | channel, campaign, content_id, series, source |
| waitlist_cta_clicked | user clicks waitlist CTA | channel, campaign, content_id, cta_variant |
| waitlist_form_started | user begins the waitlist form | source_channel, campaign, landing_variant |
| waitlist_form_submitted | user submits the waitlist form | source_channel, campaign, windows_fit, technical_comfort, workflow_category |
| waitlist_submission_reviewed | team reviews submission | segment, reviewer, initial_score |
| alpha_application_sent | follow-up application issued | lead_id, segment, source_channel |
| alpha_application_submitted | applicant completes deeper form | lead_id, workflow_score, expectation_fit, feedback_reliability |
| alpha_application_decision | decision recorded | lead_id, decision, reason_code |
| discord_invite_sent | invite sent to accepted lead | lead_id, segment, cohort |
| discord_joined | accepted lead joins Discord | lead_id, cohort, source_channel |
| discord_profile_completed | tester posts setup context | lead_id, persona_type, workflow_category |
| alpha_first_feedback_submitted | first meaningful feedback received | lead_id, feedback_type, days_to_feedback |
| alpha_active_7d | tester remains active after 7 days | lead_id, message_count, feedback_count |

## Lead Tracking Logic
- Generate one persistent `lead_id` at first waitlist submission.
- Preserve `source_channel`, `campaign`, and `content_id` from the first known touch.
- Keep manual review fields for: segment, decision status, expectation fit, and feedback reliability.
- Update lifecycle stage in order:
  1. visitor
  2. waitlist_started
  3. waitlist_submitted
  4. reviewed
  5. alpha_application_sent
  6. alpha_application_submitted
  7. accepted_or_held
  8. discord_invited
  9. discord_joined
  10. activated

## Conversion Metrics
| Metric | Definition |
|---|---|
| content_to_waitlist_ctr | waitlist_cta_clicked / marketing_content_viewed |
| waitlist_start_rate | waitlist_form_started / waitlist_cta_clicked |
| waitlist_completion_rate | waitlist_form_submitted / waitlist_form_started |
| qualified_lead_rate | submissions marked Segment A or B / waitlist_form_submitted |
| alpha_application_completion_rate | alpha_application_submitted / alpha_application_sent |
| alpha_acceptance_rate | accepted leads / alpha_application_submitted |
| discord_join_rate | discord_joined / discord_invite_sent |
| discord_activation_rate | discord_profile_completed / discord_joined |
| first_feedback_rate | alpha_first_feedback_submitted / discord_joined |
| 7_day_alpha_activity_rate | alpha_active_7d / discord_joined |

## Recommended Reporting Views
- By content series: Dev Log, Automation Demo, Creator Problem, Alpha Recruitment
- By source channel: LinkedIn, X, Discord, direct outreach
- By segment quality: A, B, C, D
- By activation quality: joined, onboarded, first feedback, 7-day active

## Loesungsschritte
1. Add shared UTM and source fields to waitlist links and forms.
2. Store each lead with a stable `lead_id`.
3. Track lifecycle transitions in one spreadsheet, CRM, or lightweight database.
4. Review conversion by quality segment weekly, not just by signup count.
5. Use feedback and activation rates to decide which channels deserve more effort.

## Verifikation
- The spec aligns with a closed-alpha / early-access funnel, not a public scale funnel.
- Metrics prioritize lead quality, activation, and feedback rather than vanity traffic alone.

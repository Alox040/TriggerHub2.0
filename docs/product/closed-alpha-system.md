# Closed Alpha System

Date: 2026-03-11
Status: Proposed design for implementation
Scope: `website/` closed alpha infrastructure integrated with existing auth/session architecture

## Goal

Prepare a closed alpha system that supports:

- invite codes
- creator onboarding
- feedback collection
- crash reporting
- feature requests

The system must integrate with the existing website auth model instead of creating a second identity or session system.

## Context

Relevant current state:

- Website auth already exists with server-side endpoints under `website/api/auth/*`.
- Auth sessions use signed HttpOnly cookies and `GET /api/auth/me` for session hydration.
- Current access modes are `private_prelaunch`, `invite_only`, and `public_product`.
- The route model already prepares `invite_only` mode and authenticated non-owner users.
- Identity and profile are already split conceptually:
  - identity: stable `userId`, role
  - profile: display fields

This design uses the existing trust boundary:

- authentication remains owned by the auth system
- closed alpha capabilities attach to authenticated identities
- invite codes grant eligibility and onboarding state, not standalone app access without auth

## Agent Use

Requested agent files `70-product-strategy-agent` and `30-runtime-architecture-agent` do not exist in this repository.

Equivalent GodAI agents used:

- product strategy: `agents/core/02-product.md`
- runtime architecture: `agents/core/03-architecture.md`

## Product View

### Product Goal

Run a controlled creator-focused closed alpha where invited users can:

- authenticate with the existing website auth flow
- complete creator onboarding
- submit structured product feedback
- report crashes with enough context for triage
- request features without mixing those requests into bug feedback

### Target Users

- internal owner/admin
- invited creators participating in the alpha

### Core Product Constraints

- no open signup during closed alpha
- invite access must be revocable
- onboarding must be resumable
- feedback channels must be differentiated by intent
- crash reporting must work for authenticated alpha users and preserve useful technical context

### MVP Features

1. Invite code issuance and redemption
2. Authenticated creator account activation
3. Creator onboarding checklist and status tracking
4. In-app feedback submission
5. In-app crash report submission plus server-side intake
6. Feature request intake with status fields for triage
7. Owner/admin visibility into invite and submission state

## Architecture View

### Design Principle

Closed alpha is an application capability layer on top of the existing auth and identity foundation.

Do not:

- create a separate closed-alpha login
- encode invite state only in frontend storage
- treat invite codes as sessions

Do:

- authenticate first through existing auth endpoints
- link alpha state to `userId`
- gate product routes by both auth state and closed alpha entitlement

### Recommended Access Model

Use `VITE_ACCESS_MODE=invite_only` as the active alpha mode.

Interpretation:

- public marketing routes may remain limited or fully closed depending on route policy
- authenticated users are not automatically eligible
- closed alpha eligibility is decided by alpha membership status attached to identity

This requires one additional authorization layer beyond current `role` checks:

- auth answers: "who is this user?"
- alpha membership answers: "is this user admitted to the closed alpha, and in what state?"

## Domain Model

### New Entities

#### `alpha_invite`

- `id`
- `code_hash`
- `created_by_user_id`
- `campaign`
- `intended_email` nullable
- `max_redemptions`
- `redeemed_count`
- `status` (`active|disabled|expired`)
- `expires_at` nullable
- `metadata_json`
- `created_at`
- `updated_at`

Notes:

- store only a hash of the invite code, never plaintext
- support single-use by default with optional controlled multi-use for partner batches

#### `alpha_member`

- `user_id` FK to identity
- `invite_id` nullable
- `membership_status` (`invited|active|suspended|revoked`)
- `creator_status` (`pending_onboarding|active|inactive`)
- `onboarding_state` (`not_started|in_progress|completed`)
- `joined_at`
- `activated_at` nullable
- `revoked_at` nullable
- `notes_json`
- `created_at`
- `updated_at`

This is the authoritative entitlement record for closed alpha access.

#### `creator_profile`

- `user_id` FK
- `creator_name`
- `primary_platform`
- `audience_size_band`
- `content_categories`
- `country`
- `goals`
- `referral_source`
- `created_at`
- `updated_at`

This extends the existing profile model without polluting auth identity.

#### `alpha_feedback`

- `id`
- `user_id`
- `type` (`feedback|feature_request|crash_report`)
- `category`
- `title`
- `description`
- `severity` nullable
- `status` (`new|triaged|in_progress|closed|declined`)
- `client_version` nullable
- `platform` nullable
- `session_context_json`
- `attachment_refs_json`
- `created_at`
- `updated_at`

#### `feature_request_vote`

- `request_id`
- `user_id`
- `created_at`

Use only if the alpha needs lightweight demand aggregation. It is optional in the first cut.

## Integration With Existing Auth

### Existing System to Reuse

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- signed HttpOnly session cookie
- `AuthIdentity` with `userId`, `role`, `email`
- identity service keyed by `userId`

### Required Integration Rule

Invite redemption must end in a normal authenticated session tied to one `userId`.

Recommended flow:

1. User lands on invite redemption page.
2. User submits invite code.
3. Backend validates code and records a short-lived redemption ticket.
4. User authenticates through existing auth flow or future signup flow.
5. Backend binds the authenticated `userId` to `alpha_member`.
6. Subsequent `GET /api/auth/me` response is extended or complemented with alpha membership data.

### Contract Extension

Add alpha context to the authenticated session response.

Recommended response extension:

```json
{
  "authenticated": true,
  "session": {
    "userId": "user_123",
    "role": "user",
    "email": "creator@example.com",
    "issuedAt": "2026-03-11T10:00:00.000Z",
    "expiresAt": "2026-03-11T18:00:00.000Z",
    "lastAuthenticatedAt": "2026-03-11T10:00:00.000Z",
    "sessionVersion": 1
  },
  "alpha": {
    "member": true,
    "membershipStatus": "active",
    "creatorStatus": "pending_onboarding",
    "onboardingState": "in_progress"
  }
}
```

If modifying `/api/auth/me` is undesirable, expose a separate authenticated endpoint:

- `GET /api/alpha/me`

The separate endpoint is cleaner if auth should remain generic.

## Functional Design

### 1. Invite Codes

#### User Flow

1. Owner creates invite code from admin/internal area.
2. Creator receives code or invite link.
3. Creator redeems code.
4. System validates policy:
   - active
   - not expired
   - redemption limit not exceeded
   - email match if enforced
5. System marks the user as eligible for closed alpha.
6. User signs in and enters onboarding.

#### Runtime Decisions

- codes are hashed at rest
- redemption should be idempotent for the same authenticated user
- invite links may carry a public code token, but backend stores only its hash
- invite validity checks happen server-side only

#### API Surface

- `POST /api/alpha/invites/redeem`
- `POST /api/internal/alpha/invites`
- `POST /api/internal/alpha/invites/:id/disable`
- `GET /api/internal/alpha/invites`

### 2. Creator Onboarding

#### Purpose

Convert an invited authenticated user into a usable creator account with the minimum metadata required for product learning and support.

#### Onboarding Steps

1. Accept alpha terms and expectations
2. Confirm creator display identity
3. Collect creator metadata
4. Collect primary use case / goals
5. Present feedback expectations and support channels
6. Mark onboarding complete

#### State Model

- onboarding state lives in `alpha_member`
- creator-specific fields live in `creator_profile`
- general display fields continue to live in existing profile structures

#### API Surface

- `GET /api/alpha/onboarding`
- `POST /api/alpha/onboarding/start`
- `POST /api/alpha/onboarding/profile`
- `POST /api/alpha/onboarding/complete`

### 3. Feedback Collection

#### Product Requirement

Feedback should be fast to submit, attributable to a user, and triageable without manual cleanup.

#### Submission Types

- general feedback
- bug feedback
- usability friction

#### Minimum Schema

- type
- category
- title
- description
- optional screenshot/attachment reference
- client version
- current route/screen
- user id

#### API Surface

- `POST /api/alpha/feedback`
- `GET /api/internal/alpha/feedback`

### 4. Crash Reporting

#### Product Requirement

Crashes need separate intake because they require technical metadata and operational alerting, not just product review.

#### Collection Strategy

- frontend catches fatal UI/runtime errors and submits a crash report envelope
- Electron/desktop runtime can later post the same envelope shape
- each crash report links to authenticated `userId` when available

#### Minimum Crash Payload

- error name
- message
- sanitized stack
- app version
- environment
- platform
- timestamp
- route or active screen
- correlation id
- recent action breadcrumbs if available

#### API Surface

- `POST /api/alpha/crash-reports`
- `GET /api/internal/alpha/crash-reports`

#### Operational Rule

Crash reports should also be forwarded into a dedicated monitoring sink later. The app-facing API should remain the stable intake boundary even if the downstream provider changes.

### 5. Feature Requests

#### Product Requirement

Feature requests must be distinct from general feedback so they can be deduplicated, prioritized, and optionally voted on.

#### Minimum Schema

- title
- problem statement
- desired outcome
- workaround in current product
- priority perception

#### API Surface

- `POST /api/alpha/feature-requests`
- `GET /api/internal/alpha/feature-requests`
- `POST /api/internal/alpha/feature-requests/:id/status`

This can still persist into the shared `alpha_feedback` table with `type=feature_request`, while exposing separate endpoints for cleaner semantics.

## Route and Access Integration

### Route Policy

Closed alpha access should not rely on `role` alone.

Recommended route groups:

- public routes
- invited but not onboarded routes
- active alpha member routes
- owner/internal routes

### Guard Logic

Current route policy should be extended with alpha membership predicates:

- `requiresAlphaMember`
- `requiresOnboardingComplete`
- `allowOwnerBypass`

Examples:

- `/signup` or `/invite/:code`: public in `invite_only`
- `/onboarding`: authenticated + alpha member + onboarding incomplete/allowed
- `/dashboard`: authenticated + active alpha member
- `/internal`: owner only

## Recommended Module Boundaries

### Frontend

```text
website/src/modules/
  alpha/
    alphaTypes.ts
    alphaMembershipService.ts
    alphaApi.ts
  invites/
    inviteTypes.ts
    inviteRedemptionService.ts
  onboarding/
    onboardingTypes.ts
    onboardingService.ts
  feedback/
    feedbackTypes.ts
    feedbackService.ts
  crash-reporting/
    crashReportTypes.ts
    crashReporter.ts
  feature-requests/
    featureRequestTypes.ts
    featureRequestService.ts
```

### API

```text
website/api/
  alpha/
    me.ts
    onboarding.ts
    feedback.ts
    crash-reports.ts
    feature-requests.ts
    invites/
      redeem.ts
  internal/
    alpha/
      invites.ts
      feedback.ts
      crash-reports.ts
      feature-requests.ts
```

### Persistence

Even if the first implementation starts with simple storage, keep repository-style boundaries:

- `AlphaInviteStore`
- `AlphaMemberStore`
- `CreatorProfileStore`
- `AlphaFeedbackStore`

## Data Flow

### Invite Redemption

1. Client submits code to backend.
2. Backend validates invite.
3. Backend creates redemption ticket or pending admission record.
4. User authenticates.
5. Backend binds `userId` to membership.
6. UI hydrates session plus alpha status.

### Feedback Submission

1. Authenticated alpha member submits form.
2. Backend validates membership status.
3. Backend stores normalized feedback record.
4. Internal view lists submissions by type and status.

### Crash Reporting

1. Client error boundary catches fatal issue.
2. Crash envelope is sanitized client-side.
3. Backend stores report and assigns correlation id.
4. Downstream alerting/export can happen asynchronously later.

## Security and Abuse Controls

1. Hash invite codes at rest.
2. Apply rate limits to invite redemption, onboarding completion, and all submission endpoints.
3. Enforce authenticated membership checks server-side for all alpha routes and write APIs.
4. Do not trust client-sent role or membership flags.
5. Redact secrets, tokens, and raw local paths from crash payloads.
6. Support invite revocation and member suspension without deleting historical submissions.
7. Audit-log owner actions: invite creation, disable, revoke, member status changes.

## Operational Notes

### Admin/Internal Needs

Owner needs lightweight internal views for:

- invite inventory
- redemption status
- onboarding completion status
- recent crashes
- open feature requests
- untriaged feedback

### Metrics

Track:

- invite redemption rate
- activation rate
- onboarding completion rate
- feedback submissions per active creator
- crash frequency by client version
- feature request themes

## Rollout Plan

### Phase 1: Alpha Entitlement

- add `alpha_member`
- add invite issuance and redemption
- expose `GET /api/alpha/me`
- extend guards to require alpha membership

### Phase 2: Onboarding

- add onboarding flow and creator profile
- block product routes until onboarding complete

### Phase 3: Feedback and Feature Requests

- add structured submission endpoints
- add internal triage views

### Phase 4: Crash Reporting

- add shared crash envelope and backend intake
- add downstream monitoring/export integration

## Risks

1. Mixing alpha eligibility into the auth session model too early can over-couple generic auth with product admission logic.
2. Allowing invite redemption before a stable authenticated identity exists can create duplicate or orphaned admissions.
3. Treating all submissions as one generic feedback type will make triage noisy and slow.
4. Capturing unsanitized crash stacks can leak secrets or machine-specific data.
5. Relying only on frontend route guards will expose protected alpha APIs.

## Recommended Next Step

Implement the entitlement layer first:

1. add `alpha_member` and invite persistence
2. create `POST /api/alpha/invites/redeem`
3. create `GET /api/alpha/me`
4. extend route guards with alpha membership checks
5. keep onboarding and feedback on top of that foundation

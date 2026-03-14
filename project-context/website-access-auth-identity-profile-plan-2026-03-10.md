# Historical Plan: Website Access/Auth/Identity/Profile Architecture

Status: historical planning reference only.
Current implementation truth now lives in `website/`, tests under `src/tests/website-*.test.ts`, and supporting metadata under `project-meta/`.

## Why This File Still Exists

- It documents the original boundary plan for website access control, auth, identity, and profile.
- It is useful for architectural intent and migration history.
- It must not overrule the current code, tests, or runtime configuration.

## Superseding Sources

- `website/src/app/routing/`
- `website/src/modules/auth/`
- `website/src/modules/profile/`
- `website/api/`
- `src/tests/website-auth-v1.test.ts`
- `src/tests/website-owner-only-access.test.ts`
- `src/tests/website-profile-v1.test.ts`

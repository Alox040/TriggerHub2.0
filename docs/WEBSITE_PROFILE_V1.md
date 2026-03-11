# Website Profile v1

Date: 2026-03-10

## Scope

Minimal profile system with future-ready separation of concerns:

- `users` (identity + role)
- `profiles` (display fields)

Current usage:

- Owner profile is active/usable today.
- Architecture supports future regular user accounts without rewriting profile core.

## Data Model

### users

- `id`
- `role` (`owner|user`)
- `createdAt`
- `updatedAt`

### profiles

- `userId`
- `displayName`
- `avatarUrl`
- `bio`
- `createdAt`
- `updatedAt`

### profile view model (UI contract)

- `user_id`
- `display_name`
- `avatar_url`
- `bio`
- `role`

Role is projected from `users`, not owned by `profiles`, keeping identity and profile separated.

## Files

- `website/src/modules/identity/types.ts`
- `website/src/modules/identity/userStore.ts`
- `website/src/modules/identity/identityService.ts`
- `website/src/modules/profile/types.ts`
- `website/src/modules/profile/validation.ts`
- `website/src/modules/profile/profileStore.ts`
- `website/src/modules/profile/profileService.ts`
- `website/src/modules/profile/runtime.ts`
- `website/src/app/providers/ProfileProvider.tsx`
- `website/src/pages/ProfilePage.tsx`

## Validation and Guards

- `display_name`: required, trimmed, max length 64
- `bio`: trimmed, max length 280
- `avatar_url`: optional, but if set must be absolute `http/https` URL, max length 512
- profile write requires existing identity user (`unknown user` guard)

## Routing and Access

- `/profile` route added as protected route.
- In `private_prelaunch`: owner-only.
- In `invite_only` and `public_product`: prepared to allow authenticated non-owner users while remaining protected.

## Future Extensibility

1. Signup
- Add user creation flow in auth/signup module.
- Call `identityService.ensureUser(newUserId, 'user')`.
- Create starter profile via `profileService.ensureProfileForUser(newUserId, defaultName)`.

2. Profile editing
- Existing `updateProfile` is ready for authenticated self-edit flows.
- Add authorization checks for editing other user profiles once admin/team features arrive.

3. Optional public profiles
- Add profile visibility field and public-profile route resolution.
- Keep access-policy decisions in access-control layer, not inside profile service.

4. Team/workspace support
- Introduce `workspace_membership` model.
- Keep role split between global identity role and workspace-scoped role.
- Profile remains user-centric and reusable across workspaces.

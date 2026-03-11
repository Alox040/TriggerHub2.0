# Website Routing Model v1

Date: 2026-03-10

## Route Model

### Public routes (target product model)

- `/` (Landing)
- `/features`
- `/pricing`
- `/about`
- `/login`
- `/signup`

### Protected routes

- `/app`
- `/dashboard`
- `/profile`
- `/settings`

### System routes

- `/forbidden`
- `/logout`
- `/internal` (legacy alias -> redirects to `/dashboard`)

## Central Access Mode

Configured in `website/src/config/runtimeConfig.ts`:

- `VITE_ACCESS_MODE=private_prelaunch|invite_only|public_product`
- `VITE_ENABLE_SIGNUP=true|false`

Policy resolution source of truth:

- `website/src/app/routing/routeManifest.ts`
- `getResolvedRoutePolicy(path, mode)`

Guard evaluation:

- `website/src/app/routing/accessGuard.ts`
- `website/src/modules/access-control/policy.ts`

## Current Behavior (private_prelaunch)

- Marketing routes are forced to protected owner-only by mode override.
- Protected app routes remain protected owner-only.
- Login stays public.
- Signup route is policy-blocked when signup is disabled (`VITE_ENABLE_SIGNUP=false`).

## Future Switch Plan to public_product

1. Set `VITE_ACCESS_MODE=public_product`.
2. Keep `VITE_ENABLE_SIGNUP=false` initially:
- Public marketing pages open.
- Login remains public.
- App/dashboard/profile/settings remain protected.
 - Signup remains blocked by route policy.
3. Implement signup backend flow.
4. Set `VITE_ENABLE_SIGNUP=true` when signup endpoint and validations are ready.
5. Keep owner credentials and owner role unchanged for backward compatibility.

## Why Owner System Survives The Switch

- Auth owner login remains in `authService`.
- Identity/profile stores are independent from route visibility mode.
- Only policy resolution changes by mode; auth/profile modules do not require rewrite.

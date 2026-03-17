# WEBSITE_IMPROVEMENT_ROADMAP.md
# TriggerHub 2.0 — Website Implementation Roadmap

**Created:** 2026-03-17
**Scope:** `website/` only — Desktop app (`src/`, `electron/`) untouched
**Strategy:** Incremental, lowest-risk first. No full rewrite. Each phase is independently shippable.

---

## Phase 1 — Cleanup
**Goal:** Remove dead code and broken AI-template artifacts without touching any logic.
Zero functional risk. Pure deletion.

### What to do

#### 1.1 Delete 5 orphaned components
These files are not imported anywhere in the active render path.
Verified with `grep -r "ComponentName" website/src`.

```
website/src/components/Features.tsx
website/src/components/FeatureAccordion.tsx
website/src/components/AutomationExamples.tsx
website/src/components/IntegrationLibrary.tsx
website/src/components/Pricing.tsx
```

#### 1.2 Delete dead identity module
`website/src/modules/identity/` — 3 files, zero import references in active code.

```
website/src/modules/identity/identityService.ts
website/src/modules/identity/types.ts
website/src/modules/identity/userStore.ts
```

#### 1.3 Remove the `legacy.*` i18n block
After 1.1, the `legacy.*` namespace in both locale files has no consumers.
Remove the entire `"legacy"` key from:

```
website/src/i18n/locales/en/common.json
website/src/i18n/locales/de/common.json
```

#### 1.4 Replace sessionStore.ts with inline cleanup
`website/src/modules/auth/sessionStore.ts` is permanently disabled
(`createLocalSessionStore()` always returns `null`). Its only real effect is
clearing two legacy localStorage keys.

- Move the two `localStorage.removeItem()` calls into `AuthProvider.tsx` mount effect.
- Delete `sessionStore.ts`.
- Remove its import from `AuthProvider.tsx`.

### Files affected
```
website/src/components/Features.tsx                  → delete
website/src/components/FeatureAccordion.tsx          → delete
website/src/components/AutomationExamples.tsx        → delete
website/src/components/IntegrationLibrary.tsx        → delete
website/src/components/Pricing.tsx                   → delete
website/src/modules/identity/identityService.ts      → delete
website/src/modules/identity/types.ts                → delete
website/src/modules/identity/userStore.ts            → delete
website/src/modules/auth/sessionStore.ts             → delete
website/src/app/providers/AuthProvider.tsx           → minor: add localStorage.removeItem calls, remove sessionStore import
website/src/i18n/locales/en/common.json              → remove "legacy" block
website/src/i18n/locales/de/common.json              → remove "legacy" block
```

### Risks
- **Low.** All deletions are verified dead code.
- The only risk is a missed import reference. Run `npm run build` after each deletion group.
- The `legacy.*` i18n removal is safe only after the 5 components are deleted (1.1 first).

### Definition of done
- [ ] `npm run build` passes with zero errors after all deletions
- [ ] No `import` statement anywhere in `website/src/` points to a deleted file
- [ ] No `legacy.*` i18n key is referenced anywhere
- [ ] Bundle size is measurably smaller (Vite build output comparison)

---

## Phase 2 — Structural Refactor
**Goal:** Fix two routing bugs and reduce unnecessary prop drilling.
No visual changes. No i18n changes.

### What to do

#### 2.1 Move `replaceTo('/dashboard')` into `useEffect` (bug fix)

**File:** `website/src/app/routing/AppRouter.tsx`

Current code calls `replaceTo()` directly in the render body (lines 40–43).
This is a side effect in render — violates React rules, causes issues in StrictMode.

Merge the login-redirect case into the existing `useEffect`:

```tsx
useEffect(() => {
  if (isInitializing) return
  if (identity && normalizedPath === '/login') {
    replaceTo('/dashboard')
    return
  }
  if (!decision.allow && decision.redirectTo) {
    replaceTo(decision.redirectTo)
  }
}, [decision.allow, decision.redirectTo, identity, normalizedPath, isInitializing])
```

Remove the direct `if (identity && normalizedPath === '/login')` block from the render body.

#### 2.2 Move renderer map to module scope

**File:** `website/src/app/routing/routeRenderer.tsx`

`rendererMap` is currently declared inside `renderRoute()` and recreated on every call.
Move it to module level as a `const`.

```tsx
// module level
const rendererMap: Record<RoutePath, () => ReactElement | null> = {
  '/': () => <WebsiteLandingPage />,
  // ... all routes unchanged
}

export const renderRoute = (path: RoutePath): ReactElement | null =>
  rendererMap[path]()
```

#### 2.3 Remove `onNavigate` prop from inner pages

**Context:** All inner pages (`DashboardPage`, `SettingsPage`, `AppPage`, `ProfilePage`,
`ForbiddenPage`, `InternalPage`, `LoginPage`, `SignupPage`) receive `onNavigate: (path: string) => void`
as a prop. But `navigateTo` is a module-level singleton that can be imported directly.
The prop adds unnecessary coupling at `routeRenderer.tsx` and every page interface.

**Steps:**
1. In each affected page, replace the `onNavigate` prop call with a direct import:
   ```tsx
   import { navigateTo } from '../app/routing/navigation'
   ```
2. Remove the `onNavigate` prop from each page's `Props` interface.
3. In `routeRenderer.tsx`, remove all `onNavigate={navigateTo}` and `nextPath={readNextPath()}`
   prop passes. Pages that need `readNextPath()` import it directly.

**Affected pages:**
```
website/src/pages/DashboardPage.tsx
website/src/pages/SettingsPage.tsx
website/src/pages/AppPage.tsx
website/src/pages/ProfilePage.tsx
website/src/pages/ForbiddenPage.tsx
website/src/pages/InternalPage.tsx
website/src/pages/LoginPage.tsx
website/src/pages/SignupPage.tsx
website/src/app/routing/routeRenderer.tsx
```

#### 2.4 Add loading state during auth initialization

**File:** `website/src/app/routing/AppRouter.tsx`

Current behavior: `if (isInitializing) return null` — blank white screen on load.

Replace with a minimal non-jarring placeholder:
```tsx
if (isInitializing) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="size-6 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
    </div>
  )
}
```
No new dependencies. Pure Tailwind animation.

### Files affected
```
website/src/app/routing/AppRouter.tsx          → 2.1, 2.4
website/src/app/routing/routeRenderer.tsx      → 2.2, 2.3
website/src/pages/DashboardPage.tsx            → 2.3
website/src/pages/SettingsPage.tsx             → 2.3
website/src/pages/AppPage.tsx                  → 2.3
website/src/pages/ProfilePage.tsx              → 2.3
website/src/pages/ForbiddenPage.tsx            → 2.3
website/src/pages/InternalPage.tsx             → 2.3
website/src/pages/LoginPage.tsx                → 2.3
website/src/pages/SignupPage.tsx               → 2.3
```

### Risks
- **Medium for 2.1.** The `useEffect` dependency array change must be correct or redirects can break.
  Test all four redirect scenarios: unauthenticated to protected, authenticated to `/login`,
  insufficient role to `/forbidden`, access mode block.
- **Low for 2.2–2.4.** Mechanical changes with no logic involved.

### Definition of done
- [ ] `npm run build` passes
- [ ] Navigating to `/login` while authenticated redirects to `/dashboard` (no flash, no loop)
- [ ] Navigating to `/dashboard` while unauthenticated redirects to `/login?next=/dashboard`
- [ ] Page load shows spinner, not blank screen
- [ ] TypeScript reports no unused `onNavigate` parameter warnings
- [ ] All pages compile without the `onNavigate` prop

---

## Phase 3 — UI Consistency
**Goal:** Unify visual styling across all pages. Landing page already has good style.
Inner pages use three different styling approaches; bring them in line with the token system.

### What to do

#### 3.1 Align SettingsPage and AppPage to token system

**Files:** `website/src/pages/SettingsPage.tsx`, `website/src/pages/AppPage.tsx`

Both pages currently use raw zinc/cyan Tailwind classes. Replace with semantic tokens
matching `DashboardPage.tsx` (which already uses the correct system).

Target pattern:
```tsx
<main className="min-h-screen bg-background text-foreground p-6">
  <div className="mx-auto max-w-4xl rounded-xl border border-border bg-card p-6">
    <h1 className="text-2xl font-semibold">{t('...')}</h1>
    <p className="mt-2 text-muted-foreground">{t('...')}</p>
    <div className="mt-6 flex gap-3">
      <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground font-semibold">
      <button className="rounded-md border border-border px-4 py-2">
    </div>
  </div>
</main>
```

Classes to replace:
| Old | New |
|---|---|
| `bg-zinc-900/80` | `bg-card` |
| `border-zinc-700` | `border-border` |
| `text-zinc-300` | `text-muted-foreground` |
| `bg-cyan-500` | `bg-primary` |
| `text-black` (on cyan btn) | `text-primary-foreground` |
| `border-zinc-500` | `border-border` |
| `text-white` (heading) | `text-foreground` |

Set `<LanguageSwitcher variant="light" />` consistently on all inner pages.

#### 3.2 Differentiate BenefitGrid icons

**File:** `website/src/components/MarketingBlocks.tsx` — `BenefitGrid` component

All 3 benefit cards render the same `<Sparkles>` icon. Assign distinct icons per benefit:

```tsx
import { Zap, Monitor, Workflow } from 'lucide-react'
// (verify these aren't already imported — they likely are)

const benefitIcons = [Zap, Monitor, Workflow]

export const BenefitGrid = ({ items }: BenefitGridProps) => (
  <div className="grid gap-6 md:grid-cols-3">
    {items.map((item, index) => {
      const Icon = benefitIcons[index] ?? Sparkles
      return (
        <article key={item.title} className="...">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <Icon className="size-5" />
          </div>
          ...
        </article>
      )
    })}
  </div>
)
```

#### 3.3 Fix mobile menu accessibility

**File:** `website/src/components/MarketingBlocks.tsx` — `MarketingShell` component

Add `aria-expanded` and `aria-controls` to the toggle button, and add `id` to the menu panel:

```tsx
// Toggle button:
<button
  aria-label="Toggle navigation"
  aria-expanded={isMobileMenuOpen}
  aria-controls="mobile-nav-menu"
  ...
>

// Menu panel:
<div id="mobile-nav-menu" className="md:hidden ...">
```

#### 3.4 Remove DesktopPreview first-letter icon anti-pattern

**File:** `website/src/components/MarketingBlocks.tsx` — `DesktopPreview` component

`item.label.slice(0, 1)` generates icons from the first character of the translated label.
This breaks if translations change and looks unpolished.

Replace with explicit step icons from lucide-react:
```tsx
import { Zap, GitBranch, Layers, Play } from 'lucide-react'
const stepIcons = [Zap, GitBranch, Layers, Play]

// In the map:
const Icon = stepIcons[index] ?? Zap
// Replace the div containing item.label.slice(0, 1) with:
<div className="flex size-10 items-center justify-center rounded-2xl bg-sky-400/12 text-sky-200">
  <Icon className="size-4" />
</div>
```

### Files affected
```
website/src/pages/SettingsPage.tsx                    → 3.1
website/src/pages/AppPage.tsx                         → 3.1
website/src/components/MarketingBlocks.tsx            → 3.2, 3.3, 3.4
```

### Risks
- **Low for 3.1.** Purely class-name substitutions. No logic changes. Verify token names
  against `website/src/styles/theme.css` — confirm `--color-primary`, `--color-card` etc. exist.
- **Low for 3.2–3.4.** Visual-only. No data flow touched.
- The only risk is if a token name referenced in 3.1 is not defined in the theme — check first.

### Definition of done
- [ ] `AppPage`, `SettingsPage`, `DashboardPage` are visually consistent side-by-side
- [ ] All 3 benefit cards show distinct icons
- [ ] Mobile menu toggle announces open/closed state in `aria-expanded`
- [ ] `DesktopPreview` step icons are rendered from `lucide-react`, not first-letter slicing
- [ ] No raw `zinc-*` or `cyan-*` classes remain in inner page files

---

## Phase 4 — Copy Rewrite
**Goal:** Replace all AI-generated meta-commentary and developer notes with real product copy.
No code changes — i18n JSON only. Both locales in one pass.

### What to do

#### 4.1 Fix section descriptions (4 keys)

These i18n values currently describe *the intent of the section*, not the product.
They are rendered live as paragraph text under each section heading.

**Keys to fix in both `en/common.json` and `de/common.json`:**

| Key | Current problem | Target direction |
|---|---|---|
| `landing.sections.features.description` | "This page keeps the message tied to what the repository supports..." | Describe what the feature set actually is |
| `landing.sections.extensions.description` | "These ideas are framed deliberately as possible extensions because..." | Describe what the extensions section shows |
| `landing.sections.trust.description` | "The website should feel credible. These points stay close to..." | One sentence about product credibility signals |
| `landing.sections.faq.description` | "These answers reflect the current repository state and keep the public message aligned..." | Invite the reader to read the FAQ |

**Suggested EN replacements:**
```json
"landing.sections.features.description":
  "TriggerHub ships with a trigger engine, macro system, and early service adapters for OBS and Spotify.
   The feature set is focused on the desktop runtime — not a broad integration catalogue.",

"landing.sections.extensions.description":
  "The product foundation already supports plugin scaffolding, clip modules, and a local runtime.
   These directions show where TriggerHub can grow without changing its core focus.",

"landing.sections.trust.description":
  "These signals are grounded in the current repository and release path, not marketing claims.",

"landing.sections.faq.description":
  "Short answers about what TriggerHub is today and how early access works."
```

#### 4.2 Fix the CTA section (3 keys)

```json
// Current — an AI instruction rendered as a headline:
"landing.cta.title": "Follow the product direction without promising a public download yet."
"landing.cta.description": "The current public site should frame TriggerHub as a focused
  desktop product in development. The next step is protected access or a review of the
  repository and product scope."
"cta.finalLabel": "Final CTA"

// Fix:
"landing.cta.title": "Get early access to TriggerHub.",
"landing.cta.description": "TriggerHub is in active development. Request access to follow
  the release and try early builds when they become available.",
"cta.finalLabel": "Early access"
```

#### 4.3 Fix inner page copy (developer notes exposed as UI)

```json
// Dashboard:
"dashboard.description": "Protected dashboard route prepared for future user accounts."
→ "dashboard.description": "Your TriggerHub account dashboard."

// App page:
"appPage.description": "Protected application shell. This route remains protected in all modes."
→ "appPage.description": "TriggerHub app."

// Profile:
"profile.identityNote": "Identity is managed separately from auth/session. Current role: {{role}}"
→ "profile.identityNote": "Role: {{role}}"

// Settings:
"settings.description": "Protected settings route for account and application preferences."
→ "settings.description": "Manage your account and preferences."
```

#### 4.4 Apply matching updates to `de/common.json`

Every key changed in 4.1–4.3 must have a German equivalent update in the same PR.
Do not leave any key where the DE value is more accurate than EN or vice versa.

### Files affected
```
website/src/i18n/locales/en/common.json    → 4.1, 4.2, 4.3
website/src/i18n/locales/de/common.json    → 4.4
```

### Risks
- **Zero runtime risk.** i18n JSON changes cannot break the application.
- **Content risk only.** The new copy must not make promises the product cannot keep.
  Stay within the established tone: honest, specific, no hype.
- If a key is accidentally removed (not just its value changed), i18next will render the key
  name literally. Review the diff carefully.

### Definition of done
- [ ] No section description on the live page reads like a content strategy document
- [ ] The CTA headline is a real product statement, not an AI instruction
- [ ] Inner pages show user-appropriate descriptions, not developer notes
- [ ] `de/common.json` is fully in sync — no key present in EN but missing or outdated in DE
- [ ] All text passes a read-aloud test: does it sound like something a product ships?

---

## Phase 5 — SEO and Metadata
**Goal:** Ensure the site presents correctly in search results, social shares, and browser tabs.
No component changes needed — metadata, `index.html`, and `DocumentHead.tsx` only.

### Current state assessment

| Signal | Status | Notes |
|---|---|---|
| `<title>` | Good | Set via i18n in `DocumentHead.tsx` |
| `meta description` | Acceptable | 178 chars, technically accurate but developer-flavored |
| `og:title` | Good | Set in i18n |
| `og:description` | Needs work | "Explore a focused desktop automation runtime..." — cold language |
| `og:image` | Missing | No `og:image` defined anywhere |
| `twitter:card` | Unknown | Check `index.html` and `DocumentHead.tsx` |
| `lang` attribute | Good | `DocumentHead.tsx` sets `document.documentElement.lang` |
| `canonical` | Missing | No `<link rel="canonical">` |
| Structured data | Missing | No JSON-LD |
| Favicon | Unknown | Not observed in analysis |
| `/robots.txt` | Missing | Not present in `website/public/` |
| `/sitemap.xml` | Missing | Not present |

### What to do

#### 5.1 Rewrite meta description and OG description

**File:** `website/src/i18n/locales/en/common.json` — `meta.*` keys

```json
// Current:
"description": "TriggerHub is a Windows desktop app that brings triggers, macros, and local actions
  together for creator workflows. Current early access focuses on core automation modules;
  service adapters and integrations are under active development."

// Fix (under 160 chars, action-oriented):
"description": "TriggerHub automates creator workflows on Windows. Connect OBS, Spotify, and
  your tools with triggers and macros — runs locally, no cloud required."

// OG description (can be slightly longer, for social share cards):
"ogDescription": "A Windows desktop automation tool for streamers and creators.
  Build trigger-macro workflows that coordinate OBS, Spotify, and local actions from one hub."
```

Update `de/common.json` with German equivalents.

#### 5.2 Add `og:image` meta tag

**File:** `website/src/components/DocumentHead.tsx`

Add `og:image` to the meta tag updates:
```tsx
const ogImageMeta = document.querySelector('meta[property="og:image"]')
if (ogImageMeta) {
  ogImageMeta.setAttribute('content', 'https://triggerhub.de/og-image.png')
}
```

**File:** `website/index.html`
Add static fallback:
```html
<meta property="og:image" content="https://triggerhub.de/og-image.png" />
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:image" content="https://triggerhub.de/og-image.png" />
```

**Note:** An actual `og-image.png` (1200×630px) must be created and placed in `website/public/`.
This is a design task, not a code task — but the tag must be wired before the image is ready.

#### 5.3 Add canonical link

**File:** `website/index.html`
```html
<link rel="canonical" href="https://triggerhub.de/" />
```

**File:** `website/src/components/DocumentHead.tsx`
Update canonical dynamically for each route:
```tsx
let canonical = document.querySelector('link[rel="canonical"]')
if (!canonical) {
  canonical = document.createElement('link')
  canonical.setAttribute('rel', 'canonical')
  document.head.appendChild(canonical)
}
canonical.setAttribute('href', `https://triggerhub.de${window.location.pathname}`)
```

#### 5.4 Add `/robots.txt`

**File:** `website/public/robots.txt` (create)
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard
Disallow: /profile
Disallow: /settings
Disallow: /app
Disallow: /internal
Sitemap: https://triggerhub.de/sitemap.xml
```

#### 5.5 Add `/sitemap.xml`

**File:** `website/public/sitemap.xml` (create)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://triggerhub.de/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://triggerhub.de/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
```
Protected routes (`/dashboard`, `/profile`, `/settings`, `/app`, `/internal`) must NOT appear here.

#### 5.6 Fix duplicate-content routes

**File:** `website/src/app/routing/routeRenderer.tsx`

`/features`, `/pricing`, `/about` all render `WebsiteLandingPage` — identical content on
three URLs. This creates SEO duplicate content. Two options:

- **Option A (minimal):** Add 301 redirects in `vercel.json` for these routes → `/`
  ```json
  { "source": "/features", "destination": "/", "permanent": true },
  { "source": "/pricing", "destination": "/", "permanent": true },
  { "source": "/about", "destination": "/", "permanent": true }
  ```
  Then remove these 3 routes from `routeManifest.ts` and `routeRenderer.tsx`.

- **Option B (later):** Implement distinct page sections for `/features` and `/pricing`
  when the product has enough content to justify them.

**Recommended: Option A.**

### Files affected
```
website/src/i18n/locales/en/common.json     → 5.1
website/src/i18n/locales/de/common.json     → 5.1
website/src/components/DocumentHead.tsx     → 5.2, 5.3
website/index.html                          → 5.2, 5.3
website/public/robots.txt                   → create (5.4)
website/public/sitemap.xml                  → create (5.5)
website/vercel.json                         → 5.6 (Option A)
website/src/app/routing/routeManifest.ts    → 5.6 (Option A)
website/src/app/routing/routeRenderer.tsx   → 5.6 (Option A)
```

### Risks
- **Low for 5.1–5.5.** Additive changes to static files and meta tags.
- **Medium for 5.6.** Removing routes from routeManifest requires checking that
  `getResolvedRoutePolicy` doesn't throw on unknown paths. Verify the `normalizeRoutePath`
  fallback behavior before removing routes.
- `og:image` will return a 404 until the actual image file is created — wire the tag
  with a placeholder path but don't publish until the image exists.

### Definition of done
- [ ] `meta description` is under 160 characters and describes the product, not the codebase
- [ ] `og:image` tag exists in `index.html` (even if image file is pending)
- [ ] `twitter:card` is set to `summary_large_image`
- [ ] `canonical` points to `https://triggerhub.de/` on the landing page
- [ ] `/robots.txt` is accessible and excludes all protected routes
- [ ] `/sitemap.xml` contains only public, indexable URLs
- [ ] `/features`, `/pricing`, `/about` redirect to `/` with 301 (verify with `curl -I`)
- [ ] Google Rich Results Test shows no critical errors

---

## Phase 6 — Final QA
**Goal:** Verify the entire website works correctly across all routes, languages, and
device widths after all prior phases. Catch regressions before shipping.

### Test matrix

#### 6.1 Build and typecheck
```bash
cd website
npm run build
# Must complete with 0 errors and 0 TypeScript errors
# Note final bundle size — compare to pre-cleanup baseline
```

#### 6.2 Route coverage

Test every route in the manifest manually or with an automated script:

| Route | Expected behavior |
|---|---|
| `/` | Renders landing page, all sections visible |
| `/login` | Renders login form; redirects to `/dashboard` if authenticated |
| `/logout` | Clears session, redirects to `/login` |
| `/dashboard` | Redirects to `/login?next=/dashboard` if unauthenticated |
| `/profile` | Redirects to `/login?next=/profile` if unauthenticated |
| `/settings` | Redirects to `/login?next=/settings` if unauthenticated |
| `/app` | Redirects to `/login?next=/app` if unauthenticated |
| `/internal` | Redirects to `/login` if not owner role |
| `/forbidden` | Renders forbidden page |
| `/signup` | Redirects to `/login` (vercel.json + routeManifest) |
| `/access` | Redirects to `/` |
| `/features` | 301 → `/` (Phase 5.6) |
| `/pricing` | 301 → `/` (Phase 5.6) |
| `/about` | 301 → `/` (Phase 5.6) |

#### 6.3 i18n parity check

```bash
# In website/src/i18n/locales/
# Manually diff en/common.json and de/common.json
# Every key in EN must exist in DE and vice versa
# No key should have its EN value in the DE file
```

Verify in browser:
- [ ] Language switcher toggles between DE and EN visibly
- [ ] All sections on landing page show in German when DE is active
- [ ] No raw i18n key strings appear on page in either language (e.g. "landing.cta.title")
- [ ] Document `lang` attribute updates on language switch

#### 6.4 Responsive check

Verify at three breakpoints: 375px (mobile), 768px (tablet), 1280px (desktop)

| Component | Check |
|---|---|
| `MarketingShell` header | Nav hidden on mobile, hamburger visible |
| Mobile menu | Opens and closes; all links work |
| `MarketingHero` | 2-column on desktop, stacked on mobile |
| `BenefitGrid` | 3-col desktop, 1-col mobile |
| `FeatureCardGrid` | 3-col desktop, 1-col mobile |
| `WorkflowSteps` | 3-col desktop, 1-col mobile |
| `TrustGrid` | 4-col desktop, 2-col tablet, 1-col mobile |
| `DesktopPreview` | Readable and not clipped on mobile |
| Inner pages (Dashboard, Profile, Settings) | Card fits screen, no overflow |

#### 6.5 Accessibility spot-check

- [ ] Tab through the entire landing page — all interactive elements are reachable
- [ ] Mobile menu `aria-expanded` reflects actual state
- [ ] All buttons have visible focus ring
- [ ] Color contrast on `text-slate-300` against dark backgrounds passes WCAG AA
- [ ] `<h1>` exists on every page, no skipped heading levels

#### 6.6 Auth flow end-to-end

- [ ] Login with valid credentials → redirects to `/dashboard`
- [ ] Login with invalid credentials → shows localized error message
- [ ] Profile save → shows success state
- [ ] Profile save with invalid avatar URL → shows validation error
- [ ] Session expiry behavior → redirects cleanly to `/login`

#### 6.7 Performance baseline

Run Lighthouse against the deployed URL (or `localhost` build):

| Metric | Target |
|---|---|
| Performance | ≥ 85 |
| Accessibility | ≥ 90 |
| Best Practices | ≥ 90 |
| SEO | ≥ 90 |

Note: `motion/react` animations may affect performance score. If score is below 85,
check whether `whileInView` animations can be disabled for `prefers-reduced-motion`.

#### 6.8 Final checklist

- [ ] No `console.error` or `console.warn` output in browser devtools on any route
- [ ] No raw i18n keys visible on any page in any language
- [ ] No placeholder text ("lorem ipsum", "coming soon", "TODO") on any public page
- [ ] All CTA buttons navigate to an actual destination (no dead `onClick`)
- [ ] `npm run build` output shows no TypeScript errors
- [ ] Bundle includes no deleted component names (`Features`, `Pricing`, `AutomationExamples`,
      `IntegrationLibrary`, `FeatureAccordion`)

---

## Phase Summary

| Phase | Risk | Effort | Value | Prerequisite |
|---|---|---|---|---|
| 1 — Cleanup | Very Low | ~1h | High — smaller bundle, no dead code | None |
| 2 — Structural | Medium | ~2h | High — eliminates routing bug, removes prop drilling | Phase 1 |
| 3 — UI Consistency | Low | ~1.5h | Medium — visual polish, accessibility fix | Phase 1 |
| 4 — Copy Rewrite | Zero | ~2h | Critical — removes damaging AI artifacts from public page | Phase 1 |
| 5 — SEO/Metadata | Low | ~2h | High — site is currently invisible to search | Phases 1–4 |
| 6 — Final QA | — | ~2h | Gate — do not ship without passing | All phases |

**Total estimated effort: ~10–12 hours of focused implementation.**

No phase requires a full rewrite of any existing system.
Every phase is independently committable and verifiable.

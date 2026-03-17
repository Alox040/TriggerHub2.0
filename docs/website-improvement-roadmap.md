# Website Improvement Roadmap
**Scope:** `website/` only — do not touch `src/` or `electron/`
**Stack:** React 18, TypeScript, Tailwind v4, i18next (en/de), Vercel SPA

---

## Phase 1 — Cleanup

**Goal:** Delete dead code. No logic changes, no risk.

### Delete these files
```
website/src/components/Features.tsx
website/src/components/FeatureAccordion.tsx
website/src/components/AutomationExamples.tsx
website/src/components/IntegrationLibrary.tsx
website/src/components/Pricing.tsx
website/src/modules/identity/identityService.ts
website/src/modules/identity/types.ts
website/src/modules/identity/userStore.ts
website/src/modules/auth/sessionStore.ts
```

Before deleting, verify each file has zero import references:
```bash
grep -r "Features\|FeatureAccordion\|AutomationExamples\|IntegrationLibrary\|Pricing\|identity\|sessionStore" \
  website/src --include="*.ts" --include="*.tsx" -l
```
Expected: only the files themselves.

### Remove `legacy.*` i18n block
Delete the entire `"legacy"` key from both locale files:
```
website/src/i18n/locales/en/common.json
website/src/i18n/locales/de/common.json
```

### Replace sessionStore with inline cleanup
In `website/src/app/providers/AuthProvider.tsx`, add to the mount `useEffect`:
```ts
localStorage.removeItem('th.website.auth.session.v1')
localStorage.removeItem('th.website.auth.session.guard.v1')
```
Then remove the `sessionStore` import.

**Done when:** `npm run build` passes with zero errors.

---

## Phase 2 — Structural Fixes

**Goal:** Fix one routing bug, remove prop drilling, add loading state.

### 2.1 Fix side-effect in render — `AppRouter.tsx`
`replaceTo('/dashboard')` is called directly in the render body. Move it into the existing `useEffect`:

```ts
// website/src/app/routing/AppRouter.tsx
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
Remove the standalone `if (identity && normalizedPath === '/login')` block from the render body.

### 2.2 Move renderer map to module scope — `routeRenderer.tsx`
`rendererMap` is currently recreated on every `renderRoute()` call. Move it outside the function:
```ts
// website/src/app/routing/routeRenderer.tsx
const rendererMap: Record<RoutePath, () => ReactElement | null> = { ... }

export const renderRoute = (path: RoutePath): ReactElement | null =>
  rendererMap[path]()
```

### 2.3 Remove `onNavigate` prop drilling
All inner pages receive `onNavigate: (path: string) => void` as a prop, but `navigateTo`
is already a module-level singleton. In each page:

1. Add: `import { navigateTo } from '../app/routing/navigation'`
2. Remove: the `onNavigate` prop and its interface definition
3. Replace all `onNavigate(...)` calls with `navigateTo(...)`

Affected pages:
```
website/src/pages/DashboardPage.tsx
website/src/pages/SettingsPage.tsx
website/src/pages/AppPage.tsx
website/src/pages/ProfilePage.tsx
website/src/pages/ForbiddenPage.tsx
website/src/pages/InternalPage.tsx
website/src/pages/LoginPage.tsx
website/src/pages/SignupPage.tsx
```

In `routeRenderer.tsx`, remove all `onNavigate={navigateTo}` prop passes.
`LoginPage` uses `readNextPath()` — import it directly in `LoginPage.tsx`.

### 2.4 Add loading state to `AppRouter.tsx`
Replace `return null` during `isInitializing` with:
```tsx
return (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="size-6 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
  </div>
)
```

**Done when:** All 4 redirect scenarios work correctly (unauthenticated, authenticated-to-login,
insufficient role, mode-blocked). No TypeScript warnings on unused props.

---

## Phase 3 — UI Consistency

**Goal:** Unify styling across inner pages. No logic changes.

### 3.1 Align `SettingsPage` and `AppPage` to the token system
Both pages use raw `zinc-*`/`cyan-*` classes. Replace with semantic tokens matching `DashboardPage`:

| Replace | With |
|---|---|
| `bg-zinc-900/80` | `bg-card` |
| `border-zinc-700` | `border-border` |
| `text-zinc-300` | `text-muted-foreground` |
| `bg-cyan-500` | `bg-primary` |
| `text-black` (on button) | `text-primary-foreground` |
| `border-zinc-500` | `border-border` |
| `text-white` (heading) | `text-foreground` |

Set `<LanguageSwitcher variant="light" />` on both pages.

### 3.2 Differentiate `BenefitGrid` icons — `MarketingBlocks.tsx`
All 3 benefit cards use the same `<Sparkles>` icon. Assign distinct icons:
```ts
const benefitIcons = [Zap, Monitor, Workflow]
// Use benefitIcons[index] ?? Sparkles in the map
```
Verify `Zap`, `Monitor`, `Workflow` are already imported from `lucide-react`.

### 3.3 Fix mobile menu accessibility — `MarketingBlocks.tsx`
Add to the toggle button:
```tsx
aria-expanded={isMobileMenuOpen}
aria-controls="mobile-nav-menu"
```
Add `id="mobile-nav-menu"` to the menu panel `<div>`.

### 3.4 Fix `DesktopPreview` step icons — `MarketingBlocks.tsx`
`item.label.slice(0, 1)` is fragile across translations. Replace with explicit icons:
```ts
import { Zap, GitBranch, Layers, Play } from 'lucide-react'
const stepIcons = [Zap, GitBranch, Layers, Play]
// Render <Icon className="size-4" /> instead of the letter div
```

**Done when:** `AppPage`, `SettingsPage`, `DashboardPage` look visually consistent.
No raw `zinc-*` or `cyan-*` classes remain in inner page files.

---

## Phase 4 — Copy Rewrite

**Goal:** Replace AI-generated meta-commentary and developer notes with real product copy.
Changes are i18n JSON only — no code changes.

### Keys to fix in both `en/common.json` and `de/common.json`

| Key | Problem | Replace with |
|---|---|---|
| `landing.sections.features.description` | AI strategy note | Description of actual feature set |
| `landing.sections.extensions.description` | AI framing note | Description of what extensions section shows |
| `landing.sections.trust.description` | "The website should feel credible..." | One honest sentence about product signals |
| `landing.sections.faq.description` | "These answers reflect the current repository state..." | Invite to read FAQ |
| `landing.cta.title` | "Follow the product direction without promising a public download yet." | Real CTA headline |
| `landing.cta.description` | AI instruction rendered as paragraph text | Product-focused access invitation |
| `cta.finalLabel` | Literal `"Final CTA"` rendered as eyebrow text | `"Early access"` |
| `dashboard.description` | "Protected dashboard route prepared for future user accounts." | `"Your TriggerHub account dashboard."` |
| `appPage.description` | "Protected application shell. This route remains protected in all modes." | `"TriggerHub app."` |
| `profile.identityNote` | "Identity is managed separately from auth/session. Current role: {{role}}" | `"Role: {{role}}"` |

Keep the existing tone: honest, specific, no hype, no promises the product cannot keep.
Both locale files must be updated in the same commit.

**Done when:** No section description reads like a content strategy document.
No raw i18n key strings appear on any page. Both locales are in sync.

---

## Phase 5 — SEO and Metadata

**Goal:** Ensure correct representation in search, social share, and browsers.

### 5.1 Rewrite meta description — `en/common.json`, `de/common.json`
Current description is 178 chars of developer language. Replace with ≤160 chars of product language:
```
"TriggerHub automates creator workflows on Windows. Connect OBS, Spotify, and your tools
with triggers and macros — runs locally, no cloud required."
```
Update `ogDescription` similarly.

### 5.2 Add `og:image` and `twitter:card` — `website/index.html`
```html
<meta property="og:image" content="https://triggerhub.de/og-image.png" />
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:image" content="https://triggerhub.de/og-image.png" />
```
Also wire dynamically in `DocumentHead.tsx`. Place a 1200×630px image at `website/public/og-image.png`.

### 5.3 Add canonical link — `website/index.html` + `DocumentHead.tsx`
Static fallback in `index.html`:
```html
<link rel="canonical" href="https://triggerhub.de/" />
```
Dynamic update in `DocumentHead.tsx`:
```ts
let canonical = document.querySelector('link[rel="canonical"]')
if (!canonical) {
  canonical = document.createElement('link')
  canonical.setAttribute('rel', 'canonical')
  document.head.appendChild(canonical)
}
canonical.setAttribute('href', `https://triggerhub.de${window.location.pathname}`)
```

### 5.4 Create `robots.txt` — `website/public/robots.txt`
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

### 5.5 Create `sitemap.xml` — `website/public/sitemap.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://triggerhub.de/</loc><priority>1.0</priority></url>
  <url><loc>https://triggerhub.de/login</loc><priority>0.3</priority></url>
</urlset>
```

### 5.6 Fix duplicate-content routes — `vercel.json`
`/features`, `/pricing`, `/about` all render the landing page (same content, three URLs).
Add 301 redirects and remove these routes from `routeManifest.ts` and `routeRenderer.tsx`:
```json
{ "source": "/features", "destination": "/", "permanent": true },
{ "source": "/pricing",  "destination": "/", "permanent": true },
{ "source": "/about",    "destination": "/", "permanent": true }
```
Verify `normalizeRoutePath` fallback handles unknown paths gracefully before removing routes.

**Done when:** `curl -I https://triggerhub.de/features` returns `301`. `/robots.txt` and
`/sitemap.xml` return 200. No protected route appears in the sitemap.

---

## Phase 6 — Final QA

**Goal:** Verify nothing is broken before shipping.

### Build
```bash
cd website && npm run build
# Must complete with 0 errors
```

### Route matrix
| Route | Expected |
|---|---|
| `/` | Landing page renders, all sections visible |
| `/login` | Login form; redirects to `/dashboard` if authenticated |
| `/dashboard` | Redirects to `/login?next=/dashboard` if unauthenticated |
| `/profile` | Redirects to `/login?next=/profile` if unauthenticated |
| `/settings` | Redirects to `/login?next=/settings` if unauthenticated |
| `/logout` | Clears session, redirects to `/login` |
| `/forbidden` | Forbidden page renders |
| `/internal` | Redirects unless role is `owner` |
| `/signup` | Redirects to `/login` |
| `/features` | 301 → `/` |
| `/pricing` | 301 → `/` |
| `/about` | 301 → `/` |

### Checklist
- [ ] `npm run build` — zero errors
- [ ] No raw i18n key strings visible on any page in EN or DE
- [ ] Language switcher works; all sections translate correctly
- [ ] No `console.error` or `console.warn` in browser devtools on any route
- [ ] Mobile menu `aria-expanded` reflects open/closed state
- [ ] Inner pages (Dashboard, Settings, App) are visually consistent
- [ ] `AppPage` and `SettingsPage` contain no `zinc-*` or `cyan-*` classes
- [ ] `/robots.txt` accessible, excludes protected routes
- [ ] `/sitemap.xml` accessible, contains only public URLs
- [ ] Lighthouse scores: Performance ≥ 85, Accessibility ≥ 90, SEO ≥ 90

---

## Execution Order

```
Phase 1  →  Phase 2  →  Phase 3
                     →  Phase 4   (can run parallel with 2 and 3)
Phase 5  (after 1–4)
Phase 6  (after all)
```

**Estimated effort:** ~10–12 hours total. Each phase is independently committable.

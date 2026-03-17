## Product Idea

- **TriggerHub Desktop**: Local automation hub that connects core creator tools (OBS, Twitch, Spotify, clip export) through a trigger- and macro-based runtime. The desktop app coordinates an event bus, trigger engine, macro engine, and plugin system to run automation workflows on the user’s machine.
- **TriggerHub Website**: Companion web app for marketing, onboarding, and authenticated owner access. It provides auth, access control, and a profile system and is deployed separately from the desktop app.
- **Design Workspace**: A separate design project that hosts the shared visual language and shadcn/ui-based components used as reference for both desktop and website UIs.

## Target Users

- **Primary users (implied by integrations)**:
  - Streamers and live content creators using **OBS** and **Twitch**.
  - Creators who use **Spotify** and local **clip export** as part of their streaming/recording workflow.
- **Secondary stakeholders (from docs and agents)**:
  - Product, release, and operations roles who rely on the website status content and CI/release metadata.

> **Note:** The exact commercial positioning and messaging live mostly in `project-meta/product/*.json` and marketing content; this overview stays within what is directly supported by code, tests, and status docs.

## Main Features

### Desktop App

- **Event-Driven Core**
  - In-memory **EventBus** with namespaced topics and wildcards (`src/core/event-bus`).
  - Strongly-typed event topics defined in `src/types/domain.ts` (`EventTopics`).
- **Trigger Engine**
  - Graph-based trigger registry (`TriggerGraph`) with dual indices.
  - Condition evaluation and action dispatch via `TriggerExecutor`.
  - Emits `trigger:executed` events for UI refresh.
- **Macro System**
  - Macro definitions and step execution (`MacroEngine`, `MacroRunner`) with nesting support.
  - Emits `macro:completed` events for UI refresh.
- **Services**
  - **OBS**, **Spotify**, **Clip**, **Twitch** services with in-memory transports by default and HTTP transports available for OBS/Spotify/Twitch.
  - Shared HTTP client and reliability policies in `src/services/shared`.
- **Plugin System**
  - `PluginRegistry` and `PluginContext` ports; example plugin wired into the runtime.
- **Runtime & Persistence**
  - `createAppModuleContainer` in `src/app/bootstrap.ts` wires engines, services, plugins, and storage.
  - Storage IPC and persistence for triggers/macros via `storageBridge`, `StoragePort`, and Electron IPC (verified by `storage.test.ts` and `ipc-storage-bridge.e2e.test.ts`).
- **Desktop UI**
  - React + TypeScript SPA (`src/main.tsx`, `src/App.tsx`).
  - Pages for Dashboard, Trigger editor, Macro editor, Plugins, and Settings (`src/ui/pages`).
  - Shared layout and components (`src/ui/components`, `src/ui/layout`), including an `ErrorBoundary`.

### Website

- **Auth and Access Control**
  - Auth module with server-backed login/logout/session handling (`website/src/modules/auth`).
  - Access control policies and runtime config (`website/src/modules/access-control`, `website/src/config/runtimeConfig.ts`).
  - Profile module with validation and file-backed storage (`website/src/modules/profile`).
  - Route guards and routing manifest (`website/src/app/routing/*`).
- **API Routes**
  - Auth and profile APIs under `website/api`, with security middleware and CSRF protections.
- **Content and Status**
  - Generated content for features, integrations, and status, sourced from `project-meta` and `project-context`.
  - Vercel deployment configuration and documentation.

### Design & Tooling

- **Design System**
  - Independent Vite project in `design/` with shadcn/ui-derived components and shared styles.
- **Packaging Tool**
  - `tools/exe-builder` for Windows NSIS packaging and installer scripts.
- **CI/CD and Quality Gates**
  - GitHub Actions workflows for quality gates, desktop CI, release packaging, website updates, context sync, and agent validation.

## Current Maturity (Repository State)

- **Core engines and runtime**
  - Trigger engine, macro engine, event bus, plugin registry, and storage/persistence are **implemented and covered by tests** (`IMPLEMENTATION_STATUS.md`, `DEV_STATUS.md`, `alpha-readiness.md`, `src/tests/*`).
- **Desktop UI**
  - Dashboard is **fully wired** to the runtime via `TriggerHubAppFacade`.
  - Trigger and macro editor pages, plugins page, and settings page exist and are connected to the facade, but their UX and flows are still evolving.
- **Website**
  - Auth v1 (owner-centric) and profile system are **implemented and tested**.
  - Access modes (`private_prelaunch`, `invite_only`, `public_product`) are modeled; current effective runtime mode is documented as constrained to `private_prelaunch` in status docs, while the code uses a configurable access mode resolver.
- **Infrastructure**
  - CI/CD workflows for typecheck, tests, audits, website build, desktop CI, and release packaging are present and referenced as passing in `project-meta/status/build-status.json`.
  - Windows NSIS packaging is configured and can produce installers, but live release verification is still called out as pending in release status docs.

### Uncertainties and Documentation Drift

- **Website access mode**
  - `website/README.md` describes `public_product` as the current default/active mode.
  - More recent status docs (`alpha-readiness.md`, `project-meta/status/release-status.md`) describe the effective runtime as constrained to `private_prelaunch`.
  - **Interpretation:** The code supports all three modes; the currently intended deployment mode should be inferred from env configuration, which is not checked into the repo. This documentation treats the status docs as authoritative for “current deployment intent”.
- **Service integration depth**
  - OBS, Spotify, Clip, and Twitch services all exist in code with in-memory and HTTP transports, but production-grade integrations (real OBS WebSocket, Spotify OAuth, real clip capture) are still flagged as gaps in multiple docs.
  - This overview assumes: **services are functionally implemented and test-covered, but not yet configured for real external production use**.


# Content Engine QA Review

## Agent
QA Agent

## Scope
Validate `marketing/content-ideas/content-backlog.md` and `marketing/content-ideas/content-series.md` against:
- `docs/triggerhub_gesamtuebersicht.md`
- `docs/ai-context/PROJECT_SNAPSHOT.md`
- `docs/ai-context/IMPLEMENTATION_STATUS.md`
- `marketing/messaging/messaging-core.md`

## Kritische Fehler
- None in the saved backlog, because claims that exceed the current product stage are explicitly labeled `not_publishable` and not presented as approved external messaging.

## Mittlere Probleme
- `vision_only` entries can become misleading if shortened into social posts without an explicit roadmap label. They require manual framing before publication.

## Niedrige Probleme
- Some `safe_now` ideas reference dashboard connectivity and service status. Those remain valid only while copy keeps the distinction between UI state visibility and production-ready integrations.

## Testvorschlaege
- Before drafting, filter backlog entries by `Claim Safety Level`.
- Require a final check that any mention of OBS, Spotify, clips, plugins, or editor workflows still matches `docs/ai-context/IMPLEMENTATION_STATUS.md`.
- Reject any draft that implies complete external integration, plugin marketplace availability, or finished editor/settings/plugin UX.

## Gesamtbewertung
Pass. The content engine matches the current TriggerHub development phase and avoids presenting unimplemented features as available, provided `vision_only` and `not_publishable` labels are respected.

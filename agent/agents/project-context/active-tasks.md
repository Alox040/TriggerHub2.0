# Active Tasks

## 2026-03-10
- Marketing-Operations-Foundation initialisiert unter `marketing/`.
- Messaging-Source-of-Truth erstellt: `marketing/messaging/messaging-core.md`.
- Starter-Templates fuer Content, Campaigns, Waitlist, Analytics und Automation angelegt.
- Marketing-Dokumentation und QA-Claim-Review ergaenzt.
- Projektkontext fuer Marketing-Workflow aktualisiert.

## 2026-03-11
- Content-Engine fuer Build-in-Public-Marketing unter `marketing/content-ideas/` angelegt.
- 30 Content-Ideen in vier Serien dokumentiert und mit Claim-Safety-Levels versehen.
- Content-Serien, Publishing-Regeln und Arbeitsablauf dokumentiert.
- Produktkontext fuer Content-Engine-Nutzung aktualisiert.
- Marketing-Automation-Blueprint unter `marketing/automation/marketing-automation-blueprint.md` erstellt.
- Automation-Use-Cases, Pipeline-Design und Stack-Empfehlungen dokumentiert.
- Projektkontext fuer Marketing-Automation in `architecture-overview.md` ergaenzt.
- Architekturentscheidung getroffen: eigener `marketing-ops-agent` statt Erweiterung von Product + Docs.
- Neuer Agent spezifiziert unter `agent/agents/core/10-marketing-ops.md`.
- Rollenpruefung fuer Marketing Ops dokumentiert.

## Offene naechste Marketing-Aufgaben
- Erste Waitlist-Landing-Page-Messaging-Variante aus `marketing/messaging/messaging-core.md` ableiten.
- 10 konkrete Creator-Content-Ideen im Content-Backlog ausarbeiten.
- Alpha-/Early-Access-Claim-Check vor externer Kommunikation standardisieren.
- Erste 4 `safe_now` Ideen in kanal-spezifische Post-Drafts ueberfuehren.
- `vision_only` und `not_publishable` Ideen als interne Guardrail-Beispiele markieren, falls Content recycelt wird.
- Ersten lokalen Script-Prototyp fuer `feature change -> content idea` definieren.
- CRM-/Form-Tool fuer `waitlist signup -> lead segmentation` festlegen.
- Entscheidung treffen, ob der neue Agent auch im primaeren `agents/core/` Pfad gespiegelt werden soll.

## Bestehende Delivery-Aufgaben
- Root-Projekt als Windows-Desktop-Distribution konfigurieren.
- Electron-Wrapper und electron-builder + NSIS fuer Setup/Installation integrieren.
- Release-Artefakte nach `dist/` sammeln.
- Build- und Release-Dokumentation ergaenzen.

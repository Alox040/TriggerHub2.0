## Kommunikationsanpassungen – Produktversprechen vs. Implementierungsstand

### 1) Meta-Beschreibung Website

- **Alte Aussage**  
  `"TriggerHub automates creator and streaming workflows with triggers, macros, and desktop integrations for focused local execution."`
- **Neue Formulierung**  
  `"TriggerHub is a Windows desktop app that brings triggers, macros, and local actions together for creator workflows. Current early access focuses on core automation modules; service adapters and integrations are under active development."`
- **Grund der Änderung**  
  Die alte Formulierung suggerierte bereits heute vollwertige Desktop‑Integrationen. Tatsächlich sind nur Kernmodule produktionsreif; OBS/Spotify/Clip existieren als Adapter/Module, aber ohne stabile End‑to‑End‑Pfad. Die neue Version benennt klar den Early‑Access‑Status und grenzt Integrationen als „in Entwicklung“ ab.  
- **Betroffene Datei**  
  `website/src/i18n/locales/en/common.json` (`meta.description`, `meta.ogDescription`)  

### 2) Hero‑Beschreibung Landing Page (EN)

- **Alte Aussage**  
  Fokus auf „tool actions to work together locally“ plus Formulierung, die implizit vollständige OBS/Spotify‑Adapter als Teil des aktuellen Produktumfangs suggeriert.  
- **Neue Formulierung**  
  Beschreibung betont weiterhin Desktop‑Automatisierung, ergänzt aber: Repository trägt „focused product scope with core automation modules and early-stage service adapters; full end-to-end integrations are in active development.“  
- **Grund der Änderung**  
  Klarstellung, dass OBS/Spotify/Clip‑Adapter im Code vorhanden, aber noch nicht als stabile Produkt‑Integrationen zu verstehen sind. Vermeidet Überversprechen und bleibt dennoch vermarktbar.  
- **Betroffene Datei**  
  `website/src/i18n/locales/en/common.json` (`landing.hero.description`)  

### 3) Feature Card „Focused desktop integrations“

- **Alte Aussage**  
  `"Current repository evidence supports OBS control, Spotify actions, clip export modules, and plugin-ready extension points."` mit neutralem Titel „Focused desktop integrations“.  
- **Neue Formulierung**  
  Titel: `"Focused desktop integrations (in development)"`  
  Text: Integrationen als „early“/„experimental“ gekennzeichnet, expliziter Hinweis, dass sie nicht produktionsreif sind.  
- **Grund der Änderung**  
  Ursprünglich klang es wie verfügbare, belastbare Integrationen. Die Analyse (C‑02/C‑03/C‑04) zeigt jedoch Stub‑/Teilimplementierungen. Die neue Fassung verankert klar den Status „in Entwicklung/experimentell“.  
- **Betroffene Datei**  
  `website/src/i18n/locales/en/common.json` (`landing.featureCards.items[2]`)  

### 4) FAQ zu Integrationen (EN)

- **Alte Aussage**  
  `"The repository currently shows OBS and Spotify service adapters, clip modules, and plugin scaffolding. This website does not claim broader integrations beyond that evidence."`
- **Neue Formulierung**  
  Ergänzt den Hinweis, dass diese Bereiche als „in development“ bzw. „experimental“ gelten und nicht als stabile End‑to‑End‑Integrationen verstanden werden sollen.  
- **Grund der Änderung**  
  Vorherige Version war ehrlich bezüglich Umfang, aber nicht zum Reifegrad. Die neue Antwort schließt die Lücke zwischen vorhandenem Code und tatsächlicher Nutzbarkeit.  
- **Betroffene Datei**  
  `website/src/i18n/locales/en/common.json` (`landing.faq.items[1].answer`)  

### 5) Deutsche Meta‑ und Hero‑Texte

- **Alte Aussage**  
  Starke Formulierungen zu „Automatisierung … mit Triggern, Makros und Desktop‑Integrationen“ sowie Hinweis auf OBS‑/Spotify‑Adapter ohne Statusangabe.  
- **Neue Formulierung**  
  Betont Desktop‑App mit Kernmodulen; Service‑Adapter und Integrationen werden explizit als „in aktiver Entwicklung“ bzw. „frühe Adapter“ beschrieben.  
- **Grund der Änderung**  
  Angleichen an den tatsächlichen Produktstand und an die englische Version; Vermeidung des Eindrucks einer bereits voll integrierten Lösung.  
- **Betroffene Datei**  
  `website/src/i18n/locales/de/common.json` (`meta.*`, `landing.hero.description`)  

### 6) Deutsche Feature Card „Fokussierte Desktop‑Integrationen“

- **Alte Aussage**  
  Darstellung von OBS‑Steuerung, Spotify‑Aktionen und Clip‑Export‑Modulen ohne Reifegrad‑Hinweis.  
- **Neue Formulierung**  
  Titel mit Zusatz „(in Entwicklung)“, Beschreibung und Bullets markieren Adapter/Module als „in Entwicklung“ bzw. „experimentell“.  
- **Grund der Änderung**  
  Vermeidung des Eindrucks, dass OBS/Spotify/Clip heute schon zuverlässig nutzbar sind, obwohl laut Gap‑Analyse End‑to‑End‑Pfade fehlen.  
- **Betroffene Datei**  
  `website/src/i18n/locales/de/common.json` (`landing.featureCards.items[2]`)  

### 7) Deutsche FAQ zu Integrationen

- **Alte Aussage**  
  Betonung, dass OBS/Spotify‑Adapter, Clip‑Module und Plugin‑Gerüst existieren, ohne Statushinweis.  
- **Neue Formulierung**  
  Gleicher Umfang, aber Klarstellung, dass es sich um „in Entwicklung“ bzw. „experimentell“ gekennzeichnete Bereiche handelt.  
- **Grund der Änderung**  
  Stellt die Brücke zwischen implementiertem Code und tatsächlicher Produktreife her; verringert Risiko von Fehlinterpretationen auf Deutsch.  
- **Betroffene Datei**  
  `website/src/i18n/locales/de/common.json` (`landing.faq.items[1].answer`)  

### 8) Integration Library – Einzelintegrationen

- **Alte Aussage**  
  Marketingtexte wie:  
  - `"OBS Studio" – Control scenes, sources, recording, and streaming with real-time automation`  
  - `"Spotify" – Manage playlists, control playback, and sync music with your stream events`  
  - `"Twitch" – React to followers, subs, raids, chat commands and channel point redeems`  
  - plus konkrete, heute nicht verfügbare Beispiele und SaaS‑ähnliche Integrationsbreite (Discord, YouTube, Philips Hue, Stream Deck, Webhooks).  
- **Neue Formulierung**  
  - Umbenennung der Namen zu `"OBS Studio (in development)"`, `"Spotify (in development)"`, `"Twitch (partial)"`, `"… (planned)"` für weitere Tools.  
  - Beschreibungen betonen vorhandene Adapter/Architektur oder reine Roadmap‑Richtung („conceptual“, „planned“, „not yet implemented“).  
  - Beispiele explizit als „Experimental“ oder „Planned/Concept“ markiert.  
- **Grund der Änderung**  
  Die ursprünglichen Texte suggerierten heute verfügbare, stabile Integrationen und zahlreiche zusätzliche Tools, die im Code nicht existieren. Die neuen Texte erhalten die Vision („was möglich werden soll“), markieren den Status aber klar als in Entwicklung/ geplant.  
- **Betroffene Datei**  
  `website/src/components/IntegrationLibrary.tsx`  

### 9) Integration Library – Kopfzeile

- **Alte Aussage**  
  `"Connect OBS, Twitch, Spotify, Discord and 50+ creator tools in one automation platform"`  
- **Neue Formulierung**  
  `"Explore existing adapters and planned integrations for creator tools. Current early access focuses on desktop runtime and core modules; most integrations are in development or planned."`  
- **Grund der Änderung**  
  Verhindert die Behauptung einer heute schon verfügbaren „50+ Tools“-Plattform und rückt den Fokus auf aktuelle Adapter und Roadmap‑Integrationen.  
- **Betroffene Datei**  
  `website/src/components/IntegrationLibrary.tsx`  

### 10) Automation Examples – Szenario‑Status

- **Alte Aussage**  
  Drei voll durchformulierte Workflows („Stream Workflow“, „Engagement Alert“, „Content Pipeline“) formuliert als bereits einsatzfähige Automationen, z. B.:  
  - `"This automation detects when your stream goes live, automatically switches to your gameplay scene, and starts your curated Spotify playlist - all without manual intervention."`  
  - `"Automatically save clips to your local drive and send a Discord notification to your editor …"`  
- **Neue Formulierung**  
  - Titel und Beschreibungen um Statuszusätze ergänzt: „(concept)“, „(planned)“, „(experimental)“.  
  - Detailtexte erklären, dass es sich um Zielbilder bzw. experimentelle Richtungen handelt und dass heute vor allem Trigger‑/Makro‑Engine plus frühe Adapter existieren.  
- **Grund der Änderung**  
  Vermeidet zu suggerieren, dass diese komplexen End‑to‑End‑Automationen bereits zuverlässig im Produkt verfügbar sind, hält aber die Produktvision sichtbar.  
- **Betroffene Datei**  
  `website/src/components/AutomationExamples.tsx`  

### 11) Pricing‑Sektion

- **Alte Aussage**  
  Drei vollwertige SaaS‑Pläne („Free“, „Creator“, „Pro“) mit Features wie „All integrations“, „Cloud sync“, „Plugin SDK access“, „White-label options“ etc.  
- **Neue Formulierung**  
  Eine einzelne, klar als konzeptionell markierte Stufe: `"Early Access (concept)"` mit Fokus auf Desktop‑Alpha, Kernmodule und experimentelle Adapter. CTA: „Request early access“.  
- **Grund der Änderung**  
  Die ursprüngliche Pricing‑Sektion vermittelte den Eindruck eines bereits marktreifen SaaS‑Produkts mit ausgerollten Integrationen, Cloud‑Sync und Support‑Modellen, die im Code und Projektstatus nicht existieren. Die neue Fassung rahmt Pricing klar als Zukunftsbild für einen späteren öffentlichen Launch.  
- **Betroffene Datei**  
  `website/src/components/Pricing.tsx`  


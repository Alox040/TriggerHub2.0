 Codex-Plan: Website-Architektur + Text-Rewrite

  ---
  Kontext

  Produkt: TriggerHub 2.0 — Windows Desktop-Automatisierungs-App für Streamer/Content Creator.      
  Kernfunktion: OBS, Spotify, Twitch und Clip-Recording in einer lokalen Automatisierungsschicht    
  verbinden. Trigger + Makro-Regeln definieren, die lokal auf Windows ausgeführt werden. Kein       
  Cloud-Dienst.

  Problem mit dem aktuellen Text: Die Marketing-Copy spricht aus Entwicklerperspektive über das     
  Repository ("The repository already contains...", "This website does not claim..."). Kein
  User-facing Language. Umlaute in de/common.json komplett kaputt (ue/oe/ae statt ü/ö/ä).

  ---
  Ziel

  1. Seitenstruktur auf 5 Abschnitte reduzieren (von 7)
  2. Marketing-Copy komplett neu schreiben — nutzerfokussiert, kein Repository-Sprech
  3. Deutsche Umlaute fixen
  4. Nav-Links aktualisieren

  ---
  Schritt 1 — website/src/pages/WebsiteLandingPage.tsx vereinfachen

  Entferne folgende Abschnitte (und ihre Importe):
  - BenefitGrid + Benefits-Section (fold in Hero)
  - FeatureCardGrid für Extensions-Section (Roadmap ≠ Landing Page)
  - TrustGrid + Trust-Section (defensive, kein User-Value)

  Neue Datei:

  import { useTranslation } from 'react-i18next'
  import {
    FaqSection,
    FeatureCardGrid,
    MarketingCta,
    MarketingHero,
    MarketingSection,
    MarketingShell,
    WorkflowSteps,
    useHashSectionSync,
  } from '../components/MarketingBlocks'
  import { navigateTo } from '../app/routing/navigation'

  type TextCard = { title: string; description: string }
  type BulletCard = TextCard & { bullets?: string[] }
  type FaqItem = { question: string; answer: string }

  export const WebsiteLandingPage = () => {
    const { t } = useTranslation()
    useHashSectionSync()

    const featureCards = t('landing.featureCards.items', { returnObjects: true }) as BulletCard[]   
    const workflowSteps = t('landing.workflowSteps.items', { returnObjects: true }) as TextCard[]   
    const faqItems = t('landing.faq.items', { returnObjects: true }) as FaqItem[]

    return (
      <MarketingShell onNavigate={navigateTo}>
        <main>
          <MarketingHero
            title={t('landing.hero.title')}
            description={t('landing.hero.description')}
            proofPoints={t('landing.hero.proofPoints', { returnObjects: true }) as string[]}        
            onNavigate={navigateTo}
          />

          <MarketingSection
            id="features"
            eyebrow={t('landing.sections.features.eyebrow')}
            title={t('landing.sections.features.title')}
            tone="dark"
          >
            <FeatureCardGrid items={featureCards} />
          </MarketingSection>

          <MarketingSection
            id="workflow"
            eyebrow={t('landing.sections.workflow.eyebrow')}
            title={t('landing.sections.workflow.title')}
          >
            <WorkflowSteps steps={workflowSteps} />
          </MarketingSection>

          <MarketingSection
            id="faq"
            eyebrow={t('landing.sections.faq.eyebrow')}
            title={t('landing.sections.faq.title')}
          >
            <FaqSection items={faqItems} />
          </MarketingSection>

          <MarketingCta
            title={t('landing.cta.title')}
            description={t('landing.cta.description')}
            onNavigate={navigateTo}
          />
        </main>
      </MarketingShell>
    )                                                                                                 }
                                                                                                    
  ---
  Schritt 2 — website/src/components/MarketingBlocks.tsx — Nav-Links
                                                                                                    
  Zeilen 64–70 — sectionLinks in MarketingShell ersetzen:
                                                                                                      const sectionLinks = [
    { id: 'features', label: t('nav.features') },                                                   
    { id: 'workflow', label: t('nav.howItWorks') },                                                 
    { id: 'faq', label: t('nav.faq') },                                                               ]                                                                                                 
                                                                                                      Keine anderen Änderungen an MarketingBlocks.tsx.                                                     
  ---                                                                                               
  Schritt 3 — website/src/i18n/locales/en/common.json — vollständig ersetzen
                                                                                                    
  Behalte alle Schlüssel unter: auth, dashboard, profile, settings, forbidden, appPage, internal,
  errors, languageSwitcher — unverändert.                                                              
  Ersetze / entferne:                                                                               
  - legacy-Namespace → komplett löschen
  - landing.benefits, landing.trustItems, landing.extensionCards → löschen                            - landing.sections.benefits, landing.sections.trust, landing.sections.extensions → löschen
  - nav.benefits, nav.extensions → löschen                                                                                                    
  Neuer Text für alle Marketing-Schlüssel:                                                          
                                                                                                      "meta": {                                                                                         
    "title": "TriggerHub — Desktop automation for streamers",                                       
    "description": "Automate your stream setup on Windows. Connect OBS, Spotify, and your clip      
  workflow in one local automation layer.",                                                             "ogTitle": "TriggerHub — Automate your stream setup",                                           
    "ogDescription": "Connect OBS, Spotify, and your clip workflow. Build triggers and macros that  
  run locally on Windows."                                                                            },                                                                                                
  "header": {                                                                                       
    "logo": "TRIGGERHUB",
    "tagline": "Automation for stream workflows",                                                       "protectedAccess": "Sign in"
  },                                                                                                  "nav": {
    "features": "Features",                                                                         
    "howItWorks": "How it works",
    "faq": "FAQ"
  },                                                                                                  "footer": {
    "productInfo": "Desktop automation for Windows. Local-first, early access only.",               
    "product": "Product",                                                                               "links": "Links",
    "githubRepository": "GitHub",                                                                   
    "protectedAccess": "Sign in"                                                                      },
  "hero": {                                                                                         
    "badge": "Windows desktop — early access",
    "requestAccess": "Request access",                                                              
    "seeCapabilities": "See how it works"                                                           
  },                                                                                                  "landing": {                                                                                      
    "hero": {                                                                                       
      "title": "Stop switching tools mid-stream.",                                                  
      "description": "TriggerHub runs on Windows and connects OBS, Spotify, and your clip workflow  
  into one automation layer. Build a trigger once, run it every stream.",                                 "proofPoints": [                                                                              
        "Runs locally on Windows",                                                                  
        "OBS, Spotify, and clip control",                                                                   "Early access only"                                                                         
      ]                                                                                             
    },
    "sections": {                                                                                   
      "features": {                                                                                         "eyebrow": "What's in the app",                                                             
        "title": "The pieces that make automation work."                                            
      },                                                                                                  "workflow": {                                                                                 
        "eyebrow": "How it works",                                                                  
        "title": "Three steps from setup to execution."
      },                                                                                                  "faq": {
        "eyebrow": "FAQ",                                                                           
        "title": "Straight answers."
      }                                                                                                 },
    "featureCards": {                                                                               
      "items": [  
        {
          "title": "Triggers and conditions",
          "description": "React to events from OBS, Spotify, Twitch, or a hotkey. Add conditions so 
  a trigger only fires when the situation calls for it.",                                                     "bullets": [                                                                              
            "Event-based execution",                                                                
            "Conditional checks before actions run",                                                
            "Works with your existing desktop setup"                                                
          ]                                                                                                 },                                                                                          
        {                                                                                           
          "title": "Reusable macros",
          "description": "Group a sequence of steps into one macro. Call it from multiple triggers, 
  chain it with other macros, or run it standalone.",                                                         "bullets": [                                                                              
            "Sequential and parallel steps",                                                        
            "Macros that call other macros",
            "Write once, reuse across workflows"                                                              ]
        },                                                                                          
        {
          "title": "Desktop integrations",
          "description": "Control OBS scenes and sources. Manage Spotify playback. Export clips.    
  Everything runs in-process on your machine, no server involved.",                                           "bullets": [                                                                              
            "OBS scene and source control",                                                         
            "Spotify playback control",
            "Clip export and plugin hooks"
          ]                                                                                                 }
      ]                                                                                             
    },
    "workflowSteps": {
      "items": [
        {
          "title": "Pick the event",
          "description": "Choose what starts the workflow — OBS connecting, a hotkey press, a Twitch   event, or any signal your desktop already sends."                                                        },                                                                                          
        {                                                                                           
          "title": "Set the logic",
          "description": "Add conditions to filter when the workflow should run. Chain macros to    
  group actions into sequences you can reuse across triggers."                                              },                                                                                          
        {                                                                                           
          "title": "Run it locally",
          "description": "The runtime executes on your machine. No round-trips to a server. The same   trigger that works in testing fires the same way live."                                                  }
      ]                                                                                             
    },
    "faq": {
      "items": [
        {
          "question": "Is this a cloud service?",
          "answer": "No. TriggerHub is a Windows desktop app. Your automations and configuration    
  stay on your machine."                                                                                    },                                                                                          
        {                                                                                                     "question": "Which integrations work right now?",
          "answer": "OBS and Spotify have working adapters in the current build. Twitch events and  
  clip recording are in active development."                                                                },
        {                                                                                           
          "question": "Can I try it today?",
          "answer": "The product is in early access. Use the request form or reach out directly to  
  be added to the list."                                                                                    },                                                                                          
        {                                                                                           
          "question": "Does it run in the background during a stream?",
          "answer": "Yes. The automation runtime stays active while you stream. Triggers fire and
  macros execute without any app-switching."                                                                }
      ]                                                                                             
    },                                                                                                  "cta": {
      "title": "Early access is open.",                                                             
      "description": "TriggerHub is in active development. Request access or follow the build on
  GitHub."                                                                                              }
  },                                                                                                
  "desktopPreview": {
    "workflowOverview": "Workflow overview",
    "automationFlow": "Automation flow",
    "liveStreamStartup": "Live stream startup",                                                     
    "localRuntime": "Local runtime",                                                                    "trigger": "Trigger",                                                                           
    "triggerDesc": "An event from your setup",                                                      
    "condition": "Condition",                                                                       
    "conditionDesc": "Decides when the workflow continues",                                             "macro": "Macro",                                                                               
    "macroDesc": "A reusable sequence of actions",                                                  
    "action": "Action",
    "actionDesc": "Executes the change locally",                                                    
    "connectedSurface": "Connected tools",                                                          
    "obsControl": "OBS control",                                                                        "spotifyActions": "Spotify actions",                                                            
    "clipExport": "Clip export",                                                                    
    "pluginRuntime": "Plugin runtime",                                                                  "whyItMatters": "Why local?",                                                                   
    "whyItMattersText": "No server between the trigger and the result. What runs in testing runs the   same way mid-stream."                                                                              },                                                                                                
  "cta": {                                                                                          
    "finalLabel": "Early access",                                                                   
    "requestProtectedAccess": "Request access",                                                         "viewRepository": "GitHub"                                                                      
  }                                                                                                 

  ---
  Schritt 4 — website/src/i18n/locales/de/common.json — vollständig ersetzen
                                                                                                    
  Gleiche Struktur wie EN. Alle Umlauts korrekt (ü/ö/ä). legacy-Namespace entfernen.
                                                                                                      Alle Marketing-Schlüssel auf Deutsch:
                                                                                                    
  "meta": {       
    "title": "TriggerHub — Desktop-Automatisierung für Streamer",
    "description": "Automatisiere dein Stream-Setup auf Windows. Verbinde OBS, Spotify und deinen   
  Clip-Workflow in einer lokalen Automatisierungsschicht.",                                             "ogTitle": "TriggerHub — Automatisiere dein Stream-Setup",                                      
    "ogDescription": "OBS, Spotify und Clip-Workflow verbinden. Trigger und Makros bauen, die lokal 
  auf Windows laufen."                                                                                },
  "header": {                                                                                       
    "logo": "TRIGGERHUB",
    "tagline": "Automatisierung für Stream-Workflows",                                              
    "protectedAccess": "Anmelden"                                                                   
  },                                                                                                  "nav": {                                                                                          
    "features": "Funktionen",                                                                       
    "howItWorks": "So funktioniert es",
    "faq": "FAQ"
  },                                                                                                
  "footer": {                                                                                           "productInfo": "Desktop-Automatisierung für Windows. Lokal, kein Cloud-Zugriff. Nur Early       
  Access.",                                                                                             "product": "Produkt",
    "links": "Links",                                                                               
    "githubRepository": "GitHub",                                                                   
    "protectedAccess": "Anmelden"                                                                   
  },                                                                                                
  "hero": {                                                                                             "badge": "Windows Desktop — Early Access",                                                      
    "requestAccess": "Zugriff anfragen",                                                            
    "seeCapabilities": "So funktioniert es"                                                         
  },                                                                                                  "landing": {                                                                                      
    "hero": {                                                                                       
      "title": "Hör auf, Tools mitten im Stream zu wechseln.",                                      
      "description": "TriggerHub läuft auf Windows und verbindet OBS, Spotify und deinen            
  Clip-Workflow in einer Automatisierungsschicht. Trigger einmal bauen, jeden Stream nutzen.",            "proofPoints": [                                                                              
        "Läuft lokal auf Windows",                                                                  
        "OBS, Spotify und Clip-Steuerung",
        "Nur Early Access"                                                                          
      ]                                                                                                 },                                                                                              
    "sections": {                                                                                   
      "features": {
        "eyebrow": "Was in der App steckt",
        "title": "Die Bausteine, die Automatisierung möglich machen."
      },                                                                                                  "workflow": {
        "eyebrow": "So funktioniert es",                                                            
        "title": "Drei Schritte von der Einrichtung zur Ausführung."
      },                                                                                                  "faq": {
        "eyebrow": "FAQ",                                                                           
        "title": "Direkte Antworten."
      }                                                                                             
    },                                                                                                  "featureCards": {                                                                               
      "items": [                                                                                            {
          "title": "Trigger und Bedingungen",                                                       
          "description": "Reagiere auf Ereignisse von OBS, Spotify, Twitch oder einer
  Tastenkombination. Bedingungen stellen sicher, dass ein Trigger nur dann auslöst, wenn es passt.",          "bullets": [
            "Ereignisbasierte Ausführung",                                                          
            "Bedingungsprüfung vor jeder Aktion",                                                   
            "Funktioniert mit deinem bestehenden Setup"                                             
          ]                                                                                                 },                                                                                          
        {                                                                                           
          "title": "Wiederverwendbare Makros",
          "description": "Fasse eine Aktionsfolge in einem Makro zusammen. Aus mehreren Triggern    
  aufrufbar, mit anderen Makros verkettbar oder eigenständig ausführbar.",                                    "bullets": [                                                                              
            "Sequenzielle und parallele Schritte",                                                  
            "Makros rufen andere Makros auf",                                                                   "Einmal bauen, überall nutzen"
          ]                                                                                         
        },        
        {
          "title": "Desktop-Integrationen",
          "description": "Steuere OBS-Szenen und -Quellen. Verwalte Spotify-Wiedergabe. Exportiere  
  Clips. Alles läuft direkt auf deinem Rechner, kein Server dazwischen.",                                     "bullets": [                                                                              
            "OBS-Szenen- und Quell-Steuerung",                                                      
            "Spotify-Wiedergabesteuerung",                                                                      "Clip-Export und Plugin-Hooks"                                                          
          ]                                                                                                 }
      ]                                                                                             
    },
    "workflowSteps": {
      "items": [                                                                                            {
          "title": "Ereignis wählen",                                                               
          "description": "Wähl aus, was den Workflow startet — OBS-Verbindung, Tastenkürzel,        
  Twitch-Event oder jedes andere Signal deines Setups."                                                     },                                                                                          
        {                                                                                           
          "title": "Logik festlegen",                                                               
          "description": "Bedingungen filtern, wann der Workflow läuft. Makros gruppieren Aktionen  
  zu wiederverwendbaren Sequenzen."                                                                         },                                                                                          
        {                                                                                           
          "title": "Lokal ausführen",
          "description": "Die Runtime läuft auf deinem Rechner. Keine Server-Anfragen. Was im Test  
  funktioniert, funktioniert genauso im Live-Stream."                                                       }                                                                                           
      ]                                                                                             
    },
    "faq": {
      "items": [
        {
          "question": "Ist das ein Cloud-Dienst?",
          "answer": "Nein. TriggerHub ist eine Windows-Desktop-App. Deine Automatisierungen und     
  Einstellungen bleiben auf deinem Rechner."                                                                },                                                                                          
        {                                                                                           
          "question": "Welche Integrationen funktionieren jetzt?",
          "answer": "OBS und Spotify haben funktionierende Adapter im aktuellen Build. Twitch-Events   und Clip-Recording sind in aktiver Entwicklung."                                                         },                                                                                          
        {                                                                                                     "question": "Kann ich es heute ausprobieren?",
          "answer": "Das Produkt ist im Early Access. Zugriff anfragen oder direkt melden, um auf   
  die Liste zu kommen."                                                                                     },
        {                                                                                           
          "question": "Läuft es während des Streams im Hintergrund?",                               
          "answer": "Ja. Die Runtime bleibt aktiv, während du streamst. Trigger und Makros laufen   
  ohne App-Wechsel."                                                                                        }                                                                                           
      ]                                                                                             
    },
    "cta": {
      "title": "Early Access ist offen.",                                                                 "description": "TriggerHub ist in aktiver Entwicklung. Zugriff anfragen oder das Projekt auf
  GitHub verfolgen."                                                                                    }
  },                                                                                                
  "desktopPreview": {
    "workflowOverview": "Workflow-Übersicht",
    "automationFlow": "Automatisierungsfluss",
    "liveStreamStartup": "Live-Stream-Start",
    "localRuntime": "Lokale Runtime",                                                               
    "trigger": "Trigger",                                                                               "triggerDesc": "Ein Ereignis aus deinem Setup",                                                 
    "condition": "Bedingung",                                                                       
    "conditionDesc": "Entscheidet, wann der Workflow weiterläuft",                                      "macro": "Makro",                                                                               
    "macroDesc": "Eine wiederverwendbare Aktionsfolge",                                             
    "action": "Aktion",                                                                                 "actionDesc": "Führt die Änderung lokal aus",                                                   
    "connectedSurface": "Verbundene Tools",                                                         
    "obsControl": "OBS-Steuerung",                                                                  
    "spotifyActions": "Spotify-Aktionen",                                                               "clipExport": "Clip-Export",                                                                    
    "pluginRuntime": "Plugin-Runtime",                                                              
    "whyItMatters": "Warum lokal?",                                                                     "whyItMattersText": "Kein Server zwischen Trigger und Ergebnis. Was im Test funktioniert,       
  funktioniert genauso im Live-Stream."                                                               },
  "cta": {                                                                                          
    "finalLabel": "Early Access",
    "requestProtectedAccess": "Zugriff anfragen",
    "viewRepository": "GitHub"                                                                        }
                                                                                                      Außerdem: alle i18n-Strings in auth, dashboard, profile, settings, forbidden, appPage, internal,    errors — Umlauts fixen:
                                                                                                      ┌─────────────────────┬───────────────────┐                                                         │       Kaputt        │      Korrekt      │
  ├─────────────────────┼───────────────────┤                                                       
  │ oeffentlich         │ öffentlich        │
  ├─────────────────────┼───────────────────┤
  │ fuer / fuer         │ für               │                                                       
  ├─────────────────────┼───────────────────┤                                                         │ ue → ü überall      │ ü                 │                                                       
  ├─────────────────────┼───────────────────┤                                                         │ Zurueck             │ Zurück            │
  ├─────────────────────┼───────────────────┤                                                         │ gueltig / ungueltig │ gültig / ungültig │
  ├─────────────────────┼───────────────────┤                                                         │ ueberschreitet      │ überschreitet     │
  ├─────────────────────┼───────────────────┤                                                         │ Laenge              │ Länge             │
  ├─────────────────────┼───────────────────┤                                                         │ laeuft              │ läuft             │
  ├─────────────────────┼───────────────────┤                                                       
  │ Eigentuemer         │ Eigentümer        │
  ├─────────────────────┼───────────────────┤                                                         │ beschraenkt         │ beschränkt        │
  ├─────────────────────┼───────────────────┤                                                       
  │ Identitaet          │ Identität         │
  └─────────────────────┴───────────────────┘                                                         
  ---                                                                                                 Schritt 5 — Verifikation
                                                                                                      cd website && npm run build
                                                                                                      Prüfen:                                                                                             - Keine TypeScript-Fehler
  - Keine fehlenden i18n-Keys (konsole auf Missing-Key-Warnings prüfen)                             
  - Keine Broken Imports in WebsiteLandingPage.tsx                     
                                                                                                      ---                                                                                                 Architektur-Referenz (nach diesem Plan)                                                           
                                                                                                      Landing Page — 5 Abschnitte
  ─────────────────────────────────────────────────────                                             
    Hero          dark    Value prop + DesktopPreview + CTA                                         
    Features      dark    3 Karten: Triggers · Macros · Integrations                                
    How it works  light   3 Schritte: Event → Logik → Lokal                                         
    FAQ           light   4 Fragen: Cloud? / Integrationen? / Heute? / Background?                  
    CTA           dark    Request access + GitHub                                                   
  ─────────────────────────────────────────────────────                                                                                                                                                   Entfernt:                                                                                             Benefits      → in Hero-Description gefaltet
    Extensions    → Roadmap gehört nicht auf die Landing Page                                       
    Trust signals → defensiv, kein User-Value                                                       
                                                                                                      Komponenten (MarketingBlocks.tsx)                                                                 
    MarketingShell     → Header + Footer Wrapper, Nav: 3 Links                                      
    MarketingHero      → Unverändert                                                                
    MarketingSection   → Unverändert                                                                    FeatureCardGrid    → Unverändert (jetzt nur für Features-Section)                               
    WorkflowSteps      → Unverändert                                                                    FaqSection         → Unverändert
    MarketingCta       → Unverändert                                                                
    BenefitGrid        → Bleibt im File, wird nicht mehr gerendert                                  
    TrustGrid          → Bleibt im File, wird nicht mehr gerendert                                  
                                                                                                      Datenfluss                                                                                        
    i18n JSON → useTranslation() → Props → Render                                                   
    Kein globaler State auf der Landing Page                                                        
    Kein API-Call auf der Landing Page  
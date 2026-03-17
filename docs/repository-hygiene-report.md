## Repository Hygiene Report

Stand: 2026-03-17  
Zweig: `cursor/repository-hygiene-bericht-3407`

Dieser Report basiert ausschließlich auf dem aktuell vorhandenen Codebestand im Ordner `website/src`. Alle Einschätzungen sind konservativ formuliert – „definitiv“ bedeutet: im gesamten Repository ließ sich keine Referenz finden; „vermutlich“ bedeutet: fachlich plausibel, aber nicht vollständig abgesichert.

---

## 1. Dead Code (ungenutzter Code)

### 1.1 Eindeutig ungenutzte Dateien / Module

**Daten & Content**

- `website/src/data/projectStatus.ts`  
  **Begründung**: Wird im gesamten Repository nirgends importiert. In der Dokumentation wird erwähnt, dass Komponenten diese Daten konsumieren sollten, im Code finden sich dazu aber keine Referenzen.

- `website/src/data/triggerhub-website-sections.md`  
- `website/src/data/triggerhub-landing-page.html`  
- `website/src/data/triggerhub-landing-page.md`  
  **Begründung**: Dokumentations-/Content-Dateien, die nicht in das React‑App‑Bundle importiert werden.

- `website/src/content/generated/platform-support.json`  
- `website/src/content/generated/changelog.json`  
- `website/src/content/generated/features.json`  
- `website/src/content/generated/integrations.json`  
  **Begründung**: Automatisch generierte JSON‑Dateien, die nirgends importiert werden. Vermutlich nur für Meta‑Dokumentation oder externe Prozesse gedacht.

**Styles**

- `website/src/styles/colors.css`  
  **Begründung**: Wird nicht von `index.css` oder anderen Styles importiert; die aktive Style‑Kette basiert auf `fonts.css`, `tailwind.css` und `theme.css`.

**Komponenten**

Die folgenden React‑Komponenten werden im gesamten Repository nicht importiert und sind daher aktuell „toter“ Code:

- `website/src/components/figma/ImageWithFallback.tsx`
- `website/src/components/FlowConnector.tsx`
- `website/src/components/ConceptCard.tsx`
- `website/src/components/DiagramShowcase.tsx` (nutzt `FlowDiagram`, ist aber selbst nirgends eingebunden)
- `website/src/components/IntegrationLibrary.tsx`
- `website/src/components/AnimatedPath.tsx`
- `website/src/components/AutomationExamples.tsx`
- `website/src/components/Pricing.tsx`
- `website/src/components/FlowDiagram.tsx` (wird nur von `DiagramShowcase` genutzt, das wiederum nicht verwendet wird)
- `website/src/components/FlowNode.tsx` (eigenständige Implementierung, unabhängig vom internen `FlowNode` in `FlowDiagram`)
- `website/src/components/ProblemSection.tsx`
- `website/src/components/Testimonials.tsx`
- `website/src/components/EarlyAccess.tsx`
- `website/src/components/PlatformVision.tsx`
- `website/src/components/FinalCTA.tsx`
- `website/src/components/WorkflowDemo.tsx`
- `website/src/components/AutomationRecipes.tsx`
- `website/src/components/EditorMockup.tsx`
- `website/src/components/IntegrationHub.tsx`
- `website/src/components/HowItWorks.tsx` (nutzt `ExpandableCard`, wird aber selbst nicht verwendet)
- `website/src/components/Features.tsx` (nutzt `FeatureAccordion`, wird aber selbst nicht verwendet)
- `website/src/components/ExpandableCard.tsx` (nur von `HowItWorks` genutzt)
- `website/src/components/FeatureAccordion.tsx` (nur von `Features` genutzt)

**UI‑Primitives (`website/src/components/ui/`)**

- Der komplette Satz an shadcn/radix‑basierten UI‑Primitives unter `website/src/components/ui/` wird aktuell von keiner Seite und keinem Feature‑Modul importiert.  
- Die Screens verwenden direkt HTML‑Elemente (`button`, `input`, `label`, `form` etc.) kombiniert mit Tailwind‑Klassen.

**Einschätzung**:  
Diese Dateien sind im aktuellen Stand definitiv unbenutzt. Ob sie mittel‑/langfristig gebraucht werden (Landing‑Page‑Varianten, Design‑System, geplante Flows) ist fachlich nicht beurteilbar – daher werden sie hier nicht automatisch gelöscht, sondern nur als „toter Code“ markiert.

---

## 2. Unbenutzte Dateien (auf Ordnerebene)

Neben den unter 1.1 genannten Modulen gelten insbesondere folgende Bereiche als aktuell ungenutzt:

- **`website/src/components/ui/*`**  
  Vollständige Bibliothek an UI‑Primitives, die nur sich gegenseitig, aber keine App‑Seiten referenzieren.

- **`website/src/content/generated/*.json`**  
  Generierte Content‑Artefakte, die nicht in den React‑Code eingebunden werden.

- **Diverse Marketing-/Landing‑Page‑Komponenten** (siehe Liste oben)  
  Die aktuelle `WebsiteLandingPage` nutzt diese Bausteine nicht; sie sind vermutlich Überreste früherer Layout‑Experimente.

**Entscheidung**:  
Keine dieser Dateien wird automatisiert gelöscht, da unklar ist, ob sie für Roadmap‑Features oder externe Tools (Landing‑Page‑Generator, Doku‑Site, o.ä.) vorgesehen sind.

---

## 3. Redundante oder doppelte Logik

### 3.1 Doppelte/überlappende Komponenten

- **`FlowNode`**  
  - Eine Implementierung als eigenständige Komponente in `website/src/components/FlowNode.tsx`.  
  - Eine zweite, interne Implementierung innerhalb von `FlowDiagram.tsx` mit ähnlicher, aber nicht identischer Struktur.  
  **Folge**: Zwei leicht unterschiedlich pflegbare Varianten desselben Konzepts, ohne dass aktuell eine von beiden produktiv eingebunden ist.

### 3.2 Auth‑Stack (vermutlich obsolet)

Unter `website/src/modules/auth/` findet sich ein relativ umfangreicher, aber faktisch ungenutzter Stack:

- `authService.ts` (Export `AuthService` und `AuthError`)
- `backendAuthProvider.ts` (Export `BackendAuthProvider`)
- `ownerAuthProvider.ts` (Export `OwnerAuthProvider`)
- `sessionStore.ts`
- `passwordHashing.ts` (Export `verifyPasswordHash`)
- `backendAuthContract.ts` (Export `BackendAuthProviderConfig`)

Im restlichen Code wird stattdessen ein direkter Backend‑Auth‑Flow mit einfachen Fetch‑Aufrufen verwendet.  
Die genannten Exports werden nicht von den Seiten/Komponenten importiert und wirken wie eine ältere/alternative Auth‑Implementierung.

---

## 4. Struktur- und Architekturprobleme

### 4.1 Business‑Logik in React‑Komponenten

- **`ProfilePage`**  
  - Enthält eine umfangreiche Fehler‑Mapping‑Logik (`translateProfileError`, großes `keyByMessage`‑Mapping) direkt in der Komponente.  
  - Diese Logik ist eher Domänen‑/Validierungslogik und sollte idealerweise:
    - in ein dediziertes Profil‑Modul (`modules/profile/*`) oder
    - in eine i18n/Fehlermeldungs‑Schicht ausgelagert werden.

**Konsequenz**:  
Die Komponente wird schwerer testbar und wartbar, und es entsteht eine enge Kopplung zwischen UI und Domänenlogik.

### 4.2 Unbenutzte Auth‑Layer

- Der beschriebene Auth‑Stack in `modules/auth` wirkt wie ein Eigenbau‑Auth‑Layer (Passworthashing, Owner‑Auth, Session‑Store), der aktuell nicht mehr verwendet wird.  
- Gleichzeitig referenzieren einige Stellen (`AuthProvider`, `backendSession`) ein niegelandenes Modul `./errors`, während die zentrale Fehlerklasse `AuthError` in `authService.ts` definiert ist.

**Konsequenz**:

- Inkonsistente Fehlerbehandlung (zwei Quellen: `authService.ts` vs. nicht existierendes `errors.ts`).  
- Risiko, dass zukünftige Änderungen versehentlich auf die inaktiven Auth‑Pfade aufbauen.

### 4.3 UI‑Layer nicht konsistent genutzt

- Es existiert ein recht vollständiger Satz an UI‑Primitives (`components/ui/*`), der potenziell den Design‑System‑Layer darstellen soll.  
- Die tatsächlichen Seiten nutzen stattdessen native HTML‑Elemente + Tailwind und umgehen die abstrahierten Komponenten.

**Konsequenz**:

- Kein zentraler Ort für UI‑Konsistenz (z.B. Zustände, Barrierefreiheit, Theming).  
- Wartungsaufwand steigt, wenn UI‑Änderungen über viele Seiten hinweg manuell ausgerollt werden müssen.

### 4.4 Content‑Layer nicht angebunden

- Die generierten JSON‑Dateien unter `website/src/content/generated/` sowie `projectStatus.ts` werden nicht konsumiert.  
- In der Dokumentation wird erwähnt, dass Komponenten `projectStatus` verwenden sollen – das spiegelt der aktuelle Code nicht wider.

**Konsequenz**:

- Inkonsistenz zwischen Doku und Implementierung.  
- Potenzial für ein zentrales Content‑/Status‑Modell wird derzeit nicht genutzt.

---

## 5. Konkrete Refactoring-Vorschläge

### 5.1 Schrittweise Bereinigung von Dead Code

- **Kurzfristig markieren, mittelfristig entfernen**:
  - Alle eindeutig ungenutzten Komponenten und Datenquellen (siehe Abschnitte 1.1 und 2) sollten zunächst als „deprecated“ markiert und aus der öffentlichen API (Exports) entfernt werden.  
  - Falls nach einem definierten Zeitraum/Release keine Nutzung mehr geplant ist, können diese Dateien sicher gelöscht werden.

- **Auth‑Stack aufräumen**:
  - Den aktuell ungenutzten Auth‑Stack (`AuthService`, `BackendAuthProvider`, `OwnerAuthProvider`, `sessionStore`, `passwordHashing`, `backendAuthContract`) entweder:
    - vollständig entfernen, oder
    - in einen klar getrennten „legacy“‑/„experiments“‑Namespace verschieben und in der Doku als obsolet kennzeichnen.

### 5.2 Business‑Logik aus Komponenten ziehen

- **Profil‑Fehlerlogik**:
  - `translateProfileError` und das zugehörige Mapping in ein Modul unter `website/src/modules/profile/` oder `website/src/modules/profile/validation.ts` auslagern.  
  - Die Komponente sollte nur noch eine schlanke API konsumieren, z.B. `formatProfileError(error, locale)`.

- **i18n/Fehlermeldungen**:
  - Generische Fehler‑Mappungen in ein i18n‑ oder Messages‑Modul verschieben, um Mehrsprachigkeit und Wiederverwendung zu erleichtern.

### 5.3 Konsistenter UI‑Layer

- **Entscheidung treffen**:
  - Entweder:
    - die bestehenden `components/ui/*`‑Primitives aktiv einsetzen (Buttons, Inputs, Dialoge, usw.) und Schritt für Schritt die Roh‑HTML‑Elemente in den Seiten ersetzen, oder
    - die UI‑Primitives, die definitiv nicht verwendet werden sollen, entfernen, um die Codebasis zu verschlanken.

- **Empfehlung**:
  - Falls Barrierefreiheit, Theming und konsistente Interaktionen wichtig sind, bietet sich die Nutzung der bestehenden `ui`‑Bibliothek an.

### 5.4 Content‑/Status‑Layer integrieren

- **`projectStatus` und generierte JSON‑Files**:
  - Für Landing‑/Marketing‑Seiten einen klar definierten Content‑Layer etablieren, der:
    - `projectStatus` und die JSON‑Daten als Quelle verwendet und
    - von den Seiten/Komponenten konsumiert wird (statt hartkodierter Texte/Zustände).
  - Wenn diese Dateien nur für externe Doku gedacht sind, sollte dies in einem README im entsprechenden Ordner dokumentiert werden, um Verwirrung zu vermeiden.

### 5.5 Fehlerbehandlung im Auth‑Bereich konsolidieren

- **Fehlerquelle vereinheitlichen**:
  - Ein zentrales Modul für Auth‑Fehler definieren (z.B. `modules/auth/errors.ts`) und:
    - `AuthError` und weitere Fehlerklassen dort unterbringen,
    - `AuthProvider`, `backendSession` und andere Call‑Sites konsistent darauf referenzieren.

- **Nicht existierende Importe korrigieren**:
  - Importe auf nicht vorhandene Module wie `./navigation` oder `./errors` gezielt prüfen und entweder:
    - auf die tatsächlichen Modulpfade anpassen, oder
    - entfernen, wenn der entsprechende Flow nicht mehr benötigt wird.

---

## 6. Automatische Aufräum-Aktionen in diesem Lauf

In diesem Durchlauf wurden **keine destruktiven Änderungen** (kein Löschen von Dateien oder Funktionen) vorgenommen, da viele der Kandidaten potenziell für zukünftige Features oder externe Werkzeuge relevant sein können.

Automatische, eindeutig sichere Aufräum‑Schritte (z.B. Entfernen einzelner ungenutzter Imports pro Datei auf Basis eines TypeScript‑Checks) können in einem **separaten, eng fokussierten PR** erfolgen, um das Risiko unbeabsichtigter Seiteneffekte zu minimieren.


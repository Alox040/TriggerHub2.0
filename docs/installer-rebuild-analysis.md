# Windows Build-, EXE- und Installer-Workflow Analyse

**Datum:** 2026-03-16  
**Status:** Vollständige Analyse  
**Ziel:** Technische Dokumentation des aktuellen Workflows, identifizierte Probleme und konkrete Fix-Strategie

---

## 1. Aktuelle Buildstruktur

### 1.1 Build-Pipeline Übersicht

```
npm run desktop:release
  ├── npm run build (Vite)
  │   └── vite.config.ts → dist/
  │       ├── index.html
  │       └── assets/**/*
  ├── electron-builder --win nsis --x64 --publish never
  │   └── package.json "build" key
  │       └── release/
  │           ├── TriggerHubSetup.exe
  │           ├── win-unpacked/
  │           │   └── App.exe
  │           └── latest.yml (optional)
  └── npm run desktop:artifacts
      └── scripts/collect-desktop-artifacts.mjs
          └── dist/
              ├── Setup.exe
              ├── App.exe
              ├── Uninstall.exe
              └── latest.yml
```

### 1.2 Build-Konfiguration

**Vite Build (`vite.config.ts`):**
- Base: `./` (relative paths für Electron)
- React Plugin aktiviert
- Output: `dist/` (Standard Vite Output)
- Keine spezifischen Electron-Optimierungen

**Electron Main Process (`electron/main.cjs`):**
- Entry Point: `electron/main.cjs`
- Preload: `electron/preload.cjs` ✅ (vorhanden und konfiguriert)
- Renderer: `dist/index.html`
- IPC Handlers:
  - `storage:load` / `storage:save`
  - `clip-exporter:export`
  - `window:command`

**Preload Script (`electron/preload.cjs`):**
- `contextBridge` konfiguriert ✅
- Exposed APIs:
  - `triggerHubElectron.clipExporter.exportClip()`
  - `triggerHubElectron.storage.load/save()`
  - `triggerHubElectron.windowControl.execute()`

### 1.3 Build-Skripte

| Script | Befehl | Zweck |
|--------|--------|-------|
| `desktop:build` | `npm run build && electron-builder --win nsis --x64 --publish never` | Build ohne Publish |
| `desktop:publish` | `npm run build && electron-builder --win nsis --x64 --publish always` | Build mit GitHub Publish |
| `desktop:artifacts` | `node scripts/collect-desktop-artifacts.mjs` | Artefakt-Sammlung |
| `desktop:release` | `npm run desktop:build && npm run desktop:artifacts` | Vollständiger Release-Build |

---

## 2. Aktuelle Packagingstruktur

### 2.1 electron-builder Konfiguration

**Location:** `package.json` → `"build"` key

```json
{
  "appId": "com.triggerhub.desktop",
  "productName": "TriggerHub 2.0",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "electron/**/*",
    "package.json"
  ],
  "win": {
    "target": [{"target": "nsis", "arch": ["x64"]}],
    "artifactName": "TriggerHubSetup.exe",
    "executableName": "App"
  },
  "nsis": {
    "oneClick": false,
    "perMachine": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "TriggerHub 2.0",
    "uninstallDisplayName": "TriggerHub 2.0"
  },
  "publish": {
    "provider": "github",
    "owner": "Alox040",
    "repo": "Triggerhub"
  }
}
```

### 2.2 Output-Struktur

**`release/` (electron-builder Output):**
```
release/
├── TriggerHubSetup.exe          # NSIS Installer
├── win-unpacked/                # Unpacked App (für Testing)
│   ├── App.exe                  # Haupt-Executable
│   ├── resources/
│   │   ├── app.asar             # Gepackte App (oder ungepackt)
│   │   └── electron.asar
│   └── ...
├── latest.yml                   # Auto-Update Manifest (optional)
└── *.blockmap                   # Delta-Update Maps (optional)
```

**`dist/` (Finale Artefakte nach `collect-desktop-artifacts.mjs`):**
```
dist/
├── Setup.exe                    # Installer (kopiert von release/)
├── App.exe                      # Portable Binary (von win-unpacked/)
├── Uninstall.exe                # Uninstaller (generiert oder kopiert)
└── latest.yml                   # Update Manifest (optional)
```

### 2.3 Artefakt-Sammlung (`scripts/collect-desktop-artifacts.mjs`)

**Prozess:**
1. **Setup.exe:** Sucht in `release/TriggerHubSetup.exe` oder `release/Setup.exe`
2. **App.exe:** Kopiert von `release/win-unpacked/App.exe`
3. **Uninstall.exe:** Komplexe Fallback-Logik:
   - Prüft 6 verschiedene Kandidaten-Pfade
   - Falls nicht gefunden: Generiert NSIS-Uninstall-Launcher
   - Launcher sucht Registry-Eintrag und führt echten Uninstaller aus
4. **latest.yml:** Optional, kopiert von `release/latest.yml`

**Uninstaller-Kandidaten:**
```javascript
const candidates = [
  'release/TriggerHubSetup.__uninstaller.exe',
  'release/Setup.__uninstaller.exe',
  'release/win-unpacked/Uninstall.exe',
  'release/__uninstaller-nsis-App.exe',
  'release/__uninstaller-nsis-TriggerHub 2.0.exe',
]
```

---

## 3. Installer-Konfiguration

### 3.1 NSIS-Konfiguration (via electron-builder)

**Typ:** Multi-Page Installer (nicht One-Click)

**Features:**
- ✅ Installationsverzeichnis wählbar
- ✅ Desktop-Verknüpfung
- ✅ Startmenü-Verknüpfung
- ✅ Per-User Installation (nicht systemweit)
- ✅ Standard NSIS Uninstaller

**Fehlende Features:**
- ❌ Code Signing (nicht konfiguriert)
- ❌ Custom NSIS Scripts (Standard-Template)
- ❌ Installations-Lizenz-Anzeige
- ❌ Custom Installer-UI

### 3.2 Uninstaller-Fallback-Mechanismus

**Problem:** electron-builder generiert nicht immer einen expliziten Uninstaller im Output.

**Lösung:** Fallback-Launcher-Generierung

**Prozess:**
1. Suche nach Uninstaller in bekannten Pfaden
2. Falls nicht gefunden:
   - Suche `makensis.exe` in `%LOCALAPPDATA%/electron-builder/Cache/nsis/`
   - Generiere minimales NSIS-Script (`uninstall-launcher.nsi`)
   - Kompiliere Launcher mit `makensis.exe`
   - Launcher liest Registry und führt echten Uninstaller aus

**Registry-Keys:**
- HKCU: `Software\Microsoft\Windows\CurrentVersion\Uninstall\{uninstallKey}`
- HKLM: `Software\Microsoft\Windows\CurrentVersion\Uninstall\{uninstallKey}`

**Hardcoded Uninstall Key:** `5af6a952-cdef-5bea-b9c3-9df13d23be11`

⚠️ **Problem:** Dieser Key ist hardcoded und stimmt möglicherweise nicht mit electron-builder's generiertem Key überein.

### 3.3 CI/CD Workflow (`.github/workflows/release.yml`)

**Job: `build_desktop`**
- Runner: `windows-latest`
- Steps:
  1. Checkout
  2. Setup Node.js 20
  3. `npm ci`
  4. `npm run desktop:release`
  5. Upload Artefakte:
     - `dist/Setup.exe`
     - `dist/App.exe`
     - `dist/Uninstall.exe`
     - `dist/latest.yml`
     - `release/*.blockmap`
     - `release/latest.yml`

**Job: `publish_release`**
- Läuft nach `build_desktop`
- Erstellt GitHub Release
- Attached Files: Alle `.exe`, `.yml`, `.blockmap` Dateien

**Fehlende Validierung:**
- ❌ Keine Installer-Tests
- ❌ Keine Verifikation der Artefakt-Integrität
- ❌ Keine Signatur-Prüfung

---

## 4. Probleme und Root Causes

### 4.1 Kritische Probleme

#### P-01: Fragile Uninstaller-Erkennung
**Severity:** HIGH  
**Root Cause:** electron-builder generiert Uninstaller-Namen nicht konsistent. Die Fallback-Logik mit 6 Kandidaten-Pfaden ist fehleranfällig.

**Symptome:**
- Uninstaller wird möglicherweise nicht gefunden
- Fallback-Launcher wird generiert, aber mit hardcoded Registry-Key
- Registry-Key stimmt möglicherweise nicht mit electron-builder's Key überein

**Impact:**
- Uninstaller fehlt in `dist/`
- CI/CD Upload schlägt fehl oder lädt fehlerhaften Uninstaller
- Benutzer können App nicht deinstallieren

#### P-02: Hardcoded Uninstall Registry Key
**Severity:** HIGH  
**Root Cause:** Fallback-Launcher verwendet hardcoded GUID `5af6a952-cdef-5bea-b9c3-9df13d23be11`, der nicht mit electron-builder's generiertem Key synchronisiert ist.

**Impact:**
- Fallback-Launcher findet Uninstaller nicht
- Öffnet stattdessen Windows "Apps & Features"
- Benutzer-Erfahrung ist suboptimal

#### P-03: Fehlende Auto-Update Implementierung
**Severity:** HIGH  
**Root Cause:** `electron-updater` ist nicht installiert, obwohl `publish`-Konfiguration vorhanden ist.

**Impact:**
- Keine automatischen Updates
- Benutzer müssen manuell neue Versionen herunterladen
- Security-Patches können nicht automatisch verteilt werden

**Evidence:**
- `package.json` enthält `electron-updater` nicht in dependencies
- `electron/main.cjs` hat keine Update-Handler
- `latest.yml` wird generiert, aber nicht verwendet

#### P-04: Keine Code Signing
**Severity:** MEDIUM  
**Root Cause:** Keine Signatur-Konfiguration in electron-builder.

**Impact:**
- Windows SmartScreen Warnungen
- Benutzer-Vertrauen reduziert
- Enterprise-Deployment erschwert

### 4.2 Mittlere Probleme

#### P-05: Keine Portable Build-Option
**Severity:** MEDIUM  
**Root Cause:** Nur NSIS-Installer konfiguriert, keine portable `.exe` als separate Target.

**Impact:**
- Benutzer können App nicht ohne Installation ausführen
- Weniger Flexibilität für Power-User

#### P-06: Fehlende Installer-Validierung in CI
**Severity:** MEDIUM  
**Root Cause:** CI/CD Workflow lädt Artefakte, testet sie aber nicht.

**Impact:**
- Defekte Installer können in Releases landen
- Keine automatisierte Qualitätssicherung

#### P-07: Komplexe Artefakt-Sammlung
**Severity:** LOW-MEDIUM  
**Root Cause:** `collect-desktop-artifacts.mjs` hat viele Fallback-Pfade und komplexe Logik.

**Impact:**
- Wartbarkeit erschwert
- Fehler schwer zu debuggen
- Potenzielle Race Conditions

#### P-08: Keine Smoke Tests für Installer
**Severity:** MEDIUM  
**Root Cause:** Keine automatisierten Tests, die den Installer installieren und deinstallieren.

**Impact:**
- Installer-Fehler werden erst bei manueller Prüfung entdeckt
- Regressions-Risiko bei Änderungen

### 4.3 Niedrige Probleme

#### P-09: Vite Build ohne Electron-Optimierungen
**Severity:** LOW  
**Root Cause:** Standard Vite-Config ohne Electron-spezifische Optimierungen.

**Impact:**
- Möglicherweise größere Bundle-Size
- Keine Tree-Shaking-Optimierungen für Electron

#### P-10: Fehlende Dokumentation der Build-Schritte
**Severity:** LOW  
**Root Cause:** Dokumentation existiert (`WINDOWS_DESKTOP_RELEASE.md`), aber detaillierte Troubleshooting-Guides fehlen.

**Impact:**
- Entwickler müssen bei Problemen selbst debuggen
- Onboarding erschwert

---

## 5. Priorisierte Fixliste

### Priorität 1: Kritische Fixes (Sofort)

#### FIX-01: Uninstaller-Erkennung robuster machen
**Aufwand:** 2-3 Stunden  
**Ziel:** 
- Dynamische Erkennung des korrekten Uninstaller-Pfads
- Synchronisation mit electron-builder's Registry-Key
- Fallback nur wenn wirklich nötig

**Schritte:**
1. Analysiere electron-builder's generierte Registry-Keys zur Build-Zeit
2. Extrahiere Uninstaller-Pfad aus Registry oder electron-builder Output
3. Vereinfache Fallback-Logik
4. Teste mit verschiedenen electron-builder Versionen

#### FIX-02: Auto-Update implementieren
**Aufwand:** 4-6 Stunden  
**Ziel:** 
- `electron-updater` installieren und konfigurieren
- Update-Checks im Main Process
- Update-UI im Renderer
- GitHub Releases als Update-Source

**Schritte:**
1. `electron-updater` zu dependencies hinzufügen
2. Update-Handler in `electron/main.cjs` implementieren
3. Update-UI-Komponente erstellen
4. GitHub Releases als Provider konfigurieren
5. Testen mit Test-Releases

#### FIX-03: Registry-Key Synchronisation
**Aufwand:** 1-2 Stunden  
**Ziel:** 
- Dynamische Key-Ermittlung statt hardcoded GUID
- Extraktion aus electron-builder's Output oder Registry

**Schritte:**
1. Analysiere electron-builder's generierte Registry-Struktur
2. Extrahiere Key zur Build-Zeit
3. Passe Fallback-Launcher an
4. Teste auf verschiedenen Windows-Versionen

### Priorität 2: Wichtige Verbesserungen (Nächste Iteration)

#### FIX-04: Code Signing konfigurieren
**Aufwand:** 3-4 Stunden (inkl. Zertifikat-Beschaffung)  
**Ziel:** 
- Code Signing für alle `.exe` Dateien
- CI/CD Integration für automatische Signierung

**Schritte:**
1. Code Signing Certificate beschaffen
2. electron-builder Signing-Config hinzufügen
3. CI/CD Secrets für Certificate konfigurieren
4. Signing in Release-Workflow integrieren

#### FIX-05: Portable Build-Option hinzufügen
**Aufwand:** 1-2 Stunden  
**Ziel:** 
- Portable `.exe` als zusätzliches Target
- Separate Build-Script-Option

**Schritte:**
1. `portable` Target zu electron-builder Config hinzufügen
2. Build-Script für portable Variante erstellen
3. Artefakt-Sammlung erweitern
4. Dokumentation aktualisieren

#### FIX-06: Installer-Validierung in CI
**Aufwand:** 3-4 Stunden  
**Ziel:** 
- Automatisierte Installer-Tests in CI
- Verifikation der Artefakt-Integrität

**Schritte:**
1. PowerShell-Script für Installer-Test erstellen
2. Installation/Deinstallation testen
3. CI/CD Step hinzufügen
4. Fehler-Reporting verbessern

### Priorität 3: Wartbarkeit (Backlog)

#### FIX-07: Artefakt-Sammlung vereinfachen
**Aufwand:** 2-3 Stunden  
**Ziel:** 
- Reduziere Fallback-Pfade
- Bessere Fehlerbehandlung
- Logging verbessern

**Schritte:**
1. Refactoring von `collect-desktop-artifacts.mjs`
2. Einheitliche Fehlerbehandlung
3. Strukturiertes Logging
4. Unit Tests hinzufügen

#### FIX-08: Smoke Tests für Installer
**Aufwand:** 2-3 Stunden  
**Ziel:** 
- Automatisierte Installer-Smoke-Tests
- Integration in CI/CD

**Schritte:**
1. PowerShell-Test-Script erstellen
2. Installation/Deinstallation automatisieren
3. CI/CD Integration
4. Dokumentation

#### FIX-09: Vite Build optimieren
**Aufwand:** 1-2 Stunden  
**Ziel:** 
- Electron-spezifische Optimierungen
- Bundle-Size reduzieren

**Schritte:**
1. Vite-Config für Electron optimieren
2. Tree-Shaking aktivieren
3. Bundle-Analyse durchführen
4. Performance-Metriken sammeln

---

## 6. Konkrete Codex-Arbeitsblöcke

### Block 1: Uninstaller-Robustheit (FIX-01 + FIX-03)

**Dateien:**
- `scripts/collect-desktop-artifacts.mjs`
- `scripts/test-uninstaller-detection.mjs` (neu)

**Aufgaben:**
1. **Analysiere electron-builder's Uninstaller-Generierung:**
   - Untersuche `release/` Output nach Build
   - Identifiziere Muster für Uninstaller-Namen
   - Dokumentiere Registry-Key-Generierung

2. **Implementiere dynamische Uninstaller-Erkennung:**
   ```javascript
   // Pseudocode
   async function findUninstaller() {
     // 1. Prüfe electron-builder's Standard-Output-Pfade
     // 2. Parse latest.yml für Uninstaller-Hinweise
     // 3. Suche in Registry nach App-Installation
     // 4. Extrahiere Uninstaller-Pfad aus Registry
     // 5. Fallback nur wenn alle Schritte fehlschlagen
   }
   ```

3. **Vereinfache Fallback-Launcher:**
   - Entferne hardcoded GUID
   - Extrahiere Key aus electron-builder's Output
   - Verbessere Fehlerbehandlung

4. **Erstelle Test-Script:**
   - Teste verschiedene electron-builder Versionen
   - Validiere Uninstaller-Erkennung
   - Teste Fallback-Mechanismus

**Akzeptanzkriterien:**
- ✅ Uninstaller wird in 100% der Fälle korrekt erkannt
- ✅ Keine hardcoded Registry-Keys
- ✅ Fallback funktioniert nur wenn nötig
- ✅ Tests validieren alle Szenarien

---

### Block 2: Auto-Update Implementation (FIX-02)

**Dateien:**
- `package.json` (dependencies)
- `electron/main.cjs` (Update-Handler)
- `src/ui/components/UpdateNotification.tsx` (neu)
- `electron/preload.cjs` (Update-API)

**Aufgaben:**
1. **Installiere electron-updater:**
   ```bash
   npm install electron-updater
   ```

2. **Konfiguriere electron-builder:**
   ```json
   {
     "publish": {
       "provider": "github",
       "owner": "Alox040",
       "repo": "Triggerhub"
     }
   }
   ```

3. **Implementiere Update-Handler in `electron/main.cjs`:**
   ```javascript
   const { autoUpdater } = require('electron-updater')
   
   // Update-Check bei App-Start
   // Update-Download
   // Update-Installation
   // IPC-Handler für Update-Status
   ```

4. **Erstelle Update-UI-Komponente:**
   - Update verfügbar Notification
   - Download-Progress
   - Install & Restart Button

5. **Expose Update-API im Preload:**
   ```javascript
   contextBridge.exposeInMainWorld('triggerHubElectron', {
     // ... existing APIs
     updater: {
       checkForUpdates: () => ipcRenderer.invoke('updater:check'),
       downloadUpdate: () => ipcRenderer.invoke('updater:download'),
       installUpdate: () => ipcRenderer.invoke('updater:install'),
       onUpdateAvailable: (callback) => ipcRenderer.on('updater:available', callback),
       onUpdateDownloaded: (callback) => ipcRenderer.on('updater:downloaded', callback),
     }
   })
   ```

6. **Teste mit Test-Releases:**
   - Erstelle Test-Release auf GitHub
   - Validiere Update-Check
   - Teste Download und Installation

**Akzeptanzkriterien:**
- ✅ Update-Check bei App-Start
- ✅ Update-Notification im UI
- ✅ Download-Progress sichtbar
- ✅ Installation funktioniert
- ✅ Rollback bei Fehlern möglich

---

### Block 3: Code Signing Setup (FIX-04)

**Dateien:**
- `package.json` (build config)
- `.github/workflows/release.yml` (secrets)
- `scripts/setup-code-signing.ps1` (neu, optional)

**Aufgaben:**
1. **Beschaffe Code Signing Certificate:**
   - Option A: Commercial Certificate (z.B. DigiCert, Sectigo)
   - Option B: Self-Signed für Testing (nicht für Production)

2. **Konfiguriere electron-builder:**
   ```json
   {
     "win": {
       "certificateFile": "path/to/certificate.pfx",
       "certificatePassword": "${env.CERTIFICATE_PASSWORD}",
       "signingHashAlgorithms": ["sha256"],
       "sign": "scripts/sign.js"
     }
   }
   ```

3. **Erstelle Signing-Script (falls nötig):**
   ```javascript
   // scripts/sign.js
   // Custom signing logic falls electron-builder's Signing nicht ausreicht
   ```

4. **CI/CD Integration:**
   - GitHub Secrets für Certificate
   - Signing-Step im Release-Workflow
   - Verifikation der Signatur

5. **Dokumentiere Signing-Prozess:**
   - Certificate-Beschaffung
   - Lokales Signing
   - CI/CD Signing

**Akzeptanzkriterien:**
- ✅ Alle `.exe` Dateien sind signiert
- ✅ Windows SmartScreen akzeptiert Signatur
- ✅ CI/CD signiert automatisch
- ✅ Dokumentation vorhanden

---

### Block 4: Portable Build + CI Validierung (FIX-05 + FIX-06)

**Dateien:**
- `package.json` (build config)
- `scripts/test-installer.ps1` (neu)
- `.github/workflows/release.yml`

**Aufgaben:**
1. **Portable Build konfigurieren:**
   ```json
   {
     "win": {
       "target": [
         {"target": "nsis", "arch": ["x64"]},
         {"target": "portable", "arch": ["x64"]}
       ]
     }
   }
   ```

2. **Erstelle Installer-Test-Script (`scripts/test-installer.ps1`):**
   ```powershell
   # Installiere App in Test-Verzeichnis
   # Validiere Installation
   # Teste App-Start
   # Deinstalliere App
   # Validiere vollständige Deinstallation
   ```

3. **CI/CD Integration:**
   ```yaml
   - name: Test Installer
     run: powershell -File scripts/test-installer.ps1
   ```

4. **Artefakt-Validierung:**
   - Prüfe Datei-Existenz
   - Validiere Datei-Größen
   - Prüfe Signaturen (falls vorhanden)

**Akzeptanzkriterien:**
- ✅ Portable Build funktioniert
- ✅ Installer-Tests laufen in CI
- ✅ Artefakt-Validierung schlägt bei Fehlern fehl
- ✅ Tests sind deterministisch und zuverlässig

---

### Block 5: Code-Qualität und Wartbarkeit (FIX-07 + FIX-09)

**Dateien:**
- `scripts/collect-desktop-artifacts.mjs`
- `vite.config.ts`
- `scripts/test-artifact-collection.mjs` (neu)

**Aufgaben:**
1. **Refactoring `collect-desktop-artifacts.mjs`:**
   - Reduziere Fallback-Pfade
   - Einheitliche Fehlerbehandlung
   - Strukturiertes Logging
   - TypeScript Migration (optional)

2. **Vite-Optimierungen:**
   ```typescript
   // vite.config.ts
   export default defineConfig({
     build: {
       minify: 'terser',
       terserOptions: {
         compress: {
           drop_console: true, // In production
         },
       },
       rollupOptions: {
         output: {
           manualChunks: {
             // Code splitting für Electron
           },
         },
       },
     },
   })
   ```

3. **Erstelle Unit Tests:**
   - Teste Artefakt-Erkennung
   - Teste Fallback-Logik
   - Mock electron-builder Output

4. **Bundle-Analyse:**
   - Analysiere Bundle-Size
   - Identifiziere große Dependencies
   - Optimiere Imports

**Akzeptanzkriterien:**
- ✅ Code ist wartbarer und testbar
- ✅ Bundle-Size reduziert
- ✅ Tests decken kritische Pfade ab
- ✅ Logging ist strukturiert und hilfreich

---

## 7. Zusammenfassung und Empfehlungen

### Sofortige Maßnahmen (Diese Woche)

1. **FIX-01 + FIX-03:** Uninstaller-Robustheit verbessern
   - Höchste Priorität, da aktuell fehleranfällig
   - Blockiert keine anderen Features
   - Schneller Win

2. **FIX-02:** Auto-Update implementieren
   - Kritisch für Production-Readiness
   - Verbessert User Experience erheblich
   - Ermöglicht schnelle Security-Patches

### Nächste Iteration (Nächste 2 Wochen)

3. **FIX-04:** Code Signing
   - Wichtig für Vertrauen und Enterprise-Deployment
   - Benötigt Certificate-Beschaffung (Zeitaufwand)

4. **FIX-05 + FIX-06:** Portable Build + CI Validierung
   - Verbessert Entwickler-Experience
   - Reduziert Release-Risiko

### Backlog (Wartbarkeit)

5. **FIX-07 + FIX-09:** Code-Qualität
   - Langfristige Wartbarkeit
   - Kann parallel zu anderen Tasks laufen

### Risiken und Abhängigkeiten

- **Code Signing Certificate:** Benötigt Budget und Zeit für Beschaffung
- **Auto-Update:** Abhängig von GitHub Releases als Update-Source
- **CI/CD Tests:** Erfordern Windows-Runner (bereits vorhanden ✅)

### Erfolgsmetriken

- ✅ 100% zuverlässige Uninstaller-Erkennung
- ✅ Auto-Update funktioniert end-to-end
- ✅ Alle Builds sind signiert
- ✅ CI/CD validiert Installer automatisch
- ✅ Code-Qualität verbessert (Tests, Wartbarkeit)

---

## 8. Anhang: Referenzen

### Wichtige Dateien

- `package.json` - Build-Konfiguration
- `scripts/collect-desktop-artifacts.mjs` - Artefakt-Sammlung
- `electron/main.cjs` - Electron Main Process
- `electron/preload.cjs` - Preload Script
- `.github/workflows/release.yml` - CI/CD Workflow
- `docs/WINDOWS_DESKTOP_RELEASE.md` - Aktuelle Dokumentation

### Externe Dependencies

- `electron-builder@26.0.12` - Packaging Tool
- `electron@36.0.0` - Electron Runtime
- `vite@6.4.1` - Build Tool
- `electron-updater` - ❌ Noch nicht installiert

### Dokumentation

- [electron-builder Docs](https://www.electron.build/)
- [electron-updater Docs](https://www.electron.build/auto-update)
- [NSIS Documentation](https://nsis.sourceforge.io/Docs/)

---

**Ende des Berichts**

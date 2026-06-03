# Legal Context — TriggerHub 2.0

## Owner / Verantwortlicher

| Feld | Wert |
|------|------|
| Name | Alexander Posdziech |
| Adresse | Voßort 14, 21037 Hamburg, Deutschland |
| E-Mail | Triggerhub@outlook.com |
| Rechtsform | Privatperson (kein eingetragenes Unternehmen) |

---

## Produkt-Übersicht

**TriggerHub** ist eine Desktop-Anwendung (Electron, Windows) zur Automatisierung von Streaming-Aktionen. Sie verbindet lokale Dienste (OBS, Spotify) mit Cloud-APIs (Twitch) über ein regelbasiertes Trigger-System.

- Aktuelle Version: 0.1.1 (Pre-Release / Early Access)
- Plattform: Windows (Electron 36, lokal installiert)
- Website: statische Landing Page + Auth-Bereich (Vercel)

---

## Technisches Setup

### APIs & Drittdienste

| Dienst | Zweck | Datenfluss |
|--------|-------|------------|
| **Twitch API** | EventSub-Trigger empfangen, Kanal-Events lesen | OAuth 2.0 (clientId + accessToken), ausgehend vom Desktop-Client |
| **Spotify API** | Wiedergabe steuern (Play, Pause, Skip) | OAuth 2.0, ausgehend vom Desktop-Client |
| **OBS WebSocket** | Szenen- und Source-Steuerung lokal | Lokal (localhost), kein externer Datenfluss |

### Authentifizierung

- Eigenes Auth-System auf der Website (E-Mail + Passwort)
- Session-Verwaltung serverseitig via Vercel Serverless Functions
- Kein Social-Login, kein SSO
- Passwörter werden nicht im Klartext gespeichert

### Hosting

| Komponente | Provider |
|------------|----------|
| Website & API-Endpunkte | Vercel (Serverless) |
| Desktop-App | Lokal installiert (kein Cloud-Betrieb) |
| Datenspeicherung (Desktop) | Lokales Dateisystem des Nutzers |

### Analytics & Tracking

- Keine Analytics-Tools (kein Google Analytics, Plausible, o. Ä.)
- Kein Tracking von Nutzerverhalten
- Keine Cookies auf der Website außer Session-Cookie (technisch notwendig)

---

## Nutzerdaten

### Erhobene Daten (Website)

- E-Mail-Adresse (bei Registrierung / Login)
- Passwort-Hash
- Session-Token (kurzlebig, serverseitig)

### Erhobene Daten (Desktop-App)

- Keine Daten werden an den Betreiber übertragen
- Konfiguration (Trigger, Makros, API-Tokens) wird **ausschließlich lokal** gespeichert
- Drittanbieter-Tokens (Twitch, Spotify) liegen lokal, nicht auf Servern des Betreibers

### Weitergabe an Dritte

- Keine Weitergabe von Nutzerdaten an Dritte
- API-Anfragen an Twitch/Spotify erfolgen direkt vom Client des Nutzers

---

## Zugangsbeschränkung

- Keine öffentliche Registrierung — Early-Access-Produkt
- Zugang nur auf Einladung / nach manuellem Freischalten durch den Betreiber
- Kein kommerzieller Betrieb zum jetzigen Zeitpunkt

---

## Rechtliche Einordnung (DSGVO)

- Verantwortlicher im Sinne der DSGVO: Alexander Posdziech (siehe oben)
- Rechtsgrundlage für Verarbeitung: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung / vorvertragliche Maßnahmen)
- Speicherdauer: bis zur Löschung des Accounts auf Anfrage
- Betroffenenrechte: Auskunft, Berichtigung, Löschung per E-Mail an Triggerhub@outlook.com

---

*Zuletzt aktualisiert: 2026-03-17*
1
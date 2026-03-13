# Profile System

## Zweck des Moduls
Das Profilsystem verwaltet Website-Profile getrennt von Identitaetsdaten und stellt daraus nutzerbezogene Profilansichten fuer die Website her.

## Relevante Codebereiche / Ordner
- `website/src/modules/profile/profileService.ts`
- `website/src/modules/profile/profileStore.ts`
- `website/src/modules/profile/runtime.ts`
- `website/src/modules/profile/types.ts`
- `website/src/modules/profile/validation.ts`
- `website/src/modules/identity/`
- `src/tests/website-profile-v1.test.ts`

## Aktueller Umsetzungsstand
- Das Profilmodul ist fuer die Website implementiert.
- `ProfileService` liest Profile ueber ein `ProfileStore`-Interface, erzeugt Standardprofile fuer bekannte Nutzer und aktualisiert Profilfelder nach Validierung.
- `createLocalProfileStore()` speichert Profilrecords unter `th.website.profile.records.v1` in `localStorage`.
- `createWebsiteProfileRuntime()` verdrahtet Identity-Service und Profile-Service fuer die Website-Runtime.
- Die App bindet Profile ueber `ProfileProvider` in `website/src/App.tsx` in den Provider-Baum ein.

## Verifizierte Staerken
- Identitaet und Profil sind als getrennte Records modelliert und im Test explizit getrennt verifiziert.
- Das Modul unterstuetzt bereits die Datenform fuer `owner` und `user`.
- Profilupdates laufen ueber Validierung; ungueltige `avatar_url`-Werte werden abgewiesen.
- Updates fuer unbekannte Nutzer werden explizit verhindert.
- Der Store filtert ungueltige gespeicherte Records defensiv heraus.
- Das Modul ist ueber einen dedizierten Runtime-Factory-Pfad in die Website einhaengbar.

## Verifizierte Luecken
- Die Persistenz ist rein browserlokal ueber `localStorage`.
- Es ist keine serverseitige Profilpersistenz, Synchronisation oder Desktop-Nutzung dieses Moduls belegt.
- Ein End-to-End-Test ueber Website-UI, Provider und Routing ist in den geprueften Quellen nicht belegt; abgedeckt ist vor allem die Service-Logik.

## Naechste sinnvolle Entwicklungsschritte
- Profilmodul und Website-Access-Control als dokumentierte Laufzeitgrenze zusammenziehen.
- Falls serverseitige Persistenz gewuenscht ist, klar zwischen aktuellem `localStorage`-Stand und zukuenftiger Speicherstrategie trennen.
- UI-nahe Tests fuer Provider- und Seitenintegration erst dokumentieren, wenn sie im Repository vorhanden sind.

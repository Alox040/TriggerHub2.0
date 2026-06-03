# TriggerHub Firmenwebsite

Dieses Repository enthält die schlanke Firmenwebsite für die geplante
TriggerHub UG (haftungsbeschränkt) in Gründung.

ResQBrain bleibt eine separate Produktmarke und wird auf `resqbrain.de`
weitergeführt. Dieses Repository enthält keine ResQBrain-App-Logik, keine
Mobile-App, keine API und keine Lookup-Daten.

## Struktur

- `app/` - Next.js App Router Seiten
- `app/page.tsx` - Startseite mit Firmenprofil und Projektabschnitt ResQBrain
- `app/kontakt/page.tsx` - Kontaktseite
- `app/impressum/page.tsx` - Impressum-Platzhalter
- `app/datenschutz/page.tsx` - Datenschutz-Platzhalter
- `vercel.json` - Vercel-Konfiguration für den Root-Build

## Rechtlicher Status

Bis zur Handelsregistereintragung wird die Firmierung als
`TriggerHub UG (haftungsbeschränkt) in Gründung` geführt.

Nicht eingetragen und daher nicht im Repository ergänzt:

- Handelsregisternummer
- Registergericht
- Steuernummer
- USt-ID
- nicht bestätigte Partner oder Referenzen

Diese Angaben werden erst nach tatsächlicher Eintragung und fachlicher Prüfung
ergänzt.

## Entwicklung

```bash
pnpm install
pnpm typecheck
pnpm build
```

Optional lokal starten:

```bash
pnpm dev
```

## Deployment

Die Website ist für Vercel vorbereitet. Vor einer Domain-Verknüpfung sollte
zuerst ein Preview-Deployment geprüft werden.

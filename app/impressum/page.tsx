import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum der TriggerHub UG (haftungsbeschränkt) in Gründung."
};

export default function ImpressumPage() {
  return (
    <section className="legal-page" aria-labelledby="impressum-title">
      <p className="eyebrow">Impressum</p>
      <h1 id="impressum-title">Angaben gemäß § 5 DDG</h1>

      <div className="notice-box">
        <p>
          TriggerHub UG (haftungsbeschränkt) in Gründung
          <br />
          [Vorname Nachname]
          <br />
          [Straße Hausnummer]
          <br />
          [PLZ Ort]
          <br />
          Deutschland
        </p>
      </div>

      <div className="legal-block">
        <h2>Kontakt</h2>
        <p>
          E-Mail: <a href="mailto:kontakt@triggerhub.de">kontakt@triggerhub.de</a>
        </p>
      </div>

      <div className="legal-block">
        <h2>Status der Gesellschaft</h2>
        <p className="muted">
          Die Handelsregistereintragung ist noch nicht abgeschlossen. Angaben zu
          Registergericht und Handelsregisternummer werden erst nach Eintragung
          ergänzt.
        </p>
      </div>
    </section>
  );
}

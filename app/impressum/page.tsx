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
          Alexander Posdziech
          <br />
          Voßort 14
          <br />
          21037 Hamburg
          <br />
          Deutschland
        </p>
      </div>

      <div className="legal-block">
        <h2>Kontakt</h2>
        <p>
          E-Mail:{" "}
          <a href="mailto:Triggerhub@outlook.com">Triggerhub@outlook.com</a>
        </p>
      </div>

      <div className="legal-block">
        <h2>Status der Gesellschaft</h2>
        <p className="muted">
          Die Handelsregistereintragung ist noch nicht abgeschlossen. Angaben
          zu Registergericht und Handelsregisternummer werden erst nach
          erfolgter Eintragung ergänzt. Bis dahin handelt Alexander Posdziech
          als Privatperson.
        </p>
      </div>

      <div className="legal-block">
        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>
          Alexander Posdziech
          <br />
          Voßort 14, 21037 Hamburg
        </p>
      </div>
    </section>
  );
}

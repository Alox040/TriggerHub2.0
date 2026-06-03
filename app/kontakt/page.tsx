import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontakt zur TriggerHub UG (haftungsbeschränkt) in Gründung."
};

export default function KontaktPage() {
  return (
    <section className="legal-page" aria-labelledby="kontakt-title">
      <p className="eyebrow">Kontakt</p>
      <h1 id="kontakt-title">Anfragen an TriggerHub</h1>
      <p className="lead">
        Für Fragen zu TriggerHub, ResQBrain, Partnerschaften oder Testzugängen
        ist die Kontaktaufnahme per E-Mail vorgesehen.
      </p>

      <div className="legal-block">
        <h2>E-Mail</h2>
        <p>
          <a href="mailto:Triggerhub@outlook.com">Triggerhub@outlook.com</a>
        </p>
      </div>

      <div className="legal-block">
        <h2>Hinweis zum Status</h2>
        <p className="muted">
          TriggerHub UG (haftungsbeschränkt) befindet sich in Gründung. Angaben
          zu Registergericht und Handelsregisternummer werden erst nach
          abgeschlossener Handelsregistereintragung ergänzt.
        </p>
      </div>
    </section>
  );
}

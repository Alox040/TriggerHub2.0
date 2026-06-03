import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz",
  description:
    "Datenschutzhinweise der TriggerHub UG (haftungsbeschränkt) in Gründung."
};

export default function DatenschutzPage() {
  return (
    <section className="legal-page" aria-labelledby="datenschutz-title">
      <p className="eyebrow">Datenschutz</p>
      <h1 id="datenschutz-title">Datenschutzhinweise</h1>
      <p className="lead">
        Diese Seite ist als sachlicher Platzhalter für die Datenschutzerklärung
        vorbereitet. Die Angaben müssen vor Veröffentlichung mit Hosting,
        tatsächlich verwendeten Diensten und Kontaktdaten abgeglichen werden.
      </p>

      <div className="legal-block">
        <h2>Verantwortlicher</h2>
        <p>
          TriggerHub UG (haftungsbeschränkt) in Gründung
          <br />
          Alexander Posdziech
          <br />
          Voßort 14, 21037 Hamburg, Deutschland
          <br />
          E-Mail:{" "}
          <a href="mailto:Triggerhub@outlook.com">Triggerhub@outlook.com</a>
        </p>
      </div>

      <div className="legal-block">
        <h2>Verarbeitung beim Besuch der Website</h2>
        <p>
          Beim Aufruf dieser Website können technisch notwendige Daten
          verarbeitet werden, insbesondere IP-Adresse, Zeitpunkt des Zugriffs,
          abgerufene Dateien und technische Informationen zum verwendeten
          Browser. Die Verarbeitung dient dem sicheren und stabilen Betrieb der
          Website.
        </p>
      </div>

      <div className="legal-block">
        <h2>Kontaktaufnahme</h2>
        <p>
          Wenn Sie per E-Mail Kontakt aufnehmen, werden die übermittelten
          Angaben zur Bearbeitung der Anfrage verarbeitet.
        </p>
      </div>

      <div className="legal-block">
        <h2>Hosting</h2>
        <p>
          Diese Website wird bei Vercel Inc. (440 N Barranca Ave #4133, Covina,
          CA 91723, USA) gehostet. Dabei können technisch notwendige
          Server-Logdaten verarbeitet werden. Details entnehmen Sie der
          Datenschutzerklärung von Vercel.
        </p>
      </div>

      <div className="legal-block">
        <h2>Keine Analyse- oder Marketingdienste</h2>
        <p>
          Sofern keine entsprechenden Dienste eingebunden sind, verwendet diese
          Website keine Webanalyse, kein Tracking und keine Marketing-Cookies.
        </p>
      </div>

      <div className="legal-block">
        <h2>Betroffenenrechte</h2>
        <p>
          Im Rahmen der gesetzlichen Voraussetzungen bestehen Rechte auf
          Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
          Datenübertragbarkeit und Widerspruch.
        </p>
      </div>
    </section>
  );
}

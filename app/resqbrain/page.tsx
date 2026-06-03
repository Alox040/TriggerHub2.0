import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ResQBrain",
  description:
    "ResQBrain ist eine Knowledge-only Nachschlage- und Lernhilfe für den Rettungsdienst. Kein Medizinprodukt. Keine Entscheidungsunterstützung."
};

const targetGroups = [
  {
    title: "Rettungsdienstpersonal",
    text: "Rettungssanitäter (RS) und Notfallsanitäter (NotSan) in aktiver Tätigkeit."
  },
  {
    title: "Ausbildung und Training",
    text: "Ausbilder, Lehrgangsleiter und Auszubildende in Hilfsorganisationen und Lehrrettungswachen."
  },
  {
    title: "Wissensauffrischung",
    text: "Personen mit Grundausbildung im Rettungsdienst, die Fachwissen strukturiert wiederholen möchten."
  }
];

const notFor = [
  "Klinische Entscheidungsunterstützung",
  "Dosierungsberechnung oder Arzneimittelempfehlung",
  "Patientenspezifische Handlungsempfehlungen",
  "Einsatzfreigabe oder SOP-Ersatz",
  "Diagnostische Empfehlung oder Therapieplanung",
  "Betrieb als Medizinprodukt gemäß MDR"
];

export default function ResQBrainPage() {
  return (
    <>
      {/* Hero */}
      <section className="section" aria-labelledby="resqbrain-title">
        <p className="eyebrow">Produktprojekt von TriggerHub</p>
        <h1 id="resqbrain-title">ResQBrain</h1>
        <p className="lead">
          Knowledge-only Nachschlage- und Lernhilfe für den Rettungsdienst.
        </p>
        <p style={{ maxWidth: "680px", color: "var(--muted)", marginTop: "16px" }}>
          ResQBrain ist das erste Hauptprojekt von TriggerHub. Es unterstützt
          Rettungsdienstpersonal, Auszubildende und Ausbilder dabei,
          Fachwissen strukturiert zu wiederholen, einzuordnen und nachzuschlagen.
          ResQBrain befindet sich in aktiver Entwicklung.
        </p>

        {/* Mandatory Knowledge-only disclaimer */}
        <div className="disclaimer-box" style={{ maxWidth: "680px" }}>
          <p>
            <strong>Wichtiger Hinweis — Knowledge-only:</strong> ResQBrain ist
            eine Lernhilfe und kein Ersatz für medizinische Ausbildung,
            Leitlinien oder Einsatzentscheidungen. Die Inhalte dienen
            ausschließlich der Wissensvorbereitung und ersetzen keine klinische
            Beurteilung.
          </p>
          <p style={{ marginTop: "8px" }}>
            ResQBrain ist kein Medizinprodukt im Sinne der MDR, keine
            klinische Entscheidungsunterstützung, kein Dosierungsrechner und
            keine Einsatzsoftware.
          </p>
        </div>
      </section>

      {/* Für wen */}
      <section className="section" aria-labelledby="target-title">
        <div className="section-grid">
          <div className="section-kicker">Für wen</div>
          <div>
            <h2 id="target-title">Zielgruppen</h2>
            <ul className="work-list" style={{ marginTop: "20px" }}>
              {targetGroups.map((item) => (
                <li key={item.title}>
                  <h3>{item.title}</h3>
                  <p className="muted">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Was es nicht ist */}
      <section className="section" aria-labelledby="limits-title">
        <div className="section-grid">
          <div className="section-kicker">Klare Grenzen</div>
          <div>
            <h2 id="limits-title">Was ResQBrain nicht ist.</h2>
            <p className="muted">
              Diese Abgrenzungen sind keine juristische Fußnote — sie beschreiben
              den inhaltlichen Kern des Produkts.
            </p>
            <ul className="plain-list" style={{ marginTop: "20px" }}>
              {notFor.map((item) => (
                <li key={item} className="muted" style={{ fontSize: "0.92rem" }}>
                  — {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pilotinteresse */}
      <section className="section" aria-labelledby="pilot-title">
        <div className="section-grid">
          <div className="section-kicker">Pilotphase</div>
          <div className="cta-box">
            <h2 id="pilot-title" style={{ color: "#ffffff" }}>
              Interesse an der Pilotphase?
            </h2>
            <p className="muted">
              Wir suchen Ausbildungseinrichtungen, Rettungswachen und
              Einzelpersonen im Rettungsdienst für eine frühe Testphase.
              Pilotpartner werden namentlich nur genannt, wenn eine schriftliche
              Vereinbarung besteht.
            </p>
            <div
              style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "24px" }}
            >
              <a
                className="button"
                href="mailto:Triggerhub@outlook.com"
                style={{
                  background: "#ffffff",
                  borderColor: "#ffffff",
                  color: "var(--accent-strong)"
                }}
              >
                Pilotinteresse melden
              </a>
              <Link
                className="button"
                href="/"
                style={{ borderColor: "rgba(255,255,255,0.4)", color: "#ffffff" }}
              >
                Zurück zur Startseite
              </Link>
            </div>
            <p
              className="muted"
              style={{ marginTop: "16px", fontSize: "0.82rem" }}
            >
              Kein Formular. Keine automatische Antwort. Direkte E-Mail.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

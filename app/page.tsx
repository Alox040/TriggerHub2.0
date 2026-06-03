import Link from "next/link";

const workingPrinciples = [
  {
    title: "Struktur vor Umfang",
    text: "Inhalte und Funktionen werden bewusst reduziert, klar gegliedert und nachvollziehbar aufgebaut."
  },
  {
    title: "Klare fachliche Grenzen",
    text: "Produkte werden sachlich als Wissens-, Lern- oder Nachschlageangebote positioniert — ohne Scope-Überdehnung."
  },
  {
    title: "Saubere Grundlage",
    text: "Rechtliche Angaben, Datenschutz und stabile technische Basis haben Vorrang vor optischem Ausbau."
  }
];

const services = [
  "Digitale Produktentwicklung",
  "Wissens- und Referenzsysteme",
  "Automatisierung und interne Tools",
  "UI/UX und Produktstruktur",
  "MVP-Validierung"
];

const processSteps = [
  { num: "01", title: "Verstehen", text: "Nutzungssituation, Kontext und tatsächlicher Bedarf vor dem ersten Commit." },
  { num: "02", title: "Strukturieren", text: "Produktgrenzen, Architektur und Grundlage klären und dokumentieren." },
  { num: "03", title: "Prototypisieren", text: "Lauffähiger Prototyp ohne Over-Engineering, mit definiertem Scope." },
  { num: "04", title: "Validieren", text: "Testen mit realen Nutzern oder Pilotpartnern. Feedback direkt zurück." },
  { num: "05", title: "Iterieren", text: "Gezielt verbessern auf Basis belastbarer Erkenntnisse." }
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <div>
          <p className="eyebrow">Softwarefirma in Gründung</p>
          <h1 id="hero-title">
            TriggerHub entwickelt Software für strukturiertes Wissen.
          </h1>
          <p className="lead">
            TriggerHub UG (haftungsbeschränkt) in Gründung ist die geplante
            Dachmarke für digitale Wissens- und Lernprodukte. Die Website wird
            rechtlich vorsichtig vorbereitet und bildet die Firmenstruktur klar
            getrennt von der Produktmarke ResQBrain ab.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/kontakt">
              Kontakt aufnehmen
            </Link>
            <Link className="button button-secondary" href="/resqbrain">
              ResQBrain ansehen
            </Link>
          </div>
        </div>
        <aside className="signal-panel" aria-label="Unternehmensfokus">
          <div className="signal-panel-title">Fokus</div>
          <div className="signal-grid">
            {["digitale Wissensprodukte", "sachliche Nutzerführung", "klare Produktabgrenzung"].map((item) => (
              <div className="signal-item" key={item}>
                <span className="signal-dot" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {/* Unternehmen */}
      <section className="section" aria-labelledby="company-title">
        <div className="section-grid">
          <div className="section-kicker">Unternehmen</div>
          <div className="content-stack">
            <h2 id="company-title">
              Schlanke Softwareentwicklung mit klarer Verantwortung.
            </h2>
            <p>
              TriggerHub bündelt Entwicklung, Betrieb und strategische
              Weiterentwicklung eigener Softwareprodukte. Im Mittelpunkt stehen
              klare Informationsarchitekturen, verlässliche Inhalte und eine
              verantwortungsvolle Abgrenzung der jeweiligen Produktfunktion.
            </p>
            <p className="muted">
              Bis zur Handelsregistereintragung wird die Firmierung ausdrücklich
              als TriggerHub UG (haftungsbeschränkt) in Gründung geführt. Keine
              Handelsregisternummer oder USt-ID vor abgeschlossener Eintragung.
            </p>
          </div>
        </div>
      </section>

      {/* Aktuelles Projekt — ResQBrain */}
      <section className="section" aria-labelledby="project-title">
        <div className="section-grid">
          <div className="section-kicker">Aktuelles Projekt</div>
          <div>
            <div className="project-box">
              <h2 id="project-title">ResQBrain</h2>
              <p>
                ResQBrain ist das erste Hauptprojekt von TriggerHub. Es ist eine
                Knowledge-only Nachschlage- und Lernhilfe für den Rettungsdienst.
              </p>
              <p>
                Das Produkt unterstützt dabei, rettungsdienstliches Fachwissen
                strukturiert zu wiederholen, einzuordnen und nachzuschlagen.
              </p>
              <div className="disclaimer-box">
                <p>
                  <strong>Knowledge-only:</strong> ResQBrain ist keine
                  Entscheidungsunterstützung, kein Medizinprodukt und kein
                  Ersatz für Ausbildung, ärztliche Beratung, lokale SOPs oder
                  eigenverantwortliche fachliche Beurteilung.
                </p>
              </div>
              <div style={{ marginTop: "20px" }}>
                <Link className="button button-secondary" href="/resqbrain">
                  Mehr zu ResQBrain
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Arbeitsweise */}
      <section className="section" aria-labelledby="work-title">
        <div className="section-grid">
          <div className="section-kicker">Arbeitsweise</div>
          <div>
            <h2 id="work-title">Sachlich, reduziert und nachvollziehbar.</h2>
            <ul className="work-list">
              {workingPrinciples.map((item) => (
                <li key={item.title}>
                  <h3>{item.title}</h3>
                  <p className="muted">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Leistungen */}
      <section className="section" aria-labelledby="services-title">
        <div className="section-grid">
          <div className="section-kicker">Leistungen</div>
          <div>
            <h2 id="services-title">Was wir entwickeln.</h2>
            <p className="muted" style={{ marginBottom: "24px" }}>
              Fokussierter Scope. Keine Full-Service-Versprechen ohne Grundlage.
            </p>
            <ul className="services-list">
              {services.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Prozess */}
      <section className="section" aria-labelledby="process-title">
        <div className="section-grid">
          <div className="section-kicker">Prozess</div>
          <div>
            <h2 id="process-title">Wie ein Projekt entsteht.</h2>
            <p className="muted" style={{ marginBottom: "24px" }}>
              Kein Wasserfall, kein Sprint-Theater. Strukturierte Iteration mit
              echten Zwischenergebnissen.
            </p>
            <ol className="process-list">
              {processSteps.map((step) => (
                <li className="process-step" key={step.num}>
                  <span className="process-step-num">{step.num}</span>
                  <h3>{step.title}</h3>
                  <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Kontakt-CTA */}
      <section className="section" aria-labelledby="cta-title">
        <div className="section-grid">
          <div className="section-kicker">Kontakt</div>
          <div className="cta-box">
            <h2 id="cta-title" style={{ color: "#ffffff" }}>
              Projektidee, Pilotphase oder Austausch?
            </h2>
            <p className="muted">
              Kein Formular, kein Sales-Funnel. Eine direkte E-Mail an eine
              echte Person.
            </p>
            <div style={{ marginTop: "24px" }}>
              <a
                className="button"
                href="mailto:Triggerhub@outlook.com"
                style={{
                  background: "#ffffff",
                  borderColor: "#ffffff",
                  color: "var(--accent-strong)"
                }}
              >
                Triggerhub@outlook.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

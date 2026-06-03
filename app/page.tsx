import Link from "next/link";

const workingPrinciples = [
  {
    title: "Struktur vor Umfang",
    text: "Inhalte und Funktionen werden bewusst reduziert, klar gegliedert und nachvollziehbar aufgebaut."
  },
  {
    title: "Klare fachliche Grenzen",
    text: "Produkte werden sachlich als Wissens-, Lern- oder Nachschlageangebote positioniert."
  },
  {
    title: "Saubere Grundlage",
    text: "Rechtliche Angaben, Datenschutz und stabile technische Basis haben Vorrang vor optischem Ausbau."
  }
];

export default function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div>
          <p className="eyebrow">Softwarefirma in Gründung</p>
          <h1 id="hero-title">TriggerHub entwickelt Software für strukturiertes Wissen.</h1>
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
            <a className="button button-secondary" href="https://resqbrain.de">
              ResQBrain ansehen
            </a>
          </div>
        </div>
        <aside className="signal-panel" aria-label="Unternehmensfokus">
          <div className="signal-panel-title">Fokus</div>
          <div className="signal-grid">
            <div className="signal-item">
              <span className="signal-dot" aria-hidden="true" />
              <span>digitale Wissensprodukte</span>
            </div>
            <div className="signal-item">
              <span className="signal-dot" aria-hidden="true" />
              <span>sachliche Nutzerführung</span>
            </div>
            <div className="signal-item">
              <span className="signal-dot" aria-hidden="true" />
              <span>klare Produktabgrenzung</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="section" aria-labelledby="company-title">
        <div className="section-grid">
          <div className="section-kicker">Unternehmen</div>
          <div className="content-stack">
            <h2 id="company-title">Schlanke Softwareentwicklung mit klarer Verantwortung.</h2>
            <p>
              TriggerHub bündelt Entwicklung, Betrieb und strategische
              Weiterentwicklung eigener Softwareprodukte. Im Mittelpunkt stehen
              klare Informationsarchitekturen, verlässliche Inhalte und eine
              verantwortungsvolle Abgrenzung der jeweiligen Produktfunktion.
            </p>
            <p className="muted">
              Bis zur Handelsregistereintragung wird die Firmierung ausdrücklich
              als TriggerHub UG (haftungsbeschränkt) in Gründung geführt.
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="project-title">
        <div className="section-grid">
          <div className="section-kicker">Aktuelles Projekt</div>
          <div className="project-box">
            <h2 id="project-title">ResQBrain</h2>
            <p>
              ResQBrain ist das erste Hauptprojekt von TriggerHub. Es ist eine
              Knowledge-only Nachschlage- und Lernhilfe für den Rettungsdienst.
            </p>
            <p>
              Das Produkt unterstützt dabei, rettungsdienstliches Fachwissen
              strukturiert zu wiederholen, einzuordnen und nachzuschlagen.
              ResQBrain ist nicht für operative Entscheidungen konzipiert und
              trifft keine medizinischen Entscheidungen.
            </p>
            <p className="muted">
              ResQBrain ersetzt keine Ausbildung, keine ärztliche Beratung,
              keine lokalen SOPs, keine Dienstanweisungen und keine
              eigenverantwortliche fachliche Beurteilung.
            </p>
          </div>
        </div>
      </section>

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
    </>
  );
}

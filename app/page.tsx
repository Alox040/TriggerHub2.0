import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero" aria-labelledby="hero-title">
        {/* hero-text gets entrance animation */}
        <div className="hero-text">
          <p className="eyebrow">Software-Studio · in Gründung</p>
          <h1 id="hero-title">
            Digitale Werkzeuge,<br aria-hidden="true" />
            die im Arbeitsalltag halten.
          </h1>
          <p className="lead">
            TriggerHub entwickelt fokussierte Softwareprodukte für Fachleute —
            präzise im Scope, klar in der Funktion, ehrlich im Stand.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/resqbrain">
              ResQBrain ansehen →
            </Link>
            <Link className="button button-secondary" href="/kontakt">
              Kontakt aufnehmen
            </Link>
          </div>
        </div>

        {/* hero-aside gets staggered entrance animation */}
        <aside className="hero-aside" aria-label="Aktueller Entwicklungsstand">
          <div className="status-panel">
            <div className="status-panel-title">Aktueller Stand</div>
            <div className="status-rows">
              <div className="status-row">
                <span className="dot dot-active" aria-hidden="true" />
                <span className="status-row-label">ResQBrain</span>
                <span className="status-row-value">In Entwicklung</span>
              </div>
              <div className="status-row">
                <span className="dot dot-partial" aria-hidden="true" />
                <span className="status-row-label">TriggerHub UG</span>
                <span className="status-row-value">In Gründung</span>
              </div>
              <div className="status-row">
                <span className="dot dot-open" aria-hidden="true" />
                <span className="status-row-label">Weitere Projekte</span>
                <span className="status-row-value">Konzeptphase</span>
              </div>
            </div>
            <hr className="status-divider" aria-hidden="true" />
            <p className="status-footnote">
              Kein Investor-Druck · Kein Launch-Datum
            </p>
          </div>
        </aside>
      </section>

      {/* ── Unternehmen (dark) ───────────────────────────────── */}
      <section
        className="section section-dark"
        id="unternehmen"
        aria-labelledby="company-title"
      >
        <div className="section-grid">
          <div className="section-kicker">Das Unternehmen</div>
          <div>
            <h2 id="company-title">
              TriggerHub ist das Fundament — nicht das Produkt.
            </h2>
            <p>
              Hinter jedem nachhaltigen Produkt steht eine Einheit, die
              Entwicklung, Betrieb und Verantwortung langfristig trägt.
              TriggerHub übernimmt diese Rolle — zunächst für ResQBrain,
              später für weitere digitale Produkte.
            </p>
            <div className="principle-grid">
              <div className="principle-card">
                <div className="principle-num">01</div>
                <h3>Fokus</h3>
                <p>
                  Ein fokussiertes Produkt mit echtem Nutzen ist wertvoller
                  als zehn halbfertige Features.
                </p>
              </div>
              <div className="principle-card">
                <div className="principle-num">02</div>
                <h3>Klarheit</h3>
                <p>
                  Jedes Produkt hat einen definierten Scope. Was es nicht
                  ist, steht ebenso klar drin.
                </p>
              </div>
              <div className="principle-card">
                <div className="principle-num">03</div>
                <h3>Transparenz</h3>
                <p>
                  Wir kommunizieren den echten Stand — nicht den, der
                  gut klingt.
                </p>
              </div>
            </div>
            {/* Legal note — CSS class, no inline styles */}
            <p className="company-legal-note">
              TriggerHub UG (haftungsbeschränkt) befindet sich in Gründung.
              Bis zur Handelsregistereintragung handelt Alexander Posdziech
              als Privatperson. Kein HRB, keine USt-ID, kein Gründungsdatum.
            </p>
          </div>
        </div>
      </section>

      {/* ── ResQBrain ────────────────────────────────────────── */}
      <section className="section" aria-labelledby="product-title">
        <div className="section-grid">
          <div className="section-kicker">Aktuelles Produkt</div>
          <div>
            <div className="product-card">
              <div className="product-tags">
                <span className="tag tag-product">Knowledge-only</span>
                <span className="tag tag-status">In Entwicklung</span>
              </div>
              <h3 id="product-title">ResQBrain</h3>
              <p className="product-tagline">
                Nachschlage- und Lernhilfe für den Rettungsdienst
              </p>
              <p className="product-desc">
                ResQBrain ist das erste Produkt unter dem Dach von TriggerHub.
                Es unterstützt Rettungsdienstpersonal, Auszubildende und
                Ausbilder dabei, Fachwissen strukturiert zu wiederholen,
                einzuordnen und nachzuschlagen — für Ausbildung und
                Vorbereitung, nicht für Entscheidungen im Einsatz.
              </p>
              <div className="product-disclaimer" role="note">
                <span className="product-disclaimer-icon" aria-hidden="true">
                  ⓘ
                </span>
                <p>
                  <strong>Knowledge-only:</strong> ResQBrain ist kein
                  Medizinprodukt, keine Entscheidungsunterstützung und kein
                  Ersatz für lokale SOPs, Leitlinien, ärztliche Beratung oder
                  eigenverantwortliche fachliche Beurteilung.
                </p>
              </div>
              <Link className="product-link" href="/resqbrain">
                Mehr zu ResQBrain →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Wie wir arbeiten ─────────────────────────────────── */}
      <section className="section" aria-labelledby="how-title">
        <div className="section-grid">
          <div className="section-kicker">Arbeitsweise</div>
          <div>
            <h2 id="how-title">Strukturiert. Klar begrenzt. Robust.</h2>
            <p className="muted how-lead">
              Produktentwicklung ohne Wasserfall-Theater und ohne
              Feature-Creep. Jeder Schritt hat ein nachvollziehbares Ergebnis.
            </p>
            <div className="how-grid">
              <div className="how-card">
                <h3>Verstehen vor Bauen</h3>
                <p>
                  Nutzungskontext und tatsächlicher Bedarf werden analysiert,
                  bevor Code geschrieben wird.
                </p>
              </div>
              <div className="how-card">
                <h3>Scope bewusst begrenzen</h3>
                <p>
                  Ein klarer Scope schützt vor Überdehnung — und schützt
                  Nutzer vor falschen Erwartungen.
                </p>
              </div>
              <div className="how-card">
                <h3>Iterieren auf Basis echter Erkenntnisse</h3>
                <p>
                  Kein Feature ohne Begründung. Verbesserungen folgen aus
                  Feedback, nicht aus Wunschlisten.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Kontakt-CTA ──────────────────────────────────────── */}
      <section className="section" aria-labelledby="cta-title">
        <div className="section-grid">
          <div className="section-kicker">Kontakt</div>
          <div className="cta-box">
            <h2 id="cta-title">
              Interesse an ResQBrain, Zusammenarbeit oder Austausch?
            </h2>
            <p className="cta-text">
              Kein Formular, kein Autoresponder. Eine direkte Nachricht
              an eine echte Person — für Pilotinteresse bei ResQBrain,
              Kooperationsanfragen und allgemeine Fragen.
            </p>
            <a
              className="cta-email-button"
              href="mailto:Triggerhub@outlook.com"
            >
              Triggerhub@outlook.com schreiben
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

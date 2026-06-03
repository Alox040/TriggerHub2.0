import { ArrowLeft } from 'lucide-react'
import { CompanyShell } from '../components/company/CompanyShell'
import { SITE } from '../config/site'

interface LegalPageProps {
  variant: 'impressum' | 'datenschutz'
  onNavigate: (path: string) => void
}

const ImpressumContent = () => (
  <div className="prose-sm prose-invert max-w-none">
    <section className="mb-8">
      <h2 className="mb-3 text-base font-semibold text-white">
        Angaben gemäß § 5 TMG
      </h2>
      <p className="text-slate-400">
        {SITE.owner.name}<br />
        {SITE.owner.address}<br />
        {SITE.owner.city}<br />
        {SITE.owner.country}
      </p>
    </section>

    <section className="mb-8">
      <h2 className="mb-3 text-base font-semibold text-white">Kontakt</h2>
      <p className="text-slate-400">
        E-Mail:{' '}
        <a className="text-sky-400 hover:text-sky-300" href={SITE.links.mailto}>
          {SITE.owner.email}
        </a>
      </p>
    </section>

    <section className="mb-8">
      <h2 className="mb-3 text-base font-semibold text-white">Rechtsstatus</h2>
      <p className="text-slate-400">
        Diese Website wird von {SITE.owner.name} als Privatperson betrieben.
        Die {SITE.company.legalName} befindet sich in Planung. Bis zur
        abgeschlossenen Eintragung im Handelsregister gibt es keine Handelsregisternummer
        und keine Umsatzsteuer-Identifikationsnummer.
      </p>
      <p className="mt-3 text-slate-400">
        Alle auf dieser Website genannten Inhalte zu TriggerHub und ResQBrain
        sind Projekte von {SITE.owner.name} als Privatperson.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="mb-3 text-base font-semibold text-white">
        Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
      </h2>
      <p className="text-slate-400">
        {SITE.owner.name}<br />
        {SITE.owner.address}<br />
        {SITE.owner.city}
      </p>
    </section>

    <section className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-4">
      <p className="text-xs leading-[1.7] text-amber-300/80">
        <strong className="text-amber-300">Platzhalter-Hinweis:</strong> Diese Seite muss
        aktualisiert werden, sobald die TriggerHub UG (haftungsbeschränkt) im Handelsregister
        eingetragen ist. Dann sind Handelsregisternummer, Sitz der Gesellschaft und
        vertretungsberechtigte Person (Geschäftsführer) einzutragen. Keine der aktuell
        fehlenden Pflichtangaben ist eine bewusste Auslassung — sie liegen noch nicht vor.
      </p>
    </section>
  </div>
)

const DatenschutzContent = () => (
  <div className="prose-sm prose-invert max-w-none space-y-8">
    <section>
      <h2 className="mb-3 text-base font-semibold text-white">1. Verantwortlicher</h2>
      <p className="text-slate-400">
        Verantwortlicher im Sinne der DSGVO ist:
      </p>
      <p className="mt-2 text-slate-400">
        {SITE.owner.name}<br />
        {SITE.owner.address}<br />
        {SITE.owner.city}<br />
        {SITE.owner.country}<br />
        E-Mail:{' '}
        <a className="text-sky-400 hover:text-sky-300" href={SITE.links.mailto}>
          {SITE.owner.email}
        </a>
      </p>
    </section>

    <section>
      <h2 className="mb-3 text-base font-semibold text-white">2. Hosting</h2>
      <p className="text-slate-400">
        Diese Website wird über Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723,
        USA) gehostet. Beim Seitenaufruf können technische Zugriffsdaten wie IP-Adresse,
        Uhrzeit und aufgerufene URL durch Vercel verarbeitet werden. Rechtsgrundlage
        ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an stabilem Betrieb).
        Details entnehmen Sie der Datenschutzerklärung von Vercel.
      </p>
    </section>

    <section>
      <h2 className="mb-3 text-base font-semibold text-white">
        3. Keine Analytics oder Tracking
      </h2>
      <p className="text-slate-400">
        Diese Website verwendet keine Analyse- oder Tracking-Dienste (kein Google Analytics,
        kein Plausible, kein Matomo). Es werden keine Nutzerprofile erstellt und kein
        Verhalten analysiert.
      </p>
    </section>

    <section>
      <h2 className="mb-3 text-base font-semibold text-white">4. Cookies</h2>
      <p className="text-slate-400">
        Außer technisch notwendigen Cookies (z. B. Session-Cookie für den geschützten
        Bereich) werden keine Cookies gesetzt. Kein Tracking-Cookie, kein Marketing-Cookie.
      </p>
    </section>

    <section>
      <h2 className="mb-3 text-base font-semibold text-white">5. Kontaktaufnahme</h2>
      <p className="text-slate-400">
        Wenn Sie uns per E-Mail kontaktieren, werden die übermittelten Daten
        (E-Mail-Adresse, Inhalt) ausschließlich zur Bearbeitung Ihrer Anfrage gespeichert
        und genutzt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Daten werden nicht
        an Dritte weitergegeben.
      </p>
    </section>

    <section>
      <h2 className="mb-3 text-base font-semibold text-white">6. Ihre Rechte</h2>
      <p className="text-slate-400">
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
        Verarbeitung und Widerspruch (Art. 15–21 DSGVO). Wenden Sie sich dazu an:{' '}
        <a className="text-sky-400 hover:text-sky-300" href={SITE.links.mailto}>
          {SITE.owner.email}
        </a>
        . Sie haben außerdem das Recht, eine Beschwerde bei der zuständigen
        Datenschutzaufsichtsbehörde einzureichen.
      </p>
    </section>

    <section>
      <h2 className="mb-3 text-base font-semibold text-white">
        7. Hinweis zu ResQBrain
      </h2>
      <p className="text-slate-400">
        ResQBrain befindet sich in Entwicklung und ist noch nicht öffentlich zugänglich.
        Sobald ResQBrain als eigenständige Anwendung betrieben wird, wird die
        Datenschutzerklärung entsprechend erweitert.
      </p>
    </section>
  </div>
)

export const LegalPage = ({ variant, onNavigate }: LegalPageProps) => (
  <CompanyShell onNavigate={onNavigate}>
    <main className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-2xl">
        {/* Back */}
        <button
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-white focus-visible:outline-none"
          onClick={() => onNavigate('/')}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Zurück
        </button>

        <h1 className="font-['Sora',sans-serif] text-2xl font-semibold text-white md:text-3xl">
          {variant === 'impressum' ? 'Impressum' : 'Datenschutzerklärung'}
        </h1>

        <div className="mt-8">
          {variant === 'impressum' ? <ImpressumContent /> : <DatenschutzContent />}
        </div>
      </div>
    </main>
  </CompanyShell>
)

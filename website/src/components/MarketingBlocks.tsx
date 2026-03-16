import { useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FolderGit2,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';

const GITHUB_REPO_URL = 'https://github.com/Alox040/TriggerHub';

const sectionLinks = [
  { id: 'benefits', label: 'Benefits' },
  { id: 'features', label: 'Features' },
  { id: 'workflow', label: 'How it works' },
  { id: 'extensions', label: 'Extensions' },
  { id: 'faq', label: 'FAQ' },
] as const;

const openSection = (sectionId: string, onNavigate: (path: string) => void) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.location.pathname !== '/') {
    onNavigate('/');
    window.setTimeout(() => {
      const target = document.getElementById(sectionId);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState({}, '', `/#${sectionId}`);
    }, 0);
    return;
  }

  const target = document.getElementById(sectionId);
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.history.replaceState({}, '', `/#${sectionId}`);
};

export const useHashSectionSync = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash) {
      return;
    }

    const sectionId = window.location.hash.replace('#', '');
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }

    window.setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);
};

type MarketingShellProps = {
  children: ReactNode;
  onNavigate: (path: string) => void;
};

export const MarketingShell = ({ children, onNavigate }: MarketingShellProps) => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(73,126,255,0.12),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.14),transparent_20%),linear-gradient(180deg,#08111f_0%,#0c1726_45%,#f4f1ea_45%,#f7f4ee_100%)] text-slate-950">
    <header className="sticky top-0 z-40 border-b border-white/60 bg-[rgba(8,17,31,0.78)] text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <button className="text-left" onClick={() => onNavigate('/')} type="button">
          <div className="font-['Sora',sans-serif] text-sm font-semibold tracking-[0.18em] text-sky-300">TRIGGERHUB</div>
          <div className="mt-1 text-xs text-slate-300">Desktop automation for creator workflows</div>
        </button>

        <nav className="hidden items-center gap-6 md:flex">
          {sectionLinks.map((item) => (
            <button
              key={item.id}
              className="text-sm text-slate-300 transition hover:text-white"
              onClick={() => openSection(item.id, onNavigate)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="rounded-full border border-white/14 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/8"
            onClick={() => onNavigate('/login')}
            type="button"
          >
            Protected access
          </button>
        </div>
      </div>
    </header>

    {children}

    <footer className="border-t border-slate-200 bg-[#f7f4ee]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <div className="font-['Sora',sans-serif] text-sm font-semibold tracking-[0.18em] text-slate-900">TRIGGERHUB</div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
            Product information reflects the current desktop scope available in this repository and public release path.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Product</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {sectionLinks.map((item) => (
              <button
                key={item.id}
                className="block transition hover:text-slate-900"
                onClick={() => openSection(item.id, onNavigate)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">Links</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <a className="block transition hover:text-slate-900" href={GITHUB_REPO_URL} rel="noreferrer" target="_blank">
              GitHub repository
            </a>
            <button className="block transition hover:text-slate-900" onClick={() => onNavigate('/login')} type="button">
              Protected access
            </button>
          </div>
        </div>
      </div>
    </footer>
  </div>
);

type MarketingHeroProps = {
  title: string;
  description: string;
  proofPoints: string[];
  onNavigate: (path: string) => void;
};

export const MarketingHero = ({ title, description, proofPoints, onNavigate }: MarketingHeroProps) => (
  <section className="px-6 pb-20 pt-16 text-white md:pb-28 md:pt-24">
    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div>
        <div className="inline-flex rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-sky-200">
          Windows desktop software
        </div>
        <h1 className="mt-6 max-w-4xl font-['Sora',sans-serif] text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-[1.08]">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{description}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-100"
            onClick={() => onNavigate('/login')}
            type="button"
          >
            Request access
            <ArrowRight className="size-4" />
          </button>
          <button
            className="rounded-full border border-white/14 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
            onClick={() => openSection('features', onNavigate)}
            type="button"
          >
            See core capabilities
          </button>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {proofPoints.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-4 text-sm leading-6 text-slate-200">
              {item}
            </div>
          ))}
        </div>
      </div>

      <DesktopPreview />
    </div>
  </section>
);

const DesktopPreview = () => (
  <div className="relative">
    <div className="absolute inset-x-12 top-10 h-40 rounded-full bg-sky-400/18 blur-3xl" />
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#09111d]/92 shadow-[0_30px_90px_rgba(2,6,23,0.48)]">
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
        <div className="flex gap-2">
          <span className="size-3 rounded-full bg-rose-400/80" />
          <span className="size-3 rounded-full bg-amber-300/80" />
          <span className="size-3 rounded-full bg-emerald-400/80" />
        </div>
        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Workflow overview</div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Automation flow</div>
              <div className="mt-2 text-lg font-semibold text-white">Live stream startup</div>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
              Local runtime
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {[
              ['Trigger', 'Detect a source event in your setup'],
              ['Condition', 'Decide when the workflow should continue'],
              ['Macro', 'Group repeated steps into one reusable sequence'],
              ['Action', 'Run the connected tool change locally'],
            ].map(([label, text]) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-black/14 px-4 py-4">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-400/12 text-sm font-semibold text-sky-200">
                  {label.slice(0, 1)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{label}</div>
                  <div className="mt-1 text-sm text-slate-400">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Connected surface</div>
            <div className="mt-4 space-y-3">
              {['OBS control', 'Spotify actions', 'Clip export modules', 'Plugin-ready runtime'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-black/14 px-4 py-3 text-sm text-slate-200">
                  <CheckCircle2 className="size-4 text-sky-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-sky-300/14 bg-sky-300/8 p-5">
            <div className="text-xs uppercase tracking-[0.22em] text-sky-100/80">Why it matters</div>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              Keep repetitive actions out of your live setup, reduce manual switching, and run workflows from one desktop control layer.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

type MarketingSectionProps = {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  tone?: 'light' | 'dark';
  children: ReactNode;
};

export const MarketingSection = ({
  id,
  eyebrow,
  title,
  description,
  tone = 'light',
  children,
}: MarketingSectionProps) => (
  <section
    className={`px-6 py-16 md:py-24 ${tone === 'dark' ? 'bg-[#0c1726] text-white' : 'text-slate-950'}`}
    id={id}
  >
    <div className="mx-auto max-w-7xl">
      <div className="max-w-3xl">
        <div className={`text-xs uppercase tracking-[0.24em] ${tone === 'dark' ? 'text-sky-200' : 'text-sky-700'}`}>{eyebrow}</div>
        <h2 className={`mt-4 font-['Sora',sans-serif] text-3xl font-semibold tracking-tight md:text-5xl ${tone === 'dark' ? 'text-white' : 'text-slate-950'}`}>
          {title}
        </h2>
        {description ? (
          <p className={`mt-5 text-lg leading-8 ${tone === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{description}</p>
        ) : null}
      </div>
      <div className="mt-10">{children}</div>
    </div>
  </section>
);

type BenefitGridProps = {
  items: Array<{ title: string; description: string }>;
};

export const BenefitGrid = ({ items }: BenefitGridProps) => (
  <div className="grid gap-6 md:grid-cols-3">
    {items.map((item) => (
      <article key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
          <Sparkles className="size-5" />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
      </article>
    ))}
  </div>
);

type FeatureCardGridProps = {
  items: Array<{ title: string; description: string; bullets?: string[] }>;
};

export const FeatureCardGrid = ({ items }: FeatureCardGridProps) => (
  <div className="grid gap-6 lg:grid-cols-3">
    {items.map((item) => (
      <article key={item.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-7">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-300/10 text-sky-200">
          <Workflow className="size-5" />
        </div>
        <h3 className="mt-5 text-xl font-semibold text-white">{item.title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
        {item.bullets?.length ? (
          <ul className="mt-5 space-y-3 text-sm text-slate-200">
            {item.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <ChevronRight className="mt-1 size-4 flex-none text-sky-300" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </article>
    ))}
  </div>
);

type WorkflowStepsProps = {
  steps: Array<{ title: string; description: string }>;
};

export const WorkflowSteps = ({ steps }: WorkflowStepsProps) => (
  <div className="grid gap-6 lg:grid-cols-3">
    {steps.map((step, index) => (
      <article key={step.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
            0{index + 1}
          </div>
          <h3 className="text-xl font-semibold text-slate-950">{step.title}</h3>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-600">{step.description}</p>
      </article>
    ))}
  </div>
);

type TrustGridProps = {
  items: Array<{ title: string; description: string }>;
};

export const TrustGrid = ({ items }: TrustGridProps) => (
  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
    {items.map((item) => (
      <article key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-[#fffdf8] p-6">
        <ShieldCheck className="size-5 text-sky-700" />
        <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
      </article>
    ))}
  </div>
);

type FaqSectionProps = {
  items: Array<{ question: string; answer: string }>;
};

export const FaqSection = ({ items }: FaqSectionProps) => (
  <div className="grid gap-4">
    {items.map((item) => (
      <article key={item.question} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        <h3 className="text-lg font-semibold text-slate-950">{item.question}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
      </article>
    ))}
  </div>
);

type MarketingCtaProps = {
  title: string;
  description: string;
  onNavigate: (path: string) => void;
};

export const MarketingCta = ({ title, description, onNavigate }: MarketingCtaProps) => (
  <section className="px-6 pb-24 pt-8">
    <div className="mx-auto max-w-7xl">
      <div className="rounded-[2rem] bg-[linear-gradient(135deg,#08111f_0%,#0d2438_55%,#12314d_100%)] p-8 text-white shadow-[0_35px_90px_rgba(2,6,23,0.35)] md:p-12">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.24em] text-sky-200">Final CTA</div>
          <h2 className="mt-4 font-['Sora',sans-serif] text-3xl font-semibold md:text-4xl">{title}</h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">{description}</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-100"
            onClick={() => onNavigate('/login')}
            type="button"
          >
            Request protected access
          </button>
          <a
            className="inline-flex items-center gap-2 rounded-full border border-white/14 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
            href={GITHUB_REPO_URL}
            rel="noreferrer"
            target="_blank"
          >
            <FolderGit2 className="size-4" />
            View repository
          </a>
        </div>
      </div>
    </div>
  </section>
);

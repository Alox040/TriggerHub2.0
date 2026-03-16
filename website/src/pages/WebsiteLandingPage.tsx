import {
  BenefitGrid,
  FaqSection,
  FeatureCardGrid,
  MarketingCta,
  MarketingHero,
  MarketingSection,
  MarketingShell,
  TrustGrid,
  WorkflowSteps,
  useHashSectionSync,
} from '../components/MarketingBlocks';
import { navigateTo } from '../app/routing/navigation';

const heroProofPoints = [
  'Runs as a Windows desktop product',
  'Focused on local workflow execution',
  'Focused on controlled early access',
];

const benefits = [
  {
    title: 'Reduce live setup friction',
    description:
      'Move repetitive actions out of your manual workflow so you can stay focused on the stream instead of juggling tools.',
  },
  {
    title: 'Keep control on your machine',
    description:
      'TriggerHub is positioned as local desktop software, which keeps automation close to the apps and devices you already use.',
  },
  {
    title: 'Unify repeated routines',
    description:
      'Bring events, conditions, macros, and actions into one workflow model instead of splitting them across separate tools.',
  },
];

const featureCards = [
  {
    title: 'Trigger-based workflows',
    description:
      'The repository already contains the trigger engine and execution graph that power event-driven automations.',
    bullets: [
      'Event topic based execution',
      'Condition checks before actions run',
      'Built to coordinate repeated creator routines',
    ],
  },
  {
    title: 'Reusable macros',
    description:
      'Macro orchestration is part of the current desktop foundation, making multi-step automations easier to repeat and maintain.',
    bullets: [
      'Sequence, parallel, and conditional steps',
      'Reusable workflow building blocks',
      'Designed for recurring desktop actions',
    ],
  },
  {
    title: 'Focused desktop integrations',
    description:
      'Current repository evidence supports OBS control, Spotify actions, clip export modules, and plugin-ready extension points.',
    bullets: [
      'OBS service adapter',
      'Spotify service adapter',
      'Clip modules and plugin scaffolding',
    ],
  },
];

const workflowSteps = [
  {
    title: 'Choose the event',
    description:
      'Start with the event you want to react to in your desktop setup, then define the trigger that should launch the workflow.',
  },
  {
    title: 'Add logic and macros',
    description:
      'Use conditions and reusable macro sequences to control when an automation should continue and what should happen next.',
  },
  {
    title: 'Run the action locally',
    description:
      'Let the runtime execute the connected action on your machine so the workflow can respond without extra manual switching.',
  },
];

const trustItems = [
  {
    title: 'Desktop-first direction',
    description: 'The repository positions TriggerHub as local desktop software with a clear creator-workflow focus.',
  },
  {
    title: 'Implemented core modules',
    description: 'Trigger engine, macro system, service adapters, and plugin scaffolding are present in the current repository.',
  },
  {
    title: 'Local-first product scope',
    description: 'The product is framed as desktop software rather than a cloud dashboard, which keeps the message clear and credible.',
  },
  {
    title: 'Quality baseline in place',
    description: 'The repository includes automated tests and a production build pipeline for the website and desktop codebase.',
  },
];

const extensionCards = [
  {
    title: 'Touch-first control surfaces',
    description:
      'Project references already point to a second-display or tablet-oriented control experience. That makes touch-friendly surfaces such as soundboards or stream controls a credible extension path.',
    bullets: [
      'Secondary touch display or connected tablet operation is documented as a target direction',
      'Soundboard workflows are referenced in project reference and starter documents',
      'Fits the desktop-control positioning instead of expanding into unrelated SaaS features',
    ],
  },
  {
    title: 'Plugin-based clip workflows',
    description:
      'Because plugin scaffolding and clip export modules already exist, a future plugin layer for richer clip handling is a plausible product extension.',
    bullets: [
      'Clip export is already part of the repository scope',
      'Plugin system is implemented as an extension point',
      'Content tooling and clip enhancements are already part of the roadmap direction',
    ],
  },
  {
    title: 'AI-assisted post-production',
    description:
      'The roadmap already names AI-assisted creator workflows as a later direction. A future editor-style plugin for clip refinement, planning, and publishing can therefore be framed as a possible expansion, not as a shipping feature.',
    bullets: [
      'Positioned explicitly as a possible extension, not as current functionality',
      'Grounded in roadmap notes about AI-assisted creator workflows',
      'Keeps the website honest while still showing where the platform could grow',
    ],
  },
];

const faqItems = [
  {
    question: 'What kind of product is TriggerHub today?',
    answer:
      'The current repository supports TriggerHub as a Windows desktop automation product for creator workflows, with a public website and a documented release path.',
  },
  {
    question: 'Which integrations are supported by the current codebase?',
    answer:
      'The repository currently shows OBS and Spotify service adapters, clip modules, and plugin scaffolding. This website does not claim broader integrations beyond that evidence.',
  },
  {
    question: 'Is TriggerHub a cloud SaaS?',
    answer:
      'No. The current product framing is local desktop software that runs on your machine and coordinates actions from there.',
  },
  {
    question: 'Which platform is currently targeted?',
    answer:
      'The existing packaging and release guidance in the repository target Windows x64 desktop delivery.',
  },
];

export const WebsiteLandingPage = () => {
  useHashSectionSync();

  return (
    <MarketingShell onNavigate={navigateTo}>
      <main>
        <MarketingHero
          title="Automate repetitive creator workflows from one desktop hub."
          description="TriggerHub is a Windows desktop automation app for creators who want triggers, macros, and tool actions to work together locally. The current repository supports a focused product scope with core automation modules, OBS and Spotify adapters, plugin scaffolding, and a documented Windows release path."
          proofPoints={heroProofPoints}
          onNavigate={navigateTo}
        />

        <MarketingSection
          id="benefits"
          eyebrow="Why it matters"
          title="Less manual switching. More control during live workflows."
          description="The strongest product story in the repository is not breadth. It is the ability to reduce repeated desktop tasks and keep creator workflows in one local control layer."
        >
          <BenefitGrid items={benefits} />
        </MarketingSection>

        <MarketingSection
          id="features"
          eyebrow="Core capabilities"
          title="A focused feature set that reflects the current product scope."
          description="This page keeps the message tied to what the repository actually supports today, without stretching into roadmap claims or generic automation language."
          tone="dark"
        >
          <FeatureCardGrid items={featureCards} />
        </MarketingSection>

        <MarketingSection
          id="workflow"
          eyebrow="How it works"
          title="Build the workflow once, then let the desktop runtime carry it."
          description="TriggerHub is structured around a simple product model: react to an event, apply logic, and execute the resulting action locally."
        >
          <WorkflowSteps steps={workflowSteps} />
        </MarketingSection>

        <MarketingSection
          id="extensions"
          eyebrow="Possible extensions"
          title="The product can grow into deeper creator tooling without losing focus."
          description="These ideas are framed deliberately as possible extensions because the repository already supports the underlying direction through desktop control, plugin scaffolding, clip tooling, and roadmap notes for AI-assisted workflows."
          tone="dark"
        >
          <FeatureCardGrid items={extensionCards} />
        </MarketingSection>

        <MarketingSection
          eyebrow="Trust signals"
          title="A product message grounded in existing implementation."
          description="The website should feel credible. These points stay close to the repository evidence instead of marketing claims the current codebase cannot support."
        >
          <TrustGrid items={trustItems} />
        </MarketingSection>

        <MarketingSection
          id="faq"
          eyebrow="FAQ"
          title="Clear answers before you request access."
          description="These answers reflect the current repository state and keep the public message aligned with the actual product scope."
        >
          <FaqSection items={faqItems} />
        </MarketingSection>

        <MarketingCta
          title="Follow the product direction without promising a public download yet."
          description="The current public site should frame TriggerHub as a focused desktop product in development. The next step is protected access or a review of the repository and product scope."
          onNavigate={navigateTo}
        />
      </main>
    </MarketingShell>
  );
};

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

interface WebsiteLandingPageProps {
  onNavigate: (path: string) => void;
}
const heroProofPoints = [
  'Runs as a Windows desktop product',
  'Focused on local workflow execution',
  'Public build path via GitHub Releases',
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
    title: 'Windows release path',
    description: 'The project already documents packaged Windows delivery and a public release channel through GitHub Releases.',
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

export const WebsiteLandingPage = ({ onNavigate }: WebsiteLandingPageProps) => {
  useHashSectionSync();

  return (
    <MarketingShell onNavigate={onNavigate}>
      <main>
        <MarketingHero
          title="Automate repetitive creator workflows from one desktop hub."
          description="TriggerHub is a Windows desktop automation app for creators who want triggers, macros, and tool actions to work together locally. The current repository supports a focused product scope with core automation modules, OBS and Spotify adapters, plugin scaffolding, and a documented Windows release path."
          proofPoints={heroProofPoints}
          onNavigate={onNavigate}
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
          eyebrow="Trust signals"
          title="A product message grounded in existing implementation."
          description="The website should feel credible. These points stay close to the repository evidence instead of marketing claims the current codebase cannot support."
        >
          <TrustGrid items={trustItems} />
        </MarketingSection>

        <MarketingSection
          id="faq"
          eyebrow="FAQ"
          title="Clear answers before you download."
          description="These answers reflect the current repository state and keep the public message aligned with the actual product scope."
        >
          <FaqSection items={faqItems} />
        </MarketingSection>

        <MarketingCta
          title="Download the Windows build and evaluate the product on its current strengths."
          description="If you need a local desktop tool for trigger-based creator workflows, the next step is to review the Windows release and product repository."
        />
      </main>
    </MarketingShell>
  );
};

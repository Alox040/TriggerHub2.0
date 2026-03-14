import { AlertCircle, Bot, MicOff, MoreHorizontal, Play, Plus } from "lucide-react";
import EmptyState from "./EmptyState";

interface AutomationStep {
  id: string;
  label: string;
  icon: typeof Play;
}

interface AutomationItem {
  id: string;
  name: string;
  statusDotClassName: string;
  steps?: AutomationStep[];
  pendingLabel?: string;
  pendingDetail?: string;
}

interface AutomationPanelProps {
  automations?: AutomationItem[];
}

const DEFAULT_AUTOMATIONS: AutomationItem[] = [
  {
    id: "brb-sequence",
    name: "BRB Sequence",
    statusDotClassName: "bg-th-accent",
    steps: [
      { id: "switch-brb", label: "Switch to BRB", icon: Play },
      { id: "mute-audio", label: "Mute Audio", icon: MicOff },
    ],
  },
  {
    id: "twitch-api",
    name: "Twitch API",
    statusDotClassName: "bg-th-status-inactive",
    pendingLabel: "Awaiting Raid",
    pendingDetail: "Confetti + Sound",
  },
];

export default function AutomationPanel({ automations = DEFAULT_AUTOMATIONS }: AutomationPanelProps) {
  return (
    <div className="flex h-full w-full flex-col bg-[var(--th-bg-shell)]">
      <div className="px-5 py-6">
        <h2 className="text-sm font-semibold tracking-tight text-[var(--th-text-primary)]">Active Automations</h2>
      </div>

      <div className="px-4 flex flex-col gap-6 overflow-y-auto pb-4">
        {automations.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="No automations yet"
            description="Create an automation to orchestrate multi-step actions."
            ctaLabel="Add Automation"
          />
        ) : (
          automations.map((automation) => (
            <div key={automation.id} className="relative">
              {automation.steps?.length ? (
                <div className="absolute bottom-4 left-3.5 top-8 w-[1px] bg-[var(--th-border-subtle)]"></div>
              ) : null}

              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <div className={`z-10 h-1.5 w-1.5 rounded-full ${automation.statusDotClassName}`}></div>
                  <span className="text-[12px] font-medium text-[var(--th-text-secondary)]">{automation.name}</span>
                </div>
                {!automation.steps?.length ? (
                  <MoreHorizontal size={14} className="cursor-pointer text-[var(--th-text-muted)] transition-colors hover:text-[var(--th-text-secondary)]" />
                ) : null}
              </div>

              {automation.steps?.length ? (
                <div className="flex flex-col gap-2 pl-7">
                  {automation.steps.map((step) => {
                    const StepIcon = step.icon;

                    return (
                      <div key={step.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--th-border-subtle)] bg-[var(--th-bg-panel)] p-2.5 transition-colors hover:bg-th-overlay-subtle">
                        <StepIcon size={14} className="text-[var(--th-text-muted)]" />
                        <span className="text-[12px] text-[var(--th-text-secondary)]">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="ml-7 flex items-start gap-2.5 rounded-lg border border-[var(--th-border-subtle)] bg-[var(--th-bg-main)] p-3 opacity-80">
                  <AlertCircle size={14} className="mt-0.5 shrink-0 text-[var(--th-text-muted)]" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] text-[var(--th-text-secondary)]">{automation.pendingLabel}</span>
                    <span className="text-[11px] text-[var(--th-text-muted)]">{automation.pendingDetail}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        <button className="mx-2 mt-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--th-border-weak)] bg-transparent p-2.5 text-[12px] font-medium text-[var(--th-text-muted)] transition-colors hover:border-white/20 hover:text-[var(--th-text-secondary)]">
          <Plus size={14} />
          Add Trigger
        </button>
      </div>
    </div>
  );
}

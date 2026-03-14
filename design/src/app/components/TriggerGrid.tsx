import { useState } from "react";
import { Volume2, Zap } from "lucide-react";
import { iconMap } from "../data/mock";
import { MOCK_TRIGGERS } from "../data/triggerData";
import type { Trigger, ToggleFn } from "../data/triggerData";
import ScenesSection from "./sections/ScenesSection";
import AudioMixerSection from "./sections/AudioMixerSection";
import QuickActionsSection from "./sections/QuickActionsSection";
import EmptyState from "./EmptyState";

export type LayoutType = "grid" | "list";

interface TriggerGridProps {
  layout: LayoutType;
  triggers?: Trigger[];
}

export default function TriggerGrid({ layout, triggers: initialTriggers = MOCK_TRIGGERS }: TriggerGridProps) {
  const [triggers, setTriggers] = useState<Trigger[]>(initialTriggers);

  const onToggle: ToggleFn = (id) =>
    setTriggers((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t)));

  const scenes  = triggers.filter((t) => t.category === "Scene");
  const tracks  = triggers.filter((t) => t.category === "Audio");
  const actions = triggers.filter((t) => t.category !== "Scene" && t.category !== "Audio");

  if (layout === "list") {
    return (
      <div className="flex flex-col gap-2 max-w-4xl mx-auto">
        {triggers.map((trigger) => {
          const Icon = iconMap[trigger.icon];
          const activeStyle = trigger.isActive
            ? "border-white/20 bg-white/10 text-[var(--th-text-primary)]"
            : "border-[var(--th-border-subtle)] bg-[var(--th-bg-panel)] text-[var(--th-text-secondary)] hover:bg-th-bg-hover";
          return (
            <button
              key={trigger.id}
              onClick={() => onToggle(trigger.id)}
              className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${activeStyle}`}
            >
              <div className="flex items-center gap-4">
                {Icon && <Icon size={18} />}
                <span className="font-medium text-sm">{trigger.name}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 max-w-[1200px] mx-auto w-full">
      {scenes.length === 0 ? (
        <section>
          <div className="mb-4 ml-1 flex items-baseline gap-3">
            <h2 className="text-[13px] font-semibold text-[var(--th-text-secondary)]">Scenes</h2>
            <span className="text-[11px] text-[var(--th-text-muted)]">Live Video Switching</span>
          </div>

          <EmptyState
            title="No scenes yet"
            description="Create a trigger to start building your scene switcher."
            ctaLabel="Add Trigger"
            icon={Zap}
            className="min-h-[260px]"
          />
        </section>
      ) : (
        <ScenesSection scenes={scenes} onToggle={onToggle} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {tracks.length === 0 ? (
          <section className="col-span-1 lg:col-span-6">
            <h2 className="mb-4 ml-1 text-[13px] font-semibold text-[var(--th-text-secondary)]">Audio Mixer</h2>

            <EmptyState
              title="No audio triggers"
              description="Add a trigger to control audio levels and mute states."
              ctaLabel="Add Trigger"
              icon={Volume2}
            />
          </section>
        ) : (
          <AudioMixerSection tracks={tracks} onToggle={onToggle} />
        )}

        {actions.length === 0 ? (
          <section className="col-span-1 lg:col-span-6">
            <h2 className="mb-4 ml-1 text-[13px] font-semibold text-[var(--th-text-secondary)]">Quick Actions</h2>

            <EmptyState
              title="No quick actions"
              description="Add a trigger to populate this action launcher."
              ctaLabel="Add Trigger"
              icon={Zap}
            />
          </section>
        ) : (
          <QuickActionsSection actions={actions} onToggle={onToggle} />
        )}
      </div>
    </div>
  );
}

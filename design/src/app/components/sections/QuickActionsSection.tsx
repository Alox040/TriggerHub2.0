import React from "react";
import { Plus } from "lucide-react";
import { iconMap } from "../../data/mock";
import type { Trigger, ToggleFn } from "../../data/triggerData";

interface QuickActionsSectionProps {
  actions: Trigger[];
  onToggle: ToggleFn;
}

function isDanger(trigger: Trigger): boolean {
  return trigger.category === "System" && trigger.name.includes("End");
}

function EmptyQuickActions() {
  return (
    <button
      disabled
      title="Add action"
      className="flex items-center justify-center w-[64px] h-[64px] rounded-[16px] border border-dashed border-[var(--th-border-subtle)] text-[var(--th-text-muted)]"
    >
      <Plus size={20} />
    </button>
  );
}

export default function QuickActionsSection({ actions, onToggle }: QuickActionsSectionProps) {
  return (
    <section className="col-span-1 lg:col-span-6">
      <h2 className="mb-4 ml-1 text-[13px] font-semibold text-[var(--th-text-secondary)]">Quick Actions</h2>

      <div className="flex flex-wrap gap-3">
        {actions.length === 0 ? (
          <EmptyQuickActions />
        ) : (
          actions.map((action) => {
            const Icon = iconMap[action.icon];
            const danger = isDanger(action);

            const activeStyle = action.isActive
              ? "bg-zinc-200 text-black border-transparent"
              : danger
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/30"
                : "bg-[var(--th-bg-panel)] border-[var(--th-border-subtle)] text-[var(--th-text-secondary)] hover:bg-th-bg-hover hover:border-[var(--th-border-weak)] hover:text-[var(--th-text-primary)]";

            return (
              <button
                key={action.id}
                onClick={() => onToggle(action.id)}
                title={action.name}
                className={`group relative flex items-center justify-center w-[64px] h-[64px] rounded-[16px] border transition-all duration-200 active:scale-95 ${activeStyle} ${danger ? "ml-auto" : ""}`}
              >
                {Icon && <Icon size={22} strokeWidth={2} />}
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

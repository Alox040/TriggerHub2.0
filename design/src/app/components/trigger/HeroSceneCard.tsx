import React from "react";
import { iconMap } from "../../data/mock";
import type { Trigger, ToggleFn } from "../../data/triggerData";

interface HeroSceneCardProps {
  scene: Trigger;
  onToggle: ToggleFn;
}

export default function HeroSceneCard({ scene, onToggle }: HeroSceneCardProps) {
  const Icon = iconMap[scene.icon];

  return (
    <button
      onClick={() => onToggle(scene.id)}
      className={`group relative col-span-1 flex min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl border text-left transition-all duration-300 lg:col-span-8 ${
        scene.isActive
          ? "border-sky-500/50 shadow-[0_0_30px_rgba(14,165,233,0.1)]"
          : "border-[var(--th-border-weak)] hover:border-white/20 hover:bg-[var(--th-bg-panel)]"
      }`}
    >
      {/* Abstract background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[var(--th-bg-shell)]">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-zinc-800/40 to-transparent opacity-30 mix-blend-overlay" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 p-6 flex justify-between items-end w-full">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {scene.isActive && <div className="w-2 h-2 rounded-full bg-sky-500" />}
            <span className={`text-[10px] font-bold uppercase tracking-widest ${scene.isActive ? "text-sky-400" : "text-[var(--th-text-muted)]"}`}>
              {scene.isActive ? "Active Scene" : "Preview"}
            </span>
          </div>
          <h3 className="text-2xl font-semibold text-[var(--th-text-primary)]">{scene.name}</h3>
        </div>

        <div className={`rounded-xl border p-3 transition-colors ${
          scene.isActive
            ? "border-sky-500/20 bg-sky-500/10 text-sky-400"
            : "border-[var(--th-border-subtle)] bg-[var(--th-bg-panel)] text-[var(--th-text-secondary)] group-hover:text-[var(--th-text-primary)]"
        }`}>
          {Icon && React.createElement(Icon, { size: 24, strokeWidth: 2 })}
        </div>
      </div>
    </button>
  );
}

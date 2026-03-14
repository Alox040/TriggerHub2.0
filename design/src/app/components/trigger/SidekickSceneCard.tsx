import React from "react";
import { iconMap } from "../../data/mock";
import type { Trigger, ToggleFn } from "../../data/triggerData";

interface SidekickSceneCardProps {
  scene: Trigger;
  onToggle: ToggleFn;
}

export default function SidekickSceneCard({ scene, onToggle }: SidekickSceneCardProps) {
  const Icon = iconMap[scene.icon];

  return (
    <button
      key={scene.id}
      onClick={() => onToggle(scene.id)}
      className={`flex-1 flex items-center p-4 rounded-2xl border transition-colors duration-200 ${
        scene.isActive
          ? "border-white/20 bg-white/5 text-[var(--th-text-primary)]"
          : "border-[var(--th-border-subtle)] bg-[var(--th-bg-panel)] text-[var(--th-text-secondary)] hover:border-[var(--th-border-weak)] hover:bg-th-bg-hover"
      }`}
    >
      <div className={`p-2.5 rounded-lg mr-4 ${scene.isActive ? "bg-white/10" : "bg-black/30"}`}>
        {Icon && <Icon size={18} />}
      </div>
      <span className="font-medium text-[13px]">{scene.name}</span>
    </button>
  );
}

import React from "react";
import type { Trigger, ToggleFn } from "../../data/triggerData";
import HeroSceneCard from "../trigger/HeroSceneCard";
import SidekickSceneCard from "../trigger/SidekickSceneCard";

interface ScenesSectionProps {
  scenes: Trigger[];
  onToggle: ToggleFn;
}

function EmptyScenes() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="col-span-1 lg:col-span-12 min-h-[260px] rounded-2xl border border-dashed border-[var(--th-border-subtle)] flex items-center justify-center">
        <span className="text-[13px] text-[var(--th-text-muted)]">No scenes configured</span>
      </div>
    </div>
  );
}

export default function ScenesSection({ scenes, onToggle }: ScenesSectionProps) {
  if (scenes.length === 0) return <EmptyScenes />;

  const [heroScene, ...sidekickScenes] = scenes;

  return (
    <section>
      <div className="flex items-baseline gap-3 mb-4 ml-1">
        <h2 className="text-[13px] font-semibold text-[var(--th-text-secondary)]">Scenes</h2>
        <span className="text-[11px] text-[var(--th-text-muted)]">Live Video Switching</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <HeroSceneCard scene={heroScene} onToggle={onToggle} />

        <div className="col-span-1 lg:col-span-4 flex flex-col gap-3">
          {sidekickScenes.map((scene) => (
            <SidekickSceneCard key={scene.id} scene={scene} onToggle={onToggle} />
          ))}
        </div>
      </div>
    </section>
  );
}

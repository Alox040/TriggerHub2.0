import React from "react";
import { iconMap } from "../../data/mock";
import type { Trigger, ToggleFn } from "../../data/triggerData";

interface AudioMixerSectionProps {
  tracks: Trigger[];
  onToggle: ToggleFn;
}

/** Deterministic fake level – no random re-renders. */
function getAudioLevel(id: string): number {
  const hash = id.charCodeAt(0);
  return Math.min(Math.max(40 + (hash % 50), 30), 90);
}

function EmptyAudioMixer() {
  return (
    <div className="flex items-center justify-between rounded-xl border border-dashed border-[var(--th-border-subtle)] bg-[var(--th-bg-panel)] p-3">
      <span className="text-[12px] text-[var(--th-text-muted)]">No audio tracks configured</span>
      <span className="font-mono text-[11px] text-[var(--th-text-muted)]">–</span>
    </div>
  );
}

export default function AudioMixerSection({ tracks, onToggle }: AudioMixerSectionProps) {
  return (
    <section className="col-span-1 lg:col-span-6">
      <h2 className="mb-4 ml-1 text-[13px] font-semibold text-[var(--th-text-secondary)]">Audio Mixer</h2>

      <div className="flex flex-col gap-2">
        {tracks.length === 0 ? (
          <EmptyAudioMixer />
        ) : (
          tracks.map((track) => {
            const Icon = iconMap[track.icon];
            const level = getAudioLevel(track.id);

            return (
              <div
                key={track.id}
                className="group relative flex items-center justify-between rounded-xl border border-[var(--th-border-subtle)] bg-[var(--th-bg-panel)] p-3 transition-colors hover:border-[var(--th-border-weak)]"
              >
                <div className="flex items-center gap-3 w-1/3">
                  <button
                    onClick={() => onToggle(track.id)}
                    className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                      track.isActive
                        ? "bg-zinc-200 text-black"
                        : "bg-th-bg-active text-[var(--th-text-secondary)] hover:text-[var(--th-text-primary)]"
                    }`}
                  >
                    {Icon && <Icon size={14} />}
                  </button>
                  <span className="truncate text-[12px] font-medium text-[var(--th-text-secondary)]">
                    {track.name}
                  </span>
                </div>

                <div className="flex-1 flex items-center px-4">
                  <div className="relative h-1.5 w-full overflow-hidden rounded-full border border-[var(--th-border-subtle)] bg-black/50">
                    <div
                      className={`absolute left-0 top-0 bottom-0 transition-all duration-300 ${track.isActive ? "bg-zinc-300" : "bg-zinc-700"}`}
                      style={{ width: track.isActive ? `${level}%` : "5%" }}
                    />
                  </div>
                </div>

                <div className="w-12 text-right font-mono text-[11px] text-[var(--th-text-muted)]">
                  {track.isActive ? `-${Math.floor(100 - level)}dB` : "Muted"}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

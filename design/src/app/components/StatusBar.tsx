import { Wifi, Twitch, ChevronUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function StatusBar() {
  return (
    <div className="border-t border-[var(--th-border-subtle)] bg-[var(--th-bg-shell)] px-6 py-4">
      <div className="mx-auto flex w-fit items-center gap-5 rounded-full border border-[var(--th-border-subtle)] bg-[color:var(--th-bg-panel)]/90 px-5 py-2 text-[11px] font-medium text-[var(--th-text-secondary)] shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-md">

        {/* Live Timer */}
        <div className="flex items-center gap-2 border-r border-[var(--th-border-weak)] pr-3 text-[var(--th-text-primary)]">
          <div className="w-1.5 h-1.5 rounded-full bg-th-status-live"></div>
          <span className="font-mono tracking-wide">02:14:35</span>
        </div>

        {/* Mini Stats */}
        <div className="flex items-center gap-4 cursor-default">
          <span className="flex items-center gap-1.5">CPU: 14%</span>
          <span className="flex items-center gap-1.5">FPS: 60</span>
        </div>

        {/* Connections */}
        <div className="flex items-center gap-2.5 border-l border-[var(--th-border-weak)] pl-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-6 h-6 rounded-full hover:bg-th-overlay-weak flex items-center justify-center text-th-service-obs transition-colors cursor-default">
                <Wifi size={12} />
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>OBS Connected</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-6 h-6 rounded-full hover:bg-th-overlay-weak flex items-center justify-center text-th-service-twitch transition-colors cursor-default">
                <Twitch size={12} />
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>Twitch — Excellent</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-[var(--th-text-muted)] transition-colors hover:bg-th-overlay-mid hover:text-[var(--th-text-secondary)]">
                <ChevronUp size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>Expand Status</TooltipContent>
          </Tooltip>
        </div>

      </div>
    </div>
  );
}

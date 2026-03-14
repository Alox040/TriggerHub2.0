import { LayoutGrid, List, Maximize, Minimize } from "lucide-react";
import { LayoutType } from "./TriggerGrid";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface Props {
  layout: LayoutType;
  setLayout: (l: LayoutType) => void;
  isFocusMode: boolean;
  setIsFocusMode: (f: boolean) => void;
}

export default function DashboardHeader({ layout, setLayout, isFocusMode, setIsFocusMode }: Props) {
  return (
    <header className="z-20 flex h-[72px] shrink-0 items-center justify-between border-b border-[var(--th-border-subtle)] bg-[var(--th-bg-shell)] px-6">
      {/* Clean, professional typography. No overly aggressive gradients. */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold tracking-tight text-[var(--th-text-primary)]">Main Dashboard</h1>
        
        <div className="h-4 w-px bg-white/10 mx-2"></div>
        
        <div className="flex items-center gap-2 bg-th-accent/10 border border-th-accent/20 px-2.5 py-1 rounded-md">
          <div className="w-1.5 h-1.5 rounded-full bg-th-accent animate-pulse"></div>
          <span className="text-[11px] font-bold tracking-widest text-th-accent uppercase">Stream Live</span>
        </div>
      </div>
      
      <TooltipProvider>
        <div className="flex items-center gap-4">
        {/* Subtle, highly functional toggles */}
        <div className="flex items-center rounded-lg border border-[var(--th-border-subtle)] bg-[var(--th-bg-panel)] p-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setLayout("grid")}
                className={`rounded-md p-1.5 transition-colors ${layout === "grid" ? "bg-th-bg-active text-[var(--th-text-primary)] shadow-sm" : "text-[var(--th-text-muted)] hover:bg-th-overlay-subtle hover:text-[var(--th-text-secondary)]"}`}
              >
                <LayoutGrid size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>Grid View</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setLayout("list")}
                className={`rounded-md p-1.5 transition-colors ${layout === "list" ? "bg-th-bg-active text-[var(--th-text-primary)] shadow-sm" : "text-[var(--th-text-muted)] hover:bg-th-overlay-subtle hover:text-[var(--th-text-secondary)]"}`}
              >
                <List size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent sideOffset={6}>List View</TooltipContent>
          </Tooltip>
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors ${
                isFocusMode
                  ? "border-transparent bg-th-btn-inverse-bg font-medium text-th-btn-inverse-fg"
                  : "border-[var(--th-border-weak)] bg-transparent text-[var(--th-text-secondary)] hover:bg-th-overlay-weak hover:text-[var(--th-text-primary)]"
              }`}
            >
              {isFocusMode ? <Minimize size={14} /> : <Maximize size={14} />}
              <span className="text-[12px] font-medium">{isFocusMode ? "Exit Focus" : "Focus"}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            {isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
          </TooltipContent>
        </Tooltip>
        </div>
      </TooltipProvider>
    </header>
  );
}

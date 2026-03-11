import { LayoutGrid, Grid3X3, List, Maximize, Minimize, Activity } from "lucide-react";
import { LayoutType } from "./TriggerGrid";

interface Props {
  layout: LayoutType;
  setLayout: (l: LayoutType) => void;
  isFocusMode: boolean;
  setIsFocusMode: (f: boolean) => void;
}

export default function DashboardHeader({ layout, setLayout, isFocusMode, setIsFocusMode }: Props) {
  return (
    <header className="h-[72px] bg-[#0E0E11] shrink-0 z-20 flex items-center justify-between px-6 border-b border-white/[0.04]">
      {/* Clean, professional typography. No overly aggressive gradients. */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">Main Dashboard</h1>
        
        <div className="h-4 w-px bg-white/10 mx-2"></div>
        
        <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-md">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></div>
          <span className="text-[11px] font-bold tracking-widest text-teal-400 uppercase">Stream Live</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Subtle, highly functional toggles */}
        <div className="flex items-center bg-[#18181b] rounded-lg p-0.5 border border-white/[0.04]">
          <button
            onClick={() => setLayout("grid")}
            className={`p-1.5 rounded-md transition-colors ${layout === "grid" ? "bg-[#27272a] text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"}`}
            title="Studio Layout"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setLayout("list")}
            className={`p-1.5 rounded-md transition-colors ${layout === "list" ? "bg-[#27272a] text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"}`}
            title="List View"
          >
            <List size={16} />
          </button>
        </div>
        
        <button
          onClick={() => setIsFocusMode(!isFocusMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
            isFocusMode 
              ? "bg-zinc-100 text-black border-transparent font-medium" 
              : "bg-transparent border-white/10 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
          }`}
        >
          {isFocusMode ? <Minimize size={14} /> : <Maximize size={14} />}
          <span className="text-[12px] font-medium">{isFocusMode ? "Exit Focus" : "Focus"}</span>
        </button>
      </div>
    </header>
  );
}
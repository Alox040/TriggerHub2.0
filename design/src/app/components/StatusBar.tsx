import { Radio, Wifi, Twitch, Youtube, ChevronUp } from "lucide-react";

export default function StatusBar() {
  return (
    // Changed from fixed to absolute to respect the main container boundaries.
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-5 px-5 py-2 bg-[#18181b]/90 backdrop-blur-md border border-white/[0.06] rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.4)] text-[11px] font-medium text-zinc-400">
        
        {/* Live Timer */}
        <div className="flex items-center gap-2 text-zinc-200 pr-3 border-r border-white/10">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
          <span className="font-mono tracking-wide">02:14:35</span>
        </div>
        
        {/* Mini Stats */}
        <div className="flex items-center gap-4 cursor-default">
          <span className="flex items-center gap-1.5">CPU: 14%</span>
          <span className="flex items-center gap-1.5">FPS: 60</span>
        </div>

        {/* Connections */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
          <div className="w-6 h-6 rounded-full hover:bg-white/5 flex items-center justify-center text-teal-400 transition-colors" title="OBS Connected">
            <Wifi size={12} />
          </div>
          <div className="w-6 h-6 rounded-full hover:bg-white/5 flex items-center justify-center text-purple-400 transition-colors" title="Twitch Excellent">
            <Twitch size={12} />
          </div>
          
          <button className="w-6 h-6 ml-1 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
            <ChevronUp size={14} />
          </button>
        </div>
        
      </div>
    </div>
  );
}
import { MoreHorizontal, Play, MicOff, AlertCircle, Plus } from "lucide-react";

export default function AutomationPanel() {
  return (
    <div className="flex flex-col h-full bg-[#0E0E11] w-full">
      <div className="px-5 py-6">
        <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">Active Automations</h2>
      </div>

      <div className="px-4 flex flex-col gap-6 overflow-y-auto pb-32">
        
        {/* Workflow 1 */}
        <div className="relative">
          <div className="absolute left-3.5 top-8 bottom-4 w-[1px] bg-white/[0.04]"></div>
          
          <div className="flex items-center gap-2.5 mb-3 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 z-10"></div>
            <span className="text-[12px] font-medium text-zinc-400">BRB Sequence</span>
          </div>
          
          <div className="pl-7 flex flex-col gap-2">
            <div className="bg-[#18181b] border border-white/[0.02] p-2.5 rounded-lg flex items-center gap-3 hover:bg-white/[0.02] transition-colors cursor-pointer">
              <Play size={14} className="text-zinc-500" />
              <span className="text-[12px] text-zinc-300">Switch to BRB</span>
            </div>
            
            <div className="bg-[#18181b] border border-white/[0.02] p-2.5 rounded-lg flex items-center gap-3 hover:bg-white/[0.02] transition-colors cursor-pointer">
              <MicOff size={14} className="text-zinc-500" />
              <span className="text-[12px] text-zinc-300">Mute Audio</span>
            </div>
          </div>
        </div>

        {/* Workflow 2 */}
        <div className="relative">
           <div className="flex items-center justify-between px-1 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 z-10"></div>
              <span className="text-[12px] font-medium text-zinc-400">Twitch API</span>
            </div>
            <MoreHorizontal size={14} className="text-zinc-600 hover:text-zinc-300 cursor-pointer transition-colors" />
          </div>
          
          <div className="ml-7 bg-[#121214] border border-white/[0.04] p-3 rounded-lg flex items-start gap-2.5 opacity-80">
             <AlertCircle size={14} className="text-zinc-500 mt-0.5 shrink-0" />
             <div className="flex flex-col gap-0.5">
               <span className="text-[12px] text-zinc-300">Awaiting Raid</span>
               <span className="text-[11px] text-zinc-500">Confetti + Sound</span>
             </div>
          </div>
        </div>
        
        <button className="mx-2 mt-2 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-transparent text-zinc-500 text-[12px] font-medium border border-dashed border-white/10 hover:border-white/20 hover:text-zinc-300 transition-colors">
          <Plus size={14} />
          Add Trigger
        </button>
      </div>
    </div>
  );
}
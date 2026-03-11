import { LayoutDashboard, MonitorPlay, Layers, Zap, Boxes, Settings } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export default function Sidebar() {
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, active: true },
    { name: "Scenes & Sources", icon: MonitorPlay, active: false },
    { name: "Quick Triggers", icon: Zap, active: false },
    { name: "Automations", icon: Layers, active: false },
  ];
  
  const bottomItems = [
    { name: "Integrations", icon: Boxes, active: false },
    { name: "Settings", icon: Settings, active: false },
  ];

  return (
    <div className="w-[240px] bg-[#0E0E11] flex flex-col h-full shrink-0 relative z-30 border-r border-white/[0.04]">
      
      {/* Refined Workspace Selector - Elegant and less "gamery" */}
      <div className="p-4 flex items-center justify-between group cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-[#18181b]">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" 
              alt="Alex Streams" 
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-medium text-zinc-200">Alex Streams</span>
            <span className="text-[11px] text-zinc-500">Free Plan</span>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 mb-2">
        <div className="text-[11px] font-semibold text-zinc-500">Menu</div>
      </div>
      
      <nav className="flex-1 px-2 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <button
            key={item.name}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full text-left relative ${
              item.active 
                ? "bg-[#18181b] text-zinc-100 border border-white/[0.04]" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02] border border-transparent"
            }`}
          >
            <item.icon size={16} className={item.active ? "text-zinc-200" : "text-zinc-500"} />
            <span className="text-[13px] font-medium">{item.name}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-2 flex flex-col gap-0.5 border-t border-white/[0.04]">
        {bottomItems.map((item) => (
          <button
            key={item.name}
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full text-left text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
          >
            <item.icon size={16} className="text-zinc-500" />
            <span className="text-[13px] font-medium">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
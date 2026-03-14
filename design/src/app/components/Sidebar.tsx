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
    <div className="w-[240px] bg-th-bg-shell flex flex-col h-full shrink-0 relative z-30 border-r border-th-border-subtle">

      {/* Refined Workspace Selector - Elegant and less "gamery" */}
      <div className="p-4 flex items-center justify-between group cursor-pointer hover:bg-th-overlay-subtle transition-colors border-b border-th-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-th-border-weak bg-th-bg-panel">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64"
              alt="Alex Streams"
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-medium text-th-text-primary">Alex Streams</span>
            <span className="text-[11px] text-th-text-muted">Free Plan</span>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6 mb-2">
        <div className="text-[11px] font-semibold text-th-text-muted">Menu</div>
      </div>

      <nav className="flex-1 px-2 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <button
            key={item.name}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full text-left relative ${
              item.active
                ? "bg-th-bg-panel text-th-text-primary border border-th-border-subtle"
                : "text-th-text-secondary hover:text-th-text-primary hover:bg-th-overlay-subtle border border-transparent"
            }`}
          >
            <item.icon size={16} className={item.active ? "text-th-text-primary" : "text-th-text-muted"} />
            <span className="text-[13px] font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-2 flex flex-col gap-0.5 border-t border-th-border-subtle">
        {bottomItems.map((item) => (
          <button
            key={item.name}
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full text-left text-th-text-secondary hover:text-th-text-primary hover:bg-th-overlay-subtle"
          >
            <item.icon size={16} className="text-th-text-muted" />
            <span className="text-[13px] font-medium">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
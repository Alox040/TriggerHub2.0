import React, { useState } from "react";
import { MOCK_TRIGGERS, iconMap, colorStyles, hoverStyles } from "../data/mock";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export type LayoutType = "grid" | "compact" | "list";

interface Props {
  layout: LayoutType;
}

export default function TriggerGrid({ layout }: Props) {
  const [triggers, setTriggers] = useState(MOCK_TRIGGERS);

  const toggleTrigger = (id: string) => {
    setTriggers(triggers.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
  };

  const scenes = triggers.filter(t => t.category === "Scene");
  const audio = triggers.filter(t => t.category === "Audio");
  const others = triggers.filter(t => !["Scene", "Audio"].includes(t.category));

  // Determine an elegant fake audio level based on ID string length or some other static calculation to look real but not be pure random on re-render.
  const getAudioLevel = (id: string) => {
    const hash = id.charCodeAt(0);
    return Math.min(Math.max(40 + (hash % 50), 30), 90);
  };

  if (layout === "list") {
    return (
      <div className="flex flex-col gap-2 max-w-4xl mx-auto pb-32">
        {triggers.map(trigger => {
          const Icon = iconMap[trigger.icon];
          const activeStyle = trigger.isActive ? "bg-white/10 text-white border-white/20" : "bg-[#18181b] text-zinc-400 hover:bg-[#222225] border-white/5";
          return (
            <button key={trigger.id} onClick={() => toggleTrigger(trigger.id)} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${activeStyle}`}>
              <div className="flex items-center gap-4">
                 <Icon size={18} />
                 <span className="font-medium text-sm">{trigger.name}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  const [heroScene, ...sidekickScenes] = scenes;

  return (
    <div className="flex flex-col gap-10 pb-32 max-w-[1200px] mx-auto w-full">
      
      {/* SCENES SECTION */}
      <section>
        <div className="flex items-baseline gap-3 mb-4 ml-1">
          <h2 className="text-[13px] font-semibold text-zinc-300">Scenes</h2>
          <span className="text-[11px] text-zinc-500">Live Video Switching</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Hero Scene */}
          <button
            onClick={() => toggleTrigger(heroScene.id)}
            className={`group col-span-1 lg:col-span-8 relative flex flex-col justify-end text-left rounded-2xl border overflow-hidden min-h-[260px] transition-all duration-300 ${heroScene.isActive ? "border-teal-500/50 shadow-[0_0_30px_rgba(20,184,166,0.1)]" : "border-white/10 hover:border-white/20 hover:bg-[#18181b]"}`}
          >
            {/* Elegant abstract background instead of generic unsplash */}
            <div className="absolute inset-0 bg-[#0E0E11] z-0 overflow-hidden">
               <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-zinc-800/40 to-transparent opacity-30 mix-blend-overlay"></div>
               {/* Minimal grid pattern to simulate software canvas */}
               <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            </div>
            
            <div className="relative z-10 p-6 flex justify-between items-end w-full">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {heroScene.isActive && <div className="w-2 h-2 rounded-full bg-teal-500"></div>}
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${heroScene.isActive ? "text-teal-400" : "text-zinc-500"}`}>{heroScene.isActive ? "Active Scene" : "Preview"}</span>
                </div>
                <h3 className="font-semibold text-2xl text-zinc-100">{heroScene.name}</h3>
              </div>
              
              <div className={`p-3 rounded-xl border transition-colors ${heroScene.isActive ? "bg-teal-500/10 border-teal-500/20 text-teal-400" : "bg-[#18181b] border-white/5 text-zinc-400 group-hover:text-zinc-200"}`}>
                {iconMap[heroScene.icon] && React.createElement(iconMap[heroScene.icon], { size: 24, strokeWidth: 2 })}
              </div>
            </div>
          </button>

          {/* Sidekick Scenes */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-3">
            {sidekickScenes.map((trigger) => {
              const Icon = iconMap[trigger.icon];
              return (
                <button
                  key={trigger.id}
                  onClick={() => toggleTrigger(trigger.id)}
                  className={`flex-1 flex items-center p-4 rounded-2xl border transition-colors duration-200 ${
                    trigger.isActive 
                      ? "bg-white/5 border-white/20 text-zinc-100" 
                      : "bg-[#18181b] border-white/5 text-zinc-400 hover:bg-[#222225] hover:border-white/10"
                  }`}
                >
                  <div className={`p-2.5 rounded-lg mr-4 ${trigger.isActive ? "bg-white/10" : "bg-black/30"}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-[13px]">{trigger.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* AUDIO SECTION */}
        <section className="col-span-1 lg:col-span-6">
           <h2 className="text-[13px] font-semibold text-zinc-300 mb-4 ml-1">Audio Mixer</h2>
          <div className="flex flex-col gap-2">
            {audio.map((trigger) => {
              const Icon = iconMap[trigger.icon];
              const level = getAudioLevel(trigger.id);
              
              return (
                <div key={trigger.id} className="group relative flex items-center justify-between p-3 rounded-xl bg-[#18181b] border border-white/[0.04] hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3 w-1/3">
                    <button 
                      onClick={() => toggleTrigger(trigger.id)}
                      className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${trigger.isActive ? "bg-zinc-200 text-black" : "bg-[#27272a] text-zinc-400 hover:text-zinc-200"}`}
                    >
                      <Icon size={14} />
                    </button>
                    <span className="text-[12px] font-medium text-zinc-300 truncate">{trigger.name}</span>
                  </div>
                  
                  {/* Organic Audio Slider */}
                  <div className="flex-1 flex items-center px-4">
                    <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden relative border border-white/5">
                      <div 
                        className={`absolute left-0 top-0 bottom-0 transition-all duration-300 ${trigger.isActive ? "bg-zinc-300" : "bg-zinc-700"}`} 
                        style={{ width: trigger.isActive ? `${level}%` : '5%' }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="w-12 text-right text-[11px] font-mono text-zinc-500">
                    {trigger.isActive ? `-${Math.floor(100 - level)}dB` : "Muted"}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="col-span-1 lg:col-span-6">
          <h2 className="text-[13px] font-semibold text-zinc-300 mb-4 ml-1">Quick Actions</h2>
          
          <div className="flex flex-wrap gap-3">
            {others.map((trigger) => {
              const Icon = iconMap[trigger.icon];
              const isDanger = trigger.category === "System" && trigger.name.includes("End");
              
              // Refined, human-like danger button (less Dribbble-gradient, more functional)
              const activeStyle = trigger.isActive 
                ? "bg-zinc-200 text-black border-transparent" 
                : isDanger 
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/30" 
                  : "bg-[#18181b] border-white/[0.04] text-zinc-400 hover:bg-[#222225] hover:border-white/10 hover:text-zinc-200";
              
              return (
                <button
                  key={trigger.id}
                  onClick={() => toggleTrigger(trigger.id)}
                  title={trigger.name}
                  className={`group relative flex items-center justify-center w-[64px] h-[64px] rounded-[16px] border transition-all duration-200 ${activeStyle} ${isDanger ? "ml-auto" : ""} active:scale-95`}
                >
                  <Icon size={22} strokeWidth={2} />
                </button>
              );
            })}
          </div>
        </section>
      </div>
      
    </div>
  );
}
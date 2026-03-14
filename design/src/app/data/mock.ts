import {
  Play, MessageSquare, Monitor, Coffee, MicOff, Music,
  Sparkles, Zap, Camera, AlertTriangle, Target, Power, Tv, MonitorPlay,
} from "lucide-react";
import React from "react";

export const iconMap: Record<string, React.ElementType> = {
  Play, MessageSquare, Monitor, Coffee, MicOff, Music,
  Sparkles, Zap, Camera, AlertTriangle, Target, Power, Tv, MonitorPlay,
};

export const colorStyles = {
  teal:   "ring-teal-500/50 bg-teal-500/15 shadow-[0_0_15px_rgba(20,184,166,0.15)] text-teal-400",
  orange: "ring-orange-500/50 bg-orange-500/15 shadow-[0_0_15px_rgba(249,115,22,0.15)] text-orange-400",
  blue:   "ring-blue-500/50 bg-blue-500/15 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-blue-400",
  purple: "ring-purple-500/50 bg-purple-500/15 shadow-[0_0_15px_rgba(168,85,247,0.15)] text-purple-400",
  yellow: "ring-yellow-500/50 bg-yellow-500/15 shadow-[0_0_15px_rgba(234,179,8,0.15)] text-yellow-400",
  slate:  "ring-slate-500/50 bg-slate-500/15 shadow-[0_0_15px_rgba(100,116,139,0.15)] text-slate-300",
  red:    "ring-red-500/50 bg-red-500/15 shadow-[0_0_15px_rgba(239,68,68,0.15)] text-red-400",
  green:  "ring-green-500/50 bg-green-500/15 shadow-[0_0_15px_rgba(34,197,94,0.15)] text-green-400",
  rose:   "ring-rose-500/50 bg-rose-500/15 shadow-[0_0_15px_rgba(244,63,94,0.15)] text-rose-400",
};

export const hoverStyles = {
  teal:   "hover:border-teal-500/50 hover:bg-teal-500/10",
  orange: "hover:border-orange-500/50 hover:bg-orange-500/10",
  blue:   "hover:border-blue-500/50 hover:bg-blue-500/10",
  purple: "hover:border-purple-500/50 hover:bg-purple-500/10",
  yellow: "hover:border-yellow-500/50 hover:bg-yellow-500/10",
  slate:  "hover:border-slate-500/50 hover:bg-slate-500/10",
  red:    "hover:border-red-500/50 hover:bg-red-500/10",
  green:  "hover:border-green-500/50 hover:bg-green-500/10",
  rose:   "hover:border-rose-500/50 hover:bg-rose-500/10",
};

export type TriggerCategory = "Scene" | "Audio" | "Overlay" | "Alert" | "Video" | "System";

export interface Trigger {
  id: string;
  name: string;
  icon: string;
  category: TriggerCategory;
  isActive: boolean;
}

export type ToggleFn = (id: string) => void;

export const MOCK_TRIGGERS: Trigger[] = [
  { id: "1", name: "Starting Soon",  icon: "Play",          category: "Scene",   isActive: true  },
  { id: "2", name: "Just Chatting",  icon: "MessageSquare", category: "Scene",   isActive: false },
  { id: "3", name: "Gameplay Main",  icon: "Monitor",       category: "Scene",   isActive: false },
  { id: "4", name: "BRB",            icon: "Coffee",        category: "Scene",   isActive: false },
  { id: "5", name: "Mute Mic",       icon: "MicOff",        category: "Audio",   isActive: false },
  { id: "6", name: "Play BGM",       icon: "Music",         category: "Audio",   isActive: true  },
  { id: "7", name: "Confetti",       icon: "Sparkles",      category: "Overlay", isActive: false },
  { id: "8", name: "Raid Alert",     icon: "Zap",           category: "Alert",   isActive: false },
  { id: "9", name: "Camera Zoom",    icon: "Camera",        category: "Video",   isActive: false },
  { id: "10", name: "Panic Button",  icon: "AlertTriangle", category: "System",  isActive: false },
  { id: "11", name: "Sub Goal",      icon: "Target",        category: "Overlay", isActive: true  },
  { id: "12", name: "End Stream",    icon: "Power",         category: "System",  isActive: false },
];

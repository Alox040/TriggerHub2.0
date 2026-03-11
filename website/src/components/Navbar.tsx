import { motion } from "motion/react";
import logoImage from "../assets/41208bd857a758438641cb275dc7de957fd9fa9f.png";

export function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-black/50"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={logoImage} 
            alt="TriggerHub" 
            className="h-8 object-contain"
            style={{ imageRendering: 'crisp-edges' }}
          />
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#status" className="text-sm text-gray-400 hover:text-white transition-colors">Status</a>
          <a href="#evidence" className="text-sm text-gray-400 hover:text-white transition-colors">Evidence</a>
          <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Roadmap</a>
        </div>
        
        <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white transition-colors">
          View Project
        </button>
      </div>
    </motion.nav>
  );
}

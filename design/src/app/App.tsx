import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import DashboardHeader from "./components/DashboardHeader";
import TriggerGrid, { LayoutType } from "./components/TriggerGrid";
import StatusBar from "./components/StatusBar";
import AutomationPanel from "./components/AutomationPanel";
import { applyUpdate, getCurrentVersion, startVersionMonitor, type VersionManifest } from "../update/versionMonitor";

export default function App() {
  const [layout, setLayout] = useState<LayoutType>("grid");
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [updateManifest, setUpdateManifest] = useState<VersionManifest | null>(null);

  useEffect(() => {
    const stopMonitoring = startVersionMonitor({
      onUpdateAvailable: (manifest) => {
        setUpdateManifest(manifest);
      },
    });

    return () => {
      stopMonitoring();
    };
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#0E0E11] text-zinc-100 overflow-hidden font-sans selection:bg-teal-500/30">
      {updateManifest ? (
        <div className="absolute top-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-teal-400/30 bg-[#14161a] px-4 py-3 text-sm shadow-lg">
          <div className="flex items-center gap-4">
            <span>
              Neues Update verfuegbar ({getCurrentVersion()} {"->"} {updateManifest.version})
            </span>
            <button
              type="button"
              onClick={applyUpdate}
              className="rounded bg-teal-500 px-3 py-1 font-medium text-[#0f1318] hover:bg-teal-400"
            >
              Jetzt laden
            </button>
          </div>
        </div>
      ) : null}
      {!isFocusMode && <Sidebar />}
      
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <DashboardHeader 
          layout={layout} 
          setLayout={setLayout} 
          isFocusMode={isFocusMode}
          setIsFocusMode={setIsFocusMode} 
        />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6 relative bg-[#121214] shadow-[inset_0_4px_24px_rgba(0,0,0,0.2)]">
            <TriggerGrid layout={layout} />
            
            {/* Status Bar now lives cleanly INSIDE the main area, not bleeding over sidebars */}
            <StatusBar />
          </main>
          
          {!isFocusMode && (
            <aside className="w-[300px] bg-[#0E0E11] overflow-y-auto shrink-0 z-10 border-l border-white/[0.04]">
              <AutomationPanel />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

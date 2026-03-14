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
    <div className="flex h-screen w-full overflow-hidden bg-[var(--th-bg-shell)] font-sans text-[var(--th-text-primary)] selection:bg-th-accent/30">
      {updateManifest ? (
        <div className="absolute top-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-th-accent-hover/30 bg-th-bg-shell px-4 py-3 text-sm shadow-lg">
          <div className="flex items-center gap-4">
            <span>
              Neues Update verfuegbar ({getCurrentVersion()} {"->"} {updateManifest.version})
            </span>
            <button
              type="button"
              onClick={applyUpdate}
              className="rounded bg-th-accent px-3 py-1 font-medium text-primary-foreground hover:bg-th-accent-hover"
            >
              Jetzt laden
            </button>
          </div>
        </div>
      ) : null}
      {!isFocusMode && <Sidebar />}
      
      <div className="flex min-w-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader 
          layout={layout} 
          setLayout={setLayout} 
          isFocusMode={isFocusMode}
          setIsFocusMode={setIsFocusMode} 
        />

          <main className="flex-1 overflow-auto bg-[var(--th-bg-main)] p-6 shadow-[inset_0_4px_24px_rgba(0,0,0,0.2)]">
            <TriggerGrid layout={layout} />
          </main>

          <StatusBar />
        </div>

        {!isFocusMode && (
          <aside className="z-10 w-[300px] shrink-0 overflow-y-auto border-l border-[var(--th-border-subtle)] bg-[var(--th-bg-shell)]">
            <AutomationPanel />
          </aside>
        )}
        </div>
    </div>
  );
}

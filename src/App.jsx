import { useEffect } from "react";
import { useAstraStore } from "./lib/state";
import CommandBar from "./components/CommandBar";
import ChatCanvas from "./components/ChatCanvas";
import Sidebar from "./components/Sidebar";
import FileDropZone from "./components/FileDropZone";
import { ActionRow } from "./components/ActionRow";

export default function App() {
  const theme = useAstraStore((state) => state.theme);
  const lastError = useAstraStore((state) => state.lastError);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="flex h-screen w-screen bg-astral-bgDark text-sm text-slate-100">
      <FileDropZone>
        <div className="flex h-full w-full flex-col">
          <CommandBar />
          <div className="flex flex-1 overflow-hidden">
            <ChatCanvas />
            <Sidebar />
          </div>
          <ActionRow />
          {lastError ? (
            <div className="border-t border-white/10 bg-red-500/10 px-6 py-3 text-xs text-red-200">
              {lastError}
            </div>
          ) : null}
        </div>
      </FileDropZone>
    </div>
  );
}

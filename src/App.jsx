import { useEffect } from "react";
import { useAstraStore } from "./lib/state";
import { getAppInfo } from "./lib/appClient";
import CommandBar from "./components/CommandBar";
import ChatCanvas from "./components/ChatCanvas";
import Sidebar from "./components/Sidebar";
import FileDropZone from "./components/FileDropZone";
import { ActionRow } from "./components/ActionRow";

export default function App() {
  const theme = useAstraStore((state) => state.theme);
  const lastError = useAstraStore((state) => state.lastError);
  const model = useAstraStore((state) => state.model);
  const appInfo = useAstraStore((state) => state.appInfo);
  const setAppInfo = useAstraStore((state) => state.setAppInfo);
  const setModel = useAstraStore((state) => state.setModel);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    let isMounted = true;

    async function syncAppInfo() {
      try {
        const appInfo = await getAppInfo();
        if (isMounted) {
          setAppInfo(appInfo);
        }
      } catch {
        if (isMounted) {
          setAppInfo({
            hotkey: {
              available: false,
              configuredShortcut: null,
              shortcut: null,
              source: "default",
              usedFallback: false,
            },
            ollama: {
              available: false,
              defaultModel: "phi4:14b",
              error: "",
              models: [],
              url: "http://localhost:11434",
            },
          });
        }
      }
    }

    syncAppInfo();

    return () => {
      isMounted = false;
    };
  }, [setAppInfo]);

  useEffect(() => {
    const availableModels = appInfo.ollama?.models || [];
    if (availableModels.length === 0) {
      return;
    }

    const modelNames = availableModels.map((entry) => entry.name).filter(Boolean);
    if (modelNames.includes(model)) {
      return;
    }

    const preferredModel = modelNames.includes(appInfo.ollama.defaultModel)
      ? appInfo.ollama.defaultModel
      : modelNames[0];

    if (preferredModel) {
      setModel(preferredModel);
    }
  }, [appInfo, model, setModel]);

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

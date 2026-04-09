import React, { useEffect } from "react";
import { useAstraStore } from "./lib/state";
import CommandBar from "./components/CommandBar";
import ChatCanvas from "./components/ChatCanvas";
import Sidebar from "./components/Sidebar";
import FileDropZone from "./components/FileDropZone";

export default function App() {
  const theme = useAstraStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="w-screen h-screen bg-black/60 backdrop-blur-md flex text-sm dark:text-white text-gray-900">
      <FileDropZone>
        <div className="flex flex-col w-full h-full">
          <CommandBar />
          <div className="flex flex-1 overflow-hidden">
            <ChatCanvas />
            <Sidebar />
          </div>
        </div>
      </FileDropZone>
    </div>
  );
}
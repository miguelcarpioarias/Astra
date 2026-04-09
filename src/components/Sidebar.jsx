import React from "react";
import { useAstraStore } from "../lib/state";

export default function Sidebar() {
  const theme = useAstraStore((s) => s.theme);
  const setTheme = useAstraStore((s) => s.setTheme);

  return (
    <div className="w-72 border-l border-white/10 bg-black/50 flex flex-col">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="text-xs font-semibold tracking-wide text-gray-300">
          Astra
        </div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-gray-200"
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 text-xs text-gray-400 space-y-3">
        <div>
          <div className="font-semibold text-gray-300 mb-1">Tools</div>
          <div>fileSearch, RAG, Python (skeleton)</div>
        </div>
        <div>
          <div className="font-semibold text-gray-300 mb-1">Knowledge Base</div>
          <div>Documents stored in <code>astra/data/</code></div>
        </div>
        <div>
          <div className="font-semibold text-gray-300 mb-1">History</div>
          <div>Session history coming next.</div>
        </div>
      </div>
    </div>
  );
}
import { useAstraStore } from "../lib/state";

export function ActionRow() {
  const clearMessages = useAstraStore((state) => state.clearMessages);
  const setLastError = useAstraStore((state) => state.setLastError);

  return (
    <div className="flex gap-3 border-t border-white/10 px-6 py-4">
      <button
        type="button"
        onClick={() => {
          clearMessages();
          setLastError("");
        }}
        className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
      >
        Clear chat
      </button>
      <button
        type="button"
        onClick={() => setLastError("Drop a file anywhere in the window to attach and index it.")}
        className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
      >
        How file ingest works
      </button>
    </div>
  );
}

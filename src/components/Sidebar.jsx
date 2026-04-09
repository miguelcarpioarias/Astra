import { useAstraStore } from "../lib/state";

export default function Sidebar() {
  const theme = useAstraStore((state) => state.theme);
  const setTheme = useAstraStore((state) => state.setTheme);
  const model = useAstraStore((state) => state.model);
  const messages = useAstraStore((state) => state.messages);

  return (
    <aside className="flex w-80 flex-col border-l border-white/10 bg-black/30 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="text-xs font-semibold tracking-[0.2em] text-slate-300">
          Astra
        </div>
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-200 transition hover:bg-white/20"
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 text-xs text-slate-400">
        <section className="space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Session
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm text-slate-100">{messages.length} messages</div>
            <div className="mt-1 text-slate-400">Current model: {model}</div>
          </div>
        </section>

        <section>
          <div className="mb-2 font-semibold text-slate-200">Tools</div>
          <div>File search, local RAG, Python execution, date helpers, and browser launching.</div>
        </section>

        <section>
          <div className="mb-2 font-semibold text-slate-200">Knowledge Base</div>
          <div>Indexed documents are stored locally under <code>data/chroma</code>.</div>
        </section>

        <section>
          <div className="mb-2 font-semibold text-slate-200">Notes</div>
          <div>Use the command bar for chat, and drag files anywhere onto the window to ingest them.</div>
        </section>
      </div>
    </aside>
  );
}

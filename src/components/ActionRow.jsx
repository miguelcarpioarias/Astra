export function ActionRow() {
  return (
    <div className="mt-4 flex gap-3">
      <button className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950">
        Run
      </button>
      <button className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">
        Attach
      </button>
    </div>
  );
}

import { useState } from "react";
import { useAstraStore } from "../lib/state";
import { orchestrator } from "../lib/orchestrator";

export default function CommandBar() {
  const [input, setInput] = useState("");
  const model = useAstraStore((state) => state.model);
  const setModel = useAstraStore((state) => state.setModel);
  const addMessage = useAstraStore((state) => state.addMessage);
  const setThinking = useAstraStore((state) => state.setThinking);
  const setLastError = useAstraStore((state) => state.setLastError);
  const isThinking = useAstraStore((state) => state.isThinking);
  const ollama = useAstraStore((state) => state.appInfo.ollama);

  const modelOptions = Array.isArray(ollama.models)
    ? ollama.models.map((entry) => entry.name).filter(Boolean)
    : [];

  const canSubmit = !isThinking && input.trim().length > 0 && ollama.available && modelOptions.length > 0;

  async function onSubmit(event) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    if (!ollama.available) {
      setLastError(ollama.error || `Unable to reach Ollama at ${ollama.url}.`);
      addMessage({
        role: "assistant",
        content: `I can't reach Ollama right now. ${ollama.error || `Check that the Ollama service is running at ${ollama.url}.`}`,
      });
      return;
    }

    if (modelOptions.length === 0) {
      setLastError("Ollama is reachable, but no local models were found.");
      addMessage({
        role: "assistant",
        content: "Ollama is running, but I couldn't find any installed models to use yet.",
      });
      return;
    }

    addMessage({ role: "user", content: trimmed });
    setInput("");
    setThinking(true);
    setLastError("");

    try {
      const result = await orchestrator({
        model,
        prompt: trimmed,
      });

      addMessage({ role: "assistant", content: result.reply });
    } catch (error) {
      setLastError(error.message);
      addMessage({
        role: "assistant",
        content: `I hit an error while processing that request: ${error.message}`,
      });
    } finally {
      setThinking(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full items-center gap-3 border-b border-white/10 bg-gradient-to-r from-black/70 to-black/40 px-6 py-3"
    >
      <label className="sr-only" htmlFor="astra-model-selector">
        Active model
      </label>
      <select
        id="astra-model-selector"
        value={modelOptions.includes(model) ? model : modelOptions[0] || ""}
        onChange={(event) => setModel(event.target.value)}
        disabled={isThinking || modelOptions.length === 0}
        className="w-52 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-astral-accent disabled:cursor-not-allowed disabled:opacity-60"
      >
        {modelOptions.length > 0 ? (
          modelOptions.map((modelName) => (
            <option key={modelName} value={modelName} className="bg-slate-950 text-slate-100">
              {modelName}
            </option>
          ))
        ) : (
          <option value="" className="bg-slate-950 text-slate-100">
            {ollama.available ? "No models found" : "Ollama unavailable"}
          </option>
        )}
      </select>
      <input
        className="flex-1 rounded-full bg-white/5 px-4 py-2 text-sm outline-none ring-1 ring-transparent transition placeholder:text-slate-400 focus:ring-astral-accent"
        placeholder="Ask Astra... supports chat plus local retrieval context"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        disabled={isThinking}
      />
      <button
        type="submit"
        className="rounded-full bg-astral-accent px-4 py-2 text-xs font-medium text-white transition hover:bg-astral-accentSoft disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!canSubmit}
      >
        {isThinking ? "Working..." : "Send"}
      </button>
    </form>
  );
}

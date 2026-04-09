import { useState } from "react";
import { useAstraStore } from "../lib/state";
import { orchestrator } from "../lib/orchestrator";

export default function CommandBar() {
  const [input, setInput] = useState("");
  const model = useAstraStore((state) => state.model);
  const addMessage = useAstraStore((state) => state.addMessage);
  const setThinking = useAstraStore((state) => state.setThinking);
  const setLastError = useAstraStore((state) => state.setLastError);
  const isThinking = useAstraStore((state) => state.isThinking);

  async function onSubmit(event) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
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
        disabled={isThinking}
      >
        {isThinking ? "Working..." : "Send"}
      </button>
    </form>
  );
}

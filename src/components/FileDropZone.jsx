import { useCallback, useState } from "react";
import { ingestText } from "../lib/ragClient";
import { useAstraStore } from "../lib/state";

export default function FileDropZone({ children }) {
  const [isOver, setIsOver] = useState(false);
  const addMessage = useAstraStore((state) => state.addMessage);
  const setLastError = useAstraStore((state) => state.setLastError);

  const onDrop = useCallback(
    async (event) => {
      event.preventDefault();
      setIsOver(false);
      setLastError("");

      const files = Array.from(event.dataTransfer.files || []);
      if (files.length === 0) {
        return;
      }

      try {
        for (const file of files) {
          const text = await file.text();
          await ingestText({
            id: `${file.name}-${Date.now()}`,
            text,
            metadata: {
              name: file.name,
              size: file.size,
              type: file.type || "text/plain",
            },
          });

          addMessage({
            role: "assistant",
            content: `Indexed **${file.name}** for retrieval.`,
          });
        }
      } catch (error) {
        setLastError(error.message);
        addMessage({
          role: "assistant",
          content: `I couldn't ingest that file: ${error.message}`,
        });
      }
    },
    [addMessage, setLastError],
  );

  const onDragOver = (event) => {
    event.preventDefault();
    setIsOver(true);
  };

  const onDragLeave = (event) => {
    event.preventDefault();
    setIsOver(false);
  };

  return (
    <div
      className="relative h-full w-full"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {children}
      {isOver ? (
        <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-astral-accent bg-black/50 text-sm text-slate-100">
          Drop files to ingest them into Astra's knowledge base
        </div>
      ) : null}
    </div>
  );
}

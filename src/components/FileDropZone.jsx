import React, { useState, useCallback } from "react";
import { ingestText } from "../lib/ragClient";

export default function FileDropZone({ children }) {
  const [isOver, setIsOver] = useState(false);

  const onDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsOver(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const text = await file.text();
    await ingestText({
      id: `${file.name}-${Date.now()}`,
      text,
      metadata: { name: file.name }
    });
    // You can also add a system message to chat saying "Document ingested"
  }, []);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsOver(false);
  };

  return (
    <div
      className="w-full h-full relative"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {children}
      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-astral-accent bg-black/40 flex items-center justify-center text-sm text-gray-200">
          Drop to ingest into Astra’s knowledge base
        </div>
      )}
    </div>
  );
}
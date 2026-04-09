import { askLLM } from "./llmClient";
import { queryRAG } from "./ragClient";

function extractContext(result) {
  const documents = result?.documents?.[0] || [];
  const metadatas = result?.metadatas?.[0] || [];

  return documents.map((document, index) => {
    const metadata = metadatas[index];
    const sourceLabel = metadata?.name || metadata?.sourceId || `Document ${index + 1}`;
    return `[${sourceLabel}]\n${document}`;
  });
}

export async function orchestrator({ model, prompt, useRag = true }) {
  const context = [];
  let ragError = "";

  if (useRag) {
    try {
      const ragResult = await queryRAG({ query: prompt, topK: 3 });
      context.push(...extractContext(ragResult));
    } catch (error) {
      ragError = error.message;
    }
  }

  const reply = await askLLM({
    model,
    prompt,
    context,
  });

  return {
    context,
    ragError,
    reply,
  };
}

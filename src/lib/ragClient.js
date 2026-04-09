export async function ingestText({ id, text, metadata }) {
  if (!window.astra?.ragIngest) {
    throw new Error("The Astra desktop bridge is unavailable.");
  }

  return window.astra.ragIngest({ id, text, metadata });
}

export async function queryRAG({ query, topK }) {
  if (!window.astra?.ragQuery) {
    throw new Error("The Astra desktop bridge is unavailable.");
  }

  return window.astra.ragQuery({ query, topK });
}

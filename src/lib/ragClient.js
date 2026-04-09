export async function ingestText({ id, text, metadata }) {
  return window.astra.ragIngest({ id, text, metadata });
}

export async function queryRAG({ query, topK }) {
  return window.astra.ragQuery({ query, topK });
}
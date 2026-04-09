const { ChromaClient } = require("chromadb");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

const DATA_DIR = path.join(__dirname, "../data");
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const client = new ChromaClient({ path: path.join(DATA_DIR, "chroma") });

async function getCollection() {
  return client.getOrCreateCollection({ name: "astra-knowledge" });
}

async function embedTexts(texts) {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    body: JSON.stringify({
      model: "nomic-embed-text",
      input: texts
    }),
    headers: { "Content-Type": "application/json" }
  });
  const json = await res.json();
  return json.embeddings;
}

async function handleRAGIngest(_event, { id, text, metadata }) {
  const collection = await getCollection();
  const embeddings = await embedTexts([text]);
  await collection.add({
    ids: [id],
    embeddings,
    metadatas: [metadata || {}],
    documents: [text]
  });
  return { ok: true };
}

async function handleRAGQuery(_event, { query, topK = 5 }) {
  const collection = await getCollection();
  const queryEmb = await embedTexts([query]);
  const result = await collection.query({
    queryEmbeddings: queryEmb,
    nResults: topK
  });
  return result;
}

module.exports = { handleRAGIngest, handleRAGQuery };
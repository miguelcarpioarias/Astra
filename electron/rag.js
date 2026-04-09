const path = require("path");
const fs = require("fs");

const DATA_DIR = path.join(__dirname, "../data/chroma");
const INDEX_PATH = path.join(DATA_DIR, "index.json");
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const EMBEDDING_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readIndex() {
  if (!fs.existsSync(INDEX_PATH)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(INDEX_PATH, "utf8");
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    throw new Error(`Failed to read local RAG index: ${error.message}`);
  }
}

function writeIndex(entries) {
  fs.writeFileSync(INDEX_PATH, JSON.stringify(entries, null, 2));
}

async function embedTexts(texts) {
  const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts
    }),
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Embedding request failed (${response.status}): ${details}`);
  }

  const json = await response.json();

  if (!Array.isArray(json.embeddings)) {
    throw new Error("Embedding response did not include embeddings.");
  }

  return json.embeddings;
}

function cosineSimilarity(left, right) {
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index] || 0;
    const rightValue = right[index] || 0;
    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  if (!leftMagnitude || !rightMagnitude) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

function normalizeMetadata(metadata, fallbackId) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return { sourceId: fallbackId };
  }

  return { ...metadata, sourceId: fallbackId };
}

async function handleRAGIngest(_event, { id, text, metadata } = {}) {
  if (!id || !text) {
    throw new Error("RAG ingest requires both id and text.");
  }

  const embeddings = await embedTexts([text]);
  const entries = readIndex().filter((entry) => entry.id !== id);

  entries.push({
    id,
    text,
    metadata: normalizeMetadata(metadata, id),
    embedding: embeddings[0],
    updatedAt: new Date().toISOString()
  });

  writeIndex(entries);

  return {
    ok: true,
    id,
    count: entries.length
  };
}

async function handleRAGQuery(_event, { query, topK = 5 } = {}) {
  if (!query) {
    throw new Error("RAG query requires a query string.");
  }

  const entries = readIndex();

  if (entries.length === 0) {
    return {
      ids: [[]],
      documents: [[]],
      metadatas: [[]],
      distances: [[]]
    };
  }

  const queryEmb = await embedTexts([query]);
  const ranked = entries
    .map((entry) => {
      const score = cosineSimilarity(queryEmb[0], entry.embedding || []);
      return {
        ...entry,
        score
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.max(1, topK));

  return {
    ids: [ranked.map((entry) => entry.id)],
    documents: [ranked.map((entry) => entry.text)],
    metadatas: [ranked.map((entry) => entry.metadata || {})],
    distances: [ranked.map((entry) => 1 - entry.score)]
  };
}

module.exports = { handleRAGIngest, handleRAGQuery };

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "phi4:14b";

function buildPrompt(prompt, context, tools) {
  const sections = [];

  if (Array.isArray(context) && context.length > 0) {
    const contextBlock = context
      .filter(Boolean)
      .map((entry, index) => `Context ${index + 1}:\n${entry}`)
      .join("\n\n");
    sections.push(`Relevant context:\n${contextBlock}`);
  }

  if (Array.isArray(tools) && tools.length > 0) {
    const toolBlock = tools
      .filter(Boolean)
      .map((tool) => `- ${tool.name}: ${tool.description || "No description provided"}`)
      .join("\n");
    sections.push(`Available tools:\n${toolBlock}`);
  }

  sections.push(prompt);
  return sections.join("\n\n");
}

async function requestOllama(endpoint, { method = "POST", payload } = {}) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (payload !== undefined) {
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(`${OLLAMA_URL}${endpoint}`, options);

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Ollama request failed (${response.status}): ${details}`);
  }

  return response.json();
}

async function getOllamaStatus() {
  try {
    const json = await requestOllama("/api/tags", { method: "GET" });
    const models = Array.isArray(json?.models)
      ? json.models.map((model) => ({
          digest: model.digest || "",
          modifiedAt: model.modified_at || "",
          name: model.name || model.model || "",
          size: model.size || 0,
        }))
      : [];

    return {
      available: true,
      defaultModel: DEFAULT_MODEL,
      error: "",
      models,
      url: OLLAMA_URL,
    };
  } catch (error) {
    return {
      available: false,
      defaultModel: DEFAULT_MODEL,
      error: error.message,
      models: [],
      url: OLLAMA_URL,
    };
  }
}

async function handleLLMRequest(_event, { model, prompt, system, tools, context } = {}) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("A prompt is required for LLM requests.");
  }

  const body = {
    model: model || DEFAULT_MODEL,
    prompt: buildPrompt(prompt, context, tools),
    system,
    stream: false
  };

  const json = await requestOllama("/api/generate", { payload: body });
  return json.response || "";
}

module.exports = { DEFAULT_MODEL, OLLAMA_URL, getOllamaStatus, handleLLMRequest };

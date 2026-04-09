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

async function requestOllama(endpoint, payload) {
  const response = await fetch(`${OLLAMA_URL}${endpoint}`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Ollama request failed (${response.status}): ${details}`);
  }

  return response.json();
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

  const json = await requestOllama("/api/generate", body);
  return json.response || "";
}

module.exports = { handleLLMRequest };

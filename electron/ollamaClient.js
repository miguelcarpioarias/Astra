const fetch = require("node-fetch");

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

async function handleLLMRequest(_event, { model, prompt, system, tools, context }) {
  const body = {
    model: model || "phi4:14b",
    prompt,
    system,
    stream: false
  };

  // tools/context can be added to prompt formatting later
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  });

  const json = await res.json();
  return json.response;
}

module.exports = { handleLLMRequest };
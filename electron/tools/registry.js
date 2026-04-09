const path = require("path");
const fs = require("fs");

const toolsDir = __dirname;
const tools = {};
const toolLoadErrors = {};

fs.readdirSync(toolsDir)
  .filter((f) => f.endsWith(".js") && f !== "registry.js")
  .forEach((file) => {
    try {
      const mod = require(path.join(toolsDir, file));
      if (mod && mod.name && typeof mod.run === "function") {
        tools[mod.name] = mod;
      }
    } catch (error) {
      toolLoadErrors[file] = error.message;
    }
  });

function listTools() {
  return Object.values(tools).map(({ name, description }) => ({
    name,
    description: description || ""
  }));
}

async function handleToolCall(_event, { name, args } = {}) {
  if (!name || name === "list") {
    return {
      tools: listTools(),
      errors: toolLoadErrors
    };
  }

  const tool = tools[name];
  if (!tool) {
    throw new Error(`Tool not found: ${name}`);
  }

  return tool.run(args || {});
}

module.exports = { handleToolCall, tools };

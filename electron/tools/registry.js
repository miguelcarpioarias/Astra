const path = require("path");
const fs = require("fs");

const toolsDir = __dirname;

const tools = {};

fs.readdirSync(toolsDir)
  .filter((f) => f.endsWith(".js") && f !== "registry.js")
  .forEach((file) => {
    const mod = require(path.join(toolsDir, file));
    if (mod && mod.name && typeof mod.run === "function") {
      tools[mod.name] = mod;
    }
  });

async function handleToolCall(_event, { name, args }) {
  const tool = tools[name];
  if (!tool) {
    throw new Error(`Tool not found: ${name}`);
  }
  return tool.run(args || {});
}

module.exports = { handleToolCall, tools };
export async function askLLM({ model, prompt, system, tools, context }) {
  if (!window.astra?.llm) {
    throw new Error("The Astra desktop bridge is unavailable.");
  }

  const res = await window.astra.llm({
    model,
    prompt,
    system,
    tools,
    context
  });
  return res;
}

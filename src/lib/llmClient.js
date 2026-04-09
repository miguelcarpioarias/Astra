export async function askLLM({ model, prompt, system, tools, context }) {
  const res = await window.astra.llm({
    model,
    prompt,
    system,
    tools,
    context
  });
  return res;
}
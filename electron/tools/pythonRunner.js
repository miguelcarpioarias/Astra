export async function pythonRunner(script, args = []) {
  return {
    tool: "pythonRunner",
    script,
    args,
    status: "idle",
  };
}

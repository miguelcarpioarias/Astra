export async function browser(url, options = {}) {
  return {
    tool: "browser",
    url,
    options,
    status: "idle",
  };
}

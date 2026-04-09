export async function calendar(action, payload = {}) {
  return {
    tool: "calendar",
    action,
    payload,
    events: [],
  };
}

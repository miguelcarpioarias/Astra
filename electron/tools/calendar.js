module.exports = {
  name: "calendar",
  description: "Return local calendar and date/time information.",
  async run({ action = "now" } = {}) {
    const now = new Date();

    if (action === "today") {
      return {
        action,
        isoDate: now.toISOString().slice(0, 10),
        localeDate: now.toLocaleDateString(),
        weekday: now.toLocaleDateString(undefined, { weekday: "long" })
      };
    }

    if (action === "week") {
      const dates = [];
      for (let offset = 0; offset < 7; offset += 1) {
        const date = new Date(now);
        date.setDate(now.getDate() + offset);
        dates.push({
          isoDate: date.toISOString().slice(0, 10),
          weekday: date.toLocaleDateString(undefined, { weekday: "long" })
        });
      }

      return { action, dates };
    }

    return {
      action: "now",
      iso: now.toISOString(),
      locale: now.toLocaleString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
};

const { shell } = require("electron");

module.exports = {
  name: "browser",
  description: "Open a URL in the user's default browser.",
  async run({ url } = {}) {
    if (!url || typeof url !== "string") {
      throw new Error("browser requires a URL.");
    }

    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("browser only supports http and https URLs.");
    }

    await shell.openExternal(parsedUrl.toString());

    return {
      opened: true,
      url: parsedUrl.toString()
    };
  }
};

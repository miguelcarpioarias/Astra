const fs = require("fs");
const path = require("path");

const DEFAULT_IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "data"
]);

module.exports = {
  name: "fileSearch",
  description: "Search for files by name in a base directory.",
  async run({ baseDir, query, maxResults = 50 } = {}) {
    if (!query || typeof query !== "string") {
      throw new Error("fileSearch requires a query string.");
    }

    const root = path.resolve(baseDir || process.cwd());
    const results = [];

    function walk(dir) {
      if (results.length >= maxResults) {
        return;
      }

      let entries = [];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        if (results.length >= maxResults) {
          return;
        }

        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (DEFAULT_IGNORED_DIRS.has(entry.name)) {
            continue;
          }

          walk(full);
        } else if (entry.name.toLowerCase().includes(query.toLowerCase())) {
          results.push(full);
        }
      }
    }

    walk(root);
    return {
      query,
      root,
      results
    };
  }
};

const fs = require("fs");
const path = require("path");

module.exports = {
  name: "fileSearch",
  description: "Search for files by name in a base directory",
  async run({ baseDir, query }) {
    const root = baseDir || process.cwd();
    const results = [];

    function walk(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.name.toLowerCase().includes(query.toLowerCase())) {
          results.push(full);
        }
      }
    }

    walk(root);
    return results;
  }
};
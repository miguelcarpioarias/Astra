const fs = require("fs");
const path = require("path");

module.exports = {
  name: "pdfReader",
  description: "Inspect a PDF file and return basic metadata.",
  async run({ filePath } = {}) {
    if (!filePath) {
      throw new Error("pdfReader requires a filePath.");
    }

    const resolvedPath = path.resolve(filePath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`PDF file not found: ${resolvedPath}`);
    }

    const stats = fs.statSync(resolvedPath);
    return {
      filePath: resolvedPath,
      size: stats.size,
      modifiedAt: stats.mtime.toISOString(),
      note: "PDF metadata is available, but text extraction is not configured yet."
    };
  }
};

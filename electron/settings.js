const fs = require("fs");
const path = require("path");

const SETTINGS_FILE_ENV_VAR = "ASTRA_SETTINGS_FILE";
const TOGGLE_SHORTCUT_ENV_VAR = "ASTRA_TOGGLE_SHORTCUT";
const TOGGLE_FALLBACK_SHORTCUTS_ENV_VAR = "ASTRA_TOGGLE_FALLBACK_SHORTCUTS";

function normalizeShortcut(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseShortcutList(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeShortcut).filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map(normalizeShortcut)
    .filter(Boolean);
}

function getSettingsCandidatePaths(app, env = process.env) {
  const explicitPath = normalizeShortcut(env[SETTINGS_FILE_ENV_VAR]);
  const candidatePaths = [];

  if (explicitPath) {
    candidatePaths.push(path.resolve(explicitPath));
  }

  if (app && typeof app.getPath === "function") {
    candidatePaths.push(path.join(app.getPath("userData"), "settings.json"));
  }

  candidatePaths.push(path.join(process.cwd(), "data", "settings.json"));

  return [...new Set(candidatePaths)];
}

function loadSettings({ app, env = process.env } = {}) {
  const errors = [];
  const candidatePaths = getSettingsCandidatePaths(app, env);
  const explicitPath = normalizeShortcut(env[SETTINGS_FILE_ENV_VAR]);

  for (const candidatePath of candidatePaths) {
    if (!fs.existsSync(candidatePath)) {
      if (explicitPath && path.resolve(explicitPath) === candidatePath) {
        errors.push(`Configured settings file was not found: ${candidatePath}`);
      }

      continue;
    }

    try {
      const contents = fs.readFileSync(candidatePath, "utf8");
      return {
        errors,
        path: candidatePath,
        settings: JSON.parse(contents),
      };
    } catch (error) {
      errors.push(`Failed to read settings file ${candidatePath}: ${error.message}`);
    }
  }

  return {
    errors,
    path: null,
    settings: null,
  };
}

module.exports = {
  SETTINGS_FILE_ENV_VAR,
  TOGGLE_FALLBACK_SHORTCUTS_ENV_VAR,
  TOGGLE_SHORTCUT_ENV_VAR,
  getSettingsCandidatePaths,
  loadSettings,
  normalizeShortcut,
  parseShortcutList,
};

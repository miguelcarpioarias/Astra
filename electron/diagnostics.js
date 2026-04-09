const fs = require("fs");
const path = require("path");
const Module = require("module");

const reportDir = path.join(__dirname, "../data/diagnostics");

function serializeError(error) {
  if (!error) {
    return null;
  }

  return {
    name: error.name,
    message: error.message,
    code: error.code || "",
    stack: error.stack || "",
  };
}

function summarizeLoadedValue(loaded) {
  const summary = {
    loadedType: typeof loaded,
    loadedKeys: [],
    preview: null,
    appType: null,
    browserWindowType: null,
  };

  if (typeof loaded === "string") {
    summary.preview = loaded;
    return summary;
  }

  if (loaded && typeof loaded === "object") {
    summary.loadedKeys = Object.keys(loaded).slice(0, 25);
    summary.appType = typeof loaded.app;
    summary.browserWindowType = typeof loaded.BrowserWindow;
    return summary;
  }

  summary.preview = loaded ?? null;
  return summary;
}

function inspectModule(request, { moduleRef, localRequire }) {
  const result = {
    request,
    resolveFilename: null,
    requireResolve: null,
    loadedType: null,
    loadedKeys: [],
    preview: null,
    appType: null,
    browserWindowType: null,
    error: null,
  };

  try {
    result.resolveFilename = Module._resolveFilename(request, moduleRef);
  } catch (error) {
    result.resolveFilename = { error: serializeError(error) };
  }

  try {
    result.requireResolve = localRequire.resolve(request);
  } catch (error) {
    result.requireResolve = { error: serializeError(error) };
  }

  try {
    Object.assign(result, summarizeLoadedValue(localRequire(request)));
  } catch (error) {
    result.error = serializeError(error);
  }

  return result;
}

function buildDiagnosticReport({
  mode,
  moduleRef,
  localRequire,
  entryFile = "",
  notes = "",
}) {
  return {
    mode,
    generatedAt: new Date().toISOString(),
    cwd: process.cwd(),
    execPath: process.execPath,
    argv: process.argv,
    entryFile,
    mainFilename: require.main?.filename || "",
    electronRunAsNode: process.env.ELECTRON_RUN_AS_NODE || "",
    nodeVersion: process.version,
    versions: process.versions,
    notes,
    moduleChecks: [
      inspectModule("electron", { moduleRef, localRequire }),
      inspectModule("electron/main", { moduleRef, localRequire }),
      inspectModule("electron/renderer", { moduleRef, localRequire }),
    ],
  };
}

function writeDiagnosticReport(report, filename) {
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, filename);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  return reportPath;
}

module.exports = {
  buildDiagnosticReport,
  writeDiagnosticReport,
  serializeError,
};

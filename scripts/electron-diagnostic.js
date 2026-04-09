const { buildDiagnosticReport, writeDiagnosticReport } = require("../electron/diagnostics");

function main() {
  const report = buildDiagnosticReport({
    mode: "script",
    moduleRef: module,
    localRequire: require,
    entryFile: __filename,
    notes: "Direct Electron script execution via `electron scripts/electron-diagnostic.js`.",
  });

  writeDiagnosticReport(report, "electron-resolution.json");
  console.log(JSON.stringify(report, null, 2));
}

main();

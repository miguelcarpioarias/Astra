const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

function resolvePythonCommand() {
  if (process.platform === "win32") {
    return { command: "py", prefixArgs: ["-3"] };
  }

  return { command: "python3", prefixArgs: [] };
}

module.exports = {
  name: "pythonRunner",
  description: "Run a Python script and capture stdout, stderr, and exit code.",
  run({ script, args = [], cwd, timeoutMs = 15000 } = {}) {
    if (!script || typeof script !== "string") {
      throw new Error("pythonRunner requires a script path.");
    }

    const resolvedScript = path.resolve(script);
    if (!fs.existsSync(resolvedScript)) {
      throw new Error(`Python script not found: ${resolvedScript}`);
    }

    const { command, prefixArgs } = resolvePythonCommand();

    return new Promise((resolve, reject) => {
      const child = spawn(command, [...prefixArgs, resolvedScript, ...args], {
        cwd: cwd ? path.resolve(cwd) : process.cwd(),
        shell: false,
        windowsHide: true
      });

      let stdout = "";
      let stderr = "";
      let settled = false;

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          child.kill();
          reject(new Error(`pythonRunner timed out after ${timeoutMs}ms.`));
        }
      }, timeoutMs);

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      child.on("error", (error) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(error);
        }
      });

      child.on("close", (code) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve({
            script: resolvedScript,
            args,
            exitCode: code,
            stdout,
            stderr
          });
        }
      });
    });
  }
};

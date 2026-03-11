const { spawn } = require("node:child_process");

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      shell: options.shell ?? true,
      env: { ...process.env, ...(options.env ?? {}) }
    });

    child.stdout?.on("data", (data) => {
      options.onLog?.(String(data), "stdout");
    });

    child.stderr?.on("data", (data) => {
      options.onLog?.(String(data), "stderr");
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ code });
      } else {
        reject(new Error(`Command failed: ${command} ${args.join(" ")} (exit ${code})`));
      }
    });
  });
}

module.exports = { runCommand };

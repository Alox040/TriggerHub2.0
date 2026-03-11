const path = require("node:path");
const { ProjectKind } = require("../types.js");
const { exists, safeReadJson } = require("../utils/fs-utils.js");

function hasDependency(packageJson, depName) {
  return Boolean(
    packageJson?.dependencies?.[depName] ||
      packageJson?.devDependencies?.[depName]
  );
}

async function detectProject(projectPath) {
  const packageJsonPath = path.join(projectPath, "package.json");
  const pyProjectPath = path.join(projectPath, "pyproject.toml");
  const requirementsPath = path.join(projectPath, "requirements.txt");
  const setupPyPath = path.join(projectPath, "setup.py");
  const mainPyPath = path.join(projectPath, "main.py");
  const indexHtmlPath = path.join(projectPath, "index.html");
  const tauriPath = path.join(projectPath, "src-tauri", "tauri.conf.json");

  if (await exists(tauriPath)) {
    return {
      kind: ProjectKind.TAURI,
      reasons: ["Found src-tauri/tauri.conf.json"],
      metadata: {}
    };
  }

  if (await exists(packageJsonPath)) {
    const packageJson = await safeReadJson(packageJsonPath);
    if (hasDependency(packageJson, "electron") || hasDependency(packageJson, "electron-builder") || packageJson?.main) {
      return {
        kind: ProjectKind.ELECTRON,
        reasons: ["Detected Electron signals in package.json"],
        metadata: { packageJson }
      };
    }

    return {
      kind: ProjectKind.NODE,
      reasons: ["Found package.json"],
      metadata: { packageJson }
    };
  }

  if (
    (await exists(pyProjectPath)) ||
    (await exists(requirementsPath)) ||
    (await exists(setupPyPath)) ||
    (await exists(mainPyPath))
  ) {
    return {
      kind: ProjectKind.PYTHON,
      reasons: ["Detected Python project markers"],
      metadata: {}
    };
  }

  if (await exists(indexHtmlPath)) {
    return {
      kind: ProjectKind.STATIC,
      reasons: ["Found index.html without stronger framework markers"],
      metadata: {}
    };
  }

  return {
    kind: ProjectKind.UNKNOWN,
    reasons: ["No known markers found"],
    metadata: {}
  };
}

module.exports = { detectProject };

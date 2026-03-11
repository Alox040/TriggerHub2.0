const path = require("node:path");
const { exists, findFirstExe, safeReadJson } = require("../utils/fs-utils.js");
const { runCommand } = require("../utils/process-runner.js");
const { PackagerKind, ProjectKind } = require("../types.js");

function pickNodeBuildCommand(packageJson) {
  if (packageJson?.scripts?.build) {
    return ["npm", ["run", "build"]];
  }

  return null;
}

async function runIf(command, args, context, label) {
  context.onProgress?.(`Running ${label}: ${command} ${args.join(" ")}`);
  await runCommand(command, args, {
    cwd: context.projectPath,
    onLog: context.onLog
  });
}

async function installDependencies(context) {
  if (context.project.kind === ProjectKind.PYTHON) {
    const requirements = path.join(context.projectPath, "requirements.txt");
    if (await exists(requirements)) {
      await runIf("python", ["-m", "pip", "install", "-r", "requirements.txt"], context, "Python deps");
    }
    return;
  }

  if (
    context.project.kind === ProjectKind.NODE ||
    context.project.kind === ProjectKind.ELECTRON ||
    context.project.kind === ProjectKind.STATIC
  ) {
    await runIf("npm", ["install"], context, "Node deps");
    return;
  }

  if (context.project.kind === ProjectKind.TAURI) {
    await runIf("npm", ["install"], context, "Node deps");
    await runIf("cargo", ["build", "--release"], context, "Rust deps/build warmup");
  }
}

async function runProjectBuild(context) {
  if (context.project.kind === ProjectKind.PYTHON) {
    context.onProgress?.("No dedicated Python build step found, proceeding to packaging.");
    return;
  }

  if (context.project.kind === ProjectKind.TAURI) {
    await runIf("npm", ["run", "build"], context, "frontend build");
    return;
  }

  const packageJson = await safeReadJson(path.join(context.projectPath, "package.json"));
  const nodeBuild = pickNodeBuildCommand(packageJson);

  if (nodeBuild) {
    await runIf(nodeBuild[0], nodeBuild[1], context, "project build");
  } else {
    context.onProgress?.("No build script found. Skipping build step.");
  }
}

function resolvePackagerForProject(projectKind, requestedPackager) {
  if (requestedPackager && requestedPackager !== PackagerKind.AUTO) {
    return requestedPackager;
  }

  if (projectKind === ProjectKind.ELECTRON) {
    return PackagerKind.ELECTRON_BUILDER;
  }

  if (projectKind === ProjectKind.PYTHON) {
    return PackagerKind.PYINSTALLER;
  }

  if (projectKind === ProjectKind.TAURI) {
    return PackagerKind.TAURI;
  }

  return PackagerKind.PKG;
}

async function resolvePkgEntry(projectPath) {
  const candidates = ["dist/index.js", "build/index.js", "index.js"];
  for (const candidate of candidates) {
    if (await exists(path.join(projectPath, candidate))) {
      return candidate;
    }
  }

  return "index.js";
}

async function packageProject(context) {
  const targetPackager = resolvePackagerForProject(context.project.kind, context.packager);
  const distDir = path.join(context.outputPath, "dist");

  if (targetPackager === PackagerKind.ELECTRON_BUILDER) {
    await runIf(
      "npx",
      [
        "electron-builder",
        "--win",
        "--x64",
        "--publish",
        "never",
        "--projectDir",
        context.projectPath,
        "--config",
        `directories.output=${distDir}`
      ],
      context,
      "electron-builder"
    );
    return { packager: targetPackager, exePath: await findFirstExe(distDir), distDir };
  }

  if (targetPackager === PackagerKind.PYINSTALLER) {
    const entry = (await exists(path.join(context.projectPath, "main.py"))) ? "main.py" : "app.py";
    await runIf(
      "pyinstaller",
      [
        "--onefile",
        entry,
        "--distpath",
        distDir,
        "--workpath",
        path.join(context.outputPath, "pyinstaller-build")
      ],
      context,
      "pyinstaller"
    );
    return { packager: targetPackager, exePath: await findFirstExe(distDir), distDir };
  }

  if (targetPackager === PackagerKind.TAURI) {
    await runIf("npm", ["run", "tauri", "build"], context, "tauri bundler");
    return {
      packager: targetPackager,
      exePath: await findFirstExe(path.join(context.projectPath, "src-tauri", "target", "release", "bundle")),
      distDir
    };
  }

  const packageJson = await safeReadJson(path.join(context.projectPath, "package.json"));
  const appName = packageJson?.name ?? "app";
  const entry = await resolvePkgEntry(context.projectPath);
  await runIf(
    "npx",
    ["pkg", entry, "--targets", "node18-win-x64", "--output", path.join(distDir, `${appName}.exe`)],
    context,
    "pkg"
  );
  return { packager: targetPackager, exePath: await findFirstExe(distDir), distDir };
}

module.exports = { installDependencies, runProjectBuild, packageProject };

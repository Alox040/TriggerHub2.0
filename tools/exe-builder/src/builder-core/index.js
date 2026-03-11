const path = require("node:path");
const { detectProject } = require("../project-detector/index.js");
const { isDirectory, ensureDir } = require("../utils/fs-utils.js");
const { installDependencies, packageProject, runProjectBuild } = require("../packager/index.js");
const { createInstaller } = require("../installer-generator/index.js");

async function runBuildPipeline(options) {
  const {
    projectPath,
    outputPath,
    packager,
    installer,
    onLog,
    onProgress
  } = options;

  if (!(await isDirectory(projectPath))) {
    throw new Error(`Project folder does not exist: ${projectPath}`);
  }

  await ensureDir(outputPath);

  onProgress?.("Detecting project type...");
  const project = await detectProject(projectPath);
  onProgress?.(`Detected project type: ${project.kind}`);

  const context = {
    projectPath,
    outputPath,
    project,
    packager,
    installer,
    onLog,
    onProgress
  };

  onProgress?.("Installing dependencies...");
  await installDependencies(context);

  onProgress?.("Running build...");
  await runProjectBuild(context);

  onProgress?.("Packaging executable...");
  const packageResult = await packageProject(context);

  let installerResult = { installerPath: null, installerKind: installer };
  if (installer && installer !== "none") {
    installerResult = await createInstaller({
      installerKind: installer,
      outputPath,
      exePath: packageResult.exePath,
      onLog,
      onProgress
    });
  }

  return {
    project,
    packager: packageResult.packager,
    exePath: packageResult.exePath,
    distDir: packageResult.distDir,
    installerPath: installerResult.installerPath,
    installerKind: installerResult.installerKind,
    outputSummary: {
      exe: packageResult.exePath ? path.resolve(packageResult.exePath) : null,
      installer: installerResult.installerPath ? path.resolve(installerResult.installerPath) : null
    }
  };
}

module.exports = { runBuildPipeline };

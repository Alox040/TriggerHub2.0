const path = require("node:path");
const { exists, findFirstExe, writeTextFile } = require("../utils/fs-utils.js");
const { runCommand } = require("../utils/process-runner.js");
const { InstallerKind } = require("../types.js");

function nsisScript({ appExePath, outputInstallerPath }) {
  return `!include "MUI2.nsh"
Name "EXE Builder App"
OutFile "${outputInstallerPath.replaceAll("\\", "\\\\")}"
InstallDir "$PROGRAMFILES\\EXE Builder App"
Page directory
Page instfiles
Section
  SetOutPath "$INSTDIR"
  File "${appExePath.replaceAll("\\", "\\\\")}"
  CreateShortcut "$DESKTOP\\EXE Builder App.lnk" "$INSTDIR\\${path.basename(appExePath)}"
SectionEnd
`;
}

function innoScript({ appExePath, outputInstallerPath }) {
  return `#define MyAppName "EXE Builder App"
#define MyAppExeName "${path.basename(appExePath)}"
[Setup]
AppName={#MyAppName}
AppVersion=1.0.0
DefaultDirName={autopf}\\{#MyAppName}
OutputBaseFilename=${path.basename(outputInstallerPath, ".exe")}
OutputDir=${path.dirname(outputInstallerPath).replaceAll("\\", "\\\\")}
Compression=lzma
SolidCompression=yes

[Files]
Source: "${appExePath.replaceAll("\\", "\\\\")}"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{autodesktop}\\{#MyAppName}"; Filename: "{app}\\{#MyAppExeName}"
`;
}

async function createInstaller({ installerKind, outputPath, exePath, onLog, onProgress }) {
  if (installerKind === InstallerKind.NONE) {
    return { installerPath: null, installerKind };
  }

  if (!exePath || !(await exists(exePath))) {
    throw new Error("Cannot create installer: EXE path not found.");
  }

  const distDir = path.join(outputPath, "dist");
  const installerPath = path.join(distDir, "installer.exe");

  if (installerKind === InstallerKind.NSIS) {
    const scriptPath = path.join(outputPath, "nsis-installer.nsi");
    await writeTextFile(scriptPath, nsisScript({ appExePath: exePath, outputInstallerPath: installerPath }));
    onProgress?.("Generating NSIS installer...");
    await runCommand("makensis", [scriptPath], { cwd: outputPath, onLog });
    return { installerPath: (await findFirstExe(distDir)) ?? installerPath, installerKind };
  }

  if (installerKind === InstallerKind.INNO_SETUP) {
    const scriptPath = path.join(outputPath, "inno-setup.iss");
    await writeTextFile(scriptPath, innoScript({ appExePath: exePath, outputInstallerPath: installerPath }));
    onProgress?.("Generating Inno Setup installer...");
    await runCommand("ISCC", [scriptPath], { cwd: outputPath, onLog });
    return { installerPath: (await findFirstExe(distDir)) ?? installerPath, installerKind };
  }

  throw new Error(`Unsupported installer: ${installerKind}`);
}

module.exports = { createInstaller };

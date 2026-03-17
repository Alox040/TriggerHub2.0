import fs from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptFile = fileURLToPath(import.meta.url)

function log(level, message, context = {}) {
  const writer = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  writer(
    JSON.stringify({
      level,
      message,
      scope: 'desktop-artifacts',
      timestamp: new Date().toISOString(),
      ...context,
    })
  )
}

async function exists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function readJson(jsonPath) {
  return JSON.parse(await fs.readFile(jsonPath, 'utf8'))
}

async function readTextIfExists(filePath) {
  if (!(await exists(filePath))) {
    return null
  }

  return fs.readFile(filePath, 'utf8')
}

async function loadBuilderConfig(rootDir, releaseDir) {
  const packageJson = await readJson(path.join(rootDir, 'package.json'))
  const effectiveConfigPath = path.join(releaseDir, 'builder-effective-config.yaml')
  const effectiveConfig = await readTextIfExists(effectiveConfigPath)
  const build = packageJson.build ?? {}
  const win = build.win ?? {}
  const nsis = build.nsis ?? {}

  return {
    packageJson,
    effectiveConfig,
    productName: build.productName ?? packageJson.productName ?? packageJson.name ?? 'TriggerHub',
    executableName: win.executableName ?? build.productName ?? packageJson.productName ?? packageJson.name ?? 'App',
    setupArtifactName: win.artifactName ?? 'TriggerHubSetup.exe',
    nsisGuid: nsis.guid ?? null,
  }
}

function sanitizeFileNameSegment(value) {
  return String(value).replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim()
}

function uniquePaths(paths) {
  return [...new Set(paths.filter(Boolean))]
}

async function findFirstExistingPath(paths) {
  for (const candidate of paths) {
    if (await exists(candidate)) {
      return candidate
    }
  }

  return null
}

async function listFilesRecursive(directory) {
  if (!(await exists(directory))) {
    return []
  }

  const results = []
  const entries = await fs.readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      results.push(...(await listFilesRecursive(absolutePath)))
      continue
    }

    results.push(absolutePath)
  }

  return results
}

function buildArtifactCandidates(releaseDir, config) {
  const executableName = sanitizeFileNameSegment(config.executableName)
  const productName = sanitizeFileNameSegment(config.productName)
  const setupArtifactName = sanitizeFileNameSegment(config.setupArtifactName)

  return {
    setup: uniquePaths([
      path.join(releaseDir, setupArtifactName),
      path.join(releaseDir, 'TriggerHubSetup.exe'),
      path.join(releaseDir, 'Setup.exe'),
    ]),
    app: uniquePaths([
      path.join(releaseDir, 'win-unpacked', `${executableName}.exe`),
      path.join(releaseDir, 'win-unpacked', `${productName}.exe`),
      path.join(releaseDir, 'win-unpacked', 'App.exe'),
    ]),
    portable: uniquePaths([
      path.join(releaseDir, `${executableName} Portable.exe`),
      path.join(releaseDir, `${productName} Portable.exe`),
      path.join(releaseDir, 'TriggerHubPortable.exe'),
    ]),
  }
}

function buildUninstallerCandidates(releaseDir, config) {
  const executableName = sanitizeFileNameSegment(config.executableName)
  const productName = sanitizeFileNameSegment(config.productName)
  const setupBaseName = sanitizeFileNameSegment(path.basename(config.setupArtifactName, path.extname(config.setupArtifactName)))

  return uniquePaths([
    path.join(releaseDir, `${setupBaseName}.__uninstaller.exe`),
    path.join(releaseDir, 'TriggerHubSetup.__uninstaller.exe'),
    path.join(releaseDir, 'Setup.__uninstaller.exe'),
    path.join(releaseDir, 'win-unpacked', 'Uninstall.exe'),
    path.join(releaseDir, `__uninstaller-nsis-${executableName}.exe`),
    path.join(releaseDir, `__uninstaller-nsis-${productName}.exe`),
  ])
}

async function discoverUninstaller(releaseDir, config) {
  const explicitMatch = await findFirstExistingPath(buildUninstallerCandidates(releaseDir, config))
  if (explicitMatch) {
    return {
      kind: 'packager-output',
      path: explicitMatch,
      source: 'known-path',
    }
  }

  const releaseFiles = await listFilesRecursive(releaseDir)
  const fuzzyMatch = releaseFiles.find(
    (filePath) => path.extname(filePath).toLowerCase() === '.exe' && /uninstall|__uninstaller/i.test(path.basename(filePath))
  )
  if (fuzzyMatch) {
    return {
      kind: 'packager-output',
      path: fuzzyMatch,
      source: 'recursive-scan',
    }
  }

  return null
}

async function copyArtifact(source, targetPath) {
  if (!(await exists(source))) {
    throw new Error(`Missing expected artifact: ${source}`)
  }

  await fs.copyFile(source, targetPath)
  return targetPath
}

async function copyOptionalArtifact(source, targetPath) {
  if (!(await exists(source))) {
    return null
  }

  return copyArtifact(source, targetPath)
}

async function resolveMakensisPath(localAppData = process.env.LOCALAPPDATA) {
  if (!localAppData) {
    return null
  }

  const nsisCacheDir = path.join(localAppData, 'electron-builder', 'Cache', 'nsis')
  if (!(await exists(nsisCacheDir))) {
    return null
  }

  const entries = await fs.readdir(nsisCacheDir, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    const candidate = path.join(nsisCacheDir, entry.name, 'Bin', 'makensis.exe')
    if (await exists(candidate)) {
      return candidate
    }
  }

  return null
}

function getUninstallRegistryKey(config) {
  if (config.nsisGuid) {
    return config.nsisGuid
  }

  if (config.packageJson.build?.appId) {
    return config.packageJson.build.appId
  }

  return config.packageJson.name
}

function createUninstallLauncherScript({ outputPath, registryKey }) {
  const escapedOutputPath = outputPath.replaceAll('\\', '\\\\')
  const escapedRegistryKey = registryKey.replaceAll('\\', '\\\\')

  return `OutFile "${escapedOutputPath}"
RequestExecutionLevel user
SilentInstall silent
Section
  ReadRegStr $0 HKCU "Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Uninstall\\\\${escapedRegistryKey}" "UninstallString"
  StrCmp $0 "" 0 run_uninstall
  ReadRegStr $0 HKLM "Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Uninstall\\\\${escapedRegistryKey}" "UninstallString"
  StrCmp $0 "" open_apps_features run_uninstall
open_apps_features:
  ExecShell "open" "ms-settings:appsfeatures"
  Quit
run_uninstall:
  ExecWait '$0'
SectionEnd
`
}

async function createUninstallLauncher({ rootDir, releaseDir, distDir, config }) {
  const makensisPath = await resolveMakensisPath()
  if (!makensisPath) {
    log('warn', 'NSIS compiler cache not found, skipping fallback launcher generation', {
      localAppData: process.env.LOCALAPPDATA ?? null,
    })
    return null
  }

  const uninstallTargetPath = path.join(distDir, 'Uninstall.exe')
  const launcherScriptPath = path.join(releaseDir, 'uninstall-launcher.nsi')
  const registryKey = getUninstallRegistryKey(config)
  const launcherScript = createUninstallLauncherScript({
    outputPath: uninstallTargetPath,
    registryKey,
  })

  await fs.mkdir(rootDir, { recursive: true })
  await fs.writeFile(launcherScriptPath, launcherScript, 'utf8')

  const compile = spawnSync(makensisPath, [launcherScriptPath], {
    cwd: rootDir,
    encoding: 'utf8',
  })

  if (compile.status !== 0) {
    log('warn', 'Fallback uninstaller launcher compilation failed', {
      stderr: compile.stderr?.trim() || null,
      stdout: compile.stdout?.trim() || null,
      registryKey,
    })
    return null
  }

  if (!(await exists(uninstallTargetPath))) {
    log('warn', 'Fallback uninstaller launcher did not create output file', {
      uninstallTargetPath,
      registryKey,
    })
    return null
  }

  return {
    kind: 'generated-launcher',
    path: uninstallTargetPath,
    source: 'nsis-fallback',
    registryKey,
    launcherScriptPath,
  }
}

export async function collectDesktopArtifacts(options = {}) {
  const rootDir = options.rootDir ?? process.cwd()
  const releaseDir = options.releaseDir ?? path.join(rootDir, 'release')
  const distDir = options.distDir ?? path.join(rootDir, 'dist')
  const config = await loadBuilderConfig(rootDir, releaseDir)
  const candidates = buildArtifactCandidates(releaseDir, config)

  await fs.mkdir(distDir, { recursive: true })

  const setupSource = await findFirstExistingPath(candidates.setup)
  if (!setupSource) {
    throw new Error(`Missing expected installer artifact. Checked: ${candidates.setup.join(', ')}`)
  }

  const appSource = (await findFirstExistingPath(candidates.portable)) ?? (await findFirstExistingPath(candidates.app))
  if (!appSource) {
    throw new Error(`Missing expected executable artifact. Checked: ${[...candidates.portable, ...candidates.app].join(', ')}`)
  }

  const setupTarget = await copyArtifact(setupSource, path.join(distDir, 'Setup.exe'))
  const appTarget = await copyArtifact(appSource, path.join(distDir, 'App.exe'))
  const updateManifestTarget = await copyOptionalArtifact(
    path.join(releaseDir, 'latest.yml'),
    path.join(distDir, 'latest.yml')
  )

  let uninstallResult = await discoverUninstaller(releaseDir, config)
  if (uninstallResult) {
    await copyArtifact(uninstallResult.path, path.join(distDir, 'Uninstall.exe'))
    uninstallResult = {
      ...uninstallResult,
      path: path.join(distDir, 'Uninstall.exe'),
    }
  } else {
    uninstallResult = await createUninstallLauncher({ rootDir, releaseDir, distDir, config })
  }

  const summary = {
    setup: setupTarget,
    app: appTarget,
    uninstaller: uninstallResult?.path ?? null,
    uninstallerStrategy: uninstallResult?.kind ?? 'missing',
    updateManifest: updateManifestTarget,
    config: {
      productName: config.productName,
      executableName: config.executableName,
      uninstallRegistryKey: getUninstallRegistryKey(config),
      effectiveConfigDetected: Boolean(config.effectiveConfig),
    },
  }

  log('info', 'Desktop artifacts collected', summary)
  if (!uninstallResult) {
    log('warn', 'Uninstaller was not produced and fallback launcher could not be generated', summary.config)
  }

  return summary
}

async function run() {
  await collectDesktopArtifacts()
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptFile) {
  run().catch((error) => {
    log('error', 'Desktop artifact collection failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    process.exit(1)
  })
}

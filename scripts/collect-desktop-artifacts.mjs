import fs from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const rootDir = process.cwd()
const releaseDir = path.join(rootDir, 'release')
const distDir = path.join(rootDir, 'dist')

const appSource = path.join(releaseDir, 'win-unpacked', 'App.exe')

async function exists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function findUninstallSource() {
  const candidates = [
    path.join(releaseDir, 'TriggerHubSetup.__uninstaller.exe'),
    path.join(releaseDir, 'Setup.__uninstaller.exe'),
    path.join(releaseDir, 'win-unpacked', 'Uninstall.exe'),
    path.join(releaseDir, '__uninstaller-nsis-App.exe'),
    path.join(releaseDir, '__uninstaller-nsis-TriggerHub 2.0.exe'),
  ]

  for (const candidate of candidates) {
    if (await exists(candidate)) {
      return candidate
    }
  }

  return null
}

async function copyArtifact(source, targetName) {
  if (!(await exists(source))) {
    throw new Error(`Missing expected artifact: ${source}`)
  }

  const target = path.join(distDir, targetName)
  await fs.copyFile(source, target)
  return target
}

async function copyOptionalArtifact(source, targetName) {
  if (!(await exists(source))) {
    return null
  }

  return copyArtifact(source, targetName)
}

async function resolveMakensisPath() {
  const localAppData = process.env.LOCALAPPDATA
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

async function createUninstallLauncher() {
  const makensisPath = await resolveMakensisPath()
  if (!makensisPath) {
    return false
  }

  const nsiPath = path.join(releaseDir, 'uninstall-launcher.nsi')
  const outPath = path.join(distDir, 'Uninstall.exe').replaceAll('\\', '\\\\')
  const uninstallKey = '5af6a952-cdef-5bea-b9c3-9df13d23be11'

  const script = `OutFile "${outPath}"
RequestExecutionLevel user
SilentInstall silent
Section
  ReadRegStr $0 HKCU "Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Uninstall\\\\${uninstallKey}" "UninstallString"
  StrCmp $0 "" 0 run_uninstall
  ReadRegStr $0 HKLM "Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Uninstall\\\\${uninstallKey}" "UninstallString"
  StrCmp $0 "" open_apps_features run_uninstall
open_apps_features:
  ExecShell "open" "ms-settings:appsfeatures"
  Quit
run_uninstall:
  ExecWait '$0'
SectionEnd
`

  await fs.writeFile(nsiPath, script, 'utf8')
  const compile = spawnSync(makensisPath, [nsiPath], { encoding: 'utf8' })
  if (compile.status !== 0) {
    console.warn(compile.stdout || '')
    console.warn(compile.stderr || '')
    return false
  }

  return exists(path.join(distDir, 'Uninstall.exe'))
}

async function run() {
  await fs.mkdir(distDir, { recursive: true })

  const setupCandidates = [
    path.join(releaseDir, 'TriggerHubSetup.exe'),
    path.join(releaseDir, 'Setup.exe'),
  ]
  let selectedSetupSource = null
  for (const candidate of setupCandidates) {
    if (await exists(candidate)) {
      selectedSetupSource = candidate
      break
    }
  }
  if (!selectedSetupSource) {
    throw new Error(`Missing expected artifact: ${setupCandidates.join(' or ')}`)
  }

  const setupTarget = await copyArtifact(selectedSetupSource, 'Setup.exe')
  const appTarget = await copyArtifact(appSource, 'App.exe')
  const uninstallSource = await findUninstallSource()
  const updateManifestTarget = await copyOptionalArtifact(path.join(releaseDir, 'latest.yml'), 'latest.yml')

  if (uninstallSource) {
    await copyArtifact(uninstallSource, 'Uninstall.exe')
    console.log(`Collected: ${setupTarget}`)
    console.log(`Collected: ${appTarget}`)
    console.log(`Collected: ${path.join(distDir, 'Uninstall.exe')}`)
    if (updateManifestTarget) {
      console.log(`Collected: ${updateManifestTarget}`)
    }
    return
  }

  const launcherCreated = await createUninstallLauncher()
  if (launcherCreated) {
    console.log(`Collected: ${setupTarget}`)
    console.log(`Collected: ${appTarget}`)
    console.log(`Collected: ${path.join(distDir, 'Uninstall.exe')}`)
    if (updateManifestTarget) {
      console.log(`Collected: ${updateManifestTarget}`)
    }
    return
  }

  console.warn('Uninstall.exe was not produced by packager output and fallback launcher generation failed.')
  console.log(`Collected: ${setupTarget}`)
  console.log(`Collected: ${appTarget}`)
  if (updateManifestTarget) {
    console.log(`Collected: ${updateManifestTarget}`)
  }
}

run().catch((error) => {
  console.error(error.message)
  process.exit(1)
})

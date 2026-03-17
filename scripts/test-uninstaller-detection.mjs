import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { collectDesktopArtifacts } from './collect-desktop-artifacts.mjs'

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8')
}

async function writeText(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, value, 'utf8')
}

async function createScenario(rootDir, options = {}) {
  const buildConfig = {
    appId: 'com.triggerhub.desktop',
    productName: 'TriggerHub 2.0',
    files: ['dist/**/*', 'electron/**/*', 'package.json'],
    win: {
      artifactName: 'TriggerHubSetup.exe',
      executableName: 'TriggerHub',
    },
    nsis: {
      guid: 'com.triggerhub.desktop',
    },
    ...(options.buildConfig ?? {}),
  }

  await writeJson(path.join(rootDir, 'package.json'), {
    name: 'triggerhub2',
    version: '0.1.1',
    build: buildConfig,
  })

  await writeText(path.join(rootDir, 'release', 'builder-effective-config.yaml'), 'productName: TriggerHub 2.0\n')
  await writeText(path.join(rootDir, 'release', 'latest.yml'), 'version: 0.1.1\n')
  await writeText(path.join(rootDir, 'release', 'TriggerHubSetup.exe'), 'setup')
  await writeText(path.join(rootDir, 'release', 'win-unpacked', 'TriggerHub.exe'), 'app')

  if (options.uninstallerPath) {
    await writeText(path.join(rootDir, 'release', options.uninstallerPath), 'uninstall')
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function runScenario(name, setup) {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), `triggerhub-${name}-`))

  try {
    await setup(tempRoot)
    const result = await collectDesktopArtifacts({ rootDir: tempRoot })
    return { rootDir: tempRoot, result }
  } catch (error) {
    await fs.rm(tempRoot, { recursive: true, force: true })
    throw error
  }
}

async function main() {
  const knownPathScenario = await runScenario('known-path', async (rootDir) => {
    await createScenario(rootDir, {
      uninstallerPath: 'TriggerHubSetup.__uninstaller.exe',
    })
  })

  assert(knownPathScenario.result.uninstallerStrategy === 'packager-output', 'Expected known-path uninstaller strategy')
  assert(await fs.stat(path.join(knownPathScenario.rootDir, 'dist', 'Uninstall.exe')), 'Expected copied uninstaller')

  const recursiveScanScenario = await runScenario('recursive-scan', async (rootDir) => {
    await createScenario(rootDir, {
      uninstallerPath: 'nested/output/custom-uninstall-helper.exe',
    })
  })

  assert(recursiveScanScenario.result.uninstallerStrategy === 'packager-output', 'Expected recursive-scan strategy')
  assert(await fs.stat(path.join(recursiveScanScenario.rootDir, 'dist', 'Uninstall.exe')), 'Expected recursive-scan copy')

  console.log('Uninstaller detection scenarios passed.')

  await fs.rm(knownPathScenario.rootDir, { recursive: true, force: true })
  await fs.rm(recursiveScanScenario.rootDir, { recursive: true, force: true })
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})

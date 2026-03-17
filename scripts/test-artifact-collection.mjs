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

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function main() {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'triggerhub-artifacts-'))

  try {
    await writeJson(path.join(rootDir, 'package.json'), {
      name: 'triggerhub2',
      version: '0.1.1',
      build: {
        appId: 'com.triggerhub.desktop',
        productName: 'TriggerHub 2.0',
        win: {
          artifactName: 'TriggerHubSetup.exe',
          executableName: 'TriggerHub',
        },
      },
    })

    await writeText(path.join(rootDir, 'release', 'TriggerHubSetup.exe'), 'setup')
    await writeText(path.join(rootDir, 'release', 'TriggerHubPortable.exe'), 'portable')
    await writeText(path.join(rootDir, 'release', 'latest.yml'), 'version: 0.1.1\n')
    await writeText(path.join(rootDir, 'release', '__uninstaller-nsis-TriggerHub.exe'), 'uninstall')

    const result = await collectDesktopArtifacts({ rootDir })
    const copiedApp = await fs.readFile(path.join(rootDir, 'dist', 'App.exe'), 'utf8')

    assert(result.setup.endsWith(path.join('dist', 'Setup.exe')), 'Expected dist setup artifact')
    assert(result.uninstallerStrategy === 'packager-output', 'Expected packager uninstaller strategy')
    assert(copiedApp === 'portable', 'Expected portable build to be preferred for the dist app artifact')

    console.log('Artifact collection scenarios passed.')
  } finally {
    await fs.rm(rootDir, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})

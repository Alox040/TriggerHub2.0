import { spawn } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const electronBinary = require('electron') as string
const typescriptModulePath = require.resolve('typescript')
const repoRoot = resolve(import.meta.dirname, '..', '..')
const mainModulePath = join(repoRoot, 'electron', 'main.cjs')
const bridgeSourcePath = join(repoRoot, 'src', 'storage', 'ipcStorageBridge.ts')
const blankHtml = '<!doctype html><html><body><div id="root"></div></body></html>'

const tempDirectories: string[] = []

const createTempDir = async (prefix: string): Promise<string> => {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  tempDirectories.push(dir)
  return dir
}

const runElectronRoundtrip = async (): Promise<unknown> => {
  const workDir = await createTempDir('triggerhub-electron-e2e-')
  const rendererPath = join(workDir, 'renderer.html')
  const runnerPath = join(workDir, 'runner.cjs')
  const userDataPath = join(workDir, 'user-data')

  await writeFile(rendererPath, blankHtml, 'utf-8')

const runnerSource = `
const { app } = require('electron')
const ts = require(${JSON.stringify(typescriptModulePath)})
const { readFile } = require('node:fs/promises')
const { bootMainProcess } = require(${JSON.stringify(mainModulePath)})

;(async () => {
  app.setPath('userData', ${JSON.stringify(userDataPath)})
  const mainWindow = await bootMainProcess({
    rendererPath: ${JSON.stringify(rendererPath)},
    show: false,
  })

  const source = await readFile(${JSON.stringify(bridgeSourcePath)}, 'utf-8')
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText

  const script = \`
    (() => {
      const module = { exports: {} }
      const exports = module.exports
      const runModule = new Function('module', 'exports', \${JSON.stringify(transpiled)})
      runModule(module, exports)

      return (async () => {
        const { IpcStorageBridge } = module.exports
        const bridge = new IpcStorageBridge()
        const payload = { hello: 'world', version: 1 }
        await bridge.save('e2e-storage-roundtrip', payload)
        return bridge.load('e2e-storage-roundtrip')
      })()
    })()
  \`

  const result = await mainWindow.webContents.executeJavaScript(script, true)
  console.log('E2E_RESULT:' + JSON.stringify(result))
  if (!mainWindow.isDestroyed()) {
    mainWindow.destroy()
  }
  app.exit(0)
})().catch(async (error) => {
  console.error(error && error.stack ? error.stack : String(error))
  app.exit(1)
})
`

  await writeFile(runnerPath, runnerSource, 'utf-8')

  return new Promise<unknown>((resolvePromise, rejectPromise) => {
    const child = spawn(electronBinary, [runnerPath], {
      cwd: repoRoot,
      env: {
        ...process.env,
        ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
        // ELECTRON_RUN_AS_NODE=1 (set by the VSCode/Vitest host) must be unset so
        // the spawned Electron binary initialises as a real Electron process and
        // exposes require('electron') as the Electron API rather than the npm shim.
        ELECTRON_RUN_AS_NODE: undefined,
        NODE_PATH: join(repoRoot, 'node_modules'),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    const timeout = setTimeout(() => {
      child.kill()
      rejectPromise(new Error(`Electron E2E timed out\n${stdout}\n${stderr}`))
    }, 15_000)

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', (error) => {
      clearTimeout(timeout)
      rejectPromise(error)
    })
    child.on('exit', (code) => {
      clearTimeout(timeout)
      if (code !== 0) {
        rejectPromise(new Error(`Electron E2E failed with code ${code}\n${stderr || stdout}`))
        return
      }

      const marker = stdout
        .split(/\r?\n/)
        .find((line) => line.startsWith('E2E_RESULT:'))

      if (!marker) {
        rejectPromise(new Error(`Electron E2E produced no result\n${stdout}\n${stderr}`))
        return
      }

      resolvePromise(JSON.parse(marker.slice('E2E_RESULT:'.length)))
    })
  })
}

describe('IPC storage bridge Electron E2E', () => {
  afterEach(async () => {
    await Promise.all(
      tempDirectories.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
    )
  })

  it(
    'persists and reloads data through the real Electron IPC channel',
    async () => {
      await expect(runElectronRoundtrip()).resolves.toEqual({
        hello: 'world',
        version: 1,
      })
    },
    30_000,
  )
})

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const packageJsonPath = path.join(projectRoot, 'package.json')
const publicDirPath = path.join(projectRoot, 'public')
const versionFilePath = path.join(publicDirPath, 'version.json')

const packageJsonContent = await readFile(packageJsonPath, 'utf8')
const packageJson = JSON.parse(packageJsonContent)

if (typeof packageJson.version !== 'string' || packageJson.version.trim().length === 0) {
  throw new Error('Cannot write version.json because package.json version is missing.')
}

const payload = {
  version: packageJson.version,
  builtAt: new Date().toISOString(),
}

await mkdir(publicDirPath, { recursive: true })
await writeFile(versionFilePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

console.log(`Wrote ${versionFilePath} with version ${payload.version}.`)

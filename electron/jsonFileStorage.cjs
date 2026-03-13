const { readFile, writeFile, mkdir } = require('node:fs/promises')
const path = require('node:path')

async function readJsonFile(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf-8'))
  } catch (err) {
    if (err.code === 'ENOENT') return null
    throw err
  }
}

async function writeJsonFile(filePath, data) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

module.exports = { readJsonFile, writeJsonFile }

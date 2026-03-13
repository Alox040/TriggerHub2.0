const path = require('node:path')
const { mkdir, writeFile } = require('node:fs/promises')

function resolveClipOutputPath(buffer, request, app) {
  const requestedOutputDir =
    request && typeof request.outputDir === 'string' && request.outputDir.length > 0
      ? request.outputDir
      : path.join(app.getPath('videos'), 'TriggerHub 2.0')

  return path.join(requestedOutputDir, `${buffer.id}.json`)
}

async function exportClipToFile(buffer, request, app) {
  const outputPath = resolveClipOutputPath(buffer, request, app)
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, JSON.stringify(buffer, null, 2), 'utf-8')

  return {
    clipId: buffer.id,
    path: outputPath,
  }
}

module.exports = {
  exportClipToFile,
}

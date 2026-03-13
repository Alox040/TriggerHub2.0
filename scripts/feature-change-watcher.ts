import chokidar from "chokidar"
import { exec } from "child_process"
import path from "path"

const ROOT = process.cwd()

const watchedPaths = [
  path.join(ROOT, "project-meta"),
  path.join(ROOT, "releases"),
  path.join(ROOT, "docs/public")
]

function runContentSync() {
  console.log("Feature change detected → running content sync")

  exec("npm run website:sync", (err, stdout, stderr) => {
    if (err) {
      console.error("Content sync failed")
      console.error(stderr)
      return
    }

    console.log(stdout)
  })
}

const watcher = chokidar.watch(watchedPaths, {
  persistent: true,
  ignoreInitial: true
})

watcher.on("add", runContentSync)
watcher.on("change", runContentSync)
watcher.on("unlink", runContentSync)

console.log("Watching project metadata for changes...")
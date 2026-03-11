import chokidar from "chokidar";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

const watchedDirs = ["project-meta", "releases", "docs/public"];
const rootDir = process.cwd();

let syncInProgress = false;
let rerunRequested = false;

async function ensureWatchedDirs(): Promise<void> {
  await Promise.all(
    watchedDirs.map((relativeDir) =>
      mkdir(path.join(rootDir, relativeDir), { recursive: true }),
    ),
  );
}

function runContentSync(): void {
  if (syncInProgress) {
    rerunRequested = true;
    return;
  }

  syncInProgress = true;
  const child = spawn("npm", ["run", "website:sync"], {
    cwd: rootDir,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", () => {
    syncInProgress = false;
    if (rerunRequested) {
      rerunRequested = false;
      runContentSync();
    }
  });
}

async function main(): Promise<void> {
  await ensureWatchedDirs();
  const watcher = chokidar.watch(watchedDirs, {
    cwd: rootDir,
    ignoreInitial: true,
  });

  watcher.on("all", (eventName, changedPath) => {
    console.log(`[watch:features] ${eventName} ${changedPath}`);
    runContentSync();
  });

  console.log("Feature change watcher active.");
  console.log("Watching: project-meta/, releases/, docs/public/");
}

main().catch((error: unknown) => {
  console.error("Feature watcher failed to start:", error);
  process.exit(1);
});

const { access, mkdir, readFile, readdir, stat, writeFile } = require("node:fs/promises");
const path = require("node:path");
const { constants } = require("node:fs");

async function exists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function safeReadJson(filePath) {
  try {
    return await readJson(filePath);
  } catch {
    return null;
  }
}

async function listFilesRecursive(dirPath) {
  const out = [];
  const entries = await readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const nested = await listFilesRecursive(fullPath);
      out.push(...nested);
    } else {
      out.push(fullPath);
    }
  }

  return out;
}

async function findFirstExe(dirPath) {
  const files = await listFilesRecursive(dirPath);
  return files.find((f) => f.toLowerCase().endsWith(".exe")) ?? null;
}

async function writeTextFile(filePath, content) {
  const dir = path.dirname(filePath);
  await ensureDir(dir);
  await writeFile(filePath, content, "utf8");
}

async function isDirectory(dirPath) {
  try {
    const fileStat = await stat(dirPath);
    return fileStat.isDirectory();
  } catch {
    return false;
  }
}

module.exports = { exists, ensureDir, readJson, safeReadJson, findFirstExe, writeTextFile, isDirectory };

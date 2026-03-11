import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const projectMetaDir = path.join(rootDir, "project-meta");
const releasesDir = path.join(rootDir, "releases");
const outputDir = path.join(rootDir, "website", "src", "content", "generated");

async function readJson(filePath: string, fallback: unknown): Promise<unknown> {
  try {
    const raw = await readFile(filePath, "utf8");
    if (!raw.trim()) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function readJsonFilesFromDir(dirPath: string): Promise<unknown[]> {
  try {
    const entries = await readdir(dirPath);
    const jsonFiles = entries.filter((entry) => entry.endsWith(".json")).sort();
    const values = await Promise.all(
      jsonFiles.map(async (fileName) => {
        const fullPath = path.join(dirPath, fileName);
        const value = await readJson(fullPath, {});
        return {
          id: path.basename(fileName, ".json"),
          ...((value as Record<string, unknown>) ?? {}),
        };
      }),
    );
    return values;
  } catch {
    return [];
  }
}

async function safeReadObject(filePath: string): Promise<Record<string, unknown>> {
  const data = await readJson(filePath, {});
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return {};
}

async function exists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function writeOutput(fileName: string, data: unknown): Promise<void> {
  const filePath = path.join(outputDir, fileName);
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function run(): Promise<void> {
  await mkdir(outputDir, { recursive: true });

  const features = await readJsonFilesFromDir(path.join(projectMetaDir, "features"));
  const integrations = await readJsonFilesFromDir(path.join(projectMetaDir, "integrations"));
  const platformSupport = await safeReadObject(
    path.join(projectMetaDir, "status", "platform-support.json"),
  );

  const changelogSourcePath = path.join(releasesDir, "changelog-source.json");
  const changelog = (await exists(changelogSourcePath))
    ? await readJson(changelogSourcePath, [])
    : [];

  await writeOutput("features.json", features);
  await writeOutput("integrations.json", integrations);
  await writeOutput("platform-support.json", platformSupport);
  await writeOutput("changelog.json", changelog);

  console.log("Website content generated:");
  console.log("- website/src/content/generated/features.json");
  console.log("- website/src/content/generated/integrations.json");
  console.log("- website/src/content/generated/platform-support.json");
  console.log("- website/src/content/generated/changelog.json");
}

run().catch((error: unknown) => {
  console.error("Failed to generate website content:", error);
  process.exit(1);
});

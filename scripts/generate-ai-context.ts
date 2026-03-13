import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const docsDir = path.join(root, "docs");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function safeRun(command: string): { ok: boolean; output: string } {
  try {
    const output = execSync(command, {
      cwd: root,
      stdio: "pipe",
      encoding: "utf-8",
    });
    return { ok: true, output: output.trim() || "OK" };
  } catch (error: any) {
    const stdout = error?.stdout?.toString?.() ?? "";
    const stderr = error?.stderr?.toString?.() ?? "";
    return {
      ok: false,
      output: `${stdout}\n${stderr}`.trim() || "Fehlgeschlagen",
    };
  }
}

function listTopLevelEntries(): string[] {
  return fs.readdirSync(root).sort();
}

function exists(relPath: string): boolean {
  return fs.existsSync(path.join(root, relPath));
}

function writeFile(relPath: string, content: string) {
  const fullPath = path.join(root, relPath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content, "utf-8");
}

function nowIso(): string {
  return new Date().toISOString();
}

function makeStatusBlock(title: string, result: { ok: boolean; output: string }): string {
  return [
    `## ${title}`,
    ``,
    `**Status:** ${result.ok ? "OK" : "Fehlgeschlagen"}`,
    ``,
    "```text",
    result.output || "Keine Ausgabe",
    "```",
    "",
  ].join("\n");
}

function main() {
  ensureDir(docsDir);

  const typecheck = safeRun("npm run typecheck");
  const build = safeRun("npm run build");
  const test = safeRun("npm run test");

  const websiteBuild = exists("website/package.json")
    ? safeRun("npm --prefix website run build")
    : { ok: false, output: "website/package.json nicht gefunden" };

  const rootEntries = listTopLevelEntries();

  const snapshot = [
    "# PROJECT_SNAPSHOT",
    "",
    `Aktualisiert: ${nowIso()}`,
    "",
    "## Projektwurzel",
    "",
    ...rootEntries.map((entry) => `- ${entry}`),
    "",
    "## Kurzbewertung",
    "",
    `- Typecheck: ${typecheck.ok ? "OK" : "Fehlgeschlagen"}`,
    `- Build: ${build.ok ? "OK" : "Fehlgeschlagen"}`,
    `- Tests: ${test.ok ? "OK" : "Fehlgeschlagen"}`,
    `- Website-Build: ${websiteBuild.ok ? "OK" : "Fehlgeschlagen"}`,
    "",
  ].join("\n");

  const devStatus = [
    "# DEV_STATUS",
    "",
    `Aktualisiert: ${nowIso()}`,
    "",
    makeStatusBlock("Root Typecheck", typecheck),
    makeStatusBlock("Root Build", build),
    makeStatusBlock("Root Tests", test),
    makeStatusBlock("Website Build", websiteBuild),
  ].join("\n");

  const brief = [
    "# AI_CONTEXT_BRIEF",
    "",
    `Aktualisiert: ${nowIso()}`,
    "",
    "## Projektstatus",
    "",
    `- Typecheck: ${typecheck.ok ? "OK" : "Fehlgeschlagen"}`,
    `- Build: ${build.ok ? "OK" : "Fehlgeschlagen"}`,
    `- Tests: ${test.ok ? "OK" : "Fehlgeschlagen"}`,
    `- Website-Build: ${websiteBuild.ok ? "OK" : "Fehlgeschlagen"}`,
    "",
    "## Wichtige Pfade",
    "",
    "- src/",
    "- website/",
    "- agents/",
    "- docs/",
    "- scripts/",
    "- .github/workflows/",
    "",
  ].join("\n");

  const full = [
    "# AI_CONTEXT_FULL",
    "",
    `Aktualisiert: ${nowIso()}`,
    "",
    "## Repository-Übersicht",
    "",
    ...rootEntries.map((entry) => `- ${entry}`),
    "",
    "## Technischer Status",
    "",
    makeStatusBlock("Root Typecheck", typecheck),
    makeStatusBlock("Root Build", build),
    makeStatusBlock("Root Tests", test),
    makeStatusBlock("Website Build", websiteBuild),
  ].join("\n");

  writeFile("docs/PROJECT_SNAPSHOT.md", snapshot);
  writeFile("docs/DEV_STATUS.md", devStatus);
  writeFile("docs/AI_CONTEXT_BRIEF.md", brief);
  writeFile("docs/AI_CONTEXT_FULL.md", full);

  if (!exists("docs/PROJECT_DEEP_SNAPSHOT.md")) {
    writeFile(
      "docs/PROJECT_DEEP_SNAPSHOT.md",
      `# PROJECT_DEEP_SNAPSHOT\n\nAktualisiert: ${nowIso()}\n\nTiefe Analyse folgt in der nächsten Ausbaustufe.\n`
    );
  }

  if (!exists("docs/AGENT_SYSTEM_MAP.md")) {
    writeFile(
      "docs/AGENT_SYSTEM_MAP.md",
      `# AGENT_SYSTEM_MAP\n\nAktualisiert: ${nowIso()}\n\nAgentenstruktur wird in der nächsten Ausbaustufe automatisch erfasst.\n`
    );
  }

  console.log("AI-Kontextdateien wurden aktualisiert.");
}

main();
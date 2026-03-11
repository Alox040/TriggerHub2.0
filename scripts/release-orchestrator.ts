import { spawnSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

type PipelineStep = {
  name:
    | "Content Sync"
    | "Project Checks"
    | "Quality Gates"
    | "Security Audit Gate"
    | "Website Build"
    | "Release Preparation";
  run: () => Promise<void>;
};

const rootDir = process.cwd();

async function assertJsonFile(relativePath: string): Promise<void> {
  const absolutePath = path.join(rootDir, relativePath);
  const raw = await readFile(absolutePath, "utf8");
  JSON.parse(raw);
}

async function assertMarkdownIncludes(relativePath: string, requiredSnippets: string[]): Promise<void> {
  const absolutePath = path.join(rootDir, relativePath);
  const raw = await readFile(absolutePath, "utf8");

  for (const snippet of requiredSnippets) {
    if (!raw.includes(snippet)) {
      throw new Error(`Missing required content in ${relativePath}: ${snippet}`);
    }
  }
}

function runCommand(command: string, args: string[]): void {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: true,
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

async function assertPathExists(relativePath: string): Promise<void> {
  const absolutePath = path.join(rootDir, relativePath);
  await access(absolutePath);
}

const pipeline: PipelineStep[] = [
  {
    name: "Content Sync",
    run: async () => {
      runCommand("npm", ["run", "website:sync"]);
    },
  },
  {
    name: "Project Checks",
    run: async () => {
      await assertPathExists("project-meta");
      await assertPathExists("releases");
      await assertPathExists("scripts/generate-website-content.ts");
      await assertPathExists("agents/40-release-agent.md");
      await assertPathExists("agents/20-content-sync-agent.md");
      await assertPathExists("agents/core/40-security-audit-agent.md");
      await assertPathExists("agents/optional/10-snapshot.md");
      await assertPathExists(".github/workflows/release.yml");
    },
  },
  {
    name: "Quality Gates",
    run: async () => {
      runCommand("npm", ["run", "typecheck"]);
      runCommand("npm", ["run", "test"]);
      runCommand("npm", ["run", "build"]);
    },
  },
  {
    name: "Security Audit Gate",
    run: async () => {
      await assertPathExists("project-context/security-reports");
      await assertPathExists("project-context/security-reports/security-review-report.md");
      await assertPathExists("project-context/security-reports/security-hardening-plan.md");
      await assertPathExists("project-context/security-reports/security-rebuild-input.md");
      await assertMarkdownIncludes("project-context/security-reports/security-review-report.md", [
        "Executive Summary",
        "Scope",
        "Findings",
        "Quick Wins",
        "Release Gate",
      ]);
      await assertMarkdownIncludes("project-context/security-reports/security-hardening-plan.md", [
        "Security Hardening Plan",
      ]);
      await assertMarkdownIncludes("project-context/security-reports/security-rebuild-input.md", [
        "Security Rebuild Input",
      ]);
    },
  },
  {
    name: "Website Build",
    run: async () => {
      runCommand("npm", ["--prefix", "website", "run", "build"]);
    },
  },
  {
    name: "Release Preparation",
    run: async () => {
      await assertPathExists("releases/release-manifest.json");
      await assertPathExists("releases/changelog-source.json");
      await assertPathExists("project-meta/status/release-status.json");
      await assertJsonFile("releases/release-manifest.json");
      await assertJsonFile("releases/changelog-source.json");
      await assertJsonFile("project-meta/status/release-status.json");
    },
  },
];

async function main(): Promise<void> {
  console.log("Release pipeline order:");
  pipeline.forEach((step, index) => {
    console.log(`${index + 1}. ${step.name}`);
  });

  for (const step of pipeline) {
    console.log(`\n[release:validate] Running: ${step.name}`);
    await step.run();
  }

  console.log("\nRelease validation completed successfully.");
}

main().catch((error: unknown) => {
  console.error("Release validation failed:", error);
  process.exit(1);
});

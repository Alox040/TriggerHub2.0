import fs from "node:fs";
import path from "node:path";

type TreeNode = {
  name: string;
  type: "file" | "directory";
  children?: TreeNode[];
};

type WorkflowSummary = {
  name: string;
  path: string;
  triggers: string[];
  jobCount: number;
};

type ModuleSummary = {
  name: string;
  path: string;
  role: string;
  status: "implemented" | "partial" | "missing";
};

type FeatureMetadata = {
  slug: string;
  path: string;
  name: string;
  status: string;
  summary?: string;
  sourceOfTruth?: string[];
  includes?: string[];
  notes?: string[];
  currentBehavior?: string[];
  supportedStepTypes?: string[];
};

type ServiceSummary = {
  slug: string;
  name: string;
  path: string;
  status: "implemented" | "partial" | "missing";
  metadataStatus?: string;
};

type BuildStatus = {
  updatedAt: string;
  gates: Record<string, string>;
  blockers: string[];
  sourceOfTruth?: string[];
};

type Roadmap = {
  updatedAt?: string;
  items?: Array<{
    id: string;
    status: string;
    summary: string;
    sourceOfTruth?: string[];
  }>;
};

type IntegrationMetadata = {
  name: string;
  status?: string;
};

const rootDir = process.cwd();
const docsDir = path.join(rootDir, "docs");
const agentsProjectContextDir = path.join(rootDir, "agents", "project-context");
const aiContextPackPath = path.join(docsDir, "AI_CONTEXT_PACK.json");
const projectContextSnapshotPath = path.join(docsDir, "project-context-snapshot.json");
const deepSnapshotSourcePath = path.join(docsDir, "PROJECT_DEEP_SNAPSHOT.md");
const deepSnapshotMirrorPath = path.join(agentsProjectContextDir, "project_snapshot_deep.md");
const ignoredNames = new Set([
  ".git",
  ".idea",
  ".vscode",
  "node_modules",
  "dist",
  "release",
  "releases",
  "out",
  "coverage",
  ".turbo",
]);
const keyPaths = [
  ".github/workflows",
  "agents",
  "docs",
  "scripts",
  "src",
  "website",
  "electron",
  "tests",
  "project-context",
  "project-meta",
];

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function exists(relativePath: string): boolean {
  return fs.existsSync(path.join(rootDir, relativePath));
}

function detectStatusForPath(relativePath: string): "implemented" | "partial" | "missing" {
  if (!exists(relativePath)) {
    return "missing";
  }

  const absolutePath = path.join(rootDir, relativePath);
  if (fs.statSync(absolutePath).isDirectory() && fs.readdirSync(absolutePath).length === 0) {
    return "partial";
  }

  return "implemented";
}

function listTree(relativePath: string, depth: number): TreeNode | null {
  const absolutePath = path.join(rootDir, relativePath);

  if (!fs.existsSync(absolutePath)) {
    return null;
  }

  if (!fs.statSync(absolutePath).isDirectory()) {
    return {
      name: relativePath.replace(/\\/g, "/"),
      type: "file",
    };
  }

  const children = depth <= 0
    ? []
    : fs.readdirSync(absolutePath, { withFileTypes: true })
        .filter((entry) => !ignoredNames.has(entry.name))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((entry) => {
          const childRelativePath = path.posix.join(relativePath.replace(/\\/g, "/"), entry.name);
          if (entry.isDirectory()) {
            return listTree(childRelativePath, depth - 1);
          }

          return {
            name: entry.name,
            type: "file" as const,
          };
        })
        .filter((entry): entry is TreeNode => entry !== null);

  return {
    name: relativePath.replace(/\\/g, "/"),
    type: "directory",
    children,
  };
}

function listTopLevelEntries(): string[] {
  return fs.readdirSync(rootDir, { withFileTypes: true })
    .filter((entry) => !ignoredNames.has(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function collectWorkflowSummaries(): WorkflowSummary[] {
  const workflowsDir = path.join(rootDir, ".github", "workflows");
  if (!fs.existsSync(workflowsDir)) {
    return [];
  }

  return fs.readdirSync(workflowsDir)
    .filter((fileName) => fileName.endsWith(".yml") || fileName.endsWith(".yaml"))
    .sort((a, b) => a.localeCompare(b))
    .map((fileName) => {
      const relativePath = path.posix.join(".github/workflows", fileName);
      const content = fs.readFileSync(path.join(workflowsDir, fileName), "utf8");
      const triggers = Array.from(content.matchAll(/^\s{0,4}([A-Za-z_][A-Za-z0-9_-]*):\s*$/gm))
        .map((match) => match[1])
        .filter((value) => ["push", "pull_request", "workflow_dispatch", "schedule", "release"].includes(value));
      const jobCountMatch = content.match(/^jobs:\s*$(?<jobs>[\s\S]*)/m);
      const jobCount = jobCountMatch?.groups?.jobs
        ? Array.from(jobCountMatch.groups.jobs.matchAll(/^\s{2}([A-Za-z0-9_-]+):\s*$/gm)).length
        : 0;

      return {
        name: fileName,
        path: relativePath,
        triggers: [...new Set(triggers)],
        jobCount,
      };
    });
}

function collectAgentSystemInfo() {
  const canonicalDir = path.join(rootDir, "agents");
  const legacyDir = path.join(rootDir, "agent");
  const agentRelativePaths = fs.existsSync(canonicalDir)
    ? fs.readdirSync(canonicalDir, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
        .map((entry) => {
          const parentPath = entry.parentPath
            ? path.relative(rootDir, entry.parentPath).replace(/\\/g, "/")
            : "agents";

          return `${parentPath}/${entry.name}`.replace(/^\.\/?/, "");
        })
        .sort((a, b) => a.localeCompare(b))
    : [];

  return {
    canonicalPath: "agents/",
    canonicalAgentFileCount: agentRelativePaths.length,
    legacyPath: "agent/",
    legacyPathExists: fs.existsSync(legacyDir),
    legacyAgentTreeExists: exists("agent/agents"),
    agents: agentRelativePaths,
    contextFilesPresent: [
      "agents/project-context/project_snapshot.md",
      "agents/project-context/architecture-overview.md",
      "agents/system/context-template.md",
      "agents/15-context-snapshot-agent.md",
    ].filter((relativePath) => exists(relativePath)),
  };
}

function collectMetadata(packageJson: Record<string, unknown>) {
  const scripts = (packageJson.scripts ?? {}) as Record<string, string>;
  const dependencies = Object.keys((packageJson.dependencies ?? {}) as Record<string, string>).sort();
  const devDependencies = Object.keys((packageJson.devDependencies ?? {}) as Record<string, string>).sort();

  return {
    name: packageJson.name ?? "unknown",
    version: packageJson.version ?? "0.0.0",
    private: packageJson.private ?? false,
    packageManager: fs.existsSync(path.join(rootDir, "package-lock.json")) ? "npm" : "unknown",
    availableScripts: Object.keys(scripts).sort(),
    keyDependencies: {
      runtime: dependencies,
      development: devDependencies,
    },
  };
}

function collectModuleSummaries(): ModuleSummary[] {
  return [
    {
      name: "desktop-runtime",
      path: "src/",
      role: "Desktop React runtime, app composition root, and automation domain.",
      status: detectStatusForPath("src"),
    },
    {
      name: "electron-shell",
      path: "electron/",
      role: "Electron main-process and preload shell for the desktop target.",
      status: detectStatusForPath("electron"),
    },
    {
      name: "website-runtime",
      path: "website/",
      role: "Website routing, auth, access-control, and profile surface.",
      status: detectStatusForPath("website"),
    },
    {
      name: "workflow-automation",
      path: "scripts/",
      role: "Automation scripts for releases, content sync, and context generation.",
      status: detectStatusForPath("scripts"),
    },
    {
      name: "agent-system",
      path: "agents/",
      role: "Agent prompts, orchestration, and project-context control plane.",
      status: detectStatusForPath("agents"),
    },
    {
      name: "metadata-plane",
      path: "project-meta/",
      role: "Structured product, roadmap, feature, and integration metadata.",
      status: detectStatusForPath("project-meta"),
    },
  ];
}

function collectBuildStatus(): BuildStatus {
  return readJson<BuildStatus>(path.join(rootDir, "project-meta", "status", "build-status.json"));
}

function collectRoadmap(): Roadmap {
  return readJson<Roadmap>(path.join(rootDir, "project-meta", "status", "roadmap.json"));
}

function collectFeatureMetadata(): FeatureMetadata[] {
  const featuresDir = path.join(rootDir, "project-meta", "features");
  if (!fs.existsSync(featuresDir)) {
    return [];
  }

  return fs.readdirSync(featuresDir)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b))
    .map((fileName) => {
      const absolutePath = path.join(featuresDir, fileName);
      const relativePath = path.posix.join("project-meta/features", fileName);
      const raw = readJson<Record<string, unknown>>(absolutePath);
      const slug = fileName.replace(/\.json$/, "");

      return {
        slug,
        path: relativePath,
        name: String(raw.name ?? slug),
        status: String(raw.status ?? "unknown"),
        summary: typeof raw.summary === "string" ? raw.summary : undefined,
        sourceOfTruth: Array.isArray(raw.sourceOfTruth)
          ? raw.sourceOfTruth.filter((value): value is string => typeof value === "string")
          : undefined,
        includes: Array.isArray(raw.includes)
          ? raw.includes.filter((value): value is string => typeof value === "string")
          : undefined,
        notes: Array.isArray(raw.notes)
          ? raw.notes.filter((value): value is string => typeof value === "string")
          : undefined,
        currentBehavior: Array.isArray(raw.currentBehavior)
          ? raw.currentBehavior.filter((value): value is string => typeof value === "string")
          : undefined,
        supportedStepTypes: Array.isArray(raw.supportedStepTypes)
          ? raw.supportedStepTypes.filter((value): value is string => typeof value === "string")
          : undefined,
      };
    });
}

function collectIntegrationMetadata(): Record<string, IntegrationMetadata> {
  const integrationsDir = path.join(rootDir, "project-meta", "integrations");
  if (!fs.existsSync(integrationsDir)) {
    return {};
  }

  const pairs = fs.readdirSync(integrationsDir)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b))
    .map((fileName) => {
      const key = fileName.replace(/\.json$/, "");
      const raw = readJson<Record<string, unknown>>(path.join(integrationsDir, fileName));
      return [key, {
        name: typeof raw.name === "string" ? raw.name : key,
        status: typeof raw.status === "string" ? raw.status : undefined,
      }] as const;
    });

  return Object.fromEntries(pairs);
}

function humanizeSlug(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function collectServiceSummaries(integrationMetadata: Record<string, IntegrationMetadata>): ServiceSummary[] {
  const servicesDir = path.join(rootDir, "src", "services");
  if (!fs.existsSync(servicesDir)) {
    return [];
  }

  return fs.readdirSync(servicesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "shared")
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => {
      const slug = entry.name.replace(/-service$/, "");
      return {
        slug,
        name: humanizeSlug(slug),
        path: path.posix.join("src/services", entry.name),
        status: detectStatusForPath(path.posix.join("src/services", entry.name)),
        metadataStatus: integrationMetadata[slug]?.status,
      };
    });
}

function collectArchitectureSnapshot(workflows: WorkflowSummary[], services: ServiceSummary[]) {
  const serviceNames = services.map((service) => service.name);

  return {
    project: {
      runtimeTargets: ["windows-desktop", "website"],
      compositionRootPath: "src/app/bootstrap.ts",
      compositionRootPresent: exists("src/app/bootstrap.ts"),
    },
    subsystems: [
      {
        name: "event-system",
        path: "src/core/event-bus",
        summary: "In-memory event bus with direct and wildcard topic subscriptions.",
        status: detectStatusForPath("src/core/event-bus"),
      },
      {
        name: "trigger-engine",
        path: "src/core/trigger-engine",
        summary: "Trigger graph lookup, condition evaluation, and action dispatch.",
        status: detectStatusForPath("src/core/trigger-engine"),
      },
      {
        name: "macro-system",
        path: "src/core/macro-system",
        summary: "Sequence, conditional, parallel, and nested macro execution.",
        status: detectStatusForPath("src/core/macro-system"),
      },
      {
        name: "service-layer",
        path: "src/services",
        summary: `Desktop service adapters currently present in code: ${serviceNames.join(", ")}.`,
        status: detectStatusForPath("src/services"),
      },
      {
        name: "plugin-layer",
        path: "src/plugins",
        summary: "Plugin registry and default example plugin bootstrap.",
        status: detectStatusForPath("src/plugins"),
      },
      {
        name: "desktop-ui",
        path: "src/ui",
        summary: "Desktop UI components, pages, and layout state.",
        status: detectStatusForPath("src/ui"),
      },
      {
        name: "website-ui",
        path: "website/src",
        summary: "Website routing, auth, prelaunch gate, and profile modules.",
        status: detectStatusForPath("website/src"),
      },
    ],
    serviceAdapters: services,
    workflowSurface: workflows.map((workflow) => workflow.path),
  };
}

function buildBaseRisks(
  buildStatus: BuildStatus,
  agentSystem: ReturnType<typeof collectAgentSystemInfo>,
  featureMetadata: FeatureMetadata[],
  services: ServiceSummary[],
): string[] {
  const risks: string[] = [];

  const failingGates = Object.entries(buildStatus.gates)
    .filter(([, status]) => status !== "pass")
    .map(([gate, status]) => `${gate}=${status}`);

  if (failingGates.length > 0) {
    risks.push(`Build-status gates are not all green: ${failingGates.join(", ")}.`);
  }

  for (const blocker of buildStatus.blockers) {
    risks.push(`Build blocker from project-meta/status/build-status.json: ${blocker}`);
  }

  if (agentSystem.legacyPathExists || agentSystem.legacyAgentTreeExists) {
    risks.push("Legacy `agent/` references still exist and can cause agent-system drift against the canonical `agents/` tree.");
  }

  const featureFilesWithoutStatus = featureMetadata.filter((feature) => feature.status.trim().length === 0);
  if (featureFilesWithoutStatus.length > 0) {
    risks.push(`Some feature metadata entries are missing a status: ${featureFilesWithoutStatus.map((feature) => feature.path).join(", ")}.`);
  }

  const metadataDriftServices = services.filter((service) => service.metadataStatus === "not_implemented");
  for (const service of metadataDriftServices) {
    risks.push(`Integration metadata for ${service.name} is stale: ${service.path} exists in code, but project-meta still marks it as not implemented.`);
  }

  return [...new Set(risks)];
}

function buildCurrentRisks(
  baseRisks: string[],
  roadmap: Roadmap,
): string[] {
  const risks = [...baseRisks];

  const openRoadmapItems = (roadmap.items ?? []).filter((item) => item.status !== "completed");
  if (openRoadmapItems.length === 0 && risks.length === 0) {
    risks.push("No active blockers are recorded in build-status.json, but roadmap and context artifacts still need regular refresh to avoid drift.");
  }

  return [...new Set(risks)];
}

function buildNextPriorities(
  roadmap: Roadmap,
  currentRisks: string[],
): string[] {
  const priorities: string[] = [
    "Regenerate `docs/AI_CONTEXT_PACK.json` and `docs/project-context-snapshot.json` after code, workflow, package, or metadata changes.",
  ];

  for (const item of (roadmap.items ?? []).filter((entry) => entry.status !== "completed")) {
    priorities.push(`${item.summary} [${item.status}]`);
  }

  if (currentRisks.some((risk) => risk.includes("Integration metadata"))) {
    priorities.push("Align `project-meta/integrations/*` with the actual service implementations under `src/services/`.");
  }

  return [...new Set(priorities)];
}

function buildDevelopmentPriorities(
  buildStatus: BuildStatus,
  roadmap: Roadmap,
  currentRisks: string[],
): string[] {
  const priorities: string[] = [];

  const failingGates = Object.entries(buildStatus.gates).filter(([, status]) => status !== "pass");
  if (failingGates.length > 0) {
    priorities.push(`Address failing build-status gates first: ${failingGates.map(([gate, status]) => `${gate}=${status}`).join(", ")}.`);
  }

  for (const item of (roadmap.items ?? []).filter((entry) => entry.status === "in_progress" || entry.status === "planned")) {
    priorities.push(item.summary);
  }

  if (currentRisks.some((risk) => risk.includes("Legacy `agent/` references"))) {
    priorities.push("Remove remaining legacy `agent/` references so context generation uses only the canonical `agents/` tree.");
  }

  if (currentRisks.some((risk) => risk.includes("Integration metadata"))) {
    priorities.push("Update integration metadata and generated context artifacts to reflect the actual runtime services.");
  }

  priorities.push("Keep build-status and feature metadata current so generated context artifacts stay aligned with the repository.");
  return [...new Set(priorities)];
}

function main(): void {
  ensureDir(docsDir);
  ensureDir(agentsProjectContextDir);

  const packageJson = readJson<Record<string, unknown>>(path.join(rootDir, "package.json"));
  const metadata = collectMetadata(packageJson);
  const buildStatus = collectBuildStatus();
  const roadmap = collectRoadmap();
  const workflows = collectWorkflowSummaries();
  const agentSystem = collectAgentSystemInfo();
  const featureMetadata = collectFeatureMetadata();
  const integrationMetadata = collectIntegrationMetadata();
  const services = collectServiceSummaries(integrationMetadata);
  const architecture = collectArchitectureSnapshot(workflows, services);
  const modules = collectModuleSummaries();
  const structure = {
    topLevelEntries: listTopLevelEntries(),
    keyPaths: keyPaths
      .filter((relativePath) => exists(relativePath))
      .map((relativePath) => ({
        path: relativePath.replace(/\\/g, "/"),
        tree: listTree(relativePath, 2),
      })),
  };
  const currentRisks = buildCurrentRisks(
    buildBaseRisks(buildStatus, agentSystem, featureMetadata, services),
    roadmap,
  );
  const nextPriorities = buildNextPriorities(roadmap, currentRisks);
  const developmentPriorities = buildDevelopmentPriorities(buildStatus, roadmap, currentRisks);

  const aiContextPack = {
    updatedAt: new Date().toISOString(),
    project: {
      ...metadata,
      buildStatus,
    },
    contextSnapshot: {
      projectStructure: structure,
      agentSystem,
      workflows,
      buildStatus,
      activeFeatures: featureMetadata,
      detectedServices: services,
      risks: currentRisks,
      nextPriorities,
    },
  };

  const projectContextSnapshot = {
    updatedAt: new Date().toISOString(),
    buildStatus,
    architecture,
    modules,
    activeFeatures: featureMetadata,
    detectedServices: services,
    agentSystemOverview: {
      canonicalPath: agentSystem.canonicalPath,
      canonicalAgentFileCount: agentSystem.canonicalAgentFileCount,
      agents: agentSystem.agents,
      workflowIntegration: [
        "agents/master-orchestrator.md",
        "agents/15-context-snapshot-agent.md",
        "agents/25-context-sync-agent.md",
        ".github/workflows/context-sync.yml",
      ].filter((relativePath) => exists(relativePath)),
    },
    currentRisks,
    developmentPriorities,
  };

  fs.writeFileSync(aiContextPackPath, `${JSON.stringify(aiContextPack, null, 2)}\n`, "utf8");
  fs.writeFileSync(projectContextSnapshotPath, `${JSON.stringify(projectContextSnapshot, null, 2)}\n`, "utf8");
  if (fs.existsSync(deepSnapshotSourcePath)) {
    fs.writeFileSync(deepSnapshotMirrorPath, fs.readFileSync(deepSnapshotSourcePath, "utf8"), "utf8");
    console.log(`Updated ${path.relative(rootDir, deepSnapshotMirrorPath).replace(/\\/g, "/")}`);
  }
  console.log(`Updated ${path.relative(rootDir, aiContextPackPath).replace(/\\/g, "/")}`);
  console.log(`Updated ${path.relative(rootDir, projectContextSnapshotPath).replace(/\\/g, "/")}`);
}

main();

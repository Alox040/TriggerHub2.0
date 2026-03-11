import { spawnSync } from "node:child_process";

const pipeline: Array<{ name: string; command: string; args: string[] }> = [
  { name: "Release Validation", command: "npm", args: ["run", "release:validate"] },
  { name: "Desktop Release", command: "npm", args: ["run", "desktop:release"] },
];

function runCommand(command: string, args: string[]): void {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

async function main(): Promise<void> {
  console.log("Running registered release pipeline:");

  for (const step of pipeline) {
    console.log(`\n[release] ${step.name}`);
    runCommand(step.command, step.args);
  }

  console.log("\nRelease preflight and desktop artifact build completed.");
  console.log("GitHub release publishing and Vercel deployment are handled by .github/workflows/release.yml.");
}

main().catch((error: unknown) => {
  console.error("Release run failed:", error);
  process.exit(1);
});

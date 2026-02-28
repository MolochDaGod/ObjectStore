#!/usr/bin/env node

import { readFile, writeFile, access, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const argValue = (flag, fallback) => {
  const idx = args.indexOf(flag);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
};

const manifestPath = path.resolve(
  repoRoot,
  argValue("--manifest", "docs/puter-integration-inventory.json"),
);
const outputPath = argValue("--output", "").trim();

async function exists(localPath) {
  try {
    await access(localPath);
    return true;
  } catch {
    return false;
  }
}

async function fetchWithTimeout(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { "user-agent": "grudge-puter-audit/1.0" },
    });
    return { ok: response.ok, status: response.status };
  } catch (error) {
    return { ok: false, error: error.message || String(error) };
  } finally {
    clearTimeout(timer);
  }
}

function scoreProject(project, checks) {
  let score = 0;

  if (checks.urlReachable) score += 30;
  if (checks.statusReachable || !project.statusUrl) score += 15;

  if (
    project.puter?.enabled === true &&
    Array.isArray(project.puter.capabilities) &&
    project.puter.capabilities.length > 0
  ) {
    score += 25;
  } else if (project.puter?.enabled === false) {
    score += 10;
  }

  if (checks.integrationFileExists || !project.puter?.integrationFile)
    score += 20;
  if (project.owner && project.owner.trim()) score += 10;

  return Math.min(score, 100);
}

function riskBand(score) {
  if (score >= 90) return "production-ready";
  if (score >= 70) return "minor-gaps";
  if (score >= 50) return "at-risk";
  return "not-ready";
}

async function run() {
  const manifestRaw = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(manifestRaw);

  const sdkCheck = await fetchWithTimeout(
    manifest.puterSdkUrl || "https://js.puter.com/v2/",
  );

  const projects = [];
  for (const project of manifest.projects || []) {
    const urlResult = await fetchWithTimeout(project.url);
    const statusResult = project.statusUrl
      ? await fetchWithTimeout(project.statusUrl)
      : { ok: true, skipped: true };

    const integrationPath = project.puter?.integrationFile
      ? path.resolve(repoRoot, project.puter.integrationFile)
      : "";

    const integrationFileExists = integrationPath
      ? await exists(integrationPath)
      : true;

    const checks = {
      urlReachable: urlResult.ok,
      urlStatus: urlResult.status || null,
      statusReachable: statusResult.ok,
      statusCode: statusResult.status || null,
      statusSkipped: !!statusResult.skipped,
      integrationFileExists,
      integrationFile: project.puter?.integrationFile || null,
    };

    const score = scoreProject(project, checks);

    projects.push({
      name: project.name,
      type: project.type,
      owner: project.owner || null,
      puterEnabled: !!project.puter?.enabled,
      capabilities: project.puter?.capabilities || [],
      score,
      risk: riskBand(score),
      checks,
    });
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    manifest: path.relative(repoRoot, manifestPath).replace(/\\/g, "/"),
    puterSdk: {
      url: manifest.puterSdkUrl || "https://js.puter.com/v2/",
      reachable: sdkCheck.ok,
      status: sdkCheck.status || null,
      error: sdkCheck.error || null,
    },
    totals: {
      projects: projects.length,
      productionReady: projects.filter((p) => p.risk === "production-ready")
        .length,
      minorGaps: projects.filter((p) => p.risk === "minor-gaps").length,
      atRisk: projects.filter((p) => p.risk === "at-risk").length,
      notReady: projects.filter((p) => p.risk === "not-ready").length,
      averageScore: projects.length
        ? Math.round(
            projects.reduce((acc, p) => acc + p.score, 0) / projects.length,
          )
        : 0,
    },
    projects,
  };

  console.log("\nPuter Audit Summary");
  console.log("===================");
  console.log(`Projects: ${summary.totals.projects}`);
  console.log(`Average Score: ${summary.totals.averageScore}`);
  console.log(`Production-ready: ${summary.totals.productionReady}`);
  console.log(`Minor gaps: ${summary.totals.minorGaps}`);
  console.log(`At risk: ${summary.totals.atRisk}`);
  console.log(`Not ready: ${summary.totals.notReady}`);
  console.log(`Puter SDK reachable: ${summary.puterSdk.reachable}`);

  for (const project of projects) {
    console.log(`- ${project.name}: ${project.score}/100 (${project.risk})`);
  }

  const resolvedOutput = outputPath ? path.resolve(repoRoot, outputPath) : "";

  if (resolvedOutput) {
    await mkdir(path.dirname(resolvedOutput), { recursive: true });
    await writeFile(resolvedOutput, JSON.stringify(summary, null, 2), "utf8");
    console.log(
      `\nReport written to ${path.relative(repoRoot, resolvedOutput).replace(/\\/g, "/")}`,
    );
  }
}

run().catch((error) => {
  console.error("Puter audit failed:", error.message || error);
  process.exitCode = 1;
});

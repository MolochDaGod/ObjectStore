#!/usr/bin/env node
/**
 * Asset Fleet Audit — era + readiness + convert queue + dry-run purge
 *
 * Scans local ObjectStore trees (and optional CDN HEAD / registry join),
 * classifies era, scores game-ready bake posture, writes reports.
 *
 * Usage:
 *   node scripts/asset-fleet-audit.mjs
 *   node scripts/asset-fleet-audit.mjs --cdn
 *   node scripts/asset-fleet-audit.mjs --purge-dry-run
 *   node scripts/asset-fleet-audit.mjs --roots models,KayKit_ResourceBits_1.0_FREE
 *   node scripts/asset-fleet-audit.mjs --max 500
 *   node scripts/asset-fleet-audit.mjs --fail-on-red
 *
 * NEVER hard-deletes R2/D1. --purge-dry-run only writes a candidate list.
 *
 * Related: grudge-asset-convert · grudge-d1-r2 · grudge-production-wiring
 */

import {
  readdirSync,
  statSync,
  existsSync,
  writeFileSync,
  mkdirSync,
  readFileSync,
  appendFileSync,
} from "fs";
import { join, relative, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { classifyEra, ERA_LABELS } from "./lib/asset-era.mjs";
import { scoreReadiness, convertQueueHint, extOf } from "./lib/asset-readiness.mjs";
import { loadAllowlist, isAllowlisted } from "./lib/asset-allowlist.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");
const REPORT_DIR = join(ROOT, "docs", "reports");
const AUDIT_DIR = join(ROOT, "api", "v1", "_audit");

const CDN_BASE = process.env.ASSET_CDN_BASE || "https://assets.grudge-studio.com";

// ── CLI ────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const argVal = (name, fallback) => {
  const i = args.findIndex((a) => a === name || a.startsWith(`${name}=`));
  if (i < 0) return fallback;
  if (args[i].includes("=")) return args[i].split("=").slice(1).join("=");
  return args[i + 1] ?? fallback;
};

const USE_CDN = flag("--cdn");
const PURGE_DRY = flag("--purge-dry-run");
const FAIL_RED = flag("--fail-on-red");
const MAX = parseInt(argVal("--max", "0"), 10) || 0;
const R2_KEYS_FILE = argVal("--r2-keys-file", "");
const rootsArg = argVal(
  "--roots",
  "models,api/v1,icons,audio,sprites,effects,heroes,textures",
);
const ROOTS = rootsArg.split(",").map((s) => s.trim()).filter(Boolean);

// ── Walk ───────────────────────────────────────────────────────
const SKIP_DIR = new Set([
  "node_modules",
  ".git",
  "dist",
  ".wrangler",
  "KayKit_ResourceBits_1.0_FREE", // huge optional pack — include only if --roots lists it
]);

function walkFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    if (ent.name.startsWith(".")) continue;
    const full = join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIR.has(ent.name) && !ROOTS.some((r) => full.replace(/\\/g, "/").includes(r))) {
        continue;
      }
      if (SKIP_DIR.has(ent.name) && !ROOTS.includes(ent.name)) continue;
      walkFiles(full, out);
    } else if (ent.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function sidecarExists(filePath, suffix) {
  // name.glb → name.manifest.json / name.collider.json
  const base = filePath.replace(/\.[^.]+$/, "");
  return existsSync(base + suffix);
}

async function headCdn(r2Key) {
  const url = `${CDN_BASE}/${r2Key.replace(/^\/+/, "")}`;
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(4000),
    });
    const ct = res.headers.get("content-type") || "";
    return {
      ok: res.ok && !/text\/html/i.test(ct),
      status: res.status,
      contentType: ct,
      size: parseInt(res.headers.get("content-length") || "0", 10) || 0,
    };
  } catch (e) {
    return { ok: false, status: 0, contentType: "", size: 0, error: e.message };
  }
}

function loadRegistryKeys() {
  const keys = new Set();
  const candidates = [
    join(ROOT, "api", "v1", "master-registry.json"),
    join(ROOT, "r2-upload-manifest.json"),
    join(ROOT, "remaining-manifest.json"),
    join(ROOT, "manifests", "v2", "index.json"),
  ];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    try {
      const j = JSON.parse(readFileSync(p, "utf8"));
      const list = Array.isArray(j)
        ? j
        : j.assets || j.entries || j.items || j.files || [];
      if (Array.isArray(list)) {
        for (const a of list) {
          const k = a.r2Key || a.r2_key || a.key || a.path || a.id;
          if (k) keys.add(String(k).replace(/\\/g, "/").toLowerCase());
        }
      }
      if (j.stats?.totalAssets) {
        /* ok */
      }
    } catch {
      /* skip */
    }
  }
  return keys;
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  console.log("[asset-fleet-audit] root =", ROOT);
  console.log("[asset-fleet-audit] roots =", ROOTS.join(", "));
  console.log("[asset-fleet-audit] cdn =", USE_CDN ? CDN_BASE : "off");

  const allow = loadAllowlist();
  const registryKeys = loadRegistryKeys();
  console.log("[asset-fleet-audit] registry keys loaded:", registryKeys.size);

  // Optional join: flat key list from `npm run r2:list` → r2-keys-flat.txt
  if (R2_KEYS_FILE && existsSync(R2_KEYS_FILE)) {
    const lines = readFileSync(R2_KEYS_FILE, "utf8")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    for (const k of lines) registryKeys.add(k.toLowerCase());
    console.log("[asset-fleet-audit] r2 keys file joined:", lines.length);
  }

  /** @type {string[]} */
  let files = [];
  /** @type {Map<string, string[]>} */
  const byRoot = new Map();
  for (const r of ROOTS) {
    const dir = join(ROOT, r);
    if (!existsSync(dir)) {
      console.warn("[asset-fleet-audit] missing root:", r);
      continue;
    }
    const bucket = [];
    walkFiles(dir, bucket);
    byRoot.set(r, bucket);
    files.push(...bucket);
  }

  // Dedup
  files = [...new Set(files)];
  if (MAX > 0 && files.length > MAX) {
    // Round-robin sample across roots so --max is not only models/*
    const per = Math.max(1, Math.floor(MAX / Math.max(1, byRoot.size)));
    const sampled = [];
    for (const [, bucket] of byRoot) {
      const step = Math.max(1, Math.floor(bucket.length / per));
      let taken = 0;
      for (let i = 0; i < bucket.length && taken < per; i += step) {
        sampled.push(bucket[i]);
        taken++;
      }
    }
    files = [...new Set(sampled)].slice(0, MAX);
    console.log(
      `[asset-fleet-audit] sampled ${files.length} across ${byRoot.size} roots (cap ${MAX})`,
    );
  }
  console.log("[asset-fleet-audit] files:", files.length);

  const assets = [];
  const convertQueue = [];
  const purgeCandidates = [];
  const byEra = {};
  const byBand = { green: 0, yellow: 0, red: 0 };

  let i = 0;
  for (const full of files) {
    i++;
    if (i % 500 === 0) console.log(`  … ${i}/${files.length}`);

    const rel = relative(ROOT, full).replace(/\\/g, "/");
    let sizeBytes = 0;
    try {
      sizeBytes = statSync(full).size;
    } catch {
      continue;
    }

    const protected_ = isAllowlisted(rel, allow);
    const hasManifest = sidecarExists(full, ".manifest.json");
    const hasCollider = sidecarExists(full, ".collider.json");

    let cdnOk;
    let contentType;
    if (USE_CDN && MESH_OR_CDN_EXT(rel)) {
      const head = await headCdn(rel);
      cdnOk = head.ok;
      contentType = head.contentType;
      if (head.size > 0) sizeBytes = head.size || sizeBytes;
    }

    const inRegistry =
      registryKeys.has(rel.toLowerCase()) ||
      registryKeys.has(rel.toLowerCase().replace(/^models\//, ""));

    const readiness = scoreReadiness({
      path: rel,
      sizeBytes,
      hasSidecarManifest: hasManifest,
      hasCollider,
      cdnOk,
      inRegistry,
      contentType,
      allowlistProtected: protected_,
    });

    byBand[readiness.band] = (byBand[readiness.band] || 0) + 1;
    byEra[readiness.era] = (byEra[readiness.era] || 0) + 1;

    const entry = {
      path: rel,
      sizeBytes,
      protected: protected_,
      inRegistry,
      hasManifest,
      hasCollider,
      ...readiness,
      eraLabel: ERA_LABELS[readiness.era] || readiness.era,
    };
    assets.push(entry);

    const hint = convertQueueHint(rel, readiness);
    if (hint) convertQueue.push(hint);

    if (PURGE_DRY && readiness.purgeEligible) {
      purgeCandidates.push({
        path: rel,
        era: readiness.era,
        score: readiness.score,
        issues: readiness.issues,
        reason: "red-not-stack-usable-not-allowlisted",
      });
    }
  }

  // Sort worst first for human review
  assets.sort((a, b) => a.score - b.score);

  if (!existsSync(REPORT_DIR)) mkdirSync(REPORT_DIR, { recursive: true });
  if (!existsSync(AUDIT_DIR)) mkdirSync(AUDIT_DIR, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const summary = {
    generatedAt: new Date().toISOString(),
    root: ROOT,
    roots: ROOTS,
    total: assets.length,
    byBand,
    byEra,
    convertQueueCount: convertQueue.length,
    purgeCandidatesCount: purgeCandidates.length,
    cdnChecked: USE_CDN,
    allowlistVersion: allow.version || 1,
    studio: {
      identity: "id.grudge-studio.com",
      playerSsot: "Railway Postgres (characters + account bag)",
      assetIndex: "D1 (registry) — not player SSOT",
      binaries: "R2 grudge-assets → assets.grudge-studio.com",
      definitions: "objectstore/info /api/v1 JSON",
      convertSsot: "ObjectStore grudge-convert CLI",
    },
  };

  const report = {
    summary,
    convertQueue: convertQueue.slice(0, 500),
    purgeCandidates: purgeCandidates.slice(0, 1000),
    assets: assets.slice(0, 5000), // cap file size
    assetsTruncated: assets.length > 5000,
  };

  const jsonPath = join(REPORT_DIR, `asset-fleet-audit-${stamp}.json`);
  const latestJson = join(REPORT_DIR, "asset-fleet-audit-latest.json");
  const mdPath = join(REPORT_DIR, `asset-fleet-audit-${stamp}.md`);
  const latestMd = join(REPORT_DIR, "asset-fleet-audit-latest.md");
  const apiJson = join(AUDIT_DIR, "asset-fleet-audit.json");
  const history = join(REPORT_DIR, "asset-fleet-audit-history.jsonl");

  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  writeFileSync(latestJson, JSON.stringify(report, null, 2));
  writeFileSync(apiJson, JSON.stringify(report, null, 2));

  const md = renderMarkdown(summary, assets, convertQueue, purgeCandidates);
  writeFileSync(mdPath, md);
  writeFileSync(latestMd, md);

  appendFileSync(
    history,
    JSON.stringify({
      at: summary.generatedAt,
      total: summary.total,
      byBand,
      byEra,
      convertQueueCount: convertQueue.length,
      purgeCandidatesCount: purgeCandidates.length,
    }) + "\n",
  );

  if (PURGE_DRY) {
    const purgePath = join(REPORT_DIR, `purge-candidates-${stamp}.json`);
    writeFileSync(
      purgePath,
      JSON.stringify(
        {
          warning:
            "DRY RUN ONLY. Do not delete without human approve + allowlist re-check.",
          count: purgeCandidates.length,
          candidates: purgeCandidates,
        },
        null,
        2,
      ),
    );
    console.log("[asset-fleet-audit] purge dry-run →", purgePath);
  }

  console.log("\n[asset-fleet-audit] SUMMARY");
  console.log("  total ", summary.total);
  console.log("  green ", byBand.green);
  console.log("  yellow", byBand.yellow);
  console.log("  red   ", byBand.red);
  console.log("  eras  ", JSON.stringify(byEra));
  console.log("  convert queue", convertQueue.length);
  console.log("  purge dry-run", purgeCandidates.length);
  console.log("  report", latestMd);

  if (FAIL_RED && byBand.red > 0) {
    console.error(`[asset-fleet-audit] FAIL --fail-on-red (${byBand.red} red)`);
    process.exit(2);
  }
}

function MESH_OR_CDN_EXT(rel) {
  const e = extOf(rel);
  return [".glb", ".gltf", ".fbx", ".json", ".png", ".webp"].includes(e);
}

function renderMarkdown(summary, assets, convertQueue, purgeCandidates) {
  const reds = assets.filter((a) => a.band === "red").slice(0, 40);
  const yellows = assets.filter((a) => a.band === "yellow").slice(0, 25);

  let md = `# Asset Fleet Audit

Generated: **${summary.generatedAt}**

## Summary

| Metric | Count |
|--------|------:|
| Total scanned | ${summary.total} |
| Green (game-ready) | ${summary.byBand.green} |
| Yellow (salvage) | ${summary.byBand.yellow} |
| Red (not stack-usable) | ${summary.byBand.red} |
| Convert queue | ${summary.convertQueueCount} |
| Purge candidates (dry-run) | ${summary.purgeCandidatesCount} |

### By era

| Era | Count | Meaning |
|-----|------:|---------|
${Object.entries(summary.byEra)
  .sort((a, b) => b[1] - a[1])
  .map(([e, n]) => `| ${e} | ${n} | ${ERA_LABELS[e] || ""} |`)
  .join("\n")}

## Studio SSOT (accounts / deploy / assets)

| Concern | Authority |
|---------|-----------|
| Login | \`id.grudge-studio.com\` |
| Characters + account bag | Railway Postgres |
| Asset index | D1 (not player SSOT) |
| Binaries | R2 → \`assets.grudge-studio.com\` |
| Definitions | ObjectStore \`/api/v1\` |
| Mesh bake | \`grudge-convert\` CLI |

See: \`docs/STUDIO_DEPLOY_ACCOUNTS_SSOT.md\` · \`docs/ASSET_FLEET_AUDIT.md\`

## Red samples (fix or convert or quarantine)

| Score | Era | Path | Issues |
|------:|-----|------|--------|
${reds
  .map(
    (a) =>
      `| ${a.score} | ${a.era} | \`${a.path}\` | ${(a.issues || []).join(", ")} |`,
  )
  .join("\n") || "| — | — | none | — |"}

## Yellow samples (convert queue)

| Score | Era | Path | Issues |
|------:|-----|------|--------|
${yellows
  .map(
    (a) =>
      `| ${a.score} | ${a.era} | \`${a.path}\` | ${(a.issues || []).join(", ")} |`,
  )
  .join("\n") || "| — | — | none | — |"}

## Convert queue (first 30)

\`\`\`
${convertQueue
  .slice(0, 30)
  .map((c) => c.suggested)
  .join("\n") || "(empty)"}
\`\`\`

## Purge policy

- **Never** auto-delete allowlisted paths (grudge6, tvs, gamedata, icons, audio).
- Red + not stack-usable + not allowlisted → quarantine candidates only.
- Run with \`--purge-dry-run\` to write candidates JSON; human approve before any R2/D1 delete.

## Next commands

\`\`\`bash
npm run audit:assets
npm run audit:assets:cdn
npm run audit:assets:purge-dry
# then convert queue via ObjectStore grudge-convert
npm run convert:doctor   # if tools/grudge-convert installed
\`\`\`
`;
  return md;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

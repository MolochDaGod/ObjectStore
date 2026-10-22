#!/usr/bin/env node
/**
 * Agentic asset audit — no assumptions.
 *
 * Layers:
 *  1) CDN HEAD priority keys (binaries agents must not invent)
 *  2) D1 registry total (api.grudge-studio.com/assets)
 *  3) Forge Fast + catalog status
 *  4) Optional local disk sample under D:\\Games\\Models
 *
 * Usage:
 *   node scripts/audit-agent-assets.mjs
 *   node scripts/audit-agent-assets.mjs --local
 *   node scripts/audit-agent-assets.mjs --json > audit-out.json
 */
import { writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const CDN = "https://assets.grudge-studio.com";
const D1 = "https://api.grudge-studio.com/assets";
const FORGE = "https://forge.grudge-studio.com";
const PLAYBOOK =
  "https://objectstore.grudge-studio.com/api/v1/agent-asset-playbook.json";

const PRIORITY = [
  "models/grudge6/races/WK_Characters.fbx",
  "models/grudge6/races/ORC_Characters.fbx",
  "models/grudge6/races/ELF_Characters.fbx",
  "models/grudge6/races/DWF_Characters.fbx",
  "models/grudge6/races/BRB_Characters.fbx",
  "models/grudge6/races/UD_Characters.fbx",
  "asset-packs/toon-rts-characters/glb/characters/human.glb",
  "models/lobby/pirate-islands/scene.glb",
];

const args = new Set(process.argv.slice(2));
const wantLocal = args.has("--local");
const wantJson = args.has("--json");

async function headKey(r2Key) {
  const url = `${CDN}/${r2Key}`;
  try {
    const r = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(12000),
    });
    const ct = r.headers.get("content-type") || "";
    const cl = Number(r.headers.get("content-length") || 0);
    const ok =
      r.ok &&
      !ct.includes("text/html") &&
      (cl === 0 || cl > 1024); // some CDNs omit length
    return {
      r2Key,
      status: r.status,
      contentType: ct,
      contentLength: cl || null,
      ok,
      severity: ok ? "green" : "red",
    };
  } catch (e) {
    return {
      r2Key,
      status: 0,
      ok: false,
      severity: "red",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function d1Meta() {
  try {
    const r = await fetch(`${D1}?limit=3`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return { ok: false, status: r.status };
    const j = await r.json();
    const first = Array.isArray(j.assets) ? j.assets[0] : null;
    // Prove filter is broken: category=characters should not all be accessories
    const r2 = await fetch(`${D1}?category=characters&limit=5`, {
      signal: AbortSignal.timeout(15000),
    });
    const j2 = r2.ok ? await r2.json() : { assets: [] };
    const cats = (j2.assets || []).map((a) => a.category);
    const filterWorks = cats.some((c) => c && c !== "accessories");
    return {
      ok: true,
      total: j.total ?? null,
      sampleFirst: first?.r2Key ?? null,
      categoryFilterWorks: filterWorks,
      categorySample: cats,
      note: filterWorks
        ? "D1 API category filter appears to work"
        : "D1 API ignores category/q — use Forge free-ai catalog/search for agents",
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function forgeMeta() {
  try {
    const [st, fa] = await Promise.all([
      fetch(`${FORGE}/api/catalog/status`, {
        signal: AbortSignal.timeout(12000),
      }).then((r) => r.json()),
      fetch(`${FORGE}/api/catalog/fast-assets`, {
        signal: AbortSignal.timeout(12000),
      }).then((r) => r.json()),
    ]);
    return {
      ok: true,
      catalogStatus: st,
      fastCount: fa.count ?? fa.items?.length ?? null,
      fastGroups: Array.isArray(fa.items)
        ? [...new Set(fa.items.map((i) => i.group).filter(Boolean))]
        : [],
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function sampleLocal(root) {
  if (!existsSync(root)) return { ok: false, root, error: "missing" };
  const exts = {};
  let files = 0;
  const stack = [root];
  const max = 8000;
  while (stack.length && files < max) {
    const dir = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      const p = join(dir, ent.name);
      if (ent.isDirectory()) {
        if (!ent.name.startsWith(".") && ent.name !== "node_modules") {
          stack.push(p);
        }
      } else if (ent.isFile()) {
        files++;
        const e = extname(ent.name).toLowerCase() || "(none)";
        if (/\.(glb|gltf|fbx|png|tga|webp|jpg|jpeg|hdr)$/i.test(e)) {
          exts[e] = (exts[e] || 0) + 1;
        }
      }
    }
  }
  return {
    ok: true,
    root,
    filesScannedCap: max,
    filesSeen: files,
    mediaExtCounts: exts,
    animPacks: existsSync(join(root, "_anim_packs"))
      ? readdirSync(join(root, "_anim_packs")).filter((n) => !n.startsWith("."))
      : [],
  };
}

function printReport(rep) {
  console.log("=== Agentic asset audit ===\n");
  console.log("CDN priority keys:");
  for (const h of rep.cdnHeads) {
    console.log(
      `  [${h.severity}] ${h.r2Key} status=${h.status} ct=${h.contentType || "?"} len=${h.contentLength ?? "?"}`,
    );
  }
  console.log("\nD1 registry:");
  console.log(JSON.stringify(rep.d1, null, 2));
  console.log("\nForge catalog:");
  console.log(JSON.stringify(rep.forge, null, 2));
  if (rep.local) {
    console.log("\nLocal disk sample:");
    console.log(JSON.stringify(rep.local, null, 2));
  }
  console.log("\nImprove next:");
  for (const step of rep.improveNext) console.log(`  - ${step}`);
  console.log(`\nPlaybook: ${PLAYBOOK}`);
  console.log(`Green CDN: ${rep.summary.cdnGreen}/${rep.summary.cdnTotal}`);
}

async function main() {
  const cdnHeads = [];
  for (const k of PRIORITY) {
    cdnHeads.push(await headKey(k));
  }
  const d1 = await d1Meta();
  const forge = await forgeMeta();
  const local = wantLocal ? sampleLocal("D:\\Games\\Models") : null;

  const cdnGreen = cdnHeads.filter((h) => h.ok).length;
  const improveNext = [];
  if (cdnGreen < cdnHeads.length) {
    improveNext.push("Re-upload red CDN keys (wrangler r2 object put + HEAD)");
  }
  if (d1.ok && d1.categoryFilterWorks === false) {
    improveNext.push(
      "Do not trust raw D1 API filters — agents must use Forge /api/catalog/search or Fast assets",
    );
    improveNext.push(
      "Re-tag D1 categories for grudge6/weapons/nature when re-seeding (assetManifest)",
    );
  }
  if (forge.ok && (forge.fastCount || 0) < 80) {
    improveNext.push(
      "Expand Fast catalog only for agent-hot spawns (not all 6k D1 rows)",
    );
  }
  improveNext.push(
    "Bake local FBX→meshopt GLB via grudge-asset-convert before new R2 uploads",
  );
  improveNext.push(
    "Ship AI sidecars (this playbook + roster) on ObjectStore; Legion load /v1/context",
  );
  improveNext.push(
    "In Forge AI: verify_mesh_scale + verify_textures after spawn; list_threejs_standards({topic:'textures'})",
  );

  const report = {
    at: new Date().toISOString(),
    playbook: PLAYBOOK,
    cdnHeads,
    d1,
    forge,
    local,
    summary: {
      cdnGreen,
      cdnTotal: cdnHeads.length,
      d1Total: d1.total ?? null,
      fastCount: forge.fastCount ?? null,
    },
    improveNext,
  };

  if (wantJson) {
    process.stdout.write(JSON.stringify(report, null, 2));
  } else {
    printReport(report);
  }

  const outPath = join(
    process.cwd(),
    "dist",
    `agent-asset-audit-${Date.now()}.json`,
  );
  try {
    writeFileSync(outPath, JSON.stringify(report, null, 2));
    if (!wantJson) console.log(`\nWrote ${outPath}`);
  } catch {
    /* optional */
  }

  const failed = cdnHeads.some((h) => !h.ok);
  process.exit(failed ? 2 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

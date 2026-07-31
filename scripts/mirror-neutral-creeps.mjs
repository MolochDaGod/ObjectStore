#!/usr/bin/env node
/**
 * Mirror threejs-games neutral creep FBX → local models/creeps/threejs-games/
 * Then optionally upload to R2 (S3 put via fleet env, or wrangler put fallback).
 *
 * Usage:
 *   node scripts/mirror-neutral-creeps.mjs
 *   node scripts/mirror-neutral-creeps.mjs --upload   # fleet secretnow S3 or wrangler
 *   node scripts/mirror-neutral-creeps.mjs --dry-run
 *
 * R2 key pattern:
 *   models/creeps/threejs-games/<slug>/<file>
 * CDN:
 *   https://assets.grudge-studio.com/models/creeps/threejs-games/<slug>/<file>
 *
 * LICENSE: RigModels personal — commercial requires Premium.
 */

import {
  mkdirSync,
  writeFileSync,
  unlinkSync,
  existsSync,
  createWriteStream,
  readFileSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { execSync } from "child_process";
import { loadFleetEnv, resolveR2S3Config } from "./lib/load-fleet-env.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
// Prefer roomy path when D: is full — override with CREEP_MIRROR_OUT or --out
const DEFAULT_OUT = join(ROOT, "models", "creeps", "threejs-games");
const CACHE_OUT = join(
  process.env.USERPROFILE || process.env.HOME || ROOT,
  ".cache",
  "grudge-creeps",
  "threejs-games",
);
const outFlag = (() => {
  const i = process.argv.findIndex(
    (a) => a === "--out" || a.startsWith("--out="),
  );
  if (i < 0) return null;
  if (process.argv[i].includes("="))
    return process.argv[i].split("=").slice(1).join("=");
  return process.argv[i + 1] || null;
})();
function pickOutRoot() {
  if (outFlag) return outFlag;
  if (process.env.CREEP_MIRROR_OUT) return process.env.CREEP_MIRROR_OUT;
  if (process.env.CREEP_MIRROR_USE_CACHE === "1") return CACHE_OUT;
  // Always prefer user cache when ObjectStore root is on a full drive —
  // probe write; on failure fall back to %USERPROFILE%\.cache (usually C:)
  try {
    const probe = join(ROOT, ".write-probe-creeps");
    writeFileSync(probe, "ok");
    unlinkSync(probe);
  } catch {
    console.warn(
      "[creeps:mirror] ObjectStore drive full/unwritable — using",
      CACHE_OUT,
    );
    return CACHE_OUT;
  }
  // Prefer cache when CREEP_MIRROR_PREFER_CACHE=1 or default for reliability
  if (process.env.CREEP_MIRROR_PREFER_CACHE !== "0") {
    return CACHE_OUT;
  }
  return DEFAULT_OUT;
}
const OUT_ROOT = pickOutRoot();
const CDN = "https://threejs-games.github.io/assets/models/character";
const R2_PREFIX = "models/creeps/threejs-games";

const DRY = process.argv.includes("--dry-run");
const UPLOAD = process.argv.includes("--upload");

const CREEPS = [
  { slug: "demon", file: "model.fbx", family: "fantasy" },
  { slug: "goblin", file: "model.fbx", family: "fantasy" },
  { slug: "golem", file: "model.fbx", family: "fantasy" },
  { slug: "orc", file: "model.fbx", family: "fantasy" },
  { slug: "orc-ogre", file: "model.fbx", family: "fantasy" },
  { slug: "sorceress", file: "model.fbx", family: "fantasy" },
  { slug: "troll", file: "model.fbx", family: "fantasy" },
  { slug: "witch", file: "model.fbx", family: "fantasy" },
  { slug: "skeleton", file: "model.fbx", family: "horror" },
  { slug: "zombie", file: "zombie-barefoot.fbx", family: "horror" },
  { slug: "zombie", file: "zombie-cop.fbx", family: "horror" },
  { slug: "zombie", file: "zombie-guard.fbx", family: "horror" },
];

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  mkdirSync(dirname(dest), { recursive: true });
  if (!res.body) throw new Error("no body");
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

async function main() {
  console.log("[creeps:mirror] out =", OUT_ROOT);
  const manifest = {
    generatedAt: new Date().toISOString(),
    source: CDN,
    r2Prefix: R2_PREFIX,
    license: "rigmodels-personal",
    era: "legacy-external",
    files: [],
  };

  for (const c of CREEPS) {
    const url = `${CDN}/${c.slug}/${c.file}`;
    const local = join(OUT_ROOT, c.slug, c.file);
    const r2Key = `${R2_PREFIX}/${c.slug}/${c.file}`;
    console.log(DRY ? "  would fetch" : "  fetch", url);
    if (!DRY) {
      try {
        if (!existsSync(local)) {
          await download(url, local);
        } else {
          console.log("    skip (exists)");
        }
        manifest.files.push({
          slug: c.slug,
          file: c.file,
          family: c.family,
          local: `models/creeps/threejs-games/${c.slug}/${c.file}`,
          localAbs: local,
          r2Key,
          cdn: `https://assets.grudge-studio.com/${r2Key}`,
          sourceUrl: url,
        });
      } catch (e) {
        console.warn("    FAIL", e.message);
        manifest.files.push({
          slug: c.slug,
          file: c.file,
          error: e.message,
          sourceUrl: url,
        });
      }
    } else {
      manifest.files.push({ slug: c.slug, file: c.file, r2Key, sourceUrl: url });
    }
  }

  mkdirSync(OUT_ROOT, { recursive: true });
  const manPath = join(OUT_ROOT, "manifest.json");
  if (!DRY) writeFileSync(manPath, JSON.stringify(manifest, null, 2));
  console.log("[creeps:mirror] manifest", manPath);

  if (UPLOAD && !DRY) {
    loadFleetEnv({ quiet: false });
    const r2 = resolveR2S3Config();
    if (r2) {
      console.log("[creeps:mirror] uploading via S3 SigV4 (fleet env / secretnow)…");
      const { putR2Object } = await import("./lib/r2-s3-sigv4.mjs");
      for (const f of manifest.files) {
        if (!f.r2Key || f.error) continue;
        const local = f.localAbs || join(OUT_ROOT, f.slug, f.file);
        if (!existsSync(local)) continue;
        try {
          console.log("  put", f.r2Key);
          await putR2Object({
            key: f.r2Key,
            body: readFileSync(local),
            contentType: "model/fbx",
            bucket: r2.bucket,
          });
        } catch (e) {
          console.warn("  put failed", f.r2Key, e.message);
        }
      }
    } else {
      console.log(
        "[creeps:mirror] no S3 fleet creds — falling back to wrangler r2 object put…",
      );
      for (const f of manifest.files) {
        if (!f.r2Key || f.error) continue;
        const local = f.localAbs || join(OUT_ROOT, f.slug, f.file);
        if (!existsSync(local)) continue;
        const put = `npx wrangler r2 object put grudge-assets/${f.r2Key} --file="${local}" --content-type=model/fbx --remote`;
        try {
          console.log("  put", f.r2Key);
          execSync(put, { cwd: ROOT, stdio: "inherit" });
        } catch (e) {
          console.warn("  put failed", f.r2Key, e.message);
        }
      }
    }
  }

  console.log(`
Next:
  1. npm run creeps:mirror          # download to models/creeps/threejs-games/
  2. npm run creeps:mirror:upload   # wrangler put (auth required)
  3. npm run r2:list -- --prefix models/creeps/
  4. In DCQ, creeps auto-prefer R2 when HEAD succeeds
  5. Bake production GLB later: grudge-convert fbx2gltf …
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

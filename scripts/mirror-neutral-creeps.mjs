#!/usr/bin/env node
/**
 * Mirror threejs-games neutral creep FBX → local models/creeps/threejs-games/
 * Then optionally upload to R2 (requires credentials + wrangler or S3 put).
 *
 * Usage:
 *   node scripts/mirror-neutral-creeps.mjs
 *   node scripts/mirror-neutral-creeps.mjs --upload   # needs R2 env + wrangler put
 *   node scripts/mirror-neutral-creeps.mjs --dry-run
 *
 * R2 key pattern:
 *   models/creeps/threejs-games/<slug>/<file>
 * CDN:
 *   https://assets.grudge-studio.com/models/creeps/threejs-games/<slug>/<file>
 *
 * LICENSE: RigModels personal — commercial requires Premium.
 */

import { mkdirSync, writeFileSync, existsSync, createWriteStream } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_ROOT = join(ROOT, "models", "creeps", "threejs-games");
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
    console.log("[creeps:mirror] uploading via wrangler r2 object put…");
    for (const f of manifest.files) {
      if (!f.r2Key || f.error) continue;
      const local = join(ROOT, f.local);
      if (!existsSync(local)) continue;
      const cmd = `npx wrangler r2 object put ${f.r2Key.replace(/^/, "grudge-assets/")} --file="${local}" --content-type=application/octet-stream --remote`;
      // wrangler expects bucket/key as bucket/path
      const put = `npx wrangler r2 object put grudge-assets/${f.r2Key} --file="${local}" --content-type=model/fbx --remote`;
      try {
        console.log("  put", f.r2Key);
        execSync(put, { cwd: ROOT, stdio: "inherit" });
      } catch (e) {
        console.warn("  put failed", f.r2Key, e.message);
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

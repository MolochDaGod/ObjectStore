#!/usr/bin/env node
/**
 * assets-to-gltf-pipeline.mjs
 *
 * Discover source 3D files → grudge-convert production GLB → verify magic
 * → optional R2 upload under prod/gltf/ → assets-gltf-index.json
 *
 * Usage:
 *   node scripts/assets-to-gltf-pipeline.mjs --src <dir> --class characters --height 1.85
 *   node scripts/assets-to-gltf-pipeline.mjs --src <dir> --class characters --upload --remote
 *   node scripts/assets-to-gltf-pipeline.mjs --file path/to/model.fbx --class characters --height 1.85
 *
 * See docs/ASSETS_TO_GLTF.md
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawn, execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONVERT_BIN = path.join(ROOT, "tools/grudge-convert/bin/grudge-convert.mjs");

const CDN_BASE = "https://assets.grudge-studio.com";
const BUCKET = "grudge-assets";
const PROD_PREFIX = "prod/gltf";
const SOURCE_EXTS = new Set([".fbx", ".obj", ".glb", ".gltf", ".blend", ".dae"]);

function arg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  if (i === -1) return fallback;
  if (
    name.startsWith("--") &&
    (i + 1 >= process.argv.length || process.argv[i + 1].startsWith("-"))
  ) {
    return true;
  }
  return process.argv[i + 1] ?? fallback;
}

function has(flag) {
  return process.argv.includes(flag);
}

function slugify(name) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "asset";
}

/** Prefer parent folder when basename is generic (scene, model, mesh). */
function assetSlug(filePath) {
  const base = path.basename(filePath, path.extname(filePath));
  const parent = path.basename(path.dirname(filePath));
  const generic = /^(scene|model|mesh|export|untitled|object)$/i.test(base);
  if (generic && parent && parent !== "." && parent !== "player") {
    return slugify(parent);
  }
  return slugify(base);
}

async function walk(dir, acc = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".git") continue;
      await walk(full, acc);
    } else {
      const ext = path.extname(e.name).toLowerCase();
      if (SOURCE_EXTS.has(ext)) acc.push(full);
    }
  }
  return acc;
}

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function isGlbMagic(buf) {
  return (
    buf.length >= 4 &&
    buf[0] === 0x67 &&
    buf[1] === 0x6c &&
    buf[2] === 0x54 &&
    buf[3] === 0x46
  ); // glTF
}

function isHtml(buf) {
  const head = buf.subarray(0, 32).toString("utf8");
  return /<!DOCTYPE|<html/i.test(head);
}

async function runConvert(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [CONVERT_BIN, ...args], {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => {
      out += d;
    });
    child.stderr.on("data", (d) => {
      err += d;
    });
    child.on("close", (code) => {
      if (code === 0) resolve({ out, err });
      else reject(new Error(`grudge-convert exit ${code}\n${err || out}`));
    });
  });
}

async function convertOne(srcPath, outGlb, height) {
  const ext = path.extname(srcPath).toLowerCase();
  await fs.mkdir(path.dirname(outGlb), { recursive: true });

  if (ext === ".glb") {
    const args = ["glb2glb", srcPath, "-o", outGlb, "--texture-size", "1024"];
    if (height) args.push("--height", String(height));
    await runConvert(args);
    return "glb2glb";
  }
  if (ext === ".gltf") {
    const raw = outGlb.replace(/\.glb$/i, ".from-gltf.glb");
    await runConvert(["gltf2glb", srcPath, "-o", raw]);
    const args = ["glb2glb", raw, "-o", outGlb, "--texture-size", "1024"];
    if (height) args.push("--height", String(height));
    await runConvert(args);
    return "gltf2glb+glb2glb";
  }
  if (ext === ".fbx") {
    const raw = outGlb.replace(/\.glb$/i, ".raw.glb");
    // Mixamo / unit chaos: cm-to-m when height normalize is requested
    const fbxArgs = ["fbx2gltf", srcPath, "-o", raw, "--no-meshopt"];
    if (height) fbxArgs.push("--cm-to-m");
    await runConvert(fbxArgs);
    const args = ["glb2glb", raw, "-o", outGlb, "--texture-size", "1024"];
    if (height) args.push("--height", String(height));
    await runConvert(args);
    return "fbx2gltf+glb2glb";
  }
  // obj / blend / dae
  const raw = outGlb.replace(/\.glb$/i, ".raw.glb");
  await runConvert(["obj2glb", srcPath, "-o", raw].filter(Boolean));
  // If obj2glb not named, try generic
  try {
    await fs.access(raw);
  } catch {
    await runConvert([srcPath, "-o", raw]);
  }
  const args = ["glb2glb", raw, "-o", outGlb, "--texture-size", "1024"];
  if (height) args.push("--height", String(height));
  await runConvert(args);
  return "blender+glb2glb";
}

async function verifyGlb(filePath) {
  const buf = await fs.readFile(filePath);
  if (buf.length < 100) throw new Error(`too small: ${buf.length}`);
  if (isHtml(buf)) throw new Error("HTML content");
  if (!isGlbMagic(buf)) throw new Error("not glTF binary magic");
  return { bytes: buf.length, sha256: sha256(buf), magic: "glTF" };
}

async function uploadR2(localFile, r2Key, contentType, remote) {
  // Prefer wrangler on PATH (avoids Windows npx.cmd spawn EINVAL)
  const wranglerBin =
    process.platform === "win32" ? "wrangler.cmd" : "wrangler";
  const args = [
    "r2",
    "object",
    "put",
    `${BUCKET}/${r2Key}`,
    `--file=${localFile}`,
    `--content-type=${contentType}`,
  ];
  if (remote) args.push("--remote");
  console.log("  r2 put", r2Key);
  try {
    await execFileAsync(wranglerBin, args, {
      cwd: ROOT,
      maxBuffer: 20 * 1024 * 1024,
      shell: process.platform === "win32",
    });
  } catch (e) {
    // Fallback: npx wrangler via shell
    const cmd = `npx wrangler ${args.map((a) => `"${a}"`).join(" ")}`;
    await execFileAsync(cmd, {
      cwd: ROOT,
      maxBuffer: 20 * 1024 * 1024,
      shell: true,
    });
  }
}

async function loadIndex(indexPath) {
  try {
    const t = await fs.readFile(indexPath, "utf8");
    return JSON.parse(t);
  } catch {
    return {
      version: 1,
      updatedAt: null,
      bucket: BUCKET,
      cdnBase: CDN_BASE,
      prefix: PROD_PREFIX,
      assets: [],
    };
  }
}

async function main() {
  if (has("--help") || has("-h")) {
    console.log(`assets-to-gltf-pipeline
  --src <dir>          Source folder (recursive)
  --file <path>        Single source file
  --class <name>       characters|weapons|props|vfx|environments (default props)
  --out <dir>          Local output root (default dist/prod/gltf)
  --height <m>         Normalize height (characters: 1.85)
  --upload             Upload to R2 grudge-assets
  --remote             wrangler --remote
  --dry-run            List only
`);
    process.exit(0);
  }

  const srcDir = arg("--src");
  const single = arg("--file");
  const assetClass = arg("--class", "props");
  const outRoot = path.resolve(ROOT, arg("--out", "dist/prod/gltf"));
  const height = arg("--height") ? Number(arg("--height")) : null;
  const doUpload = has("--upload");
  const remote = has("--remote");
  const dry = has("--dry-run");

  // Doctor convert CLI
  try {
    await runConvert(["doctor"]);
  } catch (e) {
    console.warn("warn: grudge-convert doctor failed — convert may still work\n", e.message);
  }

  let files = [];
  if (single) files = [path.resolve(single)];
  else if (srcDir) files = await walk(path.resolve(srcDir));
  else {
    console.error("Need --src <dir> or --file <path>");
    process.exit(1);
  }

  // Prefer FBX over already-broken GLB when both exist for same basename
  const byBase = new Map();
  for (const f of files) {
    const base = path.basename(f, path.extname(f)).toLowerCase();
    const prev = byBase.get(base);
    const ext = path.extname(f).toLowerCase();
    if (!prev) {
      byBase.set(base, f);
      continue;
    }
    // Prefer fbx/obj/blend as source of truth for convert
    const rank = (e) =>
      e === ".fbx" ? 0 : e === ".obj" || e === ".blend" ? 1 : e === ".gltf" ? 2 : 3;
    if (rank(ext) < rank(path.extname(prev).toLowerCase())) byBase.set(base, f);
  }
  files = [...byBase.values()];

  console.log(`Found ${files.length} source asset(s) → class=${assetClass}`);
  if (dry) {
    for (const f of files) console.log(" ", f);
    process.exit(0);
  }

  const indexPath = path.join(ROOT, "dist/manifests/assets-gltf-index.json");
  await fs.mkdir(path.dirname(indexPath), { recursive: true });
  const index = await loadIndex(indexPath);
  const byId = new Map(index.assets.map((a) => [a.id, a]));

  let ok = 0;
  let fail = 0;

  for (const src of files) {
    const slug = assetSlug(src);
    const id = `${assetClass}/${slug}`;
    const outGlb = path.join(outRoot, assetClass, `${slug}.glb`);
    const r2Key = `${PROD_PREFIX}/${assetClass}/${slug}.glb`;
    const manKey = `${PROD_PREFIX}/${assetClass}/${slug}.manifest.json`;

    process.stdout.write(`\n→ ${id}\n  src ${src}\n`);
    try {
      const pipeline = await convertOne(src, outGlb, height);
      const v = await verifyGlb(outGlb);
      console.log(`  OK ${pipeline}  ${v.bytes} B  magic=${v.magic}`);

      const entry = {
        id,
        class: assetClass,
        slug,
        r2Key,
        cdnUrl: `${CDN_BASE}/${r2Key}`,
        contentType: "model/gltf-binary",
        sourceExt: path.extname(src).toLowerCase(),
        sourcePath: path.relative(ROOT, src).replace(/\\/g, "/"),
        bytes: v.bytes,
        sha256: v.sha256,
        heightM: height,
        magic: v.magic,
        pipeline,
        convertedAt: new Date().toISOString(),
      };

      // Local sidecar manifest
      const manPath = outGlb.replace(/\.glb$/i, ".manifest.json");
      await fs.writeFile(manPath, JSON.stringify(entry, null, 2));

      if (doUpload) {
        await uploadR2(outGlb, r2Key, "model/gltf-binary", remote);
        await uploadR2(manPath, manKey, "application/json", remote);
      }

      byId.set(id, entry);
      ok++;
    } catch (e) {
      console.error(`  FAIL ${e.message}`);
      fail++;
    }
  }

  index.assets = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
  index.updatedAt = new Date().toISOString();
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2));

  if (doUpload) {
    try {
      await uploadR2(
        indexPath,
        "manifests/assets-gltf-index.json",
        "application/json",
        remote,
      );
    } catch (e) {
      console.warn("index upload failed:", e.message);
    }
  }

  console.log(`\nDone: ${ok} ok, ${fail} failed`);
  console.log(`Index: ${indexPath}`);
  console.log(`CDN prefix: ${CDN_BASE}/${PROD_PREFIX}/`);
  if (ok && !doUpload) {
    console.log("Tip: re-run with --upload --remote to ship to R2");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

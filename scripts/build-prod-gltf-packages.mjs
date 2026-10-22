#!/usr/bin/env node
/**
 * build-prod-gltf-packages.mjs
 *
 * Best-package production bake + prefabs + yellow-asset re-bake → prod/gltf CDN.
 *
 * Packages:
 *   characters  — grudge6 races (atlas-bound) + armada player
 *   weapons     — fantasy (sword/bow/staff/…) + armada guns
 *   enemies     — armada alien/mutant/spikeball
 *   skeletons   — Skeleton / Skeleton_Archer
 *   props       — barrel, bush, cabin, searchlight, …
 *   buildings   — colony kit (subset)
 *
 * Outputs under dist/prod/gltf/ (glb + manifest + collider),
 * dist/packages/grudge-prod-packages.json, grudge-prod-prefabs.json,
 * and dist/manifests/assets-gltf-index.json.
 *
 * Usage:
 *   node scripts/build-prod-gltf-packages.mjs
 *   node scripts/build-prod-gltf-packages.mjs --upload --remote
 *   node scripts/build-prod-gltf-packages.mjs --skip-races
 *   node scripts/build-prod-gltf-packages.mjs --dry-run
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
const CONVERT = path.join(ROOT, "tools/grudge-convert/bin/grudge-convert.mjs");
const OUT = path.join(ROOT, "dist/prod/gltf");
const PKG_DIR = path.join(ROOT, "dist/packages");
const INDEX_PATH = path.join(ROOT, "dist/manifests/assets-gltf-index.json");
const CDN = "https://assets.grudge-studio.com";
const BUCKET = "grudge-assets";
const PROD = "prod/gltf";

const has = (f) => process.argv.includes(f);
const arg = (n, d = null) => {
  const i = process.argv.indexOf(n);
  if (i === -1) return d;
  if (i + 1 >= process.argv.length || process.argv[i + 1].startsWith("-")) return true;
  return process.argv[i + 1];
};

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}
function isGlb(buf) {
  return buf.length >= 4 && buf[0] === 0x67 && buf[1] === 0x6c && buf[2] === 0x54 && buf[3] === 0x46;
}
function isHtml(buf) {
  return /<!DOCTYPE|<html/i.test(buf.subarray(0, 64).toString("utf8"));
}

async function runConvert(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [CONVERT, ...args], {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => {
      if (code === 0) resolve({ out, err });
      else reject(new Error(`convert exit ${code}\n${err || out}`.slice(0, 800)));
    });
  });
}

async function download(url, dest) {
  try {
    const st = await fs.stat(dest);
    if (st.size > 2000) return { skipped: true, bytes: st.size };
  } catch {
    /* need */
  }
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (isHtml(buf)) throw new Error(`HTML not binary: ${url}`);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buf);
  return { skipped: false, bytes: buf.length };
}

async function verifyGlb(p) {
  const buf = await fs.readFile(p);
  if (buf.length < 100) throw new Error(`too small ${buf.length}`);
  if (isHtml(buf)) throw new Error("HTML content");
  if (!isGlb(buf)) throw new Error("not glTF magic");
  return { bytes: buf.length, sha256: sha256(buf), magic: "glTF" };
}

async function inspectTextures(glbPath) {
  try {
    const { out } = await runConvert(["inspect", glbPath]);
    const j = JSON.parse(out);
    return {
      meshes: j.meshes ?? 0,
      materials: j.materials ?? 0,
      textures: j.textures ?? 0,
      skins: j.skins ?? 0,
      animations: Array.isArray(j.animations) ? j.animations.length : j.animations ?? 0,
    };
  } catch {
    return null;
  }
}

async function uploadR2(localFile, r2Key, contentType, remote) {
  const wranglerBin = process.platform === "win32" ? "wrangler.cmd" : "wrangler";
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
      maxBuffer: 40 * 1024 * 1024,
      shell: process.platform === "win32",
    });
  } catch {
    const cmd = `npx wrangler ${args.map((a) => `"${a}"`).join(" ")}`;
    await execFileAsync(cmd, { cwd: ROOT, maxBuffer: 40 * 1024 * 1024, shell: true });
  }
}

/** Race kits — yellow fix = atlas rebind at convert time. */
const RACES = [
  { id: "wk", fbxKey: "models/grudge6/races/WK_Characters.fbx", atlasKey: "textures/grudge6/western-kingdoms/WK_Standard_Units.webp", height: 1.8 },
  { id: "brb", fbxKey: "models/grudge6/races/BRB_Characters.fbx", atlasKey: "textures/grudge6/barbarians/BRB_StandardUnits_texture.webp", height: 1.8 },
  { id: "elf", fbxKey: "models/grudge6/races/ELF_Characters.fbx", atlasKey: "textures/grudge6/elves/ELF_HighElves_Texture.webp", height: 1.8 },
  { id: "dwf", fbxKey: "models/grudge6/races/DWF_Characters.fbx", atlasKey: "textures/grudge6/dwarves/DWF_Standard_Units.webp", height: 1.8 },
  { id: "orc", fbxKey: "models/grudge6/races/ORC_Characters.fbx", atlasKey: "textures/grudge6/orcs/ORC_StandardUnits.webp", height: 1.8 },
  { id: "ud", fbxKey: "models/grudge6/races/UD_Characters.fbx", atlasKey: "textures/grudge6/undead/UD_Standard_Units.webp", height: 1.8 },
];

/** Fantasy weapons already on CDN under models/weapons — re-bake into prod/gltf. */
const FANTASY_WEAPONS = ["sword", "bow", "staff", "dagger", "axe", "hammer", "lance", "mace"];

/** Armada sources (local preferred). */
function armadaPath(...parts) {
  return path.join(ROOT, "..", "grim-armada-web", "public", "models", ...parts);
}
function builderPath(...parts) {
  return path.join(ROOT, "..", "GrudgeBuilder", "public", "models", ...parts);
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function bakeRace(race, results) {
  const rawDir = path.join(ROOT, "raw/grudge6");
  const fbx = path.join(rawDir, `${race.id.toUpperCase()}_Characters.fbx`);
  const atlas = path.join(rawDir, `${race.id.toUpperCase()}_atlas.webp`);
  const rawGlb = path.join(rawDir, `${race.id}_characters.raw.glb`);
  const slug = `${race.id}_characters`;
  const outGlb = path.join(OUT, "characters", `${slug}.glb`);

  // Prefer local raw FBX if present
  if (!(await exists(fbx))) {
    await download(`${CDN}/${race.fbxKey}`, fbx);
  }
  await download(`${CDN}/${race.atlasKey}`, atlas);

  console.log(`\n═══ race ${slug} (atlas rebind) ═══`);
  await runConvert([
    "fbx2gltf",
    fbx,
    "-o",
    rawGlb,
    "--cm-to-m",
    "--texture",
    atlas,
    "--no-meshopt",
  ]);
  await runConvert([
    "glb2glb",
    rawGlb,
    "-o",
    outGlb,
    "--height",
    String(race.height),
    "--texture-size",
    "1024",
  ]);
  const v = await verifyGlb(outGlb);
  const stats = await inspectTextures(outGlb);
  if (!stats || stats.textures < 1) {
    throw new Error(`YELLOW RISK: ${slug} has ${stats?.textures ?? 0} textures after atlas bake`);
  }
  console.log(`  OK textures=${stats.textures} mats=${stats.materials} meshes=${stats.meshes} ${v.bytes} B`);
  results.push({
    id: `characters/${slug}`,
    class: "characters",
    slug,
    r2Key: `${PROD}/characters/${slug}.glb`,
    cdnUrl: `${CDN}/${PROD}/characters/${slug}.glb`,
    contentType: "model/gltf-binary",
    bytes: v.bytes,
    sha256: v.sha256,
    magic: "glTF",
    heightM: race.height,
    textures: stats.textures,
    materials: stats.materials,
    meshes: stats.meshes,
    skins: stats.skins,
    pipeline: "fbx2gltf+atlas+glb2glb",
    package: "grudge6-races",
    yellowSafe: true,
    convertedAt: new Date().toISOString(),
    localPath: outGlb,
  });

  // human alias = wk
  if (race.id === "wk") {
    const human = path.join(OUT, "characters", "human.glb");
    await fs.copyFile(outGlb, human);
    const vh = await verifyGlb(human);
    results.push({
      id: "characters/human",
      class: "characters",
      slug: "human",
      r2Key: `${PROD}/characters/human.glb`,
      cdnUrl: `${CDN}/${PROD}/characters/human.glb`,
      contentType: "model/gltf-binary",
      bytes: vh.bytes,
      sha256: vh.sha256,
      magic: "glTF",
      heightM: race.height,
      textures: stats.textures,
      materials: stats.materials,
      meshes: stats.meshes,
      skins: stats.skins,
      pipeline: "alias:wk_characters",
      package: "grudge6-races",
      yellowSafe: true,
      convertedAt: new Date().toISOString(),
      localPath: human,
    });
  }
}

async function bakeFromLocalOrCdn(opts, results) {
  const { className, slug, localCandidates = [], cdnKey = null, height = null, packageId } = opts;
  const outGlb = path.join(OUT, className, `${slug}.glb`);
  await fs.mkdir(path.dirname(outGlb), { recursive: true });

  let src = null;
  for (const c of localCandidates) {
    if (await exists(c)) {
      src = c;
      break;
    }
  }
  if (!src && cdnKey) {
    const cache = path.join(ROOT, "raw/cdn-cache", path.basename(cdnKey));
    await download(`${CDN}/${cdnKey}`, cache);
    src = cache;
  }
  if (!src) throw new Error(`no source for ${className}/${slug}`);

  console.log(`\n═══ ${className}/${slug} ═══`);
  console.log(`  src ${src}`);

  const ext = path.extname(src).toLowerCase();
  const raw = outGlb.replace(/\.glb$/i, ".raw.glb");
  if (ext === ".fbx") {
    await runConvert(["fbx2gltf", src, "-o", raw, "--cm-to-m", "--no-meshopt"]);
    const args = ["glb2glb", raw, "-o", outGlb, "--texture-size", "1024"];
    if (height) args.push("--height", String(height));
    await runConvert(args);
  } else if (ext === ".glb" || ext === ".gltf") {
    const args = ["glb2glb", src, "-o", outGlb, "--texture-size", "1024"];
    if (height) args.push("--height", String(height));
    await runConvert(args);
  } else {
    throw new Error(`unsupported ext ${ext}`);
  }

  const v = await verifyGlb(outGlb);
  const stats = await inspectTextures(outGlb);
  const yellowSafe = (stats?.textures ?? 0) > 0 || className === "props" || className === "buildings";
  console.log(
    `  OK tex=${stats?.textures ?? "?"} mats=${stats?.materials ?? "?"} ${v.bytes} B yellowSafe=${yellowSafe}`,
  );
  results.push({
    id: `${className}/${slug}`,
    class: className,
    slug,
    r2Key: `${PROD}/${className}/${slug}.glb`,
    cdnUrl: `${CDN}/${PROD}/${className}/${slug}.glb`,
    contentType: "model/gltf-binary",
    bytes: v.bytes,
    sha256: v.sha256,
    magic: "glTF",
    heightM: height,
    textures: stats?.textures ?? 0,
    materials: stats?.materials ?? 0,
    meshes: stats?.meshes ?? 0,
    skins: stats?.skins ?? 0,
    pipeline: ext === ".fbx" ? "fbx2gltf+glb2glb" : "glb2glb",
    package: packageId,
    yellowSafe,
    yellowRisk: !yellowSafe && (stats?.textures ?? 0) === 0,
    convertedAt: new Date().toISOString(),
    localPath: outGlb,
    source: src,
  });
}

function buildPackages(results) {
  const byPkg = new Map();
  for (const a of results) {
    const p = a.package || "misc";
    if (!byPkg.has(p)) byPkg.set(p, []);
    byPkg.get(p).push(a);
  }
  const packages = [...byPkg.entries()].map(([id, assets]) => ({
    id,
    count: assets.length,
    yellowSafe: assets.every((a) => a.yellowSafe !== false && !a.yellowRisk),
    assets: assets.map((a) => ({
      id: a.id,
      cdnUrl: a.cdnUrl,
      r2Key: a.r2Key,
      textures: a.textures,
      heightM: a.heightM,
      bytes: a.bytes,
    })),
  }));
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    cdnBase: CDN,
    prefix: PROD,
    packages,
  };
}

function buildPrefabs(results) {
  const prefabs = results.map((a) => ({
    prefabId: `PFAB-${a.class.toUpperCase().slice(0, 4)}-${a.slug.toUpperCase().replace(/-/g, "_")}`,
    id: a.id,
    kind: a.class,
    name: a.slug.replace(/_/g, " "),
    mesh: {
      r2Key: a.r2Key,
      cdnUrl: a.cdnUrl,
      contentType: "model/gltf-binary",
      bytes: a.bytes,
      sha256: a.sha256,
      textures: a.textures,
      yellowSafe: a.yellowSafe && !a.yellowRisk,
    },
    colliderKey: a.r2Key.replace(/\.glb$/i, ".collider.json"),
    si: {
      heightM: a.heightM,
      unit: "meter",
    },
    package: a.package,
    tags: [a.class, a.package, a.yellowSafe ? "textured" : "untextured"].filter(Boolean),
  }));
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    cdnBase: CDN,
    count: prefabs.length,
    prefabs,
  };
}

async function main() {
  const doUpload = has("--upload");
  const remote = has("--remote");
  const dry = has("--dry-run");
  const skipRaces = has("--skip-races");
  const skipArmada = has("--skip-armada");

  console.log("grudge-convert doctor…");
  await runConvert(["doctor"]);

  if (dry) {
    console.log("Races:", RACES.map((r) => r.id).join(", "));
    console.log("Fantasy weapons:", FANTASY_WEAPONS.join(", "));
    process.exit(0);
  }

  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(PKG_DIR, { recursive: true });
  await fs.mkdir(path.dirname(INDEX_PATH), { recursive: true });

  const results = [];
  const failures = [];

  // ── 1. grudge6 races (yellow fix) ───────────────────────────────────────
  if (!skipRaces) {
    for (const race of RACES) {
      try {
        await bakeRace(race, results);
      } catch (e) {
        console.error(`  FAIL race ${race.id}:`, e.message);
        failures.push({ id: `characters/${race.id}_characters`, error: e.message });
      }
    }
  }

  // ── 2. Armada player + guns + enemies ───────────────────────────────────
  if (!skipArmada) {
    const armadaJobs = [
      {
        className: "characters",
        slug: "player",
        localCandidates: [armadaPath("player", "player.fbx"), armadaPath("player", "player.glb")],
        height: 1.85,
        packageId: "armada-core",
      },
      {
        className: "weapons",
        slug: "assault_rifle",
        localCandidates: [armadaPath("weapons", "assault_rifle.fbx"), armadaPath("weapons", "assault_rifle.glb")],
        packageId: "armada-core",
      },
      {
        className: "weapons",
        slug: "ak74u",
        localCandidates: [armadaPath("weapons", "ak74u.fbx"), armadaPath("weapons", "ak74u.glb")],
        packageId: "armada-core",
      },
      {
        className: "weapons",
        slug: "smg",
        localCandidates: [armadaPath("weapons", "smg.fbx"), armadaPath("weapons", "smg.glb")],
        packageId: "armada-core",
      },
      {
        className: "enemies",
        slug: "alien",
        localCandidates: [armadaPath("enemies", "alien.fbx"), armadaPath("enemies", "alien.glb")],
        height: 2.0,
        packageId: "armada-core",
      },
      {
        className: "enemies",
        slug: "mutant",
        localCandidates: [armadaPath("enemies", "mutant.fbx"), armadaPath("enemies", "mutant.glb")],
        height: 2.0,
        packageId: "armada-core",
      },
      {
        className: "enemies",
        slug: "spikeball",
        localCandidates: [armadaPath("enemies", "spikeball.fbx"), armadaPath("enemies", "spikeball.glb")],
        height: 1.2,
        packageId: "armada-core",
      },
    ];
    for (const job of armadaJobs) {
      try {
        await bakeFromLocalOrCdn(job, results);
      } catch (e) {
        console.error(`  FAIL ${job.slug}:`, e.message);
        failures.push({ id: `${job.className}/${job.slug}`, error: e.message });
      }
    }
  }

  // ── 3. Fantasy weapons from CDN → prod/gltf (needed by skill trees) ─────
  for (const w of FANTASY_WEAPONS) {
    try {
      await bakeFromLocalOrCdn(
        {
          className: "weapons",
          slug: w,
          localCandidates: [
            builderPath("weapons", `${w}.glb`),
            path.join(ROOT, "public", "models", "weapons", `${w}.glb`),
          ],
          cdnKey: `models/weapons/${w}.glb`,
          packageId: "fantasy-weapons",
        },
        results,
      );
    } catch (e) {
      console.error(`  FAIL weapon ${w}:`, e.message);
      failures.push({ id: `weapons/${w}`, error: e.message });
    }
  }

  // ── 4. Skeletons ────────────────────────────────────────────────────────
  for (const s of [
    { slug: "skeleton", file: "Skeleton.glb" },
    { slug: "skeleton_archer", file: "Skeleton_Archer.glb" },
  ]) {
    try {
      await bakeFromLocalOrCdn(
        {
          className: "skeletons",
          slug: s.slug,
          localCandidates: [
            builderPath("skeletons", "prod", s.file),
            builderPath("skeletons", s.file),
          ],
          cdnKey: `models/skeletons/${s.file}`,
          height: 1.8,
          packageId: "skeletons",
        },
        results,
      );
    } catch (e) {
      console.error(`  FAIL ${s.slug}:`, e.message);
      failures.push({ id: `skeletons/${s.slug}`, error: e.message });
    }
  }

  // ── 5. Props / structures (armada) ──────────────────────────────────────
  const props = [
    ["barrel", "terrain", "barrel.fbx"],
    ["bush", "terrain", "bush.fbx"],
    ["cabin", "structures", "cabin.fbx"],
    ["searchlight", "structures", "searchlight.fbx"],
    ["security_post", "structures", "security_post.fbx"],
    ["watchtower", "structures", "watchtower.fbx"],
  ];
  for (const [slug, folder, file] of props) {
    try {
      await bakeFromLocalOrCdn(
        {
          className: "props",
          slug,
          localCandidates: [armadaPath(folder, file), armadaPath(folder, file.replace(".fbx", ".glb"))],
          packageId: "armada-props",
        },
        results,
      );
    } catch (e) {
      console.error(`  FAIL prop ${slug}:`, e.message);
      failures.push({ id: `props/${slug}`, error: e.message });
    }
  }

  // ── 6. Creatures needed ─────────────────────────────────────────────────
  try {
    await bakeFromLocalOrCdn(
      {
        className: "enemies",
        slug: "lava_golem",
        localCandidates: [builderPath("creatures", "land", "lava_golem.glb")],
        cdnKey: "models/creatures/land/lava_golem.glb",
        height: 2.5,
        packageId: "creatures",
      },
      results,
    );
  } catch (e) {
    console.error("  FAIL lava_golem:", e.message);
    failures.push({ id: "enemies/lava_golem", error: e.message });
  }

  // ── Packages + prefabs ──────────────────────────────────────────────────
  const packages = buildPackages(results);
  const prefabs = buildPrefabs(results);
  await fs.writeFile(path.join(PKG_DIR, "grudge-prod-packages.json"), JSON.stringify(packages, null, 2));
  await fs.writeFile(path.join(PKG_DIR, "grudge-prod-prefabs.json"), JSON.stringify(prefabs, null, 2));

  // Merge CDN index
  let index = {
    version: 1,
    updatedAt: null,
    bucket: BUCKET,
    cdnBase: CDN,
    prefix: PROD,
    assets: [],
  };
  try {
    index = JSON.parse(await fs.readFile(INDEX_PATH, "utf8"));
  } catch {
    /* fresh */
  }
  const byId = new Map((index.assets || []).map((a) => [a.id, a]));
  for (const a of results) {
    const { localPath, source, ...pub } = a;
    byId.set(a.id, pub);
    // per-asset manifest next to glb
    const man = path.join(OUT, a.class, `${a.slug}.manifest.json`);
    await fs.writeFile(man, JSON.stringify(pub, null, 2));
  }
  index.assets = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
  index.updatedAt = new Date().toISOString();
  index.packagesUrl = `${CDN}/manifests/grudge-prod-packages.json`;
  index.prefabsUrl = `${CDN}/manifests/grudge-prod-prefabs.json`;
  await fs.writeFile(INDEX_PATH, JSON.stringify(index, null, 2));

  // ── Upload ──────────────────────────────────────────────────────────────
  if (doUpload) {
    for (const a of results) {
      try {
        await uploadR2(a.localPath, a.r2Key, "model/gltf-binary", remote);
        const man = a.localPath.replace(/\.glb$/i, ".manifest.json");
        if (await exists(man)) {
          await uploadR2(man, a.r2Key.replace(/\.glb$/i, ".manifest.json"), "application/json", remote);
        }
        const col = a.localPath.replace(/\.glb$/i, ".collider.json");
        if (await exists(col)) {
          await uploadR2(col, a.r2Key.replace(/\.glb$/i, ".collider.json"), "application/json", remote);
        }
      } catch (e) {
        console.error(`  upload FAIL ${a.id}:`, e.message);
        failures.push({ id: a.id, error: `upload: ${e.message}` });
      }
    }
    await uploadR2(INDEX_PATH, "manifests/assets-gltf-index.json", "application/json", remote);
    await uploadR2(
      path.join(PKG_DIR, "grudge-prod-packages.json"),
      "manifests/grudge-prod-packages.json",
      "application/json",
      remote,
    );
    await uploadR2(
      path.join(PKG_DIR, "grudge-prod-prefabs.json"),
      "manifests/grudge-prod-prefabs.json",
      "application/json",
      remote,
    );

    // Also ship races to legacy models/grudge6/races/ for older loaders
    for (const a of results.filter((x) => x.package === "grudge6-races" && x.slug.endsWith("_characters"))) {
      const raceId = a.slug.replace("_characters", "").toUpperCase();
      const legacy = `models/grudge6/races/${raceId}_Characters.glb`;
      try {
        await uploadR2(a.localPath, legacy, "model/gltf-binary", remote);
      } catch (e) {
        console.warn("  legacy race put warn:", e.message);
      }
    }
  }

  // Summary
  const yellowRisk = results.filter((a) => a.yellowRisk);
  console.log("\n════════════════════════════════════════");
  console.log(`OK ${results.length} assets · FAIL ${failures.length}`);
  console.log(`Packages: ${packages.packages.map((p) => `${p.id}(${p.count})`).join(", ")}`);
  console.log(`Prefabs: ${prefabs.count}`);
  if (yellowRisk.length) {
    console.log("YELLOW RISK (0 textures — material color only):");
    for (const a of yellowRisk) console.log(`  - ${a.id}`);
  }
  console.log(`Index: ${INDEX_PATH}`);
  console.log(`Packages: ${path.join(PKG_DIR, "grudge-prod-packages.json")}`);
  if (!doUpload) console.log("Tip: re-run with --upload --remote to ship CDN");
  if (failures.length) {
    console.log("Failures:");
    for (const f of failures) console.log(`  - ${f.id}: ${f.error.slice(0, 120)}`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

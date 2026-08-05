#!/usr/bin/env node
/**
 * toon-rts-inspect — agent/dev CLI for Unity Toon_RTS author pack.
 *
 * Usage:
 *   node bin/cli.mjs doctor
 *   node bin/cli.mjs inventory [--json out.json]
 *   node bin/cli.mjs meshes Elves|WK|ELF|all
 *   node bin/cli.mjs meta <path-to.meta>
 *   node bin/cli.mjs mat <path-to.mat>
 *   node bin/cli.mjs weapons ELF
 *
 * Binary FBX: use ObjectStore grudge-convert inspect after fbx2gltf, or Blender.
 * Mesh *names* for modular kits come from sibling .FBX.meta (no binary parse).
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  assertAuthorRoot,
  ZIP_PATH,
  AUTHOR_ROOT,
  EXTRACT_ROOT,
  RACES,
  PROD_ROOT,
} from "../lib/paths.mjs";
import { parseUnityMeta, parseUnityMat } from "../lib/unity-meta.mjs";
import { buildInventory } from "../lib/inventory.mjs";

const args = process.argv.slice(2);
const cmd = args[0] || "help";

function print(obj) {
  console.log(typeof obj === "string" ? obj : JSON.stringify(obj, null, 2));
}

function raceMatch(q) {
  const s = String(q || "").toLowerCase();
  return RACES.find(
    (r) =>
      r.folder.toLowerCase() === s ||
      r.prefix.toLowerCase().replace(/_$/, "") === s ||
      r.short === s ||
      r.libraryId === s ||
      (s === "high-elves" && r.short === "elf") ||
      (s === "elves" && r.short === "elf"),
  );
}

function doctor() {
  const root = assertAuthorRoot();
  const checks = [];
  const push = (ok, label, detail) => checks.push({ ok, label, detail });

  push(fs.existsSync(ZIP_PATH), "zip", ZIP_PATH);
  push(fs.existsSync(EXTRACT_ROOT), "extract", EXTRACT_ROOT);
  push(fs.existsSync(AUTHOR_ROOT), "junction AUTHOR_ROOT", AUTHOR_ROOT);
  push(!!root, "resolved author root", root);

  for (const r of RACES) {
    const fbx = path.join(root, r.folder, "models");
    const files = fs.existsSync(fbx)
      ? fs.readdirSync(fbx).filter((n) => /Characters_customizable\.FBX$/i.test(n))
      : [];
    push(files.length > 0, `race ${r.folder} character FBX`, files[0] || "MISSING");
    const meta = files[0] ? path.join(fbx, files[0] + ".meta") : null;
    push(!!(meta && fs.existsSync(meta)), `race ${r.folder} FBX.meta`, meta || "MISSING");
  }

  // optional backends
  const blender = process.env.BLENDER_PATH || "C:\\Users\\nugye\\tools\\Blender\\blender.exe";
  push(fs.existsSync(blender), "Blender portable", blender);

  const convertPkg = "F:\\GitHub\\ObjectStore\\tools\\grudge-convert\\bin\\grudge-convert.mjs";
  push(fs.existsSync(convertPkg), "grudge-convert CLI", convertPkg);

  let yamlOk = false;
  try {
    awaitImportYaml();
    yamlOk = true;
  } catch {
    yamlOk = false;
  }
  push(true, "yaml dep (optional for future)", yamlOk ? "installed or skip" : "run npm i in tools/toon-rts-inspect");

  const failed = checks.filter((c) => !c.ok);
  print({
    ok: failed.length === 0,
    authorRoot: root,
    note:
      "Mesh part names: read from *.FBX.meta internalIDToNameTable. " +
      "Binary FBX bake: ObjectStore npm run convert / bake:grudge6. " +
      ".mat/.meta are text YAML Unity format.",
    checks,
    failed: failed.map((c) => c.label),
  });
  process.exit(failed.length ? 1 : 0);
}

function awaitImportYaml() {
  // soft — package may not be installed yet
  return fs.existsSync(path.join(PROD_ROOT, "tools", "toon-rts-inspect", "node_modules", "yaml"));
}

function cmdInventory() {
  const root = assertAuthorRoot();
  const inv = buildInventory(root);
  const outIdx = args.indexOf("--json");
  if (outIdx >= 0 && args[outIdx + 1]) {
    const out = path.resolve(args[outIdx + 1]);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    // slim mesh lists for file size? keep full — agent needs weapons
    fs.writeFileSync(out, JSON.stringify(inv, null, 2));
    console.log("wrote", out);
  }
  // human summary
  console.log(`Author root: ${inv.authorRoot}`);
  console.log(`Races: ${inv.raceCount}/6\n`);
  for (const r of inv.races) {
    if (r.missing) {
      console.log(`  ${r.folder}: MISSING`);
      continue;
    }
    console.log(
      `  ${r.folder} (${r.prefix})  fbx=${r.counts.fbx} tga=${r.counts.tga} mat=${r.counts.mat}  meshParts=${r.meshTable?.meshPartCount ?? "?"} bones=${r.meshTable?.boneCount ?? "?"}`,
    );
    if (r.paths.characterFbx) {
      console.log(`    kit: ${path.relative(root, r.paths.characterFbx)}`);
    }
  }
}

function cmdMeshes() {
  const root = assertAuthorRoot();
  const q = args[1] || "all";
  const wantAllNames = args.includes("--all-names");
  const list = q === "all" ? RACES : [raceMatch(q)].filter(Boolean);
  if (!list.length) {
    console.error("Unknown race:", q, "— use Elves|WK|BRB|ELF|DWF|ORC|UD|all");
    process.exit(1);
  }
  const out = {};
  for (const r of list) {
    const inv = buildInventory(root).races.find((x) => x.folder === r.folder);
    const rawParts = inv?.meshTable?.meshParts || [];
    // Unity .meta tables sometimes list foreign race names; default filter to this prefix
    const pref = r.prefix.replace(/_$/, "");
    const prefRe = new RegExp(`^${pref}_`, "i");
    const parts = wantAllNames ? rawParts : rawParts.filter((n) => prefRe.test(n));
    const foreign = rawParts.filter((n) => !prefRe.test(n));
    const weapons = parts.filter((n) =>
      /sword|axe|hammer|bow|staff|spear|dagger|shield|quiver|pick|bolt/i.test(n),
    );
    const body = parts.filter((n) =>
      /body|arms|legs|head|haed|shoulder|bag|wood/i.test(n),
    );
    out[r.folder] = {
      characterFbx: inv?.paths?.characterFbx,
      note: wantAllNames
        ? "all names from .meta (may include foreign prefixes)"
        : `filtered to ${r.prefix}* (pass --all-names for raw meta table)`,
      meshPartCount: parts.length,
      metaTableTotal: rawParts.length,
      foreignPrefixCount: foreign.length,
      weapons,
      bodyGear: body,
      allParts: parts,
      bones: inv?.meshTable?.bones || [],
    };
  }
  print(out);
}

function cmdMeta() {
  const p = args[1];
  if (!p || !fs.existsSync(p)) {
    console.error("Usage: meta <path-to.meta>");
    process.exit(1);
  }
  print(parseUnityMeta(path.resolve(p)));
}

function cmdMat() {
  const p = args[1];
  if (!p || !fs.existsSync(p)) {
    console.error("Usage: mat <path-to.mat>");
    process.exit(1);
  }
  print(parseUnityMat(path.resolve(p)));
}

function cmdWeapons() {
  args[1] = args[1] || "ELF";
  // reuse meshes filter
  process.argv = [process.argv[0], process.argv[1], "meshes", args[1]];
  cmdMeshes();
}

function cmdFbxInspect() {
  // Optional: shell out to grudge-convert after fbx2gltf — heavy
  const fbx = args[1];
  if (!fbx || !fs.existsSync(fbx)) {
    console.error("Usage: fbx-inspect <path-to.fbx>");
    console.error("Requires ObjectStore grudge-convert. Prefer: meshes <race> (from .meta).");
    process.exit(1);
  }
  const convert = "F:\\GitHub\\ObjectStore\\tools\\grudge-convert\\bin\\grudge-convert.mjs";
  if (!fs.existsSync(convert)) {
    console.error("grudge-convert not found at", convert);
    process.exit(1);
  }
  const tmp = path.join(PROD_ROOT, "tools", "toon-rts-inspect", ".tmp");
  fs.mkdirSync(tmp, { recursive: true });
  const rawGlb = path.join(tmp, path.basename(fbx, path.extname(fbx)) + ".raw.glb");
  console.error("fbx2gltf →", rawGlb);
  let r = spawnSync(process.execPath, [convert, "fbx2gltf", fbx, "-o", rawGlb, "--no-meshopt"], {
    encoding: "utf8",
    env: {
      ...process.env,
      BLENDER_PATH: process.env.BLENDER_PATH || "C:\\Users\\nugye\\tools\\Blender\\blender.exe",
    },
  });
  if (r.status !== 0) {
    console.error(r.stdout || "", r.stderr || "");
    process.exit(r.status || 1);
  }
  r = spawnSync(process.execPath, [convert, "inspect", rawGlb], { encoding: "utf8" });
  console.log(r.stdout || r.stderr);
  process.exit(r.status || 0);
}

function help() {
  print(`toon-rts-inspect — Unity Toon_RTS author pack reader

Author root (junction): ${AUTHOR_ROOT}
Extract:                ${EXTRACT_ROOT}
Zip:                    ${ZIP_PATH}

Commands:
  doctor                 Check paths + race FBX/.meta presence
  inventory [--json f]   All races: counts, FBX, TGA, mesh tables
  meshes <race|all>      Mesh/weapon parts from *.FBX.meta
  weapons <race>         Alias → meshes filtered to weapons
  meta <file.meta>       Parse one Unity .meta
  mat <file.mat>         Parse one Unity .mat
  fbx-inspect <file.fbx> Heavy: grudge-convert fbx2gltf + inspect

Readable without binary:
  .meta  .mat  .controller (text)  .tga (bytes/sharp)  folder layout
Binary via convert/Blender:
  .fbx  → production GLB (ObjectStore bake:grudge6)
`);
}

async function main() {
  switch (cmd) {
    case "doctor":
      return doctor();
    case "inventory":
      return cmdInventory();
    case "meshes":
      return cmdMeshes();
    case "weapons":
      return cmdWeapons();
    case "meta":
      return cmdMeta();
    case "mat":
      return cmdMat();
    case "fbx-inspect":
      return cmdFbxInspect();
    case "help":
    case "-h":
    case "--help":
      return help();
    default:
      console.error("Unknown command:", cmd);
      help();
      process.exit(1);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

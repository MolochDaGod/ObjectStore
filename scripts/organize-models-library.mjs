/**
 * Classify D:\Games\Models into library role folders (copy, never move source).
 *
 * Best-practice apply:
 *   node scripts/organize-models-library.mjs --apply
 *
 * Options:
 *   --dry-run          (default if no --apply)
 *   --apply            copy files
 *   --root <path>      default D:/Games/Models
 *   --zips             include zip/rar/7z in scan
 *   --include-unsorted also copy unclassified GLB/FBX into staged/unsorted
 *   --depth N          walk depth (default 3)
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : d;
};

const ROOT = opt("--root", "D:/Games/Models");
const LIB = path.join(ROOT, "library");
const APPLY = flag("--apply");
const INCLUDE_ZIPS = flag("--zips");
const INCLUDE_UNSORTED = flag("--include-unsorted");
const MAX_DEPTH = Number(opt("--depth", "3")) || 3;

const ROLE_PATTERNS = [
  { role: "characters", re: /character|hero|human|orc|elf|dwarf|knight|mage|skeleton|goblin|bandit|adventurer|warrior|ranger|npc|villager|grudge6|toon_character|wk_|brb_|dwf_|ud_|barbarian|footman|wizard|priest|archer|swordsman/i },
  { role: "weapons", re: /weapon|sword|axe|bow|staff|shield|gun|spear|hammer|dagger|rifle|kaykit.*weapon|fantasyweapons|pistol|ballista|bolt|arrow|wand|mace/i },
  { role: "buildings", re: /building|house|tower|castle|fortress|dock|port|wall|bridge|kaykit|medieval.*fort|dungeon|modular|temple|church|tavern|plaza|village|shop|barn|forge|blacksmith/i },
  { role: "nature", re: /tree|nature|rock|vegetation|forest|plant|flower|ore|mineral|cliff|biome|stylized|grass|bush|foliage|pine|palm|oak|mushroom|dirt/i },
  { role: "creatures", re: /creature|dragon|wolf|bear|monster|animal|drake|golem|spider|shark|fish|werewolf|deer|owl|cheetah|crocodile|reptile|ifrit|crab|zombie|troll|ogre/i },
  { role: "voxels", re: /voxel|magica|\.vox$|blockbench|tvs|minecraft_block|block_character/i },
  { role: "vehicles", re: /ship|boat|raft|vehicle|mech|spaceship|car|wagon|cavalry|drakkar|sail|liferaft|dock\s/i },
  { role: "animations", re: /anim|locomotion|mixamo|gesture|combat.*pack|basic locomotion|@walk|@run|@idle|@attack/i },
  { role: "props", re: /prop|chest|crate|barrel|furniture|campfire|torch|icon|ui|table|chair|lantern|potion|coin|ladder|chest|dummy|workbench|furnace|anchor/i },
];

const QUARANTINE_RE = /meshy|meshy_ai|ai_biped|ai_generated|verdant_edge.*meshy/i;

const EXT_3D = new Set([".glb", ".gltf", ".fbx", ".obj", ".vox", ".blend"]);
const EXT_TEX = new Set([".webp", ".png", ".jpg", ".jpeg", ".tga"]);
const EXT_META = new Set([".json"]);
const EXT_ZIP = new Set([".zip", ".rar", ".7z"]);

const EXT_OK = new Set([...EXT_3D, ...EXT_TEX, ...EXT_META]);
if (INCLUDE_ZIPS) EXT_ZIP.forEach((e) => EXT_OK.add(e));

const SKIP_DIRS = new Set([
  "library",
  "node_modules",
  ".git",
  "dist",
  "_models_unzip",
  "Windows",
  "Program Files",
]);

function roleFor(name) {
  if (QUARANTINE_RE.test(name)) return "quarantine_meshy";
  for (const { role, re } of ROLE_PATTERNS) {
    if (re.test(name)) return role;
  }
  return "unsorted";
}

function walk(dir, out = [], depth = 0) {
  if (depth > MAX_DEPTH) return out;
  let ents;
  try {
    ents = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of ents) {
    if (ent.name.startsWith(".")) continue;
    if (SKIP_DIRS.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out, depth + 1);
    else out.push(p);
  }
  return out;
}

function shortHash(s) {
  return crypto.createHash("sha1").update(s).digest("hex").slice(0, 8);
}

function destPath(role, filePath) {
  const base = path.basename(filePath);
  const ext = path.extname(base).toLowerCase();
  // Prefer 3D under staged/<role>/ ; textures under staged/<role>/textures/
  const sub =
    EXT_TEX.has(ext) ? path.join(role, "textures") :
    EXT_ZIP.has(ext) ? path.join(role, "archives") :
    role;
  const dir = role === "quarantine_meshy"
    ? path.join(LIB, "raw", "quarantine_meshy")
    : path.join(LIB, "staged", sub);
  // Avoid overwrite collisions: same basename different folders
  const collision = path.join(dir, base);
  if (fs.existsSync(collision)) {
    const h = shortHash(filePath);
    const stem = path.basename(base, ext);
    return path.join(dir, `${stem}__${h}${ext}`);
  }
  return path.join(dir, base);
}

function shouldCopy(role, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  // Always quarantine meshy 3D
  if (role === "quarantine_meshy") return EXT_3D.has(ext) || EXT_ZIP.has(ext);
  // Role-matched: prefer 3D + json; textures only if role matched (not unsorted dump of every png)
  if (role === "unsorted") {
    if (!INCLUDE_UNSORTED) return false;
    return EXT_3D.has(ext);
  }
  if (EXT_3D.has(ext) || EXT_META.has(ext)) return true;
  if (EXT_TEX.has(ext)) return true; // role-matched textures
  if (INCLUDE_ZIPS && EXT_ZIP.has(ext)) return true;
  return false;
}

// Ensure tree
for (const r of [
  "characters", "weapons", "buildings", "nature", "creatures",
  "voxels", "vehicles", "animations", "props", "unsorted",
]) {
  fs.mkdirSync(path.join(LIB, "staged", r), { recursive: true });
}
fs.mkdirSync(path.join(LIB, "raw", "vox"), { recursive: true });
fs.mkdirSync(path.join(LIB, "raw", "quarantine_meshy"), { recursive: true });
fs.mkdirSync(path.join(LIB, "production"), { recursive: true });
fs.mkdirSync(path.join(LIB, "seeds"), { recursive: true });
fs.mkdirSync(path.join(LIB, "inventory"), { recursive: true });

console.log(`[organize] root=${ROOT} apply=${APPLY} depth=${MAX_DEPTH}`);
const files = walk(ROOT).filter((f) => EXT_OK.has(path.extname(f).toLowerCase()));
console.log(`[organize] scanned ${files.length} candidate files`);

const plan = [];
const skipped = { unsorted: 0, other: 0 };
for (const f of files) {
  // never re-copy from library into itself
  if (f.replace(/\\/g, "/").includes("/library/")) {
    skipped.other++;
    continue;
  }
  const base = path.basename(f);
  const role = roleFor(base);
  if (!shouldCopy(role, f)) {
    if (role === "unsorted") skipped.unsorted++;
    else skipped.other++;
    continue;
  }
  plan.push({ from: f, to: destPath(role, f), role });
}

const byRole = {};
for (const p of plan) byRole[p.role] = (byRole[p.role] || 0) + 1;

const report = {
  generatedAt: new Date().toISOString(),
  apply: APPLY,
  root: ROOT,
  scanned: files.length,
  planned: plan.length,
  skipped,
  byRole,
};

console.log(JSON.stringify({ ...report, sample: plan.slice(0, 8) }, null, 2));

let copied = 0;
let existed = 0;
let failed = 0;
if (APPLY) {
  for (const p of plan) {
    try {
      fs.mkdirSync(path.dirname(p.to), { recursive: true });
      if (fs.existsSync(p.to)) {
        existed++;
        continue;
      }
      fs.copyFileSync(p.from, p.to);
      copied++;
      if (copied % 200 === 0) console.log(`[organize] copied ${copied}…`);
    } catch (e) {
      failed++;
      if (failed < 10) console.warn("fail", p.from, e.message);
    }
  }
}

// Production promote candidates: unique GLBs under staged (non-quarantine)
const promote = [];
if (APPLY || true) {
  const stagedRoot = path.join(LIB, "staged");
  function walkGlb(dir, role) {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walkGlb(p, role || ent.name);
      else if (/\.glb$/i.test(ent.name)) {
        promote.push({
          role: role || path.basename(dir),
          file: ent.name,
          staged: p,
          production: path.join(LIB, "production", role || path.basename(dir), ent.name),
          r2Key: `models/${role || path.basename(dir)}/${ent.name}`,
          bake: "npm run convert -- glb2glb <staged> -o <production> --texture-size 1024",
        });
      }
    }
  }
  walkGlb(stagedRoot);
}

report.copied = copied;
report.existed = existed;
report.failed = failed;
report.promoteGlbCount = promote.length;

const invDir = path.join(LIB, "inventory");
fs.writeFileSync(path.join(invDir, "organize-report.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(invDir, "organize-plan.json"), JSON.stringify({ ...report, plan: plan.slice(0, 8000) }, null, 2));
fs.writeFileSync(
  path.join(invDir, "production-promote-map.json"),
  JSON.stringify({ generatedAt: report.generatedAt, count: promote.length, items: promote.slice(0, 3000) }, null, 2),
);

// README for humans
fs.writeFileSync(
  path.join(LIB, "README.md"),
  `# Grudge Models Library

Organized from \`D:\\\\Games\\\\Models\` for fleet bake + CDN deploy.

## Layout

- \`raw/vox/\` — MagicaVoxel sources (e.g. Models.vox, 363 objects)
- \`raw/quarantine_meshy/\` — banned AI/Meshy sources (never seed as player defaults)
- \`staged/<role>/\` — classified GLB/FBX/OBJ ready for grudge-convert
- \`production/<role>/\` — **only** place after \`grudge-convert\` bake
- \`seeds/\` — game mode + catalog seeds
- \`inventory/\` — organize reports + VOX inventory

## Apply / re-run

\`\`\`bash
cd F:\\\\GitHub\\\\ObjectStore
node scripts/organize-models-library.mjs --apply
\`\`\`

## Bake + ship

\`\`\`bash
npm run convert -- glb2glb library/staged/weapons/foo.glb -o library/production/weapons/foo.glb --texture-size 1024
# then wrangler r2 put models/weapons/foo.glb --file=...
\`\`\`

See ObjectStore \`docs/ASSET_LIBRARY_AND_GLTF_BAKE.md\`.

Report: inventory/organize-report.json  
Promote map: inventory/production-promote-map.json  
`,
);

console.log(`[organize] done copied=${copied} existed=${existed} failed=${failed} promoteGlbs=${promote.length}`);
console.log(`[organize] report → ${path.join(invDir, "organize-report.json")}`);

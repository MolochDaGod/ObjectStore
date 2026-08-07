/**
 * Audit Warlords Toon RTS PLAY coverage — finds surfaces that should use
 * loadRaceKit / contract stamp but may still use banned patterns.
 *
 * Does NOT invent a second character system — only reports reachability.
 *
 * Usage:
 *   node scripts/audit-warlords-play-surfaces.mjs
 *   node scripts/audit-warlords-play-surfaces.mjs --local-roots
 *   node scripts/audit-warlords-play-surfaces.mjs --roots F:/GitHub/grudge-multiverse,C:/Users/nugye/Documents/CastingAbilitiesThreeJS
 *
 * Exit 0 = all live checks ok + no critical local risks when --local-roots used
 * Exit 1 = fail
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const EXPECT = "2026-08-07.harden.1";

const CONTRACT_URLS = [
  "https://info.grudge-studio.com/api/v1/grudge6-warlords-play-contract.json",
  "https://assets.grudge-studio.com/api/v1/grudge6-warlords-play-contract.json",
];

const SURFACES_PATH = path.join(ROOT, "api/v1/grudge6-warlords-play-surfaces.json");

const BANNED_RE = [
  { id: "multi_pose", re: /\.skeleton\.pose\s*\(/ },
  { id: "unify_play", re: /unifySkeletons\s*\(/ },
  { id: "scaffold_old", re: /scaffoldGrudge6Kit\s*\(/ },
  { id: "force_atlas_true", re: /forceAtlas\s*:\s*true/ },
  { id: "face_plus_z_true", re: /facePlusZ\s*:\s*true/ },
  { id: "metaverse_path", re: /models\/grudge6\/metaverse/ },
  { id: "races_bake_play_url", re: /models\/grudge6\/races\/[A-Z]+_Characters\.glb/ },
];

const GOOD_RE = [
  { id: "toon_path", re: /toon-rts-characters\/glb\/characters/ },
  { id: "contract_stamp", re: /warlordsPlayContract/ },
  { id: "load_race_kit", re: /loadRaceKit/ },
  { id: "assert_play", re: /assertPlayKitUrl/ },
  { id: "bone_si", re: /measureBoneStructural|fitRootUniformSi|measureBoneBox/ },
];

const SKIP_DIR = /node_modules|[/\\]dist[/\\]|[/\\]\.git[/\\]|vendor|raw[/\\]|prod[/\\]anims|assets[/\\]index-/i;

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    let st;
    try {
      st = fs.statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (SKIP_DIR.test(p)) continue;
      walk(p, out);
    } else if (/\.(js|ts|tsx|mjs)$/.test(name) && !SKIP_DIR.test(p)) {
      out.push(p);
    }
  }
  return out;
}

async function fetchJson(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function headOk(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.ok;
  } catch {
    return false;
  }
}

function scanRoot(rootDir) {
  const files = walk(rootDir);
  const good = {};
  const bad = {};
  for (const f of files) {
    let text;
    try {
      text = fs.readFileSync(f, "utf8");
    } catch {
      continue;
    }
    // skip pure ban-list comments files that only document bans
    const rel = path.relative(rootDir, f);
    for (const g of GOOD_RE) {
      if (g.re.test(text)) good[g.id] = good[g.id] || rel;
    }
    for (const b of BANNED_RE) {
      if (!b.re.test(text)) continue;
      // allow deprecation throws and docs
      if (/PURGED|throw new Error|@deprecated|BANNED|do not|never reintroduce/i.test(text) &&
          (text.includes("PURGED") || text.includes("throw new Error"))) {
        // still record if it's an active call not only ban text — heuristic:
        if (b.id === "scaffold_old" && /throw new Error[\s\S]*scaffoldGrudge6Kit|scaffoldGrudge6Kit[\s\S]*throw/.test(text)) {
          continue; // intentional kill switch
        }
      }
      if (!bad[b.id]) bad[b.id] = [];
      if (bad[b.id].length < 5) bad[b.id].push(rel);
    }
  }
  return { good, bad, fileCount: files.length };
}

function parseArgs(argv) {
  const args = { localRoots: false, roots: [] };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--local-roots") args.localRoots = true;
    if (argv[i] === "--roots" && argv[i + 1]) {
      args.roots = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
      args.localRoots = true;
    }
  }
  return args;
}

const DEFAULT_LOCAL = [
  ROOT,
  path.join(ROOT, "..", "grudge-multiverse"),
  path.join("C:", "Users", "nugye", "Documents", "CastingAbilitiesThreeJS"),
  path.join("F:", "GitHub", "Flare-Boss-Arena", "Flare-Boss-Arena"),
  path.join("C:", "Users", "nugye", "Documents", "gameopen"),
  path.join("C:", "Users", "nugye", "Documents", "character-customizer-10slot"),
];

async function main() {
  const args = parseArgs(process.argv);
  let fails = 0;

  console.log("[audit] Warlords Toon RTS play surface coverage");
  console.log("[audit] expect contract", EXPECT);

  // 1) Live contract
  let contract = null;
  for (const u of CONTRACT_URLS) {
    try {
      contract = await fetchJson(u);
      console.log("[audit] OK contract", u, "v=", contract.version);
      break;
    } catch (e) {
      console.warn("[audit] contract miss", u, e.message);
    }
  }
  if (!contract) {
    console.error("[audit] FAIL no contract JSON reachable");
    fails++;
  } else if (contract.version !== EXPECT) {
    console.warn("[audit] WARN contract version", contract.version, "!=", EXPECT);
  }

  // 2) Six kits HEAD
  const races = contract?.play?.raceIds || [
    "human",
    "barbarian",
    "elf",
    "dwarf",
    "orc",
    "undead",
  ];
  console.log("[audit] CDN kits…");
  for (const r of races) {
    const u = `https://assets.grudge-studio.com/asset-packs/toon-rts-characters/glb/characters/${r}.glb`;
    const ok = await headOk(u);
    console.log(ok ? "  OK" : "  FAIL", r);
    if (!ok) fails++;
  }

  // 3) Surface registry
  let surfaces = [];
  if (fs.existsSync(SURFACES_PATH)) {
    const reg = JSON.parse(fs.readFileSync(SURFACES_PATH, "utf8"));
    surfaces = reg.surfaces || [];
    console.log("[audit] registry surfaces", surfaces.length);
  }

  for (const s of surfaces) {
    if (!s.live || s.status === "n/a") continue;
    if (s.live.startsWith("http://localhost")) continue;
    const ok = await headOk(s.live);
    console.log(
      ok ? "  LIVE OK" : "  LIVE FAIL",
      s.id,
      s.status,
      s.live.replace(/https?:\/\//, ""),
    );
    if (!ok && s.status === "green") fails++;
  }

  // 4) Local roots (optional)
  if (args.localRoots) {
    const roots = args.roots.length ? args.roots : DEFAULT_LOCAL.filter((p) => fs.existsSync(p));
    console.log("[audit] local roots", roots.length);
    for (const root of roots) {
      if (!fs.existsSync(root)) {
        console.log("  MISS", root);
        continue;
      }
      const { good, bad, fileCount } = scanRoot(root);
      const name = path.basename(root);
      console.log(`\n  === ${name} (${fileCount} files) ===`);
      console.log("  GOOD:", Object.keys(good).join(", ") || "(none)");
      const riskKeys = Object.keys(bad);
      if (riskKeys.length) {
        console.log("  RISK:");
        for (const k of riskKeys) {
          console.log(`    ${k}: ${bad[k].slice(0, 3).join("; ")}`);
        }
        // ObjectStore / Casting may have banned strings only in kill-switch — soft
        if (!good.contract_stamp && !good.load_race_kit && !good.toon_path) {
          console.error("  FAIL no Toon/contract markers in play code");
          fails++;
        }
      } else {
        console.log("  RISK: none");
      }
    }
  }

  // 5) Summary matrix
  console.log("\n[audit] STATUS MATRIX (from registry)");
  for (const s of surfaces) {
    console.log(
      `  ${String(s.status).padEnd(6)} ${s.id.padEnd(18)} ${s.role.padEnd(18)} ${s.notes?.slice(0, 60) || ""}`,
    );
  }

  console.log(
    "\n[audit]",
    fails === 0 ? "PASS" : `FAIL (${fails})`,
    "— green=on contract, yellow=partial, audit=needs wire, n/a=not Warlords body",
  );
  process.exit(fails === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

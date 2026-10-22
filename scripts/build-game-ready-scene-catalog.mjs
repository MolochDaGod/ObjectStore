#!/usr/bin/env node
/**
 * Build production SCENE-READY asset catalog for agentic services + Forge.
 *
 * Rules (HARD):
 *  - Only https://assets.grudge-studio.com keys that HEAD 200 (not HTML)
 *  - Prefer meshopt GLB / known production packs
 *  - Characters SI ~1.8 m; never invent r2Keys
 *  - github.io ObjectStore models/_game-ready/* is NOT production scene SSOT
 *    unless mirrored to R2 (those stay lab/export only)
 *
 * Usage:
 *   node scripts/build-game-ready-scene-catalog.mjs
 *   node scripts/build-game-ready-scene-catalog.mjs --json
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const CDN = "https://assets.grudge-studio.com";
const args = new Set(process.argv.slice(2));

/** Curated production seeds — sized/baked for scenes (verified pipeline). */
const CURATED = [
  // Toon RTS single-mesh heroes (SI play)
  {
    id: "toon-human",
    label: "Toon RTS · Human",
    group: "characters",
    r2Key: "asset-packs/toon-rts-characters/glb/characters/human.glb",
    builtin: "builtin:race:warrior",
    si: { heightM: 1.8, note: "human yardstick" },
    bake: "toon-rts-glb",
    anim: "Bip001 packs optional",
  },
  {
    id: "toon-orc",
    label: "Toon RTS · Orc",
    group: "characters",
    r2Key: "asset-packs/toon-rts-characters/glb/characters/orc.glb",
    builtin: "builtin:race:orc",
    si: { heightM: 2.0, note: "orc ~2 m" },
    bake: "toon-rts-glb",
  },
  {
    id: "toon-elf",
    label: "Toon RTS · Elf",
    group: "characters",
    r2Key: "asset-packs/toon-rts-characters/glb/characters/elf.glb",
    builtin: "builtin:race:elf",
    si: { heightM: 1.8 },
    bake: "toon-rts-glb",
  },
  {
    id: "toon-dwarf",
    label: "Toon RTS · Dwarf",
    group: "characters",
    r2Key: "asset-packs/toon-rts-characters/glb/characters/dwarf.glb",
    builtin: "builtin:race:dwarf",
    si: { heightM: 1.4 },
    bake: "toon-rts-glb",
  },
  {
    id: "toon-barbarian",
    label: "Toon RTS · Barbarian",
    group: "characters",
    r2Key: "asset-packs/toon-rts-characters/glb/characters/barbarian.glb",
    builtin: "builtin:race:frost-dwarf",
    si: { heightM: 1.85 },
    bake: "toon-rts-glb",
  },
  {
    id: "toon-undead",
    label: "Toon RTS · Undead",
    group: "characters",
    r2Key: "asset-packs/toon-rts-characters/glb/characters/undead.glb",
    builtin: "builtin:race:skeleton",
    si: { heightM: 1.8 },
    bake: "toon-rts-glb",
  },
  // grudge6 modular kits (production GLB)
  {
    id: "g6-wk",
    label: "Grudge6 · WK kit",
    group: "characters",
    r2Key: "models/grudge6/races/WK_Characters.glb",
    builtin: "builtin:grudge6:warrior",
    si: { heightM: 1.8, modular: true },
    bake: "grudge6-glb",
    anim: "Bip001 sword_shield/longbow/magic",
  },
  {
    id: "g6-orc",
    label: "Grudge6 · ORC kit",
    group: "characters",
    r2Key: "models/grudge6/races/ORC_Characters.glb",
    builtin: "builtin:grudge6:orc",
    si: { heightM: 2.0, modular: true },
    bake: "grudge6-glb",
  },
  {
    id: "g6-elf",
    label: "Grudge6 · ELF kit",
    group: "characters",
    r2Key: "models/grudge6/races/ELF_Characters.glb",
    builtin: "builtin:grudge6:elf",
    si: { heightM: 1.8, modular: true },
    bake: "grudge6-glb",
  },
  {
    id: "g6-dwf",
    label: "Grudge6 · DWF kit",
    group: "characters",
    r2Key: "models/grudge6/races/DWF_Characters.glb",
    builtin: "builtin:grudge6:dwarf",
    si: { heightM: 1.4, modular: true },
    bake: "grudge6-glb",
  },
  {
    id: "g6-brb",
    label: "Grudge6 · BRB kit",
    group: "characters",
    r2Key: "models/grudge6/races/BRB_Characters.glb",
    builtin: "builtin:grudge6:frost-dwarf",
    si: { heightM: 1.85, modular: true },
    bake: "grudge6-glb",
  },
  {
    id: "g6-ud",
    label: "Grudge6 · UD kit",
    group: "characters",
    r2Key: "models/grudge6/races/UD_Characters.glb",
    builtin: "builtin:grudge6:skeleton",
    si: { heightM: 1.8, modular: true },
    bake: "grudge6-glb",
  },
  // Weapons (library — SI, not fit to 1.8)
  {
    id: "wpn-wk-sword",
    label: "WK Sword A",
    group: "weapons",
    r2Key: "models/grudge6/races/library/human/WK_weapon_sword_A.glb",
    si: { lengthM: "~1.0", note: "never fit to human height" },
    bake: "grudge6-library-glb",
  },
  {
    id: "wpn-elf-bow",
    label: "ELF Bow",
    group: "weapons",
    r2Key: "models/grudge6/races/library/elf/ELF_weapon_bow.glb",
    si: { lengthM: "~1.2" },
    bake: "grudge6-library-glb",
  },
  {
    id: "wpn-orc-axe",
    label: "ORC Axe A",
    group: "weapons",
    r2Key: "models/grudge6/races/library/orc/ORC_weapon_Axe_A.glb",
    si: { lengthM: "~1.1" },
    bake: "grudge6-library-glb",
  },
  {
    id: "wpn-dwf-axe",
    label: "DWF Axe A",
    group: "weapons",
    r2Key: "models/grudge6/races/library/dwarf/DWF_Weapon_axe_A.glb",
    bake: "grudge6-library-glb",
  },
  {
    id: "wpn-brb-hammer",
    label: "BRB Hammer A",
    group: "weapons",
    r2Key: "models/grudge6/races/library/barbarian/BRB_weapon_hammer_A.glb",
    bake: "grudge6-library-glb",
  },
  {
    id: "wpn-ud-sword",
    label: "UD Sword A",
    group: "weapons",
    r2Key: "models/grudge6/races/library/undead/UD_weapon_Sword_A.glb",
    bake: "grudge6-library-glb",
  },
  // Maps / buildings (CDN verified)
  {
    id: "map-pirate",
    label: "Pirate Islands",
    group: "maps",
    r2Key: "models/lobby/pirate-islands/scene.glb",
    builtin: "builtin:map-pirate-islands-scene",
    si: { note: "world map SI metres" },
    bake: "production-map",
  },
  {
    id: "map-encampment",
    label: "Encampment",
    group: "maps",
    r2Key: "builtin/map-encampment.glb",
    builtin: "builtin:map-encampment",
    bake: "forge-builtin-r2",
  },
  {
    id: "map-cyberpunk",
    label: "Cyberpunk",
    group: "maps",
    r2Key: "builtin/map-cyberpunk.glb",
    builtin: "builtin:map-cyberpunk",
    bake: "forge-builtin-r2",
  },
  {
    id: "map-fort-royale",
    label: "Fort Royale",
    group: "maps",
    r2Key: "builtin/map-fort-royale.glb",
    builtin: "builtin:map-fort-royale",
    bake: "forge-builtin-r2",
  },
  {
    id: "map-underground",
    label: "Underground Wars",
    group: "maps",
    r2Key: "builtin/map-underground-wars.glb",
    builtin: "builtin:map-underground-wars",
    bake: "forge-builtin-r2",
  },
  {
    id: "bldg-tavern",
    label: "Orc Tavern",
    group: "buildings",
    r2Key: "models/orc_settlement/Tavern.glb",
    builtin: "builtin:rts-bldg-townhall",
    bake: "rts-glb",
  },
  {
    id: "bldg-smithy",
    label: "Orc Smithy",
    group: "buildings",
    r2Key: "models/orc_settlement/Smithy.glb",
    builtin: "builtin:rts-bldg-barracks",
    bake: "rts-glb",
  },
  {
    id: "tower-archer",
    label: "Archer Tower L1",
    group: "buildings",
    r2Key: "models/battle_towers/Archer_Tower_L1.glb",
    builtin: "builtin:rts-tower-archer",
    bake: "rts-glb",
  },
  {
    id: "hero-blake",
    label: "Blake",
    group: "characters",
    r2Key: "builtin/blake.glb",
    builtin: "builtin:blake",
    si: { heightM: 1.8 },
    bake: "forge-builtin-r2",
  },
];

async function headOk(r2Key) {
  const url = `${CDN}/${r2Key.replace(/^\//, "")}`;
  try {
    const r = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(12000),
    });
    const ct = r.headers.get("content-type") || "";
    const cl = Number(r.headers.get("content-length") || 0);
    const ok = r.ok && !ct.includes("text/html");
    return {
      ok,
      status: r.status,
      contentType: ct,
      bytes: cl || null,
      url,
    };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      error: e instanceof Error ? e.message : String(e),
      url,
    };
  }
}

async function main() {
  const items = [];
  const failed = [];
  for (const c of CURATED) {
    const head = await headOk(c.r2Key);
    const entry = {
      ...c,
      cdnUrl: `${CDN}/${c.r2Key}`,
      sceneReady: head.ok,
      head,
      loadInScene: head.ok
        ? c.builtin || `https://assets.grudge-studio.com/${c.r2Key}`
        : null,
      agentSpawn: head.ok
        ? {
            preferred: c.builtin || null,
            absolute: `${CDN}/${c.r2Key}`,
            tools: ["spawn_fast_asset", "add_model_entity", "spawn_fleet_asset"],
          }
        : null,
    };
    if (head.ok) items.push(entry);
    else failed.push(entry);
  }

  // Annotate ObjectStore models3d-game: lab game-ready (github.io) — not auto-included
  let models3dNote = null;
  const m3path = join(root, "api/v1/models3d-game.json");
  if (existsSync(m3path)) {
    const m3 = JSON.parse(readFileSync(m3path, "utf8"));
    models3dNote = {
      total: m3.summary?.total ?? m3.models?.length,
      gameReadyOnDisk: m3.summary?.gameReadyOnDisk,
      avgReadiness: m3.summary?.avgReadiness,
      byKind: m3.summary?.byKind,
      warning:
        "models3d-game.json paths use github.io ObjectStore — NOT assets.grudge-studio.com. Re-upload _game-ready/* to R2 before scene use.",
      pipeline: m3.pipeline,
    };
  }

  const byGroup = {};
  for (const it of items) {
    byGroup[it.group] = (byGroup[it.group] || 0) + 1;
  }

  const catalog = {
    version: "1.0.0",
    generated: new Date().toISOString(),
    title: "Game-ready scene catalog (CDN verified)",
    description:
      "Assets that HEAD green on assets.grudge-studio.com — converted/baked production meshes for Forge and fleet scenes. SI metres. Agents must only spawn listed loadInScene / builtin keys.",
    cdn: CDN,
    si: {
      unit: "1 unit = 1 metre",
      humanHeightM: 1.8,
      orcHeightM: 2.0,
      rule: "Never fit weapons to human height",
    },
    summary: {
      sceneReady: items.length,
      failedHead: failed.length,
      byGroup,
    },
    agentRules: [
      "Prefer builtin: keys from this catalog or Forge Fast",
      "Absolute URL only assets.grudge-studio.com",
      "After spawn: verify_mesh_scale + verify_textures",
      "Characters: one AnimationMixer; Bip001 packs; strip position tracks",
      "Do not use molochdagod.github.io for production scenes",
    ],
    models3dGameLab: models3dNote,
    items,
    failed,
  };

  const outApi = join(root, "api/v1/game-ready-scene-catalog.json");
  const outDist = join(root, "dist/game-ready-scene-catalog.json");
  mkdirSync(dirname(outDist), { recursive: true });
  writeFileSync(outApi, JSON.stringify(catalog, null, 2));
  writeFileSync(outDist, JSON.stringify(catalog, null, 2));

  // Compact agent index (ids only)
  const compact = {
    version: catalog.version,
    generated: catalog.generated,
    cdn: CDN,
    count: items.length,
    byGroup,
    spawn: items.map((i) => ({
      id: i.id,
      label: i.label,
      group: i.group,
      load: i.loadInScene,
      r2Key: i.r2Key,
      si: i.si || null,
    })),
  };
  writeFileSync(
    join(root, "api/v1/game-ready-scene-index.json"),
    JSON.stringify(compact, null, 2),
  );

  if (args.has("--json")) {
    process.stdout.write(JSON.stringify(catalog, null, 2));
  } else {
    console.log("=== Game-ready scene catalog ===\n");
    console.log(`Scene-ready (CDN green): ${items.length}`);
    console.log(`Failed HEAD: ${failed.length}`);
    console.log("By group:", byGroup);
    console.log("\nReady spawns:");
    for (const i of items) {
      console.log(`  [${i.group}] ${i.id} → ${i.loadInScene}`);
    }
    if (failed.length) {
      console.log("\nNot ready (red HEAD):");
      for (const f of failed) console.log(`  ${f.r2Key} status=${f.head?.status}`);
    }
    if (models3dNote) {
      console.log(
        `\nLab models3d-game: ${models3dNote.total} on-disk gameReady — ${models3dNote.warning}`,
      );
    }
    console.log(`\nWrote ${outApi}`);
    console.log(`Wrote api/v1/game-ready-scene-index.json`);
  }

  process.exit(failed.length && args.has("--strict") ? 2 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

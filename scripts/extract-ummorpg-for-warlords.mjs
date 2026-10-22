/**
 * Pull uMMORPG assets + scripts + best-practice map OUT of Unity disk
 * into ObjectStore for Forge / Warlords web — NO Unity Editor required.
 *
 * Source (SSOT for this extract):
 *   C:\Users\nugye\Desktop\FRESH GRUDGE\Assets\uMMORPG
 *
 * Outputs:
 *   docs/UMMORPG_TO_WARLORDS_BEST_PRACTICES.md
 *   api/v1/ummorpg-extract-index.json
 *   assets/ummorpg-extract/scripts/**   (C# reference copies)
 *   assets/ummorpg-extract/prefab-inventory.json
 *   assets/ummorpg-extract/resources-inventory.json
 *   assets/ummorpg-extract/addons-inventory.json
 *
 * Usage:
 *   node scripts/extract-ummorpg-for-warlords.mjs
 *   UMMORPG_ROOT="C:/other/path/Assets/uMMORPG" node scripts/extract-ummorpg-for-warlords.mjs
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs';
import { basename, dirname, extname, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const UMMORPG =
  process.env.UMMORPG_ROOT ||
  'C:/Users/nugye/Desktop/FRESH GRUDGE/Assets/uMMORPG';

const OUT = join(ROOT, 'assets', 'ummorpg-extract');
const OUT_SCRIPTS = join(OUT, 'scripts');
const OUT_API = join(ROOT, 'api', 'v1', 'ummorpg-extract-index.json');
const OUT_DOC = join(ROOT, 'docs', 'UMMORPG_TO_WARLORDS_BEST_PRACTICES.md');

/** Core systems to copy as Warlords/Forge reference (not Unity runtime). */
const CORE_SCRIPTS = [
  'NetworkManagerMMO.cs',
  'Player.cs',
  'Entity.cs',
  'Combat.cs',
  'Skills.cs',
  'Skill.cs',
  'Buff.cs',
  'NetworkMessages.cs',
  'Utils.cs',
  'Movement.cs',
  'Health.cs',
  'Mana.cs',
  'Level.cs',
  'Experience.cs',
  'Inventory.cs',
  'Equipment.cs',
  'Targetable.cs',
  'Monster.cs',
  'Npc.cs',
  'Pet.cs',
  'Mount.cs',
  'Skillbar.cs',
  'PlayerSkills.cs',
  'PlayerInventory.cs',
  'PlayerEquipment.cs',
  'PlayerChat.cs',
  'PlayerParty.cs',
  'PlayerGuild.cs',
  'ScriptableSkill.cs',
  'ScriptableItem.cs',
  'DamageSkill.cs',
  'HealSkill.cs',
  'BuffSkill.cs',
  'TargetProjectileSkill.cs',
  'TargetBuffSkill.cs',
  'AreaBuffSkill.cs',
  'PassiveSkill.cs',
];

function walk(dir, filterFn, acc = [], depth = 0) {
  if (!existsSync(dir) || depth > 28) return acc;
  let ents;
  try {
    ents = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const ent of ents) {
    if (ent.name === 'Library' || ent.name === 'Temp' || ent.name === 'node_modules') continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walk(p, filterFn, acc, depth + 1);
    else if (filterFn(ent.name, p)) acc.push(p);
  }
  return acc;
}

function ensureDir(d) {
  mkdirSync(d, { recursive: true });
}

function findFileByName(root, name) {
  const hits = walk(root, (n) => n === name);
  return hits[0] || null;
}

function copyCoreScripts() {
  const scriptsRoot = join(UMMORPG, 'Scripts');
  const copied = [];
  const missing = [];
  for (const name of CORE_SCRIPTS) {
    const src = findFileByName(scriptsRoot, name);
    if (!src) {
      missing.push(name);
      continue;
    }
    const rel = relative(scriptsRoot, src).replace(/\\/g, '/');
    const dest = join(OUT_SCRIPTS, 'core', rel);
    ensureDir(dirname(dest));
    copyFileSync(src, dest);
    copied.push({ name, from: rel, bytes: statSync(src).size });
  }
  return { copied, missing };
}

function inventoryPrefabs() {
  const prefabRoot = join(UMMORPG, 'Prefabs');
  if (!existsSync(prefabRoot)) return { count: 0, byFolder: {}, samples: [] };
  const files = walk(prefabRoot, (n) => n.endsWith('.prefab'));
  const byFolder = {};
  for (const f of files) {
    const rel = relative(prefabRoot, f).replace(/\\/g, '/');
    const folder = dirname(rel).split('/')[0] || '(root)';
    byFolder[folder] = (byFolder[folder] || 0) + 1;
  }
  return {
    count: files.length,
    byFolder,
    samples: files.slice(0, 80).map((f) => relative(prefabRoot, f).replace(/\\/g, '/')),
    all: files.map((f) => relative(prefabRoot, f).replace(/\\/g, '/')),
  };
}

function inventoryAddons() {
  const addonsRoot = join(UMMORPG, 'Scripts', 'Addons');
  if (!existsSync(addonsRoot)) return [];
  return readdirSync(addonsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const p = join(addonsRoot, d.name);
      const cs = walk(p, (n) => n.endsWith('.cs'));
      return {
        name: d.name,
        scriptCount: cs.length,
        scripts: cs.map((f) => relative(p, f).replace(/\\/g, '/')).slice(0, 40),
      };
    })
    .sort((a, b) => b.scriptCount - a.scriptCount);
}

function inventoryResources() {
  const resRoot = join(UMMORPG, 'Resources');
  if (!existsSync(resRoot)) return { count: 0, folders: {} };
  const assets = walk(resRoot, (n) => n.endsWith('.asset') || n.endsWith('.prefab'));
  const folders = {};
  const skillNames = [];
  const itemNames = [];
  for (const f of assets) {
    const rel = relative(resRoot, f).replace(/\\/g, '/');
    const top = rel.split('/')[0] || '(root)';
    folders[top] = (folders[top] || 0) + 1;
    const base = basename(f, extname(f));
    if (/skill|buff|status/i.test(rel)) skillNames.push(base);
    if (/^Items\//i.test(rel) || /\/Items\//i.test(rel)) itemNames.push(base);
  }
  return {
    count: assets.length,
    folders,
    skillNames: [...new Set(skillNames)].sort().slice(0, 500),
    itemNames: [...new Set(itemNames)].sort().slice(0, 500),
    skillCount: skillNames.length,
    itemCount: itemNames.length,
  };
}

function inventoryModels() {
  const modelsRoot = join(UMMORPG, 'Models');
  if (!existsSync(modelsRoot)) return { fbx: 0, samples: [] };
  const fbx = walk(modelsRoot, (n) => /\.fbx$/i.test(n));
  return {
    fbx: fbx.length,
    samples: fbx.slice(0, 100).map((f) => relative(modelsRoot, f).replace(/\\/g, '/')),
  };
}

function writeBestPracticesDoc(index) {
  const doc = `# uMMORPG → Warlords / Forge Best Practices

**Extracted:** ${new Date().toISOString()}  
**Unity source (read-only vault):** \`${UMMORPG}\`  
**Web destinations:** forge.grudge-studio.com, Warlords fleet games, ObjectStore  

Unity is a **quarry**, not the ship target. Do not block web work on Editor compile/Safe Mode.

---

## 1. Architecture map (what to port)

| uMMORPG (Unity) | Web / Warlords / Forge equivalent |
|-----------------|-----------------------------------|
| \`NetworkManagerMMO\` + Mirror | Railway game API + optional Carrier/WS rooms |
| \`Entity\` + \`Player\` / \`Monster\` | Character entity + NPC/unit runtime |
| \`Combat\` (damage, crit, block, popups) | CombatController + floating combat text |
| \`Skills\` + \`Skill\` struct + \`ScriptableSkill\` | ObjectStore skill JSON + runtime skill runner |
| \`skillTemplates[0]\` = default attack | LMB / slot0 basic attack |
| SyncList skills + cooldownEnd timestamps | Client skill state + server authority CD |
| \`Inventory\` / \`Equipment\` | Account bag (Railway) + equip slots |
| Prefabs Entities / Structures | \`warlords-entity-prefabs.json\` + GLB CDN |
| Resources ScriptableObjects | ObjectStore \`api/v1/*.json\` + D1 index |
| Party / Guild / Instance | Fleet party APIs + instance rooms (later) |
| NavMeshSurface on instances | Navmesh / pathfinding on island mesh (web) |

---

## 2. Skill system best practices (from uMMORPG source)

### Static vs dynamic (bandwidth + DB)
- **Static** skill defs live in ScriptableObjects (\`ScriptableSkill\`): cast time, CD, range, mana, weapon category, levels.
- **Dynamic** runtime is a small \`Skill\` **struct**: \`hash\`, \`level\`, \`castTimeEnd\`, \`cooldownEnd\`.
- Hash references the template — change balance in data without rewriting saves.
- **Port:** ObjectStore skill id + runtime state \`{ id, level, cooldownEnd }\` — not full skill blobs per tick.

### Cooldowns
- Set \`cooldownEnd = NetworkTime.time + cooldown\` on cast — **no** per-skill elapsed counters every frame.
- **Port:** \`performance.now()/1000\` or server time + same pattern.

### Templates on entity
- \`Skills.skillTemplates\` = available skills; index **0** is default attack.
- Learned skills in SyncList; level 0 = not learned.
- **Port:** weapon pack defines slots 1–5; slot 0 / LMB = basic attack from weapon category.

### Casting pipeline
1. CheckSelf (mana, CD, weapon category, movement rules)
2. Start cast → sync \`currentSkill\` (drives animator)
3. Cast finished → spawn effect at \`effectMount\` (hand bone)
4. Apply damage/heal/buff server-side
5. Events: \`onSkillCastStarted\` / \`onSkillCastFinished\`

**Port to web:** CombatController requestSkill(slot) → anim one-shot → VFX mount → hit resolve.

### Combat
- \`ICombatBonus\` components sum damage/defense/crit/block (no Linq.Sum — GC).
- Damage types: Normal / Block / Crit.
- Invincible flag for GM/NPC.
- **Port:** same bonus interfaces on equipment + buffs; avoid heavy alloc in hot path.

### Partial classes / addons
- Core types are \`partial\` so Addons extend without forking core files.
- **Port:** keep core combat/skill modules thin; Warlords-specific hooks in separate modules.

---

## 3. Prefab / content inventory (this extract)

- **Prefabs total:** ${index.prefabs.count}
- **Top folders:** ${Object.entries(index.prefabs.byFolder)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([k, v]) => k + ' (' + v + ')')
    .join(', ')}
- **Resource assets:** ${index.resources.count} (skills-ish names: ${index.resources.skillCount})
- **Model FBX under Models/:** ${index.models.fbx}
- **Addons:** ${index.addons.length} folders, ${index.addons.reduce((s, a) => s + a.scriptCount, 0)} scripts
- **Core scripts copied:** ${index.scripts.copied.length} (missing: ${index.scripts.missing.join(', ') || 'none'})

Ship priority for Forge/Warlords:
1. Entities/Pets/Mercs, Siege, Mounts, Vehicles  
2. Structure Crusade / Legion / Fabled + Structures  
3. Scriptable skill/item names → ObjectStore skill/weapon JSON  
4. Combat/Skills/Player patterns → web controllers  

---

## 4. Folder locations (on disk)

\`\`\`
${UMMORPG}/
  Scripts/           core + Addons + Scriptable*
  Prefabs/           Entities, Structures, Particles, UI
  Resources/         ScriptableObject instances (skills, items, quests)
  Models/            FBX sources
  Plugins/Mirror     netcode (do not port Mirror; learn authority patterns only)
\`\`\`

Extract output:
\`\`\`
ObjectStore/assets/ummorpg-extract/
  scripts/core/**     C# reference
  prefab-inventory.json
  resources-inventory.json
  addons-inventory.json
api/v1/ummorpg-extract-index.json
docs/UMMORPG_TO_WARLORDS_BEST_PRACTICES.md
\`\`\`

---

## 5. Hard rules for agents

1. **Unity path SSOT for extract:** \`C:\\\\Users\\\\nugye\\\\Desktop\\\\FRESH GRUDGE\` only (not grudgeproduction\\\\grudgenew\\\\...).
2. **Never block Forge/Warlords on Unity Safe Mode** — extract from disk; Editor is optional.
3. **Weapon skills "done"** only if Warlords/Danger URL: key fires + anim + CD (not only JSON/docs).
4. **Do not invent Meshy/capsule** content when uMMORPG/Toon/CDN sources exist.
5. **One vertical slice** per request (e.g. one skill or one building in Forge).

---

## 6. Re-run extract

\`\`\`bash
cd F:/GitHub/ObjectStore
node scripts/extract-ummorpg-for-warlords.mjs
\`\`\`

Optional: publish index  
\`node scripts/publish-static-json.mjs ummorpg-extract-index\`
`;

  writeFileSync(OUT_DOC, doc);
}

function main() {
  console.log('=== uMMORPG → Warlords/Forge extract (no Unity Editor) ===');
  console.log('Source:', UMMORPG);
  if (!existsSync(UMMORPG)) {
    console.error('UMMORPG root missing. Set UMMORPG_ROOT or use Desktop FRESH GRUDGE.');
    process.exit(1);
  }

  ensureDir(OUT);
  ensureDir(OUT_SCRIPTS);

  console.log('Copying core scripts…');
  const scripts = copyCoreScripts();
  console.log(`  copied ${scripts.copied.length}, missing ${scripts.missing.length}`);

  console.log('Inventory prefabs…');
  const prefabs = inventoryPrefabs();
  writeFileSync(join(OUT, 'prefab-inventory.json'), JSON.stringify(prefabs, null, 2) + '\n');
  console.log(`  prefabs ${prefabs.count}`);

  console.log('Inventory addons…');
  const addons = inventoryAddons();
  writeFileSync(join(OUT, 'addons-inventory.json'), JSON.stringify(addons, null, 2) + '\n');
  console.log(`  addons ${addons.length}`);

  console.log('Inventory Resources…');
  const resources = inventoryResources();
  writeFileSync(join(OUT, 'resources-inventory.json'), JSON.stringify(resources, null, 2) + '\n');
  console.log(`  resource assets ${resources.count}`);

  console.log('Inventory Models…');
  const models = inventoryModels();
  writeFileSync(join(OUT, 'models-inventory.json'), JSON.stringify(models, null, 2) + '\n');
  console.log(`  fbx ${models.fbx}`);

  const index = {
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    purpose: 'uMMORPG disk extract for Forge + Warlords web — Unity Editor not required',
    source: {
      unityProject: 'C:/Users/nugye/Desktop/FRESH GRUDGE',
      ummorpg: UMMORPG,
    },
    destinations: {
      forge: 'https://forge.grudge-studio.com',
      objectStore: 'https://objectstore.grudge-studio.com',
      warlordsCdn: 'https://assets.grudge-studio.com',
    },
    scripts,
    prefabs: {
      count: prefabs.count,
      byFolder: prefabs.byFolder,
      samples: prefabs.samples,
    },
    addons: addons.map((a) => ({ name: a.name, scriptCount: a.scriptCount })),
    resources: {
      count: resources.count,
      folders: resources.folders,
      skillCount: resources.skillCount,
      itemCount: resources.itemCount,
      skillNamesSample: resources.skillNames.slice(0, 80),
      itemNamesSample: resources.itemNames.slice(0, 80),
    },
    models,
    outputs: {
      extractRoot: 'assets/ummorpg-extract/',
      doc: 'docs/UMMORPG_TO_WARLORDS_BEST_PRACTICES.md',
      index: 'api/v1/ummorpg-extract-index.json',
    },
    nextWebWork: [
      'Map ScriptableSkill names → ObjectStore weapon/skill JSON slots 1–5',
      'Port Combat + Skills cast pipeline into GrudgeBuilder CombatController',
      'Load warlords-entity-prefabs + GLBs in Forge placeables',
      'Do not wait on Unity Safe Mode for further content pulls',
    ],
  };

  // full prefab list is large — keep on disk only
  writeFileSync(OUT_API, JSON.stringify(index, null, 2) + '\n');
  writeBestPracticesDoc({ ...index, addons, resources, scripts, prefabs, models });

  console.log('\nWrote', OUT_API);
  console.log('Wrote', OUT_DOC);
  console.log('Extract root', OUT);
  console.log(JSON.stringify({
    prefabs: prefabs.count,
    addons: addons.length,
    resources: resources.count,
    fbx: models.fbx,
    coreScripts: scripts.copied.length,
  }, null, 2));
}

main();

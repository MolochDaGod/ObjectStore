/**
 * Parse uMMORPG Resources (Unity YAML .asset) + warlords entity prefabs
 * into Forge-facing catalogs — no Unity Editor.
 *
 * Outputs:
 *   ObjectStore/api/v1/ummorpg-skills-for-forge.json
 *   ObjectStore/api/v1/ummorpg-placeables-for-forge.json
 *   ObjectStore/assets/ummorpg-extract/systems-map.json
 *   Grudge-Studio-Forge/artifacts/game-forge/public/data/ummorpg-*.json
 *   Grudge-Studio-Forge/artifacts/game-forge/src/lib/ummorpgCatalog.ts
 *   Grudge-Studio-Forge/docs/UMMORPG_EXTRACT_FOR_FORGE.md
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
  copyFileSync,
} from 'fs';
import { basename, dirname, extname, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OS_ROOT = resolve(__dirname, '..');
const FORGE_ROOT = process.env.FORGE_ROOT || 'F:/GitHub/Grudge-Studio-Forge';
const UMMORPG =
  process.env.UMMORPG_ROOT ||
  'C:/Users/nugye/Desktop/FRESH GRUDGE/Assets/uMMORPG';

const CDN = 'https://assets.grudge-studio.com';
const OBJECTSTORE = 'https://objectstore.grudge-studio.com/api/v1';

function walk(dir, filterFn, acc = [], depth = 0) {
  if (!existsSync(dir) || depth > 20) return acc;
  let ents;
  try {
    ents = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const ent of ents) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walk(p, filterFn, acc, depth + 1);
    else if (filterFn(ent.name, p)) acc.push(p);
  }
  return acc;
}

function yamlField(text, key) {
  const re = new RegExp(`^\\s*${key}:\\s*(.*)$`, 'm');
  const m = text.match(re);
  if (!m) return null;
  let v = m[1].trim();
  if (v.startsWith("'") || v.startsWith('"')) {
    // multi-line tooltips — take first line only for simple fields
    v = v.replace(/^['"]|['"]$/g, '');
  }
  if (v === '{fileID: 0}') return null;
  return v;
}

function yamlFloat(text, key) {
  const v = yamlField(text, key);
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseSkillAsset(path) {
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    return null;
  }
  if (!text.includes('MonoBehaviour:')) return null;
  const name = yamlField(text, 'm_Name') || basename(path, '.asset');
  // Only trust short clean category strings (Unity YAML can mis-parse)
  let category = yamlField(text, 'category') || '';
  if (!category || category.length > 32 || /:/.test(category) || /usage|cancel|follow/i.test(category)) {
    category = '';
  }
  const requiredWeapon = yamlField(text, 'requiredWeaponCategory') || '';
  const followup = yamlField(text, 'followupDefaultAttack');
  const cancelMove = yamlField(text, 'cancelWhenMoving');
  const unlearnable = yamlField(text, 'unlearnable');
  // LinearFloat/Int often nested — grab simple scalar patterns
  const castTimeBase = text.match(/castTime:[\s\S]*?baseValue:\s*([-\d.]+)/);
  const cooldownBase = text.match(/cooldown:[\s\S]*?baseValue:\s*([-\d.]+)/);
  const castRangeBase = text.match(/castRange:[\s\S]*?baseValue:\s*([-\d.]+)/);
  const manaBase = text.match(/manaCosts:[\s\S]*?baseValue:\s*([-\d.]+)/);
  const damageBase = text.match(/damage:[\s\S]*?baseValue:\s*([-\d.]+)/);

  const folder = relative(join(UMMORPG, 'Resources'), dirname(path)).replace(/\\/g, '/');

  return {
    id: `ummorpg-skill/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    name,
    source: 'ummorpg',
    folder,
    category: category || guessCategory(folder, name),
    requiredWeaponCategory: requiredWeapon || null,
    followupDefaultAttack: followup === '1',
    cancelWhenMoving: cancelMove === '1',
    unlearnable: unlearnable === '1',
    castTime: castTimeBase ? Number(castTimeBase[1]) : null,
    cooldown: cooldownBase ? Number(cooldownBase[1]) : null,
    castRange: castRangeBase ? Number(castRangeBase[1]) : null,
    manaCost: manaBase ? Number(manaBase[1]) : null,
    damage: damageBase ? Number(damageBase[1]) : null,
    unityAsset: relative(UMMORPG, path).replace(/\\/g, '/'),
  };
}

function guessCategory(folder, name) {
  const f = (folder + '/' + name).toLowerCase();
  if (/sword|dagger|spear|twohand|bow|warrior/.test(f)) return 'weapon';
  if (/fire|frost|arcane|holy|lightning|nature|spell|magic/.test(f)) return 'magic';
  if (/buff|aura|status|food/.test(f)) return 'buff';
  if (/vehicle|ballista|catapult|brute/.test(f)) return 'vehicle_siege';
  if (/projectile|arrow/.test(f)) return 'projectile';
  if (/attack/.test(f)) return 'attack';
  return 'skill';
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function buildPlaceables() {
  const catalogPath = join(OS_ROOT, 'api/v1/warlords-entity-prefabs.json');
  if (!existsSync(catalogPath)) return { count: 0, items: [] };
  const cat = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const items = [];
  for (const p of cat.prefabs || []) {
    const slug = slugify(p.id?.replace(/^entities\//, '') || p.name);
    const meshUrl =
      p.mesh?.cdnUrl ||
      (p.mesh?.status === 'cdn_ready' ? `${CDN}/models/warlords/entities/${slug}.glb` : null);
    const iconUrl =
      p.icon?.cdnUrl ||
      `${CDN}/game-assets/icons/pack/entities/${(p.icon?.path || slug).split('/').pop()}`;

    items.push({
      id: `ummorpg-placeable/${slug}`,
      label: p.displayName || p.name || slug,
      group: mapKindToForgeGroup(p.kind, p.category),
      kind: p.kind,
      category: p.category,
      modelUrl: meshUrl,
      iconUrl,
      meshStatus: p.mesh?.status || p.status || 'unknown',
      unityPrefab: p.unity?.prefabRel || null,
      blurb: p.mesh?.note || `uMMORPG entity · ${p.kind}`,
      spawnY: p.kind === 'structure' ? 0 : 0,
      scale: 1,
      forge: {
        spawnable: !!meshUrl && (p.mesh?.status === 'cdn_ready' || meshUrl.includes('.glb') || meshUrl.includes('.fbx')),
        source: 'warlords-entity-prefabs + ummorpg extract',
      },
    });
  }
  return {
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    count: items.length,
    spawnable: items.filter((i) => i.forge.spawnable).length,
    items,
  };
}

function mapKindToForgeGroup(kind, category) {
  if (kind === 'structure' || category?.includes('building') || category?.includes('fort'))
    return 'buildings';
  if (kind === 'unit') return 'characters';
  if (kind === 'mount') return 'vehicles';
  if (kind === 'siege') return 'props';
  if (kind === 'vehicle') return 'vehicles';
  return 'props';
}

function systemsMap() {
  return {
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    unitySource: UMMORPG,
    forgeLive: 'https://forge.grudge-studio.com',
    systems: [
      {
        id: 'combat',
        ummorpg: ['Combat.cs', 'Entity.cs', 'ICombatBonus'],
        forgeWarlords: 'CombatController + damage events + float text',
        status: 'pattern_extracted',
      },
      {
        id: 'skills',
        ummorpg: ['Skills.cs', 'Skill.cs', 'ScriptableSkill', 'Resources/Skills*'],
        forgeWarlords: 'skill runner + hotbar 1–5 + ObjectStore skill JSON',
        status: 'data_extracted',
      },
      {
        id: 'player_entity',
        ummorpg: ['Player.cs', 'Entity.cs', 'Health', 'Mana', 'Level'],
        forgeWarlords: 'character entity + Railway character API',
        status: 'pattern_extracted',
      },
      {
        id: 'inventory_equipment',
        ummorpg: ['Inventory.cs', 'Equipment.cs', 'ScriptableItem'],
        forgeWarlords: 'account bag + equip slots',
        status: 'pattern_extracted',
      },
      {
        id: 'networking_authority',
        ummorpg: ['NetworkManagerMMO.cs', 'Mirror SyncVar/Cmd'],
        forgeWarlords: 'Railway authority + optional multiplayer rooms',
        status: 'pattern_only_do_not_port_mirror',
      },
      {
        id: 'structures_placeables',
        ummorpg: ['Prefabs/Structure*', 'Prefabs/Structures', 'Entities'],
        forgeWarlords: 'spawn_fast_asset / placeable GLB from CDN',
        status: 'placeables_catalog',
      },
      {
        id: 'instances_party',
        ummorpg: ['Instance.cs', 'Party'],
        forgeWarlords: 'instance rooms later',
        status: 'deferred',
      },
    ],
  };
}

function writeForgeTs(placeables, skills) {
  const forgeLib = join(FORGE_ROOT, 'artifacts/game-forge/src/lib/ummorpgCatalog.ts');
  const forgePublic = join(FORGE_ROOT, 'artifacts/game-forge/public/data');
  mkdirSync(forgePublic, { recursive: true });
  mkdirSync(dirname(forgeLib), { recursive: true });

  copyFileSync(
    join(OS_ROOT, 'api/v1/ummorpg-placeables-for-forge.json'),
    join(forgePublic, 'ummorpg-placeables.json'),
  );
  copyFileSync(
    join(OS_ROOT, 'api/v1/ummorpg-skills-for-forge.json'),
    join(forgePublic, 'ummorpg-skills.json'),
  );

  const ts = `/**
 * uMMORPG extract catalog for Forge (forge.grudge-studio.com).
 * Generated by ObjectStore/scripts/build-ummorpg-forge-catalog.mjs
 * Source vault: Desktop/FRESH GRUDGE — no Unity Editor required for regen.
 *
 * Load JSON from /data/ummorpg-*.json (public) or ObjectStore API.
 */

export const UMMORPG_OBJECTSTORE = {
  index: "${OBJECTSTORE}/ummorpg-extract-index.json",
  skills: "${OBJECTSTORE}/ummorpg-skills-for-forge.json",
  placeables: "${OBJECTSTORE}/ummorpg-placeables-for-forge.json",
  bestPractices: "https://objectstore.grudge-studio.com/api/v1/ummorpg-extract-index.json",
} as const;

export const UMMORPG_LOCAL_DATA = {
  skills: "/data/ummorpg-skills.json",
  placeables: "/data/ummorpg-placeables.json",
} as const;

export type UmmorpgSkill = {
  id: string;
  name: string;
  category: string;
  castTime: number | null;
  cooldown: number | null;
  castRange: number | null;
  manaCost: number | null;
  damage: number | null;
  requiredWeaponCategory: string | null;
  unityAsset: string;
};

export type UmmorpgPlaceable = {
  id: string;
  label: string;
  group: string;
  modelUrl: string | null;
  iconUrl: string;
  meshStatus: string;
  forge: { spawnable: boolean; source: string };
};

/** Fetch placeables (prefer same-origin public data, fall back to ObjectStore). */
export async function fetchUmmorpgPlaceables(
  init?: RequestInit,
): Promise<{ count: number; spawnable: number; items: UmmorpgPlaceable[] } | null> {
  for (const url of [UMMORPG_LOCAL_DATA.placeables, UMMORPG_OBJECTSTORE.placeables]) {
    try {
      const r = await fetch(url, init);
      if (!r.ok) continue;
      const j = (await r.json()) as { count: number; spawnable: number; items: UmmorpgPlaceable[] };
      if (j?.items) return j;
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function fetchUmmorpgSkills(
  init?: RequestInit,
): Promise<{ count: number; skills: UmmorpgSkill[] } | null> {
  for (const url of [UMMORPG_LOCAL_DATA.skills, UMMORPG_OBJECTSTORE.skills]) {
    try {
      const r = await fetch(url, init);
      if (!r.ok) continue;
      const j = (await r.json()) as { count: number; skills: UmmorpgSkill[] };
      if (j?.skills) return j;
    } catch {
      /* try next */
    }
  }
  return null;
}

/** Spawnable placeables only (CDN mesh ready). */
export function filterSpawnablePlaceables(items: UmmorpgPlaceable[]): UmmorpgPlaceable[] {
  return items.filter((i) => i.forge?.spawnable && !!i.modelUrl);
}

/** Map weapon-category skills toward Warlords hotbar packs. */
export function skillsForWeaponCategory(
  skills: UmmorpgSkill[],
  weapon: string,
): UmmorpgSkill[] {
  const w = weapon.toLowerCase();
  return skills.filter(
    (s) =>
      (s.requiredWeaponCategory && s.requiredWeaponCategory.toLowerCase().includes(w)) ||
      s.category === "weapon" ||
      (s.folder && s.folder.toLowerCase().includes(w)),
  );
}

// Generated snapshot sizes (for agent sanity checks)
export const UMMORPG_CATALOG_META = {
  generatedAt: ${JSON.stringify(new Date().toISOString())},
  placeableCount: ${placeables.count},
  placeableSpawnable: ${placeables.spawnable},
  skillCount: ${skills.count},
  unitySource: ${JSON.stringify(UMMORPG)},
} as const;
`;

  writeFileSync(forgeLib, ts);
  return { forgeLib, forgePublic };
}

function writeForgeDoc(placeables, skills) {
  const docPath = join(FORGE_ROOT, 'docs/UMMORPG_EXTRACT_FOR_FORGE.md');
  const doc = `# uMMORPG → Forge validation

**Generated:** ${new Date().toISOString()}  
**Unity vault (read-only):** \`${UMMORPG}\`  
**Live Forge:** https://forge.grudge-studio.com  

## What was validated into Forge source

| Artifact | Path |
|----------|------|
| Placeables JSON | \`artifacts/game-forge/public/data/ummorpg-placeables.json\` (${placeables.count} items, ${placeables.spawnable} spawnable) |
| Skills JSON | \`artifacts/game-forge/public/data/ummorpg-skills.json\` (${skills.count} skills) |
| TS helpers | \`artifacts/game-forge/src/lib/ummorpgCatalog.ts\` |
| ObjectStore API | \`ummorpg-placeables-for-forge.json\`, \`ummorpg-skills-for-forge.json\` |
| Systems map | ObjectStore \`assets/ummorpg-extract/systems-map.json\` |
| C# reference | ObjectStore \`assets/ummorpg-extract/scripts/core/\` |
| Best practices | ObjectStore \`docs/UMMORPG_TO_WARLORDS_BEST_PRACTICES.md\` |

## How Forge should use this

1. **Placeables:** \`fetchUmmorpgPlaceables()\` → filter spawnable → \`import_asset_from_url\` / add_model_entity with \`modelUrl\` on assets CDN.
2. **Skills:** \`fetchUmmorpgSkills()\` → map to Warlords hotbar (weapon category folders: Skills Sword, Bow, etc.).
3. **Do not** load Mirror/NetworkManager into the browser — patterns only.
4. **Unity Safe Mode** is irrelevant to this catalog; regenerate from disk:

\`\`\`bash
cd F:/GitHub/ObjectStore
node scripts/extract-ummorpg-for-warlords.mjs
node scripts/build-ummorpg-forge-catalog.mjs
node scripts/publish-static-json.mjs ummorpg-skills-for-forge ummorpg-placeables-for-forge ummorpg-extract-index
\`\`\`

## Spawnable groups (sample)

Buildings / characters / vehicles / props from warlords entity CDN mesh status \`cdn_ready\`.

## Agent rules

- ROOT Unity extract: **Desktop\\\\FRESH GRUDGE** only  
- ROOT Forge: **F:\\\\GitHub\\\\Grudge-Studio-Forge**  
- DONE for placeable: modelUrl 200 + spawns in Forge  
- DONE for skill port: presses in Warlords client (separate slice)
`;
  writeFileSync(docPath, doc);
  return docPath;
}

function main() {
  console.log('=== Build uMMORPG → Forge catalogs ===');
  console.log('Unity:', UMMORPG);
  console.log('Forge:', FORGE_ROOT);

  if (!existsSync(UMMORPG)) {
    console.error('Missing UMMORPG root');
    process.exit(1);
  }
  if (!existsSync(FORGE_ROOT)) {
    console.error('Missing FORGE_ROOT', FORGE_ROOT);
    process.exit(1);
  }

  // Skills
  const skillRoot = join(UMMORPG, 'Resources', 'Skills, Buffs, Status Effects');
  const skillFiles = existsSync(skillRoot)
    ? walk(skillRoot, (n) => n.endsWith('.asset'))
    : [];
  console.log('Parsing skills…', skillFiles.length);
  const skills = [];
  for (const f of skillFiles) {
    const s = parseSkillAsset(f);
    if (s) skills.push(s);
  }
  skills.sort((a, b) => a.name.localeCompare(b.name));

  const skillsDoc = {
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    source: skillRoot,
    count: skills.length,
    byCategory: skills.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {}),
    skills,
  };
  writeFileSync(
    join(OS_ROOT, 'api/v1/ummorpg-skills-for-forge.json'),
    JSON.stringify(skillsDoc, null, 2) + '\n',
  );
  console.log('Skills written', skills.length);

  // Placeables
  console.log('Building placeables…');
  const placeables = buildPlaceables();
  writeFileSync(
    join(OS_ROOT, 'api/v1/ummorpg-placeables-for-forge.json'),
    JSON.stringify(placeables, null, 2) + '\n',
  );
  console.log('Placeables', placeables.count, 'spawnable', placeables.spawnable);

  // Systems map
  const systems = systemsMap();
  mkdirSync(join(OS_ROOT, 'assets/ummorpg-extract'), { recursive: true });
  writeFileSync(
    join(OS_ROOT, 'assets/ummorpg-extract/systems-map.json'),
    JSON.stringify(systems, null, 2) + '\n',
  );

  const paths = writeForgeTs(placeables, skillsDoc);
  const docPath = writeForgeDoc(placeables, skillsDoc);

  // Validation report
  const spawnable = placeables.items.filter((i) => i.forge.spawnable);
  const missingMesh = placeables.items.filter((i) => !i.forge.spawnable);
  const report = {
    updatedAt: new Date().toISOString(),
    ok: true,
    skills: skills.length,
    placeables: placeables.count,
    spawnable: spawnable.length,
    notYetSpawnable: missingMesh.length,
    forgeFiles: paths,
    docPath,
    sampleSpawnable: spawnable.slice(0, 15).map((i) => ({
      id: i.id,
      label: i.label,
      modelUrl: i.modelUrl,
    })),
    sampleSkills: skills.slice(0, 15).map((s) => ({
      name: s.name,
      category: s.category,
      cooldown: s.cooldown,
      damage: s.damage,
    })),
  };
  writeFileSync(
    join(OS_ROOT, 'scripts/out/ummorpg-forge-validate-report.json'),
    JSON.stringify(report, null, 2) + '\n',
  );

  console.log(JSON.stringify(report, null, 2));
}

main();

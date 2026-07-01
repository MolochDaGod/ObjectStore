#!/usr/bin/env node
/**
 * Build canonical weapon prefabs for game runtimes (Three.js, uMMORPG, Workers).
 *
 * Joins:
 *   master-weapons.json   → 868 tier-expanded ITEM-* rows
 *   t0-weapons.json     → 15 starter weapons
 *   master-registry.json→ iconUuid, iconCdnUrl, model refs
 *   master-weaponSkills.json → SKIL-* bindings per weapon type
 *   weapons.json        → named variant abilities / passives / signatures
 *   master-recipes.json → RECP-* craft links
 *   master-enchants.json→ ENCH-* apply targets
 *
 * Output:
 *   api/v1/master-weapon-prefabs.json  — runtime prefab bundle
 *   api/v1/ummorpg-systems-bridge.json — uMMORPG drop/chest/craft/enchant mappings
 *   workers/seed/weapon-prefabs.sql      — D1 upsert statements (objectstore-meta)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyFiveSlotPattern,
  buildLoadoutMeta,
  pickStandardAttack,
  slotMap,
  SLOT_LABELS,
  LOADOUT_PATTERN,
} from './lib/weapon-five-slot.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const API = join(ROOT, 'api', 'v1');
const CDN = 'https://assets.grudge-studio.com';

const CATEGORY_TO_WEAPON_TYPE = {
  swords: 'SWORD',
  axes1h: 'AXE',
  greataxes: 'GREATAXE',
  greatswords: 'GREATSWORD',
  daggers: 'DAGGER',
  bows: 'BOW',
  crossbows: 'CROSSBOW',
  guns: 'GUN',
  hammers1h: 'HAMMER',
  hammers2h: 'HAMMER',
  spears: 'SPEAR',
  fireStaves: 'STAFF',
  frostStaves: 'STAFF',
  holystaves: 'STAFF',
  holyStaves: 'STAFF',
  lightningStaves: 'STAFF',
  natureStaves: 'STAFF',
  arcaneStaves: 'STAFF',
  staves: 'STAFF',
  wands: 'WAND',
  maces: 'MACE',
  scythes: 'SCYTHE',
  shields: 'SHIELD',
  'offhand-tome': 'TOME',
  fireTomes: 'TOME',
  frostTomes: 'TOME',
  natureTomes: 'TOME',
  holyTomes: 'TOME',
  arcaneTomes: 'TOME',
  lightningTomes: 'TOME',
  tools: 'TOOL',
};

function load(name) {
  return JSON.parse(readFileSync(join(API, name), 'utf8'));
}

let abilityMeta = null;
function loadAbilityMeta() {
  if (abilityMeta) return abilityMeta;
  try {
    abilityMeta = JSON.parse(readFileSync(join(API, '_meta', 'ability-aliases.json'), 'utf8'));
  } catch {
    abilityMeta = { global: {}, byWeaponType: {}, shieldVariantToType: {}, tomeCategoryToSchool: {}, primaryStatToAttribute: {} };
  }
  return abilityMeta;
}

function parseAbilityName(str) {
  if (!str) return null;
  return String(str).replace(/\s*\([^)]*\)\s*/g, ' ').trim().split(/\s{2,}/)[0].trim() || null;
}

function normalizeKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function significantTokens(key) {
  return key.split(' ').filter((t) => t.length > 3);
}

function resolveAlias(weaponType, abilityKey) {
  const meta = loadAbilityMeta();
  const typeMap = meta.byWeaponType?.[weaponType] || {};
  return typeMap[abilityKey] || meta.global?.[abilityKey] || abilityKey;
}

function skillNameMatches(allowedKeys, skillName, weaponType) {
  const key = normalizeKey(skillName);
  for (const raw of allowedKeys) {
    const aliased = resolveAlias(weaponType, raw);
    if (key === aliased || key.includes(aliased) || aliased.includes(key)) return true;
    const rawTokens = significantTokens(raw);
    const aliasTokens = significantTokens(aliased);
    const keyTokens = significantTokens(key);
    const overlap = [...new Set([...rawTokens, ...aliasTokens])].some((t) => keyTokens.includes(t));
    if (overlap) return true;
  }
  return false;
}

function inferShieldType(item, variantMeta) {
  const meta = loadAbilityMeta();
  const baseKey = normalizeKey(item.baseName || item.name);
  if (meta.shieldVariantToType?.[baseKey]) return meta.shieldVariantToType[baseKey];
  if (baseKey.includes('buckler')) return 'buckler';
  if (baseKey.includes('bulwark') || baseKey.includes('bastion')) return 'tower';
  if (baseKey.includes('aegis')) return 'kite';
  if (baseKey.includes('ward') || baseKey.includes('oath')) return 'magic';
  if (baseKey.includes('ember') || baseKey.includes('barrier')) return 'spiked';
  return variantMeta?.shieldType || 'buckler';
}

function inferTomeSchool(item) {
  const meta = loadAbilityMeta();
  return meta.tomeCategoryToSchool?.[item.category] || 'arcane';
}

function resolveSkillTypeSlots(skillTypeDef, weaponType, item) {
  if (!skillTypeDef) return [];

  if (weaponType === 'SHIELD' && skillTypeDef.shieldTypes) {
    const shieldType = inferShieldType(item, null);
    return skillTypeDef.shieldTypes[shieldType]?.slots || skillTypeDef.shieldTypes.buckler?.slots || [];
  }

  if (weaponType === 'TOME' && skillTypeDef.couplingModes) {
    const school = inferTomeSchool(item);
    const mode = skillTypeDef.mechanic?.schoolToMode?.[school] || 'elemental';
    return skillTypeDef.couplingModes[mode]?.slots || skillTypeDef.couplingModes.elemental?.slots || [];
  }

  return skillTypeDef.slots || [];
}

function bindFiveSlot(slots, variantMeta, weaponType, item) {
  const meta = loadAbilityMeta();
  const bindingMode =
    weaponType === 'SHIELD' ? 'offhandModifier' : weaponType === 'TOME' ? 'offhandCoupling' : 'standard';

  const raw = applyFiveSlotPattern(slots, variantMeta, weaponType, meta, {
    tier: item?.tier ?? 0,
    bindingMode,
  });

  // Re-hydrate UUIDs for skills missing from master JSON (SHIELD/TOME nested)
  for (const slot of raw.slots) {
    slot.skillUuids = (slot.skillIds || []).map((id) => {
      const found = (slots || [])
        .flatMap((s) => s.skills || [])
        .find((sk) => sk.id === id);
      return ensureSkillUuid(found || { id }, weaponType);
    });
  }
  raw.skillUuids = [...new Set(raw.slots.flatMap((s) => s.skillUuids))];
  return raw;
}

function attributeAffinity(primaryStat, secondaryStat) {
  const meta = loadAbilityMeta();
  const map = meta.primaryStatToAttribute || {};
  return {
    primary: map[primaryStat] || null,
    secondary: map[secondaryStat] || null,
  };
}

function ensureSkillUuid(skill, weaponType) {
  if (skill?.uuid) return skill.uuid;
  const slug = String(skill?.id || skill?.name || 'unknown')
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase()
    .slice(0, 16)
    .padEnd(16, '0');
  return `SKIL-OFFHAND-${weaponType}-${slug}`;
}

function absUrl(url) {
  if (!url) return null;
  if (/^https?:/i.test(url)) return url;
  if (url.startsWith('/')) return `${CDN}${url}`;
  return url;
}

function r2KeyFromUrl(url) {
  if (!url) return null;
  const m = String(url).match(/assets\.grudge-studio\.com\/(.+)$/);
  return m ? m[1] : null;
}

function buildNamedVariantIndex(weaponsJson) {
  const byBaseName = new Map();
  for (const [catKey, cat] of Object.entries(weaponsJson.categories || {})) {
    for (const item of cat.items || []) {
      byBaseName.set(normalizeKey(item.name), {
        ...item,
        categoryKey: catKey,
        weaponType: CATEGORY_TO_WEAPON_TYPE[catKey] || catKey.toUpperCase(),
      });
    }
  }
  return byBaseName;
}

function buildRecipeIndex(recipesJson) {
  const byResult = new Map();
  for (const r of recipesJson.recipes || []) {
    const key = r.resultItemId || r.resultUuid || r.resultItemUuid;
    if (key) byResult.set(key, r);
    if (r.resultItemUuid) byResult.set(r.resultItemUuid, r);
    if (r.resultUuid) byResult.set(r.resultUuid, r);
  }
  return byResult;
}

function buildSkillIndex(skillsJson) {
  const byType = {};
  for (const wt of skillsJson.weaponTypes || []) {
    byType[wt.id] = wt;
  }
  if (skillsJson.artifactWeapons) {
    for (const aw of skillsJson.artifactWeapons) {
      byType[aw.id] = aw;
    }
  }
  return byType;
}

function resolveSkillBindings(weaponType, variantMeta, skillTypeDef, item) {
  if (weaponType === 'TOOL') {
    return {
      slots: [],
      skillUuids: [],
      passives: [],
      slotPattern: 'gather',
      bindingMode: 'gather',
      note: 'Tools use profession gather actions, not combat SKIL-*',
    };
  }

  if (!skillTypeDef) return { slots: [], skillUuids: [], passives: [], slotPattern: 'none', bindingMode: 'none' };

  const slots = resolveSkillTypeSlots(skillTypeDef, weaponType, item);
  return bindFiveSlot(slots, variantMeta, weaponType, item);
}

function buildPrefab(item, registryEntry, variantMeta, skillTypeDef, recipe) {
  const weaponType = CATEGORY_TO_WEAPON_TYPE[item.category] || item.weaponType || 'UNKNOWN';
  const baseNameKey = normalizeKey(item.baseName || item.name.replace(/\s+T\d+$/i, ''));
  const variant = variantMeta || {};
  const skillBindings = resolveSkillBindings(weaponType, variant, skillTypeDef, item);
  const affinity = attributeAffinity(item.primaryStat || variant.primaryStat, item.secondaryStat || variant.secondaryStat);

  const iconCdnUrl = absUrl(registryEntry?.iconCdnUrl || item.iconUrl);
  const modelUrl = absUrl(item.modelUrl);
  const modelPath = item.modelPath || r2KeyFromUrl(modelUrl);

  return {
    uuid: item.uuid,
    baseUuid: item.baseUuid || item.uuid,
    id: item.id || item.uuid,
    name: item.name,
    baseName: item.baseName || item.name,
    category: item.category,
    weaponType,
    subCategory: item.subCategory || null,
    tier: item.tier ?? 0,
    tierLabel: item.tierLabel || null,
    source: item.source || 'craft',

    stats: item.stats || {},
    primaryStat: item.primaryStat || variant.primaryStat || null,
    secondaryStat: item.secondaryStat || variant.secondaryStat || null,
    attributeAffinity: affinity,
    lore: item.description || item.lore || variant.lore || '',

    abilities: variant.abilities || item.abilities || [],
    signature: variant.signatureAbility || variant.signature || item.signature || null,
    passives: variant.passives || item.passives || [],

    recipeUuid: item.recipeUuid || recipe?.uuid || null,
    craftedBy: item.craftedBy || recipe?.profession || null,

    assets: {
      iconUrl: iconCdnUrl,
      iconUuid: registryEntry?.iconUuid || null,
      iconR2Key: r2KeyFromUrl(iconCdnUrl),
      modelUrl,
      modelPath,
      modelR2Key: modelPath,
      dropPrefabR2Key: `prefabs/items/weapons/${weaponType.toLowerCase()}/${item.tier}/${baseNameKey}.prefab.glb`,
      worldDropVfxR2Key: `effects/3d/loot/weapon-${item.tierLabel?.toLowerCase() || 'common'}.glb`,
    },

    skills: skillBindings,
    loadout: buildLoadoutMeta(weaponType),
    ummorpg: {
      scriptableItemClass: weaponType === 'SHIELD' || weaponType === 'TOME' ? 'EquipmentItem' : 'WeaponItem',
      equipmentSlot: weaponType === 'SHIELD' ? 'Offhand' : weaponType === 'TOME' ? 'Offhand' : 'MainHand',
      weaponSkillListKey: `${weaponType}_${Math.max(1, Math.ceil((item.tier || 1) / 2))}`,
      minLevel: Math.max(1, item.tier || 0),
      maxStack: 1,
      maxDurability: 100,
      sellable: true,
      tradable: item.tier >= 1,
      destroyable: true,
    },

    enchant: {
      target: 'weapon',
      allowedEnchantStats: ['damage', 'crit', 'speed', 'block', 'defense', 'combo'],
      equipmentLevelUp: item.tier >= 1,
    },
  };
}

function buildUmmorpgBridge(prefabs, enchants, recipes) {
  const starterDrops = prefabs
    .filter((p) => p.tier === 0)
    .map((p) => ({
      itemUuid: p.uuid,
      name: p.name,
      probability: 0.15,
      minStack: 1,
      maxStack: 1,
      source: 'starter-chest',
    }));

  const tier1Craft = prefabs
    .filter((p) => p.tier === 1 && p.recipeUuid)
    .slice(0, 50)
    .map((p) => ({
      itemUuid: p.uuid,
      recipeUuid: p.recipeUuid,
      profession: p.craftedBy,
      station: 'Workbench',
    }));

  const enchantApply = (enchants.enchants || [])
    .filter((e) => (e.target || '').includes('weapon'))
    .slice(0, 20)
    .map((e) => ({
      enchantUuid: e.uuid,
      name: e.name,
      target: 'weapon',
      stat: e.effect?.stat,
      value: e.effect?.value,
      valueType: e.effect?.valueType,
      ummorpgFlow: 'consumable_apply',
      consumedOnApply: e.consumedOnApply !== false,
      craftingRecipeUuid: null,
      mysticStation: e.craftingRecipe?.station || 'Enchanting Bench',
    }));

  return {
    version: '1.0.0',
    generated: new Date().toISOString(),
    description: 'Maps canonical ObjectStore weapons to uMMORPG addon systems',
    systems: {
      drops: {
        addon: 'ItemDrop + MonsterInventory',
        model: 'ItemDropChance { item, probability, minStack, maxStack }',
        canonicalSource: 'master-weapon-prefabs.json → prefabs[].uuid',
        tables: {
          starterIslandChest: starterDrops,
          banditCampChest: prefabs
            .filter((p) => p.tier === 1 && p.weaponType === 'SWORD')
            .slice(0, 3)
            .map((p, i) => ({
              itemUuid: p.uuid,
              name: p.name,
              probability: 0.08 - i * 0.01,
              minStack: 1,
              maxStack: 1,
              source: 'lootcrate',
            })),
        },
      },
      chests: {
        addon: 'Lootcrate (_iMMOCHEST)',
        model: 'OnRefill() rolls ItemDropChance[] + gold',
        wiring: 'Import prefab uuid → WeaponItem.asset.name → Lootcrate.loot array',
        respawnSeconds: 300,
      },
      crafting: {
        addon: 'CraftingExtended (_iMMOCRAFTING)',
        model: 'Tmpl_Recipe { profession, skillLevel, ingredients[], result }',
        canonicalSource: 'master-recipes.json',
        tier1WeaponRecipes: tier1Craft,
        note: 'Replace StreamingAssets/GameData/recipes.json with master-recipes.json sync',
      },
      enchantments: {
        addon: 'EquipmentLevelUp (_iMMOITEMLEVELUP) + Mystic enchants',
        objectStoreSource: 'master-enchants.json',
        ummorpgGap: 'No ENCH-* importer — use consumable UsableItem + custom apply script',
        enchantApply,
        equipmentLevelUp: {
          enabled: true,
          field: 'Item.equipmentLevel',
          maxLevel: 8,
          alignsWith: 'weapon tier upgrades via Miner/Engineer stations',
        },
      },
      weaponSkills: {
        addon: 'WeaponSkills + ScriptableWeaponSkillList',
        canonicalSource: 'master-weaponSkills.json',
        wiring: 'prefabs[].skills.slots → ScriptableWeaponSkillList GUID per weaponType+tier band',
        hotbarSlots: ['primary', 'secondary', 'ability', 'ultimate'],
      },
    },
    importPipeline: {
      canonical: [
        'master-weapon-prefabs.json',
        'master-weaponSkills.json',
        'master-registry.json',
      ],
      deprecated: [
        'weapons.json (119 templates only)',
        'StreamingAssets/GameData/recipes.json',
        'GrudgeDataImporter weaponRecipes',
      ],
      unityMenu: 'Grudge Studio → Import Canonical Weapon Prefabs',
    },
  };
}

function buildD1Seed(prefabs) {
  const lines = [
    '-- Weapon prefab registry seed for objectstore-meta D1',
    `-- Generated ${new Date().toISOString()}`,
    '-- Run: wrangler d1 execute objectstore-meta --remote --file=workers/seed/weapon-prefabs.sql',
    '',
    'CREATE TABLE IF NOT EXISTS weapon_prefabs (',
    '  uuid          TEXT PRIMARY KEY,',
    '  base_uuid     TEXT NOT NULL,',
    '  name          TEXT NOT NULL,',
    '  weapon_type   TEXT NOT NULL,',
    '  category      TEXT NOT NULL,',
    '  tier          INTEGER NOT NULL DEFAULT 0,',
    '  icon_r2_key   TEXT,',
    '  model_r2_key  TEXT,',
    '  recipe_uuid   TEXT,',
    '  prefab_json   TEXT NOT NULL,',
    '  updated_at    TEXT NOT NULL DEFAULT (datetime(\'now\'))',
    ');',
    '',
    'CREATE INDEX IF NOT EXISTS idx_weapon_prefabs_type ON weapon_prefabs(weapon_type);',
    'CREATE INDEX IF NOT EXISTS idx_weapon_prefabs_tier ON weapon_prefabs(tier);',
    'CREATE INDEX IF NOT EXISTS idx_weapon_prefabs_base ON weapon_prefabs(base_uuid);',
    '',
  ];

  const batchSize = 50;
  for (let i = 0; i < prefabs.length; i += batchSize) {
    const batch = prefabs.slice(i, i + batchSize);
    lines.push('INSERT INTO weapon_prefabs (uuid, base_uuid, name, weapon_type, category, tier, icon_r2_key, model_r2_key, recipe_uuid, prefab_json) VALUES');
    const values = batch.map((p) => {
      const esc = (s) => (s == null ? 'NULL' : `'${String(s).replace(/'/g, "''")}'`);
      return `(${esc(p.uuid)}, ${esc(p.baseUuid)}, ${esc(p.name)}, ${esc(p.weaponType)}, ${esc(p.category)}, ${p.tier}, ${esc(p.assets.iconR2Key)}, ${esc(p.assets.modelR2Key)}, ${esc(p.recipeUuid)}, ${esc(JSON.stringify(p))})`;
    });
    lines.push(values.join(',\n'));
    lines.push('ON CONFLICT(uuid) DO UPDATE SET');
    lines.push('  name=excluded.name, weapon_type=excluded.weapon_type, tier=excluded.tier,');
    lines.push('  icon_r2_key=excluded.icon_r2_key, model_r2_key=excluded.model_r2_key,');
    lines.push('  recipe_uuid=excluded.recipe_uuid, prefab_json=excluded.prefab_json,');
    lines.push('  updated_at=datetime(\'now\');');
    lines.push('');
  }

  return lines.join('\n');
}

// ── Main ──────────────────────────────────────────────────────────
const weaponsMaster = load('master-weapons.json');
const t0Weapons = load('t0-weapons.json');
const registry = load('master-registry.json');
const weaponSkills = load('master-weaponSkills.json');
const weaponsTemplates = load('weapons.json');
const recipes = load('master-recipes.json');
const enchants = load('master-enchants.json');

const variantIndex = buildNamedVariantIndex(weaponsTemplates);
const recipeIndex = buildRecipeIndex(recipes);
const skillIndex = buildSkillIndex(weaponSkills);

const t0Canonical = (t0Weapons.weapons || []).map((w) => ({ ...w, tier: 0, source: 'starter' }));
const t0Uuids = new Set(t0Canonical.map((w) => w.uuid));
const masterNonT0 = (weaponsMaster.items || []).filter((w) => (w.tier ?? 0) !== 0 && !t0Uuids.has(w.uuid));

const allItems = [...t0Canonical, ...masterNonT0];

const prefabs = allItems.map((item) => {
  const reg = registry.entries?.[item.uuid] || null;
  const baseKey = normalizeKey(item.baseName || item.name.replace(/\s+T\d+$/i, ''));
  const variantMeta = variantIndex.get(baseKey) || null;
  const weaponType = CATEGORY_TO_WEAPON_TYPE[item.category] || 'UNKNOWN';
  const skillTypeDef = skillIndex[weaponType] || null;
  const recipe = recipeIndex.get(item.uuid) || recipeIndex.get(item.id) || null;
  return buildPrefab(item, reg, variantMeta, skillTypeDef, recipe);
});

const output = {
  version: '1.0.0',
  generated: new Date().toISOString(),
  description:
    'Canonical weapon prefabs — five-slot pattern (1=standard attack, 2–3=shared, 4=signature, 5=passives)',
  slotPattern: 'five-slot',
  loadoutPattern: LOADOUT_PATTERN,
  assetCdn: CDN,
  total: prefabs.length,
  totals: {
    t0: prefabs.filter((p) => p.tier === 0).length,
    t1to8: prefabs.filter((p) => p.tier >= 1).length,
    withModels: prefabs.filter((p) => p.assets.modelR2Key).length,
    withSkills: prefabs.filter((p) => p.skills.skillUuids?.length > 0).length,
    withoutSkills: prefabs.filter((p) => !p.skills.skillUuids?.length && p.weaponType !== 'TOOL').length,
    tools: prefabs.filter((p) => p.weaponType === 'TOOL').length,
    withRecipes: prefabs.filter((p) => p.recipeUuid).length,
  },
  r2Layout: {
    models: 'models/weapons/{category}/{baseName}.glb',
    icons: 'game-assets/icons/weapons/{slug}.png',
    dropPrefabs: 'prefabs/items/weapons/{weaponType}/{tier}/{baseName}.prefab.glb',
    lootVfx: 'effects/3d/loot/weapon-{rarity}.glb',
  },
  d1Table: 'weapon_prefabs',
  d1Database: 'objectstore-meta',
  prefabs,
};

const bridge = buildUmmorpgBridge(prefabs, enchants, recipes);
const d1Seed = buildD1Seed(prefabs);

const slotPatternDoc = {
  version: '1.0.0',
  generated: new Date().toISOString(),
  description:
    'Five-slot hotbar: 1=standard attack (type-wide), 2–3=shared style pools, 4=variant signature, 5=variant passives',
  labels: SLOT_LABELS,
  types: {},
};
const aliasMeta = loadAbilityMeta();
for (const [typeId, wt] of Object.entries(skillIndex)) {
  if (!wt?.slots?.length) continue;
  const map = slotMap(wt.slots);
  const std = pickStandardAttack(map.primary?.skills, null, typeId, aliasMeta);
  slotPatternDoc.types[typeId] = {
    standardAttack: std?.name || null,
    standardAttackSkillId: std?.id || null,
    slot2SharedSkills: (map.secondary?.skills || []).map((s) => s.name),
    slot3SharedSkills: (map.ability?.skills || []).map((s) => s.name),
    slot4SignaturePool: (map.ultimate?.skills || []).map((s) => s.name),
    slot5: 'variant passives (weapons.json passives[])',
  };
}

mkdirSync(join(API, '_meta'), { recursive: true });
writeFileSync(join(API, '_meta', 'weapon-slot-pattern.json'), JSON.stringify(slotPatternDoc, null, 2));

writeFileSync(join(API, 'master-weapon-prefabs.json'), JSON.stringify(output, null, 2));
writeFileSync(join(API, 'ummorpg-systems-bridge.json'), JSON.stringify(bridge, null, 2));

const seedDir = join(ROOT, 'workers', 'seed');
mkdirSync(seedDir, { recursive: true });
writeFileSync(join(seedDir, 'weapon-prefabs.sql'), d1Seed);

console.log(`Built ${prefabs.length} weapon prefabs`);
console.log(`  T0: ${output.totals.t0}, T1-8: ${output.totals.t1to8}`);
console.log(`  With models: ${output.totals.withModels}, skills: ${output.totals.withSkills}`);
console.log(`  → api/v1/master-weapon-prefabs.json`);
console.log(`  → api/v1/ummorpg-systems-bridge.json`);
console.log(`  → api/v1/_meta/weapon-slot-pattern.json`);
console.log(`  → workers/seed/weapon-prefabs.sql`);
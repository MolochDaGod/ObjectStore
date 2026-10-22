#!/usr/bin/env node
/**
 * build-fleet-effects-api.mjs
 *
 * Builds api/v1/effects.json — the fleet Effects API bridge SSOT.
 *
 * Agents previously 404'd on info…/api/v1/effects.json while the sandbox
 * (vfx.grudge-studio.com) served a 13-row list with 3dfx… uuids, and
 * ObjectStore already had vfx-spells / spell-arsenal / 3dfx-uuids with
 * different id schemes. This file is the one join table.
 *
 * Runtime contract for Warlords / Casting / Open:
 *   weaponSkill.effectId | castEffectId | travelEffectId | impactEffectId
 *   → effects.json.effectId
 *   → vfxSpellId / arsenalId / sandboxUuid / glb
 *
 * Usage:
 *   node scripts/build-fleet-effects-api.mjs
 *   node scripts/build-fleet-effects-api.mjs --fetch-sandbox
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const API = join(ROOT, 'api', 'v1');
const OUT = join(API, 'effects.json');
const FETCH = process.argv.includes('--fetch-sandbox');

function load(name) {
  const p = join(API, name);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8'));
}

/** Sandbox panel rows (live mirror of vfx.grudge-studio.com). Updated when --fetch-sandbox. */
const SANDBOX_SEED = [
  {
    uuid: '3dfx0000-0000-4000-8000-slashfire000',
    name: 'Flame Slash',
    category: 'combat',
    tags: ['slash', 'fire', 'glb'],
    glbUrl: '/models/vfx/slash/slashred.glb',
    effectId: 'fire_slash',
    hotkeys: [],
  },
  {
    uuid: '3dfx0000-0000-4000-8000-slashfrost00',
    name: 'Frost Slash',
    category: 'combat',
    tags: ['slash', 'ice', 'glb'],
    glbUrl: '/models/vfx/slash/slashblue.glb',
    effectId: 'frost_slash',
    hotkeys: [],
  },
  {
    uuid: '3dfx0000-0000-4000-8000-slashvoid000',
    name: 'Void Slash',
    category: 'combat',
    tags: ['slash', 'dark', 'glb'],
    glbUrl: '/models/vfx/slash/slashpurple.glb',
    effectId: 'arcane_slash',
    hotkeys: [],
  },
  {
    uuid: '3dfx0000-0000-4000-8000-slashholy000',
    name: 'Holy Slash',
    category: 'combat',
    tags: ['slash', 'light', 'glb'],
    glbUrl: '/models/vfx/slash/slashyellow.glb',
    effectId: 'holy_beam',
    hotkeys: ['B'],
  },
  {
    uuid: '3dfx0000-0000-4000-8000-fireball0000',
    name: 'Fireball',
    category: 'combat',
    tags: ['projectile', 'fire'],
    glbUrl: null,
    effectId: 'fireball',
    hotkeys: ['C'],
  },
  {
    uuid: '3dfx0000-0000-4000-8000-frostwave000',
    name: 'Frost Wave',
    category: 'combat',
    tags: ['wave', 'ice'],
    glbUrl: null,
    effectId: 'frost_wave',
    hotkeys: ['F', 'T'],
  },
  {
    uuid: '3dfx0000-0000-4000-8000-arcaneaura00',
    name: 'Arcane Aura',
    category: 'combat',
    tags: ['aura', 'loop'],
    glbUrl: null,
    effectId: 'arcane_aura_ring',
    hotkeys: ['G'],
  },
  {
    uuid: '3dfx0000-0000-4000-8000-handgauntlet',
    name: 'Flame Gauntlet',
    category: 'combat',
    tags: ['hand', 'fire'],
    glbUrl: null,
    effectId: 'fire_hand',
    hotkeys: ['H'],
  },
  {
    uuid: '3dfx0000-0000-4000-8000-wispsorbit00',
    name: 'Seeking Wisps',
    category: 'combat',
    tags: ['wisp', 'homing'],
    glbUrl: null,
    effectId: 'fire_wisps',
    hotkeys: ['K'],
  },
  {
    uuid: '3dfx0000-0000-4000-8000-poisoncloud0',
    name: 'Poison Cloud',
    category: 'combat',
    tags: ['cloud', 'poison'],
    glbUrl: null,
    effectId: 'poison_cloud',
    hotkeys: [],
  },
  {
    uuid: '3dfx0000-0000-4000-8000-shockwave000',
    name: 'Shockwave',
    category: 'combat',
    tags: ['wave', 'shockwave'],
    glbUrl: null,
    effectId: 'shockwave',
    hotkeys: [],
  },
  {
    uuid: '3dfx0000-0000-4000-8000-meteor000000',
    name: 'Meteor',
    category: 'combat',
    tags: ['projectile', 'meteor'],
    glbUrl: null,
    effectId: 'meteor',
    hotkeys: ['O'],
  },
  {
    uuid: '3dfx0000-0000-4000-8000-icebow000000',
    name: 'Stylized Ice Bow',
    category: 'weapon',
    tags: ['weapon', 'glb'],
    glbUrl: '/models/vfx/stylized_ice_bow.glb',
    effectId: 'styproj.frost',
    hotkeys: [],
  },
];

/** Hotkey panel → effectId (Alt+key in Warlords / Open Danger). */
const HOTKEY_EFFECTS = [
  { key: 'V', label: 'Ice Serpent', effectId: 'ice_lightning_burst' },
  { key: 'B', label: 'Moon Beam', effectId: 'moon_beam' },
  { key: 'F', label: 'Frost Wave', effectId: 'frost_wave' },
  { key: 'G', label: 'Aura Ring', effectId: 'fire_aura' },
  { key: 'T', label: 'Earth Surge', effectId: 'frost_wave' },
  { key: 'C', label: 'Fireball', effectId: 'fireball' },
];

const NAME_TO_EFFECT = {
  'Flame Slash': 'fire_slash',
  'Frost Slash': 'frost_slash',
  'Void Slash': 'arcane_slash',
  'Holy Slash': 'holy_beam',
  Fireball: 'fireball',
  'Frost Wave': 'frost_wave',
  'Arcane Aura': 'arcane_aura_ring',
  'Flame Gauntlet': 'fire_hand',
  'Seeking Wisps': 'fire_wisps',
  'Poison Cloud': 'poison_cloud',
  Shockwave: 'shockwave',
  Meteor: 'meteor',
  'Stylized Ice Bow': 'styproj.frost',
};

async function loadSandboxRows() {
  if (!FETCH) return SANDBOX_SEED;
  try {
    const res = await fetch('https://vfx.grudge-studio.com/api/v1/effects.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.effects || []).map((e) => ({
      uuid: e.uuid,
      name: e.name,
      category: e.category || 'combat',
      tags: e.tags || [],
      glbUrl: e.glbUrl || null,
      effectId: NAME_TO_EFFECT[e.name] || e.id || e.name?.toLowerCase()?.replace(/\s+/g, '_'),
      hotkeys: [],
    }));
  } catch (err) {
    console.warn(`[build-fleet-effects-api] fetch failed, using seed: ${err.message}`);
    return SANDBOX_SEED;
  }
}

function collectArsenalIds(arsenal) {
  const map = new Map();
  if (!arsenal?.spellTypes) return map;
  for (const [typeId, type] of Object.entries(arsenal.spellTypes)) {
    for (const v of type.variants || []) {
      map.set(v.id, { ...v, spellType: typeId });
    }
  }
  return map;
}

function absoluteGlb(glbUrl) {
  if (!glbUrl) return null;
  if (glbUrl.startsWith('http')) return glbUrl;
  // Sandbox-relative → prefer assets CDN when path is under models/vfx
  if (glbUrl.startsWith('/models/vfx/')) {
    return `https://assets.grudge-studio.com${glbUrl.replace(/^\/models/, '/models')}`;
  }
  return `https://vfx.grudge-studio.com${glbUrl}`;
}

function build() {
  return (async () => {
    const sandbox = await loadSandboxRows();
    const vfxSpells = load('vfx-spells.json');
    const arsenal = load('spell-arsenal.json');
    const uuids = load('3dfx-uuids.json');
    const prodGlb = load('vfx-production-glb.json');
    const arsenalMap = collectArsenalIds(arsenal);
    const spellMap = vfxSpells?.spells || {};

    const byId = new Map();

    function upsert(partial) {
      const id = partial.effectId;
      if (!id) return;
      const prev = byId.get(id) || {
        effectId: id,
        name: id,
        category: 'combat',
        tags: [],
        sources: [],
        hotkeys: [],
      };
      const next = {
        ...prev,
        ...partial,
        tags: [...new Set([...(prev.tags || []), ...(partial.tags || [])])],
        sources: [...new Set([...(prev.sources || []), ...(partial.sources || [])])],
        hotkeys: [...new Set([...(prev.hotkeys || []), ...(partial.hotkeys || [])])],
      };
      byId.set(id, next);
    }

    for (const row of sandbox) {
      const spell = spellMap[row.effectId];
      const ar = arsenalMap.get(row.effectId);
      upsert({
        effectId: row.effectId,
        name: row.name || spell?.name || ar?.name || row.effectId,
        category: ar?.spellType || spell?.category || row.category || 'combat',
        tags: row.tags || [],
        sandboxUuid: row.uuid,
        vfxSpellId: spell ? row.effectId : null,
        arsenalId: ar ? row.effectId : null,
        legacyUuid: uuids?.uuids?.[row.effectId] || null,
        stylizedId: uuids?.stylized?.[row.effectId] || null,
        glbUrl: row.glbUrl || null,
        glbAbsolute: absoluteGlb(row.glbUrl),
        hotkeys: row.hotkeys || [],
        sources: ['sandbox', ...(spell ? ['vfx-spells'] : []), ...(ar ? ['spell-arsenal'] : [])],
      });
    }

    for (const hk of HOTKEY_EFFECTS) {
      const spell = spellMap[hk.effectId];
      const ar = arsenalMap.get(hk.effectId);
      upsert({
        effectId: hk.effectId,
        name: ar?.name || spell?.name || hk.label,
        category: ar?.spellType || spell?.category || 'combat',
        tags: ar?.tags || spell?.tags || [],
        vfxSpellId: spell ? hk.effectId : null,
        arsenalId: ar ? hk.effectId : null,
        legacyUuid: uuids?.uuids?.[hk.effectId] || null,
        hotkeys: [hk.key],
        sources: ['hotkey-panel', ...(spell ? ['vfx-spells'] : []), ...(ar ? ['spell-arsenal'] : [])],
      });
    }

    // Include remaining arsenal variants so weapon skills can resolve without sandbox row.
    for (const [id, ar] of arsenalMap) {
      if (byId.has(id)) continue;
      const spell = spellMap[id];
      upsert({
        effectId: id,
        name: ar.name || spell?.name || id,
        category: ar.spellType || spell?.category || 'combat',
        tags: ar.tags || spell?.tags || [],
        vfxSpellId: spell ? id : null,
        arsenalId: id,
        legacyUuid: uuids?.uuids?.[id] || null,
        stylizedId: uuids?.stylized?.[id] || null,
        sources: ['spell-arsenal', ...(spell ? ['vfx-spells'] : [])],
      });
    }

    const effects = [...byId.values()].sort((a, b) => a.effectId.localeCompare(b.effectId));

    const doc = {
      ok: true,
      version: '1.0.0',
      generated: new Date().toISOString(),
      id: 'fleet-effects-api',
      description:
        'Fleet Effects API bridge. Prefer effectId on weapon skills. Sandbox 3dfx uuids and ObjectStore vfx-spells/spell-arsenal join here. Do not invent a fourth effects catalog.',
      ssot: 'https://info.grudge-studio.com/api/v1/effects.json',
      hosts: {
        definitions: 'https://info.grudge-studio.com/api/v1',
        definitionsProxy: 'https://objectstore.grudge-studio.com/api/v1',
        sandboxApi: 'https://vfx.grudge-studio.com/api/v1/effects.json',
        sandboxUi: 'https://vfxgrudge.puter.site/',
        sandboxUiAlias: 'https://vfx-grudge.puter.site/',
        studioUi: 'https://vfx.grudge.studio/',
        deadHosts: [
          'https://grudge-vfx.puter.site/',
          'https://vfx.grudge.studio/api/v1/effects.json',
        ],
      },
      related: {
        vfxSpells: '/api/v1/vfx-spells.json',
        spellArsenal: '/api/v1/spell-arsenal.json',
        stylizedProjectiles: '/api/v1/stylized-projectiles.json',
        vfxProductionGlb: '/api/v1/vfx-production-glb.json',
        threeDfxUuids: '/api/v1/3dfx-uuids.json',
        castingSpellKit: '/api/v1/casting-spell-kit.json',
        weaponSkills: '/api/v1/master-weaponSkills.json',
        abilityEffects: '/api/v1/abilityEffects.json',
      },
      playerApi: {
        railway: 'https://grudge-api-production-0d46.up.railway.app',
        sameOrigin: [
          'https://grudgewarlords.com/api/*',
          'https://client.grudge-studio.com/api/*',
          'https://wallet.grudge-studio.com/api/*',
        ],
        avoid: [
          'https://api.grudge-studio.com for bag/wallet/characters (use same-origin → Railway)',
          'https://account.grudge-studio.com (522 dead)',
        ],
        assetIndexOnly: 'https://api.grudge-studio.com/assets (D1 search — not player SSOT)',
      },
      runtime: {
        bindFields: ['effectId', 'castEffectId', 'travelEffectId', 'impactEffectId', 'vfxRef'],
        rule: 'Resolve effectId via this file, then deploy via Open/Warlords vfxEffectCatalog / deploySandboxVfx. Never load whole fireball.glb as projectile — use orb meshes from vfx-production-glb.',
        warlordsHotkeys: 'Alt+V/B/F/G/T/C only (bare C/G are mobility)',
      },
      count: effects.length,
      sandboxCount: sandbox.length,
      effects,
      productionGlbNote: prodGlb?.description || null,
    };

    writeFileSync(OUT, JSON.stringify(doc, null, 2) + '\n', 'utf8');
    console.log(`[build-fleet-effects-api] wrote ${OUT}`);
    console.log(`[build-fleet-effects-api] count=${doc.count} sandbox=${doc.sandboxCount}`);
  })();
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});

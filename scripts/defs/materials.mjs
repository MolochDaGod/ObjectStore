/**
 * scripts/defs/materials.mjs
 *
 * Canonical crafting materials. Each material is tier-aware (T1-T8) and tied
 * to a gathering profession. Filled per consolidation session.
 *
 *   ore / ingot     — Mining → Miner smelts
 *   log / plank     — Logging → Forester planks
 *   thread / cloth  — Herbalism → Tailor
 *   hide / leather  — Skinning → Leatherworker
 *   essence         — drops from creatures / harvests
 *   gem             — Mining rare drop
 *   herb            — Herbalism
 */

export const MATERIAL_TIERS = [
  // { tier: 1, ore: 'copper-ore', ingot: 'copper-ingot', log: 'pine-log', plank: 'pine-plank', ... },
];

export const MATERIALS = {
  // ore: [...],
  // ingot: [...],
  // log: [...],
  // plank: [...],
  // thread: [...],
  // cloth: [...],
  // hide: [...],
  // leather: [...],
  // essence: [...],
  // gem: [...],
  // herb: [...],
};

export const GROUPS_MIGRATED = new Set(Object.keys(MATERIALS));

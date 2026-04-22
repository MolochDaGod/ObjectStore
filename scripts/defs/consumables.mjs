/**
 * scripts/defs/consumables.mjs
 *
 * Food, potion, scroll, throwable, and bomb definitions.
 * Filled per consolidation session.
 */

export const CONSUMABLES = {
  // food: { red: [...], green: [...], blue: [...] },   // profession: Chef
  // potions: [...],                                     // profession: Mystic
  // scrolls: [...],                                     // profession: Scribe (TBD)
  // throwables: [...],                                  // profession: Engineer
  // bombs: [...],                                       // profession: Engineer
};

export const GROUPS_MIGRATED = new Set(Object.keys(CONSUMABLES));

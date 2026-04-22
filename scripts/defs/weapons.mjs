/**
 * scripts/defs/weapons.mjs
 *
 * Category-by-category weapon definitions, filled in during consolidation
 * sessions (see scripts/defs/README.md). Until a category is signed off,
 * it is NOT present in this export and the generator falls back to the
 * inline tables in generate-master-database.mjs.
 *
 * Once all categories are migrated here, the inline tables are deleted and
 * this file becomes the only source.
 */

export const WEAPONS = {
  // swords: { profession: 'Miner', subCategory: '1h', items: [...] },
  // axes: { profession: 'Miner', subCategory: '1h', items: [...] },
  // daggers: { profession: 'Miner', subCategory: '1h', items: [...] },
  // hammers: { profession: 'Miner', subCategory: '2h', items: [...] },
  // greatswords: { profession: 'Miner', subCategory: '2h', items: [...] },
  // greataxes: { profession: 'Miner', subCategory: '2h', items: [...] },
  // spears: { profession: 'Miner', subCategory: '2h', items: [...] },
  // maces: { profession: 'Miner', subCategory: '1h', items: [...] },
  // shields: { profession: 'Miner', subCategory: 'offhand', items: [...] },
  // bows: { profession: 'Forester', subCategory: '2h', items: [...] },
  // crossbows: { profession: 'Engineer', subCategory: '2h', items: [...] },
  // guns: { profession: 'Engineer', subCategory: '2h', items: [...] },
  // fireStaves: { profession: 'Mystic', subCategory: '2h', items: [...] },
  // frostStaves: { profession: 'Mystic', subCategory: '2h', items: [...] },
  // holyStaves: { profession: 'Mystic', subCategory: '2h', items: [...] },
  // lightningStaves: { profession: 'Mystic', subCategory: '2h', items: [...] },
  // natureStaves: { profession: 'Mystic', subCategory: '2h', items: [...] },
};

export const CATEGORIES_MIGRATED = new Set(Object.keys(WEAPONS));

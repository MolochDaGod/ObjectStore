/**
 * scripts/defs/offhand-tomes.mjs
 *
 * D4: Tomes are tier-less off-hand utility items. Equipping a tome in the
 * off-hand while wielding a 1h main-hand (sword, axe, dagger, mace, pistol,
 * etc.) grants that main-hand new spell-cast options drawn from the tome's
 * school.
 *
 * Schema:
 *   type: 'offhand-tome'
 *   school: 'fire' | 'frost' | 'holy' | 'nature' | 'storm' | 'arcane' | 'legendary'
 *   skillGrants: [{ id, name, level }]   // spells unlocked on the main-hand
 *   no stat block, no tier expansion, no signature/passives
 *
 * Tomes are crafted by the Mystic profession (or discovered — see individual
 * entries) and expanded via main-hand weapon-skill logic in-game, not here.
 */

export const OFFHAND_TOMES = [
  // {
  //   name: 'Fire Tome',
  //   slug: 'fire-tome',
  //   school: 'fire',
  //   profession: 'Mystic',
  //   mats: { 'Paper': 5, 'Fire Essence': 3 },
  //   skillGrants: [
  //     { id: 'skill-fire-bolt', name: 'Fire Bolt', level: 1 },
  //     { id: 'skill-flame-wave', name: 'Flame Wave', level: 10 },
  //   ],
  // },
];

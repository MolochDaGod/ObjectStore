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
  { name: 'Fire Tome',      slug: 'fire-tome',      school: 'fire',      profession: 'Mystic', desc: 'Grants Fire spell options to the main-hand weapon.',      mats: { 'Paper': 5, 'Fire Essence': 3 },      skillGrants: [{ name: 'Fire Bolt', level: 1 }, { name: 'Flame Wave', level: 10 }] },
  { name: 'Frost Tome',     slug: 'frost-tome',     school: 'frost',     profession: 'Mystic', desc: 'Grants Frost spell options to the main-hand weapon.',     mats: { 'Paper': 5, 'Frost Essence': 3 },     skillGrants: [{ name: 'Frost Bolt', level: 1 }, { name: 'Deep Freeze', level: 10 }] },
  { name: 'Holy Tome',      slug: 'holy-tome',      school: 'holy',      profession: 'Mystic', desc: 'Grants Holy spell options to the main-hand weapon.',      mats: { 'Paper': 5, 'Holy Essence': 3 },      skillGrants: [{ name: 'Holy Light', level: 1 }, { name: 'Cleanse', level: 10 }] },
  { name: 'Lightning Tome', slug: 'lightning-tome', school: 'storm',     profession: 'Mystic', desc: 'Grants Storm spell options to the main-hand weapon.',     mats: { 'Paper': 5, 'Storm Essence': 3 },     skillGrants: [{ name: 'Chain Lightning', level: 1 }, { name: 'Thunder Clap', level: 10 }] },
  { name: 'Nature Tome',    slug: 'nature-tome',    school: 'nature',    profession: 'Mystic', desc: 'Grants Nature spell options to the main-hand weapon.',    mats: { 'Paper': 5, 'Nature Essence': 3 },    skillGrants: [{ name: 'Thorn Lash', level: 1 }, { name: 'Entangle', level: 10 }] },
  { name: 'Arcane Tome',    slug: 'arcane-tome',    school: 'arcane',    profession: 'Mystic', desc: 'Grants Arcane spell options to the main-hand weapon.',    mats: { 'Paper': 5, 'Arcane Essence': 3 },    skillGrants: [{ name: 'Arcane Missile', level: 1 }, { name: 'Mana Burst', level: 10 }] },
  { name: 'Spellbook',      slug: 'spellbook',      school: 'multi',     profession: 'Mystic', desc: 'Multi-school tome. Grants a single picked school plus a cross-school utility.', mats: { 'Enchanted Paper': 10, 'All Essence': 2 }, skillGrants: [{ name: 'Dispel Magic', level: 5 }, { name: 'Arcane Shield', level: 15 }] },
  { name: 'Arcane Book',    slug: 'arcane-book',    school: 'legendary', profession: 'Mystic', desc: 'Rare advanced tome. Grants an artifact-linked cast option to the main-hand.', mats: { 'Divine Paper': 15, 'Soul Core': 1 },  skillGrants: [{ name: 'Legendary Echo', level: 20 }] },
];

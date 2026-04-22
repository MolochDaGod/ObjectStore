/**
 * scripts/defs/artifacts.mjs
 *
 * D3: Artifact is the end-game, world-found, discovery-gated item category.
 *
 * Artifacts do NOT tier-expand. They have fixed stats, no craft recipe
 * (source is world/boss/quest/raid), and they are hidden from player-facing
 * UIs until the discovery conditions are met.
 *
 * The `artifactType` namespace is reserved — `arcane` is the first sub-type;
 * more will be added later.
 *
 * Schema:
 *   type: 'artifact'
 *   classification: 'artifact'
 *   artifactType: 'arcane' | '…future…'
 *   discovery: {
 *     hiddenUntilFound: true,
 *     source: 'world' | 'boss' | 'quest' | 'raid',
 *     revealCondition: 'human-readable condition',
 *   }
 *   stats: { … }   // fixed — no perTier scaling
 *   abilities, signature, passives, lore
 *
 * Player-facing UIs MUST filter out artifacts where
 * `discovery.hiddenUntilFound === true` AND the player has not discovered
 * the item. Admin-facing tools bypass this filter.
 */

// Seed Artifact catalog (D3). These replace the former `arcaneStaves` slot.
// All entries are hidden until discovered; player-facing UIs MUST filter by
// `discovery.hiddenUntilFound` unless the player has found the item.
export const ARTIFACTS = [
  {
    name: 'Hellfire Oathbreaker', slug: 'hellfire-oathbreaker', artifactType: 'arcane',
    desc: 'The staff that shattered the first god-oath. Channels raw hellfire.',
    stats: { damage: 220, manaAmp: 35, criticalChance: 12, defense: 28 },
    abilities: ['Hellfire Cone', 'Oathburn', 'Inferno Blink'],
    signature: 'Oathburn',
    passives: ['Fire Resonance', 'Spell Echo'],
    discovery: { hiddenUntilFound: true, source: 'boss', revealCondition: 'Defeat the Sundered Oathkeeper' },
    lore: 'Forged in the first age to break binding magics; lost to the Ember Dig.',
  },
  {
    name: 'Infernal Grudge', slug: 'infernal-grudge', artifactType: 'arcane',
    desc: 'A spire of blackened bone that remembers every grudge ever spoken beside it.',
    stats: { damage: 205, manaAmp: 32, criticalChance: 15, defense: 24 },
    abilities: ['Grudge Surge', 'Soulfire Bolt'],
    signature: 'Grudge Surge',
    passives: ['Mana Echo', 'Bleed Amp'],
    discovery: { hiddenUntilFound: true, source: 'world', revealCondition: 'Uncover the Grudge Shrine in the Hollow Reach' },
    lore: null,
  },
  {
    name: 'Frigid Oathbreaker', slug: 'frigid-oathbreaker', artifactType: 'arcane',
    desc: 'The Oathbreaker remade in eternal winter.',
    stats: { damage: 195, manaAmp: 38, criticalChance: 10, defense: 40 },
    abilities: ['Glacial Oath', 'Frozen Truth'],
    signature: 'Glacial Oath',
    passives: ['Chill Aura', 'Frostward'],
    discovery: { hiddenUntilFound: true, source: 'raid', revealCondition: 'Clear the Ice-Wraith vault' },
    lore: null,
  },
  {
    name: 'Flameblood Spire', slug: 'flameblood-spire', artifactType: 'arcane',
    desc: 'A blood-forged spire humming with ancestral fire.',
    stats: { damage: 230, manaAmp: 30, criticalChance: 14, defense: 26 },
    abilities: ['Blood Flame', 'Pyre Call'],
    signature: 'Blood Flame',
    passives: ['Lifesteal Aura', 'Heat Shield'],
    discovery: { hiddenUntilFound: true, source: 'quest', revealCondition: 'Complete the Crimson Rite questline' },
    lore: null,
  },
  {
    name: 'Iceblood Spire', slug: 'iceblood-spire', artifactType: 'arcane',
    desc: 'Frozen blood hangs in its crystal. Every shard is a name.',
    stats: { damage: 210, manaAmp: 36, criticalChance: 13, defense: 34 },
    abilities: ['Shardrise', 'Frostblood Nova'],
    signature: 'Shardrise',
    passives: ['Frost Resonance', 'Spellshield'],
    discovery: { hiddenUntilFound: true, source: 'boss', revealCondition: 'Slay the Icebound Heretic' },
    lore: null,
  },
  {
    name: 'Bloodfeud Staff', slug: 'bloodfeud-staff', artifactType: 'arcane',
    desc: 'A clan relic: the oldest grudge of every house, bound in yew and bone.',
    stats: { damage: 215, manaAmp: 34, criticalChance: 16, defense: 22 },
    abilities: ['Feud Strike', 'Blood Echo'],
    signature: 'Feud Strike',
    passives: ['Clan Bond', 'Vengeance Amp'],
    discovery: { hiddenUntilFound: true, source: 'world', revealCondition: 'Collect all six clan shards' },
    lore: null,
  },
];

// Future artifact types reserve the namespace: storm, blood, frost, ember,
// nature, holy, void. Add entries here as they come online.

/**
 * Future artifact types (reserved namespace - each will live here as
 * additional entries with their own artifactType token):
 *   arcane, storm, blood, frost, ember, nature, holy, void
 */

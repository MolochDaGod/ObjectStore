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

export const ARTIFACTS = [
  // {
  //   name: 'Staff of the First Grudge',
  //   slug: 'staff-of-the-first-grudge',
  //   artifactType: 'arcane',
  //   desc: 'Whispers of the first oath broken between gods and men.',
  //   stats: { damage: 320, manaAmp: 40, criticalChance: 18, defense: 35 },
  //   abilities: ['Grudgebind', 'Oath Shatter', 'Memory of the First Forge'],
  //   signature: 'First Grudge',
  //   passives: ['Mana Echo', 'Spellsteal', 'Arcane Resonance'],
  //   discovery: {
  //     hiddenUntilFound: true,
  //     source: 'boss',
  //     revealCondition: 'Defeat the First Warlord at the Ember Dig',
  //   },
  //   lore: '…',
  // },
];

/**
 * Future artifact types (reserved namespace - each will live here as
 * additional entries with their own artifactType token):
 *   arcane, storm, blood, frost, ember, nature, holy, void
 */

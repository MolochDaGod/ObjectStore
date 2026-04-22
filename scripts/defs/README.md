# scripts/defs — category source modules

This folder is the authoritative definition source for every Grudge item.
The generator (`scripts/generate-master-database.mjs`) imports these modules
and produces `api/v1/master-*.json` files.

## Module contract

Every `.mjs` in this folder exports a named constant. The generator rewires
the inline tables in `generate-master-database.mjs` to pull from these
modules (see plan phase A/B/C/D/E). During the consolidation sessions,
modules are filled in one category at a time and signed off by the user
before being written to disk.

Each module defines one or more categories using the shape below. The
generator is responsible for tier expansion, icon resolution, recipe
generation, and material UUID assignment — modules must not do any of those.

### Weapons, armor, and any tiered item (`weapons.mjs`, `armor.mjs`)

```js
export const WEAPONS = {
  swords: {
    profession: 'Miner',
    subCategory: '1h',            // or '2h' | 'offhand'
    classRestriction: ['warrior', 'ranger'],  // D3 rule compliance
    items: [
      {
        name: 'Bloodfeud Blade',
        slug: 'bloodfeud-blade',  // used for /icons/weapons/<slug>.png
        desc: '…',
        mats: { 'Iron Ingot': 3, 'Leather': 1 },
        stats: { damageBase: 50, damagePerTier: 12, ... },
        abilities: [...],
        signature: '…',
        passives: [...],
      },
    ],
  },
  // ...other weapon categories
};
```

### Tomes (D4 — tier-less off-hand utility)

```js
export const OFFHAND_TOMES = [
  {
    name: 'Fire Tome',
    slug: 'fire-tome',
    school: 'fire',                   // fire|frost|holy|nature|storm|arcane|legendary
    mats: { 'Paper': 5, 'Fire Essence': 3 },
    skillGrants: [                    // spells granted to 1h main-hand
      { id: 'skill-fire-bolt', name: 'Fire Bolt', level: 1 },
      { id: 'skill-flame-wave', name: 'Flame Wave', level: 10 },
    ],
    profession: 'Mystic',
  },
];
```

Tomes never have a tier block. They carry `type: 'offhand-tome'` in the
generated master-items.json and are excluded from tier expansion.

### Artifacts (D3 — world-found, discovery-gated)

```js
export const ARTIFACTS = [
  {
    name: 'Staff of the First Grudge',
    slug: 'staff-of-the-first-grudge',
    artifactType: 'arcane',           // first sub-type; more added later
    desc: '…',
    stats: { … },                     // fixed stats, no perTier scaling
    abilities: [...],
    discovery: {
      hiddenUntilFound: true,
      source: 'boss',                 // world | boss | quest | raid
      revealCondition: 'Defeat the First Warlord in the Ember Dig',
    },
  },
];
```

Artifacts skip tier expansion entirely and carry
`classification: 'artifact'` + a `discovery` block so player-facing UIs can
filter them out until found. Admin tools ignore the `hiddenUntilFound`
flag.

### Consumables, materials

Similar shape — each module exports a named constant consumed by the
generator. See the TODO stubs in the matching `.mjs` files.

## Consolidation workflow

For every category the generator needs, the user approves a filled-in
definition during a consolidation session. The flow is:

1. Audit (`scripts/audit-items.mjs`) enumerates current Grudge items +
   legacy items-database.json + old Unity/Steam source.
2. The category gets a proposed consolidated list, including which legacy
   items fold in, under what names, with what tier/material/profession.
3. User signs off → definitions are written here → generator is re-run →
   `api/v1/master-*.json` regenerates → audit is re-run to confirm no new
   issues.

No category ships without that round trip.

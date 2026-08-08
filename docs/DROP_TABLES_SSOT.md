# Drop tables SSOT — tier · difficulty · player level

**JSON:** `api/v1/drop-tables.json`  
**Runtime:** Casting `src/loot/dropTables.js` · World drops: full T0–T8 presentation

## Prefab pattern (all tiers T0–T8)

T6 / T7 / T8 **keep the full prefab systems**:

- `master-weapon-prefabs` entries (stats, skills, icons, models)  
- World drop presentation (icon sprite, glow, border, mini model)  
- Bag / equip / craft / economy  

They are **not** excluded from the catalog — only from **natural** loot RNG.

## Natural vs special loot

| Source class | Max tier | Examples |
|--------------|----------|----------|
| **Natural** | **T5** | mob_trash, mob_normal, mob_elite, chest_common, chest_uncommon, boss*, raid*, harvest_node |
| **Special** | **T8** | player_death, special_chest, dungeon_loot, dungeon_boss, raid_mythic, event_reward |

\* Open-world / normal boss & raid rolls still cap at **T5**. Use `dungeon_boss` / `raid_mythic` when mythic+ is intended.

### T6–T8 may appear from

1. **Player death** — corpse drops gear the player was **holding** (any tier, full prefab identity)  
2. **Special chests** — intentional high-end containers  
3. **Dungeon loot / dungeon bosses**  
4. **Raid mythic** / event rewards  

### T6–T8 must **not** appear from

- Trash / normal / elite open-world mobs  
- Common / uncommon world chests  
- Harvest nodes  
- Default boss/raid tables that are “natural” (unless reclassified special)

## Other hard rules

| Rule | Value |
|------|--------|
| **T0 in drops** | **Yes** — materials, potions, foods, thrown |
| **Player level** | Caps natural max tier + soft target; special unlocks T6+ with level gates |
| **Difficulty** | Level bias, qty, rare mul, T0 weight |

## Player level → natural max tier

| Player level | Natural max |
|--------------|-------------|
| 1–9 | T1 |
| 10–19 | T2 |
| 20–29 | T3 |
| 30–39 | T4 |
| 40+ | **T5** |

Special sources: T6 soft-unlock ~eff level 45, T7 ~55, T8 ~65 (still rare via `mythicChance`).

## Difficulty

| Id | Level bias | Qty | Rare (T3–5) | T0 weight |
|----|------------|-----|-------------|-----------|
| trivial | −8 | 0.7× | 0.35× | 1.6× |
| easy | −4 | 0.85× | 0.6× | 1.3× |
| normal | 0 | 1× | 1× | 1× |
| hard | +6 | 1.15× | 1.45× | 0.85× |
| elite | +12 | 1.35× | 1.9× | 0.7× |
| boss | +18 | 1.6× | 2.4× | 0.55× |
| raid | +24 | 2× | 3× | 0.4× |

## Categories that must keep T0

materials · potions · foods · thrown · junk  

Boss/raid **guarantee** T0 mats/pots even when gear is T4–T5.

## API

```js
import {
  rollLoot,
  rollPlayerDeathDrops,
  NATURAL_MAX_DROP_TIER,
  MYTHIC_TIERS,
  isMythicSource
} from './dropTables.js';

// Natural — never T6–8
rollLoot({ source: 'mob_normal', playerLevel: 30, difficulty: 'hard' });

// Corpse — spill held T6–8 gear as full prefabs
rollPlayerDeathDrops(playerHeldItems, { playerLevel: 50 });

// Dungeon special chest
rollLoot({ source: 'special_chest', playerLevel: 48, difficulty: 'elite' });
```

## Related

- Prefabs: `master-weapon-prefabs.json` (T0–T8)  
- World presentation: `docs/WORLD_DROP_PRESENTATION.md`  
- Skills: `master-weaponSkills.json`  

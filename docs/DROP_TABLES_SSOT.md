# Drop tables SSOT — tier · difficulty · player level

**JSON:** `api/v1/drop-tables.json`  
**Live:** `https://info.grudge-studio.com/api/v1/drop-tables.json` (after publish)  
**Runtime helper (casting lab):** may mirror formulas in game code — do not invent a second table.

## Hard rules

| Rule | Value |
|------|--------|
| **Max drop tier** | **5** |
| **Banned from all drops** | **T6, T7, T8** |
| **T0 in drops** | **Yes** — materials, potions, foods, thrown (and starter weapons as rare) |
| **Player level** | Caps max tier + soft target tier |
| **Difficulty** | Biases effective level + quantity + rare mul + T0 weight |

T6–T8 remain in **craft / economy / endgame reward** pipelines only — never world loot.

## Why T6–T8 never drop

- Protects economy and craft sinks  
- Legendary (T5) is the loot ceiling  
- Mythic+ (T6+) is intentional progression, not RNG from trash packs  

## Player level → max tier (before difficulty)

| Player level | Max drop tier |
|--------------|---------------|
| 1–9 | 1 |
| 10–19 | 2 |
| 20–29 | 3 |
| 30–39 | 4 |
| 40+ | **5** (still never 6+) |

## Difficulty

| Id | Level bias | Qty | Rare (T3+) | T0 weight |
|----|------------|-----|------------|-----------|
| trivial | −8 | 0.7× | 0.35× | 1.6× |
| easy | −4 | 0.85× | 0.6× | 1.3× |
| normal | 0 | 1× | 1× | 1× |
| hard | +6 | 1.15× | 1.45× | 0.85× |
| elite | +12 | 1.35× | 1.9× | 0.7× |
| boss | +18 | 1.6× | 2.4× | 0.55× |
| raid | +24 | 2× | 3× | 0.4× |

`effectiveLevel = clamp(playerLevel + bias, 1, 70)`  
`maxTier = min(5, table(effectiveLevel))`

## Categories that must keep T0

- **materials** (ore, wood, cloth, …)  
- **potions**  
- **foods**  
- **thrown** (bombs, knives, engineer throwables)  

Boss/raid **guarantee** some T0 mats + potions even when rare gear is T4–T5.

## Roll pipeline (agents / games)

```
1. source (mob_trash | mob_normal | elite | chest_* | boss | raid | harvest_node)
2. difficulty (or source default)
3. playerLevel
4. maxTier = min(5, fromLevel(effectiveLevel))
5. for each roll:
     pick category from source.categoryWeights
     pick tier 0..maxTier via weights (T0 floor for mat/pot/food/thrown)
     reject if tier ∈ {6,7,8}
     resolve item from ObjectStore catalog at that tier+category
6. apply guaranteed rows (boss/raid)
```

## Catalog resolution

| Category | Prefer |
|----------|--------|
| weapons / armor | `master-weapon-prefabs.json` / armor catalogs · `tier <= maxTier` |
| materials | `materials.json` |
| potions / foods | `consumables.json` |
| skills on gear | `master-weaponSkills.json` (not rolled as drops) |

## Related

- Prefabs: `master-weapon-prefabs.json`  
- Skills: `master-weaponSkills.json`  
- Tiers: docs tier table on info…/docs (T1–T8 names; **drops stop at T5**)  

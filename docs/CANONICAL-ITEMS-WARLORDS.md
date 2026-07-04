# Canonical Items — Grudge Warlords Era

Single map of **every item category**, which file is authoritative, and how games should resolve `ITEM-*` / `FOOD-*` / `MATL-*` at runtime.

| Resource | URL |
|----------|-----|
| **Start here** | `/api/v1/games-library.json` |
| **Live browser** | `/GRUDGE_Item_Database.html` (canonical; `ItemBrowser.html` redirects) |
| **Full item map** | `/api/v1/canonical-items-manifest.json` |
| **Catalog aggregate** | `/api/v1/master-items.json` |
| **UUID index** | `/api/v1/master-registry.json` |
| **Coverage audit** | `/api/v1/_audit/catalog-coverage.json` |
| **Equipment pattern** | `/api/v1/_meta/canonical-equipment-pattern.json` |

---

## Rule: one authority per layer

| Layer | Authority | Never use for runtime |
|-------|-----------|------------------------|
| Equipped weapons + tools | `master-weapon-prefabs.json` | `weapons.json`, `master-weapons.json` |
| Armor catalog | `master-armor.json` | `armor.json` (design sets) |
| Food / potions | `master-consumables.json` | scattered `consumables.json` categories alone |
| Materials | `master-materials.json` | `materials.json` |
| Recipes | `master-recipes.json` | inline recipe blobs in HTML |
| Player inventory rows | `api.grudge-studio.com` | ObjectStore JSON |

**`master-items.json`** is the merged catalog (prefab weapons/tools + armor + consumables).  
**`master-registry.json`** indexes UUIDs across materials, relics, enchants, buildings, mounts, etc.

---

## Item categories (Warlords era)

| Category | Count (approx) | Authority | Status |
|----------|----------------|-----------|--------|
| Combat weapons | 822 | `master-weapon-prefabs.json` | **live** |
| Harvest tools | 49 | `master-weapon-prefabs.json` (`TOOL`) | **live** |
| Armor | 1,344 | `master-armor.json` | catalog live · prefabs **planned** |
| Food | 90 | `master-consumables.json` | **live** |
| Potions | 30 | `master-consumables.json` | **live** |
| Materials | 147 | `master-materials.json` | **live** |
| Recipes | 2,183 | `master-recipes.json` | **live** |
| Spell recipes | 30 | `master-spellRecipes.json` | **live** |
| Engineer supplies | 12 | `master-consumables.json` | **live** |
| Relics | 136 | `master-relics.json` | **live** |
| Enchants | 72 | `master-enchants.json` | **live** |
| Infusions | 20 | `master-infusions.json` | **live** |
| Artifacts | 20 | `master-artifacts.json` | **live** |
| Buildings | 15 | `master-buildings.json` | **live** |
| Mounts | 8 | `master-mounts.json` | **live** |
| Harvest nodes | 9 | `master-harvest-nodes.json` | **live** |

Counts refresh when you run `npm run build:canonical-items`.  
**Browser validation:** `npm run validate:catalog` — ensures all **2,765** registry UUIDs appear in catalog data sources (see `api/v1/_audit/catalog-coverage.json`).

---

## Live browser (`GRUDGE_Item_Database.html`)

Loads every row type the registry tracks, plus craft/spell recipes:

- **Equipment:** T0 starters (`t0-weapons.json`), weapons, tools, armor, relics
- **Consumables:** food (90), potions (30), engineer supplies (12) — separate sidebar tabs
- **Crafting:** `master-recipes.json` (2,183) + `master-spellRecipes.json` (30)
- **World:** buildings (15), mounts (8)
- **Mystic:** enchants, infusions, artifacts, materials

Icons: `utils/icon-resolver.js` · registry enrichment: `master-registry.json` · weapon GLBs: `weapon-model-game-urls.json`

---

## UUID prefixes

| Prefix | What |
|--------|------|
| `ITEM-*` | Weapons, armor, T0 starters (runtime prefabs) |
| `FOOD-*` | Chef food buffs |
| `POTN-*` | Alchemist potions |
| `MATL-*` | Crafting / harvest materials |
| `RECP-*` | Recipes |
| `RELC-*` | Relics |
| `ENCH-*` | Enchantments |
| `INFU-*` | Infusions |
| `ARTF-*` | Artifacts |
| `BLDG-*` | Island buildings |
| `MNT-*` | Mounts |
| `SKIL-*` | Weapon abilities |
| `ICON-*` | Icon images on CDN |

---

## Resolution order (SDK / game code)

1. `getWeaponPrefabs()` — if equippable weapon/tool
2. `getMasterItems()` — armor, consumables, catalog mirror of prefabs
3. `getMasterMaterials()` / `getMasterArtifacts()` — stackables & specials
4. `getMasterRegistry()` — UUID lookup fallback

```javascript
const item = await sdk.getItemByIdOrUuid('ITEM-…');
// prefab → master-items → materials → artifacts
```

---

## Pipelines

```bash
# Weapons + tools (skills, stats, recipes, prefabs)
npm run build:weapon-pipeline

# Full item catalog + manifest + audit
npm run build:items-pipeline

# Everything (master DB + items + docs)
npm run generate:all
```

---

## What's next

1. **Armor prefabs** — `master-armor-prefabs.json` (same pattern as weapons)
2. **Consumable prefabs** — optional runtime rows for buff duration / stack rules
3. **Drop tables** — complete `ummorpg-systems-bridge.json` coverage for all tiers
4. **GrudgeBuilder sync** — `syncItemsFromObjectStore()` reads `games-library.json` only

---

## Related

- [CANONICAL-EQUIPMENT.md](./CANONICAL-EQUIPMENT.md) — weapons + tools detail
- [WEAPON-STATS-ATTRIBUTES.md](./WEAPON-STATS-ATTRIBUTES.md) — stats ↔ SKIL-* ↔ ATTR-*
- [API-AND-UUID-GUIDE.md](./API-AND-UUID-GUIDE.md) — UUID families
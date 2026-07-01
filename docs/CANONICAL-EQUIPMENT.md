# Canonical Equipment & Items

Industry-standard layering for Grudge Studio game data. **Weapons and harvest tools are live.** Armor is next.

Machine-readable spec: [`api/v1/_meta/canonical-equipment-pattern.json`](../api/v1/_meta/canonical-equipment-pattern.json)

---

## Architecture (definition vs runtime vs economy)

| Layer | UUID | Authority | Purpose |
|-------|------|-----------|---------|
| **Item definition** | `ITEM-*` | `master-weapon-prefabs.json` | Static catalog: stats, slot, tier, assets |
| **Ability binding** | `SKIL-*` | `master-weaponSkills.json` | Hotbar / gather actions |
| **Icon asset** | `ICON-*` | `icon-registry.json` + R2 CDN | Image files |
| **Recipe** | `RECP-*` | `master-recipes.json` | Craft inputs → result item |
| **Material** | `MAT-*` / material UUID | `master-materials.json` | Stackable harvest outputs |
| **Loot table** | — | `ummorpg-systems-bridge.json` | Drop weight + stack (references `ITEM-*`) |
| **Harvest node** | — | `master-harvest-nodes.json` | Node → tool action → material |
| **Item instance** | runtime | `api.grudge-studio.com` | Durability, enchants, quantity |

**Rule:** JSON defines *what* an item is. R2 holds *binary* assets. D1 mirrors prefabs for Worker search. The game API holds *player-owned instances*.

---

## Live URLs (fetch in this order)

1. **Static JSON (canonical):** `https://molochdagod.github.io/ObjectStore/api/v1/`
2. **Worker mirror:** `https://objectstore.grudge-studio.com/api/v1/`
3. **Binary CDN:** `https://assets.grudge-studio.com/`
4. **D1:** `objectstore-meta` → `weapon_prefabs` table (seeded from prefab pipeline)

---

## Weapons (822 combat + 49 tools = 871 prefabs)

### Runtime bundle

```
GET /api/v1/master-weapon-prefabs.json
```

Each prefab includes: `uuid`, `weaponType`, `tier`, `stats`, `assets`, `skills`, `loadout`, `ummorpg`, `enchant`.

### T0 combat starters (14 types)

| Slot | Behavior |
|------|----------|
| 1 | Auto-assigned starter attack |
| 2 | Auto-assigned starter style |
| 3 | **Player choice** (2–3 options) |

Pattern: `three-slot-starter` · Meta: `_meta/t0-starter-slot-pattern.json`

### T1+ combat weapons

| Slot | Role |
|------|------|
| 1 | Standard attack (type-wide) |
| 2–3 | Shared style pool |
| 4 | Variant signature |
| 5 | Passives |

Pattern: `five-slot` · Off-hand SHIELD/TOME: F-toggle injects slots 1–3.

### Harvest tool — Crude Tool (T0)

| Slot | Action | Behavior |
|------|--------|----------|
| 1 | Chop | Auto — wood, fiber |
| 2 | Mine | Auto — ore, stone |
| 3 | Skin **or** Pry | **Player choice** |

Pattern: `gather-starter` · Prefab: `weaponType: "TOOL"`, `id: "t0-tool"`

T1+ tools use `gather` binding — profession nodes from `master-harvest-nodes.json`, not combat `SKIL-*`.

---

## Games library (start here)

```
GET /api/v1/games-library.json
```

Single index for runtime URLs, counts, load order, and SDK method names.

## Quick integration

```javascript
const BASE = 'https://molochdagod.github.io/ObjectStore/api/v1';

const library = await fetch(`${BASE}/games-library.json`).then((r) => r.json());
const { prefabs } = await fetch(library.runtime.weaponPrefabs).then((r) => r.json());

const combatWeapons = prefabs.filter((p) => p.weaponType !== 'TOOL');
const harvestTools  = prefabs.filter((p) => p.weaponType === 'TOOL');
const crudeTool     = prefabs.find((p) => p.id === 't0-tool');

// T0 gather skills are on the prefab after build:weapon-pipeline
const chop = crudeTool.skills.slots.find((s) => s.type === 'primary');
```

---

## Build pipeline

```bash
npm run build:weapon-pipeline
# enrich:t0-starter-skills → enrich:variant-signatures → build:weapon-prefabs → validate
```

Outputs:
- `api/v1/master-weapon-prefabs.json`
- `api/v1/ummorpg-systems-bridge.json`
- `workers/seed/weapon-prefabs.sql` (D1 upsert)

---

## Deprecated — do not use for new integrations

| Source | Use instead |
|--------|-------------|
| `items-database.json` | `master-items.json` or `master-weapon-prefabs.json` |
| `master-t0-items.json` | `t0-weapons.json` + prefabs |
| `weapons.json` alone | Design templates; runtime = prefabs |
| `grudge-game-data-hub` | Archived |
| `objectstore.grudge-studio.com` for GLB/icons | `assets.grudge-studio.com` |
| Full `github.io` URLs in `iconUrl` fields | `/icons/...` paths → CDN resolver |

---

## Next: armor

Same pattern as weapons:
- `master-armor-prefabs.json` (planned)
- Equip slots: Head, Chest, Legs, Feet, Hands, Shoulders
- Stats: armor, resistances, set bonuses
- Same `RECP-*` / drop / enchant bridges

---

## Stats, attributes & skills

Weapon **base stats**, **SKIL-*** abilities, and **8 attributes** are wired on every prefab via `statConnections`.

| File | Role |
|------|------|
| `weapon-stat-bridge.json` | Connection graph + attribute index |
| `_meta/weapon-stats-attributes.json` | Pattern for codegen |
| `master-attributes.json` | ATTR-* + 37 derived stats + combat formulas |

Full guide: [WEAPON-STATS-ATTRIBUTES.md](./WEAPON-STATS-ATTRIBUTES.md)

---

## Related docs

- [Weapon Stats & Attributes](./WEAPON-STATS-ATTRIBUTES.md)
- [API & UUID Guide](./API-AND-UUID-GUIDE.md)
- [AGENTS.md](../AGENTS.md) — repo rules for contributors
- [game-data-manifest.json](../api/v1/game-data-manifest.json) — full dataset index
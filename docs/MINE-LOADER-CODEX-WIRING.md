# Mine-Loader Codex wiring — items, blocks, prefabs, buildables

**Why:** Voxel games on the fleet must share one block id space and one resolve path from ObjectStore catalogs to Mine-Loader play.

| Layer | Authority | Do not |
|-------|-----------|--------|
| Block cells | Mine-Loader `/api/blocks` (250 slugs) + terrain palette | Invent a second hex-only map format |
| Item / weapon prefabs | ObjectStore `master-weapon-prefabs.json` | Equip Warlords class kits on voxel bodies |
| Materials | ObjectStore `master-materials.json` | Dual-write world cells to Builder |
| Island / fortress buildables | ObjectStore `buildable-prefabs.json` (118) | Voxelize multi-cell footprints |
| Stations / buildings | ObjectStore `master-buildings.json` (15) | Point at 404 GLB paths |

Machine file: [`api/v1/voxel-codex-bridge.json`](../api/v1/voxel-codex-bridge.json)  
Meta: [`api/v1/_meta/mine-loader-codex-wiring.json`](../api/v1/_meta/mine-loader-codex-wiring.json)

## Id law

```
terrain cell     stone | grass | woodPlanks | …
codex cell       cat:<slug>          e.g. cat:alloy-frame
item prefab      ITEM-*
material         MATL-* / scrap-ore
building         BLDG-*
buildable        pack/slug           e.g. fortress/armoury
held tool        t0-tool + TOOL_* ids
```

Placeable inventory **must** carry `placeType` equal to a cell id. Weapons never place.

## Connections

```
ObjectStore ITEM-* / TOOL
        │  harvest / combat stats
        ▼
Mine-Loader content/registry  → createInventoryItem(id)
        │  modelMap + asset-catalog
        ▼
Held mesh + harvest family (pick/axe/shovel)

ObjectStore MATL-*
        │  materialToCell
        ▼
placeType (terrain or cat:slug) + drop item

ObjectStore BLDG-* + buildable-prefabs
        │  buildingsToStations / sockets
        ▼
scene.props[]  (1 m grid, 1.8 m character)
        not greedy-mesh cells

Mine-Loader GET /api/blocks
        │  250 RPG defs
        ▼
Open / VoxGrudge / GRUDOX editors + play
```

## Forbidden on voxel prefabs

`WAND` · `GRIMOIRE` · `RANGER_LOG` · `BATTLE_DUAL` — Warlords class kits. See mine-loader `docs/WARLORDS_VOXEL_PREFAB_MIGRATION.md`.

## Live hosts

- Codex: https://mine.grudge-studio.com/api/blocks
- SSOT: https://mine-loader-api-production.up.railway.app/api/ssot
- Bridge: https://objectstore.grudge-studio.com/api/v1/voxel-codex-bridge.json

## Consumer steps

1. Boot: `GET /api/ssot` + `GET /api/blocks`.
2. Load ObjectStore weapon prefabs / materials / buildables.
3. Resolve through `voxel-codex-bridge.json` before grant / place / spawn.
4. Export maps as interchange (`open` + Realms `scene.blockEdits`).

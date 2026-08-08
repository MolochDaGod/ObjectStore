# World drop presentation (unequipped prefabs)

**Catalog:** `api/v1/master-weapon-prefabs.json`  
**Drop rates:** `api/v1/drop-tables.json` (max tier 5; never T6–8)  
**Lab runtime:** CastingAbilitiesThreeJS `WorldDrops` + `prefabAssets.js`

## Prefab presentation layers

| Layer | Field | Use |
|-------|--------|-----|
| **Icon** | `assets.iconUrl` / `iconR2Key` | Bag UI + **hovering ground sprite** |
| **Model (equip/world)** | `modelUrl` / `prodGltfUrl` / `mesh.prodGltfUrl` | Hand equip or **mini world mesh** |
| **Drop prefab** | `assets.dropPrefabR2Key` | Optional dedicated loot GLB (may 404 → fallback icon+model) |
| **Loot VFX** | `assets.worldDropVfxR2Key` | Optional ground FX |

State: **`world` / dropped** — not equipped, not paperdoll.

## In-game ground look

1. **Tier border ring** on terrain/ocean (color by T0–T5)  
2. **Bloom glow disc** (additive / emissive for post bloom)  
3. **Billboard icon sprite** hovering (~0.5–0.6 m bob)  
4. **Optional 3D model** scaled small, slow spin  
5. **Surface Y** — ground pad or water plane  

## Interaction

| Action | Control (lab) |
|--------|----------------|
| Spawn sample drops | **L** / Loot menu |
| Pickup | **E** when in range → bag |
| Open bag | **B** |
| Throw | **Drag** bag item onto canvas → aim point |

## Tier colors (border / glow)

| Tier | Border |
|------|--------|
| T0 | gray |
| T1 | white |
| T2 | green |
| T3 | blue |
| T4 | purple |
| T5 | gold |
| T6–8 | **never in drop rolls** |

## Agent rules

- Resolve presentation via `presentPrefab(catalogEntry)` — do not invent icon paths  
- Prefer `prod/gltf/weapons/{family}.glb` when per-item model 404s  
- Dropped items never write equip slots until explicit equip action  
- After `rollLoot`, resolve `category+tier` → prefab/catalog id → `spawn(present, pos)`  

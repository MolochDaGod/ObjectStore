# Unity → Warlords Asset Migration

**SSOT awareness map:** `api/v1/warlords-unity-migration-map.json`  
**Entity catalog:** `api/v1/warlords-entity-prefabs.json`  
**Script:** `node scripts/inventory-unity-warlords-migration.mjs`

## Sources

| Layer | Path |
|-------|------|
| Entity icons (UI SSOT) | `Desktop/icons/icons/entities` (~118 PNG) |
| Unity game | `Desktop/grudgeproduction/grudgenew/FRESH GRUDGE` |
| Prefabs | `Assets/uMMORPG/Prefabs` (~1322) |
| Race mesh packs | `Assets/Toon_RTS`, `Assets/Character` |
| Warlords CDN | `https://assets.grudge-studio.com` |

## Principles

1. **Icons name the Warlords prefab** (`entities/<slug>`).
2. **Match Unity prefab by alias/name before inventing meshes.**
3. **Player bodies** → prefer **grudge6 CDN race FBX** over legacy Unity Player prefabs.
4. **Buildings** → Structure Crusade / Legion / Fabled + Structures.
5. **Harvest/nature** → stylized CDN packs first; Unity Harvestables = legacy.
6. **Skip** Structure *Preview* / *Invis* and Particles for mesh ship.
7. **Pipeline:** match → extract FBX/anim → GLB bake → R2 + D1 → loaders.

## Unity prefab domains (migration lanes)

| Lane | Count (approx) | Warlords use |
|------|----------------|--------------|
| `unit_merc` | 24 | Race Warrior/Ranger/Mage/Paladin |
| `unit_heavy_merc` | 24 | Guard / Defender |
| `siege` | 9 | Catapult, bolt thrower, heavy |
| `mount` | 68 | Horse, wolf, ram, mecha, drakes |
| `vehicle` | 23 | Ships, land vehicles |
| `player_race` | 24 | Prefer grudge6 web meshes |
| `npc_race` | 121 | Town NPCs |
| `monster_pve` | 137 | Selective PvE migrate |
| `building_crusade/legion/fabled` | 15 each | Faction camp buildings |
| `building_neutral` | 18 | Campfire, foundry, totems, storage |
| `building_preview/invis` | ~47 | Do not ship as mesh |
| `harvest` | 83 | Prefer CDN nature packs |
| `vfx` | 460 | Separate VFX pipeline |
| `environment` | 47 | Trees/props |

## Icon coverage (entity pack)

- **Matched** Unity prefab: majority of entity icons (aliases for archer→Ranger, merc→Guard, etc.)
- **UI-only** (no Unity mesh expected yet): Bed, Lamp, Market, Recycler, Wardrobe, Table, Tower variants, Siege Tower
- **Mesh FBX resolved** when GUID/name hits Models or Toon_RTS
- **Animators/clips** often co-located under `uMMORPG/Models/Entities`

## Ship-first priority

1. unit_merc + unit_heavy_merc  
2. siege + mount + vehicle  
3. building_crusade / legion / fabled + building_neutral  
4. Selective monster_pve / npc_race  
5. Convert extracted FBX → GLB → R2 keys under `models/warlords/entities/...`

## Commands

```bash
cd F:/GitHub/ObjectStore

# 1) Inventory + match icons → Unity prefabs + extract sources
node scripts/inventory-unity-warlords-migration.mjs

# 2) Convert primary FBX → GLB, upload R2, publish catalog
node scripts/deploy-unity-warlords-entities.mjs --all

# 3) Icons only (if re-upload needed)
node scripts/upload-entity-icons-r2.mjs

# 4) Re-publish JSON catalogs to objectstore static-json cache
node scripts/publish-static-json.mjs warlords-entity-prefabs warlords-unity-migration-map warlords-entity-unity-map
```

### Live CDN (after deploy)

| Asset | URL |
|-------|-----|
| Entity catalog | `https://objectstore.grudge-studio.com/api/v1/warlords-entity-prefabs.json` |
| Models | `https://assets.grudge-studio.com/models/warlords/entities/<slug>.glb` |
| Icons | `https://assets.grudge-studio.com/game-assets/icons/pack/entities/<Name>.png` |
| grudge6 units | `https://assets.grudge-studio.com/models/grudge6/races/*_Characters.fbx` |

### Deploy report

`scripts/out/unity-warlords-deploy-report.json`  
`scripts/out/warlords-buildings-resolve-report.json`

### Buildings pass (no Unity license)

Unity batchmode failed on this machine (**Personal license / Access token unavailable** in headless mode).  
Fallback pipeline:

```bash
# GUID mesh cache + resolve + convert + R2
node scripts/resolve-and-deploy-building-meshes.mjs --convert --upload --publish

# Optional when Unity license works interactively:
node scripts/export-and-deploy-warlords-buildings.mjs --list-only
# Open Unity once → Grudge → Export Warlords Entity Prefabs to FBX
# then:
node scripts/export-and-deploy-warlords-buildings.mjs --skip-unity --convert --upload
```

Editor script: `FRESH GRUDGE/Assets/Editor/GrudgeWarlordsEntityExporter.cs`

## Related skills

- `grudge-warlords-assets` — CDN / no invent meshes  
- `grudge-asset-convert` / `gltf-asset-pipeline` — FBX→GLB  
- `grudge-d1-r2` — upload + seed  
- `unity-to-threejs-cloudflare` — full scene extract if needed  
- `grudge6-toon-rts-mounts-siege` — mounts/siege bake notes  

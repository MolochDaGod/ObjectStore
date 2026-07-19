---
layout: default
title: Multi-era asset taxonomy
nav_order: 4
---

# Multi-era asset taxonomy (production)

**Machine SSOT:** [`/api/v1/era-asset-taxonomy.json`](../api/v1/era-asset-taxonomy.json)  
**Recognition:** [`/api/v1/era-recognition.json`](../api/v1/era-recognition.json)  
**Characters:** [`/api/v1/era-characters.json`](../api/v1/era-characters.json)  
**2D / media:** [`/api/v1/asset-media-types.json`](../api/v1/asset-media-types.json)

This organizes **uploads, databases, and game-ready paths** for the full Grudge Studio fleet. It extends ObjectStore + R2 + Railway — it does **not** invent a second asset system.

## Eras

| Era | Tone | Primary CDN roots | Catalogs |
|-----|------|-------------------|----------|
| **warlords** | Fantasy / medieval | `models/grudge6/`, `models/nature/`, `models/environment/sectors/` | warlords-*, home-island-contract, grudge6-* |
| **nexus** | Modern / post-modern | `models/nexus/`, `sprites/nexus/` | era-characters#nexus |
| **armada** | Future / sci-fi / space RTS | `grudge-armada/`, `models/ships/`, `models/armada/` | grudge-armada.json |
| **voxel** | Style (cross-era) | `models/voxel/` | voxelAssets.json |
| **shared** | 2D UI / icons / VFX / audio | `icons/`, `sprites/`, `ui/`, `effects/`, `fonts/` | icon-registry, sprite-*, ui-packs, effects-* |

## Warlords systems (do not mix IDs)

| System | What | Asset path |
|--------|------|------------|
| **Open world 9 sectors** | haven_shore … ember_depths | `models/environment/sectors/{id}/` |
| **Grudge 9 sectors** | **Same IDs** (fleet alias) | `models/environment/grudge-sectors/{id}/` |
| **Home island** | 1024m personal seed | nature + `home-island/` per contract |
| **Home block 3×3** | TL…BR personal cells | **not** sector ids |

See [map-registry.json](../api/v1/map-registry.json).

## Characters by era

| Era | SSOT meshes |
|-----|-------------|
| Warlords | grudge6 races (`WK_`/`BRB_`/`ELF_`/`DWF_`/`ORC_`/`UD_`) |
| Nexus | `models/nexus/characters/` + GCS `?era=nexus` |
| Armada | `grudge-armada/units/` + `models/armada/characters/` + GCS `?era=armada` |

Railway characters store `gameEra`. Render join: race / modelPath → CDN key from era-characters.json.

## 2D production families

- **Effects** — `effects/`, effects-registry  
- **Character sprites** — `sprites/characters/`, sprite-characters  
- **Icons** — `icons/`, ICON-* registry  
- **UI / PSD / fonts** — `ui/`, `fonts/`, ui-packs (ship slices; PSD = source)  
- **2D animations** — sprite sheets + frame JSON  
- **UI production systems** — ui-components + pixel packs  

## Upload pipeline (best practice)

```text
raw → grudge-convert (GLB/WebP)
    → node scripts/recognize-era.mjs --path <file>
    → R2 put under taxonomy prefix (ETag skip)
    → pack manifest + ObjectStore catalog
    → D1 registry batch ≤100
    → publish-static-json for changed catalogs
    → HEAD probe assets.grudge-studio.com
```

### CLI

```powershell
# Classify path
node scripts/recognize-era.mjs --path models/grudge6/races/WK_Characters.glb

# Publish new taxonomy catalogs
node scripts/publish-static-json.mjs era-asset-taxonomy era-recognition era-characters asset-media-types map-registry best-practices

# Pack upload (dev tool)
grudge-dev upload-pack --root "C:\packs\MyPack" --pack-id my-pack --version 1.0.0 --license CC0 --author "Grudge Studio"
```

## Database organization

| Store | Role |
|-------|------|
| ObjectStore JSON | Definitions + this taxonomy |
| R2 metadata | era, category, pack, grudge-uuid, source-hash |
| D1 asset_registry | r2_key UNIQUE, category, tags |
| Railway | characters.gameEra, islands — **not** binaries |

Search tags: `era:warlords`, `era:nexus`, `era:armada`, `style:voxel`, `dim:2d`, `sector:haven_shore`.

## Banned

- New wiring to `api.grudge-studio.com`  
- Meshy / capsule Warlords heroes  
- Mixing home-block slots with open-world sector ids  
- Untagged root dumps  
- Multi-MB geometry inside ObjectStore JSON  
- Shipping ≤50KB stub GLBs  

## Related

- [ASSETS.md](./ASSETS.md) · [BEST-PRACTICES.md](./BEST-PRACTICES.md)  
- Dev tool: https://grudge-warlords.github.io/grudge-dev-tool/  
- Forge: https://forge.grudge-studio.com  

# Grudge Asset Library + glTF Bake Best Practices

**Audience:** fleet games (Warlords / water, GRUDOX / VoxGrudge, Sprite Attack, open, RTS), seeds, and CDN deploy.  
**SSOT convert:** `ObjectStore/tools/grudge-convert` (`npm run convert` from ObjectStore).  
**SSOT host:** `https://assets.grudge-studio.com` + D1 `asset_registry` + ObjectStore JSON catalogs.  
**Hard rule skill:** `grudge-warlords-assets` (no Meshy heroes, no fake-200 HTML as GLB).

---

## 1. What we reviewed

| Source | Finding |
|--------|---------|
| `D:\Games\Models\Models.zip` | Unzips to **one MagicaVoxel multi-model file**: `Models.vox` (~2.9 MB). Not a folder of GLBs. |
| [fuzzymanstudios Voxel Art (itch)](https://fuzzymanstudios.itch.io/voxel-art) | **Scene quality bar** — Medieval Theme Voxels (363 Magica models). Screenshot-pretty open-world scenes from modular shops/graveyards/dungeons/biomes + lighting + post. Seeds: `fuzzyman-scene-kits.seed.json`. |
| `D:\Games\Models\` flat dump | Hundreds of zip/glb/fbx/png mixed (nature, weapons, voxels, Meshy, craftpix, Toon RTS, docks…). Needs **role folders**, not runtime scanning of the whole disk. |
| `voxgrudge` | Mature path: `models/{kenney,voxels/tvs,creatures,buildings}`, `scripts/optimize-glb.mjs` (Meshopt+WebP), `assets/voxels/catalog.json` UUID catalog, `upload-r2.mjs`. |
| Fleet convert | `grudge-convert`: fbx2gltf / glb2glb, height bake, WebP, colliders, manifest. |
| Warlords CDN | Stylized nature multipacks + grudge6 FBX races; isolate `meshName`; magic-byte verify. |

---

## 2. Target disk layout (authoring → bake → CDN)

Organize **source** under `D:\Games\Models\library\` (or keep zip sources and only promote baked packs):

```text
D:\Games\Models\library\
  raw\                          # never ship to browser
    vox\                        # MagicaVoxel .vox (Models.vox, Medieval Voxel, etc.)
    fbx\                        # grudge6 races, Mixamo, weapon FBX
    glb_source\                 # Sketchfab/raw GLB before bake
    sprite2d\                   # craftpix / pixel sheets (2D games only)
    unitypackage\               # extract offline; do not load in web
  staged\                       # clean intermediate GLB after DCC (Blender MCP / Magica export)
    characters\
    weapons\
    buildings\
    nature\
    creatures\
    voxels\
    vehicles\
    props\
  production\                   # grudge-convert output only
    characters\*.glb + .collider.json + .manifest.json
    weapons\
    buildings\
    nature\
    creatures\
    voxels\
    vehicles\
    props\
  seeds\                        # JSON seeds for game modes / islands
    game-modes.json
    island-seeds.json
    asset-catalog-seed.json
  inventory\                    # auto-generated inventories (*.inventory.json)
```

**CDN keys (r2Prefix examples):**

```text
models/grudge6/races/{WK,BRB,DWF,ELF,ORC,UD}_*.glb
models/nature/stylized/{biome,rocks,harvest,cliffs}/*
models/weapons/*
models/buildings/*
models/creatures/land/*
models/voxels/tvs/*
models/voxels/fuzzyman/*          # from Models.vox / Voxel Art exports
anims/baked/*
icons/*
```

---

## 3. glTF / mesh / texture / anim bake rules (fleet)

### Characters (skinned)
1. Source FBX/GLB → **do not flatten/join** skins.  
2. `grudge-convert fbx2gltf|glb2glb --height 1.7 --texture-size 1024` (cm-to-m if needed).  
3. Rebind race atlases as WebP when FBX paths break.  
4. Collider: root capsule ~r 0.35 from bake (`*.collider.json`).  
5. Anim packs: stable clip names (`idle`, `walk`, `run`, `attack_*`) for combat runtime.  
6. Register D1 + game `modelManifest` / character fleet audit green before mode ship.

### Weapons / equipment
1. Mesh scale relative to **1.8 m human** (`grudge-world-scale`).  
2. Grip / hand-bone extras in manifest; attach to `R_hand` / containers — not second body meshes.  
3. Bake GLB Meshopt + WebP ≤512–1024; keep high-res source offline.

### Buildings / props (static)
1. `glb2glb` with flatten/join OK; generate AABB collider.  
2. Multipacks: **always** isolate `nodeName` / `meshName` for placement seeds.  
3. LOD optional: simplify 1.0 / 0.5 / 0.15 for large fortresses.

### Nature / harvest
1. Use CDN stylized packs; never whole `example_home_island.glb` as one entity.  
2. Seeds list `packId + meshName + role` (tree/ore/flower).

### Voxels (MagicaVoxel / Blockbench / TVS)
1. Export MagicaVoxel → OBJ/GLB or use Blockbench → GLB.  
2. Bake with `glb2glb` (static) or keep voxel GPU path in VoxGrudge loaders.  
3. Catalog UUID pattern like `voxgrudge/assets/voxels/catalog.json` (`HERO-`, `ENV-`, `EQIP-`, `ANIM-`).  
4. **Models.vox** is a multi-object pack — split per model for production seeds (do not upload one giant unindexed VOX as the only CDN asset).

### Animations
1. Prefer baked clips on character or shared `anims/baked/*`.  
2. Resample keyframes in glTF-Transform; drop unused tracks.  
3. Retarget once in Blender MCP; production always re-run CLI bake.

### Textures
| Format | Use |
|--------|-----|
| **WebP** | Default albedo for web (≤1024 heroes, ≤512 icons) |
| **KTX2/Basis** | Optional GPU path (mobile-heavy modes) |
| **PNG** | Source / lossless UI only |
| **TGA** | Convert away before ship |

Ban: shipping un-textured Meshy bodies; treating HTML CDN 200 as image.

---

## 4. Importers (what games should use)

| Layer | Tool | Notes |
|-------|------|--------|
| Offline bake | `grudge-convert` | Only production writer for fleet GLB |
| Interactive cleanup | Blender MCP | Then CLI bake |
| Runtime Three.js | `GLTFLoader` + Draco/Meshopt decoder | Prefer Meshopt on CDN for decode speed |
| Voxel | MagicaVoxel / Blockbench export → GLB | VoxGrudge `tvs-voxel-assets.js` |
| 2D sprites | Sprite sheets under `/fighter2d` or ObjectStore | Not glTF path |
| Registry | D1 + ObjectStore JSON | Resolve `cdnUrl` only |

**Importers must:** magic-byte check GLB (`glTF`), reject HTML, prefer registry `r2Key`, fallback chain CDN → staged game `public/` → log failure (no capsule forever).

---

## 5. Game modes + seeds

Seeds live in `library/seeds/` and ObjectStore `data/seeds/`:

| Seed file | Purpose |
|-----------|---------|
| `asset-catalog-seed.json` | Role → r2Prefix + bake flags + game tags |
| `game-modes.json` | Mode id → required asset roles + optional packs |
| `island-seeds.json` | Island layouts: terrain seed + placement list |

**Mode tags** (attach to each catalog entry):

- `warlords` — water / island / open world  
- `grudox` / `vox` — voxel RTS / brawl  
- `fighter2d` — sprite attack  
- `rts` — Toon RTS units / buildings  
- `arena` — combat-only GLB + anims  

A mode **deploy** fails CI if any **required** role lacks a production GLB + registry row.

---

## 6. Deployment improvements

1. **Bake gate:** only `library/production/**` uploads to R2.  
2. **Manifest sibling:** every GLB ships `.manifest.json` + optional `.collider.json`.  
3. **wrangler r2 put --remote** with correct content-type.  
4. **D1 seed** from catalog (`seed-d1` / ObjectStore registry scripts).  
5. **Smoke:** load one hero, one building, one nature mesh, one weapon per mode.  
6. **Vercel games:** rewrite `/models/*` optional; prefer absolute `assets.grudge-studio.com` so deploys stay small.  
7. **Do not** commit the entire `D:\Games\Models` dump into git — only seeds + scripts + small inventory JSON.

### Commands (canonical)

```bash
cd F:\GitHub\ObjectStore
npm run convert:doctor
npm run convert -- glb2glb staged/weapons/sword.glb -o production/weapons/sword.glb --texture-size 1024
npm run convert -- inspect production/weapons/sword.glb

# Vox inventory
node scripts/inventory-vox.mjs D:\Games\Models\_models_unzip\Models.vox

# Organize roles (dry-run)
node scripts/organize-models-library.mjs --dry-run

# VoxGrudge-style optimize (Meshopt+WebP)
cd F:\GitHub\voxgrudge
npm run optimize:glb -- models/creatures --out dist/models
```

---

## 7. Gaps / next work (priority)

1. **Split `Models.vox`** into per-object GLB + catalog entries under `models/voxels/fuzzyman/`.  
2. **Role-classify** high-value packs already on disk (KayKit weapons, docks, Toon RTS, stylized nature) into `library/staged`.  
3. **Ban list enforce:** Meshy biped zips stay in `raw/` quarantine; never seed to D1 player defaults.  
4. **Unify** voxgrudge `catalog.json` UUID scheme with D1 `asset_registry`.  
5. **Game-mode CI** checklist on Grudox + water deploys.  
6. **Texture audit** for multipacks that ship solid colors only — bake albedo before mode ship.

---

## 8. Related paths

| Path | Role |
|------|------|
| `ObjectStore/tools/grudge-convert/` | Production baker |
| `ObjectStore/docs/ASSET_LIBRARY_AND_GLTF_BAKE.md` | This doc |
| `ObjectStore/data/seeds/asset-catalog-seed.json` | Fleet seed |
| `ObjectStore/scripts/inventory-vox.mjs` | VOX inventory |
| `ObjectStore/scripts/organize-models-library.mjs` | Role folder helper |
| `voxgrudge/assets/voxels/catalog.json` | Live voxel catalog pattern |
| `voxgrudge/scripts/optimize-glb.mjs` | Meshopt+WebP batch |
| Skills: `grudge-asset-convert`, `gltf-asset-pipeline`, `grudge-warlords-assets`, `grudge-world-scale` | |

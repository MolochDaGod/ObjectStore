# Grudge Studio — Asset Documentation

Binary art, CDN layout, conversion pipeline, and how definitions link to files.

**CDN:** `https://assets.grudge-studio.com`  
**Definitions:** `https://objectstore.grudge-studio.com/api/v1`  
**Related:** [USAGE.md](./USAGE.md) · [BEST-PRACTICES.md](./BEST-PRACTICES.md) · GrudgeBuilder [docs/ASSETS.md](../../GrudgeBuilder/docs/ASSETS.md)

---

## 1. Layers (do not mix)

| Layer | Host | Contents |
|-------|------|----------|
| **R2 `grudge-assets`** | `assets.grudge-studio.com` | GLB, FBX, PNG/WebP, audio, video, fleet JS |
| **ObjectStore JSON** | `objectstore` / `info` `/api/v1` | Weapons, recipes, races, grudge6 meta, icon registry |
| **D1 `grudge-assets-db`** | Cloudflare | `meshes`, `gear_presets`, asset registry rows |
| **Railway Postgres** | game API | Characters, islands, inventory — **not** mesh binaries |

Vercel game shells must **not** ship multi‑MB model trees; rewrite `/models/*` → CDN.

### Multi-era organization (production)

| Era | Tone | Primary paths |
|-----|------|----------------|
| **warlords** | Fantasy / medieval | `models/grudge6/`, nature, `environment/sectors/{id}/`, home island |
| **nexus** | Modern / post-modern | `models/nexus/`, `sprites/nexus/` |
| **armada** | Future / sci-fi | `grudge-armada/`, `models/ships/`, `models/armada/` |
| **voxel** | Style (any era) | `models/voxel/` + `voxelAssets.json` |
| **shared 2D** | Icons, sprites, UI, fonts, VFX | `icons/`, `sprites/`, `ui/`, `effects/`, `fonts/` |

**SSOT catalogs:** [`era-asset-taxonomy.json`](../api/v1/era-asset-taxonomy.json) · [`era-recognition.json`](../api/v1/era-recognition.json) · [`era-characters.json`](../api/v1/era-characters.json) · [`asset-media-types.json`](../api/v1/asset-media-types.json) · [ERA-ASSET-TAXONOMY.md](./ERA-ASSET-TAXONOMY.md)

```powershell
node scripts/recognize-era.mjs --path models/grudge6/races/WK_Characters.glb
```

---

## 2. CDN path map (canonical)

```
https://assets.grudge-studio.com/
├── js/
│   ├── grudge-fleet.js          # SSO + progress helpers
│   ├── grudge-id-client.js      # Auth + characters thin client
│   └── grudge6-kit.js           # Modular race load + equip
├── models/
│   ├── grudge6/races/
│   │   ├── WK_Characters.fbx    # SSOT visual (FBXLoader)
│   │   ├── WK_Characters.glb    # Deploy kit for GLTFLoader
│   │   └── library/{race}/*.glb # Per-piece modular meshes
│   ├── characters/              # Named heroes / legacy (prefer grudge6 for races)
│   ├── animations/              # Weapon-type anim packs
│   ├── nature/realistic/        # Home-island nature
│   └── towns/ …
├── assets/{race-folder}/textures/*.webp   # Race atlases
├── game-assets/icons/ …         # ICON-* binaries
├── icons/ …                     # UI / tomes / legacy paths
├── sprites/ …
├── audio/ …
└── fonts/kaph/ …
```

### grudge6 races

| raceId | Prefix | FBX / GLB stem | Atlas folder |
|--------|--------|----------------|--------------|
| human | `WK_` | `WK_Characters` | `western-kingdoms` |
| barbarian | `BRB_` | `BRB_Characters` | `barbarians` |
| elf | `ELF_` | `ELF_Characters` | `elves` |
| dwarf | `DWF_` | `DWF_Characters` | `dwarves` |
| orc | `ORC_` | `ORC_Characters` | `orcs` |
| undead | `UD_` | `UD_Characters` | `undead` |

**Blocked / rewrite:** `models/characters/grudge6/*.glb` stubs → race kit via `resolveCanonicalAssetUrl` / `resolveCanonicalRaceModelPath`.

**D1 meshes:** `glb_url` =  
`https://assets.grudge-studio.com/models/grudge6/races/library/{race}/{meshId}.glb`  
(Updated via `npm run d1:meshes-library-urls:apply`.)

Machine map: [`/api/v1/grudge6-canonical.json`](../api/v1/grudge6-canonical.json).

---

## 3. Format policy

| Format | Role |
|--------|------|
| **FBX** | Visual SSOT for grudge6 race kits (Three `FBXLoader`). Confirmed atlas UVs. |
| **GLB** | Deploy / shipping target for games using `GLTFLoader`. Not SSOT until visual match vs FBX. |
| **WebP/PNG** | Atlases, icons, sprites. Icons: prefer registry `ICON-*`. |
| **JSON** | Definitions only — never embed multi‑MB geometry in ObjectStore. |

Stub kill: files ≤ ~50 KB placeholder GLBs must be overwritten (`npm run kill:grudge6-stubs:upload`, `kill:toon-equip-stubs:upload`).

Validate: `npm run validate:grudge6` · `validate:grudge6:strict`.

---

## 4. Conversion pipeline

### grudge6 race library (preferred)

```bash
# Blender → shared armature + per-mesh library + kit GLB
node scripts/convert-grudge6-race-library.mjs
node scripts/convert-grudge6-race-library.mjs --upload
node scripts/convert-grudge6-race-library.mjs --race human --upload
```

Pipeline notes:

1. Import FBX in Blender (preserve hierarchy; no auto bone reorient).  
2. One Bip001 armature; one mesh node per equipment piece.  
3. Single PBR material, baseColor = race atlas.  
4. glTF-Blender-IO export (glTF UV origin).  
5. glTF-Transform: light prune only — **no join/flatten** that destroys equip pieces.  
6. Upload kit + `library/{race}/*.glb` to R2.  
7. Point D1 `meshes.glb_url` at library files.  
8. Browse: rebind atlas; Blender GLB may need **invert UV V** once vs FBX.

Also: `tools/grudge-convert/README.md`, skill `gltf-asset-pipeline` / `grudge-asset-convert`.

### General glTF hygiene

- Prefer **one** shared skeleton for modular characters.  
- Draco only when all target loaders have DRACOLoader wired.  
- Set `Cache-Control: public, max-age=2592000` (or immutable for hashed keys).  
- Content-Type: `model/gltf-binary`, `model/fbx`, `image/webp`, `application/javascript`.

---

## 5. Materials & textures (Three.js)

| Setting | Race atlas / grudge6 | Typical PBR props |
|---------|----------------------|-------------------|
| Material | `MeshStandardMaterial` | metalness ~0, roughness ~0.75 |
| Color map | `map` = atlas | `colorSpace = SRGBColorSpace` |
| flipY | **false** for this atlas path after correct bind | Default true can scramble UV |
| Wrap | `ClampToEdgeWrapping` | Avoid atlas bleed |
| Side | `DoubleSide` when thin cloth/shield needs it | — |

Never leave 1×1 stub baseColor maps from failed FBX→GLB texture embeds — rebind atlas explicitly (`bindRaceAtlas` in grudge6-kit).

---

## 6. Equipment model (mesh-level)

```
Race KIT (one file)
  └── children: WK_Units_Body_A, WK_Units_Body_B, … weapons, shields
        hide all → show mesh_ids from D1 gear_presets / panel
```

| Concept | Implementation |
|---------|----------------|
| Slot map | body, arms, legs, head, shoulders, weapons, shield, bag, wood, quiver |
| Hand bones | `R_hand_container`, `L_hand_container`, `L_shield_container` |
| Skeleton | **Bip001** (not mixamorig for these kits) |
| Panel | `panelEquipmentToModel3d` / GRUDA item → variant letter |
| Prefab | `gear_presets.mesh_ids[]` + `applyMeshIds` |

Docs: skill `grudge6-modular-characters` · browse `GRUDGE6_Characters.html`.

---

## 7. Icons (ICON-*)

- Deterministic UUID: `sha1("grudge-asset:" + r2Key)` → `ICON-XXXX-XXXX-XXXX`  
- Registry: `/api/v1/icon-registry.json`  
- Browser: [ICON_BROWSER.html](https://info.grudge-studio.com/ICON_BROWSER.html)  
- Detail: [ICON-ASSET-LIBRARY.md](./ICON-ASSET-LIBRARY.md) · [assets-api.json](../api/v1/assets-api.json)

---

## 8. Nature / terrain / build assets

| System | CDN / JSON |
|--------|------------|
| Organized nature (no megakit) | `models/nature/realistic/` · `organized-nature-manifest.json` |
| Home island contract | `home-island-contract.json` (1024 m world, ~2 m character) |
| Biomes | `biome-ecosystems.json` |
| Kenney prototype build | skill `kenney-build` · snap 1 m grid |
| Roads | skill `kenney-roads` |
| Map families | `map-registry.json` (warlords era ≠ home 3×3) |

Terrain best practices: [BEST-PRACTICES.md § Terrain](./BEST-PRACTICES.md#terrain--world).

---

## 9. Upload & verify

```bash
# ObjectStore
npx wrangler r2 object put grudge-assets/<key> --file=<local> --remote --content-type=...
npm run validate:grudge6:strict
npm run d1:meshes-library-urls:apply   # after library upload

# GrudgeBuilder
node scripts/verify-fleet-assets.mjs
```

Worker: `grudge-asset-cdn` enforces MIME + cache headers.

---

## 10. Client resolution (Warlords)

```ts
import { RACE_GRUDGE6, resolveRaceCdnUrl, resolveCanonicalRaceModelPath } from '@shared/fleet';
import { resolveModelUrl } from '@/lib/modelManifest';
import { loadCharacterModel } from '@/lib/modelLoader';
import { setupGrudge6Equipment, applyMeshIdsToEquipment } from '@/lib/grudge6Equipment';

const path = resolveCanonicalRaceModelPath(RACE_GRUDGE6.human.cdnPath);
const loaded = await loadCharacterModel(path);
setupGrudge6Equipment('WK_', loaded.scene, model3d);
```

Legacy `/models/characters/races/{race}.glb` rewrites to grudge6 kits in `resolveModelUrl`.

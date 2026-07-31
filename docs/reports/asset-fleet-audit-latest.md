# Asset Fleet Audit

Generated: **2026-07-31T19:33:16.392Z**

## Summary

| Metric | Count |
|--------|------:|
| Total scanned | 345 |
| Green (game-ready) | 295 |
| Yellow (salvage) | 15 |
| Red (not stack-usable) | 35 |
| Convert queue | 40 |
| Purge candidates (dry-run) | 0 |

### By era

| Era | Count | Meaning |
|-----|------:|---------|
| unknown | 148 | Unclassified path |
| vfx | 69 | VFX meshes / sheets / shaders |
| legacy | 61 | Legacy Unity / unconverted / staging |
| audio | 50 | SFX / BGM |
| grudge6 | 9 | Grudge6 / Toon RTS modular races |
| ui | 8 | Icons, sprites, HUD, backgrounds |

## Studio SSOT (accounts / deploy / assets)

| Concern | Authority |
|---------|-----------|
| Login | `id.grudge-studio.com` |
| Characters + account bag | Railway Postgres |
| Asset index | D1 (not player SSOT) |
| Binaries | R2 → `assets.grudge-studio.com` |
| Definitions | ObjectStore `/api/v1` |
| Mesh bake | `grudge-convert` CLI |

See: `docs/STUDIO_DEPLOY_ACCOUNTS_SSOT.md` · `docs/ASSET_FLEET_AUDIT.md`

## Red samples (fix or convert or quarantine)

| Score | Era | Path | Issues |
|------:|-----|------|--------|
| 15 | legacy | `models/KayKit_MedievalBuilder/objects/dae/archeryrange.dae` | not-in-registry, raw-mesh-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/objects/fbx/bridge_roofed.fbx` | not-in-registry, raw-fbx-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/objects/obj/castle.obj` | not-in-registry, raw-mesh-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/objects/obj/mine.mtl` | unknown-format |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/dae/hex_forest_roadD_detail.dae` | not-in-registry, raw-mesh-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/dae/hex_rock.dae` | not-in-registry, raw-mesh-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/dae/hex_rock_waterB.dae` | not-in-registry, raw-mesh-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/dae/hex_sand_roadL.dae` | not-in-registry, raw-mesh-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/fbx/hex_forest_roadF_detail.fbx` | not-in-registry, raw-fbx-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/fbx/hex_rock_roadB.fbx` | not-in-registry, raw-fbx-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/fbx/hex_rock_waterC_detail.fbx` | not-in-registry, raw-fbx-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/fbx/hex_sand_transitionA.fbx` | not-in-registry, raw-fbx-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/obj/hex_forest_roadE.obj` | not-in-registry, raw-mesh-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/obj/hex_forest_roadM_detail.mtl` | unknown-format |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/obj/hex_rock_detail.obj` | not-in-registry, raw-mesh-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/obj/hex_rock_roadI.mtl` | unknown-format |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/obj/hex_rock_waterB_detail.obj` | not-in-registry, raw-mesh-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/obj/hex_sand_roadD_detail.mtl` | unknown-format |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/obj/hex_sand_roadL_detail.obj` | not-in-registry, raw-mesh-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/obj/hex_water.mtl` | unknown-format |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/square/dae/square_rock_roadD.dae` | not-in-registry, raw-mesh-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/square/dae/square_sand_waterStraight_noSides.dae` | not-in-registry, raw-mesh-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/square/fbx/square_rock_roadC.fbx` | not-in-registry, raw-fbx-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/square/fbx/square_sand_waterStraight.fbx` | not-in-registry, raw-fbx-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/square/obj/square_forest_roadE_detail.obj` | not-in-registry, raw-mesh-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/square/obj/square_rock_roadC_detail.mtl` | unknown-format |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/square/obj/square_sand_roadA.obj` | not-in-registry, raw-mesh-needs-convert |
| 15 | legacy | `models/KayKit_MedievalBuilder/tiles/square/obj/square_sand_waterStraight_empty.mtl` | unknown-format |
| 15 | legacy | `models/animations/melee-axe/standing melee combo attack ver. 1.fbx` | not-in-registry, raw-fbx-needs-convert |
| 15 | legacy | `models/spaceship-blocks/Spacestation_Propulsion_Thruster_Triple_Large.obj` | not-in-registry, raw-mesh-needs-convert |
| 15 | legacy | `models/spaceship-blocks/Spacestation_Structure_Fuselage_Cube_Mid.mtl` | unknown-format |
| 15 | legacy | `models/spaceship-blocks/Spacestation_Structure_Fuselage_Narrow_Center_Angled.obj` | not-in-registry, raw-mesh-needs-convert |
| 15 | legacy | `models/spaceship-blocks/Spacestation_Structure_Ribbed_Straight.mtl` | unknown-format |
| 15 | legacy | `models/spaceship-blocks/Spacestation_Structure_Wing_Thick_Small_Straight.obj` | not-in-registry, raw-mesh-needs-convert |
| 15 | legacy | `models/spaceship-blocks/Spacestation_Weapon_Torpedo.mtl` | unknown-format |

## Yellow samples (convert queue)

| Score | Era | Path | Issues |
|------:|-----|------|--------|
| 40 | legacy | `models/characters/kaykit/Knight.glb` | not-in-registry, missing-convert-manifest, missing-collider-json |
| 40 | grudge6 | `models/weapons/gun/ELF_boltthrower_02_move.FBX.glb` | not-in-registry, missing-convert-manifest, missing-collider-json |
| 45 | legacy | `models/KayKit_MedievalBuilder/objects/gltf/detail_forestB.gltf.glb` | not-in-registry, missing-convert-manifest |
| 45 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/gltf/hex_forest_roadH_detail.gltf.glb` | not-in-registry, missing-convert-manifest |
| 45 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/gltf/hex_rock_roadD.gltf.glb` | not-in-registry, missing-convert-manifest |
| 45 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/gltf/hex_rock_waterD_empty.gltf.glb` | not-in-registry, missing-convert-manifest |
| 45 | legacy | `models/KayKit_MedievalBuilder/tiles/hex/gltf/hex_sand_waterA_empty.gltf.glb` | not-in-registry, missing-convert-manifest |
| 45 | legacy | `models/KayKit_MedievalBuilder/tiles/square/gltf/square_rock_roadB.gltf.glb` | not-in-registry, missing-convert-manifest |
| 45 | legacy | `models/KayKit_MedievalBuilder/tiles/square/gltf/square_sand_waterOuterCorner_empty.gltf.glb` | not-in-registry, missing-convert-manifest |
| 45 | legacy | `models/weapons/bow/_arrow_b_5.glb` | not-in-registry, missing-convert-manifest |
| 45 | legacy | `models/weapons/bow/_bow_13.glb` | not-in-registry, missing-convert-manifest |
| 45 | legacy | `models/weapons/bow/bow_16.glb` | not-in-registry, missing-convert-manifest |
| 45 | legacy | `models/weapons/bow/bow_9_rig.glb` | not-in-registry, missing-convert-manifest |
| 45 | legacy | `models/weapons/crossbow/crossbow_16.glb` | not-in-registry, missing-convert-manifest |
| 45 | legacy | `models/weapons/scythe/Scyth.glb` | not-in-registry, missing-convert-manifest |

## Convert queue (first 30)

```
npm run convert -- glb2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- fbx2gltf <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- glb2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- obj2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- glb2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- glb2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- glb2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- glb2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- fbx2gltf <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- fbx2gltf <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- fbx2gltf <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- fbx2gltf <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- glb2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- glb2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- glb2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- glb2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- obj2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- obj2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- obj2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- obj2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- glb2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- glb2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- fbx2gltf <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- fbx2gltf <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- glb2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- glb2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- obj2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- obj2glb <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- fbx2gltf <in> -o dist/prod/<name>.glb --texture-size 1024
npm run convert -- glb2glb <in> -o dist/prod/<name>.glb --height 1.8 --texture-size 1024
```

## Purge policy

- **Never** auto-delete allowlisted paths (grudge6, tvs, gamedata, icons, audio).
- Red + not stack-usable + not allowlisted → quarantine candidates only.
- Run with `--purge-dry-run` to write candidates JSON; human approve before any R2/D1 delete.

## Next commands

```bash
npm run audit:assets
npm run audit:assets:cdn
npm run audit:assets:purge-dry
# then convert queue via ObjectStore grudge-convert
npm run convert:doctor   # if tools/grudge-convert installed
```

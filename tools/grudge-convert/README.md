# `@grudge-studio/asset-convert`

**Production asset converter** for Grudge Studio. Turns DCC exports into game-ready GLBs (and FBX when needed) with consistent scale, textures, animation cleanup, mesh baking, and collider metadata.

This is the **authoritative CLI** for anything that lands on `assets.grudge-studio.com` or is used as a production pack by battle / browse / forge.

## Named pipelines

| Command | Input → Output | Backend |
|---------|----------------|---------|
| `fbx2gltf` / `fbx2glb` | FBX → GLB | FBX2glTF → glTF-Transform |
| `glb2glb` | GLB → GLB | glTF-Transform re-bake |
| `glb2gltf` | GLB → glTF | glTF-Transform |
| `gltf2glb` | glTF → GLB | glTF-Transform |
| `obj2glb` | OBJ → GLB | Blender → optimize |
| `obj2fbx` | OBJ → FBX | Blender |
| `glb2fbx` | GLB → FBX | Blender |
| `blend2glb` | .blend → GLB | Blender → optimize |

Also accepts plain auto mode: `grudge-convert input.ext -o output.ext`.

## Pipeline

```
FBX / OBJ / BLEND / DAE / STL / PLY / GLB / GLTF
        │
        ├─ FBX  → FBX2glTF (--anim-framerate bake30, PBR)  [preferred]
        │         └─ Blender headless fallback
        ├─ OBJ/BLEND/… → Blender headless → GLB  (or FBX via obj2fbx)
        └─ GLB/GLTF → passthrough
        │
        ▼
 glTF-Transform production pass
   • bake scale (cm→m, --height, --scale) into mesh positions + anim translations
   • Y-hip ground (bbox.min.y → 0)
   • rebind baseColor atlas (--texture)
   • mesh bake: flatten + join (static) · weld · dedup
   • resample anims · prune
   • optional simplify (LOD via meshoptimizer)
   • texture resize + WebP
   • quantize
   • collider extras + .collider.json companion
        │
        ▼
  name.glb | name.gltf | name.fbx
  name.collider.json
  name.manifest.json
```

## Install

```bash
cd tools/grudge-convert
npm install
```

Optional backends:

| Tool | Role | Env / install |
|------|------|----------------|
| **FBX2glTF** | Best FBX→GLB for Mixamo / grudge6 Bip001 | `FBX2GLTF_PATH` or optionalDep `fbx2gltf` |
| **Blender 3.6+** | OBJ/BLEND + FBX fallback + obj2fbx | `BLENDER_PATH` |
| **sharp** | Texture encode | bundled |
| **@gltf-transform** | Mesh/texture/anim bake | bundled |

```bash
node bin/grudge-convert.mjs doctor
# or from ObjectStore root:
npm run convert:doctor
```

## CLI

```bash
# Named: hero race FBX → 1.7 m production GLB + atlas + colliders
node bin/grudge-convert.mjs fbx2gltf path/to/WK_Characters.fbx \
  -o dist/production/WK_Characters.glb \
  --height 1.7 \
  --cm-to-m \
  --texture path/to/WK_Standard_Units.webp \
  --texture-size 1024

# Named: re-bake existing GLB (mesh, webp, colliders)
node bin/grudge-convert.mjs glb2glb tower_3_full.glb -o dist/tower_3_full.glb --texture-size 1024

# Named: container flip
node bin/grudge-convert.mjs glb2gltf model.glb -o model.gltf

# Named: OBJ → FBX (requires Blender)
node bin/grudge-convert.mjs obj2fbx prop.obj -o prop.fbx

# Auto mode (extension-driven)
node bin/grudge-convert.mjs human.glb -o dist/human.prod.glb --height 1.7

# Batch a folder
node bin/grudge-convert.mjs batch ./raw -o ./dist/production --height 1.7 --cm-to-m

# Inspect
node bin/grudge-convert.mjs inspect dist/WK_Characters.glb
```

### Flags

| Flag | Default | Meaning |
|------|---------|---------|
| `--height <m>` | off | Normalize mesh height (heroes ≈ 1.7) |
| `--scale <n>` | off | Explicit uniform scale baked into positions |
| `--cm-to-m` | false | ×0.01 (typical FBX units) |
| `--no-y-hip` | grounded | Skip feet-on-ground |
| `--texture <file>` | — | Rebind all materials to this atlas |
| `--texture-size` | 1024 | Max edge px |
| `--texture-format` | webp | webp / png / jpeg / none |
| `--simplify 0.5` | off | LOD triangle keep ratio |
| `--no-meshopt` | quantize on | Skip compression |
| `--no-mesh-bake` | mesh bake on | Skip flatten/join (static only when no skins) |
| `--draco` | off | Draco (optional dep) |
| `--no-anims` | bake/resample on | Skip animation pass |
| `--no-colliders` | on | Skip collider bake |
| `--format` | glb | glb \| gltf \| fbx |

## Production conventions (Grudge)

| Asset class | Target height | Collider | Texture |
|-------------|---------------|----------|---------|
| grudge6 heroes | `--height 1.7` | capsule Y on root | race atlas webp |
| map towers / walls | leave author scale or match scene scale | box from AABB | pack atlas |
| weapons | leave relative to hand socket | none / small box | embed |
| deployables | match tile size | box | webp ≤1024 |

**Collider JSON** (companion):

```json
{
  "rootCollider": {
    "type": "capsule",
    "capsule": { "align": "Y", "radius": 0.32, "height": 1.1 }
  },
  "colliders": []
}
```

Game loaders (battle, browse, forge) should prefer:

1. Production `.glb` from this tool  
2. `.collider.json` for physics  
3. Never ship raw FBX to the browser when avoidable  

## Wire into fleet

From ObjectStore root:

```bash
npm run convert -- fbx2gltf raw/WK.fbx -o dist/WK.glb --height 1.7 --cm-to-m
npm run convert:doctor
npm run convert:glb -- input.glb -o dist/out.glb --height 1.7
```

CDN upload after convert:

```bash
wrangler r2 object put grudge-assets/models/grudge6/races/WK_Characters.glb \
  --file=dist/WK_Characters.glb \
  --content-type=model/gltf-binary
```

## Relation to other tools

| Tool | Scope |
|------|--------|
| **This package** | CLI production bake (authoritative for CDN) |
| `grudge-dev-tool` ingestion | Desktop upload gate (FBX2glTF/Blender subset, no full bake) |
| Forge `assetConverter.ts` | In-browser export convenience |
| Battle `grudge6-model-loader` | Runtime load + Y-hip normalize |

Prefer this CLI for anything that lands on production CDNs.

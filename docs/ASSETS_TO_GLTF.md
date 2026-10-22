# Assets → GLTF production system

**Goal:** One convert pipeline + one CDN prefix so browsers never load the wrong type  
(FBX as “GLB”, HTML fake-200, raw Mixamo 65k-unit meshes, mismatched content-types).

## Law

| Rule | Detail |
|------|--------|
| **Runtime loads only `prod/gltf/**/*.glb`** | Verified `glTF` magic + `Content-Type: model/gltf-binary` |
| **Raw FBX/OBJ/BLEND never on play path** | Source stays under `raw/` or local disk |
| **Convert SSOT** | `@grudge-studio/asset-convert` (`ObjectStore/tools/grudge-convert`) |
| **Bucket** | Cloudflare R2 **`grudge-assets`** (existing) |
| **CDN** | `https://assets.grudge-studio.com/<r2Key>` |

Do **not** create a second ad-hoc bucket unless R2 policy requires isolation.  
Use a **dedicated prefix** so type mismatch is impossible by path.

## R2 layout (SSOT)

```
grudge-assets/
  prod/gltf/                          # production web meshes ONLY
    characters/{slug}.glb
    characters/{slug}.manifest.json
    weapons/{slug}.glb
    props/{slug}.glb
    vfx/{slug}.glb
    environments/{slug}.glb
  raw/                                # optional archive (authoring)
    characters/{slug}.fbx
  manifests/
    assets-gltf-index.json            # global index (see schema)
```

| Key pattern | Content-Type | Used by |
|-------------|--------------|---------|
| `prod/gltf/**/*.glb` | `model/gltf-binary` | Games, loaders, CDN |
| `prod/gltf/**/*.manifest.json` | `application/json` | Pipeline / audit |
| `manifests/assets-gltf-index.json` | `application/json` | Fleet catalog |

**Banned for runtime loaders:**

- `*.fbx` on any game `resolveModel` path  
- Keys under `raw/`  
- Same path serving HTML (SPA rewrite must exclude `prod/gltf`)

## Pipeline

```
1. discover   scan source dir (fbx|obj|glb|gltf|blend)
2. convert    grudge-convert → dist/prod/gltf/{class}/{slug}.glb
              + .manifest.json (+ optional .collider.json)
3. verify     magic glTF, size > 1KB, optional inspect skins/anims
4. upload     wrangler r2 put grudge-assets/prod/gltf/... --content-type=
5. index      merge into manifests/assets-gltf-index.json
6. smoke      HEAD CDN URL → 200 + Content-Type + magic-byte
```

### CLI (ObjectStore)

```bash
cd F:\GitHub\ObjectStore

# Doctor
npm run convert:doctor

# One file (character, SI 1.85 m)
npm run convert -- fbx2gltf raw/player.fbx -o dist/prod/gltf/characters/player.raw.glb --cm-to-m
npm run convert -- glb2glb  dist/prod/gltf/characters/player.raw.glb \
  -o dist/prod/gltf/characters/player.glb --height 1.85 --texture-size 1024

# Batch a folder
node scripts/assets-to-gltf-pipeline.mjs \
  --src path/to/sources \
  --out dist/prod/gltf \
  --class characters \
  --height 1.85

# Convert + upload + index (needs wrangler auth)
node scripts/assets-to-gltf-pipeline.mjs \
  --src F:/GitHub/grim-armada-web/public/models/player \
  --class characters \
  --height 1.85 \
  --upload \
  --remote
```

### Environment

| Var | Role |
|-----|------|
| `FBX2GLTF_PATH` / portable FBX2glTF | FBX → raw GLB |
| `BLENDER_PATH` | OBJ/BLEND fallback |
| Wrangler OAuth / R2 token | `wrangler r2 object put … --remote` |

## Index schema (`assets-gltf-index.json`)

```json
{
  "version": 1,
  "updatedAt": "2026-07-29T00:00:00.000Z",
  "bucket": "grudge-assets",
  "cdnBase": "https://assets.grudge-studio.com",
  "prefix": "prod/gltf",
  "assets": [
    {
      "id": "characters/player",
      "class": "characters",
      "slug": "player",
      "r2Key": "prod/gltf/characters/player.glb",
      "cdnUrl": "https://assets.grudge-studio.com/prod/gltf/characters/player.glb",
      "contentType": "model/gltf-binary",
      "sourceExt": ".fbx",
      "sourcePath": "public/models/player/player.fbx",
      "bytes": 212492,
      "sha256": "…",
      "heightM": 1.85,
      "magic": "glTF",
      "pipeline": "fbx2gltf+glb2glb",
      "convertedAt": "…"
    }
  ]
}
```

Games resolve:

```ts
cdnUrl = `https://assets.grudge-studio.com/prod/gltf/${class}/${slug}.glb`
// never: .fbx, never: random /models without prod/gltf
```

## Runtime gate (every loader)

```ts
async function assertGlb(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const ct = r.headers.get('content-type') || '';
  if (ct.includes('text/html')) throw new Error('HTML fake-200');
  const buf = new Uint8Array(await r.arrayBuffer());
  if (!(buf[0]===0x67 && buf[1]===0x6c && buf[2]===0x54 && buf[3]===0x46)) {
    throw new Error('Not glTF binary');
  }
  return buf;
}
```

## Class → convert defaults

| Class | `--height` | Notes |
|-------|------------|--------|
| `characters` | **1.85** | Bake scale into mesh; strip runtime 0.001 hacks |
| `weapons` | off (or max-dim 1.2) | Hand props |
| `props` | off | |
| `vfx` | optional SI | Orbs ~0.45 m max-dim |
| `environments` | off | |

## Relation to existing tools

| Tool | Role |
|------|------|
| `tools/grudge-convert` | Bake |
| `scripts/assets-to-gltf-pipeline.mjs` | Discover → convert → verify → R2 → index |
| `grudge-assets` R2 | Binary store |
| D1 `asset_registry` | Optional index (seed later from index JSON) |
| Game `assetResolver` | Prefer `prod/gltf` CDN first |

## Verify

```bash
cd F:\GitHub\ObjectStore
npm run assets:gltf:verify          # doctor + CDN magic-byte all index assets
# or
node scripts/verify-assets-gltf.mjs --require-player
node scripts/verify-assets-gltf.mjs --cdn-only
```

### Production packages (2026-07)

Built by `node scripts/build-prod-gltf-packages.mjs` (+ `--upload --remote`):

| Package | Contents | Yellow-safe |
|---------|----------|-------------|
| `grudge6-races` | wk/brb/elf/dwf/orc/ud + human alias (atlas rebind) | yes (tex≥1) |
| `armada-core` | player, guns, alien/mutant/spikeball | partial |
| `fantasy-weapons` | sword bow staff dagger axe hammer mace | yes |
| `skeletons` | skeleton, skeleton_archer | yes |
| `armada-props` | barrel bush cabin searchlight security_post watchtower | material color |
| `creatures` | lava_golem | yes |

Catalog URLs:

- `https://assets.grudge-studio.com/manifests/grudge-prod-packages.json`
- `https://assets.grudge-studio.com/manifests/grudge-prod-prefabs.json`
- `https://assets.grudge-studio.com/manifests/assets-gltf-index.json`

```bash
npm run packages:prod           # bake locally
npm run packages:prod:upload    # bake + R2
npm run build:weapon-prefabs && node scripts/wire-prod-gltf-weapon-prefabs.mjs
```

**Gate:** all checks PASS before marking a game “on prod/gltf”.

## Checklist

```
[ ] convert:doctor green
[ ] Source under raw/ or local only
[ ] Output only .glb under dist/prod/gltf/
[ ] Magic-byte verify every file
[ ] R2 put with model/gltf-binary
[ ] Index updated (no misclassified multipacks as characters)
[ ] npm run assets:gltf:verify PASS
[ ] Game loaders use prod/gltf URLs (no .fbx)
```

## Live inventory (2026-07-29)

| id | CDN |
|----|-----|
| characters/player | SI 1.85 m · 353128 B |
| weapons/assault_rifle, ak74u, smg | GLB |
| enemies/alien, mutant, spikeball | height-normalized GLB |

Index: `https://assets.grudge-studio.com/manifests/assets-gltf-index.json`

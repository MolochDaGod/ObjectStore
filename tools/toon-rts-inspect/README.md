# toon-rts-inspect

Dev tooling so agents (and you) can **read** the Unity **Toon_RTS** author pack without guessing.

Shipped in ObjectStore under `tools/toon-rts-inspect/`. Author binary pack still lives on Desktop (not in git).

## Author root (one path)

| Kind | Path |
|------|------|
| **Working root** | `C:\Users\nugye\Desktop\grudgeproduction\Toon_RTS` (junction) |
| Extract | `…\Toon_RTS_extract\Toon_RTS` |
| Zip archive | `…\Toon_RTS.zip` (not browsable as folders) |

Zip path `Toon_RTS.zip\Toon_RTS\…` is virtual — always use the junction/extract.

**Live catalog JSON** (generated from this tool):  
https://info.grudge-studio.com/api/v1/toon-rts-author-inventory.json

**Main panel (mesh equip):**  
https://info.grudge-studio.com/main-panel.html

## What we can read

| Format | How |
|--------|-----|
| **`.meta`** | Text YAML — **mesh/bone names** via `ModelImporter.internalIDToNameTable` |
| **`.mat`** | Text YAML — material name, shader, texture GUIDs |
| **`.controller`** | Text (Unity AnimatorController) |
| **`.tga`** | Binary texture (size always; optional `sharp` for decode) |
| **`.fbx`** | Binary — names from sibling `.meta`; bake via **ObjectStore `grudge-convert`** / Blender |

## Commands

```bash
cd C:\Users\nugye\Desktop\grudgeproduction\tools\toon-rts-inspect
npm install
node bin/cli.mjs doctor
node bin/cli.mjs inventory
node bin/cli.mjs inventory --json ..\..\reports\toon-rts-inventory.json
node bin/cli.mjs meshes Elves
node bin/cli.mjs weapons ELF
node bin/cli.mjs meta "C:\Users\nugye\Desktop\grudgeproduction\Toon_RTS\Elves\models\ELF_Characters_customizable.FBX.meta"
node bin/cli.mjs mat "C:\Users\nugye\Desktop\grudgeproduction\Toon_RTS\Elves\models\Materials\ELF_HighElf_Standard_Units.mat"
```

Production bake (not this tool’s job):

```bash
cd F:\GitHub\ObjectStore
npm run convert:doctor
npm run bake:grudge6
```

## Relation to fleet SSOT

| Layer | SSOT |
|-------|------|
| Author meshes / mats / extras | **This pack** (`Toon_RTS`) |
| Optimized runtime kits | `assets.grudge-studio.com/models/grudge6/races/*_Characters.glb` |
| Equip | `mesh_ids` visibility on kit (UMMORPG-style show/hide) |

Do not invent a second author tree under Documents copies.

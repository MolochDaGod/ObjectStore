# grudge6 Race Scenes — equip mesh resources

**Purpose:** One scene per race with **equipment-based meshing** only.  
Pipeline kills stretch and old body-swap systems.

## Pipeline (locked)

```
loadRaceKit (GLB → FBX fallback)
  → EquipmentManager catalog (Units_* / weapon_* visibility)
  → exclusive loadout (hardenVisibility)
  → fitRootUniformSi 1.8 m (bone structural measure)
  → anim pack idle from anims/baked (weapon → pack)
```

| Do | Do not |
|----|--------|
| Uniform root SI | Non-uniform mesh/bone scale |
| One body + one weapon exclusive | Stack body A–G |
| Bip001 pack clips (rotation-first) | Mixamo-only tracks on grudge6 |
| Resource = paperdoll loadout | Whole-body GLB swap |

## URLs (info.grudge-studio.com / ObjectStore)

| Entry | URL |
|-------|-----|
| Hub | `/grudge6-race-scenes.html` |
| Per race | `/grudge6-race-scenes.html?race=human` (orc, elf, dwarf, undead, barbarian) |
| Shortcuts | `/grudge6-race-human.html` … `/grudge6-race-barbarian.html` |

## Resource kinds

| kind | Meaning |
|------|---------|
| `base` | Default armor A + default weapon |
| `armor_variant` | One armor slot varied (others default) |
| `weapon_variant` | Base armor + exclusive weapon mesh |
| `mesh_piece` | Catalog index of every kit mesh name |
| `full_cartesian` | Optional capped full armor combos (UI button) |

## Export

**Export catalog JSON** → `grudge6-race-{id}-equip-resources.json`  
Includes loadouts, anim pack ids, optional PNG thumbs (after **Bake resource thumbs**).

## Code SSOT

| File | Role |
|------|------|
| `js/grudge6-kit.js` | Load kit, equip, bone SI |
| `js/grudge6-anim-packs.js` | Weapon → pack, baked idle |
| `js/grudge6-equip-resources.js` | Enumerate / apply loadouts |
| `js/grudge6-race-scene.js` | Scene controller |
| `grudge6-race-scenes.html` | UI |

Local anim author source: `D:\Games\Models\_anim_packs\{pack}\*.fbx`  
Runtime: `assets.grudge-studio.com/anims/baked/...`

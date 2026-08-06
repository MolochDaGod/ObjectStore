# Toon RTS modular sets gallery — visual SSOT

**Album:** https://imgur.com/gallery/sets-sFHXx2X (also `https://imgur.com/a/sFHXx2X`)  
**Owner:** molochdadev · title `sets` · 6 PNG boards (1280×720)

Use this album to **review meshes, armour, weapons, heads, mounts** against CDN kits and to drive gap fixes. Do not invent parts not on these boards or in author FBX.

## Board → race map

| # | Imgur id | Race (prefix) | Mount on board |
|---|----------|---------------|----------------|
| 1 | [u4DZksB](https://i.imgur.com/u4DZksB.png) | **Elf** `ELF_` | White / grey horse |
| 2 | [ioxzFVS](https://i.imgur.com/ioxzFVS.png) | **Human** `WK_` | Chestnut horse |
| 3 | [ABVKI8a](https://i.imgur.com/ABVKI8a.png) | **Barbarian** `BRB_` | Brown horse |
| 4 | [RdxDWV8](https://i.imgur.com/RdxDWV8.png) | **Undead** `UD_` | Skeletal horse |
| 5 | [hDGMu2y](https://i.imgur.com/hDGMu2y.png) | **Orc** `ORC_` | Wolf |
| 6 | [gH9DmY1](https://i.imgur.com/gH9DmY1.png) | **Dwarf** `DWF_` | Boar / ram |

Each board shows **exploded modular parts**: bodies, arms/boots, shoulderpads, heads/helms, shields, weapons, bag/wood/quiver, mount.

## What the boards prove (loading rules)

1. **One infantry kit per race** — equip = **mesh visibility**, not body GLB swap.  
2. **Sub-races / team colours** = **atlas swap** on the same meshes (High/Dark/Wood elves, etc.).  
3. **Mounts are separate assets** (cavalry FBX) — not inside `*_Characters.glb`.  
4. **Naming after prefix strip** may be `Units_Body_A` **or** `body_A` (Barbarian). Loaders must accept both.  
5. **SI** — boards are art reference only; runtime still fits ~1.8 m human / race mult.

## CDN infantry kit inventory (HEAD 2026-08-06)

| Race | Mesh count | Body | Arms | Legs | Head | Shoulders | Weapons | Shields | Xtra |
|------|------------|------|------|------|------|-----------|---------|---------|------|
| Human WK | 42 | 5 | 4 | 3 | 9 | 2 | 12 | 4 | bag/wood/quiver |
| Elf ELF | 47 | 6 | 3 | 3 | 16 | 3 | 10 | 3 | yes |
| Barb BRB | 47 | 8 | 3 | 3 | 10 | 3 | 13 | 4 | yes (`body_*` no Units_) |
| Undead UD | 50 | 7 | 5 | 4 | 13 | 3 | 12 | 3 | yes |
| Orc ORC | 48 | 7 | 3 | 4 | 8 | 6 | 13 | 4 | yes |
| Dwarf DWF | 48 | 5 | 3 | 3 | 14 | 3 | 13 | 4 | yes |

Production path: `assets.grudge-studio.com/models/grudge6/races/{PREFIX}_Characters.glb`

## Gap list (board vs live)

| Gap | Board shows | CDN / code | Priority |
|-----|-------------|------------|----------|
| **Mounts all races** | Horse / skeletal horse / wolf / boar | **404** cavalry GLB/FBX under races/ | **P0** bake+upload from author `*_Cavalry_customizable.FBX` |
| **Elf Dark/Wood atlases** | Palette variety in full army Fab shot | Only **High** webp **200**; dark/wood **404** | **P0** TGA→webp from author Materials |
| **Undead lance** | Label `UD_weapon_Lance` on board | Not in `UD_Characters.glb` weapon list | **P1** confirm author FBX / extra_models |
| **Siege** | Bolt thrower / catapult (army plates) | Not on race Characters GLB | **P1** separate siege kits |
| **Atlas team colours** (non-elf) | Multiple fabric dyes on boards | Partial webp (WK colours ok; verify each race) | **P2** |
| **Loader name schemes** | BRB without `Units_` | Fixed: optional `Units_` in kit + Characters lab + client equip | Done |
| **Race scene** | Full part board | Single hero + equip resources | **P2** optional “parts board” mode |

## Correct loading chain (no stretch / no old systems)

```
1. Load races/{PREFIX}_Characters.glb  (prod SSOT)
2. EquipmentManager catalog (Units_Body_A OR body_A after prefix strip)
3. Exclusive equip visibility + hardenVisibility
4. Atlas: textures/grudge6/{folder}/{file}.webp  (force rebind if stub / FBX)
5. fitRootUniformSi bone measure → ~1.8 m
6. Anim packs from anims/baked (weapon → pack)
7. Mount (optional): separate cavalry GLB parented / rider attach — not Characters kit
```

**Do not** use Race FBX as play default (TGA embeds 404). FBX = author only.

## Author disk (input only)

`C:\Users\nugye\Desktop\grudgeproduction\grudgenew\FRESH GRUDGE\Assets\Toon_RTS\`

| Race folder | Infantry | Cavalry | Key atlases |
|-------------|----------|---------|-------------|
| Elves | ELF_Characters_customizable.FBX | ELF_Cavalry_customizable.FBX | High/Dark/Wood TGA under models/Materials |
| WesternKingdoms | WK_… | WK_Cavalry… | WK_Standard_Units… |
| Barbarians | BRB_… | … | … |
| Undead | UD_… | … | … |
| Orcs | ORC_… | wolf mount | … |
| Dwarves | DWF_… | boar | … |

## Review workflow

1. Open album board for race.  
2. Open https://info.grudge-studio.com/grudge6-race-scenes.html?race={id}  
3. Compare equip resource list / mesh names to board.  
4. Check atlas variant buttons (when uploaded).  
5. Mount: HEAD cavalry URL; if 404, queue bake job.  
6. Log gaps in `api/v1/toon-rts-sets-gallery.json` (`cdnGaps`).

## Related

- `docs/GRUDGE6_RACE_SCENES.md`  
- `js/grudge6-kit.js` · `js/grudge6-equip-resources.js`  
- skill `toon-rts-author` · `grudge6-cdn-ssot`

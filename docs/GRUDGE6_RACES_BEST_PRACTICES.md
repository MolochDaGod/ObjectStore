# Warlords / grudge6 races — consolidated best practices

**Machine SSOT:** `api/v1/grudge6-warlords-play-contract.json` → `races` + `bestPractices`  
**Code SSOT:** `js/grudge6-kit.js` → `loadRaceKit` · `RACE_ASSETS` · `SLOT_DEFS` · `TOON_RTS_HEIGHT_M`  
**Coverage code:** `gameopen/.../toonKitCoverage.ts` · skill `grudge6-modular-characters/references/toon-kit-coverage.md`  
**Do not invent a second race table.** Extend the contract JSON + this doc.

## One play path (all six races)

| Step | Rule |
|------|------|
| Mesh | `assets…/asset-packs/toon-rts-characters/glb/characters/{race}.glb` |
| Loader | `loadRaceKit` (or parity that stamps `warlordsPlayContract`) |
| Materials | Keep embeds; **never** `forceAtlas` on good Toon |
| Equip | `mesh_ids` + `SLOT_DEFS` after prefix strip |
| Ground | Bone structural box → feet `min.y` |
| Face | Yaw **0** (Toon already +Z) |
| Anim | **One** mixer; Bip001 packs; strip position tracks |
| Ban | races bake / FBX / metaverse / Meshy / capsule as play body |

Live gate: `GET https://casting.grudge.studio/api/play-kit-health` → `{ ok: true }`.

## Race matrix

| raceId | Prefix | Height m | Atlas folder | Siege provider | Limb rule (play) |
|--------|--------|----------|--------------|----------------|------------------|
| human | `WK_` | 1.83 | western-kingdoms | self (catapult) | `Body_A` onesie; B/C need arms+legs; D/E need arms |
| barbarian | `BRB_` | 1.98 | barbarians | human | Always **Arms**; never extra **Legs** |
| elf | `ELF_` | 1.95 | elves | self (boltthrower) | `Body_F` onesie; A–E need arms+legs |
| dwarf | `DWF_` | 1.52 | dwarves | **elf** | A–D onesie; `Body_E` needs arms |
| orc | `ORC_` | 2.13 | orcs | self (catapult) | A/B/F/G onesie; C/D/E need **Legs** |
| undead | `UD_` | 1.83 | undead | **orc** | Every body onesie — **never** Arms/Legs |

Author-only (lab/compare): `models/grudge6/races/{PREFIX}_Characters.{fbx,glb}` · metaverse GLBs.

## Shared best practices (every race)

1. **Fail closed** on Toon URL — no silent fallback to races/metaverse/FBX.  
2. **Uniform root SI** from bone box; band **1.55–2.15 m** (dwarf short end, orc tall).  
3. **Exclusive equip** — one body, one arms, one legs, one head, one weapon_r, one shield.  
4. **Robe/onesie** — if body covers hands/feet, do **not** also show Arms/Legs (`reconcileKitLoadout`).  
5. **Hands** — use `R_hand_container` / `L_shield_container`; arms mesh includes hands (no Hand_* play slot).  
6. **CCT** — capsule r≈0.35, halfH≈0.55; map open rebinds surface only.  
7. **Weapon packs** — `sword_shield` · `longbow` · `magic` · `polearm` · `pistol` (skills from weapon catalog).  
8. **Player save** — Railway `mesh_ids` / gear; never a second body GLB store.

## Per-race gotchas

| Race | Watch for |
|------|-----------|
| human | Default reference race for SI + catapult |
| barbarian | Author `Haed_*` typo → `head_*` on GLB |
| elf | Owns boltthrower for dwarf |
| dwarf | Do not force 1.8 m — contract height 1.52 |
| orc | Do not force 1.8 m — contract height 2.13; owns catapult for undead |
| undead | No Arms/Legs add; ghoul/necro Unity-only names stay off play CDN |

## Agent checklist

```
[ ] loadRaceKit(raceId) — Toon path HEAD 200
[ ] stamp root.userData.warlordsPlayContract === contract.version
[ ] one mixer; idle + walk + attack from prod/anims
[ ] feet |min.y − ground| < 0.12 after idle sample
[ ] limb reconcile matches race bodyCoverage
[ ] no forceAtlas / no pelvis-as-feet / no Mixamo on Bip001
```

## Surfaces that must obey

Open · Casting lab · Foundry handoff · Warlords client · Gladiators · player-and-grass `/play`  
Registry: `api/v1/grudge6-warlords-play-surfaces.json`

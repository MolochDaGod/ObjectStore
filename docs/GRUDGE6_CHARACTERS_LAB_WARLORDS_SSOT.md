# GRUDGE6_Characters lab — Warlords intentional add process

**Lab:** https://info.grudge-studio.com/GRUDGE6_Characters.html  
**Era:** Warlords · pipeline `grudge6` · modular Toon RTS  

**Goal:** Add animations, skeleton contracts, weapons, and mesh identifiers **without** corrupting production GLBs, atlases, skeleton binds, animation bakes, UUID systems, or CDN deploys.

---

## 1. Layers (never mix)

| Layer | Authority | Production host | Lab may… |
|-------|-----------|-----------------|----------|
| **Race kit binary (GOLDEN)** | R2 Toon RTS pack | `assets…/asset-packs/toon-rts-characters/glb/characters/{raceId}.glb` | **Load only** (Toon RTS GLB ★) |
| **Race kit binary (compare)** | R2 races bake | `assets…/models/grudge6/races/{PREFIX}_Characters.glb` | Load only — never forceAtlas |
| **Atlas** | R2 | `assets…/textures/grudge6/{folder}/*.webp` | Load / optional **rebind** (never overwrite R2 from lab) |
| **Anim bakes** | Bake pipeline | `assets…/anims/baked/{pack}/*.json` (Bip001) | Preview if present; **never invent tracks** |
| **Mesh inventory / defs** | ObjectStore | `info…/api/v1/*` | Propose JSON patches on `main` |
| **Player heroes** | Railway | `api.grudge-studio.com` `char_*` | **Out of scope** for this lab |
| **Author FBX / TGA** | Desktop Toon_RTS | — | Input for **offline bake only** |
| **Tier weapons (external)** | `D:\Games\Models\_glb_weapons` | promote → `assets…/models/grudge6/lab-weapons/*.glb` | Catalog + hand attach preview |
| **Mounts / siege** | Toon_RTS `*_Cavalry_customizable.FBX`, BoltThrower/Catapult | bake → `models/grudge6/races/*.glb` | List + status only until CDN |
| **Sets boards** | Imgur `a/sFHXx2X` | — | Visual mesh/armour/mount review |

**Forbidden in lab runtime:** Desktop paths as production loaders, FBX as play default, whole-body GLB swap, non-uniform stretch, plain `scene.clone` on skinned kits, writing CDN from the browser.

### External weapons vs kit weapons

| Kind | mesh_id style | Attach |
|------|---------------|--------|
| Kit child | `ELF_weapon_sword_A` | Visibility on Characters.glb |
| Lab tier main | `lab_weapon:sword_t3` | `R_hand_container` (hide kit `weapon_r`) |
| Lab tier staff/wand/bow | `lab_weapon:wand_t2` | `L_hand_container` — **same socket as kit staff** |
| Lab tier off-hand dual | `lab_weapon:dagger_t1` | `L_hand_container` — **dagger · mace · hammer only** |

Module: `js/grudge6-lab-weapons.js` — SI fit, MeshToonMaterial, box collider `userData` + `.collider.json` sidecars.

Never bake tier weapons *into* race kit without a deliberate re-bake plan. Staff + off-hand share `L_hand_container` (exclusive).

---

## 2. Identifier systems (do not cross-wire)

| ID family | Example | Scope | Lab role |
|-----------|---------|--------|----------|
| **Mesh name / mesh_id** | `WK_Units_Body_A`, `BRB_body_A`, `ELF_weapon_sword_A` | Child mesh in race kit | **SSOT for equip** — visibility only |
| **Race id** | `human` / `elf` / `barbarian` | Fleet race key | URL + catalog |
| **Prefix** | `WK_` `ELF_` `BRB_` `UD_` `ORC_` `DWF_` | Strip before slot match | EquipmentManager |
| **Anim pack id** | `sword_shield` `longbow` `magic` `rifle` | Clip set | Weapon → pack map |
| **ICON-*** | icon registry | UI icons | Not mesh |
| **char_*** | player hero row | Railway | Not kit binary |
| **HERO-/EQIP-/ITEM-*** | catalog rows | ObjectStore / D1 | Link to mesh_ids / iconUuid |
| **Slot-tier UUID** | crafted instances | loot | Not kit |

**Mesh identifier rule:**  
`mesh_id` = **exact Object3D.name** on the production GLB (after optional race-prefix strip for slot regex).  
Stable forever for a given bake. Re-bake that renames meshes = **new mesh_ids** + migrate presets.

Barbarian exception (author pack): `BRB_body_A` (no `Units_`) — loaders must match both forms.

---

## 3. What the lab is allowed to do

| Action | Allowed? | How |
|--------|----------|-----|
| View Toon / Prod races / Metaverse / author FBX | Yes | Source toggle; default **Toon RTS GLB ★** (never forceAtlas on GLB) |
| Toggle armour / weapons | Yes | Exclusive `EquipmentManager` slots |
| Preview atlas variant (if CDN 200) | Yes | `ATLAS_VARIANTS` + `bindRaceAtlas` |
| Preview baked idle/attack | Yes | `anims/baked` only when URL 200 |
| Export equip resource JSON (local download) | Yes | Catalog of loadouts — **does not write CDN** |
| Overwrite `*_Characters.glb` on R2 | **No** | Offline bake + deliberate upload |
| Change skeleton / bind in browser | **No** | Re-bake author FBX |
| Mixamo tracks as default on Bip001 | **No** | Bip001 packs only |
| Register new mesh without kit bake | **No** | Author → bake → CDN → inventory JSON |

---

## 4. Intentional add pipeline (Warlords)

### A. New armour / weapon **mesh** (part already in kit or new in FBX)

```
1. Author: Desktop Toon_RTS\{Race}\ … FBX + TGA
2. Inventory: toon-rts-inspect → update api/v1/toon-rts-author-inventory.json
3. Bake: ObjectStore bake:grudge6 (or grudge-asset-convert) → races/{PREFIX}_Characters.glb
4. Verify: magic bytes + SkeletonUtils load + equip catalog counts
5. Upload R2: ONLY that race GLB (+ atlas if new)
6. HEAD smoke: assets…/races/{PREFIX}_Characters.glb
7. Update mesh_ids lists / gear_presets if names changed
8. Lab: hard-refresh Prod GLB — confirm exclusive equip
9. Games: no code change if names stable; else update presets
```

**Do not** ship a second parallel GLB for one race’s armour.

### B. New **atlas** (High/Dark/Wood, team colours)

```
1. Author TGA on disk
2. Convert webp ≤1024 (or pack standard size)
3. Upload textures/grudge6/{folder}/{file}.webp
4. Register key in grudge6-kit ATLAS_VARIANTS + grudge6-characters.json
5. Lab: atlas select — forceAtlas only for missing/stub maps
6. Never flipY=true on production rebind without visual gate
```

### C. New **animation** (Warlords combat)

```
1. Author: D:\Games\Models\_anim_packs\{pack}\*.fbx  (or approved pack)
2. Bake: Bip001 rotation-first JSON → anims/baked/{pack}/{clip}.json
3. Upload CDN / open same-origin
4. Map weapon slot → pack in grudge6-anim-packs.js (or combat-runtime SSOT)
5. Lab: optional preview only if clip HEAD 200
6. Games: AnimationDirector pack swap — do not embed Mixamo mannequin
```

**Skeleton contract (frozen for Warlords infantry kits):**

- Primary: **Bip001** (+ spaces/underscores rematch)  
- Hands: `R_hand_container` / `L_hand_container` / `L_shield_container`  
- No second skeleton library on the same body  

### D. Mounts / siege (boards gallery)

```
Separate from Characters GLB:
  models/grudge6/races/{PREFIX}_Cavalry*.glb  or toon-rts cavalry path
Never parent-bake into infantry Characters.glb without a full re-bake plan.
```

---

## 5. GRUDGE6_Characters.html source policy

| Source button | Purpose | Production? |
|---------------|---------|-------------|
| **Prod GLB ★** | Fleet SSOT kit | **Yes — default** |
| Toon RTS GLB | Alternate bake review | Review only if differs |
| Metaverse GLB | Legacy/stub check | Prefer not for ship |
| Race FBX (author) | Author diagnostics | **Never** play default |

Fallback order: prod → toonRts → metaverse → fbx last.

---

## 6. Deploy best practices (binaries)

| Step | Practice |
|------|----------|
| Atomic race update | Replace **one** `{PREFIX}_Characters.glb` per PR when possible |
| Cache | Long-cache CDN; bust by new key or version query only if required |
| Verify | HEAD 200 + `model/gltf-binary` + skinned load smoke |
| Definitions | Commit ObjectStore `api/v1` on `main` (info deploy) |
| Slim info deploy | Do not upload `dist/` `raw/` with Characters lab (file count limits) |
| Player data | Railway only — kit mesh never stored as hero SSOT |

---

## 7. Smoke checklist before “Warlords ready”

```text
[ ] Prod GLB HEAD 200 for all 6 races
[ ] Default atlas HEAD 200
[ ] Lab: exclusive equip — one body, one weapon visible
[ ] SI height ~1.55–2.05 m after bone fit
[ ] mesh_ids match catalog names (incl. BRB body_*)
[ ] Baked pack idle HEAD 200 for sword_shield + longbow at minimum
[ ] gear_presets / inventory JSON updated if names added
[ ] No write to R2 from browser lab
[ ] Open/Warlords still load CDN paths only
```

---

## 8. Related SSOT

| Doc / surface | Role |
|---------------|------|
| `docs/BROWSER_GAMEPLAY_DEPLOY_SSOT.md` | Deploy-wide layers |
| `docs/API-AND-UUID-GUIDE.md` | UUID families |
| `docs/TOON_RTS_SETS_GALLERY_SSOT.md` | Imgur part boards |
| `docs/GRUDGE6_RACE_SCENES.md` | Race equip resource scenes |
| `api/v1/grudge6-characters.json` | Race catalog contract |
| `api/v1/toon-rts-sets-gallery.json` | Board → CDN gaps |
| skill `grudge6-cdn-ssot` | Stone CDN paths |
| skill `grudge6-combat-runtime` | Packs / director |

---

## 9. Agent / human rule (one sentence)

> **Add content offline through bake → R2 → definitions → lab preview; the Characters page only visualizes and validates — it never mutates production skeleton, texture, or bake bytes.**

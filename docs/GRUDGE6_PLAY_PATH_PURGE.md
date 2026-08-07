# grudge6 / Warlords play path — HARDENED contract + purge list

**Right source:** `js/grudge6-kit.js` → `loadRaceKit` · lab: `grudge6-race-scenes.html`  
**Machine JSON:** `api/v1/grudge6-warlords-play-contract.json`  
**Play mesh only:** `asset-packs/toon-rts-characters/glb/characters/{race}.glb`  
**Contract version:** stamped on every play kit as `root.userData.warlordsPlayContract`

## Hardened play API

```js
import { loadRaceKit, assertPlayKitUrl, warlordsPlayContract, safeSkeletonUpdate } from './grudge6-kit.js';

// PLAY (default) — Toon RTS only, fail-closed
const { root, equip, play, contract } = await loadRaceKit(THREE, { GLTFLoader }, 'human');
// root.userData.grudge6Play === true
// root.userData.importPipeline === 'toon-rts-glb'

// Lab compare only — explicit non-play source
await loadRaceKit(THREE, loaders, 'human', { source: 'racesBake', play: false });
```

| Guard | Behavior |
|-------|----------|
| `assertPlayKitUrl` | Throws if URL is not Toon RTS play GLB |
| Default `source` | `toonRts` — never metaverse/races/fbx implicit |
| `forceAtlas` on play | Ignored unless `allowForceAtlas: true` (lab emergency) |
| SI fit | `fitRootUniformSi` + **bone** structural box |
| Face | Yaw **0** for play (`facePlusZ: true` only for +X FBX art) |
| Skeleton | `safeSkeletonUpdate` — no multi-pose |
| Equip | `EquipmentManager` + hardenVisibility |

## Banned on PLAY deploy (remove / hard-fail)

| Wrong system | Failure | Replace with |
|--------------|---------|--------------|
| `skeleton.pose()` on **every** SkinnedMesh after load/clone | Head skins = 1-joint → **head under feet** | Bind pose as loaded; or pose **widest body** skeleton once |
| `unifySkeletons` + multi-pose for play | Shared bone corruption | Leave GLB skins as authored (ObjectStore does not unify for display) |
| SI fit via `Box3.setFromObject(SkinnedMesh)` | Unskinned modular geo → explode / wrong scale | `measureBoneStructuralBBox` + `fitRootUniformSi` |
| `facePlusZ: true` / `rotation.y = π/2` default on Toon play GLB | Sideways hero | Yaw **0** for Toon play (FBX author only may use π/2) |
| Play default: races bake / metaverse / FBX | Wrong kit family | Toon RTS GLB only; fail closed |
| `forceAtlas: true` on good Toon embeds | Green sludge / trash mats | Keep embeds; normalize sRGB |
| Silent fallback ladder Toon→races→metaverse→FBX | Hides broken Toon | Fail closed on Toon URL |
| Anim rematch to `WK_Units_head_*` meshes | Head mesh at feet | Bones only (`isBone`) |
| Whole-body GLB swap for equip | Breaks modular kit | mesh_ids visibility |

## Lab / author only (keep files, not play default)

| Path | Role |
|------|------|
| `models/grudge6/races/*_Characters.glb` | Compare bake |
| `models/grudge6/races/*_Characters.fbx` | Convert source |
| `models/grudge6/metaverse/*` | Audit only |

## Surfaces purged (2026-08-07)

| Repo | Change |
|------|--------|
| CastingAbilitiesThreeJS | `toonKitPlay.js` play path; scaffold **throws** if called |
| grudge-multiverse | No multi-pose; facePlusZ false; kit candidates Toon-only |
| Flare-Boss-Arena | Toon human default URL; bone SI fit; pose widest once |

## Agent rule

If you load a Warlords hero and are not using `loadRaceKit` / ObjectStore parity — **stop**. Do not invent a second deploy helper.

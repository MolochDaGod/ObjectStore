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

## How we know we are not missing surfaces

1. **Registry (SSOT list of places):** `api/v1/grudge6-warlords-play-surfaces.json`  
   Every Warlords-era play / lab / client that shows a grudge6 hero must appear here with `status`: green | yellow | audit | n/a.

2. **Contract (SSOT of how):** `api/v1/grudge6-warlords-play-contract.json` + `loadRaceKit` stamp  
   `root.userData.warlordsPlayContract === "2026-08-07.harden.1"`  
   `grudge6Play === true` · `importPipeline === "toon-rts-glb"`

3. **Audit command (repeatable):**
   ```bash
   cd ObjectStore
   node scripts/audit-warlords-play-surfaces.mjs
   node scripts/audit-warlords-play-surfaces.mjs --local-roots
   ```
   - Live: contract JSON + 6 Toon kits + green surface URLs HEAD  
   - Local: scans repos for Toon/contract markers vs banned patterns  

4. **Per-app smoke (already):** Multiverse `node scripts/smoke-character.mjs`  
   Asserts CDN + contract + (optional) browser `__mvCharacterSource`.

5. **Deploy gate rule:** any new Warlords play host PR must  
   - add or update a row in `grudge6-warlords-play-surfaces.json`  
   - stamp contract on the hero root  
   - pass audit (no new banned pattern without lab-only label)

### Status meaning

| status | Meaning |
|--------|---------|
| **green** | On Toon play path + contract (or pure SSOT) |
| **yellow** | Mostly correct; missing stamp or residual risk |
| **audit** | Known Warlords surface — not yet proven on hardened path |
| **n/a** | Intentionally different body (e.g. Mine-Loader explorer) |

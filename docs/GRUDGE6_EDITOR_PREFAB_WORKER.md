# grudge6 Editor — Prefab + Animation AI Worker

**Live:** https://info.grudge-studio.com/grudge6-editor.html  
**Clean URL:** https://info.grudge-studio.com/grudge6-editor  
**SSOT:** `api/v1/grudge6-editor-ssot.json`  
**Repo:** ObjectStore (this site)

## What this is

One **editor AI worker** that improves **prefab ↔ animation** connections for Warlords / grudge6 skills — without inventing a parallel pipeline.

| Layer | Path |
|-------|------|
| Rules (pure) | `js/grudge6-prefab-anim-rules.js` |
| Browser worker | `js/grudge6-prefab-anim-worker.js` |
| Editor host | `js/grudge6-editor.js` + `grudge6-editor.html` |
| Batch fill | `scripts/wire-skill-prefab-anims.mjs` |
| Anim resolve | `js/grudge6-anim-packs.js` (`clipUrlsFor`) |
| Skill catalog | `api/v1/master-weaponSkills.json` |

## Prefab contract

```json
"prefab": {
  "modelRef": "prod/gltf/weapons/sword.glb",
  "vfxRef": null,
  "impactRef": null,
  "animationClip": "sword_shield/attack",
  "soundRef": null,
  "cameraShake": null,
  "projectileRef": null
}
```

- **`animationClip`** = `{pack}/{role}` → editor plays via `clipUrlsFor(pack, role)`  
  packs: `sword_shield | 2h_melee | polearm | longbow | pistol | rifle | magic | dagger | …`
- **`modelRef`** = R2 key under `assets.grudge-studio.com` (prod/gltf category mesh)
- Client skips null refs gracefully

## Worker actions (editor UI)

1. **Audit prefabs** — fill rates for clip / model / vfx; improveable count  
2. **Fill nulls (local)** — mutates in-memory `master-weaponSkills` only (no CDN)  
3. **Export patch JSON** — download for PR / compare  
4. **Game-ready tests** — SI height, feet, hands, play kit CDN, attack clip CDN, weapon model, loadout  
5. **▶ Play** on skill cards — one-shot attack/cast role on the Toon kit mixer  

Repo write:

```bash
npm run wire:skill-prefab-anims
# or
node scripts/wire-skill-prefab-anims.mjs --report-only
node scripts/wire-skill-prefab-anims.mjs --dry
```

## Production gaps (slow review snapshot)

### info.grudge-studio.com (ObjectStore)

| Area | Status |
|------|--------|
| API docs + master catalogs | Strong SSOT |
| grudge6 editor (race/equip/T0–T1) | Live |
| Skill prefab.animationClip | Historically sparse (~38% before wire); worker + script fill |
| soundRef / projectileRef | Still mostly empty |
| Per-item art style meshes | prod/gltf category keys, not 6-style codex meshes |

### GrudgeBuilder production (`warlords-production.json` + docs)

| Gap | Priority |
|-----|----------|
| dock_crew_api, crew_ai_ocean_runtime, ship_stats_panel | P0 |
| BOW / STAFF / SPEAR / WAND style meshes ×6 | art (WEAPON_PREFAB_PRODUCTION) |
| DAGGER / MACE / HAMMER fallback art | art debt |
| storm_barrier_physics, oil_mine, ship_cargo | P1 |

Character play path remains: **Toon RTS ★** `loadRaceKit` → Railway player → client.grudge-studio.com.

## Game-ready checks

| id | Pass |
|----|------|
| race_loaded | Toon kit root in scene |
| si_height | skinned height 1.55–2.15 m |
| feet_ground | box.min.y ≈ 0 |
| hand_bones | R/L hand container or Bip001 hand |
| mixer_idle | AnimationMixer present |
| play_kit_cdn | HEAD/GET race GLB on assets CDN |
| anim_pack_attack | first attack clip URL reachable |
| skill_prefab_clip | sample skill has clip score |
| weapon_model_cdn | prod/gltf weapon mesh reachable |
| loadout_bound | ≥1 slot bound |

## Anti-fork

- Do **not** invent a second skill catalog or second mixer stack  
- Do **not** write R2 from the browser editor (`cdnWrite: false`)  
- Wire commits go through ObjectStore PR + `deploy:pages` / Vercel  

## Verify

```bash
node scripts/test-grudge6-editor-ssot.mjs
node scripts/wire-skill-prefab-anims.mjs --report-only
# after deploy:
# open https://info.grudge-studio.com/grudge6-editor
# → Game-ready tests · ▶ Play on a skill
```

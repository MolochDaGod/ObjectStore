# Prefab · asset update scheme

**Machine:** [`/api/v1/prefab-scheme.json`](../api/v1/prefab-scheme.json)

Four stores. Do not cross-write.

| Store | Owns | How to update |
|-------|------|----------------|
| ObjectStore JSON | Definitions (ITEM/SKIL/PFAB/ICON) | Edit `api/v1` → `npm run sync:docs` → `npx vercel --prod` |
| R2 CDN | GLB / PNG / audio | `grudge-convert` → `r2 put` → `HEAD` 200 not HTML |
| D1 `asset_registry` | Search index only | Seed batches ≤100 |
| Railway | Heroes, bag, ledger instances | Authenticated `/api/characters` · `/api/account` · `/api/uuid` |

## Prefab block (skills / items / entities)

```json
{
  "modelRef": null,
  "vfxRef": null,
  "overlayRef": null,
  "impactRef": null,
  "animationClip": "sword_shield/attack",
  "soundRef": null,
  "projectileRef": null
}
```

Null is valid. Play Warlords hero is **Toon `{race}.glb` + `loadRaceKit`** — not FBX, not Meshy, not races-bake.

Animation clips on Bip001: `{pack}/{role}` (`sword_shield/idle`). Never Mixamo clip names on Toon play.

## Add a weapon prefab

1. Row in `master-weapon-prefabs.json` + skill in `master-weaponSkills.json`.
2. UUID from [uuid-law](../api/v1/uuid-law.json) (`ITEM-*` / `SKIL-*`).
3. Mesh on R2 under [era taxonomy](../api/v1/era-asset-taxonomy.json) prefix.
4. `prefab.modelRef` / `animationClip` / optional `vfxRef`.
5. Wire: `npm run wire:skill-prefab-anims`.
6. Deploy info. Do **not** invent a second items JSON for one game.

---
title: info.* JSON deploy
---

# info.grudge-studio.com — definitions deploy (pattern)

**Start here for any info update:** `api/v1/game-data-manifest.json` → items / recipes / materials / harvest / professions.

Do **not** start from `forge-editor.json`, a whole-repo WIP dump, or `molochdagod.github.io/ObjectStore`.

## Stores (do not collapse)

| Layer | Host | Owns |
|-------|------|------|
| Definitions JSON | `info.grudge-studio.com/api/v1/*.json` | Item/recipe/harvest/profession catalogs |
| Proxy | `objectstore.grudge-studio.com/api/v1/*.json` | Fetches **info.*** (no stale R2 JSON cache) |
| Binaries | `assets.grudge-studio.com` | Icons, GLB, audio |
| Player bag / craft XP | Railway Postgres | Account mats · character profession XP |

## Game-ready family (runtime)

1. `game-data-manifest.json` — endpoint map + harvest→recipe→item graph  
2. `games-library.json` — Warlords runtime index  
3. `canonical-items-manifest.json` — category URLs  
4. `master-items.json` · `master-recipes.json` · `master-materials.json` · `master-harvest-nodes.json`  
5. `master-professions.json` · `home-island-contract.json`  
6. `master-weapon-prefabs.json` · `master-weaponSkills.json`

Harvest loot follows **profession level**, not node quality. Node prefab = `master-harvest-nodes.json` type only.

## Ship

```bash
# ObjectStore, branch from origin/main, JSON only
# 1. Edit api/v1/{game-data-manifest,master-items,master-recipes,master-materials,master-harvest-nodes,ssot}.json
# 2. npm run sync:docs
# 3. git push origin main
# Vercel project objectstore-grudge → info.grudge-studio.com
# Worker already proxies. Do not wrangler JSON to R2.
```

Machine pointer: [`api/v1/ssot.json`](../api/v1/ssot.json) `startHere` + `deploy`.

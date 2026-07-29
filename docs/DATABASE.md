# Grudge Studio Database Architecture

**Canonical docs:** [info.grudge-studio.com/docs](https://info.grudge-studio.com/docs) · [Creation of Truth](https://info.grudge-studio.com/docs#creation-truth)  
**Updated:** 2026-07-29

## Overview

Grudge Studio uses a **split** data architecture:

| Layer | Role | Auth |
|-------|------|------|
| **1. ObjectStore (static)** | Game definitions (items, skills, maps contracts) | None — public GET |
| **2. Railway Postgres (dynamic)** | Player state: characters, bag, island, wallet | Grudge ID JWT |
| **3. R2 + D1 index** | Binary assets + search index | Public CDN / index APIs |
| **4. Puter KV / localStorage** | Cache only — never sole bag/XP/roster SSOT | User session |

**Supabase is not the production player SSOT.** Do not write characters or inventory to Supabase for Warlords/client play.

---

## ObjectStore API (public, read-only)

No authentication required. Perfect for AI agents and definition browsers.

### Base URLs

```
https://info.grudge-studio.com/api/v1/
https://objectstore.grudge-studio.com/api/v1/
https://molochdagod.github.io/ObjectStore/api/v1/   # mirror
```

### Common endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/weapons.json` | Weapon definitions |
| `GET /api/v1/materials.json` | Crafting materials |
| `GET /api/v1/master-items.json` | Master item registry (GRUDGE UUIDs) |
| `GET /api/v1/warlords-production.json` | Live Warlords fleet + create funnel SSOT |
| `GET /api/v1/home-island-contract.json` | Home island scale / foundations |
| `GET /api/v1/map-registry.json` | Map family SSOT |

```javascript
const weapons = await fetch(
  "https://info.grudge-studio.com/api/v1/weapons.json"
).then((r) => r.json());
```

---

## Railway Postgres (player data SSOT)

**Service:** `grudge-api-production-0d46.up.railway.app`  
**Health:** `GET https://grudge-api-production-0d46.up.railway.app/api/health`  
**Client access:** same-origin `https://client.grudge-studio.com/api/*` (Vercel rewrites)

### Auth

1. Login at `https://id.grudge-studio.com/login?redirect_uri=…`
2. JWT stored under fleet token keys (`grudge_auth_token`, etc.)
3. `Authorization: Bearer <JWT>` on Railway / same-origin `/api/*`

### Primary tables / resources (conceptual)

| Concern | API | Notes |
|---------|-----|--------|
| Characters | `/api/characters` | Roster SSOT; era = `warlords` for product heroes |
| Progress | `/api/characters/:id/progress` | Professions, mastery |
| Account bag | `/api/account/*`, `/api/inventory/*` | Shared across characters |
| Wallet | `/api/wallet` | Server-side wallet |
| Home island | `/api/island/*` | Seeds + harvest state (`home_islands`) |

**Rules:**

- Never put account inventory on character PATCH.
- Never use D1 for bag/XP/roster.
- Never treat ObjectStore JSON as writable player state.

---

## R2 + D1 (assets only)

| Store | Role |
|-------|------|
| **R2** `assets.grudge-studio.com` | GLB, textures, icons, audio |
| **D1** `grudge-assets-db` / `asset_registry` | Search index (category, r2_key, bones) — not player data |
| **D1** `grudge-objectstore` | Icon search for ObjectStore worker |

---

## Deprecations

| Wrong / legacy | Use instead |
|----------------|-------------|
| Supabase as player DB | Railway Postgres |
| `api.grudge-studio.com` for auth | `id.grudge-studio.com` |
| `api.grudge-studio.com` as character API | Railway or client same-origin `/api` |
| Puter KV alone for bag/XP | Railway + optional Puter cache |
| `water.grudge-studio.com` as Warlords play SSOT | `client.grudge-studio.com` |

---

## Related

- [docs/index.html#creation-truth](./index.html#creation-truth)
- [docs/index.html#production-wiring](./index.html#production-wiring)
- [WARLORDS-PRODUCTION-SSOT.md](./WARLORDS-PRODUCTION-SSOT.md)
- Agent skill: `grudge-production-wiring`

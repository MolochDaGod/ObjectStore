# Grudge Studio — Canonical Codex (ONE TRUTH)

**Machine SSOT:** [`/api/v1/fleet-canonical.json`](../api/v1/fleet-canonical.json)  
**Updated:** 2026-07-19  
**Audience:** agents, deploy, production audits  

This file is the **human index** of the complete production system. Prefer it over scattered notes when wiring, purging, or verifying.

---

## 1. One-truth stack

```
Browser (*.grudge-studio.com · grudgewarlords.com · *.puter.site)
    │
    ├─ Identity  →  id.grudge-studio.com  (JWT mint · login UI)
    │                    └─ Railway grudge-api /api/auth/*
    │
    ├─ Player state → Railway Postgres (grudge-api-production-0d46)
    │                    characters · accounts · inventory · islands · ships · wallet
    │
    ├─ Definitions → objectstore|info.grudge-studio.com/api/v1/*.json
    │
    ├─ Binaries    → assets.grudge-studio.com  (R2 grudge-assets)
    │                    D1 asset_registry = INDEX only
    │
    └─ AI          → ai.grudge-studio.com  (grudge-ai-hub Worker + D1 jobs)
```

| Concern | Authority | Never |
|---------|-----------|--------|
| Login / JWT | id → Railway auth | api.grudge-studio.com, Puter alone |
| Characters / progress | Railway `characters` | D1, localStorage-only |
| Account bag / GBUX | Railway account routes | character PATCH bag |
| Island seeds | Railway `home_islands` | D1 |
| Recipes / weapons / races | ObjectStore JSON | Hardcoded HTML tables |
| Meshes / icons | R2 CDN | Postgres BYTEA |
| Asset search | D1 `asset_registry` | as player SSOT |

**Code registry:** `GrudgeBuilder/shared/fleet/manifest.ts` (`FLEET_URLS`)  
**DB map:** `shared/fleet/dbConnections.ts`  
**Probes:** `shared/fleet/truthProbes.ts` · `npm run probe:auth|truth|deployments`

---

## 2. Directory (production surfaces)

| Surface | URL | Repo |
|---------|-----|------|
| Warlords client | grudgewarlords.com | GrudgeBuilder |
| Battle / Triad | game.grudge-studio.com | Grudge-Studio-Game |
| Character Studio | character.grudge-studio.com | GCS / fleet |
| Water / TI | water.grudge-studio.com | Tactical-Infinity |
| Forge | forge.grudge-studio.com | RTS-Grudge studio |
| Survival / Grudges | grudges.grudge-studio.com | survival |
| Crafting | grudge-crafting.puter.site | grudge-crafting.html |
| Docs | info.grudge-studio.com | ObjectStore |
| Portal | grudge-studio.com | The-ENGINE |
| AI | ai.grudge-studio.com | grudge-ai-hub |

Local roots (this machine):

| Path | Role |
|------|------|
| `F:\GitHub\GrudgeBuilder` | Game API + fleet + Island3D |
| `F:\GitHub\ObjectStore` | Definitions + info docs |
| `F:\GitHub\grudge-ai-hub` | AI Worker production |
| `Grudge-Studio-Game` | Battle satellite |

---

## 3. UUID families (do not mix)

| Family | Example | Authority |
|--------|---------|-----------|
| **ICON-*** | `ICON-A1B2-…` | icon-registry + R2 |
| **Character** | `char_…` / UUID + `GRDG-…` | Railway characters |
| **Catalog** | `HERO-*` `EQIP-*` `ITEM-*` `SKIL-*` | ObjectStore master-registry |
| **Slot-tier instance** | `helm-t1-0001-…` | `grudgeUUID.ts` |
| **Asset registry** | sha1(`grudge-asset:`+r2Key) | D1 grudge-assets-db |
| **Account** | `grudge_id` | users + JWT |

Full guide: [API-AND-UUID-GUIDE.md](./API-AND-UUID-GUIDE.md) · GrudgeBuilder [UUID_SYSTEM.md](../../GrudgeBuilder/docs/UUID_SYSTEM.md)

---

## 4. Database wiring

### Railway Postgres (player SSOT)

Public API: `https://grudge-api-production-0d46.up.railway.app`  
Project: `grudge-warlords-rpg` · service `grudge-api` · env `DATABASE_URL`

| Table | Role |
|-------|------|
| users | Auth, grudge_id |
| accounts | Profile, GBUX |
| characters | Heroes, progress JSONB |
| account_inventory / account_resources | Shared bag |
| home_islands | Island seed/state |
| player_ships | Fleet / dock |
| uuid_ledger | Cross-game IDs |

Migrations: `GrudgeBuilder/migrations/000–007*.sql`

### D1 (index / jobs only)

| DB | Id (public map) | Role |
|----|-----------------|------|
| grudge-ai-hub | 42ada55e-… | AI jobs / agent config |
| grudge-objectstore | 8fc367a8-… | Object catalog index |
| grudge-assets-db | 3eeadd9e-… | asset_registry |
| grudge-game-state | 9b66919f-… | legacy — not Warlords character SSOT |

### R2

`grudge-assets` → `assets.grudge-studio.com`

---

## 5. Auth: front → backend → Grudge ID

```
1. App calls buildFleetAuthLoginUrl(origin)
2. User → id.grudge-studio.com/login?redirect_uri=<allowlisted>
3. ID mints JWT (implementation on Railway /api/auth/*)
4. Return token → store grudge_auth_token (also read sso_token, grudge.token, …)
5. API calls: Authorization: Bearer <jwt>
6. Same-origin SPAs: /api/* rewrites → Railway (game) + id (auth paths)
7. Puter static: call Railway + ObjectStore + ID explicitly (CORS)
```

Code: `authConnect.ts` · `authReturn.ts` · token keys in `FLEET_AUTH_TOKEN_KEYS`  
Smoke: `npm run probe:auth` · unauthenticated `GET /api/auth/verify` → `valid:false` still means route is live

---

## 6. Assets

| Kind | Path pattern |
|------|----------------|
| Fleet JS | `/js/grudge-fleet.js` · grudge6-kit · grudge-id-client |
| Race kits | `/models/grudge6/races/*` |
| Buildings | `/models/buildings/**` (nodeName isolate) |
| Ships | `/models/ships/**` |
| Icons | `ICON-*` registry → CDN |

**Rules:** multipack = isolate mesh; magic-byte verify; no Meshy heroes; no permanent capsules.

Build SSOT: [WARLORDS-PRODUCTION-SSOT.md](./WARLORDS-PRODUCTION-SSOT.md) · dock crew · ship catalog

---

## 7. AI worker

| Field | Value |
|-------|--------|
| Host | https://ai.grudge-studio.com |
| Health | GET /health · /api/health (public) |
| Models | GET /v1/models (public catalog) |
| Agents | GET /v1/agents |
| Chat | POST /v1/chat (Bearer) |
| Repo | `F:\GitHub\grudge-ai-hub` |
| Deploy | `npm run deploy` (api + domain wrangler configs) |

---

## 8. Production verify & purge

```bash
cd F:\GitHub\GrudgeBuilder
npm run probe:auth
npm run probe:truth
npm run probe:deployments
npm run verify:fleet-truth
npm run production:verify-cdn
```

**Cache purge (Cloudflare):** purge `assets.grudge-studio.com` + `ai.grudge-studio.com` + ObjectStore/info after deploy.  
**Browser:** hard refresh; clear only token keys if SSO broken (re-login via ID).

### Minimum smoke matrix

| Check | Expect |
|-------|--------|
| Railway `/api/health` | 200 |
| id `/login` | 200 |
| ObjectStore `docs-catalog.json` | 200 JSON |
| Assets `grudge-fleet.js` | 200 JS |
| AI `/health` | 200 ok |
| Warlords / game / character | 200 |
| Auth verify without token | JSON valid:false |
| Fleet manifest | 200 JSON urls.auth = id.grudge-studio.com |

---

## 9. Related machine JSON

- `fleet-canonical.json` — this codex  
- `warlords-production.json` — build/dock/ships/water  
- `docs-catalog.json` — doc index  
- `best-practices.json` — convert/render/combat  
- `grudge6-canonical.json` — race kits  
- Railway `GET /api/fleet/manifest` — runtime fleet URLs  

Keep all six aligned when endpoints change.

# Grudge Studio — Deploy, Accounts & Assets SSOT

One page for **game studio operations**: identity, player data, deployments, and production assets. Agents and humans should fix *toward* this model.

---

## 0. Machine env / secrets / bridges (this workstation)

**Do not invent parallel credential paths.** Everything needed for ops lives on this machine under patterned vault + repo env + wrangler OAuth.

| Layer | Location | Role |
|-------|----------|------|
| **Canonical vault** | `%USERPROFILE%\Desktop\secretnow.txt` | Full KEY=VALUE secrets (CF, R2/S3, Railway, JWT, Puter, AI, …) |
| Fallbacks | Desktop `secret.txt`, `newenv.txt`, `oldenv.txt` | Older / fuller dumps — prefer secretnow |
| Client public env | Repo `.env` (`VITE_*` only) | Auth URLs, CDN, ObjectStore public base — never R2 write keys |
| Wrangler OAuth | `~\.wrangler\config\default.toml` | Workers / D1 / Pages; **not** a substitute for R2 S3 list keys |
| Fleet loader | `ObjectStore/scripts/lib/load-fleet-env.mjs` | Loads vault → aliases into standard env names |

### R2 / S3 (binaries)

secretnow names → script names (applied by `load-fleet-env`):

| secretnow | Used as |
|-----------|---------|
| `CF_ACCOUNT_ID` | `CLOUDFLARE_ACCOUNT_ID` |
| `OBJECT_STORAGE_KEY` | `R2_ACCESS_KEY_ID` |
| `OBJECT_STORAGE_SECRET` | `R2_SECRET_ACCESS_KEY` |
| `OBJECT_STORAGE_BUCKET` / `R2_BUCKET_ASSETS` | `R2_BUCKET_NAME` (usually `grudge-assets`) |
| `OBJECT_STORAGE_ENDPOINT` | `R2_ENDPOINT` |
| `OBJECT_STORAGE_PUBLIC_URL` | CDN public base → `assets.grudge-studio.com` |

Ops commands (after loader):

```bash
cd ObjectStore
npm run r2:list -- --dry-env
npm run r2:list -- --prefix models/creeps/
npm run creeps:mirror:upload   # S3 put via fleet env, else wrangler put
```

**Do not** put R2 write secrets in browser `VITE_*`. Clients only use public CDN URLs.

### Accounts stay logged in (browser)

| Piece | Pattern |
|-------|---------|
| Login UI | `https://id.grudge-studio.com` only |
| JWT mint / auth impl | Railway `grudge-api-production` (via ID rewrites) |
| Token keys (read all, write canonical) | `grudge_auth_token` · `grudge_session_token` · `grudge.token` · `sso_token` |
| Account id cache | `grudge_id` / `grudge_account_id` |
| Game API | same-origin `/api/*` → Railway (Vercel rewrites) |
| Characters / bag | Railway Postgres — not D1, not localStorage SSOT |

Skill: **`grudge-production-wiring`**. DCQ: `client/src/lib/grudgeBackend.ts` uses the full fleet key read order.

### Other bridges on secretnow (names only)

`VERCEL_TOKEN` · `RAILWAY_API_TOKEN` · `CF_DNS_API_TOKEN` · `CF_WORKER_R2_API` · `OBJECTSTORE_API_KEY` · `OBJECTSTORE_WORKER_URL` · `JWT_SECRET` · `INTERNAL_API_KEY` · `PUTER_*` · `GRUDGE_AUTH_URL` · DB URLs (`GRUDGE_ACCOUNT_DB*`)

---

## 1. Stack law (Steam model)

```
One account  →  many eras (games saves)  →  many characters per era
One bag (account)  ·  progress/equipment per character
```

| Concern | Production authority | Never |
|---------|---------------------|--------|
| Login / JWT | **`id.grudge-studio.com`** | `auth.grudge-studio.com`, `api.grudge-studio.com` for new auth |
| Characters, bag, island, wallet | **Railway Postgres** (`grudge-api-production`) | D1, localStorage-only |
| Asset **index** | **Cloudflare D1** | Treating D1 as player SSOT |
| Binaries (GLB, icons, audio) | **R2** → `assets.grudge-studio.com` | Shipping raw multi-hundred-MB dumps as only path |
| Definitions (recipes, items) | **ObjectStore / info** `/api/v1` | Hardcoded full item tables in clients |
| Mesh bake | **`grudge-convert`** CLI | Ad-hoc unscaled FBX in browser |

---

## 2. Accounts & identity best practices

1. **One Grudge ID** per human (`users.grudge_id`).  
2. **Bearer JWT** on mutating APIs; store keys only:  
   `grudge_auth_token` · `grudge_session_token` · `grudge.token` · `sso_token`  
3. **SSO return allowlist** (`authReturn.ts` / Railway CORS).  
4. **Account scope vs character scope**  
   - Account: bag, GBUX, wallet  
   - Character: professions, equipment, skill trees, attributes  
5. **Optimistic concurrency** on progress (`expectedRevision` / If-Match).  
6. **Idempotency keys** on craft / spend.  
7. **Era filter** on characters (`gameEra`: warlords | nexus | armada | …).  

Foundry: create-only → 4-slot hub → `client.grudge-studio.com` play handoff.  
Crafting Puter site: shared bag, per-character XP — Railway SSOT.

Skill: **`grudge-production-wiring`**.

---

## 3. Deployment best practices

### Surfaces

| Surface | Host | Notes |
|---------|------|--------|
| Game SPA | Vercel | `vercel.json` rewrites **before** SPA catch-all |
| Game API / auth impl | Railway | Same-origin `/api/*` from SPA |
| CDN | CF Worker + R2 | Immutable cache for versioned keys |
| Workers | wrangler | Bindings, no secrets in client |
| Open library | open.grudge-studio.com | Register every public game |

### Onboard checklist (new game)

```
[ ] id.grudge-studio.com login + redirect allowlist
[ ] CORS for origin on Railway
[ ] Vercel rewrites: /api/auth, /api/characters, /api/account → Railway
[ ] Characters via Railway UUID, not localStorage SSOT
[ ] Assets: ObjectStore JSON + R2 binaries (no Meshy/capsule heroes)
[ ] systemMap / FLEET_GAME_ORIGINS / Open library card
[ ] Health: /api/health green
[ ] probe:auth · probe:truth · probe:deployments
```

Skill: **`grudge-game-onboarding`** · **`grudge-stack`** · **`grudge-live-servers`**.

### Anti-patterns

| Bad | Good |
|-----|------|
| Hardcoded Railway URL in SPA | Relative `/api` + rewrites |
| localStorage-only characters | Railway + cache |
| D1 for island seeds | Railway island routes |
| Secrets in frontend | Platform env |
| Skipping fleet registration | systemMap + Open library |

---

## 4. Assets best practices (era + bake)

1. **Bake with `grudge-convert`** before CDN when avoidable raw FBX.  
2. **SI scale** (1.8 m human) baked into mesh where possible.  
3. Ship **`.glb` + `.collider.json` + `.manifest.json`**.  
4. **Era** on registry metadata + path taxonomy — not only UUID.  
5. **UUID = identity**; scripts/skills/vehicles = linked packages.  
6. **Audit regularly:** `npm run audit:assets`  
7. **Purge only after dry-run** + allowlist (`config/asset-allowlist.json`).  

Dual UUID trap: deterministic v5 (path) vs `HERO-/EQIP-` prefixes — pick registry before cross-wiring.

Skills: **`grudge-asset-convert`** · **`grudge-d1-r2`** · this repo **`docs/ASSET_FLEET_AUDIT.md`**.

---

## 5. Gameplay package graph (studio target)

```text
AssetRef {
  uuid, r2Key, era, kind, purpose,
  readiness: { gameReady, converted, score },
  scripts: {
    weaponSkills?, locomotion?, flight?, vehicle?: { entry, steering }
  },
  attach: { bone, offset, scale }
}
```

Instance spawns (DCQ `PROP-`, `WRLD-`, `SESS-`) stay separate from canonical asset UUIDs.

---

## 6. Ops cadence

| Cadence | Action |
|---------|--------|
| Per PR (mesh) | convert + inspect + smoke load |
| Weekly | `npm run audit:assets` · review red/yellow |
| Before purge | `audit:assets:purge-dry` · approve list |
| New game | onboarding checklist gates |
| Auth change | probe:auth + allowlist review |

---

## 7. Quick probes

```bash
curl -sI https://id.grudge-studio.com/login
curl -s https://grudge-api-production-0d46.up.railway.app/api/health
curl -sI https://assets.grudge-studio.com/js/grudge-fleet.js
curl -sI https://objectstore.grudge-studio.com/api/v1/master-recipes.json
```

From GrudgeBuilder when available: `npm run probe:auth` · `probe:truth` · `probe:deployments`.

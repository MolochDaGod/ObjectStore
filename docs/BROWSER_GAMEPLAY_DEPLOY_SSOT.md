# Browser gameplay asset deploy SSOT (fleet-wide)

**Rule:** Systems that need **web-browser, game-play-ready** assets must be **deployment-wide**.  
Local disk, zip folders, and agent workspaces are **author/input only** — never the runtime load path for production play.

Live skill: `grudge-live-servers` (L0 five-layer asset SSOT).

---

## 1. Layers (never mix)

| Layer | Authority | Production host |
|-------|-----------|-----------------|
| **Binaries** (GLB/FBX/webp/audio) | R2 `grudge-assets` | `https://assets.grudge-studio.com/…` |
| **Definitions** (items, catalogs, mesh inventory JSON) | ObjectStore | `https://info.grudge-studio.com/api/v1/…` |
| **Index** | D1 | `https://api.grudge-studio.com/assets` |
| **Player state** | Railway Postgres | via game `/api/characters|account|…` |
| **App shells** | Vercel / CF Pages | open.*, info.*, grudox.*, animator app |

**Forbidden for production loaders:**

- `file://` or `C:\Users\…` paths  
- `Toon_RTS.zip\…` virtual zip paths  
- Uncommitted `dist/` GLBs as the only copy  
- HTML 200 fakes for GLB (magic-byte verify)  
- Second CDN / arena character hosts for grudge6  

---

## 2. System → deploy surface (what “done” means)

| System | Author (local) | Production binary / data | Production UI / game |
|--------|----------------|--------------------------|----------------------|
| **grudge6 race kits** | Desktop `Toon_RTS\{Race}\` FBX + Materials | `assets…/models/grudge6/races/*_Characters.glb` + `textures/grudge6/…` | Main Panel, Open, Multiverse, Foundry |
| **Mesh equip / paperdoll** | same kits + mesh_ids | CDN kits + `js/grudge6-kit.js` | `info…/main-panel.html`, `GRUDGE6_Characters.html` |
| **Item icons** | Desktop `icons\icons` | `assets…/icons/pack/…` + master-items iconUrl | shops, HUD, inventory |
| **Animations (Explorer)** | `public/anim/animations/**` | **shipped with app** or CDN if promoted | Animator / Open combat |
| **Animations (grudge6)** | bake pipeline | `assets…/anims/baked/**.json` | GrudgeAvatar loaders |
| **Animation registry** | `docs/ANIMATION_CATALOG2.csv` | committed on `main` + regen in CI/docs | Controller gates (not local-only CSV) |
| **Definitions** | ObjectStore `api/v1/*` | push `main` → Vercel info.* | all fleet games |

**Done =** HEAD 200 on production URL with correct `Content-Type` (e.g. `model/gltf-binary`, `image/webp`, `application/json`) — not “works on my machine.”

---

## 3. Deploy-wide workflow (agents & humans)

```
1. Author / edit on disk (Toon_RTS, FBX, icons, anim FBX)
2. Bake / convert for browser
     ObjectStore: npm run convert / bake:grudge6
     sharp/webp atlases ≤1024
3. Upload binaries → R2 (assets.grudge-studio.com)
4. Update definitions → ObjectStore api/v1 (iconUrl, catalogs, inventory JSON)
5. Wire loaders to production URLs only (CDN / info / same-origin rewrite)
6. Commit + push main (Vercel/CF auto)
7. Smoke LIVE hosts (not localhost):
     - assets mesh + atlas
     - info main-panel / API
     - open or game shell that loads the asset
8. Only then mark production-ready
```

### Minimum smoke set (gameplay assets)

```text
HEAD https://assets.grudge-studio.com/models/grudge6/races/WK_Characters.glb
HEAD https://assets.grudge-studio.com/textures/grudge6/western-kingdoms/WK_Standard_Units.webp
HEAD https://assets.grudge-studio.com/anims/baked/<pack>/<clip>.json
HEAD https://info.grudge-studio.com/main-panel.html
HEAD https://info.grudge-studio.com/api/v1/master-items.json
HEAD https://open.grudge-studio.com/
```

Open fleet verify (when touching Open):

```bash
cd Documents/gameopen
node scripts/verify-fleet-assets.mjs --cdn-only
node scripts/verify-fleet-assets.mjs --base https://open.grudge-studio.com
```

---

## 4. Consistency rules by asset class

### Characters (grudge6 / Toon RTS)

| Rule | Detail |
|------|--------|
| Runtime mesh | One production GLB per race on CDN |
| Equip | Child mesh visibility (`EquipmentManager` / mesh_ids) |
| Atlas | WebP on `textures/grudge6/{folder}/` (team colors = atlas swap) |
| Author | Desktop Toon_RTS only for bake input |
| Inspect | `tools/toon-rts-inspect` → update `api/v1/toon-rts-author-inventory.json` on push |

### Icons / items

| Rule | Detail |
|------|--------|
| Binary | `assets…/icons/pack/…` or game-assets pack |
| Catalog | `master-items.json` iconUrl absolute on assets host |
| Never | info.* category paths that return HTML SPA |

### Animations

| Rule | Detail |
|------|--------|
| Gate | `ANIMATION_CATALOG2.csv` controller_status |
| Code wire | `clipCatalog.ts` / `anims.ts` |
| Explorer files | ship in app deploy or promote to CDN deliberately |
| grudge6 clips | CDN baked JSON only |
| Virtual subclips | no cut without parent frame metadata in catalog |

---

## 5. Anti-patterns (reject)

1. “Works in local file server” as ship criteria  
2. Loader fallback chain that prefers Desktop over CDN  
3. Committing multi‑MB production GLB trees into game repos  
4. Leaving catalog/icon/mesh SSOT only in a chat session  
5. Parallel hosts (second character CDN, github.io icons as primary)  
6. Marking READY/production-ready from load_ok alone (playtest still required for hip/XZ)

---

## 6. Related docs

| Doc | Scope |
|-----|--------|
| This file | Browser gameplay deploy contract |
| [ASSETS.md](./ASSETS.md) | CDN paths, grudge6, convert |
| skill `grudge-live-servers` | L0–L9 deploy patterns |
| skill `grudge6-cdn-ssot` | Race kit hosts |
| Animator `docs/ANIMATION_SSOT.md` | Clip catalogs + skeletons |
| gameopen `docs/FLEET_ASSET_DEPLOYMENT.md` | Open rewrites + verify |

---

## 7. Agent one-liner

> For any **playable browser** system: **author local → bake → R2/info → push main → smoke live URLs**.  
> Desktop and zip are sources; **fleet hosts are the product.**

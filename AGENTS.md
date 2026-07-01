# ObjectStore — Single Source of Truth for Game Assets & Data

Created by **Racalvin The Pirate King**.

## What This Is
Cloudflare Worker + R2 + D1 serving as the canonical game asset API and static data host.
- **R2 bucket** `grudge-assets`: stores all binary assets (sprites, audio, 3D models, icons)
- **D1 database** `objectstore-meta`: asset metadata (id, filename, category, tags, mime)
- **GitHub Pages**: static JSON game data at `/api/v1/*.json`

## Architecture

### Live Endpoints
- `objectstore.grudge-studio.com` — Cloudflare Worker (R2 + D1 CRUD)
- `grudgeassets.grudge.workers.dev` — same worker, workers.dev fallback
- `assets.grudge-studio.com` — R2 CDN (direct file serving)
- `molochdagod.github.io/ObjectStore` — GitHub Pages (served from `gh-pages` branch)

### Worker Routes (workers/src/index.js)
- `GET /health` — health check
- `GET /v1/assets` — list/search assets
- `GET /v1/assets/:id/file` — download asset
- `POST /v1/assets` — upload (API key required)
- `GET /v1/models` — list 3D models (glb/gltf/fbx/obj)
- `GET /v1/models/:id/file` — download 3D model
- `POST /v1/convert` — 3D model conversion pipeline (Durable Object)

### Static Game Data (api/v1/)
Published via GitHub Pages.

**Runtime index (start here):** `games-library.json` → `game-data-manifest.json`

**Canonical runtime (weapons, stats, items):**
- `master-weapon-prefabs.json`, `master-weaponSkills.json`, `master-attributes.json`
- `weapon-stat-bridge.json`, `t0-weapons.json`, `master-items.json`
- `master-recipes.json`, `master-materials.json`, `master-harvest-nodes.json`

**Design layer (editors, not runtime ITEM-*):** `weapons.json`, `armor.json`

**World / content:** `races.json`, `classes.json`, `factions.json`, `enemies.json`, `bosses.json`, …

**Archived (stubs at old paths → full data in `api/v1/archive/`):**
- `attributes.json`, `weaponSkills.json`, `items-database.json`, `master-t0-items.json`
- Index: `api/v1/archive/manifest.json`
- `master-items.json` — items with GRUDGE UUIDs, tier expansion (T1-T8), recipe + icon links
- `master-recipes.json` — recipes with GRUDGE UUIDs, material references
- `master-materials.json` — materials with GRUDGE UUIDs (incl. harvest drops)
- `master-harvest-nodes.json` — harvest nodes → material UUIDs → recipe UUIDs
- `staff-looks.json` — staff appearances, icons, tiers, recipe materials (linked to master-items)
- **Icon image library (ICON-* UUIDs)** — canonical image assets on R2 CDN:
  - `icon-registry.json` — 9,724 icons, deterministic `ICON-XXXX-XXXX-XXXX` UUIDs
  - `icon-path-index.json` — `/icons/...` → UUID + CDN URL lookup
  - `assets-api.json` — REST + SDK manifest (**start here for icon integration**)
  - `icon-upload-status.json` — CDN upload progress by category
  - Docs: `docs/ICON-ASSET-LIBRARY.md`

Regenerate items: `npm run generate:all` (master DB + consolidation pipeline).
Regenerate icons: `npm run sync:icons` (registry + truth sync). Upload: see `docs/ICON-ASSET-LIBRARY.md`.
Harvest source of truth: `api/v1/sources/harvest-nodes.json` (migrated from warlord-crafting-suite).
Previously in grudge-game-data-hub (now archived) — merged into this repo.

### Who Consumes This
Every Grudge app reads from ObjectStore:
- `grudge-builder` → `objectStoreApi.ts` (cached fetch), `objectStoreModels.ts` (3D)
- `grudge-engine-web` → `asset-catalog.ts` (model paths)
- `GDevelopAssistant` → direct fetch via VITE_OBJECTSTORE_URL
- `grudge-studio-backend` → R2 via OBJECT_STORAGE_* env vars

## Icon assets (ICON-*)
- **Source of truth:** `api/v1/icon-registry.json` + `assets.grudge-studio.com/game-assets/icons/...`
- **Resolve URLs:** `grudgeSDK.resolveIconUrl(pathOrUuid)` or `GET /api/v1/icons/by-path`
- **Do not use** legacy `asset-registry.json` `SPRT-*` UUIDs for new integrations
- **Item cross-refs:** `master-registry.json` entries include `iconUuid` + `iconCdnUrl` where linked
- After icon changes: `npm run sync:icons` then `npm run icons:status`

## Coding Rules
- NEVER duplicate game data in frontend code. Always fetch from ObjectStore — no hardcoded fallbacks.
- GrudgeBuilder loads all items from `master-items.json` at runtime via `syncItemsFromObjectStore()`.
- Upload assets with category, tags, and metadata for discoverability.
- API key for writes: `X-API-Key` header. Reads are public (no auth).
- 3D models: upload with category `3d-models` or `models`, or use .glb/.gltf/.fbx/.obj extension.
- CORS: `wrangler.toml` ALLOWED_ORIGINS must include all Grudge deployment URLs.
- Deploy worker: `npx wrangler deploy --config wrangler.toml`
- Regenerate master data: `npm run generate:master`
- Deploy to GitHub Pages: `npm run deploy:pages` (pushes lightweight files to `gh-pages` branch)
- GitHub Actions is DISABLED at account level — always use `deploy:pages` for Pages deployments.

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
Published via GitHub Pages. These are the CANONICAL definitions:
- `races.json`, `classes.json`, `attributes.json`, `factions.json`
- `weapons.json`, `armor.json`, `materials.json`, `consumables.json`
- `weaponSkills.json`, `enemies.json`, `bosses.json`
- `effectSprites.json`, `abilityEffects.json`, `sprites2d.json`, `spriteMaps.json`
- `professions.json`, `skillTrees.json`, `items-database.json`
- `master-items.json` — 818 items with GRUDGE UUIDs, tier expansion (T1-T8), recipe links
- `master-recipes.json` — 118 recipes with GRUDGE UUIDs, material references
- `master-materials.json` — 93 materials with GRUDGE UUIDs

Regenerate master files: `npm run generate:master` (runs `scripts/generate-master-database.mjs`).
Previously in grudge-game-data-hub (now archived) — merged into this repo.

### Who Consumes This
Every Grudge app reads from ObjectStore:
- `grudge-builder` → `objectStoreApi.ts` (cached fetch), `objectStoreModels.ts` (3D)
- `grudge-engine-web` → `asset-catalog.ts` (model paths)
- `GDevelopAssistant` → direct fetch via VITE_OBJECTSTORE_URL
- `grudge-studio-backend` → R2 via OBJECT_STORAGE_* env vars

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

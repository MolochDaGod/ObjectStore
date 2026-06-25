# Icon Asset Library — Grudge Studio Source of Truth

ObjectStore is the **single source of truth** for all Grudge image icons (skills, sigils, abilities, class/race/faction emblems, weapons, armor, UI, etc.). Binary files live on R2 CDN; metadata and UUIDs live in `api/v1/` JSON served by ObjectStore and mirrored to `assets.grudge-studio.com`.

---

## Architecture

```
icons/  (local master library)
    │
    ▼  upload-icon-registry-r2.mjs
grudge-assets R2  →  assets.grudge-studio.com/game-assets/icons/...
    │
    ▼  sync-icon-source-of-truth.mjs
api/v1/icon-registry.json      ← canonical UUID catalog (ICON-*)
api/v1/icon-path-index.json    ← /icons/... → UUID lookup
api/v1/assets-api.json         ← API manifest for games + agents
api/v1/master-registry.json    ← items cross-linked with iconUuid
    │
    ▼  objectstore.grudge-studio.com
REST /api/v1/icons/*  +  SDK grudgeSDK.resolveIconUrl()
```

---

## UUID scheme (ICON)

| Prefix | Scope | Algorithm |
|--------|-------|-----------|
| `ICON` | All image assets on R2 | Deterministic: `sha1("grudge-asset:" + r2Key)` → `ICON-XXXX-XXXX-XXXX` |
| `ITEM` | Game items (weapons, armor, …) | Runtime/tier rows in `master-registry.json` |
| `HERO` / `EQIP` | Characters & equipment models | `grudge-backend` asset catalog |

**Rule:** The same R2 key always yields the same `ICON-*` UUID. Re-uploads never orphan references.

Example:
- R2 key: `game-assets/icons/sigils/strength.png`
- UUID: `ICON-…` (see `icon-registry.json`)
- CDN: `https://assets.grudge-studio.com/game-assets/icons/sigils/strength.png`

---

## Canonical datasets

| File | Role |
|------|------|
| [`api/v1/icon-registry.json`](../api/v1/icon-registry.json) | Full catalog: 9,724 entries, categories, `grudgeUuid`, `r2Key`, `iconPath`, `cdnUrl` |
| [`api/v1/icon-path-index.json`](../api/v1/icon-path-index.json) | Lightweight path → UUID index for games |
| [`api/v1/icon-category-index.json`](../api/v1/icon-category-index.json) | Category counts + shard paths for browsers |
| [`api/v1/icon-search-index.json`](../api/v1/icon-search-index.json) | Compact name/UUID search index |
| [`api/v1/icon-shards/{category}.json`](../api/v1/icon-shards/weapon.json) | Per-category icon lists (weapon, skill, armor, …) |
| [`api/v1/assets-api.json`](../api/v1/assets-api.json) | REST + SDK manifest — **start here for integration** |
| [`ICON_BROWSER.html`](../ICON_BROWSER.html) | **Visual browser** — search, filter, copy UUID/path/CDN |
| [`api/v1/icon-upload-status.json`](../api/v1/icon-upload-status.json) | CDN upload progress by category |
| [`api/v1/master-registry.json`](../api/v1/master-registry.json) | Item UUIDs + `iconUuid` / `iconCdnUrl` cross-refs |
| [`api/v1/catalog.json`](../api/v1/catalog.json) | Fleet catalog; see `iconLibrary` block |

### Categories (16)

`skill`, `class-skill`, `spell`, `ability`, `sigil`, `class`, `race`, `faction`, `profession`, `weapon`, `armor`, `consumable`, `material`, `item`, `ui`, `entity`, `misc`

---

## NPM scripts

```bash
# Regenerate registry from local icons/ (no upload)
node scripts/upload-icon-registry-r2.mjs --registry-only

# Upload all icons to R2 (long-running; use --skip-existing to resume)
node scripts/upload-icon-registry-r2.mjs --skip-existing --skip-remote-verify

# Upload one category
node scripts/upload-icon-registry-r2.mjs --category=skill --skip-remote-verify

# Sync source-of-truth JSON (path index, master-registry links, catalog)
npm run sync:icon-truth

# Full pipeline: registry + sync
npm run sync:icons

# Check CDN coverage → writes icon-upload-status.json
npm run icons:status
```

---

## REST API (ObjectStore Express)

Base: `https://objectstore.grudge-studio.com`

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/icons/categories` | Category counts |
| `GET /api/v1/icons?category=skill&page=1&limit=50` | Paginated list |
| `GET /api/v1/icons/search?q=fire&category=spell` | Search |
| `GET /api/v1/icons/by-path?path=/icons/sigils/strength.png` | Resolve path |
| `GET /api/v1/icons/:grudgeUuid` | Lookup by `ICON-*` UUID |

Static JSON (also on CDN at `assets.grudge-studio.com/game-assets/api/v1/`):
- `/api/v1/icon-registry.json`
- `/api/v1/icon-path-index.json`
- `/api/v1/assets-api.json`

---

## SDK usage

```javascript
import { GrudgeSDK } from '@grudge-studio/objectstore/sdk';

const sdk = new GrudgeSDK({ baseUrl: 'https://objectstore.grudge-studio.com' });

// Resolve any reference
const url = await sdk.resolveIconUrl('/icons/sigils/strength.png');
const url2 = await sdk.resolveIconUrl('ICON-C331-855B-1EF2');

// Browse
const { icons, total } = await sdk.listIcons({ category: 'ability', limit: 100 });
const reg = await sdk.getIconRegistry();
```

Shared resolver (Node/ESM): `@grudge-studio/objectstore/icon-resolver`

---

## Game integration rules

1. **Never hardcode** `molochdagod.github.io/ObjectStore/icons/…` or legacy `objectstore.grudge-studio.com/icons/…` paths in production.
2. **Prefer** `iconUuid` from `master-registry` or `resolveIconUrl()` for display.
3. **Legacy** `/icons/...` paths in item JSON are normalized to `https://assets.grudge-studio.com/game-assets/icons/...` via the path index.
4. **Do not** use `asset-registry.json` `SPRT-*` UUIDs for new work — superseded by `ICON-*` in `icon-registry.json`.
5. After adding icons locally, run `npm run sync:icons` and upload to R2 before shipping game builds.

---

## Related docs

- [REGEN-WORKFLOW.md](./REGEN-WORKFLOW.md) — master item regeneration + icon sync step
- [AGENTS.md](../AGENTS.md) — repo rules for agents
- [assets-api.json](../api/v1/assets-api.json) — machine-readable API manifest
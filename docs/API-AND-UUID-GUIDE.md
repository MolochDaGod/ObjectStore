# Grudge Studio — API & UUID Guide

Single reference for **which API serves what**, **which UUID scheme to use**, and **how to deploy updates** after the June 2026 icon library completion (9,724 `ICON-*` assets).

---

## Quick links

| Resource | URL |
|----------|-----|
| ObjectStore API (live JSON) | https://objectstore.grudge-studio.com/api/v1/ |
| Docs hub (browse data) | https://info.grudge-studio.com/docs |
| Asset CDN (binary files) | https://assets.grudge-studio.com/ |
| Game API (characters, islands) | https://api.grudge-studio.com/ |
| Auth (Grudge ID) | https://id.grudge-studio.com/ |
| Production game | https://grudgewarlords.com/ |
| Integration manifest | [`api/v1/assets-api.json`](../api/v1/assets-api.json) |
| OpenAPI spec | [`openapi.yaml`](../openapi.yaml) |

---

## UUID systems (do not mix these up)

Grudge uses **five** identifier families. Pick the one that matches your layer.

### 1. `ICON-*` — Image assets (canonical for UI icons)

| Field | Value |
|-------|-------|
| **Scope** | PNG/WebP icons on R2 (skills, sigils, weapons, armor, UI, …) |
| **Algorithm** | `sha1("grudge-asset:" + r2Key)` → `ICON-XXXX-XXXX-XXXX` |
| **Source of truth** | [`api/v1/icon-registry.json`](../api/v1/icon-registry.json) |
| **CDN path** | `https://assets.grudge-studio.com/game-assets/icons/...` |
| **Resolver** | `@grudge-studio/objectstore/icon-resolver` or GrudgeBuilder `resolveIconUrl()` |

Same R2 key → same UUID forever. Re-uploads never orphan references.

```javascript
import { resolveIconUrl } from '@grudge-studio/objectstore/icon-resolver';
// or in GrudgeBuilder: import { resolveIconUrl } from '@/lib/iconResolver';

const url = resolveIconUrl('/icons/sigils/strength.png');
// → https://assets.grudge-studio.com/game-assets/icons/sigils/strength.png
```

### 2. `char_*` — Player characters

| Field | Value |
|-------|-------|
| **Scope** | One row per hero (race, class, gear, `model3d`, island link) |
| **Format** | `char_` + nanoid (GrudgeBuilder) or UUID in `player_characters` (RTS-Grudge) |
| **Authority** | Railway / `api.grudge-studio.com` (`GET/PATCH /api/characters`) |
| **3D join** | `raceId` + `equipment` → `panelEquipmentToModel3d()` → grudge6 GLB on CDN |

### 3. `HERO-*` / `EQIP-*` / `ITEM-*` — Backend asset catalog

| Field | Value |
|-------|-------|
| **Scope** | Registered 3D models and catalog rows in grudge-backend D1 |
| **Prefix** | Human-readable: `HERO-…`, `EQIP-…`, `ITEM-…` |
| **Registry** | [`api/v1/master-registry.json`](../api/v1/master-registry.json) (cross-linked with `iconUuid`) |

### 4. Slot-tier Grudge UUID — Crafted item instances

| Field | Value |
|-------|-------|
| **Scope** | Runtime drops, loot stamps, on-chain metadata |
| **Format** | `SLOT-TIER-ITEMID-TIMESTAMP-COUNTER` (e.g. `helm-t1-0001-012501012026-000000`) |
| **Code** | `GrudgeBuilder/shared/grudgeUUID.ts` |
| **API** | `POST /api/uuid/generate`, `POST /api/island/resolve-drops` |
| **Full spec** | [GrudgeBuilder `docs/UUID_SYSTEM.md`](../../GrudgeBuilder/docs/UUID_SYSTEM.md) |

### 5. Deterministic asset UUID (RTS-Grudge `asset_registry`)

| Field | Value |
|-------|-------|
| **Scope** | GLB/FBX/texture files in RTS-Grudge pipeline |
| **Algorithm** | UUID v5 from R2 key (same idea as `ICON-*`, different namespace) |
| **API** | `GET https://api.grudge-studio.com/assets?limit=5` |

---

## ObjectStore REST API

Base: `https://objectstore.grudge-studio.com`

### Static datasets (`GET /api/v1/:name.json`)

| File | Entries | Purpose |
|------|---------|---------|
| `icon-registry.json` | 9,724 | Full ICON catalog: `grudgeUuid`, `r2Key`, `cdnUrl`, `category` |
| `icon-path-index.json` | 9,724 | Fast `/icons/...` → UUID lookup |
| `assets-api.json` | — | **Start here** — manifest, categories, SDK methods |
| `master-registry.json` | 2,534+ linked | Items with `iconUuid` / `iconCdnUrl` |
| `icon-upload-status.json` | — | CDN coverage by category |
| `catalog.json` | — | Fleet catalog index |
| `weapons.json`, `skills.json`, … | — | Game design data (WCS-aligned) |

### Dynamic icon queries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/icons?category=skill&page=1&limit=50` | Paginated icon list |
| GET | `/api/v1/icons/search?q=fire&category=spell` | Search by name/path |
| GET | `/api/v1/icons/:grudgeUuid` | Lookup by ICON UUID |
| GET | `/api/v1/icons/by-path?path=/icons/sigils/strength.png` | Lookup by legacy path |

### SDK (browser / Node)

```javascript
import { GrudgeSDK } from '@grudge-studio/objectstore/sdk';

const sdk = new GrudgeSDK({ baseUrl: 'https://objectstore.grudge-studio.com' });
const registry = await sdk.getIconRegistry();
const url = sdk.resolveIconUrl('ICON-A3D8-55CC-14D5');
const skills = await sdk.fetch('/api/v1/skills.json');
```

---

## GrudgeBuilder / grudgewarlords.com API

Base: `https://grudgewarlords.com/api/` (Vercel rewrites → backend)

See [GrudgeBuilder `docs/API.md`](../../GrudgeBuilder/docs/API.md) for full route list.

### Account & characters (player-facing)

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/characters` | All heroes for signed-in Grudge ID |
| PATCH | `/api/characters/:id` | Equipment, `model3d`, attributes, skills |
| GET | `/api/account/inventory` | Shared + character-bound stash |
| POST | `/api/account/inventory/:id/transfer` | Bind item to character |
| GET | `/api/island` | Home island state (terrain, nodes, map URL) |
| POST | `/api/island/initialize` | First visit — after opening cutscene |
| POST | `/api/characters/:id/generate-island` | Procedural home island |

### UUID admin routes

| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/api/uuid/generate` | Preview slot-tier UUID |
| POST | `/api/uuid/apply-to-items` | Dry-run batch |
| POST | `/api/uuid/commit` | Write to Postgres |
| POST | `/api/island/resolve-drops` | Stamp loot with Grudge UUIDs |

---

## Icon deploy pipeline (completed June 2026)

```bash
cd ObjectStore

# 1. Regenerate registry from local icons/ (no upload)
node scripts/upload-icon-registry-r2.mjs --registry-only

# 2. Sync derived JSON (path index, master-registry links, catalog)
npm run sync:icon-truth

# 3. Upload registry JSON to R2 (mirrors to CDN)
node scripts/upload-icon-registry-r2.mjs --registry-only

# 4. Check CDN coverage
npm run icons:status

# 5. Deploy ObjectStore to Vercel (serves api/v1/*.json)
git add api/v1/*.json docs/
git commit -m "chore: publish icon registry + docs"
git push   # → info.grudge-studio.com + objectstore.grudge-studio.com
```

### Upload stats (last full run)

| Metric | Value |
|--------|-------|
| Total icons | 9,724 |
| Skipped (already on CDN) | 3,714 |
| Newly uploaded | ~6,010 |
| Categories | 16 (`skill`, `weapon`, `armor`, `spell`, …) |
| master-registry icon links | 2,534 items |

---

## Wiring a game page to icons

### GrudgeBuilder (grudgewarlords.com)

```typescript
import { resolveIconUrl, iconOnError } from '@/lib/iconResolver';
import { resolveItemImage } from '@/lib/grudaDB';

<img
  src={resolveItemImage(item)}
  onError={iconOnError}
  alt={item.name}
/>
```

Pages using this today: `/character`, `/crafting`, `/professions`, `/database`.

### ObjectStore consumer

```javascript
import { resolveIconUrl, buildIconIndexes } from '@grudge-studio/objectstore/icon-resolver';

const registry = await fetch('https://objectstore.grudge-studio.com/api/v1/icon-registry.json').then(r => r.json());
const indexes = buildIconIndexes(registry);
```

---

## Verification checklist

```bash
# Registry live on ObjectStore
curl -s https://objectstore.grudge-studio.com/api/v1/icon-registry.json | jq '.totalEntries'

# Registry mirror on CDN
curl -sI https://assets.grudge-studio.com/game-assets/api/v1/icon-registry.json | head -1

# Sample icon
curl -sI https://assets.grudge-studio.com/game-assets/icons/sigils/strength.png | head -1

# Integration manifest
curl -s https://objectstore.grudge-studio.com/api/v1/assets-api.json | jq '.totalIcons'
```

Expected: `totalEntries` / `totalIcons` = **9724**.

---

## Related docs

| Doc | Location |
|-----|----------|
| Icon library detail | [`ICON-ASSET-LIBRARY.md`](./ICON-ASSET-LIBRARY.md) |
| Regen workflow | [`REGEN-WORKFLOW.md`](./REGEN-WORKFLOW.md) |
| Slot-tier UUID spec | [GrudgeBuilder `docs/UUID_SYSTEM.md`](../../GrudgeBuilder/docs/UUID_SYSTEM.md) |
| GrudgeBuilder API | [GrudgeBuilder `docs/API.md`](../../GrudgeBuilder/docs/API.md) |
| Spell/skill icons | [GrudgeBuilder `docs/SPELL_SKILL_ICONS.md`](../../GrudgeBuilder/docs/SPELL_SKILL_ICONS.md) |
| D1 + R2 fleet skill | `~/.agents/skills/grudge-d1-r2/SKILL.md` |
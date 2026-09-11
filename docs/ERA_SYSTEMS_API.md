# Era systems API (warlords · nexus · voxel · armada)

**Machine:** [`/api/v1/era-systems.json`](../api/v1/era-systems.json)  
**Related:** [uuid-law](../api/v1/uuid-law.json) · [era taxonomy](./ERA-ASSET-TAXONOMY.md) · [Open launcher](./OPEN_LAUNCHER_API.md) · [prefab scheme](./PREFAB_ASSET_SCHEME.md)

Do not invent a fifth product era or a second roster database.

## One account, four shelves

| Layer | Key | API |
|-------|-----|-----|
| Account | `grudge_id` `GRUDGE_…` | id.grudge-studio.com + `/api/account/*` |
| Hero | `characters.id` RFC UUID + `game_era` | `GET /api/characters?era=` |
| Display stamp | `GRDG-…` | UI only — not handoff |
| Unique gear | server `grudge_uuid` | `/api/uuid/*` + ledger |
| Definitions | SKIL / ITEM / PFAB / ICON | info `/api/v1` |
| Binaries | R2 key | assets.grudge-studio.com |

Handoff into any game: `?characterId=<uuid>&era=<era>`.

## Eras

| Era | Play | Stats | Body | Main panel |
|-----|------|-------|------|------------|
| **warlords** | client / grudgewarlords | STR…TAC | Toon `loadRaceKit` | `ui…/main-panel.html?era=warlords` |
| **nexus** | grudges play + grudox | BIO…GRA (`/api/stats`) | Quaternius / voxel interim | `?era=nexus` |
| **voxel** | Grudges + Mine-Loader + GRUDOX | BIO…GRA in Grudges | TVS / explorer | `?era=voxel` |
| **armada** | gated naval/mech | ship hardpoints | armada packs | `?era=armada` |

**Product lock:** Grudges heroes are **`era=voxel`**. Nexus remains the stat/API name and the Grudges main-panel sheet.

UI contracts (slots/tabs): `https://ui.grudge-studio.com/api/main-panel/{era}`.

## How to update an era system

1. Definitions → ObjectStore `api/v1` (this repo) → `npm run sync:docs` → `npx vercel --prod`.
2. Meshes → `grudge-convert` → R2 path from [era-asset-taxonomy](../api/v1/era-asset-taxonomy.json) → D1 index.
3. Prefabs → [prefab-scheme](../api/v1/prefab-scheme.json).
4. Paperdoll/HUD → `grudge-ui-editor` `eras/{era}.json`.
5. Roster rules stay Railway `?era=` — never a new characters table.

## Codex map

| Need | JSON |
|------|------|
| Fleet one-truth | `/api/v1/fleet-canonical.json` |
| UUID families | `/api/v1/uuid-law.json` |
| This matrix | `/api/v1/era-systems.json` |
| Asset folders | `/api/v1/era-asset-taxonomy.json` |
| Open as launcher | `/api/v1/open-launcher.json` |

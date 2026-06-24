# Master Dataset Regeneration Workflow

This document describes the canonical workflow for regenerating the master JSON datasets published via GitHub Pages at `api/v1/`.

---

## Overview of master datasets

| File | Generator | Source inputs |
|------|-----------|---------------|
| `api/v1/master-items.json` | `npm run generate:master` | `weapons.json`, `armor.json`, `materials.json`, `consumables.json` |
| `api/v1/master-weapons.json` | `npm run generate:master` | `api/v1/weapons.json` |
| `api/v1/master-armor.json` | `npm run generate:master` | `api/v1/armor.json` |
| `api/v1/master-materials.json` | `npm run generate:master` | `api/v1/materials.json` |
| `api/v1/master-consumables.json` | `npm run generate:master` | `api/v1/consumables.json` |
| `api/v1/master-recipes.json` | `npm run generate:master` | derived from items |
| `api/v1/master-artifacts.json` | `npm run generate:master` | `arcaneStaves` category in `weapons.json` |
| `api/v1/master-registry.json` | `npm run generate:master` | all master datasets |
| `api/v1/master-relics.json` | `npm run generate:relics` | `scripts/generate-master-relics.js` |
| `api/v1/icon-registry.json` | `npm run sync:icons` | local `icons/**` → R2 CDN UUID catalog |
| `api/v1/icon-path-index.json` | `npm run sync:icon-truth` | derived from `icon-registry.json` |
| `api/v1/assets-api.json` | `npm run sync:icon-truth` | icon REST/SDK manifest |
| `api/v1/icon-upload-status.json` | `npm run icons:status` | CDN coverage check |

See **[ICON-ASSET-LIBRARY.md](./ICON-ASSET-LIBRARY.md)** for the full icon pipeline.

---

## Standard regeneration

To regenerate all master datasets from their authoritative source files:

```bash
npm run generate:master
```

This runs `scripts/generate-master-database.mjs` which:
1. Reads `api/v1/weapons.json`, `armor.json`, `materials.json`, `consumables.json` as-is.
2. Layers GRUDGE UUIDs + tier expansion (T1–T8) + recipe linking on top.
3. Emits all `master-*.json` files under `api/v1/`.

---

## Admin merge (one-off corrections)

`scripts/admin-merge.js` applies authoritative one-off patches on top of the master files (staff retags, T0 addendum, new variants). It is run after `generate:master` when needed:

```bash
npm run admin:merge
```

**Safety backups**: before overwriting any file, `admin-merge.js` copies the current version to `api/v1/_backups/<file>.<timestamp>.bak`. The `_backups/` directory is gitignored and will not be published.

---

## Keeping `api/v1/` clean

`api/v1/` is a publish-ready directory. The following subdirectories are scratch/internal and are gitignored:

| Directory | Purpose |
|-----------|---------|
| `api/v1/_drafts/` | Work-in-progress data (e.g. `t0-addendum.json`) |
| `api/v1/_audit/` | Output of `npm run audit:items` |
| `api/v1/_backups/` | Timestamped `.bak` copies written by `admin-merge.js` |

Do **not** commit or publish any `*.bak` or `*.backup` files. These are covered by the root `.gitignore`.

---

## Deploying to GitHub Pages

```bash
npm run deploy:pages
```

This pushes the lightweight publish set (static JSON + HTML) to the `gh-pages` branch. See `scripts/deploy-pages.mjs` for what is included.

---

## Icon library sync (after adding/changing icons in `icons/`)

```bash
# 1. Regenerate icon-registry.json from local files
node scripts/upload-icon-registry-r2.mjs --registry-only

# 2. Upload binaries to R2 (resume with --skip-existing)
node scripts/upload-icon-registry-r2.mjs --skip-existing --skip-remote-verify

# 3. Sync path index, master-registry iconUuid links, catalog
npm run sync:icon-truth

# 4. Verify CDN coverage
npm run icons:status
```

One-liner after registry exists: `npm run sync:icons`

---

## Full regeneration sequence (from scratch)

```bash
# 1. Regenerate all master datasets
npm run generate:master

# 2. Apply any pending admin corrections (if applicable)
npm run admin:merge

# 3. Validate schemas
npm run validate:schemas

# 4. Deploy to GitHub Pages
npm run deploy:pages
```

# Asset Fleet Audit — Runbook

**Purpose:** Tag every scanned asset with **era**, score **game-ready bake**, produce a **convert queue**, and a **purge dry-run** list. Never hard-delete without human approval.

**SSOT tools**

| Tool | Role |
|------|------|
| `scripts/asset-fleet-audit.mjs` | Inventory + era + readiness report |
| `config/asset-allowlist.json` | Never auto-purge |
| `grudge-convert` (`tools/grudge-convert`) | Production bake |
| D1 / R2 | Index + binaries (see `grudge-d1-r2`) |

---

## Commands

```bash
cd ObjectStore

# Local scan of models, api/v1, icons, audio, sprites, effects, heroes, textures
npm run audit:assets

# Also HEAD assets.grudge-studio.com for mesh/json/png keys (slower)
npm run audit:assets:cdn

# Write purge candidates only (no deletes)
npm run audit:assets:purge-dry

# CI: fail if any red
npm run audit:assets:strict

# Limit for smoke
node scripts/asset-fleet-audit.mjs --max 200
```

### Outputs

| Path | Content |
|------|---------|
| `docs/reports/asset-fleet-audit-latest.md` | Human summary |
| `docs/reports/asset-fleet-audit-latest.json` | Full machine report |
| `api/v1/_audit/asset-fleet-audit.json` | API-adjacent copy |
| `docs/reports/asset-fleet-audit-history.jsonl` | Append-only history |
| `docs/reports/purge-candidates-*.json` | Dry-run only |

---

## Bands

| Band | Meaning |
|------|---------|
| **green** | Stack-usable + game-ready (or grudge6 FBX exception) |
| **yellow** | Loadable but missing bake sidecars / oversized / needs convert |
| **red** | Not usable in production stack as-is |

### Era values

`grudge6` · `tvs` · `warlords` · `legacy` · `gamedata` · `ui` · `audio` · `vfx` · `unknown`

---

## Convert → re-register (salvage yellow/red meshes)

```bash
# From ObjectStore when grudge-convert is installed
npm run convert:doctor
npm run convert -- fbx2gltf raw/foo.fbx -o dist/prod/foo.raw.glb --cm-to-m --no-meshopt
npm run convert -- glb2glb dist/prod/foo.raw.glb -o dist/prod/foo.glb --height 1.8 --texture-size 1024
npm run convert -- inspect dist/prod/foo.glb

# Deploy
npx wrangler r2 object put grudge-assets/models/.../foo.glb --file=dist/prod/foo.glb --content-type=model/gltf-binary --remote
# + .collider.json + .manifest.json when present
# seed D1 / master-registry
```

Keep **same r2Key** when replacing so deterministic UUIDs stay stable.

---

## Purge (safe process)

1. Run `npm run audit:assets:purge-dry`
2. Review `purge-candidates-*.json` against `config/asset-allowlist.json`
3. Prefer `status: archived` in D1 for 30 days
4. Delete R2 objects **after** D1 archive (or jointly with documented order)
5. Re-run audit; red count should drop

**Never** purge:

- `models/grudge6/` FBX races  
- TVS / gamedata JSON  
- icons, audio, fleet JS  

---

## UUID vs era

| Field | Stores |
|-------|--------|
| UUID | Identity only |
| `era` | Content generation / stack family |
| `readiness` | Bake / CDN / registry gates |
| Scripts (skills, vehicles) | Linked package / gamedata — not in UUID |

See fleet review: AssetRef = UUID + metadata + script refs.

---

## Related studio docs

- `docs/STUDIO_DEPLOY_ACCOUNTS_SSOT.md` — accounts, deploy, onboarding  
- Skills: `grudge-asset-convert`, `grudge-d1-r2`, `grudge-production-wiring`, `grudge-game-onboarding`

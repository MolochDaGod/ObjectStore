# ObjectStore helpers SSOT

**Entry:** `npm run helper -- <command>`  
**Code:** `scripts/helpers/`  
**Does not invent:** second package manager, second deploy cloud, or parallel AI platform.

## Modules

| Helper | File | Role |
|--------|------|------|
| **CLI router** | `scripts/helpers/index.mjs` | Single entry for agents |
| **Node** | `node-helper.mjs` | Node ≥20, tool paths (git/wrangler/vercel) |
| **Dependencies** | `deps-helper.mjs` | lockfile, node_modules, critical tooling |
| **Package** | `package-helper.mjs` | package.json scripts inventory by group |
| **Deploy** | `deploy-helper.mjs` | Target registry + smoke + optional run |
| **AI worker** | `ai-worker-helper.mjs` | Registry of workers (prefab-anim, fleet, craft…) |

Related existing tools (kept):

- `npm run fleet:doctor` → `scripts/fleet-env-doctor.mjs`
- `npm run wire:skill-prefab-anims` → prefab batch wire
- `npm run test:grudge6-editor`
- `js/grudge6-prefab-anim-worker.js` (browser)

## Commands

```bash
npm run helper -- doctor          # all doctors + WCS smoke
npm run helper -- node
npm run helper -- deps
npm run helper -- package
npm run helper -- package --all
npm run helper -- deploy list
npm run helper -- deploy smoke
npm run helper -- deploy smoke wcs
npm run helper -- deploy run wcs --dry
npm run helper -- deploy run wcs          # REAL CF Pages deploy (intentional)
npm run helper -- ai list
npm run helper -- ai smoke
npm run helper -- ai run prefab-anim
npm run helper -- ai run fleet-env
```

Aliases:

```bash
npm run helper:doctor
npm run helper:deploy
npm run helper:ai
npm run deploy:helper   # same as helper -- deploy list
```

## Deploy targets

| id | Live | Local |
|----|------|--------|
| `wcs` | wcs.grudge-studio.com | `F:\GitHub\grudge-wcs\pages-wcs` |
| `objectstore-pages` | info… (Pages path) | ObjectStore |
| `objectstore-vercel` | info.grudge-studio.com | ObjectStore + vercel |
| `craft` | grudgewarlords.com/craft/ | GrudgeBuilder |
| `ui-main-panel` | ui…/main-panel.html | grudge-ui-editor |

**Hard:** never mega-deploy unrelated WIP. Prefer `--dry` then intentional `run <id>`.

## AI workers registered

| id | What |
|----|------|
| `prefab-anim` | grudge6 editor prefab↔anim + `wire-skill-prefab-anims` |
| `fleet-env` | credential probe (no secrets printed) |
| `deploy-ops` | this deploy helper |
| `craft-consolidate` | WCS + craft + main-panel smoke set |
| `asset-fleet-audit` | asset era / game-ready audit |

## Agent protocol

1. `npm run helper -- doctor` at session start when touching deploy/craft/editor.  
2. Name the **deploy id** before `deploy run`.  
3. Prefer extending `AI_WORKERS` / `DEPLOY_TARGETS` maps over new folders.  
4. Browser AI worker stays on grudge6 editor surface (no CDN write from browser).

# Agent Context — Grudge Studio ObjectStore

> **Purpose**: This document is the authoritative continuation prompt for any AI agent (Oz or successor) working on this repository. Update it whenever a session ends, a milestone completes, or task priorities change.
>
> **Last Updated**: 2026-02-28

---

## 1) Project Identity

| Field | Value |
|-------|-------|
| **Repository** | `MolochDaGod/ObjectStore` |
| **Package** | `@grudgstudio/core` v2.2.0 |
| **Live URL** | https://molochdagod.github.io/ObjectStore |
| **Primary Role** | Centralized single source of truth for all Grudge Studio game data |
| **Agent Co-author** | Oz `<oz-agent@warp.dev>` |

ObjectStore exposes a static JSON API (GitHub Pages) for Grudge Warlords weapons, materials, armor, consumables, skills, sprites, races, classes, factions, and attributes. It also ships `@grudgstudio/core` — a cross-platform SDK used by Unity, React/TypeScript, and Node.js clients.

---

## 2) Chronological Session Context

The most recent user session progressed through these stages:

1. **Update ObjectStore wiki** — user requested documentation improvements to `WIKI-HOME.md` and related docs.
2. **Puter systems review + audit setup** — user requested a full audit of all Grudge Studio apps/sites running on Puter, producing:
   - `scripts/puter-audit.mjs` — runnable audit script
   - `docs/PUTER-AUDIT-INTEGRATION.md` — governance standard
   - `docs/puter-integration-inventory.json` — portfolio inventory
   - `docs/reports/puter-audit-report.json` — baseline audit results
   - `docs/reports/puter-remediation-plan-2026-02-28.md` — remediation plan
   - `docs/reports/puter-remediation-checklist.json` — machine-readable checklist
3. **Agent prompt improvement** — user requested this document be created to encode all context so future agent sessions can resume without losing state.

---

## 3) Intent Map — Pending Tasks

Priority order based on last session state:

| # | Task | Status | Priority |
|---|------|--------|----------|
| 1 | Improve agent prompt (this file) | ✅ Done | — |
| 2 | Update ObjectStore wiki (`WIKI-HOME.md`) | 🔄 Partially done | 🔴 High |
| 3 | Puter audit + integration for Grudge Studio portfolio | ✅ Infrastructure in place | 🟡 Ongoing |
| 4 | Resolve at-risk projects (Warlord-Crafting-Suite, PuterGrudge) | ⏳ Pending | 🔴 High |
| 5 | TypeScript definitions (`types/index.d.ts`) | ⏳ Pending | 🟡 Medium |
| 6 | NPM package publication (`@grudgstudio/core`) | ⏳ Pending | 🟡 Medium |
| 7 | Auto-generate missing item icons (Puter AI) | ⏳ Pending | 🟢 Low |

---

## 4) Technical Inventory

### Key Files

| File | Role | Status |
|------|------|--------|
| `package.json` | NPM package config (`@grudgstudio/core` v2.2.0) | ✅ Active |
| `README.md` | Public-facing project overview | ✅ Active |
| `WIKI-HOME.md` | GitHub wiki home page | ✅ Active — needs updates |
| `INTEGRATION-GUIDE.md` | Full cross-platform integration guide | ✅ Active |
| `WIKI-DEPLOYMENT.md` | Deployment guide (GitHub Pages + NPM) | ✅ Active |
| `CHANGELOG.md` | Version history | ✅ Active |
| `scripts/puter-audit.mjs` | Runnable Puter governance audit script | ✅ Active |
| `docs/PUTER-AUDIT-INTEGRATION.md` | Puter audit standard and governance doc | ✅ Active |
| `docs/puter-integration-inventory.json` | Portfolio inventory (all Grudge apps/sites) | ✅ Active — update when projects change |
| `docs/reports/puter-audit-report.json` | Latest audit baseline | ✅ Active — regenerate with `npm run audit:puter:save` |
| `docs/reports/puter-remediation-plan-2026-02-28.md` | Remediation plan for at-risk projects | ✅ Active |
| `docs/reports/puter-remediation-checklist.json` | Machine-readable remediation checklist | ✅ Active |
| `integrations/grudge-studio-core.js` | Main JS/TS API client | ✅ Active |
| `integrations/warlord-crafting-suite-integration.tsx` | React component for Arsenal tab | ✅ Active |
| `integrations/GrudgeWarlords-Unity-Integration.cs` | Unity C# MonoBehaviour | ✅ Active |
| `sdk/grudge-sdk.js` | Legacy SDK (backward compat) | ✅ Maintained |
| `utils/item-registry.js` | Item registry (single source of truth) | ✅ Active |
| `utils/image-generator.js` | Puter.js AI image generation | ✅ Active |
| `types/index.d.ts` | TypeScript definitions | ⏳ Incomplete |
| `api/v1/*.json` | Static game data served by GitHub Pages | ✅ Active |
| `css/tier-system.css` | T1–T8 visual tier styling | ✅ Active |

### NPM Scripts

```bash
npm run audit:puter           # Run Puter audit (stdout only)
npm run audit:puter:save      # Run Puter audit and save to docs/reports/puter-audit-report.json
npm run build                 # No-op (pure ES modules)
npm test                      # Placeholder
```

---

## 5) Codebase Status

### API Data (`api/v1/`)

- **Weapons**: 816 items (17 categories × 6 items × 8 tiers)
- **Materials**: 98 items (ore, wood, cloth, leather, gems, essence)
- **Armor**: 11 slots across 4 armor types
- **Consumables**: 132 items (food, potions, engineer items)
- **Skills**: 47 skills across weapon types
- **Sprites**: 4000+ icons
- **Races**: 6 playable races
- **Classes**: 4 classes
- **Factions**: 3 factions
- **Attributes**: 8 attributes

### Puter Audit Baseline (2026-02-28)

| Project | Score | Risk |
|---------|-------|------|
| ObjectStore | 100 | production-ready |
| GrudgeWarlords | 85 | minor-gaps |
| Warlord-Crafting-Suite | 55 | **at-risk** |
| PuterGrudge | 50 | **at-risk** |

Portfolio average: **73** (target: ≥ 85)

### GRUDGE UUID Format

```
{PREFIX}-{TIMESTAMP}-{SEQUENCE}-{HASH}
```

Example: `ITEM-20260225120000-000001-A1B2C3D4`

16 entity prefixes: `HERO`, `ITEM`, `EQIP`, `ABIL`, `MATL`, `RECP`, `NODE`, `MOBS`, `BOSS`, `MISS`, `INFU`, `LOOT`, `CONS`, `QUST`, `ZONE`, `SAVE`

---

## 6) Active Remediation: At-Risk Projects

### Warlord-Crafting-Suite (Score 55 → target ≥ 85)

**Due**: 2026-03-03

- [ ] Fix production URL (currently returns HTTP 404)
- [ ] Restore Vercel deployment; confirm HTTP 200
- [ ] Add `/api/status` health endpoint
- [ ] Re-run: `npm run audit:puter:save` and verify score ≥ 85

### PuterGrudge (Score 50 → target ≥ 80)

**Due**: 2026-03-05

- [ ] Validate canonical public URL; update `docs/puter-integration-inventory.json`
- [ ] Confirm canonical URL returns HTTP 200
- [ ] Commit integration module at `server/grudge-integration.js`
- [ ] Add `statusUrl` in inventory
- [ ] Re-run: `npm run audit:puter:save` and verify score ≥ 80

---

## 7) Ecosystem Map

All Grudge Studio projects that integrate (or will integrate) ObjectStore:

| Project | Type | Integration Priority |
|---------|------|---------------------|
| ObjectStore | API/Core | — (this repo) |
| Warlord-Crafting-Suite | React/TS Web App | 🔴 High |
| GrudgeWarlords | Unity WebGL | 🔴 High |
| GrudgeStudioNPM | NPM Package | 🔴 High |
| grudge-warlords (voxel) | TypeScript RPG | 🟡 Medium |
| GrudgeGameIslands | WebGL | 🟡 Medium |
| grudge-angeler | Fishing Game | 🟡 Medium |
| PuterGrudge | Backend/AI | 🟡 Medium |
| TheForge | Crafting UI | 🟡 Medium |
| GrudgeController | 3D Controller | 🟢 Low |
| grudge-match-webgl | Match WebGL | 🟢 Low |
| nexus-webgl | Unity WebGL | 🟢 Low |
| Grudge-Realms | C++ Game | 🟢 Low |
| grudge-warlords-rts | Java RTS | 🟢 Low |
| GrudgeGame | ASP.NET | 🟢 Low |

---

## 8) Continuation Plan

When starting a new agent session on this repository, execute in this order:

1. **Read** this file (`AGENT-CONTEXT.md`) first.
2. **Run** `npm run audit:puter` to check current portfolio health.
3. **Continue** with the highest-priority pending task in Section 3 above.
4. **Update** this file before ending the session:
   - Mark completed tasks ✅
   - Add any new tasks discovered
   - Update the "Last Updated" date at the top

### Session Checklist Template

```markdown
## Session — YYYY-MM-DD

### Completed
- [ ] ...

### Discovered
- [ ] ...

### Carry Forward
- [ ] ...
```

---

## 9) Design Constraints

- **No authentication required** on the public API (GitHub Pages)
- **Pure ES modules** — no build step for `@grudgstudio/core`
- **Node ≥ 18** required for `puter-audit.mjs` (uses `fetch` natively)
- **No hardcoded secrets** — env vars documented in `docs/PUTER-AUDIT-INTEGRATION.md`
- **Backward compatibility** — `sdk/grudge-sdk.js` must remain functional

---

## 10) Agent Guidelines

- Follow existing code style (2-space indent, JSDoc for functions, ES module syntax).
- When adding a new Grudge Studio project to the portfolio, add it to `docs/puter-integration-inventory.json` and re-run the audit.
- When adding new API endpoints, update both `README.md` and `WIKI-HOME.md`.
- Commit messages follow: `<type>: <short description>` (e.g. `feat:`, `fix:`, `docs:`, `chore:`).
- Co-author commits with: `Co-Authored-By: Oz <oz-agent@warp.dev>`.

---

**Maintained by**: Grudge Studio Team + Oz `<oz-agent@warp.dev>`

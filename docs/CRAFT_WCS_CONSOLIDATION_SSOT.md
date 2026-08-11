# Craft · WCS · Main Panel consolidation SSOT

**Updated:** 2026-08-10

## One product, three hosts

| Host | Role | Status |
|------|------|--------|
| **`grudgewarlords.com/craft/`** | **Full suite SSOT** — stations, benches, bag, XP, arsenal | Live product |
| **`ui.grudge-studio.com/main-panel.html?era=warlords&tab=craft`** | **HUD craft tab SSOT** — native recipes, no iframe | Live product |
| **`wcs.grudge-studio.com`** | **Brand hub** — routes to suite + panel | Fix: deploy `grudge-wcs/pages-wcs` |
| `info.grudge-studio.com/main-panel.html` | Legacy mirror of main panel | Native craft tab (no Puter iframe) |
| `grudge-crafting.puter.site` | Legacy redirect only | Not player SSOT |

## Hard rules

1. **Never iframe** `grudgewarlords.com/craft` into main-panel (`X-Frame-Options: SAMEORIGIN`).
2. **Full suite** = new tab / pop-out only.
3. **Account bag** (Railway) shared · **profession XP** on active character UUID.
4. **Do not** deploy Betta Warlords SPA to `wcs.grudge-studio.com`.
5. **Do not** invent a third craft bag database.

## Deploy

```bash
# WCS hub (Cloudflare Pages project grudge-wcs)
cd F:\GitHub\grudge-wcs
npx wrangler pages deploy pages-wcs --project-name=grudge-wcs

# Full suite (GrudgeBuilder / Vercel grudge-builder)
# ships client/public/craft/

# UI main-panel (grudge-ui-editor → ui.grudge-studio.com)
# ObjectStore info main-panel: deploy ObjectStore Pages/Vercel
```

## Smoke

1. `https://wcs.grudge-studio.com/` — hub CTAs work  
2. `https://wcs.grudge-studio.com/?go=suite` → craft suite  
3. `https://wcs.grudge-studio.com/craft` → 302 suite  
4. `https://grudgewarlords.com/craft/` — recipes load guest  
5. `https://ui.grudge-studio.com/main-panel.html?era=warlords&tab=craft` — native grid  
6. `https://info.grudge-studio.com/main-panel.html` → Crafting tab — **no empty iframe**

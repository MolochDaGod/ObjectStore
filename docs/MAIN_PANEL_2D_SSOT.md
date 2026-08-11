# Main Panel 2D SSOT (info.grudge-studio.com)

**Live:** https://info.grudge-studio.com/main-panel.html  
**Repo:** `MolochDaGod/ObjectStore`  
**Related host:** `ui.grudge-studio.com/main-panel.html` (era paperdoll + craft **embed** SSOT)  
**Craft product:** https://grudgewarlords.com/craft/ (Railway bag — never Puter KV alone)

## Stack (do not invent parallel UI)

| Layer | File / URL |
|-------|------------|
| Fonts | `css/grudge-game-fonts.css` (fontsource woff2, no Google Fonts) |
| 2D chrome | `css/main-panel-2d.css` |
| Theme tokens | `css/grudge-theme.css` |
| Scroll containers | `css/ui-scroll-container.css` + `ui/scroll/*` + `#mainScroll` **one** parchment |
| Design scale + 2D canvas | `js/main-panel-canvas-2d.js` (HYDRA-width stage · drag ghost) |
| i18n pack | `api/v1/main-panel-locales.json` |
| i18n runtime | `js/main-panel-i18n.js` |
| 2D bootstrap | `js/main-panel-2d.js` |
| Menu / slots art | CraftPix via `ui.grudge-studio.com/assets/craftpix/**` |
| Local panel art | `ui/packs/gold/panels.png` |
| RPG CSS skin | `assets.grudge-studio.com/ui/craftpix-rpg/craftpix-rpg-ui.css` |

## Containers · scale · canvas (2026-08)

| Rule | Value |
|------|--------|
| Design width | **1440px** stage (`#mpStageInner`) **contain-fit** to viewport |
| Scale range | 0.42–1.25 (`--mp-ui-scale`) — full UI always fits screen |
| Scroll usage | **One** World Map scroll opens on boot; tab change = `snapOpen` + content fade only |
| Interior well | **Dark** panels (`main-panel-readable.css`) — parchment is frame only |
| Text | High-contrast `--text` `#f3ece0` / `--muted` `#c9bda8` / gold titles |
| Borders | Hard 2px gold edges on tabs, cards, slots, columns |
| Content scroll | `#contentArea` + `.inv-grid` + `.left-col` independent |
| 2D canvas | `#mp2dCanvas` — item drag ghost + click pulse (not Three.js) |
| Hero 3D | `#hero-viewport` remains WebGL (separate) |
| Debug scale chip | `?scaleChip=1` or `localStorage grudge.mp.showScale=1` |
| Readability CSS | `css/main-panel-readable.css` (must load after main-panel-2d.css) |

## Craft tab wire (must match ui host)

| Rule | Value |
|------|--------|
| Suite URL | `https://grudgewarlords.com/craft/?embed=1&from=info-main-panel` |
| SSO | query `sso_token` + `postMessage` `GRUDGE_AUTH` |
| Pop-out | always available |
| Bag | Railway account (suite authority) |
| Not SSOT | Puter craft host, local demo bag for production claims |

Systems matrix: `api/v1/fleet-systems-matrix.json`

## npm / 2D best practices

1. **Self-host fonts** — `font-display: swap`, woff2 only, latin unicode-range.  
2. **Preload critical images** only (slot bg, window, action-bar) — not whole craftpix tree.  
3. **Animate transform/opacity** — not width/top/left.  
4. **`prefers-reduced-motion`** disables atmos / glow / enter animations.  
5. **Pixel icons** — `image-rendering: pixelated` on inventory / equip / hotbar.  
6. **Hit targets** ≥ 44 CSS px on mobile hotbar.  
7. **Locale packages** as JSON under `api/v1/` (cacheable CDN JSON headers).  
8. **Exports** — package.json `./ui/2d` points at bootstrap + fonts for fleet reuse.

## Language packages

| Code | Native |
|------|--------|
| en | English |
| es | Español |
| fr | Français |
| de | Deutsch |
| pt | Português |
| ja | 日本語 |

- Persist: `localStorage grudge.main-panel.locale`  
- Query: `?lang=es` or `?locale=fr`  
- Events: `grudge:main-panel:locale`, `grudge:main-panel:2d-ready`

## Graphics / “AI” atmosphere

Production uses **existing** CraftPix + gold pack textures + CSS radial mist (no generative images in the request path).  
Decorative motion: equip glow, tab underline, content fade-up, viewport idle rim.

## Anti-patterns

- ❌ Google Fonts runtime on production game UI  
- ❌ Iframe `grudgewarlords.com/craft` (X-Frame-Options)  
- ❌ Emoji as production item art when ObjectStore icons exist  
- ❌ New second main-panel SPA  
- ❌ Nested scroll-shell parchment inside left/right columns (one canvas only)  
- ❌ Re-playing Appear animation on every tab switch  

## Deploy + dependencies

| Dep | Role | Host |
|-----|------|------|
| `ui-scroll-container.js` | Parchment appear/open | same-origin `/js` + `/ui/scroll/*` |
| `main-panel-canvas-2d.js` | Fluid stage + 2D drag canvas | same-origin |
| `main-panel-readable.css` | Dark readable wells | same-origin |
| CraftPix slot PNGs | Slot chrome | `ui.grudge-studio.com/assets/craftpix/**` |
| CraftPix RPG CSS | Optional skin | `assets.grudge-studio.com/ui/craftpix-rpg/**` |
| grudge6 kits | Hero viewport | `assets.grudge-studio.com/asset-packs/toon-rts-characters/**` |
| Catalogs | Items / gear | `info…/api/v1` + objectstore mirror |

**Hard rules for redeploy**

1. Push `ObjectStore` `main` → Vercel project for **info.grudge-studio.com**.  
2. Smoke **live** (not localhost): open + hard refresh.  
3. Confirm `#mainScroll.is-open` and content fills viewport (no mid cut).  
4. Scroll frames under `/ui/scroll/` must ship with Pages (404 → snapOpen still shows UI).  

```bash
cd F:\GitHub\ObjectStore
git push origin main
# After Vercel:
curl.exe -sI https://info.grudge-studio.com/main-panel.html
curl.exe -sI https://info.grudge-studio.com/js/main-panel-canvas-2d.js
curl.exe -sI https://info.grudge-studio.com/css/main-panel-readable.css
curl.exe -sI https://info.grudge-studio.com/ui/scroll/open.png
# Browser: https://info.grudge-studio.com/main-panel.html  (Ctrl+F5)
```

**Anti-pattern fixed (2026-08):** design-width `transform: scale()` on `#mpStageInner` kept full layout box → `overflow:hidden` **cut the panel mid-screen**. Fluid flex fill is SSOT now.

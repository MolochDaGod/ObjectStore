# Main Panel 2D SSOT (info.grudge-studio.com)

**Live:** https://info.grudge-studio.com/main-panel.html  
**Repo:** `MolochDaGod/ObjectStore`  
**Related host:** `ui.grudge-studio.com/main-panel.html` (era paperdoll + craft SSOT)

## Stack (do not invent parallel UI)

| Layer | File / URL |
|-------|------------|
| Fonts | `css/grudge-game-fonts.css` (fontsource woff2, no Google Fonts) |
| 2D chrome | `css/main-panel-2d.css` |
| Theme tokens | `css/grudge-theme.css` |
| Scroll containers | `css/ui-scroll-container.css` + `ui/scroll/*` |
| i18n pack | `api/v1/main-panel-locales.json` |
| i18n runtime | `js/main-panel-i18n.js` |
| 2D bootstrap | `js/main-panel-2d.js` |
| Menu / slots art | CraftPix via `ui.grudge-studio.com/assets/craftpix/**` |
| Local panel art | `ui/packs/gold/panels.png` |
| RPG CSS skin | `assets.grudge-studio.com/ui/craftpix-rpg/craftpix-rpg-ui.css` |

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

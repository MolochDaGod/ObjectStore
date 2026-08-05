# UI Scroll Container SSOT

**Pack:** Humble Gift — World Map Scroll v1.0 (Appear / Disappear)  
**Author disk:** `D:\Games\Models\gge\Humbl33e Gift - World Map Scroll v1.0\…\World Map\`  
**Shipped:** `ObjectStore/ui/scroll/` · live `info.grudge-studio.com/ui/scroll/`  
**CDN target:** `assets.grudge-studio.com/ui/scroll/` (upload when promoting binaries)

Do **not** invent a second panel open/close chrome. Extend this pack + module.

---

## What we learned from Appear / Disappear

| Frame range | Visual | UX meaning |
|-------------|--------|------------|
| Appear 0 | Two brass rods tight | Panel **closed** / not ready |
| Appear 1–4 | Parchment peeks | Anticipation — keep content hidden |
| Appear 5–8 | Expanding scroll | Load-heavy work can finish here |
| Appear 9–10 | Full open + corner ornaments | **Steady open** — show content |
| Disappear 0 | Full open | Start dismiss |
| Disappear → 10 | Rods meet | **Closed** — unmount or hide |

**Timing:** 11 frames × ~14 fps ≈ **0.8 s** open/close.  
**Frame size:** 784×688 (scale with `background-size` / `object-fit: fill`).

**Production UX rules**

1. Play sequences **once** — never loop.  
2. Reveal content at **~70%** of appear (snappy) or after last frame (strict).  
3. Honor `prefers-reduced-motion` → snap to open/closed.  
4. Steady state uses **`open.png`** (copy of appear/10), not a looping GIF.  
5. Pad content for rod gutters (~8–12% width each side).  
6. 3D hero viewports stay **dark** inside parchment for contrast.

---

## Code SSOT

| File | Role |
|------|------|
| `js/ui-scroll-container.js` | mount / open / close / preload |
| `css/ui-scroll-container.css` | parchment tokens, fonts, shell |
| `ui/scroll/manifest.json` | frame list + paths |
| `main-panel.html` | first consumer (center + inventory) |

### Minimal embed (any game)

```html
<link rel="stylesheet" href="/css/ui-scroll-container.css" />
<link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;700&family=IM+Fell+English:ital@0;1&family=JetBrains+Mono&display=swap" rel="stylesheet" />

<div id="panel" style="width:min(720px,96vw);height:min(640px,80vh)">
  <!-- your UI -->
</div>
<script type="module">
  import { mountScrollContainer, preloadScrollFrames } from '/js/ui-scroll-container.js';
  await preloadScrollFrames();
  const api = mountScrollContainer(document.getElementById('panel'), { autoOpen: true });
  // later: await api.close();
</script>
```

### API

```js
const api = mountScrollContainer(host, {
  base: '/ui/scroll',      // or CDN
  autoOpen: true,
  compact: false,          // tighter padding for side rails
  fps: 14,
  contentRevealAt: 0.72,
});
await api.open();
await api.close();
api.snapOpen();            // tab re-render without anim
api.preload();
```

Events: `scroll:open`, `scroll:close` on the host (bubble).

---

## Fonts (fantasy RPG, no npm)

| Token | Family | Use |
|-------|--------|-----|
| `--font-fantasy-display` | Cinzel Decorative | Titles, logo |
| `--font-fantasy-heading` | Cinzel | Tabs, section labels |
| `--font-fantasy-body` | IM Fell English | Body on parchment |
| `--font-fantasy-mono` | JetBrains Mono | Stats, UUIDs |

Loaded via Google Fonts CDN (same pattern as existing `grudge-theme.css`).

---

## Production dependencies (frontend UX)

| Need | Choice | Why |
|------|--------|-----|
| Panel chrome | **This pack + vanilla JS** | Zero runtime deps; works on CF Pages |
| Motion | CSS + rAF-free frame list | Deterministic; reduced-motion safe |
| HUD icons / hotbar | CraftPix skill (`craftpix-rpg-mmo-ui`) | Separate SSOT — do not replace with scroll art |
| Layout design | ui.grudge-studio.com HYDRA | Absolute 1920×1080 handoff |
| Optional SPA | React only if host already has it | Import the same module; no React wrapper required |

**Forbidden:** inventing Lottie/CSS-only fake scrolls that diverge from these frames; Meshy placeholders; second “panel v2” folder.

---

## Deploy

1. Frames live in repo under `ui/scroll/` (Pages).  
2. Promote binaries to R2: `assets.grudge-studio.com/ui/scroll/{appear,disappear,open,closed}.png`.  
3. Cross-app games set `base: SCROLL_BASE_CDN` when not on info.*.  
4. Smoke: open main-panel → center + inventory play appear once; tab switch uses `snapOpen` or soft re-open.

---

## Related

- Skill `craftpix-rpg-mmo-ui` — MMO HUD textures  
- `css/grudge-theme.css` — fleet gold/obsidian tokens  
- Character paperdoll: `js/main-panel-hero-viewport.js` (inside scroll content)

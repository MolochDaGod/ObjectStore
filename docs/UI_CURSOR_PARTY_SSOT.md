# Cursor + Party / Crew / Camp UI SSOT

Two author packs → one fleet system each. Do **not** invent alternate cursor or party chrome.

| Pack | Disk | Shipped | Code |
|------|------|---------|------|
| **Kenney Cursor Pack 1.1** (CC0) | `D:\Games\Models\kenney_cursor-pack.zip` | `/ui/cursors/{basic,outline}/` | `js/ui-cursor.js` · `css/ui-cursor.css` |
| **Humble Player UI v1.1** | `D:\Games\Models\gge\Humble Gift - Player UI\…` | `/ui/player/sheet/` · slices | Party strip art cues |
| **Smart UI** (companion holders) | `D:\Games\Models\gge\Humble 43Gift - Smart UI\…` | `/ui/player/smart/` | Slot frames / buttons |
| **World Map Scroll** | (existing) | `/ui/scroll/` | Panel open/close for equipment |

---

## 1. What we learned — Kenney cursors

- **182** icons × **Basic** + **Outline** (Default size).
- Families: pointers, hands/gauntlets, tools (sword/axe/pick/wand/bow), targets, busy (hourglass/circle), doors, resize/rotate, zoom, talk bubbles, nav arrows.
- **Outline** reads better on dark Grudge UIs; **Basic** on light parchment.
- Production pattern: `cursor: url(png) hotspotX hotspotY, systemFallback` via `setCursorIntent(intent)`.
- Intents are **semantic** (`attack`, `harvest`, `party_select`) — never hardcode file names in games.

### Intent map (short)

| Context | Intent | Asset |
|---------|--------|--------|
| Default UI | `default` | pointer_b |
| Enemy hover | `attack` | tool_sword_a |
| Resource | `harvest` / `mine` | tool_axe / pickaxe |
| NPC | `talk` | message_round |
| Aim | `target` | target_a |
| Loading | `busy` | busy_hourglass |
| Party slot | `party_select` | pointer_c |
| Radial open | `command` | cursor_menu |
| Paperdoll drag | `hand_closed` | hand_closed |

```js
import { configureCursors, preloadCursors, setCursorIntent, bindCursorContext } from '/js/ui-cursor.js';
configureCursors({ variant: 'outline' });
await preloadCursors();
setCursorIntent('default');
bindCursorContext(document.body); // uses [data-cursor]
```

---

## 2. What we learned — Player UI (animated systems)

Author delivers **Aseprite** sources + one **2864×672** spritesheet:

| Aseprite | Runtime meaning |
|----------|-----------------|
| Idle Animated | Portrait / status pulse |
| Player Inventory Bar | Hotbar / bag open-close |
| Dialogue System | Talk frames for allies |
| Pause Menu | Pause transition |
| SpriteSheet | HUD cluster, chevrons, load rings, nav |

**Companion Smart UI holders** (sliced PNGs) give real party chrome:

| File | Size | Use |
|------|------|-----|
| holders/6.png | 112×128 | Default party slot frame |
| holders/5.png | 112×240 | Tall unit card |
| holders/20.png | 80×80 | Portrait circle |
| holders/1–4 | bars/plates | Nameplates / HP tracks |
| buttons/* | 16×16+ | Radial wedge icons |

### Party model (kinds)

`self` · `crew` · `ally` · `camp` · `party` — **same slot widget**, rim color differs.

### Radial commands → existing panels

| Wedge | → |
|-------|---|
| Inspect | main-panel **Attributes** |
| Gear | main-panel **Equipment** (+ unit loadout context) |
| Skills | main-panel **Skills** |
| Orders | command event (follow/hold/defend) — no new panel |
| Follow | action event |
| Camp | main-panel **Professions** / camp roster |
| Bag | inventory focus |

**Hard rule:** radial only **routes** to main-panel tabs + scroll containers. No second equipment UI.

### Open radial

- **Right-click** party slot  
- Optional: hold **Q** over member (game host)

### Unit context

`sessionStorage.grudge_active_unit` + `party:unit` / `party:command` events.  
Main panel banner shows whose sheet is open; clear returns to self.

---

## 3. Code SSOT

| File | Role |
|------|------|
| `js/ui-cursor.js` | intents, preload, bind |
| `css/ui-cursor.css` | data-cursor helpers |
| `js/ui-party-radial.js` | strip + radial + active unit |
| `css/ui-party.css` | strip + radial styles |
| `ui/cursors/manifest.json` | intent SSOT |
| `ui/player/manifest.json` | party/radial SSOT |
| `js/ui-scroll-container.js` | panel open chrome |
| `main-panel.html` | first consumer |

### Minimal party embed

```html
<link rel="stylesheet" href="/css/ui-party.css" />
<link rel="stylesheet" href="/css/ui-cursor.css" />
<div id="party"></div>
<script type="module">
  import { mountPartyStrip, demoPartyUnits } from '/js/ui-party-radial.js';
  import { preloadCursors, configureCursors } from '/js/ui-cursor.js';
  configureCursors({ variant: 'outline' });
  await preloadCursors();
  mountPartyStrip(document.getElementById('party'), {
    units: demoPartyUnits(),
    onCommand: ({ unit, command }) => console.log(unit.name, command.id),
  });
</script>
```

---

## 4. Production deps

| Need | Choice |
|------|--------|
| Cursors | PNG + CSS `cursor:url` — **no** npm |
| Party strip / radial | Vanilla JS module |
| Panel chrome | Scroll container SSOT |
| Portraits | Existing race portraits CDN / Foundry |
| Optional SPA | Import same modules |

**Forbidden:** second cursor pack, Meshy party frames, parallel “party panel v2” that reimplements equipment.

---

## 5. Deploy

1. Repo ships `/ui/cursors` + `/ui/player` on info Pages.  
2. Promote to R2: `assets.grudge-studio.com/ui/cursors|player`.  
3. Smoke: main-panel party strip → right-click → Gear → Equipment tab + unit banner.

---

## Related

- `docs/UI_SCROLL_CONTAINER_SSOT.md` — parchment open/close  
- Skill `craftpix-rpg-mmo-ui` — full MMO HUD (hotbar/minimap) — complementary, not replace  
- `grudge-character-correctness` — 3D paperdoll inside equipment panel  

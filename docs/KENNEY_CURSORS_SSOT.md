# Kenney Cursor Pack SSOT (Main Panel + fleet)

**License:** CC0 — Kenney (kenney.nl)  
**Author source:** `Desktop/grudgeproduction/icons/sloticons/kenney_cursor-pack (1)/PNG/Basic/Default`  
**Shipped:** `/ui/cursors/basic/` · `/ui/cursors/outline/`  
**Code:** `js/ui-cursor.js` · `css/ui-cursor.css` · `ui/cursors/manifest.json`  
**Live:** https://info.grudge-studio.com/main-panel.html  

---

## Why which file

| Intent | Kenney file | Reason |
|--------|-------------|--------|
| `default` | `pointer_b` | Standard tip — idle UI |
| `pointer` | `pointer_b` | Buttons / chips |
| `tab` / `menu` | `cursor_menu` | Tab strip / overflow menus |
| `bag_item` | `hand_point` | Filled inventory — pick / RMB |
| `bag_empty` | `hand_open` | Empty slot — drop target |
| `bag_drag` | `hand_closed` | Grabbing a stack |
| `equip_filled` | `gauntlet_point` | Worn gear on paperdoll |
| `equip_empty` | `gauntlet_open` | Empty equip slot |
| `orbit` | `hand_open` | Hero viewport free look |
| `orbit_drag` | `hand_closed` | Drag-orbit camera |
| `busy` | `busy_hourglass` | Catalog / network wait |
| `disabled` | `cursor_disabled` | Not allowed |
| `craft` / `recipe` | `tool_wrench` | Crafting suite |
| `mine` | `tool_pickaxe` | Ore / stone |
| `harvest` | `tool_axe` | Wood / plant |
| `magic` | `tool_wand` | Staff / spell UI |
| `attack` | `tool_sword_a` | Hostile / combat |
| `talk` | `message_round` | Dialogue |
| `inspect` | `zoom` | Examine stats |
| `party_select` | `pointer_c` | Ally strip |
| `deposit` | `cursor_copy` | Move to account bag |
| `alias` | `cursor_alias` | External fleet link |
| `help` | `cursor_help` | Help affordance |

---

## Variant choice

| Surface | Variant | Why |
|---------|---------|-----|
| Main Panel (dark navy wells) | **`outline`** | White outline reads on dark chrome |
| Light parchment / paper maps | **`basic`** | Kenney Basic/Default fills match light art |
| World Warlords sea (casting) | pirate pack or outline tools | Product theme — not Kenney Basic default |

```js
import { configureCursors, bindCursorContext } from './ui-cursor.js';
configureCursors({ variant: 'outline' }); // Main Panel
// configureCursors({ variant: 'basic' }); // light parchment only
```

---

## Wiring

1. `data-cursor="bag_item"` on elements (optional — class resolver covers most).  
2. `bindCursorContext(document.body)` + `resolveMainPanelCursor`.  
3. Drag: `setCursorIntent('bag_drag')` / `orbit_drag`.  
4. Do **not** invent a second cursor pack.

---

## Sync from Desktop

```powershell
# Optional refresh from author pack (Basic/Default → basic/)
$src = "C:\Users\nugye\Desktop\grudgeproduction\icons\sloticons\kenney_cursor-pack (1)\PNG\Basic\Default"
$dst = "F:\GitHub\ObjectStore\ui\cursors\basic"
Copy-Item "$src\*.png" $dst -Force
```

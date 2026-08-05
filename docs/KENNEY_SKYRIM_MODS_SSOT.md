# Kenney Skyrim Mods — fleet merge SSOT

**Upstream:** https://github.com/KenneyNL/Skyrim-Mods.git  
**Author clone:** `D:\Games\Models\KenneyNL-Skyrim-Mods`  
**Web slice:** `ObjectStore/ui/kenney-skyrim/` (previews + settings + catalog)  
**License:** **CC-BY 3.0** (credit Kenney) — *not* CC0 like Cursor Pack / RPG Audio

## What this repo actually is

Kenney’s **Skyrim Scaleform UI mod archive** (mostly `.swf` + install notes + previews):

| Mod | Files | Browser game use? |
|-----|-------|-------------------|
| Alternative Cursors | SWF cursors + settings | **Style only** — runtime = PNG Cursor Pack |
| Navi cursor | SWF | Style only |
| Item Icons | SWF inventory/craft | Style / extract if needed |
| Lockpick Pro (+ SE) | SWF + settings | Pattern for lockpick minigame UI |
| Loading Game / Time On Loading / UI Overhaul | SWF | Loading-screen layout language |
| Skip Bethesda Intro | `.bik` | **No** — Skyrim engine only |

There are **no GLB/FBX meshes** here for Forge 3D or grudge6.

## Perfect merge (do / do not)

### DO

1. Keep full git clone on author disk for SWF recovery.  
2. Ship **previews + settings + catalog** on Pages (`/ui/kenney-skyrim/`).  
3. Agents: load `catalog.json` for fantasy UI style references.  
4. Runtime cursors: continue **`/ui/cursors`** (Kenney Cursor Pack CC0 PNGs) + `js/ui-cursor.js`.  
5. Inventory icons: continue Desktop/CDN **icons pack** + master-items — use Item Icons preview as art direction only.  
6. Forge: optional moodboard textures from `previews/*`; never “import SWF as prop”.  
7. Attribution in credits: *UI inspiration / archive materials © Kenney (CC-BY 3.0)*.

### DO NOT

1. ❌ Treat SWF as production Three.js UI.  
2. ❌ Register SWF in D1 as playable mesh assets.  
3. ❌ Replace CraftPix / scroll / party SSOT with Skyrim SWF.  
4. ❌ Upload BIK intro to R2 as game content.  
5. ❌ Invent a second cursor system — extend `ui-cursor` intents only.  
6. ❌ Re-host on Nexus (upstream request).

## Agentic understanding

| Intent | Resolve |
|--------|---------|
| “Skyrim-style cursor” | Show Alternative Cursors **preview**; implement with `ui/cursors` + intent |
| “Kenney inventory icons” | Item Icons **preview** + existing `icons/pack` / master-items |
| “Lockpick UI” | Lockpick Pro **preview + settings** → design HTML/CSS minigame; no SWF |
| “Loading screen like Skyrim” | Loading / Time On Loading previews → SPA loading shell |
| “Import Kenney Skyrim into Forge” | Moodboard PNGs only |

Skill: `kenney-skyrim-mods` (user skills).  
Catalog: `ui/kenney-skyrim/catalog.json`.

## Asset database / CDN

| Layer | Path |
|-------|------|
| Author | `D:\Games\Models\KenneyNL-Skyrim-Mods` |
| ObjectStore (indexable) | `ui/kenney-skyrim/**` |
| R2 (optional promote) | `ui/kenney-skyrim/previews/*` |
| D1 | optional **index row** pointing at catalog — binaries stay R2/Pages |

## Related SSOT

| System | Path |
|--------|------|
| Runtime cursors | `ui/cursors` · `js/ui-cursor.js` · `docs/UI_CURSOR_PARTY_SSOT.md` |
| Party / radial | `js/ui-party-radial.js` |
| Scroll panels | `ui/scroll` · `js/ui-scroll-container.js` |
| MMO HUD | skill `craftpix-rpg-mmo-ui` |
| Kenney audio | skill `kenney-audio` (CC0 — different pack) |
| Forge | skill `forge-editor` — 2D ref textures only |

## Extracting SWF icons later (optional)

If individual inventory icons are required:

1. Open `Item Icons/Files/Interface/inventory components/inventorylists.swf` in **JPEXS Free Flash Decompiler**.  
2. Export PNG sequences.  
3. Normalize to pack basenames under `icons/pack/…`.  
4. Rebind master-items — do not leave SWF in the runtime path.

Until then: **previews + catalog only**.

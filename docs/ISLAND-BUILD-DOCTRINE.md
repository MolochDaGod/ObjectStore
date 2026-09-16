# Island Build Doctrine — Warlords production SSOT

**Updated:** 2026-09-16  
**Machine JSON:** [`/api/v1/island-build-doctrine.json`](../api/v1/island-build-doctrine.json) · [`/api/v1/buildable-prefabs.json`](../api/v1/buildable-prefabs.json) · [`/api/v1/faction-kits.json`](../api/v1/faction-kits.json) · [`/api/v1/npc-roster.json`](../api/v1/npc-roster.json)  
**Live client REST:** `/api/v1/production` · `/api/v1/blueprints` · `/api/v1/assets/buildable`  
**Related:** [WARLORDS-PRODUCTION-SSOT.md](./WARLORDS-PRODUCTION-SSOT.md) · [home-island-contract.json](../api/v1/home-island-contract.json) · [biome-ecosystems.json](../api/v1/biome-ecosystems.json)

This is the **canonical island, NPC, and buildable-asset contract** that the Warlords play client executes. Definitions live in ObjectStore. Binaries live on R2. Player island seed lives on Railway `home_islands`.

---

## 1. Scale (do not mix)

| Measure | Value | Authority |
|---------|-------|-----------|
| Home-island world diameter | **1024 m** | `home-island-contract.json` |
| RTS core (upsampled into the 1024 m center) | 200 m | same |
| Prop-scale human (buildings, doors, gates) | **2.0 m** | same |
| GOLDEN grudge6 kit plant height | **1.8 m** | `grudge6-canonical.json` · meter-grid `CHAR_HEIGHT_M` |
| Character radius | 0.32 m | meter-grid |
| Gate opening | **1.6 × 3.2 m** | admits 1.8 m kit and 2.0 m reference |
| Invisible occupy grid | **1 m × 1 m** | `GRID_M` |
| Mountain peak | 20 m | home-island-contract |
| Harvest regen | **4 hours** | `biome-ecosystems.json` |

Never stretch race kits to 2.0 m. Gate and door clearances already admit both numbers.

Sector islands (harbor 480 m · province 2400 m · greater 2880 m · nexus 4800 m) use the **same 1 m occupy grid** and the same prefab size law. Only the landmass scale changes.

---

## 2. Size law (buildings)

| Class | Footprint | Use |
|-------|-----------|-----|
| Civic (keep / barracks / inn) | 8×6 m | Plaza, inside the curtain |
| Small building | **4×4 m** | House, tent, shop, 4×4 RTS |
| RTS medium | **6×4 m** | Barn, stable, smithy, brewery |
| Tower | 4×4 m | Corner + outpost |
| Ribbon (wall / fence / gate) | **2×1 m** | Weld on X. Isolate `nodeName`. |
| Bench | **0.5×1 m** | Shares the leftover 1×1 with chairs / chests |
| Floor misc | 1×1 shared | Chair, chest, barrel, crate, table |
| Surface | 0.25 m snap | Bottle, pot, bucket, candle sit on a host |
| Crop | 2×2 m | Wheat, hay, carrot |
| Dock / pier | 4×2 m | Float Y = water + 0.2 |

Layers never mix: **ground exclusive** · **floor shares a 1×1** · **surface sits on hostTopM**.

---

## 3. Build layers (never mix)

| Layer | Where | Effect |
|-------|-------|--------|
| Quick craft | Main Panel / HUD 0 | No world prop |
| Camp | Tent / fire / bedroll | Survival nodes |
| Bench | Profession stations | XP 1–100 · UI per bench |
| Modular | Snap wood housing | 4×4 homes **outside** the fence |
| Dock | Waterline | Ship + **crew train** (Sailor / Weatherman / Gunner) |
| RTS | UFRTS / barracks / farm | Train AI → promote hero |
| Race home | Per-race id | Spawn bind **outside** the gated yard |

**Multipack rule:** isolate `nodeName` (walls, palms, harvest packs). Never place a whole GLB as one entity.

---

## 4. Build phases (NPC execution order)

1. **Claim** — plant the banner + claim chest. Builders path here.
2. **Harvest** — AI auto-cuts wood, stone, forage. Nodes regen in **4 hours**.
3. **Plaza** — keep, inn, vendor, barracks. Walkable 2 m court.
4. **Walls** — close the ring. Gates on the road. Towers on corners. Attackable.
5. **Paths** — lamps and signs. 2 m street gap.
6. **Outposts** — sentry boxes and tents along the roads out of town.
7. **Lots** — houses and extra halls **after** the wall is up, **outside** the fence.
8. **RTS** — barns, smith, herbalist, mill — profession harvest buildings **outside** the fence.
9. **Defense** — extra towers, alarm, fire bell after the yard is stocked.

Personal / faction homes are **never** inside the gated yard. Inside and outside must be accessible to the owner NPC/player. Enemies may attack walls, gates, towers, homes, and hostile-faction NPCs.

One host pack per settlement. No multi-faction mashups, no dummy benches, no ghost prefabs.

---

## 5. Settlement grades

| Grade | Enclosure | Gates | Homes | Dock crew |
|-------|-----------|-------|-------|-----------|
| Camp | Wood palisade | 1 | Tents + house outside | No |
| Outpost | Stone fence | 1 | House outside | No |
| Embassy | Stone curtain | 2 | Houses + RTS outside | Yes (hub dock) |
| Hub / city | Stone curtain | 3 | Houses + profession RTS outside | Sailor / Weatherman / Gunner @ **0.9** |

---

## 6. NPC jobs

Land: vendor, innkeep, smith, sergeant, champion, forager, miner, builder.  
Harbor (hubs only, planted on the dock / outpost zone): **Sailor, Weatherman, Gunner** — race of the captain, grudge6 kit at **0.9** scale.

Professions: miner, forester, farmer, herbalist, smith, mason, engineer, soldier, merchant, innkeep.

Hostile factions fight. Allies do not train mixed-kit units.

---

## 7. Craft stations (T0–T1)

| Station | Bench | ObjectStore names | Profession |
|---------|-------|-------------------|------------|
| Quick | Main Panel (no world prop) | Camp Bench | any |
| Cook | Fire pit / campfire | Campfire, cooking-pot | Chef |
| Engineer | Cog workbench | Tinker Table, workshop | Engineer |
| Forestry | Sawmill / wood pile | Lumber Table, sawmill | Forester |
| Smelter | Smithy forge | forge, Smithing Table | Miner |
| Loom | Cloth / thread | Loom Table, Spinning Wheel | Mystic |
| Potion | Alchemy bowl | alchemy-station | Chef |
| Anvil | Weapons / armour default | anvil, Smithing Table | Miner |

Icons from [WEAPON_SKILLS.html](https://info.grudge-studio.com/WEAPON_SKILLS.html) and [GRUDGE_Item_Database.html](https://info.grudge-studio.com/GRUDGE_Item_Database.html). Stats from [stats-guide.html](https://info.grudge-studio.com/stats-guide.html) — 8 ATTR, never grace/might aliases.

---

## 8. HUD

- Combat: mainhand / offhand from the Main Panel paperdoll. Changing the weapon swaps the 3D hand-bone mesh.
- Keys **1–5** — equipped weapon skills.
- **Shift+1–5** — class arts (L1 / 5 / 10 / 15 / 20).
- Keys **6–0** — Menu, Settings, Main Panel, Skill book, Camp craft.
- **Shift+6–0** — utility bar. Drag consumables, actives, mount from the bag.

---

## 9. Nature (Super Terrain)

**Banned** (home-island-contract + biome-ecosystems): CommonTree, TwistedTree, DeadTree, Rock_Medium, Pine_1..5 megakit, Bush_Common, nature-megakit, `/models/lowpoly/`.

**Runtime stems:** `/nature/stylized-tree.glb`, stone-black, stylized-foliage, realistic-palms, plus R2 `island_tree.glb` / `island_rock.glb` / palm-tree isolate `M_Palm_P2_*`.

Kenney files may remain on disk as **author input only**. They are not loaded at play time.

Harvest nodes (stone, herb, trees) **regen in 4 hours**.

---

## 10. Honest gaps (no fake GLB)

| Gap | Want | Have |
|-----|------|------|
| candle | ≤0.28 m tabletop light | standing torches only |
| bed | 1×2 floor bed inside 4×4 homes | throne stand-in |
| lumber-camp | 4×4 wood RTS | wood-pile prop |
| mine | 6×4 quarry RTS | world veins only |
| faction-house | dedicated 4×4 house per host | tent / shed stand-ins |
| dock_crew_api | Railway `crew_ids` assign | catalog + island roster live |
| ocean runtime | storm barrier, oil, mines, cargo bag | spec only |

---

## 11. REST (live client)

```
GET /api/v1/production
GET /api/v1/home-island
GET /api/v1/assets/buildable?faction=crusade
GET /api/v1/assets/misc
GET /api/v1/assets/gaps?faction=crusade&grade=hub
GET /api/v1/factions/{id}/kit
GET /api/v1/factions/{id}/npcs?grade=hub
GET /api/v1/blueprints
GET /api/v1/blueprints/{islandId}/plan
GET /api/v1/dock-crew
GET /api/v1/ships
GET /api/v1/stations
GET /api/v1/hud
GET /api/v1/nature
```

ObjectStore mirrors: `island-build-doctrine.json`, `buildable-prefabs.json`, `faction-kits.json`, `npc-roster.json`.

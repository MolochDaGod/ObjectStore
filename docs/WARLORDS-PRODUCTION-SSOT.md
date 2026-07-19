# Warlords Production SSOT — Build · Dock · Ships · Water · Fleet

**Canonical hub:** [info.grudge-studio.com/docs](https://info.grudge-studio.com/docs)  
**Machine JSON:** [`/api/v1/warlords-production.json`](../api/v1/warlords-production.json)  
**Game repo:** GrudgeBuilder · **Battle satellite:** Grudge-Studio-Game  
**Updated:** 2026-07-19

---

## Principles

1. **One SSOT per concern** — definitions (ObjectStore + `shared/definitions`), binaries (R2), player state (Railway).  
2. **Assets scripted ≠ assets managed** — convert/upload scripts must complete with CDN magic-byte verify.  
3. **Dock crew** = three roles only at harbor: Sailor, Weatherman, Gunner (race of captain, scale **0.9** grudge6).  
4. **Build layers never mixed** — quick craft ≠ bench ≠ modular ≠ dock ≠ RTS train.  
5. **Hardened HUD** — few tabs, visible costs, empty states, hotkeys, no silent fail on missing mesh.

---

## Fleet topology (production)

| Concern | Host | Notes |
|---------|------|--------|
| Auth | `id.grudge-studio.com` | Login + JWT |
| Characters / island / wallet / ships | Railway Postgres | `grudge-api-production-…` |
| Catalogs JSON | `objectstore.grudge-studio.com/api/v1` | weapons, races, recipes |
| Binary models | `assets.grudge-studio.com` | grudge6, buildings, ships |
| Docs / UUID browsers | `info.grudge-studio.com` | this site |
| Live client | `grudgewarlords.com` | Island3D + dock + ocean |
| Battle Triad | `game.grudge-studio.com` | Lane deploy builds (separate catalog) |
| Crafting shell | `grudge-crafting.puter.site` | WCS benches |
| AI | `ai.grudge-studio.com` | crew chat / mission agents |

---

## RTS building system (production)

See also GrudgeBuilder `docs/BUILD_SYSTEM_SSOT.md`.

| Layer | Code | Effect |
|-------|------|--------|
| Quick craft | Inventory / WCS | No world prop |
| Camp | survival kit nodes | Tent / fire / bedroll |
| Bench | profession stations | XP 1–100 |
| Modular | snap wood | Housing |
| Dock | float Y = water+0.2 | Ship + **crew train** |
| RTS | UFRTS / barracks | Train AI → promote hero |
| Race home | per-race id | Spawn bind |

**Multipack rule:** always isolate `nodeName` (e.g. fantasy walls `WoodenWall_Stairs_WoodenWall_0`) — never place whole GLB as one entity.

**UFRTS:** barracks/archery/farm/temple/market/storage/**dock/port**/towers/walls — convert via `convert:ufrts*`.

---

## Dock UI / UX (target)

**Single panel · 3 tabs**

1. **Fleet** — list ships, active highlight, build free rowboat / paid hulls  
2. **Ship Stats** — hull, speed, cannons, crew fill, cargo, upgrades  
3. **Recruit** — Sailor / Weatherman / Gunner with cost + train time  

**Hotkeys:** `1–3` roles · `B` board · `O` tactical ocean · `M` world map · `Esc` close  

**Flow:** dock → ship → recruit → assign → board → ocean/world → return repair.

---

## Dock crew roles

| Role | Abilities (summary) |
|------|---------------------|
| **Sailor** | Crow’s nest sniper, harpoon, auto-fish, repair boat, cook T0, ranged skill if equipped |
| **Weatherman** | Wind (sail speed), storm barrier (opaque bubble, reject projectiles, crew-only swim), dual side-waves push ~20 m |
| **Gunner** | Cannons, sniper nest, hook, bombs, water mines, fire bombs, oil trap (flame 20 s), exploding/scatter balls, harpoon fish |

**Visual:** grudge6 race kit @ **0.9** scale, unarmed base + T0 weapons/tools + locomotion & T0 skill anims.  
**AI:** behavior tags + future AI-chat edit; equipment meshing via mesh_ids; auto-harvest jobs share island harvest when docked.

Code: GrudgeBuilder `shared/definitions/dockCrew.ts`.

---

## Ships

| Size | HP | Speed | Cannons | Crew cap | Starter |
|------|-----|-------|---------|----------|---------|
| Rowboat | 30 | 4 | 0 | 2 | Free |
| Sloop | 80 | 3 | 3 | 5 | Craft |
| Galleon | 200 | 2 | 5 | 10 | Craft |

SSOT: `shipCatalog.ts` · persistence: `player_ships` · UI: `ShipDockPanel` / main Ships tab.

**Open water:** tactical ocean + 9-sector world map; cannon arcs; boarding; storm/oil/mine hazards (spec → implement).

---

## Gameplay loops

1. **Island loop** — harvest → craft → build benches/modular/dock  
2. **RTS loop** — place UFRTS → train land units → promote hero  
3. **Harbor loop** — build ship → train crew → assign → sail  
4. **Ocean loop** — sectors, combat, event islands, return  
5. **Battle loop** (satellite) — lane deploy + command-post builds  

---

## Missing systems (priority)

| P0 | Dock crew API + assign to `crew_ids` + 0.9 grudge6 preview |
| P0 | Ship Stats tab wired to catalog + live buffs |
| P1 | Storm barrier + side wave + oil/mine runtime |
| P1 | Ship cargo bag scope |
| P1 | Asset CDN verify for all dock tools / ship GLBs |
| P2 | AI chat edit for crew · sector event director |
| P2 | Register fantasy wall leafs as modular/RTS pieces |

---

## Lore (harbor)

Docks are the hinge of the Grudge Wars: free folk bind timber to will before the open water claims them. Sailors keep the belly of the ship alive; Weathermen argue with storms; Gunners speak in powder. Recruits wear their own race’s kit — one duty, six bloodlines.

---

## Related links

- [Best practices](./best-practices.html) · [GRUDGE6](./GRUDGE6.md) · [USAGE](./USAGE.md)  
- Icon browser · Weapon skills · 3DFX viewer (info hub)  
- GrudgeBuilder: `docs/DOCK_CREW_AND_WATER_SSOT.md`, `docs/BUILD_SYSTEM_SSOT.md`, `docs/SAILING.md`

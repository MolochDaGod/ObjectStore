# Warlords Production SSOT — Build · Dock · Ships · Water · Fleet · Island

**Canonical hub:** [info.grudge-studio.com/docs](https://info.grudge-studio.com/docs) · [Creation of Truth](https://info.grudge-studio.com/docs#creation-truth) · [Island Build Doctrine](https://info.grudge-studio.com/docs#island-build)  
**Machine JSON:** [`/api/v1/warlords-production.json`](../api/v1/warlords-production.json) · [`/api/v1/island-build-doctrine.json`](../api/v1/island-build-doctrine.json)  
**Game repo:** GrudgeBuilder · **Battle satellite:** Grudge-Studio-Game  
**Updated:** 2026-09-16

---

## Principles

1. **One SSOT per concern** — definitions (ObjectStore + `shared/definitions`), binaries (R2), player state (Railway Postgres).  
2. **Create truth from the owner** — heroes on Railway via Foundry; never invent a second character DB.  
3. **Assets scripted ≠ assets managed** — convert/upload scripts must complete with CDN magic-byte verify.  
4. **Dock crew** = three roles only at harbor: Sailor, Weatherman, Gunner (race of captain, scale **0.9** grudge6).  
5. **Build layers never mixed** — quick craft ≠ bench ≠ modular ≠ dock ≠ RTS train.  
6. **Hardened HUD** — few tabs, visible costs, empty states, hotkeys, no silent fail on missing mesh.  
7. **One play client** — primary host `client.grudge-studio.com` (Vercel `grudge-builder`); `grudgewarlords.com` is an alias only.  
8. **Occupy grid is 1 m** — buildings exclusive on ground; benches share a 1×1 with chairs/chests; small props sit on hosts.  
9. **Homes outside the fence** — personal/faction houses are attackable lots outside the gated yard.  
10. **Banned nature never loads** — CommonTree / Pine_1..5 / Rock_Medium / Bush_Common / nature-megakit are author-only.

---

## Fleet topology (production)

| Concern | Host | Notes |
|---------|------|--------|
| Auth | `id.grudge-studio.com` | Login + JWT — **not** the Warlords SPA project |
| Characters / island / wallet / ships | Railway Postgres | `grudge-api-production-0d46` |
| Catalogs JSON | `objectstore.grudge-studio.com/api/v1` · `info…/api/v1` | weapons, races, recipes, **island-build-doctrine** |
| Binary models | `assets.grudge-studio.com` | grudge6, buildings, ships, organized nature |
| Docs / UUID browsers | `info.grudge-studio.com` | this site |
| **Live play client (primary)** | **`client.grudge-studio.com`** | Hub `/home`, heroes, home-island, lobby, tutorial, play |
| Live play client (alias) | `grudgewarlords.com` | Same Vercel project as client |
| Hero creation | `character.grudge-studio.com` | Foundry create-only → return with `characterId` |
| Battle Triad | `game.grudge-studio.com` | Lane deploy builds (separate product) |
| Crafting shell | `grudge-crafting.puter.site` | WCS benches |
| AI | `ai.grudge-studio.com` | crew chat / mission agents |

### Create → play funnel (only this)

```
id.grudge-studio.com/login
  → client.grudge-studio.com/home
  → character.grudge-studio.com (Foundry create)
  → client /airship?characterId=&from=gcs
  → /home-island | /play | /tutorial | lobby
```

Do **not** bounce `/play` / `/tutorial` / `/airship` to empty `/heroes` without a Create path.

### Not Warlords play SSOT (cut / do not compete)

| Host | Why not |
|------|---------|
| `water.grudge-studio.com` | Separate Tactical Infinity / “Tethical” app |
| `warlord-genesis.vercel.app` | Separate MOBA |
| `open.grudge-studio.com` | Open combat sandbox |
| `rts-grudge.vercel.app` when aliased to Warlords SPA | RTS URL hijacked — fix alias |
| Failed Railway `grudge-warlords-rpg` + MySQL | Dead duplicate — use `grudge-api` only |
| Supabase | Not production player DB |

---

## Island build system (live 2026-09-16)

See [ISLAND-BUILD-DOCTRINE.md](./ISLAND-BUILD-DOCTRINE.md).

| Piece | Live | Notes |
|-------|------|-------|
| 1 m occupy grid | yes | ground exclusive · floor share · surface on host |
| Size law 4×4 / 6×4 / 0.5×1 bench | yes | civic 8×6 · ribbon wall 2×1 |
| Canonical island blueprints | yes | 54 atlas islands · NPC phase timeline |
| Faction kits (one host pack) | yes | crusade / fabled / legion |
| NPC harvest → build → defend | yes | claim first · homes outside fence |
| Dock crew roster on hubs | catalog | 0.9 scale · sailor/weatherman/gunner |
| Harvest regen 4 h | yes | stone / herb / trees |
| Organized nature (no megakit) | yes | stylized-tree + R2 island_tree/rock |
| HUD two-row + chrome 6–0 | yes | weapon 1–5 · class Shift+1–5 · utility Shift+6–0 |
| 8 ATTR combat math | yes | stats-guide.html · sigils/{id}.png |
| T0–T1 craft stations | yes | cook / engineer / forestry / smelter / loom / potion / anvil |
| Ocean sim / ship cargo / storm barrier | **no** | still P0/P1 |

**Homes, profession RTS, and farms sit outside the curtain.** Keep, inn, vendor, barracks stay in the plaza. Walls, gates, towers, homes, and enemy NPCs are attackable.

---

## RTS building system (production)

See also GrudgeBuilder `docs/BUILD_SYSTEM_SSOT.md`.

| Layer | Code | Effect |
|-------|------|--------|
| Quick craft | Inventory / WCS / HUD 0 | No world prop |
| Camp | survival kit nodes | Tent / fire / bedroll |
| Bench | profession stations | XP 1–100 |
| Modular | snap wood | Housing **outside fence** |
| Dock | float Y = water+0.2 | Ship + **crew train** |
| RTS | UFRTS / barracks | Train AI → promote hero |
| Race home | per-race id | Spawn bind **outside fence** |

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

Code: GrudgeBuilder `shared/definitions/dockCrew.ts` · play client `src/lib/production-ssot.ts`.

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

1. **Island loop** — harvest → craft → build benches/modular/dock  *(live)*
2. **RTS loop** — place UFRTS → train land units → promote hero  *(live kits)*
3. **Harbor loop** — build ship → train crew → assign → sail  *(catalog)*
4. **Ocean loop** — sectors, combat, event islands, return  *(spec)*
5. **Battle loop** (satellite) — lane deploy + command-post builds  

---

## Missing systems (priority)

| Id | Priority | Status 2026-09-16 |
|----|----------|-------------------|
| dock_crew_api | P0 | catalog + island roster live; Railway `crew_ids` still P0 |
| crew_ai_ocean_runtime | P0 | missing |
| ship_stats_panel_full | P0 | catalog |
| storm_barrier_physics | P1 | missing |
| oil_mine_entities | P1 | missing |
| ship_cargo_bag | P1 | missing |
| cdn_asset_verify_dock_tools | P1 | missing |
| sector_event_director | P2 | missing |
| fantasy_walls_as_build_pieces | P2 | **live** — faction kits isolate wall/gate/fence |
| lumber-camp / mine / faction-house / candle / bed | gap | named in occupy.ts — no fake GLB |

---

## Lore (harbor)

Docks are the hinge of the Grudge Wars: free folk bind timber to will before the open water claims them. Sailors keep the belly of the ship alive; Weathermen argue with storms; Gunners speak in powder. Recruits wear their own race’s kit — one duty, six bloodlines.

---

## Related links

- [Island Build Doctrine](./ISLAND-BUILD-DOCTRINE.md) · [Best practices](./best-practices.html) · [GRUDGE6](./GRUDGE6.md) · [USAGE](./USAGE.md)  
- Icon browser · Weapon skills · 3DFX viewer (info hub)  
- GrudgeBuilder: `docs/DOCK_CREW_AND_WATER_SSOT.md`, `docs/BUILD_SYSTEM_SSOT.md`, `docs/SAILING.md`

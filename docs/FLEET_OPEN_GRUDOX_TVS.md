# Open · Grudox · TVS / Fuzzyman fleet architecture

## Product roles

| Surface | Role |
|---------|------|
| **open.grudge-studio.com** | Studio **launcher + account hub** — Grudge ID, GBUX, purchases, owned assets, deep-links into products/editors |
| **grudox.grudge-studio.com** (voxgrudge) | **Home of all voxel games** — Z-Brawl, TVS showcase, settlements, open-world voxel |
| **water / grudgewarlords** | SI-scale Warlords (grudge6, nature packs) — not Kenney-first voxel |
| **2d warlords / sprite attack** | 2D fighter sheets — separate asset tree |
| **nexus TCG** | Cards/UI — not mesh packs |

Voxel content is **prioritized in Grudox**; Open only launches/accounts and does not re-host full mesh trees.

## The Voxel Store (TVS) — all packs

Source: https://the-voxel-store.itch.io/

| Pack | Themes |
|------|--------|
| voxel-cathedral | Holy, crusaders, graves |
| voxel-farm | Animals, crops, villagers |
| voxel-knights | Fortress melee |
| voxel-palace | Royalty |
| voxel-rangers | Forest camp |
| voxel-village | Economy NPCs |
| voxel-wizards | Arcane |

### Already on CDN

- Catalog: `https://assets.grudge-studio.com/models/voxels/tvs/catalog.json` (~880 entries)
- Roster: `…/unit-roster.json` (38 playable units with glbUrl, texture, anims, collider)
- R2 prefix: `models/voxels/tvs/{pack}/{characters|environment|props|animals|animations|textures}/`

### Professional load path (mandatory)

```text
unit-roster.json / catalog.json
  → TvsUnitLoader.normalizeUnit (absolute CDN URLs)
  → prefer production GLB (magic-byte glTF)
  → height bake 2.0 m characters (alreadyBaked)
  → NearestFilter atlas + metalness 0
  → anims.json semantic clips (idle/locomotion/attack)
  → collider.json capsule
```

Scripts:

```bash
cd F:\GitHub\voxgrudge
npm run convert:tvs              # 38 heroes → dist/tvs/production
npm run pipeline:tvs:statics     # env/props/animals batch
npm run pipeline:tvs:full        # characters + statics
npm run upload:tvs               # R2 put models/voxels/tvs/**
```

Seeds:

- `ObjectStore/data/seeds/tvs-d1-registry-seed.json` — D1 upsert rows
- `ObjectStore/data/seeds/tvs-catalog.production.json` — glbUrl overlay
- `ObjectStore/data/seeds/fuzzyman-scene-kits.seed.json` — scene compositions

## Fuzzyman medieval voxels — scene quality bar

https://fuzzymanstudios.itch.io/voxel-art → `Models.vox` (363 pieces)

Compose scenes (shop street, goblin village, dungeon…) — **never** one multipack entity.  
Authoring: `D:\Games\Models\library\raw\vox\Models.vox`  
Inventory: `library/inventory/Models.inventory.json`

## Placement accuracy

| Content | Scale | Placement |
|---------|-------|-----------|
| TVS characters | 2.0 m height, feet y=0 | roster unitId |
| TVS env/props | native voxel + settlement recipe rings | `TvsWorldContent.planSettlement` |
| Fuzzyman kits | export per piece → GLB → place by kit seed names | scene kit JSON |

## DCQ / other apps

- DCQ: resolve placeables via same CDN keys + catalog roles (`environment`, `props`)
- Z-Brawl: prefer TVS heroes via `TvsUnitLoader` when wired; Kenney remains fallback only
- Open launcher: deep-link `https://grudox.grudge-studio.com/voxgrudge/…` for voxel modes

## UI chrome (related)

See `voxgrudge/ui/UI_ASSET_RULES.md` — never stack HTML text on LOGIN/PLAY baked button art.

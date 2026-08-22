# Warlords entity prefabs

## Source icons
`C:\Users\nugye\Desktop\icons\icons\entities` — 118 PNGs (units, structures, siege, mounts, ships)

## Generated SSOT
| File | Role |
|------|------|
| `api/v1/warlords-entity-prefabs.json` | Full prefab catalog (game info + icon + mesh link status) |
| `api/v1/icon-shards/entity.json` | Icon index for UI (was 65 → now 118) |
| `icons/pack/entities/*.png` | Normalized icon files for CDN upload |

## Regenerate
```bash
cd ObjectStore
node scripts/sync-entity-prefabs-from-desktop.mjs
```

## Mesh status
- **kit_linked** — race unit → grudge6 race kit GLB
- **pack_linked** — benches/tents/fire/towers → survival kit / medieval towers multipack
- **icon_only** — needs dedicated GLB bake (siege, many mounts, some RTS buildings)

## Upload icons to CDN
Upload `icons/pack/entities/` to R2 as:
- `icons/pack/entities/{slug}.png`
- and/or `game-assets/icons/pack/entities/{slug}.png` (matches existing shard CDN URLs)

## TypeScript
`GrudgeBuilder/shared/definitions/warlordsEntityPrefabs.ts` — types + `entityIconUrl()` helpers.

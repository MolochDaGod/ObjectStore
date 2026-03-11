# Changelog
All notable changes to the ObjectStore API and assets.

## [3.0.1] - 2026-03-11
### Added
- **Real Icon System**: All items now use real icon assets — zero emoji fallbacks
  - Weapons: named icons (`icons/weapons/{id}.png`) with `wcs/weapons/` pack fallback (502 sprites)
  - Materials: named icons with category-matched fallback
  - Consumables: smart keyword matching across 18 food, 10 herb, 48 potion, 48 alchemy icons
  - Tools: mapped to weapon-type icons (pick→hammer, axe→axe, knife→dagger, etc.)
- **Expanded Enemy Database**: bosses.json and enemies.json with spriteData, CSS animations, icon-index paths
- **Animated Sprite Database**: SPRITE_DATABASE.html with animated enemy/boss previews
- **Service Worker**: Added 11 missing API endpoints to cache (ai, animations, asset-registry, controllers, ecs, nodeUpgrades, rendering, rtsModels, spriteMaps, terrain, tileMaps)
- ItemBrowser click-to-select UX with gold glow + checkmark + selection bar
- ItemBrowser detail modal shows real icon images

### Fixed
- ItemBrowser: armor `type` field no longer overwrites registry `type: 'armor'`
- ItemBrowser: consumable IDs prefixed with category to prevent cross-category collisions
- Tier filter buttons now have proper base + active styling

### Changed
- Service worker now caches all 45 API endpoints (was 34)
- CHANGELOG, README, WIKI-DEPLOYMENT updated for v3.0.1

## [3.0.0] - 2026-02-27
### Added
- 10,000+ assets collected from GrudgeWars, Warlord-Crafting-Suite, GDevelopAssistant
- 108 sprite directories with 7,324+ indexed 2D sprites
- 5,653 icons across weapons, armor, food, materials, RPG packs
- 450 audio files (SFX in wav/mp3/ogg/flac)
- 471 3D model registry (GLB, GLTF, FBX, OBJ)
- 167 backgrounds, 36 hero portraits, 6 cinematic videos
- 12 new JSON API endpoints extracted from GrudgeWars source
- MCP Server with 7 tools for AI agent integration
- OpenAPI 3.0.3 spec covering all 45+ endpoints
- Service Worker with stale-while-revalidate caching
- Vercel serverless endpoints (search, stats, export)
- SDK with 30+ methods, CI workflow, JSON schema validation
- Complete frontend redesign with nav bar and tier system


# Changelog
All notable changes to the ObjectStore API and assets.

## 2026-03-22
### Added — SDK v5.0.0
- `GrudgeAuthClient` — full auth client for `id.grudge-studio.com` (login, register, guest, puter, wallet, discord, web3auth, verify, identity)
- `GrudgeGameClient` — game API client for `api.grudge-studio.com` (characters, economy, crafting, combat, PvP lobbies/matchmaking, islands, missions, crews, factions, inventory, professions, gouldstones, dungeons, AI agent proxy)
- `GrudgeAccountClient` — account API for `account.grudge-studio.com` (profiles, friends, notifications, achievements, sessions, puter cloud)
- `GrudgeLauncherClient` — launcher API for `launcher.grudge-studio.com` (manifest, entitlements, version history)
- `GrudgeAssetServiceClient` — asset service for `assets-api.grudge-studio.com` (upload, list, get, delete)
- `GrudgeWSClient` — Socket.IO wrapper for `ws.grudge-studio.com` (/game, /crew, /global, /pvp namespaces)
- `TIER_COLORS` constant — T1-T8 color system (hex, name, label)
- `LS_KEYS` constant — standardized localStorage key convention for all Grudge apps
- Auto-auth token resolution from localStorage with priority chain
- `sdk.setToken()` for runtime token updates
- `sdk.clearSession()` for logout

### Changed
- `getDatabaseInfo()` now reflects MySQL 8 / Redis 7 / VPS Docker infrastructure (was Supabase/PostgreSQL)
- README.md updated with new SDK v5.0 usage, backend service table, and VPS architecture
- INTEGRATION-GUIDE.md updated with backend client examples

### Kept
- All existing ObjectStore static data methods (weapons, armor, materials, etc.)
- R2 storage client (`r2-client.js`)
- Grudge UUID system (generate, parse, validate)
- Full backward compatibility — `new GrudgeSDK()` still works for static data only

## 2026-03-19
### Fixed
- Fix models.json: add fileExtensions for .gltf.glb naming (9d1d2c1)


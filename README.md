# Grudge Studio ObjectStore
**Version 5.3.0** | Unified Game Data API, Backend SDK & Integration Hub

The complete data backbone for all Grudge Studio projects — 45+ JSON API endpoints, 13,000+ game assets, full backend SDK for all VPS services, and game data extracted from GrudgeWars.

**Live API:** [molochdagod.github.io/ObjectStore](https://molochdagod.github.io/ObjectStore) · **Game:** [grudgewarlords.com](https://grudgewarlords.com) · **Wiki:** [GitHub Wiki](https://github.com/MolochDaGod/ObjectStore/wiki) · **Agent Context:** [AGENT-CONTEXT.md](AGENT-CONTEXT.md)

---

## 🚀 Quick Start

### NPM Installation
```bash
npm install @grudgstudio/core
```

### Basic Usage
```javascript
import { initGrudgeStudio } from '@grudgstudio/core';

const api = await initGrudgeStudio({
  objectStoreUrl: 'https://molochdagod.github.io/ObjectStore',
  puterEnabled: true,  // Enable AI image generation
  aiBackendUrl: 'http://localhost:3000/api/ai',  // AI agents backend
  gameApiUrl: 'http://localhost:4000/api/gruda'  // GAME_API_GRUDA
});

// Search for T5 swords
const items = await api.search('sword', { tier: 5 });

// Create item with GRUDGE UUID
const item = api.createItem({ 
  type: 'weapon', 
  name: 'Legendary Blade',
  tier: 8 
});
console.log(item.uuid); // ITEM-20260225120000-000001-A1B2C3D4

// Use AI agents
const lore = await api.ai.generateLore({ item: 'Legendary Blade' });
const balanced = await api.ai.balanceItem(item);
```

**[📖 Full Integration Guide](INTEGRATION-GUIDE.md)** | **[🔧 Unity C# Example](integrations/GrudgeWarlords-Unity-Integration.cs)** | **[⚛️ React/TS Example](integrations/warlord-crafting-suite-integration.tsx)**

---

## ✨ What's New — Spell Arsenal & VFX Sandbox (5.3.0)

Live spell-type arsenal with multiple visual variants per family — wire skills, combos, and status effects without one-off VFX.

| Surface | URL |
|---------|-----|
| **VFX Sandbox** | [grudge-vfx.puter.site](https://grudge-vfx.puter.site/) — caster, dummy, hotkeys, ⚔ Spell Arsenal |
| **3DFX Viewer** | [info.grudge-studio.com/3dfx-viewer.html](https://info.grudge-studio.com/3dfx-viewer.html) — Arsenal tab + sandbox embed |
| **Spell library** | [spell-vfx-library.html](https://info.grudge-studio.com/spell-vfx-library.html) |

| Endpoint | Description |
|----------|-------------|
| `/api/v1/spell-arsenal.json` | **10 spell types**, 50+ variants — `skillSlot`, `skillUses`, links to sandbox |
| `/api/v1/vfx-spells.json` | **26 spells** — shaders, particles, splines, geometry (v2.0) |
| `/api/v1/vfx-skill-types.json` | Effects classified by skill type (projectile/slash/aoe/…) |

**Source repo:** `Fantasy-Scene-Creator/artifacts/vfx-sandbox` — build with `pnpm --filter @workspace/vfx-sandbox run build`, deploy with `deploy:puter` → Puter.

**Skill wiring:** pick a variant id from `spell-arsenal.json` (e.g. `flame_bolt`, `frost_slash`) → resolve descriptor in `vfx-spells.json` or effects-lib seed → attach to `SKIL-*` `vfxRef` on weapon prefab or ability.

---

## ✨ What's New — Canonical Weapon Prefabs (5.2.0)

End-to-end weapon prefab pipeline joins **ITEM-*** UUIDs, **SKIL-*** bindings, R2 assets, and uMMORPG loot/craft/enchant bridges.

| Endpoint | Description |
|----------|-------------|
| `/api/v1/master-weapon-prefabs.json` | **871 runtime prefabs** (15 T0 starters + 856 T1–8) with skills, assets, recipes, `attributeAffinity` |
| `/api/v1/t0-weapons.json` | 15 canonical starters — `weaponSkills` slot1/2/3 auto-assigned + `skills.slots` (always 3 abilities) |
| `/api/v1/master-weaponSkills.json` | 268 skills across 16 weapon types (+ SHIELD/TOME nested off-hand skills) |
| `/api/v1/ummorpg-systems-bridge.json` | uMMORPG drop/chest/craft/enchant mappings from canonical prefabs |
| `/api/v1/_meta/ability-aliases.json` | Design-layer ability names → canonical SKIL-* names |

**Live browser:** [WEAPON_SKILLS.html](https://molochdagod.github.io/ObjectStore/WEAPON_SKILLS.html) — pick weapon class → named variant → filtered skills/passives.

**Equipment standard:** [docs/CANONICAL-EQUIPMENT.md](docs/CANONICAL-EQUIPMENT.md) — weapons + harvest tool (live), armor next. Meta: `/api/v1/_meta/canonical-equipment-pattern.json`

**All Warlords items:** [docs/CANONICAL-ITEMS-WARLORDS.md](docs/CANONICAL-ITEMS-WARLORDS.md) — full category map · `/api/v1/canonical-items-manifest.json`

**Stats & attributes:** [docs/WEAPON-STATS-ATTRIBUTES.md](docs/WEAPON-STATS-ATTRIBUTES.md) — canonical links between weapon base stats, SKIL-*, 8 attributes, and 37 derived stats.

| Endpoint | Description |
|----------|-------------|
| `/api/v1/weapon-stat-bridge.json` | Connection graph — prefab stats ↔ ATTR-* ↔ SKIL-* ↔ combat pipeline |
| `/api/v1/master-attributes.json` | 8 attributes, derived stats, `combatFormulas` (8-step pipeline) |
| `/api/v1/master-weaponSkills.json` | 268 skills with per-skill `statConnections` |
| `/api/v1/_meta/weapon-stats-attributes.json` | Agent/codegen connection pattern |

**T0 starter pattern** (15 crafting starters — no tier upgrades):

| Slot | Role | Notes |
|------|------|--------|
| 1 | Starter attack | Fixed · tier-0 skill only |
| 2 | Starter style | Fixed · tier-0 skill only |
| 3 | Starter ability | **Player choice** · pick one from 2–3 tier-0 options |

**Harvest tool (Crude Tool):** `gather-starter` — Chop · Mine · choose Skin or Pry. T1+ tools link to `master-harvest-nodes.json`.

Craft **T1** named weapons from the matching T0 starter + materials (`usedInT1Crafting`). Reference: `/api/v1/_meta/t0-starter-slot-pattern.json`

**Five-slot hotbar pattern** (T1+ named combat weapons):

| Slot | Role | Scope |
|------|------|--------|
| 1 | Standard attack (LMB) | One skill per weapon **type** (e.g. all swords → Vengeful Slash) |
| 2 | Style option | Shared pool across all variants of that type |
| 3 | Style option | Shared pool across all variants of that type |
| 4 | Signature | Variant ultimate (one skill per named weapon) |
| 5 | Passives | Variant-specific passives from `weapons.json` |

Reference: `/api/v1/_meta/weapon-slot-pattern.json`

**Off-hand modifier (SHIELD + TOME)** — same F-toggle pattern for slots 1–3:

| When | Slots 1–3 | Slots 4–5 |
|------|-----------|-----------|
| F inactive | Main weapon standard + shared styles | Main weapon signature + passives |
| F active (block / tome coupling) | Off-hand pool injects into mainhand | Unchanged — stay on main weapon |

- **Shield:** any mainhand; shield type (buckler, kite, tower, …) supplies tank abilities for slots 1–3.
- **Tome:** requires 1H mainhand; coupling mode (elemental, heal, buff, ranged) supplies spell variants for slots 1–3.

Reference: `/api/v1/_meta/weapon-loadout-pattern.json` · prefab field `loadout`

### Build & validate

```bash
npm run enrich:weapon-skills       # UUIDs + resourceCost for SHIELD/TOME nested skills
npm run enrich:t0-starter-skills   # T0 three-slot starter skills into master-weaponSkills
npm run enrich:variant-signatures  # named variant signatures → slot 4 ultimate pools
npm run enrich:skill-stat-connections  # SKIL-*.statConnections (attributes + derived stats)
npm run build:weapon-pipeline      # all enrich steps + prefabs + stat bridge + audit
```

Outputs:
- `api/v1/master-weapon-prefabs.json` (each prefab has `statConnections`)
- `api/v1/weapon-stat-bridge.json`
- `api/v1/ummorpg-systems-bridge.json`
- `workers/seed/weapon-prefabs.sql` (D1 `weapon_prefabs` table)

**Unity import:** `Grudge Studio → Import Canonical Weapon Prefabs` (reads `master-weapon-prefabs.json`).

---

## ✨ What's New in 3.1.0

### 📦 GrudgeWarlords.com Asset Migration
All frontend assets from grudgewarlords.com (Grudge-Builder) are now served from ObjectStore:
- **3,024 files migrated** (~306 MB) — icons, sprites, backgrounds, UI, portraits, professions
- **13,000+ total assets** across all categories
- Frontend uses `assetUrl()` helper pointing to `https://molochdagod.github.io/ObjectStore`
- New folders: `images/events/`, `images/portraits/`, `images/professions/`, `images/ui/`, `images/misc/`, `images/lore/`, `sprites/pirate/`
- CORS headers updated for all new asset paths

### 📦 Full Asset Collection (3.0.0+)
- **208 animated characters** with 2,388 unique 2D sprites across 3 sources
- **47 fish species** from Grudge Angeler with full sprite sheets
- **25 grudgeDot Assistant hero aliases** mapped to existing sprites
- **7,400+ icons** across weapons, armor, food, materials, RPG packs, entities, potions, resources
- **450 audio files** (SFX in wav/mp3/ogg/flac)
- **471 3D model** registry (GLB, GLTF, FBX, OBJ) organized by race
- **170+ backgrounds**, 36 hero portraits, 6 cinematic videos

### 🗺️ Full Game Data Extraction
- **12 new JSON API endpoints** extracted from GrudgeWars source:
- Quests (28 zones), Missions (10 story + 10 arena), Skill Trees (4 classes)
- Equipment (15 weapon types + skills), Enemy Templates (20+ types, 8 bosses)
- World Map (33 locations, 79 paths), Dialogue (7 trigger types, 6 races)
- Cutscenes, Regions, Battle Formations, Random Events, Lore (3 gods + heroes)

### 🤖 AI Agent Infrastructure
- **MCP Server** with 7 tools for AI agent integration
- **OpenAPI 3.0.3 spec** covering all 45+ endpoints
- **Service Worker** with stale-while-revalidate caching
- **Vercel serverless** endpoints (search, stats, export)

### 🔧 Developer Tools
- **SDK** with 30+ methods covering every endpoint
- **CI workflow** for auto-regenerating registries
- **JSON schema validation** for 14+ data files
- **Changelog/RSS** generation from git log

---

## 🔗 Static API

**Base URL:** `https://molochdagod.github.io/ObjectStore`

**📚 [Full API Documentation](https://molochdagod.github.io/ObjectStore/docs/)**

| Endpoint | Description |
|----------|-------------|
| `/api/v1/weapons.json` | Named weapon templates (119 variants — design-layer abilities/passives) |
| `/api/v1/master-weapon-prefabs.json` | **871 canonical prefabs** — ITEM-* + SKIL-* + R2 + recipes (runtime bundle) |
| `/api/v1/t0-weapons.json` | 15 T0 starter weapons |
| `/api/v1/master-weaponSkills.json` | Weapon skill trees with SKIL-* UUIDs, cast times, resource costs |
| `/api/v1/ummorpg-systems-bridge.json` | uMMORPG ItemDrop / Lootcrate / Crafting / Enchant wiring |
| `/api/v1/materials.json` | Crafting materials (ore, wood, cloth, leather, gems, essence) |
| `/api/v1/armor.json` | Armor slots (helm, chest, boots, etc.) |
| `/api/v1/consumables.json` | Potions, bandages, grenades |
| `/api/v1/skills.json` | Weapon skill trees (sword, axe, bow, staff, gun) |
| `/api/v1/professions.json` | Profession definitions and metadata |
| `/api/v1/races.json` | 6 playable races with bonuses, lore, and faction affiliations |
| `/api/v1/classes.json` | 4 classes with abilities, weapon/armor types, and signature moves |
| `/api/v1/factions.json` | 3 factions (Crusade, Legion, Fabled) with race mappings |
| `/api/v1/master-attributes.json` | 8 ATTR-* attributes, 37 derived stats, combat pipeline |
| `/api/v1/archive/manifest.json` | Archived legacy endpoints + canonical replacements |
| `/api/v1/quests.json` | Zone quests (28 zones, 112 quests) |
| `/api/v1/missions.json` | Story missions + arena templates |
| `/api/v1/skillTrees.json` | Full skill trees (4 classes, 5 tiers each) |
| `/api/v1/equipment.json` | Equipment types, tiers, weapon skills |
| `/api/v1/enemyTemplates.json` | 20+ enemy types with abilities, 8+ bosses |
| `/api/v1/worldMap.json` | 33 locations, 79 paths, terrain regions |
| `/api/v1/dialogue.json` | NPC dialogue, race/class chatter |
| `/api/v1/cutscenes.json` | Zone intro cutscenes + extended lore |
| `/api/v1/regions.json` | 5 world regions with zone mappings |
| `/api/v1/battleFormations.json` | Player/enemy row formations |
| `/api/v1/randomEvents.json` | 8 random event templates |
| `/api/v1/lore.json` | 3 gods + hero lore entries |
| `/api/v1/audio.json` | 450 sound effect registry |
| `/api/v1/video.json` | 6 cinematic video registry |
| `/api/v1/heroes.json` | 36 hero portrait + effect images |
| `/api/v1/models3d.json` | 471 3D model registry (GLB/GLTF/FBX/OBJ) |
| `/api/v1/ai.json` | AI agent configuration and prompts |
| `/api/v1/animations.json` | Animation definitions |
| `/api/v1/asset-registry.json` | Master asset registry |
| `/api/v1/controllers.json` | Controller configurations |
| `/api/v1/ecs.json` | Entity Component System definitions |
| `/api/v1/nodeUpgrades.json` | Node upgrade paths |
| `/api/v1/rendering.json` | Rendering configuration |
| `/api/v1/rtsModels.json` | RTS model registry |
| `/api/v1/spriteMaps.json` | Sprite map definitions |
| `/api/v1/sprite-characters.json` | 275 animated characters with animations, grid/frame-sequence support |
| `/api/v1/sprites2d.json` | 2,388 unique 2D sprites (flat registry) |
| `/api/v1/grudgedot-hero-aliases.json` | 25 hero class → sprite mappings for grudgeDot Assistant |
| `/api/v1/master-items.json` | Unified ITEM-* catalog (runtime) |
| `/api/v1/terrain.json` | Terrain configuration |
| `/api/v1/tileMaps.json` | Tile map definitions |

### Large Catalog Loading (Worker API)

For very large catalogs, prefer chunked requests through the Worker instead of downloading full collections in one call.

- `GET /v1/assets?limit=100&offset=0` → paged asset browsing (`total`, `hasMore`, `nextOffset`)
- `GET /v1/models?limit=60&offset=0` → paged 3D model browsing
- `GET /v1/game-data/master-items?page=0&pageSize=200` → paged game-data array loading
- `GET /v1/game-data/master-items?page=0&pageSize=200&q=sword` → server-side filtered page
- Full static browsing is still supported via GitHub Pages JSON (for exports/tools): `/api/v1/master-items.json`

Recommended client pattern:
1. Start with `pageSize` 100–250.
2. Render immediately.
3. Request the next page only when user scrolls or clicks “Load more” using `nextOffset` (or `page + 1`).
4. Keep static `/api/v1/*.json` fetches for offline tools and one-shot admin workflows.

## 🔗 Supported Projects

ObjectStore integrates with all Grudge Studio repositories:

### High Priority
- **[Warlord-Crafting-Suite](https://warlord-crafting-suite.vercel.app)** — React/TypeScript crafting system with Arsenal tab
- **GrudgeWarlords** — Unity WebGL MMO with real-time item loading
- **GrudgeStudioNPM** — NPM package aggregator for all Grudge modules

### Medium Priority
- **[Grudge Crafting (Puter)](https://grudge-crafting.puter.site)** — Puter-hosted crafting suite; should use `master-items.json` / `games-library.json` (not archived `items-database.json`)
- **grudge-warlords** — Voxel RPG with ItemRegistry integration
- **PuterGrudge** — Backend server with AI image generation endpoints
- **GrudgeGameIslands** — WebGL island exploration with materials system

### All Projects
35+ repositories including: grudge-match-webgl, grudge-angeler, nexus-webgl, TheForge, Grudge-Realms, GrudgeController, and more.

**See [Integration Guide](INTEGRATION-GUIDE.md) for complete implementation examples.**

---

## 📦 SDK v5.0 — Unified Client

The Grudge SDK provides a single import for **all** backend services + static game data.

```javascript
import { GrudgeSDK } from 'https://molochdagod.github.io/ObjectStore/sdk/grudge-sdk.js';

const sdk = new GrudgeSDK({ token: '<JWT>' });

// ── Static game data (ObjectStore) ──
const weapons = await sdk.getWeapons();
const swords  = await sdk.getWeaponsByCategory('swords');
const results = await sdk.search('iron');
const iconUrl = sdk.getWeaponIconUrl('swords', 0, 5);

// ── Auth (id.grudge-studio.com) ──
const res = await sdk.auth.login('user', 'pass');
const me  = await sdk.auth.getMe();

// ── Game API (api.grudge-studio.com) ──
const chars   = await sdk.game.listCharacters();
const balance = await sdk.game.getBalance(charId);
await sdk.game.startCraft({ char_id: 1, recipe_key: 'iron-sword' });
const lobbies = await sdk.game.listLobbies({ mode: 'duel' });

// ── Account API (account.grudge-studio.com) ──
const profile = await sdk.account.getProfile(grudgeId);
const friends = await sdk.account.listFriends();

// ── Launcher API (launcher.grudge-studio.com) ──
const manifest = await sdk.launcher.getManifest();

// ── Asset Service (assets-api.grudge-studio.com) ──
const assets = await sdk.assets.listAssets({ prefix: 'models/' });

// ── WebSocket (ws.grudge-studio.com) ──
const gameSocket = sdk.ws.game();
gameSocket.emit('join-island', { island_key: 'island_1' });

// ── Tier colors (D5 labels) ──
const t5 = GrudgeSDK.getTierColor(5); // { name: 'Red',     hex: '#ff4d4d', label: 'Heroic' }
const t8 = GrudgeSDK.getTierColor(8); // { name: 'Shimmer', hex: '#f0d890', label: 'Legendary' }
```

### Service Clients

| Client | URL | Description |
|--------|-----|-------------|
| `sdk.auth` | id.grudge-studio.com | Login, register, guest, wallet, discord, puter, identity |
| `sdk.game` | api.grudge-studio.com | Characters, economy, crafting, combat, PvP, islands, missions, crews, inventory, gouldstones, AI |
| `sdk.account` | account.grudge-studio.com | Profiles, friends, notifications, achievements, sessions |
| `sdk.launcher` | launcher.grudge-studio.com | Manifest, entitlements, version history |
| `sdk.assets` | assets-api.grudge-studio.com | Upload, list, delete assets |
| `sdk.ws` | ws.grudge-studio.com | Socket.IO namespaces: /game, /crew, /global, /pvp |
| `sdk.ai` | ai.grudge-studio.com | AI worker — generate sprites/icons, auto-tag, semantic search, game agents |
| `sdk.r2` | objectstore.grudge-studio.com | R2 storage (3D models, shaders, 3DFX) |

## 🤖 AI Worker (Cloudflare Workers AI)

**Endpoint:** `https://ai.grudge-studio.com`

The AI Worker runs on Cloudflare's edge with Workers AI, sharing the same R2 bucket and D1 database as the ObjectStore API. It provides:
- **Sprite generation** — text-to-sprite via Stable Diffusion XL
- **Icon generation** — tier-aware RPG item icons
- **Asset description** — image-to-text for any R2 asset
- **Auto-tagging** — AI-powered tag suggestions for assets
- **Semantic search** — query expansion + keyword matching across all assets
- **Game agents** — 6 specialized agents (lore, balance, code, art, mission, QA)

### SDK Usage

```javascript
import { GrudgeSDK } from './sdk/grudge-sdk.js';
const sdk = new GrudgeSDK({ token: '<JWT>' });

// Generate a sprite
const sprite = await sdk.ai.generateSprite('orc warrior with axe', { style: '32x32 RPG character' });
console.log(sprite.image);   // data:image/png;base64,...
console.log(sprite.asset);   // { id, key, url } — auto-saved to R2

// Generate a tier-5 weapon icon
const icon = await sdk.ai.generateIcon('flaming greatsword', { tier: 5, category: 'weapon' });

// Auto-tag an existing asset
const tags = await sdk.ai.tag('asset-uuid-here');

// Semantic search
const results = await sdk.ai.search('fire spell effects', { category: 'effects' });

// Chat with game agents
const lore = await sdk.ai.chat('Create a backstory for the Crusade faction', { agent: 'lore' });
const balance = await sdk.ai.chat('Is T5 sword damage balanced vs T5 axe?', { agent: 'balance' });
```

### Deploy

```bash
# Run D1 migration (one-time)
wrangler d1 execute objectstore-meta --file=workers/ai/schema.sql

# Deploy
wrangler deploy --config workers/ai/wrangler.toml

# Local dev
wrangler dev --config workers/ai/wrangler.toml
```

## 🤖 AI Backend Integration (VPS)

**NEW in 2.1.0**: Integrated AI agent system with specialized agents for game development.

### Available AI Agents

- **Code Agent**: Code generation, refactoring, optimization
- **Art Agent**: Asset generation, style guidance, icon design
- **Lore Agent**: World building, narrative consistency, character backstories
- **Balance Agent**: Game balance analysis, stat tuning, economy balance
- **QA Agent**: Test strategies, bug detection, edge case analysis
- **Mission Agent**: Quest design, mission flow, reward structures

### Usage Example

```javascript
import { initGrudgeStudio } from '@grudgstudio/core';

const api = await initGrudgeStudio({
  aiBackendUrl: 'http://localhost:3000/api/ai'
});

// Query an AI agent
const response = await api.ai.queryAgent({
  agentType: 'lore',
  prompt: 'Create a backstory for a legendary sword',
  context: { faction: 'Crusade', tier: 8 }
});

console.log(response.result);

// Research game balance
const research = await api.ai.research({
  topic: 'T8 weapon damage scaling',
  category: 'balance',
  context: { currentMax: 500, proposedMax: 650 }
});

// Design a mission
const mission = await api.ai.designMission({
  level: 50,
  type: 'boss-raid',
  faction: 'Legion',
  rewards: ['epic-weapon', 'gold']
});

// Connect to GAME_API_GRUDA (local IDE integration)
const result = await api.ai.connectToGameAPI('update-character', {
  characterId: 'hero-123',
  stats: { strength: 100 }
});
```

### Fallback to Puter AI

If the AI backend is unavailable, the system automatically falls back to Puter.js:

```javascript
// Works offline with Puter fallback
const api = await initGrudgeStudio({ puterEnabled: true });
const lore = await api.ai.generateLore({ item: 'Mystic Staff' });
```

### TypeScript Support

Full TypeScript definitions included:

```typescript
import type { AIRequest, AIResponse, ResearchQuery } from '@grudgstudio/core';

const request: AIRequest = {
  agentType: 'balance',
  prompt: 'Analyze this weapon',
  context: { weapon: myWeapon }
};
```

## 🗄️ Data Architecture

### Static Data (This Repository)
- Game definitions (what items/races/classes exist)
- No authentication required
- Hosted on GitHub Pages (free CDN)

### Dynamic Data (Grudge Studio Backend — VPS)
For player-specific data, economy, PvP, and accounts — self-hosted Docker + Coolify on VPS:

| Service | URL | Description |
|---------|-----|-------------|
| Identity / Auth | `id.grudge-studio.com` | JWT auth (Discord, Web3Auth, Puter, guest, wallet) |
| Game API | `api.grudge-studio.com` | Characters, economy, crafting, combat, PvP, islands, missions, crews |
| Account API | `account.grudge-studio.com` | Profiles, friends, notifications, achievements |
| Launcher API | `launcher.grudge-studio.com` | Version manifest, entitlements, launch tokens |
| WebSocket | `ws.grudge-studio.com` | Real-time events (Socket.IO: /game, /crew, /global, /pvp) |
| Asset Service | `assets-api.grudge-studio.com` | Upload/manage assets (metadata + conversions) |
| R2 CDN | `assets.grudge-studio.com` | Public asset delivery (Cloudflare R2 Worker) |
| Dashboard | `dash.grudge-studio.com` | Admin dashboard (Cloudflare Worker) |
| Status | `status.grudge-studio.com` | Uptime monitoring (Uptime Kuma) |

See [grudge-studio-backend](https://github.com/MolochDaGod/grudge-studio-backend) `GRUDGE-STUDIO-CONTEXT.md` for full reference.

## 📊 Data Structure

### Weapons
```json
{
  "categories": {
    "swords": {
      "iconBase": "Sword",
      "iconMax": 40,
      "items": [
        {
          "id": "bloodfeud-blade",
          "name": "Bloodfeud Blade",
          "primaryStat": "damage",
          "secondaryStat": "lifesteal",
          "emoji": "⚔️"
        }
      ]
    }
  }
}
```

### Materials
```json
{
  "categories": {
    "ore": {
      "items": [
        {
          "id": "iron-ore",
          "name": "Iron Ore",
          "tier": 2,
          "gatheredBy": "Miner",
          "emoji": "⛏️"
        }
      ]
    }
  }
}
```

## 🎨 Icons

All items display real icon assets — no emoji or placeholder images. Icon resolution is centralized in **`utils/icon-resolver.js`**, used by **`GRUDGE_Item_Database.html`** (canonical item browser; `ItemBrowser.html` redirects there).

### Icon Resolution — `utils/icon-resolver.js`

```javascript
import { getIconUrl, getFallbackUrl } from './utils/icon-resolver.js';
const primary  = getIconUrl(item);      // best-match icon for this item
const fallback = getFallbackUrl(item);  // guaranteed-exists fallback
```

Resolution per item type:

- **Weapons** — Named icons at `/icons/weapons/{kebab-name}.png` (119 unique), with type-based fallback to `/icons/pack/weapons/{Type}_{##}.png` (502 weapon sprites). Category field (`swords`, `daggers`, `bows`, etc.) maps to the correct weapon prefix. Absolute GitHub Pages URLs in JSON `iconUrl` are normalized to relative paths.
- **Armor** — Slot-based icons in `/icons/armor_full/{Slot}_{##}.png` (523 icons across Helm, Chest, Boots, Gloves, Shoulder, Ring, necklace, Pants, Bracer). Material type (cloth/leather/metal) shifts the hash offset for visual variety. Shoulder_63 gap is auto-skipped.
- **Materials** — Kebab-case name derived from `item.name` (not UUID) at `/icons/materials/{kebab-name}.png`, with category-based fallback (`ore→iron-ore`, `cloth→wool-thread`, `wood→oak-log`, etc.).
- **Consumables** — Keyword matching: potions→`/icons/consumables/potion_{N}.png`, food keywords (steak, fish, bread, etc.)→matching food icons, herbs→herb sprite set, alchemy→`alchemy_{N}.png`.
- **Enchants** — Resolves `item.effect.stat` (damage, defense, speed, crit, fire, frost, etc.) to ability icons in `/icons/abilities/`. Falls back to name-based keyword matching for element/stat enchants.
- **Infusions** — Tier-indexed framed alchemy icons: `/icons/items/alchemy/alchemy_{tier}_framed.png`.
- **Relics** — Tier-indexed framed artifact icons: `/icons/items/artifacts/artifacts_{tier}_framed.png`.
- **Artifacts** — Hash-deterministic loot icons: `/icons/loot/loot_{N}.png`.
- **Skills** — Keyword-matched ability icons (120+ keyword→icon mappings for fire, ice, lightning, holy, nature, arcane, shadow, warrior, ranged, beast skills).
- **Tools** — Mapped to weapon-type icons (mining-pick→Hammer, lumber-axe→Axe, skinning-knife→Dagger, etc.).

### Icon Directories
- `/icons/weapons/` — 119 named weapon icons (kebab-case)
- `/icons/pack/weapons/` — 502 weapon sprites (Sword, Axe, Dagger, Hammer, Spear, Bow, Crossbow, Scythe, shield, staff, Book)
- `/icons/armor_full/` — 523 armor slot icons (Helm, Chest, Boots, Gloves, Shoulder, Ring, necklace, Pants, Bracer)
- `/icons/consumables/` — Food, herbs, potions, alchemy items (100+ icons)
- `/icons/materials/` — 79 crafting material icons
- `/icons/abilities/` — 28+ ability icons (used by enchants and skills)
- `/icons/items/alchemy/` — 100 framed alchemy icons (used by infusions)
- `/icons/items/artifacts/` — 100 framed artifact icons (used by relics)
- `/icons/loot/` — 48 loot icons (used by artifacts)
- `/icons/pack/resources/` — 120 generic resource/loot fallback icons
- `/icons/skills/` — Class-based skill icons
- `/icons/spells/` — Spell effect icons with color variants
- `/icons/food/` — Additional food icons (referenced by GRUDGE_Item_Database)

## 🎮 2D Sprite Browser & Editor

**Live:** [molochdagod.github.io/ObjectStore/2D_MODELS.html](https://molochdagod.github.io/ObjectStore/2D_MODELS.html)

Full-featured sprite browser, editor, and validation tool with:
- **Canvas animation** — horizontal, vertical, grid, and frame-sequence layouts
- **Sprite editor** — Hue/Saturation/Brightness sliders, horizontal flip, auto-trim transparent padding
- **VFX preview** — Additive/Screen/Multiply blending modes, Dark/Light/Checkerboard backgrounds, Loop/Ping-pong/Once playback
- **Export** — Single frame or all frames as individual PNGs (with edits applied)
- **Validation report** — Tests every sprite for broken images, frame size mismatches, and missing animations
- **275 characters, 2,220 animations** across 10 categories (characters, enemies, bosses, monsters, effects, fish, npcs, companions, projectiles, ui)

### Sources
- **rpg-modular** — Core RPG character/enemy/boss/effect sprites
- **grudge-angeler** — 48 fish species with animated sprite sheets from [Grudge Angeler](https://grudge-angeler.vercel.app/)
- **objectstore** — Additional sprites from effects, UI, projectiles, companions, and other packs

### Sprite API
```javascript
// Fetch all animated characters
const res = await fetch('https://molochdagod.github.io/ObjectStore/api/v1/sprite-characters.json');
const data = await res.json();
// data.characters[0] = { name, category, source, uuid, animations: [...] }
// Each animation has: uuid, id, name, path, width, height, frameCount, frameW, frameH, layout, cols, rows

// Filter by category
const effects = data.characters.filter(c => c.category === 'effects');
const bosses = data.characters.filter(c => c.category === 'bosses');
```

### Rebuild Sprites
```bash
node tools/scan-sprites.js   # Scan sprites/ directory and regenerate sprite-characters.json
```
The scanner reads PNG headers directly (no external deps), auto-detects frame layouts, deduplicates flat/nested paths, and preserves existing UUIDs.

---

## 📁 Project Structure

```
ObjectStore/
├── api/v1/                   # 50+ Static JSON API endpoints
│   ├── weapons.json         # 119 named weapon templates
│   ├── master-weapon-prefabs.json  # 871 runtime prefabs (ITEM-* + SKIL-*)
│   ├── t0-weapons.json      # 15 starter weapons
│   ├── master-weaponSkills.json    # 16 weapon types, 268 skills
│   ├── ummorpg-systems-bridge.json # uMMORPG addon mappings
│   ├── _meta/ability-aliases.json  # Design → canonical skill name map
│   ├── armor.json           # Helm, chest, boots, etc.
│   ├── materials.json       # Ore, wood, cloth, leather, gems
│   ├── sprite-characters.json # 275 animated characters (3 sources)
│   ├── sprites2d.json       # 2,220+ animations across all sprites
│   ├── archive/           # Superseded legacy payloads (*.v1.json) + manifest.json
│   ├── master-items.json    # Unified ITEM-* catalog
│   ├── grudgedot-hero-aliases.json # Hero class → sprite mappings
│   ├── quests.json          # 28 zones, 112 quests
│   ├── missions.json        # Story + arena templates
│   ├── skillTrees.json      # 4 classes × 5 tiers
│   ├── equipment.json       # Weapon types + skills
│   ├── enemyTemplates.json  # 20+ enemies, 8+ bosses
│   ├── worldMap.json        # 33 locations, 79 paths
│   ├── dialogue.json        # NPC chatter system
│   ├── cutscenes.json       # Zone intro cinematics
│   ├── audio.json           # 450 SFX registry
│   ├── video.json           # 6 cinematic videos
│   ├── heroes.json          # 36 hero portraits
│   ├── models3d.json        # 471 3D model registry
│   └── ...                  # + 30 more endpoints
├── sprites/                  # 275 characters, 2,220+ animations, 3,500+ PNGs
│   ├── characters/          # Player characters (55 dirs)
│   ├── enemies/             # Enemy units
│   ├── bosses/              # Boss encounters
│   ├── monsters/            # Monster creatures
│   ├── fish/                # 47 Angeler fish species + generic
│   ├── effects/             # VFX sprite sheets
│   └── ...                  # npcs, companions, projectiles, ui
├── icons/                    # 5,653 PNG icons
├── backgrounds/              # 167 scene backgrounds
├── heroes/                   # 36 hero portraits + effects
├── audio/                    # 450 SFX (wav/mp3/ogg/flac)
├── video/                    # 6 cinematic MP4s
├── branding/                 # Favicons + brand assets
├── sdk/grudge-sdk.js         # SDK v5.0 — unified client for all services
├── mcp/                      # MCP server for AI agents
├── scripts/                  # Build + extraction tools
│   ├── build-weapon-prefabs.mjs    # Join master-weapons + skills → prefabs
│   ├── validate-weapon-pipeline.mjs # Audit T0 count, skill bindings, duplicates
│   ├── enrich-weapon-skills.mjs    # UUIDs + resourceCost for off-hand skills
│   └── build-items-json.js  # Legacy HTML parser (outputs archived format only)
├── tools/                    # Sprite tools
│   └── scan-sprites.js      # Walk sprites/, auto-detect layouts, regenerate JSON
├── workers/ai/               # AI Worker (Cloudflare Workers AI)
│   ├── index.js             # AI endpoints (generate, tag, search, chat)
│   ├── wrangler.toml        # Config (R2 + D1 + AI bindings)
│   └── schema.sql           # D1 migration for ai_jobs table
├── openapi.yaml              # OpenAPI 3.0.3 spec
├── sw.js                     # Service worker
├── package.json              # @grudge-studio/objectstore v3.0.0
└── README.md
```

## 🚀 Deployment

### GitHub Pages (Static API)
This repository is deployed automatically:

1. Push to `main` branch
2. GitHub Actions builds and deploys
3. Available at `https://molochdagod.github.io/ObjectStore`
4. API Docs: `https://molochdagod.github.io/ObjectStore/docs/`

### NPM Package Publishing

Publish `@grudge-studio/core` to NPM:

```bash
cd D:\GrudgeLink\OneDrive\Desktop\ObjectStore
npm login
npm publish --access public
```

Update version:
```bash
npm version patch  # 2.1.0 -> 2.1.1
npm version minor  # 2.1.0 -> 2.2.0
npm version major  # 2.1.0 -> 3.0.0
```

**See [WIKI-DEPLOYMENT.md](WIKI-DEPLOYMENT.md) for full deployment guide.**

## 📄 License

© 2026 Grudge Studio. Game data provided for use with Grudge Studio applications.

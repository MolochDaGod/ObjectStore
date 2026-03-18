# Grudge Studio ObjectStore
**Version 3.0.0** | Unified Game Data API, Asset Library & Integration Hub

The complete data backbone for all Grudge Studio projects — 45+ JSON API endpoints, 10,000+ game assets, MCP server for AI agents, SDK, OpenAPI spec, and full game data extracted from GrudgeWars.

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

## ✨ What's New in 3.0.0

### 📦 Massive Asset Collection
- **10,000+ assets** collected from GrudgeWars, Warlord-Crafting-Suite, and GDevelopAssistant
- **208 animated characters** with 2,388 unique 2D sprites across 3 sources
- **47 fish species** from Grudge Angeler with full sprite sheets
- **25 GDevelop Assistant hero aliases** mapped to existing sprites
- **5,653 icons** across weapons, armor, food, materials, RPG packs
- **450 audio files** (SFX in wav/mp3/ogg/flac)
- **471 3D model** registry (GLB, GLTF, FBX, OBJ) organized by race
- **167 backgrounds**, 36 hero portraits, 6 cinematic videos

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
| `/api/v1/weapons.json` | All weapons (17 categories × 6 weapons × 8 tiers = 816 items) |
| `/api/v1/materials.json` | Crafting materials (ore, wood, cloth, leather, gems, essence) |
| `/api/v1/armor.json` | Armor slots (helm, chest, boots, etc.) |
| `/api/v1/consumables.json` | Potions, bandages, grenades |
| `/api/v1/skills.json` | Weapon skill trees (sword, axe, bow, staff, gun) |
| `/api/v1/professions.json` | Profession definitions and metadata |
| `/api/v1/races.json` | 6 playable races with bonuses, lore, and faction affiliations |
| `/api/v1/classes.json` | 4 classes with abilities, weapon/armor types, and signature moves |
| `/api/v1/factions.json` | 3 factions (Crusade, Legion, Fabled) with race mappings |
| `/api/v1/attributes.json` | 8 attribute definitions with stat formulas |
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
| `/api/v1/sprite-characters.json` | 208 animated characters grouped by name with animations |
| `/api/v1/sprites2d.json` | 2,388 unique 2D sprites (flat registry) |
| `/api/v1/gdevelop-hero-aliases.json` | 25 hero class → sprite mappings for GDevelop Assistant |
| `/api/v1/terrain.json` | Terrain configuration |
| `/api/v1/tileMaps.json` | Tile map definitions |

## 🔗 Supported Projects

ObjectStore integrates with all Grudge Studio repositories:

### High Priority
- **[Warlord-Crafting-Suite](https://warlord-crafting-suite.vercel.app)** — React/TypeScript crafting system with Arsenal tab
- **GrudgeWarlords** — Unity WebGL MMO with real-time item loading
- **GrudgeStudioNPM** — NPM package aggregator for all Grudge modules

### Medium Priority
- **grudge-warlords** — Voxel RPG with ItemRegistry integration
- **PuterGrudge** — Backend server with AI image generation endpoints
- **GrudgeGameIslands** — WebGL island exploration with materials system

### All Projects
35+ repositories including: grudge-match-webgl, grudge-angeler, nexus-webgl, TheForge, Grudge-Realms, GrudgeController, and more.

**See [Integration Guide](INTEGRATION-GUIDE.md) for complete implementation examples.**

---

## 📦 Legacy SDK

> **Note**: For new projects, use `@grudge-studio/core` instead. This legacy SDK is maintained for backward compatibility.

```javascript
import { GrudgeSDK } from 'https://molochdagod.github.io/ObjectStore/sdk/grudge-sdk.js';

const sdk = new GrudgeSDK();

// Get all weapons
const weapons = await sdk.getWeapons();

// Get weapons by category
const swords = await sdk.getWeaponsByCategory('swords');

// Get materials by tier
const t5Materials = await sdk.getMaterialsByTier(5);

// Search across all data
const results = await sdk.search('iron');

// Get icon URLs
const iconUrl = sdk.getWeaponIconUrl('swords', 0, 5); // Sword icon, tier 5

// Get races, classes, factions
const races = await sdk.getRaces();
const warrior = await sdk.getClass('warrior');
const crusade = await sdk.getFaction('crusade');
const attrs = await sdk.getAttributes();
```

## 🤖 AI Backend Integration

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

### Dynamic Data (GRUDA-Wars API)
For player-specific data, arena, and accounts — hosted on [grudgewarlords.com](https://grudgewarlords.com):

| Resource | Endpoint |
|----------|----------|
| Accounts & Auth | `/api/auth/*`, `/api/discord/*` |
| Characters & Inventory | `/api/db/characters`, `/api/db/inventory` |
| Arena PvP | `/api/arena/lobby`, `/api/arena/battle/simulate` |
| Leaderboards | `/api/arena/leaderboard`, `/api/public/leaderboard` |
| Save/Load | `/api/db/save-game`, `/api/db/load-game` |

See [GRUDA-Wars README](https://github.com/MolochDaGod/StandaloneGrudge) for full API reference.

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

All items display real icon assets — no emoji or placeholder images.

### Icon Resolution
- **Weapons**: Named icons at `/icons/weapons/{id}.png` (e.g. `bloodfeud-blade.png`), with automatic fallback to `/icons/wcs/weapons/{Type}_{##}.png` pack (502 real weapon sprites)
- **Armor**: `/icons/pack/armor/{Slot}_{##}.png` (Helm, Chest, Boots, Gloves, etc.)
- **Materials**: Named icons at `/icons/materials/{id}.png` with category-matched fallback
- **Consumables**: Smart matching — 18 food icons, 10 herb icons, 48 potion icons, 48 alchemy icons
- **Tools**: Mapped to appropriate weapon-type icons (pick→hammer, axe→axe, knife→dagger)

### Icon Packs Available
- `/icons/weapons/` — 82 named weapon icons
- `/icons/wcs/weapons/` — 502 weapon sprites (Sword, Axe, Dagger, Hammer, Spear, Bow, etc.)
- `/icons/pack/armor/` — Armor slot icons (Helm, Chest, Boots, Belt, Ring, etc.)
- `/icons/consumables/` — Food, herbs, potions, alchemy items
- `/icons/materials/` — 79 crafting material icons
- `/icons/skills/` — Class-based skill icons (aeromancer, pirate, swordsman, warlock)
- `/icons/abilities/` — 28 ability icons
- `/icons/spells/` — Spell effect icons with color variants

## 🎮 2D Sprite Browser

**Live:** [molochdagod.github.io/ObjectStore/2D_MODELS.html](https://molochdagod.github.io/ObjectStore/2D_MODELS.html)

Animated sprite browser with canvas playback, frame scrubbing, zoom, sheet view, and single-frame export.

### Sources
- **rpg-modular** — Core RPG character/enemy/boss/effect sprites (103 characters)
- **grudge-angeler** — 47 fish species with animated sprite sheets from [Grudge Angeler](https://grudge-angeler.vercel.app/)
- **gdevelop-assistant** — 25 hero class aliases mapped from [GDevelop Assistant](https://gdevelop-assistant.vercel.app/) (Archer, Assassin, Barbarian, Knight, Mage, etc.)

### Sprite API
```javascript
// Fetch all animated characters
const res = await fetch('https://molochdagod.github.io/ObjectStore/api/v1/sprite-characters.json');
const data = await res.json();
// data.characters[0] = { name, category, source, uuid, animations: [...] }

// Filter by source
const angelerFish = data.characters.filter(c => c.source === 'grudge-angeler');
const gdevelopHeroes = data.characters.filter(c => c.source === 'gdevelop-assistant');
```

### Rebuild Sprites
```bash
npm run rebuild:sprites2d   # Regenerate sprite-characters.json + sprites2d.json
```

---

## 📁 Project Structure

```
ObjectStore/
├── api/v1/                   # 48+ Static JSON API endpoints
│   ├── weapons.json         # 17 categories, 816+ items
│   ├── armor.json           # Helm, chest, boots, etc.
│   ├── materials.json       # Ore, wood, cloth, leather, gems
│   ├── sprite-characters.json # 208 animated characters (3 sources)
│   ├── sprites2d.json       # 2,388 unique 2D sprites (flat)
│   ├── gdevelop-hero-aliases.json # Hero class → sprite mappings
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
├── sprites/                  # 208 characters, 2,388 unique sprites
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
├── sdk/grudge-sdk.js         # SDK with 30+ methods
├── mcp/                      # MCP server for AI agents
├── scripts/                  # Build + extraction tools
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

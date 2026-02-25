# Grudge Studio ObjectStore
**Version 2.1.0** | Unified Game Data API & Integration Hub

Centralized data API for all Grudge Studio projects — weapons, armor, materials, races, classes, factions, and icons. Now with AI-powered image generation, GRUDGE UUID system, and cross-project integration.

**Live API:** [molochdagod.github.io/ObjectStore](https://molochdagod.github.io/ObjectStore) · **Game:** [grudgewarlords.com](https://grudgewarlords.com) · **Wiki:** [GitHub Wiki](https://github.com/MolochDaGod/ObjectStore/wiki)

---

## 🚀 Quick Start

### NPM Installation
```bash
npm install @grudge-studio/core
```

### Basic Usage
```javascript
import { initGrudgeStudio } from '@grudge-studio/core';

const api = await initGrudgeStudio({
  objectStoreUrl: 'https://molochdagod.github.io/ObjectStore',
  puterEnabled: true  // Enable AI image generation
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
```

**[📖 Full Integration Guide](INTEGRATION-GUIDE.md)** | **[🔧 Unity C# Example](integrations/GrudgeWarlords-Unity-Integration.cs)** | **[⚛️ React/TS Example](integrations/warlord-crafting-suite-integration.tsx)**

---

## ✨ What's New in 2.1.0

### 🎮 Unified Integration Package
- **NPM Package**: `@grudge-studio/core` - Single library for all Grudge Studio projects
- **Cross-Platform**: JavaScript, TypeScript, Unity C#, Node.js
- **35+ Repository Integration**: Works across all Grudge Studio projects

### 🏷️ GRUDGE UUID System
- **Universal IDs**: `ITEM-20260225120000-000001-A1B2C3D4`
- **16 Entity Types**: Items, heroes, materials, abilities, missions, and more
- **Arsenal Compatible**: Uses the same UUID format from Warlord-Crafting-Suite

### 🎨 AI-Powered Features
- **Image Generation**: Puter.js integration for txt2img item icons
- **Tier System**: T1-T8 visual system with colored borders (Bronze → Legendary)
- **Smart Caching**: localStorage + batch generation with rate limiting

### 📦 Integration Ready
- **React/TypeScript**: Pre-built Arsenal tab component
- **Unity C#**: Complete GrudgeStudioAPI MonoBehaviour
- **Node.js**: Server-side API client with caching

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

## 🤖 AI Integration

For AI agents that need game data without authentication:

```javascript
// Direct fetch example
const response = await fetch('https://molochdagod.github.io/ObjectStore/api/v1/weapons.json');
const data = await response.json();

// Get all fire staves
const fireStaves = data.categories.fireStaves.items;
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

Icons are hosted at:
- Weapons: `/icons/weapons/{Type}_{##}.png`
- Armor: `/icons/armor/{Slot}_{##}.png`
- Resources: `/icons/resources/Res_{##}.png`

Example: `/icons/weapons/Sword_01.png`

## 📁 Project Structure

```
ObjectStore/
├── api/v1/                   # Static JSON data
│   ├── weapons.json        # 17 categories, 816+ items
│   ├── materials.json       # Ore, wood, cloth, leather, gems, essence
│   ├── armor.json           # Helm, chest, boots, gloves, etc.
│   ├── consumables.json     # Potions, food, engineer items
│   ├── skills.json          # Weapon skill trees
│   ├── professions.json     # Miner, Forester, Mystic, Chef, Engineer
│   ├── races.json           # Human, Orc, Elf, Undead, Barbarian, Dwarf
│   ├── classes.json         # Warrior, Mage Priest, Worge, Ranger
│   ├── factions.json        # Crusade, Legion, Fabled
│   └── attributes.json      # STR, INT, VIT, DEX, END, WIS, AGI, TAC
├── integrations/            # 🆕 NEW: Cross-project integrations
│   ├── grudge-studio-core.js                      # Main API client
│   ├── warlord-crafting-suite-integration.tsx     # React/TS component
│   └── GrudgeWarlords-Unity-Integration.cs        # Unity C# API
├── utils/                   # 🆕 NEW: Utility modules
│   ├── item-registry.js      # Single source of truth
│   └── image-generator.js    # AI image generation
├── css/                     # 🆕 NEW: Styling
│   └── tier-system.css       # T1-T8 visual system
├── sdk/                     # Legacy SDK
│   └── grudge-sdk.js         # Original SDK (backward compat)
├── icons/                   # 659+ PNG sprite icons
│   ├── weapons/
│   ├── armor/
│   └── resources/
├── docs/                    # API documentation
├── INTEGRATION-GUIDE.md     # 🆕 NEW: Complete integration guide
├── WIKI-HOME.md             # 🆕 NEW: GitHub wiki home
├── WIKI-DEPLOYMENT.md       # 🆕 NEW: Deployment guide
├── package.json             # 🆕 NEW: NPM package config
├── SPRITE_DATABASE.html     # Visual sprite browser
├── index.html               # Landing page
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

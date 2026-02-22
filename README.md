# Grudge Studio ObjectStore

Public API for Grudge Warlords game data — weapons, armor, materials, races, classes, factions, and icons.

**Live game:** [grudgewarlords.com](https://grudgewarlords.com) · **Live API (dynamic):** [grudgewarlords.com/api](https://grudgewarlords.com/api/health)

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

## 📦 SDK

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
├── api/v1/
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
├── sdk/grudge-sdk.js        # JavaScript SDK with caching + UUID system
├── icons/                   # 659+ PNG sprite icons
├── docs/
├── index.html
└── README.md
```

## 🚀 Deployment

This repository is deployed via GitHub Pages:

1. Push to `main` branch
2. GitHub Actions builds and deploys
3. Available at `https://molochdagod.github.io/ObjectStore`
4. API Docs: `https://molochdagod.github.io/ObjectStore/docs/`

## 📄 License

© 2026 Grudge Studio. Game data provided for use with Grudge Studio applications.

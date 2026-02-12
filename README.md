# Grudge Studio ObjectStore

Public API for Grudge Warlords game data - weapons, materials, armor, and icons.

## 🔗 Live API

**Base URL:** `https://molochdagod.github.io/ObjectStore`

**📚 [Full API Documentation](https://molochdagod.github.io/ObjectStore/docs/)**

| Endpoint | Description |
|----------|-------------|
| `/api/v1/weapons.json` | All weapons (17 categories × 6 weapons × 8 tiers = 816 items) |
| `/api/v1/materials.json` | Crafting materials (ore, wood, cloth, leather, gems, essence) |
| `/api/v1/armor.json` | Armor slots (helm, chest, boots, etc.) |
| `/api/v1/consumables.json` | Potions, bandages, grenades |
| `/api/v1/skills.json` | Profession skill trees (5 professions) |
| `/api/v1/professions.json` | Profession definitions and metadata |

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

## 🗄️ Database Architecture

### Static Data (This Repository)
- Game definitions (what items exist)
- No authentication required
- Hosted on GitHub Pages (free CDN)

### Dynamic Data (Supabase)
For player-specific data (requires authentication):

| Schema | Tables |
|--------|--------|
| `studio_core` | accounts, sessions, api_keys |
| `warlord_crafting` | characters, inventory_items, crafted_items, islands |

**Supabase Project:** `wfbcuyaiwtfxincdiihc.supabase.co`

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
├── api/
│   └── v1/
│       ├── weapons.json
│       ├── materials.json
│       ├── armor.json
│       └── consumables.json
├── sdk/
│   └── grudge-sdk.js
├── icons/           # Symlink to main project icons
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

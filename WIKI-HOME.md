# 🎮 Grudge Studio ObjectStore Wiki

**Public API for Grudge Warlords game data** • Weapons • Materials • Armor • Icons • No Auth Required

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-success)](https://molochdagod.github.io/ObjectStore)
[![API Status](https://img.shields.io/badge/API-Active-brightgreen)](https://molochdagod.github.io/ObjectStore/api/v1/)

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [API Reference](#api-reference)
4. [UUID System](#uuid-system)
5. [Integration Guide](#integration-guide)
6. [Puter Audit & Integration](#puter-audit--integration)
7. [Ecosystem Projects](#ecosystem-projects)
8. [Contributing](#contributing)

---

## 🌟 Overview

ObjectStore is the centralized **single source of truth** for all Grudge Warlords game data. It provides:

- ⚔️ **816 Weapons** across 17 categories × 8 tiers
- 🪨 **98 Materials** for crafting (ore, wood, cloth, leather, gems)
- 🛡️ **Armor System** with 11 slots across 4 armor types
- 🧪 **132 Consumables** (food, potions, engineer items)
- ⚡ **47 Skills** across weapon types
- 🎨 **4000+ Sprite Icons** in multiple resolutions
- 🆔 **GRUDGE UUID System** for consistent object identification

### Key Features

- **No Authentication Required** - Public API for all game clients
- **Single Source of Truth** - Prevents duplicates across projects
- **Tier-Based System** - T1-T8 progression with visual distinction
- **AI Image Generation** - Puter.js integration for dynamic asset creation
- **Real-Time Updates** - Dynamic counts and live search
- **Cross-Platform** - Works with Unity, WebGL, React, and web clients

---

## 🚀 Quick Start

### Basic API Usage

```javascript
// Fetch all weapons
const response = await fetch('https://molochdagod.github.io/ObjectStore/api/v1/weapons.json');
const weapons = await response.json();

// Get materials
const materials = await fetch('https://molochdagod.github.io/ObjectStore/api/v1/materials.json')
  .then(res => res.json());

// Load sprites
const sprites = await fetch('https://molochdagod.github.io/ObjectStore/api/v1/sprites.json')
  .then(res => res.json());
```

### Using the SDK

```javascript
import { GrudgeSDK } from 'https://molochdagod.github.io/ObjectStore/sdk/grudge-sdk.js';

const sdk = new GrudgeSDK();

// Get all weapons
const weapons = await sdk.getWeapons();

// Search for items
const ironItems = await sdk.search('iron');

// Get specific category
const swords = await sdk.getWeaponsByCategory('swords');
```

---

## 📖 API Reference

### Base URL
```
https://molochdagod.github.io/ObjectStore/api/v1/
```

### Endpoints

| Endpoint | Description | Items |
|----------|-------------|-------|
| `/weapons.json` | All weapon definitions | 816 weapons |
| `/materials.json` | Crafting materials | 98 materials |
| `/armor.json` | Armor slots and tiers | 11 slots |
| `/consumables.json` | Food, potions, items | 132 items |
| `/skills.json` | Weapon skills | 47 skills |
| `/professions.json` | Professions data | 5 professions |
| `/sprites.json` | Sprite icon catalog | 4000+ icons |

### Data Structure

#### Weapons
```json
{
  "version": "1.0.0",
  "total": 816,
  "tiers": 8,
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
          "emoji": "⚔️",
          "grudgeType": "item"
        }
      ]
    }
  }
}
```

#### Materials
```json
{
  "categories": {
    "ore": {
      "items": [
        {
          "id": "copper-ore",
          "name": "Copper Ore",
          "tier": 1,
          "gatheredBy": "Mining",
          "emoji": "🪨"
        }
      ]
    }
  }
}
```

---

## 🆔 UUID System

ObjectStore uses the **GRUDGE UUID System** from Warlord-Crafting-Suite/Arsenal for consistent object identification across all projects.

### Format
```
{PREFIX}-{TIMESTAMP}-{SEQUENCE}-{HASH}
```

Example: `ITEM-20260225120000-000001-A1B2C3D4`

### Entity Prefixes

| Entity Type | Prefix | Example |
|-------------|--------|---------|
| Hero/Character | `HERO` | `HERO-20260225120000-000001-F3E2D1C0` |
| Item (Generic) | `ITEM` | `ITEM-20260225120000-000002-B4A3C2D1` |
| Equipment | `EQIP` | `EQIP-20260225120000-000003-C5B4D3E2` |
| Ability/Skill | `ABIL` | `ABIL-20260225120000-000004-D6C5E4F3` |
| Material | `MATL` | `MATL-20260225120000-000005-E7D6F5G4` |
| Recipe | `RECP` | `RECP-20260225120000-000006-F8E7G6H5` |
| Resource Node | `NODE` | `NODE-20260225120000-000007-G9F8H7I6` |
| Mob/Enemy | `MOBS` | `MOBS-20260225120000-000008-H0G9I8J7` |
| Boss | `BOSS` | `BOSS-20260225120000-000009-I1H0J9K8` |
| Mission/Quest | `MISS` | `MISS-20260225120000-000010-J2I1K0L9` |
| Infusion | `INFU` | `INFU-20260225120000-000011-K3J2L1M0` |
| Loot Table | `LOOT` | `LOOT-20260225120000-000012-L4K3M2N1` |
| Consumable | `CONS` | `CONS-20260225120000-000013-M5L4N3O2` |
| Quest | `QUST` | `QUST-20260225120000-000014-N6M5O4P3` |
| Zone | `ZONE` | `ZONE-20260225120000-000015-O7N6P5Q4` |
| Save State | `SAVE` | `SAVE-20260225120000-000016-P8O7Q6R5` |

### SDK Usage

```javascript
import { generateGrudgeUuid, parseGrudgeUuid, isValidGrudgeUuid } from './sdk/grudge-sdk.js';

// Generate UUID
const itemId = generateGrudgeUuid('item', 'legendary-sword');
// Returns: ITEM-20260225120000-000001-A1B2C3D4

// Parse UUID
const parsed = parseGrudgeUuid(itemId);
console.log(parsed);
// {
//   prefix: 'ITEM',
//   timestamp: '20260225120000',
//   sequence: '000001',
//   hash: 'A1B2C3D4',
//   entityType: 'item',
//   createdAt: Date('2026-02-25T12:00:00Z')
// }

// Validate UUID
if (isValidGrudgeUuid(itemId)) {
  console.log('Valid GRUDGE UUID');
}
```

---

## 🔗 Integration Guide

### Grudge Warlords Unity Integration

**Repository**: `MolochDaGod/GrudgeWarlords`
**URL**: https://grudge-warlords.vercel.app

#### Integration Points:
1. **Item System** - Load weapon/armor data from ObjectStore API
2. **Inventory** - Use GRUDGE UUIDs for item instances
3. **Crafting** - Fetch recipes and material requirements
4. **Character Stats** - Map equipment stats to player attributes

```csharp
// Unity C# Example
using UnityEngine;
using System.Net.Http;
using Newtonsoft.Json;

public class ObjectStoreAPI {
    private const string BASE_URL = "https://molochdagod.github.io/ObjectStore/api/v1/";
    
    public async Task<WeaponsData> GetWeapons() {
        var client = new HttpClient();
        var response = await client.GetStringAsync($"{BASE_URL}weapons.json");
        return JsonConvert.DeserializeObject<WeaponsData>(response);
    }
}
```

### Warlord Crafting Suite Integration

**Repository**: `MolochDaGod/Warlord-Crafting-Suite` (Private)
**URL**: https://warlord-crafting-suite.vercel.app

#### Integration Points:
1. **Arsenal Tab** - Display all weapons from ObjectStore
2. **Crafting Calculator** - Use material data for recipes
3. **Character Builder** - Load armor sets and stats
4. **UUID Generation** - Arsenal's UUID system is the source

```typescript
// React/TypeScript Example
import { GrudgeSDK } from '@grudge/objectstore';

const sdk = new GrudgeSDK();

// Fetch weapons for Arsenal display
const weapons = await sdk.getWeapons();

// Generate UUID for crafted item
const craftedItem = {
  id: generateGrudgeUuid('equipment', 'player-crafted'),
  name: 'Custom Sword',
  stats: { damage: 150, crit: 25 }
};
```

### GrudgeStudioNPM Package Integration

**Repository**: `MolochDaGod/GrudgeStudioNPM`
**NPM**: `@grudge-studio/tools`

#### Integration Points:
1. **Export ObjectStore SDK as NPM module**
2. **Add UUID utilities to package**
3. **Create shared type definitions**

```bash
# Install package
npm install @grudge-studio/tools

# Use in project
import { GrudgeSDK, UUID } from '@grudge-studio/tools';
```

### Grudge Angeler Integration

**Repository**: `MolochDaGod/grudge-angeler`
**URL**: https://grudge-angeler.vercel.app

#### Integration Points:
1. **Fish Database** - Store fish data in ObjectStore format
2. **Loot Tables** - Use GRUDGE UUIDs for drops
3. **Equipment** - Rod/tackle data from ObjectStore

```typescript
// Add fishing items to ObjectStore
const fishingGear = {
  category: "fishing",
  items: [
    {
      id: "basic-rod",
      name: "Basic Fishing Rod",
      tier: 1,
      catchRate: 1.0,
      grudgeType: "equipment"
    }
  ]
};
```

### WebGL Builds Integration

**Repositories**:
- `GrudgeGameIslands` - Islands WebGL
- `grudge-match-webgl` - Match WebGL
- `nexus-webgl` - Nexus WebGL

#### Integration Points:
1. **Runtime Asset Loading** - Fetch sprites/data at game start
2. **Inventory System** - Use ObjectStore item definitions
3. **Save/Load** - Store GRUDGE UUIDs in save files

```javascript
// Unity WebGL JavaScript Bridge
async function LoadGameData() {
  const response = await fetch('https://molochdagod.github.io/ObjectStore/api/v1/weapons.json');
  const data = await response.json();
  
  // Send to Unity
  SendMessage('GameManager', 'OnDataLoaded', JSON.stringify(data));
}
```

### PuterGrudge Backend Integration

**Repository**: `MolochDaGod/PuterGrudge`
**URL**: https://puter-monitor-ai.vercel.app

#### Integration Points:
1. **AI Image Generation** - Generate item icons using Puter.js
2. **Cloud Storage** - Store generated images
3. **Account System** - Link player inventories to GRUDGE UUIDs

```javascript
import puter from 'https://js.puter.com/v2/';

// Generate item icon
const imageBlob = await puter.ai.txt2img('legendary fire sword icon, fantasy RPG');

// Store in Puter cloud
await puter.fs.write(`/icons/${itemId}.png`, imageBlob);
```

---

## 🤖 Agent Context

An AI agent context document is maintained in this repository to enable seamless session continuation:

- **Agent Context**: [AGENT-CONTEXT.md](../AGENT-CONTEXT.md) — Pending tasks, technical inventory, codebase status, remediation plan, and agent guidelines

---

## 🧪 Puter Audit & Integration

Grudge Studio now maintains a repeatable Puter governance workflow for all apps/sites.

- **Audit + Integration Standard**: [docs/PUTER-AUDIT-INTEGRATION.md](docs/PUTER-AUDIT-INTEGRATION.md)
- **Portfolio Inventory**: [docs/puter-integration-inventory.json](docs/puter-integration-inventory.json)

### Run the audit

```bash
npm run audit:puter
```

### Save full report

```bash
npm run audit:puter:save
```

Report output path:

```text
docs/reports/puter-audit-report.json
```

---

## 🎮 Ecosystem Projects

### All Grudge Projects That Should Integrate ObjectStore:

| Project | Type | Language | Status | Integration Priority |
|---------|------|----------|--------|---------------------|
| **ObjectStore** | API | HTML/JS | ✅ Active | - (Core) |
| **Warlord-Crafting-Suite** | Web App | TypeScript | ✅ Active | 🔴 High |
| **GrudgeWarlords** | Unity WebGL | JS | ✅ Active | 🔴 High |
| **GrudgeStudioNPM** | NPM Package | JS | ✅ Active | 🔴 High |
| **grudge-warlords** | Voxel RPG | TypeScript | ✅ Active | 🟡 Medium |
| **GrudgeGameIslands** | WebGL Islands | JS | ✅ Active | 🟡 Medium |
| **grudge-angeler** | Fishing Game | TypeScript | ✅ Active | 🟡 Medium |
| **GrudgeController** | 3D Controller | JS | ✅ Active | 🟢 Low |
| **grudge-match-webgl** | Match WebGL | HTML | ✅ Active | 🟢 Low |
| **nexus-webgl** | Unity WebGL | HTML | ✅ Active | 🟢 Low |
| **PuterGrudge** | Backend | HTML | ✅ Active | 🟡 Medium |
| **TheForge** | Crafting UI | HTML | ✅ Active | 🟡 Medium |
| **Grudge-Realms** | C++ Game | C++ | 🟡 Dev | 🟢 Low |
| **grudge-warlords-rts** | RTS Game | Java | ✅ Active | 🟢 Low |
| **GrudgeGame** | ASP.NET | ASP.NET | ✅ Active | 🟢 Low |

---

## 🛠️ Development Roadmap

### Phase 1: Core API (✅ Complete)
- [x] Weapons API endpoint
- [x] Materials API endpoint
- [x] Armor API endpoint
- [x] Consumables API endpoint
- [x] Skills API endpoint
- [x] Sprites catalog

### Phase 2: SDK & Tools (🚧 In Progress)
- [x] JavaScript SDK
- [x] GRUDGE UUID System
- [ ] TypeScript definitions
- [ ] NPM package publication
- [ ] Unity C# SDK
- [ ] Python SDK (for tools)

### Phase 3: AI Integration (🚧 In Progress)
- [x] Puter.js image generator
- [x] Item registry system
- [ ] Auto-generate missing icons
- [ ] Description generator
- [ ] Stat balancer AI

### Phase 4: Enhanced Features (📋 Planned)
- [ ] GraphQL API
- [ ] WebSocket for real-time updates
- [ ] Item comparison tool
- [ ] Build calculator
- [ ] Loot simulator
- [ ] DPS calculator

---

## 📝 Contributing

### Adding New Items

1. Fork the repository
2. Add items to appropriate JSON file in `api/v1/`
3. Follow the existing data structure
4. Generate GRUDGE UUIDs for new items
5. Submit PR with clear description

### Code Style

- Use 2-space indentation
- Follow existing naming conventions
- Add JSDoc comments for functions
- Test changes before submitting

---

## 📜 License

This project is part of the Grudge Studio ecosystem. See individual repository licenses for details.

---

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/MolochDaGod/ObjectStore/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MolochDaGod/ObjectStore/discussions)
- **Discord**: Join the Grudge Studio Discord
- **Email**: contact@grudgewarlords.com

---

**Made with ⚔️ by Grudge Studio** • **Co-Authored-By: Oz <oz-agent@warp.dev>**

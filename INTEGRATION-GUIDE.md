# Grudge Studio Integration Guide
**Version 2.1.0** | Last Updated: February 2026

Complete guide for integrating ObjectStore API across all Grudge Studio projects.

---

## 🎯 Quick Start

### NPM Installation
```bash
npm install @grudge-studio/core
```

### Basic Usage (JavaScript/TypeScript)
```javascript
import { initGrudgeStudio } from '@grudge-studio/core';

const api = await initGrudgeStudio({
  objectStoreUrl: 'https://molochdagod.github.io/ObjectStore',
  arsenalUrl: 'https://warlord-crafting-suite.vercel.app',
  puterEnabled: true
});

// Get all T5 swords
const items = await api.search('sword', { tier: 5 });

// Create item with GRUDGE UUID
const newItem = api.createItem({ 
  type: 'weapon', 
  name: 'Legendary Blade',
  tier: 8 
});
console.log(newItem.uuid); // ITEM-20260225120000-000001-A1B2C3D4
```

---

## 📦 Package Structure

```
@grudge-studio/core/
├── integrations/
│   ├── grudge-studio-core.js        # Main API client
│   ├── warlord-crafting-suite-integration.tsx  # React/TypeScript
│   └── GrudgeWarlords-Unity-Integration.cs     # Unity C#
├── sdk/
│   └── grudge-sdk.js                 # Legacy SDK
├── utils/
│   ├── item-registry.js              # Single source of truth
│   └── image-generator.js            # AI image generation
├── css/
│   └── tier-system.css               # T1-T8 styling
└── types/
    └── index.d.ts                    # TypeScript definitions
```

---

## 🔗 Integration Examples

### 1. Warlord-Crafting-Suite (React/TypeScript)

**File**: `src/components/Arsenal/ArsenalTab.tsx`

```typescript
import { ArsenalWeapons } from '@grudge-studio/core/integrations/warlord-crafting-suite-integration';

export default function ArsenalTab() {
  return (
    <div className="arsenal-container">
      <h1>Arsenal - Weapon Database</h1>
      <ArsenalWeapons />
    </div>
  );
}
```

**Features**:
- ✅ Automatic T1-T8 weapon generation
- ✅ Tier filtering and search
- ✅ UUID display with copy-to-clipboard
- ✅ Real-time data from ObjectStore

---

### 2. GrudgeWarlords (Unity C#)

**File**: `Assets/Scripts/API/GrudgeStudioAPI.cs`

Copy `integrations/GrudgeWarlords-Unity-Integration.cs` to your Unity project.

**Setup**:
```csharp
using GrudgeStudio;

public class GameManager : MonoBehaviour
{
    async void Start()
    {
        // Initialize on game start
        bool success = await GrudgeStudioAPI.Instance.Initialize();
        
        if (success)
        {
            // Create player's starting weapon
            var sword = GrudgeStudioAPI.Instance.CreateItem("legendary-blade", tier: 1);
            Debug.Log($"Created weapon: {sword.uuid}");
            
            // Get all swords
            var swords = GrudgeStudioAPI.Instance.GetWeaponsByCategory("Swords");
            Debug.Log($"Loaded {swords.Count} swords");
        }
    }
}
```

**Features**:
- ✅ Async initialization with caching
- ✅ GRUDGE UUID generation
- ✅ Weapons/Materials/Armor databases
- ✅ WebGL and standalone builds

---

### 3. GrudgeStudioNPM (Node.js Package)

**File**: `src/index.js`

```javascript
import { GrudgeStudioAPI } from '@grudge-studio/core';

const api = new GrudgeStudioAPI({
  objectStoreUrl: 'https://molochdagod.github.io/ObjectStore'
});

await api.initialize();

// Export for other packages
export { api as grudgeAPI };
export { ItemRegistry } from '@grudge-studio/core/utils';
```

---

### 4. PuterGrudge (Backend Server)

**File**: `server/grudge-integration.js`

```javascript
import { initGrudgeStudio } from '@grudge-studio/core';

const api = await initGrudgeStudio({
  objectStoreUrl: process.env.OBJECTSTORE_URL,
  puterEnabled: true,
  puterApiKey: process.env.PUTER_API_KEY
});

// API endpoint
app.get('/api/items/:uuid', async (req, res) => {
  const item = await api.getItem(req.params.uuid);
  res.json(item);
});

// Generate item images
app.post('/api/generate-icon', async (req, res) => {
  const { itemName, tier } = req.body;
  const imageUrl = await api.generateImage(itemName, tier);
  res.json({ imageUrl });
});
```

---

### 5. grudge-warlords (Voxel RPG)

**File**: `src/systems/ItemSystem.js`

```javascript
import { ItemRegistry } from '@grudge-studio/core/utils';

class ItemSystem {
  constructor() {
    this.registry = new ItemRegistry();
  }
  
  async loadItems() {
    const response = await fetch('https://molochdagod.github.io/ObjectStore/api/v1/weapons.json');
    const data = await response.json();
    
    // Register all weapons
    for (const [category, weaponData] of Object.entries(data.categories)) {
      for (const weapon of weaponData.items) {
        this.registry.register({
          ...weapon,
          category,
          source: 'ObjectStore'
        });
      }
    }
    
    console.log(`[ItemSystem] Loaded ${this.registry.getTotalCount()} items`);
  }
  
  getItem(uuid) {
    return this.registry.getByUUID(uuid);
  }
}
```

---

## 🆔 GRUDGE UUID System

All items, heroes, and game entities use the Arsenal UUID format:

### Format
```
{PREFIX}-{TIMESTAMP}-{SEQUENCE}-{HASH}
```

### Examples
```javascript
ITEM-20260225120000-000001-A1B2C3D4  // Weapon
HERO-20260225120530-000042-B2C3D4E5  // Player character
MATL-20260225121500-000123-C3D4E5F6  // Material
EQIP-20260225122000-000234-D4E5F6G7  // Equipment piece
```

### Prefixes
| Entity Type | Prefix | Example |
|-------------|--------|---------|
| Hero | `HERO` | HERO-20260225120000-000001-A1B2C3D4 |
| Item | `ITEM` | ITEM-20260225120000-000001-A1B2C3D4 |
| Equipment | `EQIP` | EQIP-20260225120000-000001-A1B2C3D4 |
| Ability | `ABIL` | ABIL-20260225120000-000001-A1B2C3D4 |
| Material | `MATL` | MATL-20260225120000-000001-A1B2C3D4 |
| Recipe | `RECP` | RECP-20260225120000-000001-A1B2C3D4 |
| Node | `NODE` | NODE-20260225120000-000001-A1B2C3D4 |
| Mob | `MOBS` | MOBS-20260225120000-000001-A1B2C3D4 |
| Boss | `BOSS` | BOSS-20260225120000-000001-A1B2C3D4 |
| Mission | `MISS` | MISS-20260225120000-000001-A1B2C3D4 |

### Generate UUID (JavaScript)
```javascript
const uuid = api.generateUUID('item', { name: 'Custom Sword', tier: 5 });
```

### Generate UUID (Unity C#)
```csharp
string uuid = GrudgeStudioAPI.Instance.GenerateUUID("item", "custom-sword-t5");
```

---

## 🎨 Tier System (T1-T8)

All items use the same base icon but different colored borders/backgrounds:

### Import CSS
```html
<link rel="stylesheet" href="https://molochdagod.github.io/ObjectStore/css/tier-system.css">
```

### HTML Usage
```html
<div class="item-icon tier-1">
  <img src="icons/Sword_01.png" alt="Bronze Sword">
</div>

<div class="item-icon tier-8">
  <img src="icons/Axe_02.png" alt="Legendary Axe">
</div>
```

### Tier Colors
- **T1 Bronze**: `#8b7355` - Common items
- **T2 Silver**: `#a8a8a8` - Uncommon items
- **T3 Blue**: `#4a9eff` - Rare items
- **T4 Purple**: `#9d4dff` - Epic items
- **T5 Red**: `#ff4d4d` - Legendary items
- **T6 Orange**: `#ffaa00` - Mythic items
- **T7 Gold**: `#d4a84b` - Ancient items
- **T8 Shimmering**: `#f0d890` - Legendary artifacts (animated)

### JavaScript Usage
```javascript
function renderItem(item) {
  return `
    <div class="item-icon tier-${item.tier}">
      <img src="${item.iconUrl}" alt="${item.name}">
      <span class="item-tier">T${item.tier}</span>
    </div>
  `;
}
```

---

## 🖼️ AI Image Generation

Generate item icons using Puter.js AI:

### JavaScript
```javascript
import { ImageGenerator } from '@grudge-studio/core/utils';

const generator = new ImageGenerator();

// Generate single image
const imageUrl = await generator.generateItemIcon({
  name: 'Flaming Sword',
  tier: 5,
  category: 'weapon',
  properties: {
    primaryStat: 'strength',
    secondaryStat: 'fire damage'
  }
});

// Batch generation (with rate limiting)
const items = [
  { name: 'Iron Sword', tier: 1 },
  { name: 'Steel Axe', tier: 2 },
  { name: 'Mythril Hammer', tier: 3 }
];

const results = await generator.generateBatch(items);
```

### Features
- ✅ Smart prompt building based on item properties
- ✅ Automatic caching (localStorage)
- ✅ Batch generation with rate limiting (500ms delay)
- ✅ Fallback to emoji if generation fails

---

## 📊 API Reference

### GrudgeStudioAPI Class

#### Initialize
```javascript
const api = await initGrudgeStudio(config);
```

**Config Options**:
```typescript
{
  objectStoreUrl: string;      // Default: https://molochdagod.github.io/ObjectStore
  arsenalUrl?: string;         // Default: https://warlord-crafting-suite.vercel.app
  puterEnabled?: boolean;      // Default: false
  puterApiKey?: string;        // Required if puterEnabled
  cache?: boolean;             // Default: true
  debug?: boolean;             // Default: false
}
```

#### Methods

**search(query, filters?)**
```javascript
// Search all items
const results = await api.search('sword');

// Search with filters
const items = await api.search('legendary', {
  tier: 8,
  category: 'weapon',
  primaryStat: 'strength'
});
```

**getItem(uuid)**
```javascript
const item = await api.getItem('ITEM-20260225120000-000001-A1B2C3D4');
```

**createItem(data)**
```javascript
const item = api.createItem({
  type: 'weapon',
  name: 'Legendary Blade',
  tier: 8,
  primaryStat: 'strength',
  secondaryStat: 'critical'
});
```

**generateUUID(entityType, metadata?)**
```javascript
const uuid = api.generateUUID('item', { name: 'Custom Item' });
```

**getWeapons(filters?)**
```javascript
const weapons = await api.getWeapons({ tier: 5 });
```

**getMaterials(filters?)**
```javascript
const materials = await api.getMaterials({ gatheredBy: 'mining' });
```

---

## 🚀 Deployment

### Publishing to NPM

1. **Login to NPM**:
```bash
npm login
```

2. **Publish Package**:
```bash
cd D:\GrudgeLink\OneDrive\Desktop\ObjectStore
npm publish --access public
```

3. **Update Version**:
```bash
npm version patch  # 2.1.0 -> 2.1.1
npm version minor  # 2.1.0 -> 2.2.0
npm version major  # 2.1.0 -> 3.0.0
```

### GitHub Pages Deployment

ObjectStore is already deployed at:
```
https://molochdagod.github.io/ObjectStore
```

To update:
```bash
git add .
git commit -m "Update ObjectStore API"
git push origin main
```

GitHub Actions automatically deploys to GitHub Pages.

---

## 🔧 Integration Checklist

### High Priority Projects

- [ ] **Warlord-Crafting-Suite** (TypeScript/React)
  - [ ] Install `@grudge-studio/core`
  - [ ] Add Arsenal tab with `ArsenalWeapons` component
  - [ ] Import tier-system.css
  - [ ] Test UUID generation

- [ ] **GrudgeWarlords** (Unity WebGL)
  - [ ] Copy `GrudgeWarlords-Unity-Integration.cs` to Assets/Scripts/API/
  - [ ] Attach to GameManager GameObject
  - [ ] Initialize on Start()
  - [ ] Test weapon loading

- [ ] **GrudgeStudioNPM** (Node.js)
  - [ ] Add `@grudge-studio/core` as dependency
  - [ ] Export GrudgeStudioAPI
  - [ ] Update package.json version

### Medium Priority Projects

- [ ] **grudge-warlords** (Voxel RPG)
  - [ ] Integrate ItemRegistry
  - [ ] Load ObjectStore data
  - [ ] Use tier system for UI

- [ ] **PuterGrudge** (Backend)
  - [ ] Add API endpoints
  - [ ] Enable Puter.js image generation
  - [ ] Cache generated images

- [ ] **GrudgeGameIslands** (WebGL)
  - [ ] Load materials database
  - [ ] Implement crafting system
  - [ ] Use GRUDGE UUIDs

---

## 📚 Additional Resources

### Documentation
- [GitHub Wiki](https://github.com/MolochDaGod/ObjectStore/wiki)
- [API Reference](https://molochdagod.github.io/ObjectStore/api/v1/)
- [Deployment Guide](WIKI-DEPLOYMENT.md)

### Live Demos
- [ObjectStore Browser](https://molochdagod.github.io/ObjectStore)
- [Sprite Database](https://molochdagod.github.io/ObjectStore/SPRITE_DATABASE.html)
- [Warlord Crafting Suite](https://warlord-crafting-suite.vercel.app)

### Contact
- Website: [grudgewarlords.com](https://grudgewarlords.com)
- GitHub: [@MolochDaGod](https://github.com/MolochDaGod)
- Email: contact@grudgewarlords.com

---

## 🎮 Game Integration Examples

### Example 1: Load Player Inventory
```javascript
const api = await initGrudgeStudio();

// Load player's saved items by UUID
const playerItems = [
  'ITEM-20260225120000-000001-A1B2C3D4',
  'EQIP-20260225120530-000042-B2C3D4E5',
  'MATL-20260225121500-000123-C3D4E5F6'
];

const inventory = await Promise.all(
  playerItems.map(uuid => api.getItem(uuid))
);

console.log('Inventory loaded:', inventory);
```

### Example 2: Crafting System
```javascript
// Get recipe
const recipe = await api.getRecipe('RECP-20260225120000-000001-A1B2C3D4');

// Check materials
const hasMaterials = recipe.materials.every(mat => 
  inventory.some(item => item.uuid === mat.uuid && item.quantity >= mat.required)
);

if (hasMaterials) {
  // Craft item
  const craftedItem = api.createItem({
    type: 'weapon',
    name: recipe.result.name,
    tier: recipe.result.tier
  });
  
  // Save to player inventory
  await saveToDatabase(craftedItem);
}
```

### Example 3: Loot Drop System
```javascript
// Generate loot from boss
const boss = await api.getBoss('BOSS-20260225120000-000001-A1B2C3D4');

const loot = boss.lootTable.map(lootItem => {
  if (Math.random() < lootItem.dropRate) {
    return api.createItem({
      type: lootItem.type,
      name: lootItem.name,
      tier: lootItem.tier
    });
  }
}).filter(Boolean);

console.log('Boss dropped:', loot);
```

---

**Last Updated**: February 25, 2026  
**Version**: 2.1.0  
**Maintained by**: Grudge Studio Team + Oz (oz-agent@warp.dev)

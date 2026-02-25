# Changelog

All notable changes to Grudge Studio ObjectStore.

## [2.1.0] - 2026-02-25

### 🎉 Major Release: Ecosystem Integration

This release transforms ObjectStore from a static data API into a complete ecosystem integration hub for all 35+ Grudge Studio projects.

### ✨ Added

#### Core Integration System
- **NPM Package** (`@grudge-studio/core`): Unified integration layer for all projects
- **package.json**: NPM package configuration for public publishing
- **integrations/grudge-studio-core.js**: Main API client with sub-clients for ObjectStore, Arsenal, and Puter
- **integrations/warlord-crafting-suite-integration.tsx**: React/TypeScript Arsenal component
- **integrations/GrudgeWarlords-Unity-Integration.cs**: Unity C# API with async initialization and caching

#### UUID System
- **GRUDGE UUID**: Universal identifier system using Arsenal format
- **16 Entity Types**: ITEM, HERO, EQIP, MATL, RECP, NODE, MOBS, BOSS, MISS, ABIL, INFU, LOOT, CONS, QUST, ZONE, SAVE
- **Format**: `{PREFIX}-{TIMESTAMP}-{SEQUENCE}-{HASH}`
- **Cross-Project**: Same UUIDs work across all Grudge Studio applications

#### AI & Visual Systems
- **utils/image-generator.js**: Puter.js AI txt2img integration for item icons
- **utils/item-registry.js**: Single source of truth for all game items
- **css/tier-system.css**: T1-T8 tier system with colored borders and animations
  - T1 Bronze → T2 Silver → T3 Blue → T4 Purple → T5 Red → T6 Orange → T7 Gold → T8 Legendary (shimmer)

#### Documentation
- **INTEGRATION-GUIDE.md**: Complete 570+ line integration guide with examples for:
  - JavaScript/TypeScript usage
  - Unity C# implementation
  - React component integration
  - Node.js server setup
  - Game system examples (inventory, crafting, loot drops)
- **WIKI-HOME.md**: GitHub wiki documentation with API reference and ecosystem mapping
- **WIKI-DEPLOYMENT.md**: Deployment guide for GitHub Pages and NPM
- **CHANGELOG.md**: This changelog

### 🔧 Improved

#### Enhanced SPRITE_DATABASE.html
- Fixed icon path resolution to use iconBase/iconMax/iconOffset system
- Corrected weapon icon paths from individual PNGs to numbered system (e.g., `Sword_01.png`)
- Added null checks for DOM elements (weaponCount, materialCount, etc.)
- Improved error handling for missing elements

#### Updated README.md
- Added Quick Start section with NPM installation
- Documented new features (UUID system, AI generation, tier system)
- Added "Supported Projects" section listing all 35+ integrations
- Updated deployment section with NPM publishing instructions
- Modernized project structure to show new files

### 📦 Package Structure

```
@grudge-studio/core/
├── integrations/     # Platform-specific integrations
├── sdk/              # Legacy SDK (backward compat)
├── utils/            # Shared utilities
├── css/              # Tier system styling
└── types/            # TypeScript definitions
```

### 🔗 Integration Points

#### High Priority
- **Warlord-Crafting-Suite**: Arsenal tab with T1-T8 weapons
- **GrudgeWarlords**: Unity WebGL with real-time item loading
- **GrudgeStudioNPM**: NPM package aggregator

#### Medium Priority
- **grudge-warlords**: Voxel RPG with ItemRegistry
- **PuterGrudge**: Backend with AI image generation
- **GrudgeGameIslands**: WebGL with materials system

#### All Projects
35+ repositories identified for integration (see INTEGRATION-GUIDE.md)

### 🚀 Features

#### GrudgeStudioAPI Client
- `initialize()`: Load all databases with parallel fetching
- `search(query, filters)`: Unified search across all items
- `getItem(uuid)`: Fetch item by GRUDGE UUID
- `createItem(data)`: Create item with auto-UUID generation
- `generateUUID(type, metadata)`: Generate GRUDGE UUIDs
- `getWeapons/getMaterials/getArmor`: Category-specific getters
- `generateImage(item, tier)`: AI image generation (optional)

#### Unity Integration
- `GrudgeStudioAPI.Instance`: Singleton MonoBehaviour
- `Initialize()`: Async initialization with caching
- `GetWeapon(id)`: Fetch weapon by ID
- `GetWeaponsByCategory(category)`: Category filtering
- `CreateItem(id, tier)`: Instantiate items with UUIDs
- `GenerateUUID(type, metadata)`: C# UUID generation
- WebGL and standalone build support

#### Item Registry
- `register(item)`: Add item to registry
- `search(query, filters)`: Flexible search with tier/category/stat filtering
- `validate(item)`: Data validation
- `getByCategory/Type/Tier`: Category getters
- Duplicate prevention and statistics tracking

#### Image Generator
- `generateItemIcon(item)`: Single image generation
- `generateBatch(items)`: Batch with rate limiting (500ms delay)
- Smart prompt building from item properties
- localStorage caching
- Fallback to emoji on failure

### 🎨 Tier System

Visual system where items share base icons but use different colored borders:

| Tier | Color | Hex | Name |
|------|-------|-----|------|
| T1 | Bronze | #8b7355 | Common |
| T2 | Silver | #a8a8a8 | Uncommon |
| T3 | Blue | #4a9eff | Rare |
| T4 | Purple | #9d4dff | Epic |
| T5 | Red | #ff4d4d | Legendary |
| T6 | Orange | #ffaa00 | Mythic |
| T7 | Gold | #d4a84b | Ancient |
| T8 | Shimmering | #f0d890 | Legendary (animated) |

### 📊 Statistics

- **816+ Weapons**: 17 categories × 6 weapons × 8 tiers
- **35+ Repositories**: Integration points identified
- **16 Entity Types**: UUID prefixes
- **659+ Icons**: PNG sprites
- **8 Tiers**: Visual system
- **570+ Lines**: Integration guide

### 🔄 Migration Guide

#### From Legacy SDK
```javascript
// Old
import { GrudgeSDK } from 'sdk/grudge-sdk.js';
const sdk = new GrudgeSDK();

// New
import { initGrudgeStudio } from '@grudge-studio/core';
const api = await initGrudgeStudio();
```

#### Unity (New)
```csharp
using GrudgeStudio;

async void Start() {
    await GrudgeStudioAPI.Instance.Initialize();
    var sword = GrudgeStudioAPI.Instance.GetWeapon("legendary-blade");
}
```

### 🚀 Deployment

#### NPM Publishing
```bash
npm login
npm publish --access public
```

#### GitHub Pages
Automatically deployed on push to `main` branch at:
https://molochdagod.github.io/ObjectStore

### 📝 Notes

- Legacy SDK (`sdk/grudge-sdk.js`) maintained for backward compatibility
- All new projects should use `@grudge-studio/core`
- Puter.js integration is optional (requires API key)
- UUID system compatible with existing Arsenal implementation

### 👥 Contributors

- Grudge Studio Team
- Oz (oz-agent@warp.dev)

---

## [2.0.0] - Previous Release

Initial ObjectStore release with static JSON API and legacy SDK.

### Added
- Static JSON API for weapons, materials, armor
- Icons and sprite system
- Basic SDK with caching
- GitHub Pages deployment

---

**Format**: [Semantic Versioning](https://semver.org/)

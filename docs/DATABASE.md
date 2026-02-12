# Grudge Studio Database Architecture

## Overview

Grudge Studio uses a hybrid data architecture:

1. **ObjectStore (Static)** - Game definitions, no auth needed
2. **Supabase (Dynamic)** - Player data, requires authentication

## ObjectStore API (Public, Read-Only)

No authentication required. Perfect for AI agents.

### Base URL
```
https://grudge-studio.github.io/ObjectStore
```

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/weapons.json` | All weapon definitions |
| `GET /api/v1/materials.json` | Crafting materials |
| `GET /api/v1/armor.json` | Armor slots and tier info |
| `GET /api/v1/consumables.json` | Potions, food, grenades |

### Example Usage
```javascript
const weapons = await fetch('https://grudge-studio.github.io/ObjectStore/api/v1/weapons.json')
  .then(r => r.json());

// Get all sword names
const swordNames = weapons.categories.swords.items.map(w => w.name);
```

---

## Supabase Database (Player Data)

**Project URL:** `https://wfbcuyaiwtfxincdiihc.supabase.co`

### Schema: `public` (Default)

#### accounts
Primary user account table - SINGLE source of truth for authentication.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `grudge_id` | varchar(64) | Unique GRUDGE-{timestamp}-{random} |
| `username` | varchar(50) | Unique username |
| `password_hash` | varchar(255) | bcrypt hash |
| `wallet_address` | varchar(255) | Solana wallet (optional) |
| `puter_uuid` | varchar(255) | Puter auth (optional) |
| `is_premium` | boolean | Premium subscription status |
| `gold` | integer | Account-wide gold |
| `gbux_balance` | integer | Premium currency |
| `created_at` | bigint | Unix timestamp |

#### characters
Player characters with RPG stats.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `account_id` | uuid | FK → accounts.id |
| `name` | varchar | Character name |
| `class_id` | varchar | Class (warrior, mage, etc.) |
| `race_id` | varchar | Race |
| `profession` | varchar | Active gathering profession |
| `level` | integer | Character level (1-100) |
| `experience` | integer | Current XP |
| `gold` | integer | Character gold |
| `skill_points` | integer | Unspent skill points |
| `attributes` | jsonb | {Strength, Vitality, etc.} |
| `equipment` | jsonb | Equipped item IDs |
| `profession_progression` | jsonb | XP per profession |

#### inventory_items
Player inventory.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `character_id` | uuid | FK → characters.id |
| `item_id` | varchar | Reference to item definition |
| `quantity` | integer | Stack count |
| `tier` | integer | Item tier (1-8) |
| `grudge_uuid` | varchar | Unique item tracking ID |
| `metadata` | jsonb | Enchants, sockets, etc. |

#### islands
Player home islands.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `account_id` | uuid | FK → accounts.id |
| `name` | varchar | Island name |
| `biome` | varchar | Island type |
| `resources` | jsonb | Resource nodes |
| `buildings` | jsonb | Placed structures |

---

## AI Integration Guide

### For Game Data (No Auth)
Use ObjectStore endpoints directly:

```python
import requests

# Get all weapons
weapons = requests.get(
    'https://grudge-studio.github.io/ObjectStore/api/v1/weapons.json'
).json()

# Find a specific weapon
def find_weapon(weapon_id):
    for category in weapons['categories'].values():
        for item in category['items']:
            if item['id'] == weapon_id:
                return item
    return None
```

### For Player Data (Requires Auth)
Contact Grudge Studio for API key access to player data.

```javascript
// With API key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get character inventory
const { data } = await supabase
  .from('inventory_items')
  .select('*, characters(name)')
  .eq('character_id', characterId);
```

---

## Best Practices

1. **Cache Static Data** - ObjectStore data rarely changes
2. **Use Pagination** - Large queries should use limit/offset
3. **Respect Rate Limits** - Supabase has connection limits
4. **No Sensitive Data in Logs** - Never log API keys or passwords

## Contact

- Website: https://grudgewarlords.com
- Support: support@grudgestudio.com

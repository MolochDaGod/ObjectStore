# Weapon Skills, Stats & Attributes — Canonical Connections

How **weapon base stats**, **SKIL-*** abilities, **8 attributes**, and **37 derived stats** connect in ObjectStore.

| Resource | URL |
|----------|-----|
| **Connection bridge** | `/api/v1/weapon-stat-bridge.json` |
| **Pattern meta** | `/api/v1/_meta/weapon-stats-attributes.json` |
| **8 attributes** | `/api/v1/master-attributes.json` |
| **Weapon skills** | `/api/v1/master-weaponSkills.json` |
| **Runtime prefabs** | `/api/v1/master-weapon-prefabs.json` |
| **primaryStat map** | `/api/v1/_meta/ability-aliases.json` → `primaryStatToAttribute` |

---

## The 8 attributes

| Abbrev | Name | Typical weapons |
|--------|------|-----------------|
| STR | Strength | Swords, axes, hammers |
| VIT | Vitality | Shields, tanks |
| END | Endurance | Stamina skills, tools |
| INT | Intelligence | Staves, wands, tomes |
| WIS | Wisdom | Holy/nature magic |
| DEX | Dexterity | Bows, daggers, spears |
| AGI | Agility | Attack speed, mobility |
| TAC | Tactics | Armor pen, strategic builds |

Source: `master-attributes.json` (from WCS `attributeSystem.ts`).

---

## Weapon base stats → derived stats

Each prefab has `stats` and `statConnections.weaponStats`:

| Weapon field | Derived stat | Scales with |
|--------------|--------------|-------------|
| `damage` | damage | STR, DEX |
| `speed` | attackSpeed | AGI, DEX |
| `crit` | criticalChance | DEX, AGI |
| `block` | block | STR, VIT |
| `defense` | defense | VIT, END |
| `combo` | comboCooldownRed | DEX, TAC |

Combat uses the **8-step pipeline** in `master-attributes.json` → `combatFormulas`.

---

## Design-layer stats → attributes

Named weapons use `primaryStat` / `secondaryStat` (e.g. `damage`, `lifesteal`, `burn`).

Mapped via `primaryStatToAttribute`:

```json
{
  "damage": "STR",
  "crit": "DEX",
  "burn": "INT",
  "armorPen": "TAC",
  "efficiency": "END"
}
```

On each prefab:

```json
{
  "primaryStat": "damage",
  "attributeAffinity": { "primary": "STR", "secondary": null },
  "statConnections": {
    "primaryAttribute": { "abbrev": "STR", "uuid": "ATTR-…", "from": "damage" }
  }
}
```

---

## SKIL-* → attributes

Every skill in `master-weaponSkills.json` has `statConnections`:

```json
{
  "id": "sword_vengeful_slash",
  "damage": 45,
  "damageType": "physical",
  "resourceCost": { "mana": 0, "stamina": 3 },
  "statConnections": {
    "scalesWith": ["STR", "DEX"],
    "primaryAttribute": "STR",
    "resourceAttribute": "END",
    "derivedStats": ["damage"],
    "damageType": "physical",
    "slotRole": "primary"
  }
}
```

### Damage type → attributes

| damageType | scalesWith |
|------------|------------|
| physical | STR, DEX |
| fire / frost / arcane / lightning | INT, WIS |
| holy / nature | WIS, INT |

### Resource costs

| Cost | Attribute |
|------|-----------|
| `resourceCost.mana` | INT |
| `resourceCost.stamina` | END |

---

## Prefab runtime graph

```
master-attributes.json (ATTR-*)
        ↓ scalesWith / gains
prefab.stats + prefab.statConnections.weaponStats
        ↓
prefab.skills.slots → SKIL-* (master-weaponSkills.json)
        ↓ statConnections per skill
Combat pipeline (8 steps) → derived stat caps
```

Each prefab in `master-weapon-prefabs.json` includes:

- `stats` — base numbers
- `attributeAffinity` — STR/DEX/… from primaryStat
- `statConnections` — full graph (weaponStats + per-skill links)
- `skills.slots` — SKIL-* UUID bindings

---

## SDK

```javascript
const bridge = await sdk.getWeaponStatBridge();
const attrs = await sdk.getMasterAttributes();
const { prefabs } = await sdk.getWeaponPrefabs();

const sword = prefabs.find(p => p.id === 'bloodfeud-blade-t1');
console.log(sword.statConnections.primaryAttribute);  // STR
console.log(sword.statConnections.weaponStats.damage);

const skills = await sdk.getWeaponSkills();
const slash = skills.weaponTypes
  .find(w => w.id === 'SWORD').slots[0].skills[0];
console.log(slash.statConnections.scalesWith);  // ['STR','DEX']
```

---

## Build pipeline

```bash
npm run enrich:skill-stat-connections  # SKIL-*.statConnections
npm run build:weapon-prefabs           # prefab.statConnections
npm run build:weapon-stat-bridge       # weapon-stat-bridge.json
```

Or: `npm run build:weapon-pipeline`

---

## Related

- [stats-guide.html](../stats-guide.html) — interactive attribute reference
- [CANONICAL-EQUIPMENT.md](./CANONICAL-EQUIPMENT.md) — prefab + harvest tool standard
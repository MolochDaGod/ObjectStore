# Class soft passives migration

**SSOT:** `api/v1/class-equipment-rules.json` v1.2.0  
**UI:** main-panel Attributes (right) + Skills → Class skill tree  
**Script:** `scripts/migrate-class-passives-icons.mjs`

## Policy (correct)

| Before (1.0) | After (1.2) |
|--------------|-------------|
| Hard `blocked` / `offHandAllowed` | **No equip bans** |
| Dual only Warrior | Dual **allowed** for all; Warrior efficient |
| Text-only equip rules | **Passives** with icons + WoW tooltips |
| Mults optional | Mults drive combat contribution |

## Runtime API (`MainPanelSystems`)

```js
canEquipWeapon(classKey, type)           // always true
canEquipArmor(classKey, type)            // always true
canDualWield(classKey)                   // always true
getWeaponEffectiveness(classKey, type)
getArmorEffectiveness(classKey, type)
getDualWieldEffectiveness(classKey)
applyClassGearEffectiveness(classKey, 'weapon'|'armor', type, stats)
```

Combat: `finalStat = baseStat * mult` (preferred > 1, off-type < 1).

## UI

1. **Top of class skill tab / Attributes class panel:** spellbook passive row  
   - Class gear passives (armor / weapon / dual)  
   - Tree skills with `"passive": true`  
   - Hover → gold-border tooltip (name, rank, desc, ±% lines)  
2. **Below:** soft effectiveness reference chips  
3. **Skill tree grid:** active / investable skills only (passives not duplicated)

## Migrate source data

```bash
node scripts/migrate-class-passives-icons.mjs
```

Adds `icon`, `iconUrl`, `tooltipLines`, `alwaysOn`, `rank` on each class passive.

## Wire inventory later

On equip preview / combat derive:

```js
const stats = MainPanelSystems.applyClassGearEffectiveness(
  hero.classKey, 'armor', item.armorType || item.category, item.stats, classEquipRulesData
);
// stats._classEffectiveness is the mult used
```

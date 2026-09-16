# Weapon Passive Stack Effects — Design & Runtime Status

Status effects and passive stacks in Grudge Warlords weapon combat.

**Source repos:**
- Design layer: `MolochDaGod/ObjectStore` (`api/v1/weapons.json`, `studio-manifest.json`)
- Runtime layer: `MolochDaGod/threejs-rapier-react-three-controller` (`lib/epicfight/src/combat/`)

**Last updated:** 2026-08-29

---

## Overview

Weapon passive effects are **damage-over-time (DoT)**, **on-hit amplifiers**, and **conditional triggers** that stack on targets or the wielder during combat. The system has two layers:

| Layer | Status | Source |
|-------|--------|--------|
| **Design definitions** | ✅ Specified | `api/v1/weapons.json`, `studio-manifest.json` |
| **Runtime implementation** | ⚠️ Planned | `threejs-rapier` combat (not yet in CombatController) |

---

## Passive Stack Types (Design Layer)

From `api/v1/studio-manifest.json` and weapon ability descriptions:

| Effect | Type | Duration | Behavior | Max Stacks | Icon/VFX Status |
|--------|------|----------|----------|-----------|-----------------|
| **Bleed** | Physical DoT | 3–8s | Damage per tick, stackable | 3–5 | VFX needed |
| **Burn** | Fire DoT | 3–6s | Damage per tick, spreads on contact | 3 | VFX needed |
| **Poison** | Nature DoT | 4–10s | Damage per tick, reduces healing | 3 | VFX needed |
| **Grudge Mark** | Damage amp | Per hit | 5% damage amplification per stack | 3 | Implemented in design |
| **Chill** | Slow | 3s/stack | Movement slow (15%/stack, max 45%) | 3 | VFX needed |
| **Shock** | Lightning DoT | 2–4s | Lightning damage per tick | 3 | VFX needed |
| **Lifesteal** | On-hit heal | Instant | Heal for % of damage dealt | N/A | VFX needed |
| **Rune Stack** | Power-up | Permanent | Gain stacks on hit/kill, consume for burst | 10 | Design only |

**Source files:**
- `api/v1/studio-manifest.json:248-281` — status effect catalog
- `api/v1/weapons.json` — weapon ability references (Grudge Mark, bleed, burn, etc.)

---

## Runtime Combat System (threejs-rapier)

Current implementation in `lib/epicfight/src/combat/`:

### Implemented (CombatController.ts)

| System | Status | Source |
|--------|--------|--------|
| **Health / Stamina / Poise** | ✅ Implemented | `CombatController.ts:35-37` |
| **Crit Window** | ✅ Implemented | Opens 2s guaranteed-crit after vulnerable states |
| **Vulnerable States** | ✅ Implemented | `stunned`, `fallen`, `parried`, `dodgePunished` |
| **Super Armor** | ✅ Implemented | `AttackMove.superArmor` flag |
| **Shield Break** | ✅ Implemented | `AttackMove.shieldBreak` flag |
| **Block Stamina Tax** | ✅ Implemented | Damage / 5 = stamina cost while blocking |

**Source:** `threejs-rapier-react-three-controller/lib/epicfight/src/combat/CombatController.ts`

### NOT Implemented (Planned)

| System | Status | Design Reference |
|--------|--------|------------------|
| **DoT Status Effects** | ❌ Not in CombatController | Bleed, burn, poison, shock |
| **Stack Management** | ❌ Not in runtime | Apply, refresh, max stacks, duration |
| **On-Hit Passives** | ❌ Not in runtime | Grudge Mark amplification |
| **Lifesteal** | ❌ Not in runtime | Heal on damage |

---

## Weapon-Type Passive Examples (From Design)

### Sword — Grudge Mark

**Source:** `api/v1/weapons.json:34` (Bloodfeud Blade)

| Field | Value |
|-------|-------|
| **Apply condition** | On hit (basic attack) |
| **Effect** | 5% damage amplification per stack |
| **Max stacks** | 3 |
| **Duration** | Not specified in source |
| **Weapon family** | Swords (1H melee) |
| **SKIL-* binding** | Vengeful Slash |

**Runtime gap:** Stack application and amp calculation not in `CombatController`.

### Dagger — Bleed / Poison

**Source:** `api/v1/weapons.json:41,290,550,715` (Bleed), `api/v1/weapons.json:548,712` (Poison)

| Effect | Apply Condition | Duration | Max Stacks | Damage Type |
|--------|----------------|----------|-----------|-------------|
| **Bleed** | On hit or ability | 3–8s | 3-5 | Physical DoT |
| **Poison** | Poison Shiv ability | 4–10s | 3 | Nature DoT |

**Runtime gap:** DoT tick system not in `CombatController`.

### Axe — Burn / Lifesteal

**Source:** `api/v1/weapons.json:246,377` (Ember Axe, Veinreaver)

| Effect | Apply Condition | Duration | Max Stacks | Notes |
|--------|----------------|----------|-----------|-------|
| **Burn** | Flame Slash ability | 3–6s | 3 | Fire DoT, spreads on contact |
| **Lifesteal** | Blood Harvest (AoE) | Instant | N/A | Heal for % damage |

**Runtime gap:** Burn spread mechanic and lifesteal healing not in `CombatController`.

### Greatsword — Rune Stack (Runed Great Sword)

**Source:** `api/v1/weapons.json:2884-2915`

| Field | Value |
|-------|-------|
| **Apply condition** | On kill (or 3 hits via passive) |
| **Effect** | +3% damage per stack |
| **Max stacks** | 10 |
| **Consume** | Rune Explosion (50% weapon damage × stacks, 10m AoE) |
| **Special** | Stacks persist through death (lose half on respawn) |

**Runtime gap:** Stack persistence across death not in `CombatController`.

---

## Weapon Abilities with Passive Triggers

From `api/v1/weapons.json` design layer:

| Weapon Type | Ability | Effect | Max Stacks | Source Line |
|-------------|---------|--------|-----------|-------------|
| Sword | Vengeful Slash | Grudge Mark (5% amp) | 3 | `:34` |
| Sword | Deep Wound | Bleed stack | 3–5 | `:41` |
| Dagger | Poison Shiv | Poison DoT | 3 | `:548,712` |
| Dagger | Crimson Stab | Bleed | 5 | `:550` |
| Dagger | Crimson Stab | Bleed | 3-5 | `:715` |
| Axe | Flame Slash | Burn stack | 3 | `:246` |
| Axe | Blood Harvest | Lifesteal AoE | N/A | `:377` |
| Bow | Crimson Shot | Bleed (single target) | 3 | `:1471` |
| Staff (Fire) | Fire Bolt | Burn stack | 3 | `:2234` |
| Staff (Fire) | Flame Nova | Explode all burns | N/A | `:2242` |
| Staff (Frost) | Frost Bolt | Chill stack | 3 | `:2367` |
| Staff (Lightning) | Thunder Bolt | Shock stack | 3 | `:2633` |
| Greatsword | Runic Cleave | Rune Stack (+3% dmg) | 10 | `:2904` |

**All weapon abilities:** `api/v1/weapons.json`  
**Skill-to-SKIL UUID mapping:** `api/v1/master-weaponSkills.json`

---

## Implementation Requirements (For Runtime)

To bring passive stacks from design into the combat runtime:

### 1. Status Effect Manager

Add to `CombatController` or create `StatusEffectController`:

```typescript
interface StatusEffect {
  type: 'bleed' | 'burn' | 'poison' | 'grudgeMark' | 'chill' | 'shock';
  stacks: number;
  maxStacks: number;
  duration: number; // seconds remaining
  tickInterval?: number; // for DoTs
  damagePerTick?: number;
  amplification?: number; // for grudge mark
}
```

### 2. Stack Application

On hit callback in `CombatController.applyAttack`:

```typescript
applyStatusEffect(effect: StatusEffect): void {
  const existing = this.statusEffects.get(effect.type);
  if (existing) {
    existing.stacks = Math.min(existing.maxStacks, existing.stacks + 1);
    existing.duration = effect.duration; // refresh
  } else {
    this.statusEffects.set(effect.type, { ...effect, stacks: 1 });
  }
}
```

### 3. DoT Tick System

In `CombatController.update(dt)`:

```typescript
for (const [type, effect] of this.statusEffects) {
  effect.duration -= dt;
  if (effect.duration <= 0) {
    this.statusEffects.delete(type);
    continue;
  }
  
  if (effect.tickInterval) {
    effect.tickTimer = (effect.tickTimer || 0) + dt;
    if (effect.tickTimer >= effect.tickInterval) {
      this.applyDoTDamage(effect);
      effect.tickTimer = 0;
    }
  }
}
```

### 4. Damage Amplification

Modify damage calculation to include stacks:

```typescript
private calculateFinalDamage(baseDamage: number): number {
  let damage = baseDamage;
  const grudgeMark = this.statusEffects.get('grudgeMark');
  if (grudgeMark) {
    damage *= 1 + (0.05 * grudgeMark.stacks); // 5% per stack
  }
  return Math.round(damage);
}
```

**Target file:** `threejs-rapier-react-three-controller/lib/epicfight/src/combat/CombatController.ts`

---

## VFX Requirements

From `api/v1/studio-manifest.json:77,248-281`:

| Effect | VFX Needed | Icon Needed | Suggested Asset |
|--------|------------|-------------|-----------------|
| Bleed | ✅ | ✅ | `/sprites/effects/physical/red_crit_bleed.png` |
| Poison | ✅ | ✅ | `/sprites/effects/poison/poison_blast.png` |
| Burn | ✅ | ✅ | `/sprites/effects/pixel/16_sunburn_spritesheet.png` |
| Freeze | ✅ | ✅ | Not yet in sprites2d.json |
| Shock | ✅ | ✅ | Not yet in sprites2d.json |

**VFX sprite catalog:** `api/v1/sprites2d.json:6570-7813`  
**VFX implementation:** `threejs-rapier` `/VfxSystem` or shader trails

---

## Related Files

| File | Role |
|------|------|
| `api/v1/weapons.json` | Weapon design layer with passive references |
| `api/v1/studio-manifest.json` | Status effect catalog (lines 248-281) |
| `api/v1/master-weaponSkills.json` | Skill UUIDs and cooldowns |
| `api/v1/weapon-stat-bridge.json` | Stat → attribute connections |
| `api/v1/sprites2d.json` | VFX sprite assets |
| `docs/WEAPON-STATS-ATTRIBUTES.md` | Weapon stat scaling system |
| `threejs-rapier/lib/epicfight/src/combat/CombatController.ts` | Runtime combat state machine |
| `threejs-rapier/lib/epicfight/src/combat/types.ts` | Combat type definitions |
| `threejs-rapier/docs/STACK_AUDIT_COMBAT_RENDER_DEPLOY.md` | Stack system audit |

---

## Summary

| Aspect | Status |
|--------|--------|
| **Design layer** | ✅ Complete — passive effects specified in weapons.json |
| **Runtime layer** | ⚠️ **NOT IMPLEMENTED** — CombatController lacks DoT/stack system |
| **VFX assets** | ⚠️ Partial — bleed/poison sprites exist, others needed |
| **Combat integration** | ❌ Requires StatusEffectController + DoT tick system |

**Next steps for implementation:**

1. Add `StatusEffect` type to `combat/types.ts`
2. Implement `StatusEffectController` or extend `CombatController`
3. Wire skill abilities to `applyStatusEffect` calls
4. Add DoT tick logic to `update()` loop
5. Create VFX sprites for missing effects
6. Update `api/v1/weapon-passive-stacks.json` with runtime UUIDs

**Do not invent:** All passive effects listed here are extracted from existing source files. No runtime implementation exists yet in the threejs-rapier combat controller as of 2026-08-29.

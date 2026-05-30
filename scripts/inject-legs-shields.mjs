#!/usr/bin/env node
/**
 * inject-legs-shields.mjs
 *
 * Adds missing Legs slot to armor.json and shields category to weapons.json.
 * Also fixes known inconsistencies (e.g. natureStaves iconBase casing).
 *
 * Usage: node scripts/inject-legs-shields.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ARMOR_PATH = join(ROOT, 'api', 'v1', 'armor.json');
const WEAPONS_PATH = join(ROOT, 'api', 'v1', 'weapons.json');

// ── LEGS ────────────────────────────────────────────────────────────────
const LEGS_STAT_SCALE = {
  cloth:   { hpBase: 55, hpPerTier: 11, manaBase: 110, manaPerTier: 23, critBase: 5.5, critPerTier: 0.55, blockBase: 1.1, blockPerTier: 0.11, defenseBase: 11, defensePerTier: 2.2 },
  leather: { hpBase: 60, hpPerTier: 12, staminaBase: 90, staminaPerTier: 19, critBase: 6, critPerTier: 0.6, blockBase: 1, blockPerTier: 0.1, defenseBase: 14, defensePerTier: 2.8 },
  metal:   { hpBase: 70, hpPerTier: 14, staminaBase: 70, staminaPerTier: 15, critBase: 3.5, critPerTier: 0.35, blockBase: 2, blockPerTier: 0.2, defenseBase: 18, defensePerTier: 3.6 },
};

function injectLegs(armor) {
  for (const mat of ['cloth', 'leather', 'metal']) {
    const md = armor.materials[mat];
    if (!md) continue;
    if (md.items.some(i => i.type === 'Legs')) { console.log(`  ${mat}: Legs already present`); continue; }

    const setMap = {};
    const setOrder = [];
    for (const item of md.items) {
      const s = item.name.split(' ')[0];
      if (!setMap[s]) { setMap[s] = []; setOrder.push(s); }
      setMap[s].push(item);
    }

    let added = 0;
    for (const setName of setOrder) {
      const feet = setMap[setName].find(i => i.type === 'Feet');
      if (!feet) continue;
      const legsItem = {
        id: `${mat}-${setName.toLowerCase()}-legs`,
        name: `${setName} Legs`,
        type: 'Legs',
        material: feet.material,
        lore: feet.lore,
        emoji: '👖',
        grudgeType: 'equipment',
        stats: { ...LEGS_STAT_SCALE[mat] },
        passive: feet.passive,
        attribute: feet.attribute,
        effect: feet.effect,
        proc: feet.proc,
        setBonus: feet.setBonus,
        spritePath: `/icons/armor/legs/${setName.toLowerCase()}_legs_${mat}.png`,
      };
      const idx = md.items.findIndex(i => i.type === 'Feet' && i.name.startsWith(setName));
      if (idx >= 0) md.items.splice(idx + 1, 0, legsItem);
      else md.items.push(legsItem);
      added++;
    }
    md.count = md.items.length;
    console.log(`  ${mat}: +${added} Legs → ${md.count} total`);
  }
  let total = 0;
  for (const md of Object.values(armor.materials)) total += (md.items || []).length;
  armor.total = total;
}

// ── SHIELDS ─────────────────────────────────────────────────────────────
const SHIELD_ITEMS = [
  { id: 'grudge-bulwark', name: 'Grudge Bulwark', primaryStat: 'block', secondaryStat: 'defense', emoji: '🛡️', grudgeType: 'item', lore: 'A towering slab of hate-forged iron that absorbs the fury of a thousand grudges', category: '1h', stats: { blockBase: 25, blockPerTier: 6, defenseBase: 40, defensePerTier: 10, hpBase: 60, hpPerTier: 15, speedBase: -10, speedPerTier: 0 }, basicAbility: 'Shield Wall (raise shield, block 100% frontal damage for 2s)', abilities: ['Iron Fortress (taunt all nearby enemies, +50% block for 4s)', 'Grudge Slam (shield bash, stun 1.5s)', 'Bulwark Stance (+30% defense, -20% speed, lasts until toggled)', 'Aegis of Spite (reflect 20% blocked damage back)', 'Rally Guard (grant nearby allies +15% defense for 6s)', 'Unbreakable Will (immune to stun/knockback for 3s)'], signatureAbility: 'Immovable Grudge (plant shield, create impassable barrier wall for 5s)', passives: ['Fortress Heart (+10% max HP while shield equipped)', 'Grudge Endurance (blocking builds Grudge stacks, +2% defense per stack)', 'Last Stand (below 20% HP, +40% block chance)'], craftedBy: 'Miner', spritePath: '/icons/weapons/shields/grudge-bulwark.png' },
  { id: 'crimson-aegis', name: 'Crimson Aegis', primaryStat: 'block', secondaryStat: 'damage', emoji: '🛡️', grudgeType: 'item', lore: 'Stained red by the blood of those who dared attack its bearer', category: '1h', stats: { blockBase: 18, blockPerTier: 4, defenseBase: 30, defensePerTier: 8, damageBase: 15, damagePerTier: 4, critBase: 3, critPerTier: 0.5 }, basicAbility: 'Shield Strike (bash with shield edge, deals damage + brief stagger)', abilities: ['Crimson Counter (perfect block triggers counter-attack, 150% weapon damage)', 'Bloodguard Rush (charge with shield, knock enemies aside)', 'Retaliation Aura (5% of damage taken is reflected)', 'Battle Stance (balanced offense/defense mode, +10% both)', 'Shield Throw (hurl shield like a projectile, returns)', 'Parry Riposte (timed block into a swift counter-slash)'], signatureAbility: 'Aegis of Carnage (shield erupts in crimson energy, AoE damage + self-heal)', passives: ['Bloodied Resolve (each successful block grants +3% damage for 5s)', 'Counter-Striker (parry window increased by 0.3s)', 'Crimson Fury (+15% crit chance after blocking 3 attacks)'], craftedBy: 'Miner', spritePath: '/icons/weapons/shields/crimson-aegis.png' },
  { id: 'wraithfang-buckler', name: 'Wraithfang Buckler', primaryStat: 'block', secondaryStat: 'speed', emoji: '🛡️', grudgeType: 'item', lore: 'Light as a whisper, fast as a phantom bite', category: '1h', stats: { blockBase: 12, blockPerTier: 3, defenseBase: 15, defensePerTier: 4, speedBase: 20, speedPerTier: 5, critBase: 5, critPerTier: 1 }, basicAbility: 'Quick Deflect (rapid parry, minimal recovery, builds combo)', abilities: ['Phantom Parry (dodge + instant counter, phase through attacker)', 'Spectral Bash (shield bash that applies ghost-mark, -10% enemy accuracy)', 'Wind Guard (auto-deflect next projectile within 3s)', 'Shadow Step Block (teleport behind attacker after perfect block)', 'Flurry Guard (block rapidly in succession, each block faster than the last)', 'Ghost Shield (briefly become untargetable while blocking)'], signatureAbility: 'Wraith Barrage (unleash all stored parry-energy as rapid spectral strikes)', passives: ['Phantom Reflexes (+20% parry window)', 'Spectral Agility (+10% movement speed while shield is equipped)', 'Wraith Stack (perfect parries grant Wraith stacks, +5% attack speed each)'], craftedBy: 'Miner', spritePath: '/icons/weapons/shields/wraithfang-buckler.png' },
  { id: 'oathbreaker-ward', name: 'Oathbreaker Ward', primaryStat: 'block', secondaryStat: 'mana', emoji: '🛡️', grudgeType: 'item', lore: 'Inscribed with broken oaths that devour hostile magic', category: '1h', stats: { blockBase: 15, blockPerTier: 4, defenseBase: 25, defensePerTier: 6, manaBase: 80, manaPerTier: 18, hpBase: 30, hpPerTier: 7 }, basicAbility: 'Spell Ward (raise shield to absorb incoming spell, restores mana)', abilities: ['Mana Drain Guard (blocked spells restore 10% of damage as mana)', 'Oath Shatter (break enemy buff on perfect block)', 'Arcane Reflection (reflect next spell back at caster)', 'Nullify Aura (reduce nearby enemy spell damage by 15% for 6s)', 'Ward Pulse (AoE magic shield on allies, absorbs spell damage)', 'Silence Bash (shield strike that silences target for 2s)'], signatureAbility: 'Broken Covenant (massive anti-magic zone, all enemy spells fail for 4s)', passives: ['Spell Eater (+20% magic resist while blocking)', 'Mana Shield (10% of damage taken is absorbed by mana instead)', 'Oathbound (blocking spells charges the shield, next attack deals bonus arcane damage)'], craftedBy: 'Miner', spritePath: '/icons/weapons/shields/oathbreaker-ward.png' },
  { id: 'kinrend-bastion', name: 'Kinrend Bastion', primaryStat: 'block', secondaryStat: 'health', emoji: '🛡️', grudgeType: 'item', lore: 'Bound by broken family ties, it protects the last of the bloodline', category: '1h', stats: { blockBase: 20, blockPerTier: 5, defenseBase: 35, defensePerTier: 9, hpBase: 100, hpPerTier: 25, speedBase: -5, speedPerTier: 0 }, basicAbility: 'Bastion Guard (heavy block stance, regenerate 2% HP/s while blocking)', abilities: ['Ancestral Shield (summon spirit shield, absorb next 3 attacks)', 'Kinrend Roar (taunt + self-heal 10% max HP)', 'Fortified Stance (+50% block, roots self for 3s)', 'Bloodline Bond (link HP with ally, share damage taken 50/50)', 'Enduring Wall (blocking does not consume stamina for 4s)', 'Regenerating Block (each block heals 3% max HP)'], signatureAbility: 'Last of the Line (become invulnerable for 3s, heal to full on expiry if below 10% HP)', passives: ['Undying Will (+25% healing received while blocking)', 'Thick Skin (+5% max HP per shield tier)', 'Kin Protection (nearby allies gain 5% damage reduction)'], craftedBy: 'Miner', spritePath: '/icons/weapons/shields/kinrend-bastion.png' },
  { id: 'emberclad-barrier', name: 'Emberclad Barrier', primaryStat: 'block', secondaryStat: 'fire', emoji: '🛡️', grudgeType: 'item', lore: 'Forged in dragonfire and cooled in lava, it burns those who strike it', category: '1h', stats: { blockBase: 16, blockPerTier: 4, defenseBase: 28, defensePerTier: 7, damageBase: 10, damagePerTier: 3, hpBase: 40, hpPerTier: 10 }, basicAbility: 'Flame Guard (block while emanating fire aura, damages melee attackers)', abilities: ['Ember Burst (slam shield, AoE fire explosion around self)', 'Molten Shell (shield glows, next 3 blocks deal fire damage to attacker)', 'Fire Wall (plant shield, create line of fire that blocks passage)', 'Magma Shield (absorb fire damage, convert to self-heal)', 'Scorching Bash (shield bash that applies burn DoT)', 'Inferno Guard (blocking charges fire, release as ranged fire wave)'], signatureAbility: 'Dragon Barrier (transform shield into massive fire dragon head, breathe fire cone AoE)', passives: ['Flame Thorns (melee attackers take 8% fire damage)', 'Ember Heart (+15% fire resistance)', 'Burning Vengeance (when hit below 30% HP, explode for AoE fire damage)'], craftedBy: 'Miner', spritePath: '/icons/weapons/shields/emberclad-barrier.png' },
];

function injectShields(weapons) {
  if (weapons.categories.shields) { console.log('  shields already exists'); return; }
  weapons.categories.shields = { iconBase: 'shield', iconMax: 51, grudgeType: 'equipment', items: SHIELD_ITEMS };
  console.log(`  +shields (${SHIELD_ITEMS.length} items)`);
}

function fixInconsistencies(weapons) {
  if (weapons.categories.natureStaves?.iconBase === 'Staff') {
    weapons.categories.natureStaves.iconBase = 'staff';
    console.log('  fixed natureStaves iconBase: Staff → staff');
  }
}

// ── MAIN ────────────────────────────────────────────────────────────────
console.log('=== Inject Legs & Shields ===\n');
const armor = JSON.parse(readFileSync(ARMOR_PATH, 'utf8'));
injectLegs(armor);
writeFileSync(ARMOR_PATH, JSON.stringify(armor, null, 2));
console.log(`armor.json: ${armor.total} items\n`);

const weapons = JSON.parse(readFileSync(WEAPONS_PATH, 'utf8'));
injectShields(weapons);
fixInconsistencies(weapons);
writeFileSync(WEAPONS_PATH, JSON.stringify(weapons, null, 2));
console.log(`weapons.json: ${Object.keys(weapons.categories).length} categories\n`);
console.log('Done.');

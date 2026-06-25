#!/usr/bin/env node
/**
 * patch-offhand-mechanics.mjs
 *
 * Canonical off-hand rules:
 *   - SHIELD: while blocking, replaces mainhand slots 1–3 with per-shield-type tank skills
 *   - TOME: off-hand only (canonical off-hand relic); couples with 1H mainhand to transform slots 1–4
 *   - OFFHAND_RELIC: removed — tomes are the only canonical off-hand relic
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const API_PATH = join(ROOT, 'api', 'v1', 'master-weaponSkills.json');

const data = JSON.parse(readFileSync(API_PATH, 'utf8'));

function skill(id, name, desc, icon, tier, damage, cooldown, effects, extra = {}) {
  return {
    id,
    name,
    description: desc,
    icon,
    tier,
    damage,
    cooldown,
    castTime: extra.castTime ?? 0,
    range: extra.range ?? 0,
    projectile: extra.projectile ?? null,
    damageType: extra.damageType ?? 'physical',
    animation: extra.animation ?? null,
    physics: extra.physics ?? null,
    effects,
    ...extra,
  };
}

// ── Shield tank skills per type (slots 1–3 only, active while blocking) ──
const SHIELD_TYPE_SKILLS = {
  buckler: {
    name: 'Buckler',
    icon: '/icons/pack/weapons/shield_01.png',
    slots: {
      primary: [
        skill('buckler_deflect', 'Quick Deflect', 'Rapid parry while blocking — minimal recovery', '/icons/pack/weapons/shield_01.png', 1, 20, 0, ['Parry window +0.3s', 'Builds Block']),
        skill('buckler_riposte', 'Riposte', 'Counter immediately after a perfect block', '/icons/pack/weapons/shield_03.png', 2, 45, 3, ['Counter 150% weapon dmg', 'Requires Block']),
        skill('buckler_flurry', 'Flurry Guard', 'Chain rapid blocks, each faster than the last', '/icons/pack/misc/Flow.png', 3, 30, 6, ['+15% attack speed per block', 'Max 3 stacks']),
      ],
      secondary: [
        skill('buckler_bash', 'Shield Bash', 'Light bash that staggers — only while blocking', '/icons/pack/weapons/shield_05.png', 1, 35, 4, ['Stagger 0.5s', 'Threat+']),
        skill('buckler_step', 'Shadow Step Block', 'Teleport behind attacker after perfect block', '/icons/pack/misc/smoke.png', 2, 55, 10, ['Teleport behind', 'Crit bonus']),
        skill('buckler_ghost', 'Ghost Shield', 'Briefly untargetable while holding block', '/icons/pack/misc/smoke.png', 3, 0, 18, ['Untargetable 1.5s', 'While Blocking']),
      ],
      ability: [
        skill('buckler_wind', 'Wind Guard', 'Auto-deflect next projectile while blocking', '/icons/pack/weapons/shield_10.png', 1, 0, 12, ['Deflect 1 projectile', '6s window']),
        skill('buckler_mark', 'Spectral Mark', 'Bash applies ghost-mark reducing enemy accuracy', '/icons/pack/weapons/shield_15.png', 2, 40, 8, ['-15% enemy accuracy 4s']),
        skill('buckler_barrage', 'Wraith Barrage', 'Unleash stored parry energy as rapid strikes', '/icons/pack/weapons/shield_20.png', 3, 90, 20, ['5-hit combo', 'Requires 3 perfect blocks']),
      ],
    },
  },
  kite: {
    name: 'Kite Shield',
    icon: '/icons/pack/weapons/shield_14.png',
    slots: {
      primary: [
        skill('kite_guard', 'Kite Guard', 'Balanced block stance — moderate DR while blocking', '/icons/pack/weapons/shield_14.png', 1, 0, 0, ['+25% block effect', 'While Blocking']),
        skill('kite_bash', 'Shield Bash', 'Standard bash with daze', '/icons/pack/weapons/shield_16.png', 2, 40, 0, ['Daze 1s', 'Builds Block']),
        skill('kite_slam', 'Shield Slam', 'Heavy overhead slam while blocking', '/icons/pack/weapons/shield_18.png', 3, 55, 4, ['Stun 0.8s', 'Threat++']),
      ],
      secondary: [
        skill('kite_wall', 'Shield Wall', 'Raise kite shield — 50% DR for 4s', '/icons/pack/weapons/shield_20.png', 1, 0, 16, ['50% DR 4s', 'Immobile']),
        skill('kite_charge', 'Bulwark Charge', 'Charge forward 6m while blocking', '/icons/pack/misc/Flow.png', 2, 45, 12, ['Charge 6m', 'Knockback 3m']),
        skill('kite_phalanx', 'Phalanx Guard', 'Allies behind gain 20% DR', '/icons/pack/weapons/shield_25.png', 3, 0, 20, ['20% DR allies 6s', 'Cone behind']),
      ],
      ability: [
        skill('kite_taunt', 'Grudge Taunt', 'Force enemies in 6m to target you while blocking', '/icons/pack/misc/Power.png', 1, 0, 15, ['AoE Taunt 3s', '10% DR self']),
        skill('kite_bastion', 'Iron Bastion', 'Plant shield — AoE barrier zone', '/icons/pack/weapons/shield_30.png', 2, 0, 22, ['35% DR zone 5m', '6s duration']),
        skill('kite_rally', 'Rally Guard', 'Grant nearby allies +15% defense', '/icons/pack/weapons/shield_35.png', 3, 0, 18, ['+15% defense allies', '8m radius 6s']),
      ],
    },
  },
  tower: {
    name: 'Tower Shield',
    icon: '/icons/pack/weapons/shield_40.png',
    slots: {
      primary: [
        skill('tower_fortress', 'Iron Fortress', 'Maximum block — taunt all nearby while blocking', '/icons/pack/weapons/shield_40.png', 1, 0, 0, ['+50% block 4s', 'AoE Taunt']),
        skill('tower_slam', 'Grudge Slam', 'Shield bash that stuns', '/icons/pack/weapons/shield_42.png', 2, 50, 5, ['Stun 1.5s', 'Threat+++']),
        skill('tower_stance', 'Bulwark Stance', '+30% defense, -20% speed while blocking', '/icons/pack/weapons/shield_45.png', 3, 0, 0, ['+30% defense', 'Toggle while blocking']),
      ],
      secondary: [
        skill('tower_wall', 'Immovable Wall', 'Block 100% frontal damage for 2s', '/icons/pack/weapons/shield_48.png', 1, 0, 20, ['100% frontal block 2s', 'Rooted']),
        skill('tower_endure', 'Enduring Wall', 'Blocking does not consume stamina for 4s', '/icons/pack/weapons/shield_50.png', 2, 0, 25, ['No stamina cost blocking', '4s']),
        skill('tower_regen', 'Regenerating Block', 'Each block heals 3% max HP', '/icons/pack/misc/Life.png', 3, -30, 15, ['Heal 3% per block', 'While Blocking']),
      ],
      ability: [
        skill('tower_plant', 'Immovable Grudge', 'Plant shield — impassable barrier wall', '/icons/pack/weapons/shield_30.png', 1, 0, 30, ['Barrier wall 5s', 'Blocks passage']),
        skill('tower_ancestral', 'Ancestral Shield', 'Spirit shield absorbs next 3 attacks', '/icons/pack/misc/runic_tablet_07.png', 2, 0, 22, ['Absorb 3 hits', '8s']),
        skill('tower_last', 'Last of the Line', 'Invulnerable 3s while below 30% HP', '/icons/pack/weapons/shield_40.png', 3, 0, 60, ['Immune 3s', 'Emergency only']),
      ],
    },
  },
  spiked: {
    name: 'Spiked Shield',
    icon: '/icons/pack/weapons/shield_05.png',
    slots: {
      primary: [
        skill('spiked_strike', 'Shield Strike', 'Bash with shield edge — damage + stagger', '/icons/pack/weapons/shield_05.png', 1, 35, 0, ['Stagger 0.5s', 'While Blocking']),
        skill('spiked_counter', 'Crimson Counter', 'Perfect block triggers 150% counter', '/icons/pack/weapons/shield_08.png', 2, 65, 6, ['Counter 150% dmg', 'Requires perfect block']),
        skill('spiked_throw', 'Shield Throw', 'Hurl shield — returns automatically', '/icons/pack/weapons/shield_25.png', 3, 60, 10, ['Ranged 15m', 'Bounces x2']),
      ],
      secondary: [
        skill('spiked_retaliation', 'Retaliation Aura', '5% of damage taken reflected while blocking', '/icons/pack/misc/Power.png', 1, 0, 0, ['5% reflect passive', 'While Blocking']),
        skill('spiked_aegis', 'Aegis of Spite', 'Reflect 20% blocked damage back', '/icons/pack/weapons/shield_15.png', 2, 0, 14, ['20% reflect blocked dmg', '6s']),
        skill('spiked_carnage', 'Aegis of Carnage', 'Shield erupts — AoE damage + self-heal', '/icons/pack/weapons/shield_20.png', 3, 80, 25, ['AoE 6m', 'Self-heal 50']),
      ],
      ability: [
        skill('spiked_riposte', 'Parry Riposte', 'Timed block into swift counter-slash', '/icons/pack/weapons/Sword_01.png', 1, 55, 8, ['Parry 0.4s', 'Counter slash']),
        skill('spiked_rush', 'Bloodguard Rush', 'Charge with shield — knock enemies aside', '/icons/pack/misc/Flow.png', 2, 50, 12, ['Charge 8m', 'Knockback 4m']),
        skill('spiked_fury', 'Crimson Fury', '+15% crit after blocking 3 attacks', '/icons/pack/weapons/shield_30.png', 3, 0, 20, ['+15% crit 8s', 'Requires 3 blocks']),
      ],
    },
  },
  magic: {
    name: 'Magic Shield',
    icon: '/icons/pack/misc/runic_tablet_03.png',
    slots: {
      primary: [
        skill('magic_ward', 'Spell Ward', 'Raise shield to absorb incoming spell', '/icons/pack/misc/runic_tablet_01.png', 1, 0, 0, ['Absorb 1 spell', 'Restore mana']),
        skill('magic_drain', 'Mana Drain Guard', 'Blocked spells restore 10% as mana', '/icons/pack/misc/runic_tablet_03.png', 2, 0, 8, ['Mana return 10%', 'While Blocking']),
        skill('magic_reflect', 'Aegis Reflect', 'Reflect next 3 projectiles back', '/icons/pack/weapons/shield_15.png', 3, 0, 15, ['Reflect 3 projectiles']),
      ],
      secondary: [
        skill('magic_nullify', 'Nullify Aura', 'Reduce nearby enemy spell damage 15%', '/icons/pack/misc/runic_tablet_05.png', 1, 0, 18, ['-15% enemy spell dmg', '6m 6s']),
        skill('magic_shatter', 'Oath Shatter', 'Break enemy buff on perfect block', '/icons/pack/misc/runic_tablet_07.png', 2, 0, 12, ['Dispel 1 buff', 'Perfect block']),
        skill('magic_pulse', 'Ward Pulse', 'AoE magic shield on allies', '/icons/pack/misc/runic_tablet_09.png', 3, 0, 22, ['Spell absorb allies', '8m 5s']),
      ],
      ability: [
        skill('magic_arcane', 'Arcane Reflection', 'Reflect next spell at caster', '/icons/pack/weapons/Book_1.png', 1, 45, 10, ['Reflect spell', 'While Blocking']),
        skill('magic_silence', 'Silence Bash', 'Shield strike silences target 2s', '/icons/pack/weapons/shield_20.png', 2, 30, 14, ['Silence 2s', 'Melee range']),
        skill('magic_covenant', 'Broken Covenant', 'Anti-magic zone — spells fail 4s', '/icons/pack/misc/runic_tablet_11.png', 3, 0, 45, ['Anti-magic zone 4s', '8m radius']),
      ],
    },
  },
  relic: {
    name: 'Relic Shield',
    icon: '/icons/pack/weapons/shield_50.png',
    slots: {
      primary: [
        skill('relic_guard', 'Relic Guard', 'Unique block — +35% DR while blocking', '/icons/pack/weapons/shield_50.png', 1, 0, 0, ['+35% DR', 'While Blocking']),
        skill('relic_bash', 'Concussive Strike', 'AoE bash that slows nearby', '/icons/pack/weapons/shield_30.png', 2, 40, 5, ['AoE 3m', 'Slow 40% 3s']),
        skill('relic_unbreakable', 'Unbreakable', 'Immune 2s then AoE knockback', '/icons/pack/weapons/shield_40.png', 3, 80, 40, ['Immune 2s', 'AoE knockback']),
      ],
      secondary: [
        skill('relic_bond', 'Bloodline Bond', 'Link HP with ally — share damage 50/50', '/icons/pack/misc/Life.png', 1, 0, 25, ['Share 50% dmg', '20m 10s']),
        skill('relic_titan', "Titan's Bulwark", 'Group invincibility 3s', '/icons/pack/weapons/shield_45.png', 2, 0, 60, ['Group immune 3s', '8m']),
        skill('relic_inferno', 'Dragon Barrier', 'Fire dragon head — breathe fire cone', '/icons/pack/misc/Burns.png', 3, 100, 30, ['Fire cone AoE', 'Burn 4s']),
      ],
      ability: [
        skill('relic_taunt', 'Grudge Taunt', 'Force all enemies in 8m to target you', '/icons/pack/misc/Power.png', 1, 0, 15, ['AoE Taunt 4s', '10% DR self']),
        skill('relic_bastion', 'Iron Bastion', '40% DR zone 5m for 8s', '/icons/pack/weapons/shield_35.png', 2, 0, 25, ['40% DR zone', '8s duration']),
        skill('relic_will', 'Unbreakable Will', 'Immune to stun/knockback 3s', '/icons/pack/weapons/shield_48.png', 3, 0, 35, ['CC immune 3s', 'While Blocking']),
      ],
    },
  },
};

// ── Tome coupling: transforms 1H mainhand slots 1–4 ──
const TOME_COUPLING_MODES = {
  elemental: {
    name: 'Elemental',
    description: 'Slots become elemental spell variants (fire, frost, lightning, nature)',
    schools: ['fire', 'frost', 'lightning', 'nature'],
    slots: {
      primary: [
        skill('tome_elem_bolt', 'Elemental Bolt', 'Channel tome element through mainhand strike', '/icons/weapons/tomes/fire-tome.png', 1, 45, 0, ['Elemental projectile', 'Matches tome school'], { damageType: 'fire', range: 20, projectile: 'spell' }),
        skill('tome_elem_blast', 'Elemental Blast', 'Charged burst matching tome element', '/icons/weapons/tomes/fire-tome.png', 2, 65, 2, ['AoE 3m', 'Element match'], { damageType: 'fire', range: 18, castTime: 0.8 }),
        skill('tome_elem_surge', 'Elemental Surge', 'Wave of elemental energy', '/icons/weapons/tomes/lightning-tome.png', 3, 55, 4, ['Pierce 2 targets', 'Element match'], { damageType: 'lightning', range: 22 }),
      ],
      secondary: [
        skill('tome_elem_nova', 'Elemental Nova', 'Radial burst of tome element', '/icons/weapons/tomes/frost-tome.png', 1, 50, 8, ['AoE 5m', 'Element match'], { damageType: 'frost' }),
        skill('tome_elem_prison', 'Frost Prison', 'Encase target — root 3s', '/icons/weapons/tomes/frost-tome.png', 2, 20, 20, ['Root 3s', 'Slow after'], { damageType: 'frost', range: 18 }),
        skill('tome_elem_storm', 'Thunderstorm', 'Lightning strikes around you', '/icons/weapons/tomes/lightning-tome.png', 3, 80, 25, ['AoE 8m', 'Stun 1s'], { damageType: 'lightning', range: 12 }),
      ],
      ability: [
        skill('tome_elem_ward', 'Elemental Ward', 'Ground rune of tome element', '/icons/weapons/tomes/nature-tome.png', 1, 40, 12, ['Ground AoE 6m', '6s duration'], { damageType: 'nature', range: 10 }),
        skill('tome_elem_drain', 'Knowledge Drain', 'Drain mana and debuff target', '/icons/weapons/tomes/arcane-tome.png', 2, 30, 12, ['Mana drain 50', '-10% spell power 4s'], { damageType: 'arcane', range: 15 }),
        skill('tome_elem_forbidden', 'Forbidden Page', 'Massive DoT from tome pages', '/icons/pack/weapons/Book_12.png', 3, 120, 16, ['DoT 8s', 'Shadow element'], { damageType: 'shadow', range: 15, castTime: 1 }),
      ],
      ultimate: [
        skill('tome_elem_apocalypse', 'Apocalypse Tome', 'Massive AoE elemental storm', '/icons/weapons/tomes/fire-tome.png', 1, 200, 60, ['AoE 15m', 'All elements', '5s channel'], { damageType: 'arcane', range: 15, castTime: 2 }),
        skill('tome_elem_cataclysm', 'Elemental Cataclysm', 'Unleash pure elemental devastation', '/icons/weapons/tomes/lightning-tome.png', 4, 250, 75, ['AoE 20m', 'Element storm'], { damageType: 'lightning', range: 20, castTime: 2.5 }),
      ],
    },
  },
  ranged: {
    name: 'Ranged',
    description: 'Slots become ranged spell/projectile variants',
    schools: ['arcane'],
    slots: {
      primary: [
        skill('tome_rng_bolt', 'Arcane Bolt', 'Homing arcane projectile via mainhand', '/icons/weapons/tomes/arcane-tome.png', 1, 45, 0, ['Homing', 'Range 25m'], { damageType: 'arcane', range: 25, projectile: 'spell', castTime: 0.5 }),
        skill('tome_rng_lance', 'Arcane Lance', 'Piercing beam through tome focus', '/icons/weapons/tomes/arcane-tome.png', 2, 60, 3, ['Pierce 3 targets', 'Range 30m'], { damageType: 'arcane', range: 30, castTime: 0.6 }),
        skill('tome_rng_orb', 'Arcane Orb', 'Slow heavy orb with large impact', '/icons/pack/weapons/Book_5.png', 3, 75, 5, ['AoE 4m impact', 'Knockback'], { damageType: 'arcane', range: 22, projectile: 'spell' }),
      ],
      secondary: [
        skill('tome_rng_volley', 'Spell Volley', '3 rapid arcane projectiles', '/icons/pack/weapons/Book_7.png', 1, 35, 6, ['3 projectiles', 'Range 20m'], { damageType: 'arcane', range: 20, projectile: 'spell' }),
        skill('tome_rng_snare', 'Arcane Snare', 'Ranged root — binds target in place', '/icons/pack/weapons/Book_10.png', 2, 25, 14, ['Root 2.5s', 'Range 18m'], { damageType: 'arcane', range: 18 }),
        skill('tome_rng_ricochet', 'Ricochet Bolt', 'Bolt bounces between 4 targets', '/icons/pack/weapons/Book_15.png', 3, 50, 10, ['Bounce x4', 'Range 25m'], { damageType: 'arcane', range: 25, projectile: 'spell' }),
      ],
      ability: [
        skill('tome_rng_burst', 'Grimoire Burst', 'Open tome — release stored energy', '/icons/pack/weapons/Book_7.png', 1, 90, 14, ['AoE 8m', 'Knockback 4m'], { damageType: 'arcane', range: 8 }),
        skill('tome_rng_beam', 'Focused Beam', 'Channeled ranged beam', '/icons/pack/weapons/Book_12.png', 2, 100, 18, ['Beam 25m', '2s channel'], { damageType: 'arcane', range: 25, castTime: 2 }),
        skill('tome_rng_meteor', 'Arcane Meteor', 'Call down ranged AoE strike', '/icons/pack/weapons/Book_20.png', 3, 130, 22, ['AoE 6m', 'Range 30m'], { damageType: 'arcane', range: 30 }),
      ],
      ultimate: [
        skill('tome_rng_storm', 'Arcane Barrage', 'Rain of arcane bolts across area', '/icons/weapons/tomes/arcane-tome.png', 1, 180, 55, ['AoE 12m', '12 bolts'], { damageType: 'arcane', range: 20 }),
        skill('tome_rng_annihilate', 'Annihilation Ray', 'Devastating long-range beam', '/icons/pack/weapons/Book_25.png', 4, 220, 70, ['Beam 40m', '3s channel'], { damageType: 'arcane', range: 40, castTime: 3 }),
      ],
    },
  },
  heal: {
    name: 'Heal',
    description: 'Slots become healing and support variants',
    schools: ['holy'],
    slots: {
      primary: [
        skill('tome_heal_touch', 'Holy Touch', 'Melee strike that heals self and ally', '/icons/weapons/tomes/nature-tome.png', 1, -40, 0, ['Heal self 40', 'Heal ally 20'], { damageType: 'holy', range: 3 }),
        skill('tome_heal_wave', 'Healing Wave', 'Pulse of holy energy — party heal', '/icons/pack/misc/Life.png', 2, -80, 6, ['Party heal 80', '8m radius'], { damageType: 'holy', range: 8 }),
        skill('tome_heal_surge', 'Spirit Surge', 'Channel spirits — heal allies, harm undead', '/icons/pack/weapons/Book_10.png', 3, -60, 8, ['Heal allies 60', 'DMG undead 60'], { damageType: 'holy', range: 12, castTime: 0.6 }),
      ],
      secondary: [
        skill('tome_heal_ward', 'Runic Ward', 'Ground circle heals allies inside', '/icons/weapons/tomes/nature-tome.png', 2, -60, 18, ['Heal zone 6m', '10s duration'], { damageType: 'holy', range: 12, castTime: 0.8 }),
        skill('tome_heal_shield', 'Mana Shield', 'Convert mana to damage absorption', '/icons/pack/weapons/Book_15.png', 1, 0, 15, ['Absorb 200', 'Drains mana'], { damageType: 'holy' }),
        skill('tome_heal_link', 'Soul Link', 'Link to ally — share 40% healing', '/icons/pack/misc/Life.png', 3, 0, 20, ['Share 40% healing', '20m 10s'], { damageType: 'holy', range: 20 }),
      ],
      ability: [
        skill('tome_heal_cleanse', 'Purifying Strike', 'Attack cleanses 1 debuff from self', '/icons/pack/weapons/Book_7.png', 1, 30, 10, ['Cleanse 1 debuff', 'Heal 30'], { damageType: 'holy', range: 3 }),
        skill('tome_heal_resurrect', 'Grace Touch', 'Revive fallen ally at 25% HP', '/icons/pack/misc/Life.png', 2, 0, 90, ['Revive 25% HP', '30m range'], { damageType: 'holy', range: 30, castTime: 2 }),
        skill('tome_heal_beacon', 'Holy Beacon', 'Mark ally — all healing +50% to them', '/icons/pack/weapons/Book_20.png', 3, 0, 25, ['+50% healing received', '12s'], { damageType: 'holy', range: 25 }),
      ],
      ultimate: [
        skill('tome_heal_genesis', 'Genesis', 'Full party heal + damage immunity 3s', '/icons/weapons/tomes/nature-tome.png', 4, -300, 90, ['Party heal', 'Immunity 3s', 'Purge debuffs'], { damageType: 'holy', castTime: 1.5 }),
        skill('tome_heal_sanctuary', 'Sanctuary', 'Create zone of total healing immunity', '/icons/pack/misc/Life.png', 1, -150, 60, ['Immune zone 5s', '8m radius'], { damageType: 'holy', range: 8 }),
      ],
    },
  },
  buff: {
    name: 'Buff',
    description: 'Slots become buff and enhancement variants',
    schools: ['nature', 'arcane'],
    slots: {
      primary: [
        skill('tome_buff_strike', 'Empowered Strike', 'Mainhand attack buffs self +10% dmg 6s', '/icons/weapons/tomes/nature-tome.png', 1, 40, 0, ['+10% dmg 6s', 'Self buff'], { damageType: 'nature', range: 3 }),
        skill('tome_buff_haste', 'Haste Sigil', 'Attack grants +20% attack speed 5s', '/icons/pack/weapons/Book_5.png', 2, 35, 4, ['+20% attack speed', '5s'], { damageType: 'arcane' }),
        skill('tome_buff_might', 'Might Infusion', 'Strike empowers next 3 attacks +25%', '/icons/pack/weapons/Book_10.png', 3, 50, 6, ['+25% next 3 hits'], { damageType: 'nature' }),
      ],
      secondary: [
        skill('tome_buff_ward', 'Protective Ward', 'Buff self +20% defense 8s', '/icons/pack/weapons/Book_15.png', 1, 0, 12, ['+20% defense 8s'], { damageType: 'nature' }),
        skill('tome_buff_rally', 'Battle Rally', 'Buff nearby allies +15% all stats 6s', '/icons/pack/misc/Power.png', 2, 0, 18, ['+15% stats allies', '8m 6s'], { damageType: 'arcane', range: 8 }),
        skill('tome_buff_focus', 'Arcane Focus', 'Buff spell power +30% 10s', '/icons/weapons/tomes/arcane-tome.png', 3, 0, 20, ['+30% spell power', '10s'], { damageType: 'arcane' }),
      ],
      ability: [
        skill('tome_buff_grasp', 'Grasp of Growth', 'Roots enemy, buffs self +15% HP', '/icons/weapons/tomes/nature-tome.png', 1, 20, 14, ['Root 2s', '+15% max HP 8s'], { damageType: 'nature', range: 8 }),
        skill('tome_buff_mirror', 'Mirror Image', 'Buff creates 2 decoys absorbing hits', '/icons/pack/misc/smoke.png', 2, 0, 22, ['2 decoys', 'Absorb 1 hit each'], { damageType: 'arcane' }),
        skill('tome_buff_ascend', 'Ascension', 'Buff — immune to CC, +25% speed 4s', '/icons/pack/weapons/Book_20.png', 3, 0, 30, ['CC immune 4s', '+25% speed'], { damageType: 'holy' }),
      ],
      ultimate: [
        skill('tome_buff_avatar', 'Avatar of War', 'Transform — +50% all stats 8s', '/icons/pack/misc/Power.png', 1, 0, 75, ['+50% all stats', '8s duration'], { damageType: 'arcane' }),
        skill('tome_buff_legion', 'Legion Blessing', 'Party-wide +30% stats 10s', '/icons/pack/weapons/Book_25.png', 4, 0, 90, ['Party +30% stats', '10s'], { damageType: 'holy', range: 15 }),
      ],
    },
  },
};

const SCHOOL_TO_MODE = {};
for (const [mode, def] of Object.entries(TOME_COUPLING_MODES)) {
  for (const school of def.schools) {
    SCHOOL_TO_MODE[school] = mode;
  }
}

// Build shield weapon type (offhand modifier, not standalone weapon tree)
function buildShieldTypeDef() {
  const shieldTypes = {};
  for (const [id, def] of Object.entries(SHIELD_TYPE_SKILLS)) {
    shieldTypes[id] = {
      id,
      name: def.name,
      icon: def.icon,
      slots: ['primary', 'secondary', 'ability'].map((type) => ({
        type,
        label: type === 'primary' ? 'Slot 1 · While Blocking' : type === 'secondary' ? 'Slot 2 · While Blocking' : 'Slot 3 · While Blocking',
        unlockTier: type === 'primary' ? 1 : 2,
        skills: def.slots[type],
      })),
    };
  }

  return {
    id: 'SHIELD',
    name: 'Shield (Off-Hand)',
    icon: '/icons/pack/weapons/shield_01.png',
    classes: ['Warrior'],
    classification: 'offhandModifier',
    role: 'offhandModifier',
    mechanic: {
      description: 'While blocking, shield type replaces mainhand slots 1–3 with tank abilities. Slot 4 is unchanged.',
      requiresBlock: true,
      affectedSlots: ['primary', 'secondary', 'ability'],
      doesNotAffectSlot4: true,
      shieldTypes: Object.keys(SHIELD_TYPE_SKILLS),
    },
    shieldTypes,
    totalSkills: Object.values(SHIELD_TYPE_SKILLS).reduce((n, t) => n + 3 * 3, 0),
    slots: [],
  };
}

function buildTomeTypeDef() {
  const couplingModes = {};
  for (const [modeId, def] of Object.entries(TOME_COUPLING_MODES)) {
    couplingModes[modeId] = {
      id: modeId,
      name: def.name,
      description: def.description,
      schools: def.schools,
      slots: ['primary', 'secondary', 'ability', 'ultimate'].map((type) => ({
        type,
        label:
          type === 'primary'
            ? 'Slot 1 · Coupled'
            : type === 'secondary'
              ? 'Slot 2 · Coupled'
              : type === 'ability'
                ? 'Slot 3 · Coupled'
                : 'Slot 4 · Coupled',
        unlockTier: type === 'primary' ? 1 : type === 'ultimate' ? 3 : 2,
        skills: def.slots[type],
      })),
    };
  }

  let total = 0;
  for (const m of Object.values(couplingModes)) {
    for (const s of m.slots) total += s.skills.length;
  }

  return {
    id: 'TOME',
    name: 'Tome (Off-Hand Relic)',
    icon: '/icons/pack/weapons/Book_1.png',
    classes: ['Mage', 'Worge'],
    classification: 'offhandCoupling',
    role: 'offhandCoupling',
    mechanic: {
      description:
        'Canonical off-hand relic. When paired with a one-hand mainhand, tomes transform slots 1–4 into elemental, ranged, heal, or buff variants based on tome school.',
      requiresOneHandMainhand: true,
      affectedSlots: ['primary', 'secondary', 'ability', 'ultimate'],
      couplingModes: Object.keys(TOME_COUPLING_MODES),
      schoolToMode: SCHOOL_TO_MODE,
      validMainhands: ['SWORD', 'AXE', 'DAGGER', 'HAMMER', 'MACE', 'GUN', 'WAND'],
    },
    couplingModes,
    totalSkills: total,
    slots: [],
  };
}

// Apply patches
const shieldIdx = data.weaponTypes.findIndex((w) => w.id === 'SHIELD');
const tomeIdx = data.weaponTypes.findIndex((w) => w.id === 'TOME');
if (shieldIdx === -1 || tomeIdx === -1) {
  console.error('SHIELD or TOME not found');
  process.exit(1);
}

data.weaponTypes[shieldIdx] = buildShieldTypeDef();
data.weaponTypes[tomeIdx] = buildTomeTypeDef();

// Remove OFFHAND_RELIC
const before = data.weaponTypes.length;
data.weaponTypes = data.weaponTypes.filter((w) => w.id !== 'OFFHAND_RELIC');
const removed = before - data.weaponTypes.length;

// Update class restrictions
for (const cls of Object.keys(data.classRestrictions || {})) {
  data.classRestrictions[cls] = data.classRestrictions[cls].filter((t) => t !== 'OFFHAND_RELIC');
}

// Root-level offhand mechanics doc
data.offhandMechanics = {
  version: '1.0.0',
  canonicalOffhandRelic: 'TOME',
  shield: {
    requiresBlock: true,
    affectedSlots: ['primary', 'secondary', 'ability'],
    shieldTypes: Object.keys(SHIELD_TYPE_SKILLS),
  },
  tome: {
    requiresOneHandMainhand: true,
    affectedSlots: ['primary', 'secondary', 'ability', 'ultimate'],
    couplingModes: Object.keys(TOME_COUPLING_MODES),
    schoolToMode: SCHOOL_TO_MODE,
  },
};

data.totalWeaponTypes = data.weaponTypes.length;
let totalSkills = 0;
for (const wt of data.weaponTypes) {
  if (wt.slots?.length) {
    wt.totalSkills = wt.slots.reduce((n, s) => n + s.skills.length, 0);
    totalSkills += wt.totalSkills;
  } else if (wt.shieldTypes) {
    totalSkills += wt.totalSkills || 0;
  } else if (wt.couplingModes) {
    totalSkills += wt.totalSkills || 0;
  }
}
data.totalSkills = totalSkills;
data.version = '3.1.0';
data.generated = new Date().toISOString();

writeFileSync(API_PATH, JSON.stringify(data, null, 2));
console.log(`[patch-offhand] SHIELD → offhandModifier (${Object.keys(SHIELD_TYPE_SKILLS).length} shield types, slots 1–3 while blocking)`);
console.log(`[patch-offhand] TOME → offhandCoupling (${Object.keys(TOME_COUPLING_MODES).length} modes, slots 1–4 with 1H)`);
console.log(`[patch-offhand] Removed OFFHAND_RELIC (${removed} type)`);
console.log(`[patch-offhand] totalWeaponTypes=${data.totalWeaponTypes}, totalSkills=${data.totalSkills}`);
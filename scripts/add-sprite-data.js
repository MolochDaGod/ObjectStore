#!/usr/bin/env node
/**
 * Adds spriteData to enemies.json and bosses.json
 * Maps each enemy/boss to their actual 2D sprite sheets with animation frame counts.
 * Frame counts sourced from GrudgeWars spriteMap.js.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ── Enemy → sprite mapping (spriteKey, folder relative to sprites/, frameWidth, frameHeight, animations) ──
const enemySpriteMap = {
  // === Beasts ===
  'dire-wolf': {
    spriteKey: 'werewolf', folder: 'sprites/werewolf', fw: 100, fh: 100,
    anims: { idle: 6, attack1: 9, attack2: 13, hurt: 4, death: 4, walk: 8 }
  },
  'cave-bat': {
    spriteKey: 'shadow-bat', folder: 'sprites/monsters/shadow_bat', fw: 32, fh: 32,
    anims: { idle: 7, attack1: 10, hurt: 3 }
  },
  'velociraptor': {
    spriteKey: 'desert-hyena', folder: 'sprites/desert-hyena', fw: 48, fh: 48,
    anims: { idle: 4, walk: 6, attack1: 6, hurt: 2, death: 6 }
  },
  'ghost-tiger': {
    spriteKey: 'werewolf', folder: 'sprites/werewolf', fw: 100, fh: 100,
    anims: { idle: 6, attack1: 9, attack2: 13, hurt: 4, death: 4, walk: 8 }
  },
  'rhino-charger': {
    spriteKey: 'ogre-boss', folder: 'sprites/ogre-boss', fw: 100, fh: 100,
    anims: { idle: 6, walk: 6, attack1: 6, attack2: 5, hurt: 3, death: 5 }
  },
  // === Spiders ===
  'green-spider': {
    spriteKey: 'slime', folder: 'sprites/enemies/slime', fw: 64, fh: 64,
    anims: { idle: 6, attack1: 6, attack2: 12, hurt: 4, death: 4, walk: 6 }
  },
  'battle-spider': {
    spriteKey: 'mine-arachnid', folder: 'sprites/mine-arachnid', fw: 48, fh: 48,
    anims: { idle: 4, attack1: 4, attack2: 4, attack3: 4, attack4: 4, hurt: 3, death: 4, walk: 4 },
    fileMap: { idle: 'Arachnid_idle.png', attack1: 'Arachnid_attack1.png', attack2: 'Arachnid_attack2.png', attack3: 'Arachnid_attack3.png', attack4: 'Arachnid_attack4.png', hurt: 'Arachnid_hurt.png', death: 'Arachnid_death.png', walk: 'Arachnid_walk.png' }
  },
  'arachnid-stalker': {
    spriteKey: 'mine-arachnid', folder: 'sprites/mine-arachnid', fw: 48, fh: 48,
    anims: { idle: 4, attack1: 4, attack2: 4, attack3: 4, attack4: 4, hurt: 3, death: 4, walk: 4 },
    fileMap: { idle: 'Arachnid_idle.png', attack1: 'Arachnid_attack1.png', attack2: 'Arachnid_attack2.png', attack3: 'Arachnid_attack3.png', attack4: 'Arachnid_attack4.png', hurt: 'Arachnid_hurt.png', death: 'Arachnid_death.png', walk: 'Arachnid_walk.png' }
  },
  'fantasy-spider': {
    spriteKey: 'mine-arachnid', folder: 'sprites/mine-arachnid', fw: 48, fh: 48,
    anims: { idle: 4, attack1: 4, attack2: 4, attack3: 4, attack4: 4, hurt: 3, death: 4, walk: 4 },
    fileMap: { idle: 'Arachnid_idle.png', attack1: 'Arachnid_attack1.png', attack2: 'Arachnid_attack2.png', attack3: 'Arachnid_attack3.png', attack4: 'Arachnid_attack4.png', hurt: 'Arachnid_hurt.png', death: 'Arachnid_death.png', walk: 'Arachnid_walk.png' }
  },
  // === Trolls ===
  'cave-troll': {
    spriteKey: 'ogre-boss', folder: 'sprites/ogre-boss', fw: 100, fh: 100,
    anims: { idle: 6, walk: 6, attack1: 6, attack2: 5, hurt: 3, death: 5 }
  },
  'earthborn-troll': {
    spriteKey: 'ogre-boss', folder: 'sprites/ogre-boss', fw: 100, fh: 100,
    anims: { idle: 6, walk: 6, attack1: 6, attack2: 5, hurt: 3, death: 5 }
  },
  'mean-troll': {
    spriteKey: 'ogre-boss', folder: 'sprites/ogre-boss', fw: 100, fh: 100,
    anims: { idle: 6, walk: 6, attack1: 6, attack2: 5, hurt: 3, death: 5 }
  },
  'lowpoly-troll': {
    spriteKey: 'ogre-boss', folder: 'sprites/ogre-boss', fw: 100, fh: 100,
    anims: { idle: 6, walk: 6, attack1: 6, attack2: 5, hurt: 3, death: 5 }
  },
  // === Orcs ===
  'mini-orc': {
    spriteKey: 'orc', folder: 'sprites/orc', fw: 100, fh: 100,
    anims: { idle: 6, attack1: 6, attack2: 6, hurt: 4, death: 4, walk: 8 }
  },
  'orc-warrior': {
    spriteKey: 'armored-orc', folder: 'sprites/enemies/armored-orc', fw: 100, fh: 100,
    anims: { idle: 6, attack1: 7, attack2: 8, attack3: 9, block: 4, hurt: 4, death: 4, walk: 8 }
  },
  'orc-berserker': {
    spriteKey: 'elite-orc', folder: 'sprites/enemies/elite-orc', fw: 100, fh: 100,
    anims: { idle: 6, attack1: 7, attack2: 11, attack3: 9, hurt: 4, death: 4, walk: 8 }
  },
  // === Undead ===
  'necromancer-acolyte': {
    spriteKey: 'evil-wizard', folder: 'sprites/enemies/evil-wizard', fw: 250, fh: 250,
    anims: { idle: 8, attack1: 8, attack2: 8, hurt: 4, death: 5, walk: 8 }
  },
  'mimic': {
    spriteKey: 'mimic-chest', folder: 'sprites/monsters/mimic_chest', fw: 32, fh: 32,
    anims: { idle: 4, attack1: 4, attack2: 4, chomp: 5, open: 6, close: 6, hurt: 6, death: 6, walk: 4 }
  },
  // === Golems ===
  'rock-golem': {
    spriteKey: 'stone-guardian', folder: 'sprites/monsters/stone_guardian', fw: 64, fh: 64,
    anims: { idle: 9, attack1: 6, hurt: 3, walk: 6 }
  },
  // === Minotaurs ===
  'minotaur-guard': {
    spriteKey: 'ogre-boss', folder: 'sprites/ogre-boss', fw: 100, fh: 100,
    anims: { idle: 6, walk: 6, attack1: 6, attack2: 5, hurt: 3, death: 5 }
  },
  'minotaur-champion': {
    spriteKey: 'ogre-boss', folder: 'sprites/ogre-boss', fw: 100, fh: 100,
    anims: { idle: 6, walk: 6, attack1: 6, attack2: 5, hurt: 3, death: 5 }
  },
  // === Dragons ===
  'fire-drake': {
    spriteKey: 'dragon-red', folder: 'sprites/dragon-red', fw: 128, fh: 128,
    anims: { idle: 4, attack1: 5, attack2: 5, hurt: 3, death: 4, walk: 6, flight: 8, special: 6 },
    fileMap: { idle: 'Idle.png', attack1: 'Attack_1.png', attack2: 'Attack_2.png', hurt: 'Hurt.png', death: 'Dead.png', walk: 'Walk.png', flight: 'Flight.png', special: 'Special.png' }
  },
  'frost-wyrm': {
    spriteKey: 'dragon-white', folder: 'sprites/dragon-white', fw: 128, fh: 128,
    anims: { idle: 4, attack1: 5, attack2: 5, hurt: 3, death: 4, walk: 6, flight: 8, special: 6 },
    fileMap: { idle: 'Idle.png', attack1: 'Attack_1.png', attack2: 'Attack_2.png', hurt: 'Hurt.png', death: 'Dead.png', walk: 'Walk.png', flight: 'Flight.png', special: 'Special.png' }
  },
  'shadow-dragon': {
    spriteKey: 'dark-knight', folder: 'sprites/dark-knight', fw: 128, fh: 96,
    anims: { idle: 4, attack1: 8, attack2: 11, hurt: 3, death: 4, walk: 6 }
  },
  'boar-dragon': {
    spriteKey: 'dragon-red', folder: 'sprites/dragon-red', fw: 128, fh: 128,
    anims: { idle: 4, attack1: 5, attack2: 5, hurt: 3, death: 4, walk: 6, flight: 8, special: 6 },
    fileMap: { idle: 'Idle.png', attack1: 'Attack_1.png', attack2: 'Attack_2.png', hurt: 'Hurt.png', death: 'Dead.png', walk: 'Walk.png', flight: 'Flight.png', special: 'Special.png' }
  },
  // === Egyptians ===
  'anubis-warrior': {
    spriteKey: 'desert-deceased', folder: 'sprites/desert-deceased', fw: 48, fh: 48,
    anims: { idle: 4, walk: 6, attack1: 4, hurt: 2, death: 6 }
  },
  'sphinx-guardian': {
    spriteKey: 'desert-mummy', folder: 'sprites/desert-mummy', fw: 48, fh: 48,
    anims: { idle: 4, walk: 6, attack1: 6, hurt: 2, death: 6 }
  },
  'mummy-lord': {
    spriteKey: 'desert-mummy', folder: 'sprites/desert-mummy', fw: 48, fh: 48,
    anims: { idle: 4, walk: 6, attack1: 6, hurt: 2, death: 6 }
  },
  // === Titans ===
  'creature-titan': {
    spriteKey: 'crystal-mauler', folder: 'sprites/crystal-mauler', fw: 288, fh: 128,
    anims: { idle: 8, walk: 8, attack1: 7, attack2: 7, attack3: 17, cast: 15, block: 9, hurt: 6, death: 15 }
  },
  'juggernaut': {
    spriteKey: 'armored-orc', folder: 'sprites/enemies/armored-orc', fw: 100, fh: 100,
    anims: { idle: 6, attack1: 7, attack2: 8, attack3: 9, block: 4, hurt: 4, death: 4, walk: 8 }
  },
  'cyclops': {
    spriteKey: 'ogre-boss', folder: 'sprites/ogre-boss', fw: 100, fh: 100,
    anims: { idle: 6, walk: 6, attack1: 6, attack2: 5, hurt: 3, death: 5 }
  },
  // === Reptiles ===
  'reptile-stalker': {
    spriteKey: 'desert-snake', folder: 'sprites/desert-snake', fw: 48, fh: 48,
    anims: { idle: 4, walk: 4, attack1: 6, hurt: 2, death: 4 }
  },
  // === Elementals ===
  'fire-phantom': {
    spriteKey: 'fire-wizard', folder: 'sprites/fire-wizard', fw: 128, fh: 128,
    anims: { idle: 7, walk: 6, attack1: 4, attack2: 4, cast: 8, hurt: 3, death: 6 }
  },
  'fantasy-wizard': {
    spriteKey: 'evil-wizard-2', folder: 'sprites/evil-wizard-2', fw: 250, fh: 250,
    anims: { idle: 8, attack1: 8, attack2: 8, hurt: 3, death: 7, walk: 8 }
  },
};

// ── Boss → sprite mapping ──
const bossSpriteMap = {
  'boss-hunter': {
    spriteKey: 'skeleton-archer', folder: 'sprites/skeleton-archer', fw: 128, fh: 128,
    anims: { idle: 7, walk: 8, attack1: 5, attack2: 4, attack3: 3, hurt: 2, death: 5, block: 6, shot1: 15, shot2: 15 },
    fileMap: { idle: 'Idle.png', walk: 'Walk.png', attack1: 'Attack_1.png', attack2: 'Attack_2.png', attack3: 'Attack_3.png', hurt: 'Hurt.png', death: 'Dead.png', block: 'Evasion.png', shot1: 'Shot_1.png', shot2: 'Shot_2.png' }
  },
  'tortoise-boss': {
    spriteKey: 'frost-guardian', folder: 'sprites/frost-guardian', fw: 192, fh: 128,
    anims: { idle: 6, walk: 10, attack1: 14, hurt: 7, death: 16 },
    fileMap: { hurt: 'take_hit.png' }
  },
  'dragon-terror-bringer': {
    spriteKey: 'dragon-red', folder: 'sprites/dragon-red', fw: 128, fh: 128,
    anims: { idle: 4, attack1: 5, attack2: 5, hurt: 3, death: 4, walk: 6, flight: 8, special: 6 },
    fileMap: { idle: 'Idle.png', attack1: 'Attack_1.png', attack2: 'Attack_2.png', hurt: 'Hurt.png', death: 'Dead.png', walk: 'Walk.png', flight: 'Flight.png', special: 'Special.png' }
  },
  'minotaur-king': {
    spriteKey: 'ogre-boss', folder: 'sprites/ogre-boss', fw: 100, fh: 100,
    anims: { idle: 6, walk: 6, attack1: 6, attack2: 5, hurt: 3, death: 5 }
  },
  'necromancer-lord': {
    spriteKey: 'necromancer', folder: 'sprites/necromancer', fw: 160, fh: 128,
    anims: { idle: 8, attack1: 13, attack2: 13, cast: 17, hurt: 9, death: 5, walk: 8 },
    fileMap: { cast: 'cast2.png' }
  },
  'phoenix-infernal': {
    spriteKey: 'dragon-red', folder: 'sprites/dragon-red', fw: 128, fh: 128,
    anims: { idle: 4, attack1: 5, attack2: 5, hurt: 3, death: 4, walk: 6, flight: 8, special: 6 },
    fileMap: { idle: 'Idle.png', attack1: 'Attack_1.png', attack2: 'Attack_2.png', hurt: 'Hurt.png', death: 'Dead.png', walk: 'Walk.png', flight: 'Flight.png', special: 'Special.png' }
  },
  'titan-colossus': {
    spriteKey: 'crystal-mauler', folder: 'sprites/crystal-mauler', fw: 288, fh: 128,
    anims: { idle: 8, walk: 8, attack1: 7, attack2: 7, attack3: 17, cast: 15, block: 9, hurt: 6, death: 15 }
  },
  'mimic-king': {
    spriteKey: 'mimic-chest', folder: 'sprites/monsters/mimic_chest', fw: 32, fh: 32,
    anims: { idle: 4, attack1: 4, attack2: 4, chomp: 5, open: 6, close: 6, hurt: 6, death: 6, walk: 4 }
  },
  'rhino-warlord': {
    spriteKey: 'ogre-boss', folder: 'sprites/ogre-boss', fw: 100, fh: 100,
    anims: { idle: 6, walk: 6, attack1: 6, attack2: 5, hurt: 3, death: 5 }
  },
  'four-evil-dragons': {
    spriteKey: 'dragon-red', folder: 'sprites/dragon-red', fw: 128, fh: 128,
    anims: { idle: 4, attack1: 5, attack2: 5, hurt: 3, death: 4, walk: 6, flight: 8, special: 6 },
    fileMap: { idle: 'Idle.png', attack1: 'Attack_1.png', attack2: 'Attack_2.png', hurt: 'Hurt.png', death: 'Dead.png', walk: 'Walk.png', flight: 'Flight.png', special: 'Special.png' }
  },
  'spider-queen': {
    spriteKey: 'mine-arachnid', folder: 'sprites/mine-arachnid', fw: 48, fh: 48,
    anims: { idle: 4, attack1: 4, attack2: 4, attack3: 4, attack4: 4, hurt: 3, death: 4, walk: 4 },
    fileMap: { idle: 'Arachnid_idle.png', attack1: 'Arachnid_attack1.png', attack2: 'Arachnid_attack2.png', attack3: 'Arachnid_attack3.png', attack4: 'Arachnid_attack4.png', hurt: 'Arachnid_hurt.png', death: 'Arachnid_death.png', walk: 'Arachnid_walk.png' }
  },
  'egypt-pharaoh': {
    spriteKey: 'evil-wizard-2', folder: 'sprites/evil-wizard-2', fw: 250, fh: 250,
    anims: { idle: 8, attack1: 8, attack2: 8, hurt: 3, death: 7, walk: 8 }
  },
};

function buildSpriteData(mapping) {
  const animations = {};
  for (const [anim, frames] of Object.entries(mapping.anims)) {
    const file = mapping.fileMap?.[anim] || `${anim}.png`;
    animations[anim] = { file, frames };
  }
  return {
    spriteKey: mapping.spriteKey,
    folder: mapping.folder,
    frameWidth: mapping.fw,
    frameHeight: mapping.fh,
    animations,
  };
}

// ── Process enemies.json ──
const enemiesPath = path.join(ROOT, 'api/v1/enemies.json');
const enemies = JSON.parse(fs.readFileSync(enemiesPath, 'utf8'));
let enemyCount = 0;

for (const cat of Object.values(enemies.categories)) {
  for (const item of cat.items) {
    const mapping = enemySpriteMap[item.id];
    if (mapping) {
      item.spriteData = buildSpriteData(mapping);
      enemyCount++;
    }
  }
}

fs.writeFileSync(enemiesPath, JSON.stringify(enemies, null, 2) + '\n');
console.log(`✓ Updated ${enemyCount} enemies with spriteData`);

// ── Process bosses.json ──
const bossesPath = path.join(ROOT, 'api/v1/bosses.json');
const bosses = JSON.parse(fs.readFileSync(bossesPath, 'utf8'));
let bossCount = 0;

for (const boss of bosses.bosses) {
  const mapping = bossSpriteMap[boss.id];
  if (mapping) {
    boss.spriteData = buildSpriteData(mapping);
    bossCount++;
  }
}

fs.writeFileSync(bossesPath, JSON.stringify(bosses, null, 2) + '\n');
console.log(`✓ Updated ${bossCount} bosses with spriteData`);
console.log(`Total: ${enemyCount + bossCount} entries updated`);

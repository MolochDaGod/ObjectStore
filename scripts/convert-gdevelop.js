/**
 * Convert GDevelopAssistant engine data to ObjectStore JSON endpoints
 * Generates: factionUnits, nodeUpgrades, tileMaps, animations, rendering, controllers, terrain, ai, ecs
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'api', 'v1');

function write(name, data) {
  const fp = path.join(OUT_DIR, name);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2));
  console.log(`  ✅ ${name} (${(fs.statSync(fp).size / 1024).toFixed(1)} KB)`);
}

// ===== 1. FACTION UNITS =====
function buildFactionUnits() {
  const factions = {
    fabled: {
      id: "fabled", name: "The Fabled", color: "#22c55e", buildingColor: "Lime",
      description: "Ancient warriors and mystical beings, guardians of the old ways",
      units: [
        { id: "fabled_archer", name: "Archer", type: "ranged", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Archer", animations: ["Idle","Walk","Attack01","Attack02","Death","Hurt"], stats: { health: 80, speed: 45, attackDamage: 20, attackRange: 120, attackCooldown: 0.8, size: 32 }, description: "Swift ranged attacker with deadly accuracy" },
        { id: "fabled_armored_axeman", name: "Armored Axeman", type: "melee", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Armored Axeman", animations: ["Idle","Walk","Attack01","Attack02","Attack03","Death","Hurt"], stats: { health: 180, speed: 30, attackDamage: 35, attackRange: 25, attackCooldown: 1.0, size: 36 }, description: "Heavily armored warrior with devastating axe strikes" },
        { id: "fabled_knight_templar", name: "Knight Templar", type: "heavy", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Knight Templar", animations: ["Idle","Walk","Attack01","Attack02","Death","Hurt"], stats: { health: 250, speed: 25, attackDamage: 45, attackRange: 30, attackCooldown: 1.2, size: 40 }, description: "Elite holy warrior with unbreakable defense" },
        { id: "fabled_mage", name: "Mage", type: "magic", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Mage", animations: ["Idle","Walk","Attack","Death","Hurt"], stats: { health: 60, speed: 35, attackDamage: 30, attackRange: 140, attackCooldown: 1.5, size: 32 }, description: "Powerful spellcaster dealing magical damage" },
        { id: "fabled_priest", name: "Priest", type: "support", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Priest", animations: ["Idle","Walk","Attack","Death","Hurt"], stats: { health: 100, speed: 40, attackDamage: 15, attackRange: 100, attackCooldown: 1.0, size: 32 }, description: "Holy healer providing support to allies" },
        { id: "fabled_werebear", name: "Werebear", type: "heavy", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Werebear", animations: ["Idle","Walk","Attack01","Attack02","Death","Hurt"], stats: { health: 300, speed: 35, attackDamage: 55, attackRange: 35, attackCooldown: 1.3, size: 48 }, description: "Massive beast with overwhelming strength" }
      ]
    },
    legion: {
      id: "legion", name: "The Legion", color: "#dc2626", buildingColor: "Enemy",
      description: "Undead army and orcish hordes, servants of darkness",
      units: [
        { id: "legion_skeleton", name: "Skeleton", type: "melee", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Skeleton", animations: ["Idle","Walk","Attack01","Attack02","Death","Hurt"], stats: { health: 70, speed: 42, attackDamage: 18, attackRange: 22, attackCooldown: 0.7, size: 32 }, description: "Basic undead warrior, fast but fragile" },
        { id: "legion_skeleton_archer", name: "Skeleton Archer", type: "ranged", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Skeleton Archer", animations: ["Idle","Walk","Attack","Death","Hurt"], stats: { health: 60, speed: 45, attackDamage: 22, attackRange: 130, attackCooldown: 0.9, size: 32 }, description: "Undead archer with cursed arrows" },
        { id: "legion_armored_skeleton", name: "Armored Skeleton", type: "heavy", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Armored Skeleton", animations: ["Idle","Walk","Attack","Death","Hurt"], stats: { health: 150, speed: 30, attackDamage: 32, attackRange: 25, attackCooldown: 1.0, size: 36 }, description: "Heavily armored undead warrior" },
        { id: "legion_greatsword_skeleton", name: "Greatsword Skeleton", type: "heavy", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Greatsword Skeleton", animations: ["Idle","Walk","Attack01","Attack02","Death","Hurt"], stats: { health: 180, speed: 28, attackDamage: 50, attackRange: 30, attackCooldown: 1.4, size: 40 }, description: "Powerful skeleton wielding a massive greatsword" },
        { id: "legion_elite_orc", name: "Elite Orc", type: "heavy", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Elite Orc", animations: ["Idle","Walk","Attack","Death","Hurt"], stats: { health: 220, speed: 32, attackDamage: 42, attackRange: 28, attackCooldown: 1.1, size: 40 }, description: "Brutal orc champion with savage strength" },
        { id: "legion_orc_rider", name: "Orc Rider", type: "cavalry", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Orc rider", animations: ["Idle","Walk","Attack","Death","Hurt"], stats: { health: 160, speed: 55, attackDamage: 38, attackRange: 30, attackCooldown: 0.9, size: 44 }, description: "Fast-moving mounted orc warrior" }
      ]
    },
    crusade: {
      id: "crusade", name: "Crusade", color: "#3b82f6", buildingColor: "Cyan",
      description: "United human forces, defenders of the realm",
      units: [
        { id: "crusade_knight", name: "Knight", type: "heavy", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Knight", animations: ["Idle","Walk","Attack","Death","Hurt"], stats: { health: 200, speed: 30, attackDamage: 40, attackRange: 28, attackCooldown: 1.1, size: 40 }, description: "Noble knight in heavy armor" },
        { id: "crusade_wizard", name: "Wizard", type: "magic", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Wizard", animations: ["Idle","Walk","Attack01","Attack02","Death","Hurt"], stats: { health: 70, speed: 35, attackDamage: 35, attackRange: 150, attackCooldown: 1.6, size: 32 }, description: "Master of arcane magic" },
        { id: "crusade_priest", name: "Priest", type: "support", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Priest", animations: ["Idle","Walk","Attack","Death","Hurt"], stats: { health: 90, speed: 40, attackDamage: 12, attackRange: 95, attackCooldown: 0.9, size: 32 }, description: "Devoted cleric with healing powers" },
        { id: "crusade_archer", name: "Archer", type: "ranged", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Archer", animations: ["Idle","Walk","Attack01","Attack02","Death","Hurt"], stats: { health: 75, speed: 45, attackDamage: 18, attackRange: 115, attackCooldown: 0.75, size: 32 }, description: "Skilled bowman with rapid fire" },
        { id: "crusade_swordsman", name: "Swordsman", type: "melee", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Swordsman", animations: ["Idle","Walk","Attack","Death","Hurt"], stats: { health: 120, speed: 38, attackDamage: 25, attackRange: 24, attackCooldown: 0.8, size: 34 }, description: "Veteran soldier with sword and shield" },
        { id: "crusade_soldier", name: "Soldier", type: "melee", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Soldier", animations: ["Idle","Walk","Attack","Death","Hurt"], stats: { health: 110, speed: 40, attackDamage: 22, attackRange: 23, attackCooldown: 0.75, size: 34 }, description: "Disciplined infantry unit" },
        { id: "crusade_lancer", name: "Lancer", type: "cavalry", spritePath: "docs/MiniWorldSprites/Characters/Heros/GrudgeRPGAssets2d/Lancer", animations: ["Idle","Walk","Attack","Death","Hurt"], stats: { health: 140, speed: 52, attackDamage: 32, attackRange: 32, attackCooldown: 0.9, size: 40 }, description: "Mounted warrior with lance" }
      ]
    }
  };
  const totalUnits = Object.values(factions).reduce((s, f) => s + f.units.length, 0);
  write('factionUnits.json', { version: "1.0.0", description: "RTS faction units with stats, animations, and sprite paths", totalUnits, unitTypes: ["melee","ranged","heavy","magic","support","cavalry"], factions });
  return totalUnits;
}

// ===== 2. NODE UPGRADES =====
function buildNodeUpgrades() {
  const data = {
    version: "1.0.0",
    description: "RTS node upgrade system with unit tiers, costs, and progression",
    unitTiers: {
      fabled: { tier0: ["fabled_archer","fabled_priest"], tier1: ["fabled_armored_axeman","fabled_mage"], tier2: ["fabled_knight_templar","fabled_werebear"] },
      legion: { tier0: ["legion_skeleton","legion_skeleton_archer"], tier1: ["legion_armored_skeleton","legion_greatsword_skeleton"], tier2: ["legion_elite_orc","legion_orc_rider"] },
      crusade: { tier0: ["crusade_archer","crusade_soldier"], tier1: ["crusade_swordsman","crusade_priest"], tier2: ["crusade_knight","crusade_wizard","crusade_lancer"] }
    },
    nodeTypes: {
      start: { type: "start", description: "Main base - Losing this node means defeat", upgrades: [
        { level: 0, cost: 0, spawnRate: 0.15, health: 5000, visionRadius: 200 },
        { level: 1, cost: 500, spawnRate: 0.18, health: 7500, visionRadius: 250 },
        { level: 2, cost: 1000, spawnRate: 0.22, health: 10000, visionRadius: 300 },
        { level: 3, cost: 2000, spawnRate: 0.28, health: 15000, visionRadius: 350 }
      ]},
      standard: { type: "standard", description: "Standard control point - Provides unit spawning", upgrades: [
        { level: 0, cost: 0, spawnRate: 0.08, health: 2000, visionRadius: 150 },
        { level: 1, cost: 300, spawnRate: 0.12, health: 3500, visionRadius: 180 },
        { level: 2, cost: 600, spawnRate: 0.16, health: 5000, visionRadius: 220 },
        { level: 3, cost: 1200, spawnRate: 0.20, health: 7500, visionRadius: 280 }
      ]},
      resource: { type: "resource", description: "Resource node - Increases passive resource generation", resourceBonus: 0.25, upgrades: [
        { level: 0, cost: 0, spawnRate: 0.05, health: 1500, visionRadius: 120 },
        { level: 1, cost: 200, spawnRate: 0.08, health: 2500, visionRadius: 150 },
        { level: 2, cost: 400, spawnRate: 0.12, health: 4000, visionRadius: 180 },
        { level: 3, cost: 800, spawnRate: 0.16, health: 6000, visionRadius: 220 }
      ]}
    }
  };
  write('nodeUpgrades.json', data);
}

// ===== 3. TILE MAPS =====
function buildTileMaps() {
  const data = {
    version: "1.0.0",
    description: "RTS tile-based maps with nodes, terrain objects, and collision data",
    tileTypes: ["grass","road","dirt","water","stone"],
    terrainObjectTypes: ["tree","rock","bush","water_area"],
    maps: [
      {
        id: "small_conquest", name: "Small Conquest", width: 2400, height: 1400, tileSize: 50, difficulty: 1,
        description: "Small 2v2 map with resource control point",
        nodes: [
          { id: "start_left", nodeType: "start", x: 300, y: 700, radius: 80, defaultFaction: "fabled" },
          { id: "start_right", nodeType: "start", x: 2100, y: 700, radius: 80, defaultFaction: "legion" },
          { id: "node_top", nodeType: "standard", x: 1200, y: 400, radius: 60, defaultFaction: null },
          { id: "node_bottom", nodeType: "standard", x: 1200, y: 1000, radius: 60, defaultFaction: null },
          { id: "resource_center", nodeType: "resource", x: 1200, y: 700, radius: 70, defaultFaction: null }
        ],
        terrainObjects: [
          { id: "tree1", type: "tree", x: 150, y: 200, radius: 25, hasCollision: true },
          { id: "tree2", type: "tree", x: 200, y: 250, radius: 25, hasCollision: true },
          { id: "tree3", type: "tree", x: 150, y: 1200, radius: 25, hasCollision: true },
          { id: "tree4", type: "tree", x: 200, y: 1150, radius: 25, hasCollision: true },
          { id: "tree5", type: "tree", x: 2250, y: 200, radius: 25, hasCollision: true },
          { id: "tree6", type: "tree", x: 2200, y: 250, radius: 25, hasCollision: true },
          { id: "tree7", type: "tree", x: 2250, y: 1200, radius: 25, hasCollision: true },
          { id: "tree8", type: "tree", x: 2200, y: 1150, radius: 25, hasCollision: true },
          { id: "rock1", type: "rock", x: 1000, y: 600, radius: 30, hasCollision: true },
          { id: "rock2", type: "rock", x: 1400, y: 800, radius: 30, hasCollision: true },
          { id: "bush1", type: "bush", x: 500, y: 500, radius: 15, hasCollision: false },
          { id: "bush2", type: "bush", x: 1900, y: 900, radius: 15, hasCollision: false }
        ],
        roads: [
          { from: [300,700], to: [1200,400] }, { from: [300,700], to: [1200,1000] },
          { from: [2100,700], to: [1200,400] }, { from: [2100,700], to: [1200,1000] },
          { from: [1200,400], to: [1200,1000] }
        ],
        startPositions: { fabled: { x: 300, y: 700 }, legion: { x: 2100, y: 700 }, crusade: { x: 1200, y: 700 } }
      },
      {
        id: "medium_tactical", name: "Tactical Warfare", width: 3000, height: 1800, tileSize: 50, difficulty: 2,
        description: "Medium map with strategic chokepoints and resource nodes",
        nodes: [
          { id: "start_left", nodeType: "start", x: 400, y: 900, radius: 80, defaultFaction: "fabled" },
          { id: "start_right", nodeType: "start", x: 2600, y: 900, radius: 80, defaultFaction: "crusade" },
          { id: "resource_top", nodeType: "resource", x: 1500, y: 400, radius: 65, defaultFaction: null },
          { id: "resource_bottom", nodeType: "resource", x: 1500, y: 1400, radius: 65, defaultFaction: null },
          { id: "node_mid_left", nodeType: "standard", x: 900, y: 600, radius: 60, defaultFaction: null },
          { id: "node_mid_right", nodeType: "standard", x: 2100, y: 1200, radius: 60, defaultFaction: null },
          { id: "node_center", nodeType: "standard", x: 1500, y: 900, radius: 70, defaultFaction: null }
        ],
        terrainObjects: [
          { id: "forest1_1", type: "tree", x: 600, y: 300, radius: 28, hasCollision: true },
          { id: "forest1_2", type: "tree", x: 650, y: 350, radius: 28, hasCollision: true },
          { id: "forest1_3", type: "tree", x: 700, y: 320, radius: 28, hasCollision: true },
          { id: "forest2_1", type: "tree", x: 2300, y: 1500, radius: 28, hasCollision: true },
          { id: "forest2_2", type: "tree", x: 2350, y: 1550, radius: 28, hasCollision: true },
          { id: "forest2_3", type: "tree", x: 2400, y: 1520, radius: 28, hasCollision: true },
          { id: "rocks1", type: "rock", x: 1200, y: 700, radius: 35, hasCollision: true },
          { id: "rocks2", type: "rock", x: 1800, y: 1100, radius: 35, hasCollision: true },
          { id: "rocks3", type: "rock", x: 1300, y: 1200, radius: 30, hasCollision: true },
          { id: "bush_dec1", type: "bush", x: 800, y: 800, radius: 15, hasCollision: false },
          { id: "bush_dec2", type: "bush", x: 2200, y: 1000, radius: 15, hasCollision: false }
        ],
        roads: [
          { from: [400,900], to: [900,600] }, { from: [900,600], to: [1500,400] },
          { from: [1500,900], to: [1500,400] }, { from: [2600,900], to: [2100,1200] },
          { from: [2100,1200], to: [1500,1400] }, { from: [1500,900], to: [1500,1400] }
        ],
        startPositions: { fabled: { x: 400, y: 900 }, legion: { x: 1500, y: 900 }, crusade: { x: 2600, y: 900 } }
      }
    ]
  };
  write('tileMaps.json', data);
}

// ===== 4. ANIMATIONS =====
function buildAnimations() {
  const data = {
    version: "1.0.0",
    description: "Animation system definitions — common animations, controller config, transition rules",
    commonAnimations: {
      IDLE: "idle", WALK: "walk", RUN: "run", ATTACK: "attack",
      ATTACK_MELEE: "attack_melee", ATTACK_RANGED: "attack_ranged",
      DIE: "die", DEATH: "death", HIT: "hit", HURT: "hurt",
      JUMP: "jump", FALL: "fall", GATHER: "gather", BUILD: "build",
      CAST: "cast", SPELL: "spell", VICTORY: "victory", DEFEAT: "defeat"
    },
    controllerParameters: ["speed","direction","intensity","blend","custom"],
    transitionRules: {
      idle: ["walk","run","jump","attack"],
      walk: ["idle","run","jump","attack"],
      run: ["idle","walk","jump","attack"],
      attack: ["idle","walk","run"],
      attack_melee: ["idle","walk","run"],
      attack_ranged: ["idle","walk","run"],
      cast: ["idle","walk","run"],
      spell: ["idle","walk","run"]
    },
    animationCategories: {
      combat: { keywords: ["attack","spell"], description: "Combat-related animations" },
      movement: { keywords: ["move","walk","run"], description: "Locomotion animations" },
      idle: { keywords: ["idle","stand"], description: "Idle/standing animations" }
    },
    blendDefaults: { fadeIn: 0.2, fadeOut: 0.2, similarAnimBlendMultiplier: 0.8, differentAnimBlendMultiplier: 1.2 },
    debugEventTypes: ["start","end","blend","interrupt","error"]
  };
  write('animations.json', data);
}

// ===== 5. RENDERING =====
function buildRendering() {
  const data = {
    version: "1.0.0",
    description: "Three.js rendering reference — materials, skybox presets, particle effects, spell effects",
    materials: {
      MeshBasicMaterial: { description: "Simple shaded, not affected by lights", useCase: "Unlit objects, backgrounds, wireframes", performance: "Fastest" },
      MeshLambertMaterial: { description: "Lambertian reflectance, per-vertex lighting", useCase: "Matte surfaces like wood, stone, fabric", performance: "Fast" },
      MeshPhongMaterial: { description: "Blinn-Phong shading with specular highlights", useCase: "Shiny surfaces like plastic, polished metal", performance: "Medium" },
      MeshStandardMaterial: { description: "PBR Metallic-Roughness workflow", useCase: "Realistic materials — default choice", performance: "Slower" },
      MeshPhysicalMaterial: { description: "Extended PBR with clearcoat, transmission, sheen", useCase: "Glass, gems, car paint, subsurface scattering", performance: "Slowest" }
    },
    materialFeatures: {
      universal: ["alphaMap","aoMap","aoMapIntensity","color","envMap","envMapRotation","fog","lightMap","lightMapIntensity","map"],
      litMaterials: ["bumpMap","bumpScale","displacementMap","displacementScale","displacementBias","emissive","emissiveIntensity","emissiveMap","flatShading","normalMap","normalScale"],
      pbrMaterials: ["metalness","metalnessMap","roughness","roughnessMap","envMapIntensity"],
      physicalOnly: ["clearcoat","clearcoatMap","clearcoatRoughness","ior","transmission","transmissionMap","thickness","sheen","sheenColor","iridescence","anisotropy"]
    },
    skyboxPresets: {
      daytime: { topColor: "#1e90ff", bottomColor: "#87ceeb", sunColor: "#ffdd88", cloudDensity: 0.3, timeOfDay: 0.5 },
      sunset: { topColor: "#1a1a4e", bottomColor: "#ff6b35", sunColor: "#ff4500", cloudDensity: 0.4, timeOfDay: 0.75 },
      night: { topColor: "#0a0a1a", bottomColor: "#1a1a2e", sunColor: "#aaaacc", cloudDensity: 0.1, timeOfDay: 0.1 },
      hellscape: { topColor: "#2a0a0a", bottomColor: "#8b0000", sunColor: "#ff4400", cloudDensity: 0.6, timeOfDay: 0.5 },
      arctic: { topColor: "#4a6fa5", bottomColor: "#d4e5f7", sunColor: "#ffffff", cloudDensity: 0.5, timeOfDay: 0.4 },
      fantasy: { topColor: "#2e1a47", bottomColor: "#6b3fa0", sunColor: "#ff88ff", cloudDensity: 0.4, timeOfDay: 0.6 },
      grudgeBrawl: { topColor: "#0a0a0a", bottomColor: "#1a0a0a", sunColor: "#dc2626", cloudDensity: 0.2, timeOfDay: 0.3 }
    },
    particlePresets: {
      explosion: { count: 100, size: 0.5, color: "#ff6600", colorEnd: "#ff0000", lifetime: 0.8, speed: 8, spread: 5, gravity: 15 },
      fire: { count: 50, size: 0.4, color: "#ff4400", colorEnd: "#ffff00", lifetime: 1.2, speed: 3, spread: 1, gravity: -2 },
      smoke: { count: 30, size: 1, color: "#888888", colorEnd: "#333333", lifetime: 2, speed: 1.5, spread: 0.5, gravity: -0.5, opacity: 0.6 },
      spark: { count: 20, size: 0.15, color: "#ffff00", colorEnd: "#ff8800", lifetime: 0.5, speed: 12, spread: 3, gravity: 20 },
      blood: { count: 40, size: 0.2, color: "#8b0000", colorEnd: "#4a0000", lifetime: 0.6, speed: 6, spread: 2, gravity: 25 },
      magic: { count: 60, size: 0.3, color: "#9966ff", colorEnd: "#ffffff", lifetime: 1.5, speed: 2, spread: 2, gravity: -1 },
      heal: { count: 40, size: 0.25, color: "#00ff88", colorEnd: "#88ffcc", lifetime: 1.2, speed: 2, spread: 1.5, gravity: -3 },
      frost: { count: 50, size: 0.2, color: "#88ccff", colorEnd: "#ffffff", lifetime: 1.5, speed: 1.5, spread: 2, gravity: 1 },
      lightning: { count: 30, size: 0.15, color: "#aaddff", colorEnd: "#ffffff", lifetime: 0.2, speed: 20, spread: 1, gravity: 0 },
      impact: { count: 25, size: 0.2, color: "#ffffff", colorEnd: "#888888", lifetime: 0.3, speed: 10, spread: 4, gravity: 30 }
    },
    spellEffects: ["FireballEffect","FrostEffect","LightningEffect","HealingAura","PortalEffect"],
    damageTypes: { physical: "#ff4444", fire: "#ff6600", ice: "#88ccff", magic: "#9966ff" }
  };
  write('rendering.json', data);
}

// ===== 6. CONTROLLERS =====
function buildControllers() {
  const data = {
    version: "1.0.0",
    description: "Camera systems and input controllers — RTS camera, chase camera, first-person, mouse controller",
    rtsCameraPresets: {
      classic: { minZoom: 10, maxZoom: 100, zoomSpeed: 5, panSpeed: 0.5, rotationSpeed: 0.3, smoothing: 0.1, minPitch: 30, maxPitch: 80, edgePanEnabled: true, edgePanMargin: 30, edgePanSpeed: 30 },
      closeUp: { minZoom: 5, maxZoom: 50, zoomSpeed: 3, panSpeed: 0.3, rotationSpeed: 0.2, smoothing: 0.15, minPitch: 20, maxPitch: 60, edgePanEnabled: true, edgePanMargin: 40, edgePanSpeed: 20 },
      strategic: { minZoom: 30, maxZoom: 200, zoomSpeed: 10, panSpeed: 1, rotationSpeed: 0.5, smoothing: 0.05, minPitch: 45, maxPitch: 90, edgePanEnabled: true, edgePanMargin: 20, edgePanSpeed: 50 },
      isometric: { minZoom: 15, maxZoom: 80, zoomSpeed: 4, panSpeed: 0.4, rotationSpeed: 0, smoothing: 0.08, minPitch: 45, maxPitch: 45, edgePanEnabled: true, edgePanMargin: 25, edgePanSpeed: 25 },
      grudgeBrawl: { minZoom: 8, maxZoom: 60, zoomSpeed: 4, panSpeed: 0.4, rotationSpeed: 0.25, smoothing: 0.12, minPitch: 25, maxPitch: 70, edgePanEnabled: true, edgePanMargin: 35, edgePanSpeed: 35 }
    },
    chaseCameraPresets: {
      topDown: { distance: 20, height: 18, heightOffset: 0, lookAheadDistance: 0, smoothSpeed: 8, rotationSpeed: 0.003, minDistance: 10, maxDistance: 40, minVerticalAngle: 1.2, maxVerticalAngle: 1.4, collisionEnabled: false },
      thirdPerson: { distance: 8, height: 3, heightOffset: 1.5, lookAheadDistance: 2, smoothSpeed: 6, rotationSpeed: 0.003, minDistance: 3, maxDistance: 15, minVerticalAngle: -0.3, maxVerticalAngle: 0.8, collisionEnabled: true },
      cinematic: { distance: 12, height: 4, heightOffset: 1, lookAheadDistance: 4, smoothSpeed: 2, rotationSpeed: 0.002, minDistance: 8, maxDistance: 20, minVerticalAngle: 0, maxVerticalAngle: 0.6, collisionEnabled: true },
      mobaStyle: { distance: 15, height: 12, heightOffset: 0, lookAheadDistance: 0, smoothSpeed: 10, rotationSpeed: 0, minDistance: 10, maxDistance: 25, minVerticalAngle: 0.8, maxVerticalAngle: 1.0, collisionEnabled: false }
    },
    firstPersonDefaults: { eyeHeight: 1.7, mouseSensitivity: 0.002, minPitch: -1.47, maxPitch: 1.47 },
    rtsMouseController: {
      selectionBoxStyle: { borderColor: "#22c55e", fillColor: "rgba(34, 197, 94, 0.15)", borderWidth: 2 },
      commandIndicators: { move: "#22c55e", attack: "#dc2626", gather: "#fbbf24" },
      entityTypes: ["unit","building","resource"],
      teamTypes: ["player","enemy","neutral"]
    },
    keyBindings: {
      rtsCamera: { panUp: ["KeyW","ArrowUp"], panDown: ["KeyS","ArrowDown"], panLeft: ["KeyA","ArrowLeft"], panRight: ["KeyD","ArrowRight"], rotateLeft: ["KeyQ"], rotateRight: ["KeyE"] },
      chaseCamera: { orbit: "RightMouseButton", zoom: "MouseWheel" },
      firstPerson: { look: "PointerLock" }
    }
  };
  write('controllers.json', data);
}

// ===== 7. TERRAIN =====
function buildTerrain() {
  const data = {
    version: "1.0.0",
    description: "Procedural terrain system — noise config, biome presets, terrain types",
    terrainTypes: ["grass","dirt","water","sand","rock","snow"],
    terrainColors: {
      water: { r: 0.2, g: 0.3, b: 0.8 }, sand: { r: 0.76, g: 0.7, b: 0.5 },
      grass: { r: 0.2, g: 0.6, b: 0.2 }, rock: { r: 0.5, g: 0.5, b: 0.5 },
      snow: { r: 0.95, g: 0.95, b: 1.0 }, dirt: { r: 0.5, g: 0.35, b: 0.2 }
    },
    presets: {
      plains: { width: 100, height: 100, resolution: 128, heightScale: 5, noiseScale: 0.02, octaves: 4, persistence: 0.5, lacunarity: 2, waterLevel: 0.2, sandLevel: 0.25, grassLevel: 0.7, rockLevel: 0.85, snowLevel: 0.95 },
      mountains: { width: 100, height: 100, resolution: 128, heightScale: 30, noiseScale: 0.015, octaves: 6, persistence: 0.55, lacunarity: 2.2, waterLevel: 0.15, sandLevel: 0.2, grassLevel: 0.5, rockLevel: 0.7, snowLevel: 0.85 },
      islands: { width: 100, height: 100, resolution: 128, heightScale: 15, noiseScale: 0.025, octaves: 5, persistence: 0.5, lacunarity: 2, waterLevel: 0.4, sandLevel: 0.45, grassLevel: 0.75, rockLevel: 0.9, snowLevel: 1.0 },
      desert: { width: 100, height: 100, resolution: 128, heightScale: 8, noiseScale: 0.03, octaves: 3, persistence: 0.4, lacunarity: 2, waterLevel: 0.05, sandLevel: 0.8, grassLevel: 0.85, rockLevel: 0.95, snowLevel: 1.0 },
      arena: { width: 60, height: 60, resolution: 64, heightScale: 2, noiseScale: 0.05, octaves: 2, persistence: 0.3, lacunarity: 2, waterLevel: 0, sandLevel: 0.3, grassLevel: 0.9, rockLevel: 0.95, snowLevel: 1.0 }
    },
    noiseConfig: {
      algorithm: "Perlin",
      description: "Fractal Brownian Motion (fBm) with configurable octaves, persistence, and lacunarity"
    }
  };
  write('terrain.json', data);
}

// ===== 8. AI =====
function buildAI() {
  const data = {
    version: "1.0.0",
    description: "AI systems — behavior trees, entity states, blackboard properties, scoring",
    behaviorTreeNodes: {
      SequenceNode: { description: "Runs children in order, fails on first failure", category: "composite" },
      SelectorNode: { description: "Runs children in order, succeeds on first success", category: "composite" },
      ParallelNode: { description: "Runs all children simultaneously, configurable success threshold", category: "composite" },
      ConditionalNode: { description: "If-else branching based on condition function", category: "decorator" },
      RepeatNode: { description: "Repeats child N times or infinitely", category: "decorator" },
      InverterNode: { description: "Inverts child result (SUCCESS↔FAILED)", category: "decorator" },
      SucceederNode: { description: "Always returns SUCCESS regardless of child result", category: "decorator" }
    },
    behaviorResults: ["SUCCESS","FAILED","RUNNING","NOT_STARTED"],
    entityStates: ["idle","moving","attacking","gathering","building","fleeing","dead"],
    blackboardProperties: {
      targetId: "string", targetPosition: "Vector3", homePosition: "Vector3",
      goals: "Vector3[]", wanderRadius: "number", attackRange: "number",
      gatherAmount: "number", fleeDistance: "number", patrolPoints: "Vector3[]",
      currentPatrolIndex: "number", lastSeenEnemy: "{ id, position, time }",
      resourceType: "gold | wood | stone | food", buildingType: "string"
    },
    aiBehaviors: ["idle","patrol","chase","attack","flee"],
    scoringFactors: {
      description: "BehaviorScorer evaluates entity state to determine best action",
      factors: ["healthPercentage","nearbyEnemies","nearbyAllies","resourceProximity","baseDistance","threatLevel"]
    }
  };
  write('ai.json', data);
}

// ===== 9. ECS =====
function buildECS() {
  const data = {
    version: "1.0.0",
    description: "Entity Component System — component definitions, systems, entity types for MMO world",
    entityTypes: ["player","npc","item","interactable","projectile"],
    components: {
      TransformComponent: { fields: { x: "number", y: "number", rotation: "number", scale: "number" } },
      VelocityComponent: { fields: { vx: "number", vy: "number", speed: "number", maxSpeed: "number" } },
      StatsComponent: { fields: { health: "number", maxHealth: "number", mana: "number", maxMana: "number", level: "number", experience: "number", attack: "number", defense: "number" } },
      SpriteComponent: { fields: { spriteId: "string", width: "number", height: "number", frame: "number", animationState: "string" } },
      InteractableComponent: { fields: { type: "string", range: "number", cooldown: "number", lastInteraction: "number" } },
      NetworkedComponent: { fields: { ownerId: "string", lastSync: "number", dirty: "boolean" } },
      LootableComponent: { fields: { items: "string[]", gold: "number", experience: "number" } },
      AIComponent: { fields: { behavior: "idle | patrol | chase | attack | flee", targetId: "string?", patrolPath: "{ x, y }[]?", patrolIndex: "number", aggroRange: "number", attackRange: "number" } }
    },
    systems: {
      MovementSystem: { description: "Updates entity positions based on velocity, enforces max speed, updates rotation" },
      AISystem: { description: "Processes NPC behavior states — idle/patrol/chase/attack transitions based on player proximity" }
    },
    spatialHash: { cellSize: 64, description: "Spatial hash grid for efficient radius-based entity queries" }
  };
  write('ecs.json', data);
}

// ===== RUN ALL =====
console.log('\n🎮 Converting GDevelop engine data to ObjectStore JSON...\n');
const unitCount = buildFactionUnits();
buildNodeUpgrades();
buildTileMaps();
buildAnimations();
buildRendering();
buildControllers();
buildTerrain();
buildAI();
buildECS();
console.log(`\n✅ Done! Generated 9 new JSON endpoints (${unitCount} faction units total)\n`);

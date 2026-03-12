/**
 * Grudge Studio ObjectStore SDK
 * 
 * A lightweight SDK for accessing Grudge Warlords game data.
 * Works in browsers and Node.js (with fetch polyfill).
 * 
 * Usage:
 *   import { GrudgeSDK } from './grudge-sdk.js';
 *   const sdk = new GrudgeSDK();
 *   const weapons = await sdk.getWeapons();
 */

import { ObjectStoreR2Client, DEFAULT_WORKER_URL } from './r2-client.js';

const DEFAULT_BASE_URL = 'https://molochdagod.github.io/ObjectStore';

// ==========================================
// GRUDGE UUID SYSTEM
// ==========================================

const PREFIX_MAP = {
  hero: 'HERO',
  item: 'ITEM',
  equipment: 'EQIP',
  ability: 'ABIL',
  material: 'MATL',
  recipe: 'RECP',
  node: 'NODE',
  mob: 'MOBS',
  boss: 'BOSS',
  mission: 'MISS',
  infusion: 'INFU',
  loot: 'LOOT',
  consumable: 'CONS',
  quest: 'QUST',
  zone: 'ZONE',
  save: 'SAVE',
};

let _sequenceCounter = 0;

function _fnv1aHash8(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  hash = hash >>> 0;
  const h2 = (hash ^ (hash >>> 16)) >>> 0;
  return h2.toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
}

/**
 * Generate a Grudge UUID for runtime item instances.
 * Format: {PREFIX}-{TIMESTAMP}-{SEQUENCE}-{HASH}
 * Example: ITEM-20260222002830-000001-A1B2C3D4
 * 
 * @param {string} entityType - Key from PREFIX_MAP (e.g. 'item', 'material', 'hero')
 * @param {string} metadata - Optional metadata for hash uniqueness
 * @returns {string} A grudge UUID string
 */
function generateGrudgeUuid(entityType, metadata = '') {
  const prefix = PREFIX_MAP[entityType] || entityType.slice(0, 4).toUpperCase();
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');

  _sequenceCounter++;
  const sequence = _sequenceCounter.toString(16).toUpperCase().padStart(6, '0');

  const hashInput = `${prefix}-${timestamp}-${sequence}-${metadata}-${Math.random()}`;
  const hash = _fnv1aHash8(hashInput);

  return `${prefix}-${timestamp}-${sequence}-${hash}`;
}

/**
 * Parse a Grudge UUID into its components.
 * @param {string} uuid - A grudge UUID string
 * @returns {object|null} Parsed components or null if invalid
 */
function parseGrudgeUuid(uuid) {
  if (!uuid || typeof uuid !== 'string') return null;
  const parts = uuid.split('-');
  if (parts.length !== 4) return null;
  return {
    prefix: parts[0],
    timestamp: parts[1],
    sequence: parts[2],
    hash: parts[3],
    entityType: Object.entries(PREFIX_MAP).find(([, v]) => v === parts[0])?.[0] || 'unknown',
    createdAt: new Date(
      parseInt(parts[1].slice(0, 4)),
      parseInt(parts[1].slice(4, 6)) - 1,
      parseInt(parts[1].slice(6, 8)),
      parseInt(parts[1].slice(8, 10)),
      parseInt(parts[1].slice(10, 12)),
      parseInt(parts[1].slice(12, 14))
    ),
  };
}

/**
 * Validate a Grudge UUID string.
 * @param {string} uuid - A grudge UUID string
 * @returns {boolean} True if valid format
 */
function isValidGrudgeUuid(uuid) {
  if (!uuid || typeof uuid !== 'string') return false;
  const pattern = /^[A-Z]{4}-\d{14}-[0-9A-F]{6}-[0-9A-F]{8}$/;
  return pattern.test(uuid);
}

// ==========================================
// SDK CLASS
// ==========================================

class GrudgeSDK {
  /**
   * @param {string|object} opts - Base URL string (backward compat) or options object
   * @param {string} [opts.baseUrl]   - GitHub Pages base URL
   * @param {string} [opts.workerUrl] - Cloudflare Worker URL for R2 storage
   * @param {string} [opts.apiKey]    - Optional API key for authenticated Worker routes
   */
  constructor(opts = DEFAULT_BASE_URL) {
    if (typeof opts === 'string') {
      opts = { baseUrl: opts };
    }
    this.baseUrl = (opts.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes

    // R2 storage client
    this.r2 = new ObjectStoreR2Client({
      workerUrl: opts.workerUrl || DEFAULT_WORKER_URL,
      apiKey: opts.apiKey,
    });
  }

  /**
   * Fetch with caching
   */
  async fetch(endpoint) {
    const url = `${this.baseUrl}${endpoint}`;
    const cached = this.cache.get(url);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
    }
    
    const data = await response.json();
    this.cache.set(url, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }

  // ==========================================
  // WEAPONS
  // ==========================================
  
  /**
   * Get all weapons data
   */
  async getWeapons() {
    return this.fetch('/api/v1/weapons.json');
  }

  /**
   * Get weapons by category
   */
  async getWeaponsByCategory(category) {
    const data = await this.getWeapons();
    return data.categories[category] || null;
  }

  /**
   * Get a specific weapon by ID
   */
  async getWeapon(weaponId) {
    const data = await this.getWeapons();
    for (const category of Object.values(data.categories)) {
      const weapon = category.items.find(w => w.id === weaponId);
      if (weapon) return weapon;
    }
    return null;
  }

  /**
   * Get all weapon categories
   */
  async getWeaponCategories() {
    const data = await this.getWeapons();
    return Object.keys(data.categories);
  }

  // ==========================================
  // MATERIALS
  // ==========================================
  
  /**
   * Get all materials data
   */
  async getMaterials() {
    return this.fetch('/api/v1/materials.json');
  }

  /**
   * Get materials by category
   */
  async getMaterialsByCategory(category) {
    const data = await this.getMaterials();
    return data.categories[category] || null;
  }

  /**
   * Get materials by tier
   */
  async getMaterialsByTier(tier) {
    const data = await this.getMaterials();
    const results = [];
    for (const category of Object.values(data.categories)) {
      results.push(...category.items.filter(m => m.tier === tier));
    }
    return results;
  }

  /**
   * Get materials gathered by a specific profession
   */
  async getMaterialsByProfession(profession) {
    const data = await this.getMaterials();
    const results = [];
    for (const category of Object.values(data.categories)) {
      results.push(...category.items.filter(m => m.gatheredBy === profession));
    }
    return results;
  }

  // ==========================================
  // ARMOR
  // ==========================================
  
  /**
   * Get all armor data
   */
  async getArmor() {
    return this.fetch('/api/v1/armor.json');
  }

  /**
   * Get armor by material (e.g. 'cloth', 'leather', 'metal', 'gem')
   */
  async getArmorByMaterial(material) {
    const data = await this.getArmor();
    return data.materials[material] || null;
  }

  /**
   * Get armor by slot type (e.g. 'Helm', 'Chest', 'Hands', 'Feet', 'Shoulder', 'Ring', 'Necklace', 'Relic')
   */
  async getArmorBySlot(slot) {
    const data = await this.getArmor();
    const results = [];
    for (const mat of Object.values(data.materials)) {
      results.push(...mat.items.filter(i => i.type === slot));
    }
    return results.length > 0 ? results : null;
  }

  /**
   * Get armor by set name (e.g. 'Bloodfeud', 'Wraithfang', 'Oathbreaker')
   */
  async getArmorBySet(setName) {
    const data = await this.getArmor();
    const lower = setName.toLowerCase();
    const results = [];
    for (const mat of Object.values(data.materials)) {
      results.push(...mat.items.filter(i => i.id.split('-')[1] === lower));
    }
    return results.length > 0 ? results : null;
  }

  /**
   * Get a specific armor piece by ID
   */
  async getArmorItem(armorId) {
    const data = await this.getArmor();
    for (const mat of Object.values(data.materials)) {
      const item = mat.items.find(i => i.id === armorId);
      if (item) return item;
    }
    return null;
  }

  // ==========================================
  // CONSUMABLES
  // ==========================================
  
  /**
   * Get all consumables
   */
  async getConsumables() {
    return this.fetch('/api/v1/consumables.json');
  }

  /**
   * Get consumables by category (e.g. 'redFoods', 'greenFoods', 'blueFoods', 'mysticPotions', 'engineerConsumables')
   */
  async getConsumablesByCategory(category) {
    const data = await this.getConsumables();
    return data.categories[category] || null;
  }

  /**
   * Get consumables by profession (e.g. 'Chef', 'Mystic', 'Engineer')
   */
  async getConsumablesByProfession(profession) {
    const data = await this.getConsumables();
    const results = {};
    for (const [key, cat] of Object.entries(data.categories)) {
      if (cat.profession === profession) {
        results[key] = cat;
      }
    }
    return Object.keys(results).length > 0 ? results : null;
  }

  // ==========================================
  // SKILLS
  // ==========================================

  /**
   * Get all skills data
   */
  async getSkills() {
    return this.fetch('/api/v1/skills.json');
  }

  /**
   * Get skills by weapon type (e.g. 'sword', 'axe', 'bow', 'staff', 'gun')
   */
  async getSkillsByWeapon(weaponType) {
    const data = await this.getSkills();
    return data.categories[weaponType] || null;
  }

  /**
   * Get a specific skill by ID
   */
  async getSkill(skillId) {
    const data = await this.getSkills();
    for (const category of Object.values(data.categories)) {
      const skill = category.skills.find(s => s.id === skillId);
      if (skill) return skill;
    }
    return null;
  }

  // ==========================================
  // PROFESSIONS
  // ==========================================

  /**
   * Get all professions data
   */
  async getProfessions() {
    return this.fetch('/api/v1/professions.json');
  }

  /**
   * Get a specific profession by ID (e.g. 'miner', 'forester', 'mystic', 'chef', 'engineer')
   */
  async getProfession(professionId) {
    const data = await this.getProfessions();
    return data.professions[professionId] || null;
  }

  // ==========================================
  // RACES
  // ==========================================

  /**
   * Get all races data
   */
  async getRaces() {
    return this.fetch('/api/v1/races.json');
  }

  /**
   * Get a specific race by ID (e.g. 'human', 'orc', 'elf', 'undead', 'barbarian', 'dwarf')
   */
  async getRace(raceId) {
    const data = await this.getRaces();
    return data.races[raceId] || null;
  }

  /**
   * Get races by faction (e.g. 'crusade', 'legion', 'fabled')
   */
  async getRacesByFaction(factionId) {
    const data = await this.getRaces();
    return Object.values(data.races).filter(r => r.faction === factionId);
  }

  // ==========================================
  // CLASSES
  // ==========================================

  /**
   * Get all classes data
   */
  async getClasses() {
    return this.fetch('/api/v1/classes.json');
  }

  /**
   * Get a specific class by ID (e.g. 'warrior', 'mage', 'worge', 'ranger')
   */
  async getClass(classId) {
    const data = await this.getClasses();
    return data.classes[classId] || null;
  }

  // ==========================================
  // FACTIONS
  // ==========================================

  /**
   * Get all factions data
   */
  async getFactions() {
    return this.fetch('/api/v1/factions.json');
  }

  /**
   * Get a specific faction by ID (e.g. 'crusade', 'legion', 'fabled')
   */
  async getFaction(factionId) {
    const data = await this.getFactions();
    return data.factions[factionId] || null;
  }

  // ==========================================
  // ATTRIBUTES
  // ==========================================

  /**
   * Get all attributes data
   */
  async getAttributes() {
    return this.fetch('/api/v1/attributes.json');
  }

  /**
   * Get a specific attribute by ID (e.g. 'strength', 'intellect', 'vitality')
   */
  async getAttribute(attributeId) {
    const data = await this.getAttributes();
    return data.attributes.find(a => a.id === attributeId) || null;
  }

  // ==========================================
  // WEAPON SKILLS
  // ==========================================

  /** Get all weapon skills (473 skills across 24 types) */
  async getWeaponSkills() {
    return this.fetch('/api/v1/weaponSkills.json');
  }

  /** Get weapon skills by weapon type (e.g. 'Sword', 'Bow', 'Fire Staff') */
  async getWeaponSkillsByType(weaponType) {
    const data = await this.getWeaponSkills();
    return (data.weaponTypes || []).find(wt => wt.weaponType === weaponType) || null;
  }

  /** Get a specific weapon skill by ID */
  async getWeaponSkill(skillId) {
    const data = await this.getWeaponSkills();
    for (const wt of data.weaponTypes || []) {
      const skill = (wt.skills || []).find(s => s.id === skillId);
      if (skill) return { ...skill, weaponType: wt.weaponType };
    }
    return null;
  }

  // ==========================================
  // ENEMIES & BOSSES
  // ==========================================

  /** Get all enemies (38 across 8 tiers) */
  async getEnemies() {
    return this.fetch('/api/v1/enemies.json');
  }

  /** Get a specific enemy by ID */
  async getEnemy(enemyId) {
    const data = await this.getEnemies();
    return (data.enemies || []).find(e => e.id === enemyId) || null;
  }

  /** Get enemies by tier */
  async getEnemiesByTier(tier) {
    const data = await this.getEnemies();
    return (data.enemies || []).filter(e => e.tier === tier);
  }

  /** Get all bosses (12 with multi-phase mechanics) */
  async getBosses() {
    return this.fetch('/api/v1/bosses.json');
  }

  /** Get a specific boss by ID */
  async getBoss(bossId) {
    const data = await this.getBosses();
    return (data.bosses || []).find(b => b.id === bossId) || null;
  }

  // ==========================================
  // 2D SPRITES
  // ==========================================

  /** Get all 2D sprites (5,485 across 13 categories) */
  async getSprites2d() {
    return this.fetch('/api/v1/sprites2d.json');
  }

  /** Get sprites by category (e.g. 'characters', 'enemies', 'icons', 'backgrounds') */
  async getSpritesByCategory(category) {
    const data = await this.getSprites2d();
    return data.categories?.[category] || null;
  }

  /** Search sprites by name */
  async searchSprites(query) {
    const data = await this.getSprites2d();
    const lower = query.toLowerCase();
    const results = [];
    for (const [cat, catData] of Object.entries(data.categories || {})) {
      for (const item of catData.items || []) {
        if (item.name?.toLowerCase().includes(lower) || item.path?.toLowerCase().includes(lower)) {
          results.push({ ...item, category: cat });
        }
      }
    }
    return results;
  }

  // ==========================================
  // VFX & EFFECTS
  // ==========================================

  /** Get all VFX effect sprites (147 sprite sheets) */
  async getEffectSprites() {
    return this.fetch('/api/v1/effectSprites.json');
  }

  /** Get all battle ability effects (209 abilities) */
  async getAbilityEffects() {
    return this.fetch('/api/v1/abilityEffects.json');
  }

  // ==========================================
  // FACTION UNITS (RTS)
  // ==========================================

  /** Get all RTS faction units (19 units across 3 factions) */
  async getFactionUnits() {
    return this.fetch('/api/v1/factionUnits.json');
  }

  // ==========================================
  // SERVERLESS API (Vercel only)
  // ==========================================

  /**
   * Search across all game data via serverless API.
   * Only available when deployed on Vercel.
   * @param {string} query - Search query
   * @param {string} type - Filter by type: weapons, armor, materials, etc. Default: 'all'
   * @param {number} limit - Max results (1-200). Default: 50
   */
  async serverlessSearch(query, type = 'all', limit = 50) {
    const params = new URLSearchParams({ q: query, type, limit: String(limit) });
    return this.fetch(`/api/search?${params}`);
  }

  /** Get aggregate stats from serverless API (Vercel only) */
  async getServerlessStats() {
    return this.fetch('/api/stats');
  }

  // ==========================================
  // ICONS
  // ==========================================
  
  /**
   * Get icon manifest
   */
  async getIcons() {
    return this.fetch('/api/v1/icons.json');
  }

  /**
   * Get icon URL for a weapon
   */
  getWeaponIconUrl(category, index, tier = 1) {
    const iconConfigs = {
      swords: { base: 'Sword', max: 40 },
      axes1h: { base: 'Axe', max: 30 },
      daggers: { base: 'Dagger', max: 30 },
      bows: { base: 'Bow', max: 30 },
      crossbows: { base: 'Crossbow', max: 30 },
      hammers1h: { base: 'Hammer', max: 25 },
      spears: { base: 'Spear', max: 30 },
      fireStaves: { base: 'staff', max: 60, lowercase: true },
      frostStaves: { base: 'staff', max: 60, lowercase: true, offset: 10 },
      holyStaves: { base: 'staff', max: 60, lowercase: true, offset: 20 },
    };

    const config = iconConfigs[category];
    if (!config) return null;

    const offset = config.offset || 0;
    const idx = ((index + offset + (tier - 1) * 3) % config.max) + 1;
    const suffix = config.lowercase ? `${idx}.png` : `${String(idx).padStart(2, '0')}.png`;
    
    return `${this.baseUrl}/icons/weapons/${config.base}_${suffix}`;
  }

  /**
   * Get icon URL for armor
   */
  getArmorIconUrl(slot, tier = 1) {
    const slotBases = {
      helm: 'Helm', chest: 'Chest', boots: 'Boots', gloves: 'Gloves',
      pants: 'Pants', belt: 'Belt', shoulder: 'Shoulder', bracer: 'Bracer',
      ring: 'Ring', necklace: 'necklace', back: 'Back'
    };
    
    const base = slotBases[slot];
    if (!base) return null;
    
    const idx = String(tier * 5).padStart(2, '0');
    return `${this.baseUrl}/icons/armor/${base}_${idx}.png`;
  }

  /**
   * Get icon URL for a material
   */
  getMaterialIconUrl(category, tier = 1) {
    const base = ['essence', 'gem', 'infusion'].includes(category) ? 'Loot' : 'Res';
    const idx = String(tier * 5).padStart(2, '0');
    return `${this.baseUrl}/icons/resources/${base}_${idx}.png`;
  }

  // ==========================================
  // SEARCH
  // ==========================================
  
  /**
   * Search across all game data
   */
  async search(query) {
    const lower = query.toLowerCase();
    const results = { weapons: [], armor: [], materials: [], consumables: [], skills: [], races: [], classes: [] };

    const [weapons, armor, materials, consumables, skills, races, classes] = await Promise.all([
      this.getWeapons(),
      this.getArmor(),
      this.getMaterials(),
      this.getConsumables(),
      this.getSkills(),
      this.getRaces(),
      this.getClasses(),
    ]);

    // Search weapons
    for (const [cat, data] of Object.entries(weapons.categories)) {
      results.weapons.push(...data.items.filter(w => 
        w.name.toLowerCase().includes(lower) || w.id.includes(lower)
      ).map(w => ({ ...w, category: cat })));
    }

    // Search armor
    for (const [mat, data] of Object.entries(armor.materials)) {
      results.armor.push(...data.items.filter(a =>
        a.name.toLowerCase().includes(lower) || a.id.includes(lower)
      ).map(a => ({ ...a, materialCategory: mat })));
    }

    // Search materials
    for (const [cat, data] of Object.entries(materials.categories)) {
      results.materials.push(...data.items.filter(m => 
        m.name.toLowerCase().includes(lower) || m.id.includes(lower)
      ).map(m => ({ ...m, category: cat })));
    }

    // Search consumables
    for (const [cat, data] of Object.entries(consumables.categories)) {
      results.consumables.push(...data.items.filter(c =>
        c.name.toLowerCase().includes(lower)
      ).map(c => ({ ...c, category: cat })));
    }

    // Search skills
    for (const [cat, data] of Object.entries(skills.categories)) {
      results.skills.push(...data.skills.filter(s =>
        s.name.toLowerCase().includes(lower) || s.id.includes(lower)
      ).map(s => ({ ...s, weaponType: cat })));
    }

    // Search races
    results.races.push(...Object.values(races.races).filter(r =>
      r.name.toLowerCase().includes(lower) || r.id.includes(lower) || r.trait.toLowerCase().includes(lower)
    ));

    // Search classes
    results.classes.push(...Object.values(classes.classes).filter(c =>
      c.name.toLowerCase().includes(lower) || c.id.includes(lower)
    ));

    return results;
  }

  // ==========================================
  // QUESTS & MISSIONS (v3.0.0)
  // ==========================================

  async getQuests() { return this.fetch('/api/v1/quests.json'); }
  async getQuestsForZone(zoneId) { const d = await this.getQuests(); return d.zoneQuests[zoneId] || []; }
  async getMissions() { return this.fetch('/api/v1/missions.json'); }
  async getDialogue() { return this.fetch('/api/v1/dialogue.json'); }
  async getCutscenes() { return this.fetch('/api/v1/cutscenes.json'); }
  async getRandomEvents() { return this.fetch('/api/v1/randomEvents.json'); }

  // ==========================================
  // WORLD & COMBAT DATA (v3.0.0)
  // ==========================================

  async getWorldMap() { return this.fetch('/api/v1/worldMap.json'); }
  async getRegions() { return this.fetch('/api/v1/regions.json'); }
  async getBattleFormations() { return this.fetch('/api/v1/battleFormations.json'); }
  async getEquipment() { return this.fetch('/api/v1/equipment.json'); }
  async getSkillTrees() { return this.fetch('/api/v1/skillTrees.json'); }
  async getEnemyTemplates() { return this.fetch('/api/v1/enemyTemplates.json'); }
  async getLore() { return this.fetch('/api/v1/lore.json'); }

  // ==========================================
  // MEDIA ASSETS (v3.0.0)
  // ==========================================

  async getAudioRegistry() { return this.fetch('/api/v1/audio.json'); }
  async getVideoRegistry() { return this.fetch('/api/v1/video.json'); }
  async getHeroesRegistry() { return this.fetch('/api/v1/heroes.json'); }
  async getModels3d() { return this.fetch('/api/v1/models3d.json'); }

  // ==========================================
  // SPRITES & CHARACTERS (v4)
  // ==========================================

  /**
   * Get all sprites (flat list from sprites2d.json)
   */
  async getSprites() {
    return this.fetch('/api/v1/sprites2d.json');
  }

  /**
   * Get a single sprite by UUID
   * @param {string} uuid - e.g. 'SPRT-884C9D8D-252F0E'
   */
  async getSprite(uuid) {
    const data = await this.getSprites();
    for (const cat of Object.values(data.categories)) {
      const spr = cat.items.find(s => s.uuid === uuid);
      if (spr) return spr;
    }
    return null;
  }

  /**
   * Search sprites by name, category, or UUID substring
   * @param {string} query
   * @param {object} opts - { category, limit }
   */
  async searchSprites(query, opts = {}) {
    const q = (query || '').toLowerCase();
    const data = await this.getSprites();
    let results = [];
    for (const cat of Object.values(data.categories)) {
      results.push(...cat.items);
    }
    if (opts.category) results = results.filter(s => s.category === opts.category);
    if (q) results = results.filter(s =>
      s.name.toLowerCase().includes(q) || s.category.includes(q) ||
      (s.uuid || '').toLowerCase().includes(q) || (s.subcategory || '').includes(q)
    );
    return results.slice(0, opts.limit || 50);
  }

  /**
   * Get all animated characters (from sprite-characters.json)
   * @param {object} opts - { category }
   */
  async getCharacters(opts = {}) {
    const data = await this.fetch('/api/v1/sprite-characters.json');
    let chars = data.characters || [];
    if (opts.category) chars = chars.filter(c => c.category === opts.category);
    return chars;
  }

  /**
   * Get a single character by UUID
   * @param {string} uuid
   */
  async getCharacter(uuid) {
    const data = await this.fetch('/api/v1/sprite-characters.json');
    return (data.characters || []).find(c => c.uuid === uuid) || null;
  }

  /**
   * Build the full URL for a character's animation spritesheet
   * @param {string} charUuid - Character UUID
   * @param {string} animName - Animation name (e.g. 'idle', 'attack1')
   * @returns {Promise<string|null>} Full URL or null
   */
  async getAnimationUrl(charUuid, animName) {
    const ch = await this.getCharacter(charUuid);
    if (!ch) return null;
    const anim = ch.animations.find(a => a.name === animName || a.id === animName);
    if (!anim) return null;
    return `${this.baseUrl}${anim.path}`;
  }

  /**
   * Get studio manifest
   */
  async getStudioManifest() {
    return this.fetch('/api/v1/studio.json');
  }

  // ==========================================
  // R2 STORAGE CONVENIENCE METHODS
  // ==========================================

  /**
   * Upload a 3D model to R2 storage via Worker
   * @param {File|Blob} file
   * @param {object} meta - { name, category, tags[], description }
   * @returns {Promise<object>}
   */
  async upload3DModel(file, meta = {}) {
    return this.r2.upload3DModel(file, meta);
  }

  /**
   * Get a direct file URL for a 3D model stored in R2
   * @param {string} key - Asset key in R2
   * @returns {string}
   */
  getModelFileUrl(key) {
    return this.r2.getModelFileUrl(key);
  }

  /**
   * List 3D models stored in R2
   * @param {object} [query]
   * @returns {Promise<object>}
   */
  async list3DModels(query = {}) {
    return this.r2.list3DModels(query);
  }

  /**
   * Upload any asset to R2 storage
   * @param {File|Blob} file
   * @param {object} meta
   * @returns {Promise<object>}
   */
  async uploadAsset(file, meta = {}) {
    return this.r2.uploadAsset(file, meta);
  }

  // ==========================================
  // GRUDGE UUID UTILITIES
  // ==========================================

  /**
   * Generate a runtime Grudge UUID for an item instance.
   * Use this when a player obtains/crafts an item from a template definition.
   * 
   * @param {string} entityType - Key from PREFIX_MAP (e.g. 'item', 'material')
   * @param {string} metadata - Optional metadata string for hash uniqueness
   * @returns {string} A grudge UUID string
   */
  static generateGrudgeUuid(entityType, metadata) {
    return generateGrudgeUuid(entityType, metadata);
  }

  /**
   * Parse a Grudge UUID into its components.
   */
  static parseGrudgeUuid(uuid) {
    return parseGrudgeUuid(uuid);
  }

  /**
   * Validate a Grudge UUID string.
   */
  static isValidGrudgeUuid(uuid) {
    return isValidGrudgeUuid(uuid);
  }

  /**
   * Get the PREFIX_MAP for entity type lookups.
   */
  static get PREFIX_MAP() {
    return { ...PREFIX_MAP };
  }

  // ==========================================
  // DATABASE INFO
  // ==========================================
  
  /**
   * Get database connection info (for AI agents)
   */
  getDatabaseInfo() {
    return {
      provider: 'Supabase',
      type: 'PostgreSQL',
      schemas: {
        studio_core: ['accounts', 'sessions', 'api_keys'],
        warlord_crafting: ['characters', 'inventory_items', 'crafted_items', 'islands', 'battle_history'],
      },
      publicEndpoints: {
        weapons: `${this.baseUrl}/api/v1/weapons.json`,
        armor: `${this.baseUrl}/api/v1/armor.json`,
        materials: `${this.baseUrl}/api/v1/materials.json`,
        consumables: `${this.baseUrl}/api/v1/consumables.json`,
        skills: `${this.baseUrl}/api/v1/skills.json`,
        weaponSkills: `${this.baseUrl}/api/v1/weaponSkills.json`,
        professions: `${this.baseUrl}/api/v1/professions.json`,
        races: `${this.baseUrl}/api/v1/races.json`,
        classes: `${this.baseUrl}/api/v1/classes.json`,
        factions: `${this.baseUrl}/api/v1/factions.json`,
        attributes: `${this.baseUrl}/api/v1/attributes.json`,
        enemies: `${this.baseUrl}/api/v1/enemies.json`,
        bosses: `${this.baseUrl}/api/v1/bosses.json`,
        sprites2d: `${this.baseUrl}/api/v1/sprites2d.json`,
        effectSprites: `${this.baseUrl}/api/v1/effectSprites.json`,
        abilityEffects: `${this.baseUrl}/api/v1/abilityEffects.json`,
        factionUnits: `${this.baseUrl}/api/v1/factionUnits.json`,
        // v3.0.0 endpoints
        quests: `${this.baseUrl}/api/v1/quests.json`,
        dialogue: `${this.baseUrl}/api/v1/dialogue.json`,
        missions: `${this.baseUrl}/api/v1/missions.json`,
        skillTrees: `${this.baseUrl}/api/v1/skillTrees.json`,
        equipment: `${this.baseUrl}/api/v1/equipment.json`,
        cutscenes: `${this.baseUrl}/api/v1/cutscenes.json`,
        worldMap: `${this.baseUrl}/api/v1/worldMap.json`,
        randomEvents: `${this.baseUrl}/api/v1/randomEvents.json`,
        battleFormations: `${this.baseUrl}/api/v1/battleFormations.json`,
        regions: `${this.baseUrl}/api/v1/regions.json`,
        lore: `${this.baseUrl}/api/v1/lore.json`,
        enemyTemplates: `${this.baseUrl}/api/v1/enemyTemplates.json`,
        audio: `${this.baseUrl}/api/v1/audio.json`,
        video: `${this.baseUrl}/api/v1/video.json`,
        heroes: `${this.baseUrl}/api/v1/heroes.json`,
        models3d: `${this.baseUrl}/api/v1/models3d.json`,
      },
      serverlessEndpoints: {
        search: `${this.baseUrl}/api/search`,
        stats: `${this.baseUrl}/api/stats`,
        export: `${this.baseUrl}/api/export`,
      },
      browsers: {
        itemDatabase: `${this.baseUrl}/GRUDGE_Item_Database.html`,
        spriteDatabase: `${this.baseUrl}/SPRITE_DATABASE.html`,
        vfxBrowser: `${this.baseUrl}/VFX_BROWSER.html`,
        models2d: `${this.baseUrl}/2D_MODELS.html`,
        itemBrowser: `${this.baseUrl}/ItemBrowser.html`,
        admin: `${this.baseUrl}/admin.html`,
      },
      spriteApi: {
        sprites: `${this.baseUrl}/api/v1/sprites2d.json`,
        characters: `${this.baseUrl}/api/v1/sprite-characters.json`,
        listSprites: `${this.baseUrl}/api/v1/sprites`,
        searchSprites: `${this.baseUrl}/api/v1/sprites/search`,
        listCharacters: `${this.baseUrl}/api/v1/characters`,
        stats: `${this.baseUrl}/api/v1/stats`,
        studio: `${this.baseUrl}/api/v1/studio.json`,
      },
      storage: {
        upload: `${this.baseUrl}/api/storage/upload`,
        uploadMulti: `${this.baseUrl}/api/storage/upload-multi`,
        uploadZip: `${this.baseUrl}/api/storage/upload-zip`,
        list: `${this.baseUrl}/api/storage/list`,
      },
      r2Worker: {
        base: this.r2.workerUrl,
        assets: `${this.r2.workerUrl}/v1/assets`,
        health: `${this.r2.workerUrl}/v1/health`,
        models: `${this.r2.workerUrl}/v1/assets?prefix=models/`,
      },
      docs: `${this.baseUrl}/docs/`,
    };
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GrudgeSDK, ObjectStoreR2Client, generateGrudgeUuid, parseGrudgeUuid, isValidGrudgeUuid, PREFIX_MAP };
} else if (typeof window !== 'undefined') {
  window.GrudgeSDK = GrudgeSDK;
  window.ObjectStoreR2Client = ObjectStoreR2Client;
  window.generateGrudgeUuid = generateGrudgeUuid;
  window.parseGrudgeUuid = parseGrudgeUuid;
  window.isValidGrudgeUuid = isValidGrudgeUuid;
  window.PREFIX_MAP = PREFIX_MAP;
}

export { GrudgeSDK, ObjectStoreR2Client, generateGrudgeUuid, parseGrudgeUuid, isValidGrudgeUuid, PREFIX_MAP };

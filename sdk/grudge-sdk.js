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
  constructor(baseUrl = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
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
   * Get armor by slot
   */
  async getArmorBySlot(slot) {
    const data = await this.getArmor();
    return data.slots[slot] || null;
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
    const results = { weapons: [], materials: [], consumables: [], skills: [], races: [], classes: [] };

    const [weapons, materials, consumables, skills, races, classes] = await Promise.all([
      this.getWeapons(),
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
        materials: `${this.baseUrl}/api/v1/materials.json`,
        armor: `${this.baseUrl}/api/v1/armor.json`,
        consumables: `${this.baseUrl}/api/v1/consumables.json`,
        skills: `${this.baseUrl}/api/v1/skills.json`,
        professions: `${this.baseUrl}/api/v1/professions.json`,
        races: `${this.baseUrl}/api/v1/races.json`,
        classes: `${this.baseUrl}/api/v1/classes.json`,
        factions: `${this.baseUrl}/api/v1/factions.json`,
        attributes: `${this.baseUrl}/api/v1/attributes.json`,
      },
      docs: `${this.baseUrl}/docs/`,
    };
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GrudgeSDK, generateGrudgeUuid, parseGrudgeUuid, isValidGrudgeUuid, PREFIX_MAP };
} else if (typeof window !== 'undefined') {
  window.GrudgeSDK = GrudgeSDK;
  window.generateGrudgeUuid = generateGrudgeUuid;
  window.parseGrudgeUuid = parseGrudgeUuid;
  window.isValidGrudgeUuid = isValidGrudgeUuid;
  window.PREFIX_MAP = PREFIX_MAP;
}

export { GrudgeSDK, generateGrudgeUuid, parseGrudgeUuid, isValidGrudgeUuid, PREFIX_MAP };

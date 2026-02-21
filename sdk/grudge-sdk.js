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

const DEFAULT_BASE_URL = 'https://grudge-studio.github.io/ObjectStore';

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
  // ENEMIES
  // ==========================================

  /**
   * Get all enemies data
   */
  async getEnemies() {
    return this.fetch('/api/v1/enemies.json');
  }

  /**
   * Get enemies by category
   */
  async getEnemiesByCategory(category) {
    const data = await this.getEnemies();
    return data.categories[category] || null;
  }

  /**
   * Get enemies by tier
   */
  async getEnemiesByTier(tier) {
    const data = await this.getEnemies();
    const results = [];
    for (const category of Object.values(data.categories)) {
      results.push(...category.items.filter(e => e.tier === tier));
    }
    return results;
  }

  /**
   * Get enemies by zone
   */
  async getEnemiesByZone(zone) {
    const data = await this.getEnemies();
    const results = [];
    for (const category of Object.values(data.categories)) {
      results.push(...category.items.filter(e => e.zone === zone));
    }
    return results;
  }

  /**
   * Get a specific enemy by ID
   */
  async getEnemy(enemyId) {
    const data = await this.getEnemies();
    for (const category of Object.values(data.categories)) {
      const enemy = category.items.find(e => e.id === enemyId);
      if (enemy) return enemy;
    }
    return null;
  }

  // ==========================================
  // BOSSES
  // ==========================================

  /**
   * Get all bosses data
   */
  async getBosses() {
    return this.fetch('/api/v1/bosses.json');
  }

  /**
   * Get bosses by tier
   */
  async getBossesByTier(tier) {
    const data = await this.getBosses();
    return data.bosses.filter(b => b.tier === tier);
  }

  /**
   * Get bosses by zone
   */
  async getBossesByZone(zone) {
    const data = await this.getBosses();
    return data.bosses.filter(b => b.zone === zone);
  }

  /**
   * Get a specific boss by ID
   */
  async getBoss(bossId) {
    const data = await this.getBosses();
    return data.bosses.find(b => b.id === bossId) || null;
  }

  // ==========================================
  // SKILLS (Expanded)
  // ==========================================

  /**
   * Get all skills data
   */
  async getSkills() {
    return this.fetch('/api/v1/skills.json');
  }

  /**
   * Get skills by weapon/class type
   */
  async getSkillsByType(type) {
    const data = await this.getSkills();
    return data.categories[type] || null;
  }

  /**
   * Get class-specific skills (warrior, ranger, mage, worge)
   */
  async getClassSkills(className) {
    const data = await this.getSkills();
    return data.categories[className.toLowerCase()] || null;
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
  // SPRITES
  // ==========================================

  /**
   * Get all sprites data
   */
  async getSprites() {
    return this.fetch('/api/v1/sprites.json');
  }

  /**
   * Get sprites by category
   */
  async getSpritesByCategory(category) {
    const data = await this.getSprites();
    return data.categories[category] || null;
  }

  // ==========================================
  // SEARCH
  // ==========================================
  
  /**
   * Search across all game data
   */
  async search(query) {
    const lower = query.toLowerCase();
    const results = { weapons: [], materials: [], armor: [], consumables: [], enemies: [], bosses: [], skills: [] };

    const [weapons, materials, enemies, bosses, skills] = await Promise.all([
      this.getWeapons(),
      this.getMaterials(),
      this.getEnemies(),
      this.getBosses(),
      this.getSkills(),
    ]);

    for (const [cat, data] of Object.entries(weapons.categories)) {
      results.weapons.push(...data.items.filter(w => 
        w.name.toLowerCase().includes(lower) || w.id.includes(lower)
      ).map(w => ({ ...w, category: cat })));
    }

    for (const [cat, data] of Object.entries(materials.categories)) {
      results.materials.push(...data.items.filter(m => 
        m.name.toLowerCase().includes(lower) || m.id.includes(lower)
      ).map(m => ({ ...m, category: cat })));
    }

    for (const [cat, data] of Object.entries(enemies.categories)) {
      results.enemies.push(...data.items.filter(e => 
        e.name.toLowerCase().includes(lower) || e.id.includes(lower)
      ).map(e => ({ ...e, category: cat })));
    }

    results.bosses.push(...bosses.bosses.filter(b => 
      b.name.toLowerCase().includes(lower) || b.id.includes(lower)
    ));

    for (const [cat, data] of Object.entries(skills.categories)) {
      results.skills.push(...data.skills.filter(s => 
        s.name.toLowerCase().includes(lower) || s.id.includes(lower)
      ).map(s => ({ ...s, category: cat })));
    }

    return results;
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
        enemies: `${this.baseUrl}/api/v1/enemies.json`,
        bosses: `${this.baseUrl}/api/v1/bosses.json`,
        sprites: `${this.baseUrl}/api/v1/sprites.json`,
      },
      docs: `${this.baseUrl}/docs/`,
    };
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GrudgeSDK };
} else if (typeof window !== 'undefined') {
  window.GrudgeSDK = GrudgeSDK;
}

export { GrudgeSDK };

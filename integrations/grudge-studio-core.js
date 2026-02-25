/**
 * Grudge Studio Core Integration Package
 * 
 * Unified integration layer for all Grudge Studio projects
 * Connects ObjectStore, Arsenal, Puter, and all game clients
 * 
 * @package @grudge-studio/core
 * @version 2.1.0
 */

// Re-export all core systems
export { GrudgeSDK, generateGrudgeUuid, parseGrudgeUuid, isValidGrudgeUuid } from '../sdk/grudge-sdk.js';
export { itemRegistry, ItemRegistry } from '../utils/item-registry.js';
export { imageGenerator, GrudgeImageGenerator } from '../utils/image-generator.js';
export { aiBackend, AIBackendClient } from './grudge-ai-backend.js';

/**
 * Grudge Studio Unified API Client
 * Single interface for all Grudge Studio services
 */
export class GrudgeStudioAPI {
  constructor(config = {}) {
    this.config = {
      objectStoreUrl: config.objectStoreUrl || 'https://molochdagod.github.io/ObjectStore',
      arsenalUrl: config.arsenalUrl || 'https://warlord-crafting-suite.vercel.app',
      aiBackendUrl: config.aiBackendUrl || 'http://localhost:3000/api/ai',
      gameApiUrl: config.gameApiUrl || 'http://localhost:4000/api/gruda',
      puterEnabled: config.puterEnabled !== false,
      cacheEnabled: config.cacheEnabled !== false,
      debug: config.debug || false,
      environment: config.environment || 'production'
    };

    // Initialize sub-clients
    this.objectStore = new ObjectStoreClient(this.config);
    this.arsenal = new ArsenalClient(this.config);
    this.puter = new PuterClient(this.config);
    this.ai = null; // Lazy initialization
    this.uuid = new UUIDManager(this.config);
    
    if (this.config.debug) {
      console.log('🎮 Grudge Studio API initialized', this.config);
    }
  }

  /**
   * Initialize all services
   */
  async initialize() {
    const startTime = Date.now();
    
    try {
      // Load core data
      await Promise.all([
        this.objectStore.loadWeapons(),
        this.objectStore.loadMaterials(),
        this.objectStore.loadArmor(),
        this.objectStore.loadConsumables()
      ]);

      // Initialize Puter if enabled
      if (this.config.puterEnabled) {
        await this.puter.initialize();
      }

      // Initialize AI Backend
      const { AIBackendClient } = await import('./grudge-ai-backend.js');
      this.ai = new AIBackendClient(this.config);
      await this.ai.initialize();

      const duration = Date.now() - startTime;
      
      if (this.config.debug) {
        console.log(`✅ Grudge Studio initialized in ${duration}ms`);
      }

      return { success: true, duration };
    } catch (error) {
      console.error('❌ Failed to initialize Grudge Studio:', error);
      return { success: false, error };
    }
  }

  /**
   * Get unified item by UUID or ID
   */
  async getItem(identifier) {
    // Try UUID first
    if (this.uuid.isValid(identifier)) {
      const parsed = this.uuid.parse(identifier);
      return await this._getItemByType(parsed.entityType, identifier);
    }

    // Try direct ID lookup
    return await this.objectStore.findItem(identifier);
  }

  async _getItemByType(type, uuid) {
    switch (type) {
      case 'item':
      case 'equipment':
        return await this.objectStore.findItem(uuid);
      case 'material':
        return await this.objectStore.findMaterial(uuid);
      case 'hero':
        return await this.arsenal.getHero(uuid);
      default:
        throw new Error(`Unknown entity type: ${type}`);
    }
  }

  /**
   * Search across all systems
   */
  async search(query, options = {}) {
    const results = {
      objectStore: [],
      arsenal: [],
      total: 0
    };

    // Search ObjectStore
    if (!options.source || options.source === 'objectStore') {
      results.objectStore = await this.objectStore.search(query, options);
    }

    // Search Arsenal
    if (!options.source || options.source === 'arsenal') {
      try {
        results.arsenal = await this.arsenal.search(query, options);
      } catch (e) {
        console.warn('Arsenal search failed:', e);
      }
    }

    results.total = results.objectStore.length + results.arsenal.length;
    return results;
  }

  /**
   * Create new game item with UUID
   */
  createItem(data) {
    const uuid = this.uuid.generate(data.type || 'item', data.name);
    
    return {
      uuid,
      ...data,
      createdAt: new Date().toISOString(),
      source: 'grudge-studio'
    };
  }

  /**
   * Get stats and health check
   */
  async getStatus() {
    return {
      objectStore: await this.objectStore.getStatus(),
      arsenal: await this.arsenal.getStatus(),
      puter: this.puter.getStatus(),
      ai: this.ai ? this.ai.getStatus() : { available: false },
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * ObjectStore API Client
 */
class ObjectStoreClient {
  constructor(config) {
    this.baseUrl = `${config.objectStoreUrl}/api/v1`;
    this.cache = new Map();
    this.cacheEnabled = config.cacheEnabled;
  }

  async loadWeapons() {
    return await this._fetch('weapons.json', 'weapons');
  }

  async loadMaterials() {
    return await this._fetch('materials.json', 'materials');
  }

  async loadArmor() {
    return await this._fetch('armor.json', 'armor');
  }

  async loadConsumables() {
    return await this._fetch('consumables.json', 'consumables');
  }

  async loadSprites() {
    return await this._fetch('sprites.json', 'sprites');
  }

  async findItem(id) {
    const weapons = await this.loadWeapons();
    
    for (const [category, data] of Object.entries(weapons.categories)) {
      if (data.items) {
        const item = data.items.find(i => i.id === id);
        if (item) return { ...item, category, type: 'weapon' };
      }
    }

    return null;
  }

  async findMaterial(id) {
    const materials = await this.loadMaterials();
    
    for (const [category, data] of Object.entries(materials.categories)) {
      if (data.items) {
        const item = data.items.find(i => i.id === id);
        if (item) return { ...item, category, type: 'material' };
      }
    }

    return null;
  }

  async search(query, options = {}) {
    query = query.toLowerCase();
    const results = [];

    const weapons = await this.loadWeapons();
    const materials = await this.loadMaterials();

    // Search weapons
    for (const [category, data] of Object.entries(weapons.categories)) {
      if (data.items) {
        for (const item of data.items) {
          if (this._matches(item, query, options)) {
            results.push({ ...item, category, type: 'weapon' });
          }
        }
      }
    }

    // Search materials
    for (const [category, data] of Object.entries(materials.categories)) {
      if (data.items) {
        for (const item of data.items) {
          if (this._matches(item, query, options)) {
            results.push({ ...item, category, type: 'material' });
          }
        }
      }
    }

    return results;
  }

  _matches(item, query, options) {
    const name = (item.name || '').toLowerCase();
    const id = (item.id || '').toLowerCase();
    
    if (!name.includes(query) && !id.includes(query)) {
      return false;
    }

    if (options.tier && item.tier !== options.tier) {
      return false;
    }

    if (options.type && item.type !== options.type) {
      return false;
    }

    return true;
  }

  async _fetch(endpoint, cacheKey) {
    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const url = `${this.baseUrl}/${endpoint}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
    }

    const data = await response.json();
    
    if (this.cacheEnabled) {
      this.cache.set(cacheKey, data);
    }

    return data;
  }

  async getStatus() {
    try {
      await this._fetch('weapons.json', 'status-check');
      return { available: true, url: this.baseUrl };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }
}

/**
 * Arsenal/Warlord-Crafting-Suite Client
 */
class ArsenalClient {
  constructor(config) {
    this.baseUrl = config.arsenalUrl;
    this.cache = new Map();
  }

  async getHero(uuid) {
    // Arsenal integration - fetch hero data
    try {
      const response = await fetch(`${this.baseUrl}/api/heroes/${uuid}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Arsenal hero fetch failed:', e);
    }
    return null;
  }

  async search(query, options = {}) {
    // Arsenal search integration
    try {
      const params = new URLSearchParams({ q: query, ...options });
      const response = await fetch(`${this.baseUrl}/api/search?${params}`);
      
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Arsenal search failed:', e);
    }
    
    return [];
  }

  async getStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/api/status`);
      return { available: response.ok, url: this.baseUrl };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }
}

/**
 * Puter.js Integration Client
 */
class PuterClient {
  constructor(config) {
    this.enabled = config.puterEnabled;
    this.initialized = false;
  }

  async initialize() {
    if (!this.enabled) return;

    try {
      if (typeof puter !== 'undefined') {
        this.puter = puter;
        this.initialized = true;
      } else {
        console.warn('Puter.js not loaded');
      }
    } catch (e) {
      console.warn('Failed to initialize Puter:', e);
    }
  }

  async generateImage(prompt, options = {}) {
    if (!this.initialized) {
      throw new Error('Puter not initialized');
    }

    return await this.puter.ai.txt2img(prompt, {
      width: options.width || 256,
      height: options.height || 256,
      format: options.format || 'png'
    });
  }

  async storeFile(path, data) {
    if (!this.initialized) {
      throw new Error('Puter not initialized');
    }

    return await this.puter.fs.write(path, data);
  }

  getStatus() {
    return {
      available: this.initialized,
      enabled: this.enabled
    };
  }
}

/**
 * UUID Manager - Uses Arsenal UUID System
 */
class UUIDManager {
  constructor(config) {
    this.config = config;
    this.sequenceCounter = 0;
    
    this.prefixMap = {
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
      save: 'SAVE'
    };
  }

  generate(entityType, metadata = '') {
    const prefix = this.prefixMap[entityType] || entityType.slice(0, 4).toUpperCase();
    const now = new Date();
    
    const timestamp = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');

    this.sequenceCounter++;
    const sequence = this.sequenceCounter.toString(16).toUpperCase().padStart(6, '0');

    const hashInput = `${prefix}-${timestamp}-${sequence}-${metadata}-${Math.random()}`;
    const hash = this._fnv1aHash8(hashInput);

    return `${prefix}-${timestamp}-${sequence}-${hash}`;
  }

  parse(uuid) {
    if (!uuid || typeof uuid !== 'string') return null;
    
    const parts = uuid.split('-');
    if (parts.length !== 4) return null;
    
    return {
      prefix: parts[0],
      timestamp: parts[1],
      sequence: parts[2],
      hash: parts[3],
      entityType: Object.entries(this.prefixMap).find(([, v]) => v === parts[0])?.[0] || 'unknown',
      createdAt: this._parseTimestamp(parts[1])
    };
  }

  isValid(uuid) {
    if (!uuid || typeof uuid !== 'string') return false;
    const pattern = /^[A-Z]{4}-\d{14}-[0-9A-F]{6}-[0-9A-F]{8}$/;
    return pattern.test(uuid);
  }

  _fnv1aHash8(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    hash = hash >>> 0;
    const h2 = (hash ^ (hash >>> 16)) >>> 0;
    return h2.toString(16).toUpperCase().padStart(8, '0').slice(0, 8);
  }

  _parseTimestamp(ts) {
    return new Date(
      parseInt(ts.slice(0, 4)),
      parseInt(ts.slice(4, 6)) - 1,
      parseInt(ts.slice(6, 8)),
      parseInt(ts.slice(8, 10)),
      parseInt(ts.slice(10, 12)),
      parseInt(ts.slice(12, 14))
    );
  }
}

/**
 * Quick start helper
 */
export async function initGrudgeStudio(config = {}) {
  const api = new GrudgeStudioAPI(config);
  await api.initialize();
  return api;
}

// Global instance for browser usage
if (typeof window !== 'undefined') {
  window.GrudgeStudio = {
    API: GrudgeStudioAPI,
    init: initGrudgeStudio
  };
}

export default GrudgeStudioAPI;

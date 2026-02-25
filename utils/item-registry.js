/**
 * Grudge Studio Item Registry
 * Single source of truth for all game items
 * Prevents duplicates and ensures data consistency
 */

class ItemRegistry {
  constructor() {
    this.items = new Map(); // id -> item data
    this.itemsByCategory = new Map(); // category -> items[]
    this.itemsByType = new Map(); // type -> items[]
    this.searchIndex = new Map(); // search term -> items[]
    this.stats = {
      totalItems: 0,
      byCategory: {},
      byType: {},
      byTier: {}
    };
  }

  /**
   * Register a new item or update existing
   * @param {Object} item - Item data
   * @param {string} category - Category (swords, axes, ore, etc.)
   * @param {string} type - Type (weapon, material, consumable, etc.)
   */
  register(item, category, type) {
    // Generate unique ID if not present
    const itemId = item.id || this._generateId(item.name, category);
    
    // Check for duplicates
    if (this.items.has(itemId)) {
      console.warn(`⚠️ Duplicate item detected: ${itemId}. Merging data...`);
      const existing = this.items.get(itemId);
      item = { ...existing, ...item }; // Merge, new data takes precedence
    }

    // Ensure item has all required fields
    const normalizedItem = {
      id: itemId,
      name: item.name,
      category,
      type,
      tier: item.tier || null,
      emoji: item.emoji || this._getDefaultEmoji(type),
      primaryStat: item.primaryStat || null,
      secondaryStat: item.secondaryStat || null,
      stats: item.stats || {},
      description: item.description || item.desc || '',
      ...item // Include any additional fields
    };

    // Store item
    this.items.set(itemId, normalizedItem);

    // Index by category
    if (!this.itemsByCategory.has(category)) {
      this.itemsByCategory.set(category, []);
    }
    const catItems = this.itemsByCategory.get(category);
    const existingIndex = catItems.findIndex(i => i.id === itemId);
    if (existingIndex >= 0) {
      catItems[existingIndex] = normalizedItem;
    } else {
      catItems.push(normalizedItem);
    }

    // Index by type
    if (!this.itemsByType.has(type)) {
      this.itemsByType.set(type, []);
    }
    const typeItems = this.itemsByType.get(type);
    const existingTypeIndex = typeItems.findIndex(i => i.id === itemId);
    if (existingTypeIndex >= 0) {
      typeItems[existingTypeIndex] = normalizedItem;
    } else {
      typeItems.push(normalizedItem);
    }

    // Build search index
    this._indexForSearch(normalizedItem);

    // Update stats
    this._updateStats();

    return normalizedItem;
  }

  /**
   * Register multiple items at once
   */
  registerBatch(items, category, type) {
    const registered = [];
    for (const item of items) {
      registered.push(this.register(item, category, type));
    }
    return registered;
  }

  /**
   * Get item by ID
   */
  getItem(itemId) {
    return this.items.get(itemId);
  }

  /**
   * Get all items by category
   */
  getByCategory(category) {
    return this.itemsByCategory.get(category) || [];
  }

  /**
   * Get all items by type
   */
  getByType(type) {
    return this.itemsByType.get(type) || [];
  }

  /**
   * Get all items by tier
   */
  getByTier(tier) {
    return Array.from(this.items.values()).filter(item => item.tier === tier);
  }

  /**
   * Search items
   */
  search(query, filters = {}) {
    query = query.toLowerCase().trim();
    
    let results = [];

    if (!query && !Object.keys(filters).length) {
      // No query or filters - return all items
      results = Array.from(this.items.values());
    } else if (query) {
      // Search by name, ID, or indexed terms
      results = Array.from(this.items.values()).filter(item => {
        const name = item.name.toLowerCase();
        const id = item.id.toLowerCase();
        const desc = (item.description || '').toLowerCase();
        
        return name.includes(query) || 
               id.includes(query) || 
               desc.includes(query) ||
               item.primaryStat?.toLowerCase().includes(query) ||
               item.secondaryStat?.toLowerCase().includes(query);
      });
    } else {
      results = Array.from(this.items.values());
    }

    // Apply filters
    if (filters.type) {
      results = results.filter(item => item.type === filters.type);
    }
    
    if (filters.category) {
      results = results.filter(item => item.category === filters.category);
    }
    
    if (filters.tier !== undefined && filters.tier !== 'all') {
      results = results.filter(item => item.tier === parseInt(filters.tier));
    }

    if (filters.minTier) {
      results = results.filter(item => item.tier >= filters.minTier);
    }

    if (filters.maxTier) {
      results = results.filter(item => item.tier <= filters.maxTier);
    }

    return results;
  }

  /**
   * Get all unique categories
   */
  getCategories() {
    return Array.from(this.itemsByCategory.keys());
  }

  /**
   * Get all unique types
   */
  getTypes() {
    return Array.from(this.itemsByType.keys());
  }

  /**
   * Get registry statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Clear all items
   */
  clear() {
    this.items.clear();
    this.itemsByCategory.clear();
    this.itemsByType.clear();
    this.searchIndex.clear();
    this.stats = {
      totalItems: 0,
      byCategory: {},
      byType: {},
      byTier: {}
    };
  }

  /**
   * Export all data as JSON
   */
  export() {
    return {
      items: Array.from(this.items.values()),
      stats: this.stats,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Import data from JSON
   */
  import(data) {
    this.clear();
    
    if (data.items) {
      for (const item of data.items) {
        this.register(item, item.category, item.type);
      }
    }

    console.log(`✅ Imported ${this.items.size} items`);
  }

  // Private methods

  _generateId(name, category) {
    // Convert name to kebab-case ID
    const base = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Add category prefix if not already present
    const prefix = category.substring(0, 3);
    return base.startsWith(prefix) ? base : `${prefix}-${base}`;
  }

  _getDefaultEmoji(type) {
    const defaults = {
      weapon: '⚔️',
      armor: '🛡️',
      material: '🪨',
      consumable: '🧪',
      skill: '⚡',
      enemy: '👹',
      boss: '💀'
    };
    return defaults[type] || '📦';
  }

  _indexForSearch(item) {
    // Index by name words
    const words = item.name.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 2) {
        if (!this.searchIndex.has(word)) {
          this.searchIndex.set(word, []);
        }
        const items = this.searchIndex.get(word);
        if (!items.find(i => i.id === item.id)) {
          items.push(item);
        }
      }
    }
  }

  _updateStats() {
    this.stats.totalItems = this.items.size;
    
    // Count by category
    this.stats.byCategory = {};
    for (const [cat, items] of this.itemsByCategory.entries()) {
      this.stats.byCategory[cat] = items.length;
    }
    
    // Count by type
    this.stats.byType = {};
    for (const [type, items] of this.itemsByType.entries()) {
      this.stats.byType[type] = items.length;
    }
    
    // Count by tier
    this.stats.byTier = {};
    for (const item of this.items.values()) {
      if (item.tier) {
        this.stats.byTier[item.tier] = (this.stats.byTier[item.tier] || 0) + 1;
      }
    }
  }

  /**
   * Validate data integrity
   */
  validate() {
    const issues = [];
    
    // Check for items without IDs
    let noIdCount = 0;
    for (const item of this.items.values()) {
      if (!item.id) {
        noIdCount++;
        issues.push(`Item without ID: ${item.name}`);
      }
    }

    // Check for duplicate names in same category
    for (const [category, items] of this.itemsByCategory.entries()) {
      const names = new Map();
      for (const item of items) {
        const count = names.get(item.name) || 0;
        names.set(item.name, count + 1);
      }
      for (const [name, count] of names.entries()) {
        if (count > 1) {
          issues.push(`Duplicate name in ${category}: "${name}" (${count} times)`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      summary: {
        totalItems: this.items.size,
        duplicatesFound: issues.filter(i => i.includes('Duplicate')).length,
        missingIds: noIdCount
      }
    };
  }
}

// Export singleton instance
export const itemRegistry = new ItemRegistry();
export default ItemRegistry;

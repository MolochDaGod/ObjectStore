/**
 * Grudge Studio Image Generator
 * Uses Puter.js AI to generate images for game items
 * Replaces all emoji icons with real AI-generated images
 */

import puter from 'https://js.puter.com/v2/';

class GrudgeImageGenerator {
  constructor() {
    this.cache = new Map();
    this.generatedImages = new Map();
    this.pendingRequests = new Map();
  }

  /**
   * Generate an image for a game item using Puter AI
   * @param {Object} item - Item data (name, type, stats, etc.)
   * @param {string} category - Item category (weapon, armor, material, etc.)
   * @returns {Promise<string>} - Base64 image data URL
   */
  async generateItemImage(item, category) {
    const cacheKey = `${category}-${item.id || item.name}`;
    
    // Return cached image if exists
    if (this.generatedImages.has(cacheKey)) {
      return this.generatedImages.get(cacheKey);
    }

    // Wait for pending request if already generating
    if (this.pendingRequests.has(cacheKey)) {
      return await this.pendingRequests.get(cacheKey);
    }

    // Create new generation request
    const generationPromise = this._generateImage(item, category, cacheKey);
    this.pendingRequests.set(cacheKey, generationPromise);

    try {
      const imageUrl = await generationPromise;
      this.generatedImages.set(cacheKey, imageUrl);
      this.pendingRequests.delete(cacheKey);
      return imageUrl;
    } catch (error) {
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }

  async _generateImage(item, category, cacheKey) {
    try {
      // Build descriptive prompt for AI image generation
      const prompt = this._buildPrompt(item, category);
      
      console.log(`🎨 Generating image for: ${item.name} (${category})`);
      console.log(`📝 Prompt: ${prompt}`);

      // Use Puter AI to generate image
      const result = await puter.ai.txt2img(prompt, {
        width: 256,
        height: 256,
        format: 'png',
        style: 'fantasy game icon, pixel art style, detailed, dark fantasy aesthetic'
      });

      // Convert to data URL for easy embedding
      const imageUrl = await this._blobToDataURL(result);
      
      // Save to localStorage for persistence
      this._saveToStorage(cacheKey, imageUrl);

      console.log(`✅ Generated image for: ${item.name}`);
      return imageUrl;

    } catch (error) {
      console.error(`❌ Failed to generate image for ${item.name}:`, error);
      // Return fallback placeholder
      return this._getFallbackImage(category);
    }
  }

  /**
   * Build AI prompt based on item properties
   */
  _buildPrompt(item, category) {
    let prompt = '';

    switch (category) {
      case 'weapon':
        const weaponType = this._getWeaponType(item);
        prompt = `${weaponType} weapon icon, ${item.name}, fantasy RPG, ${item.primaryStat} focused`;
        
        if (item.secondaryStat) {
          if (item.secondaryStat.includes('fire') || item.secondaryStat.includes('burn')) {
            prompt += ', fire elemental';
          } else if (item.secondaryStat.includes('frost') || item.secondaryStat.includes('ice')) {
            prompt += ', ice elemental';
          } else if (item.secondaryStat.includes('lightning') || item.secondaryStat.includes('shock')) {
            prompt += ', lightning elemental';
          } else if (item.secondaryStat.includes('poison')) {
            prompt += ', poison dripping';
          } else if (item.secondaryStat.includes('bleed')) {
            prompt += ', blood covered';
          }
        }
        break;

      case 'armor':
        prompt = `${item.name} armor piece, fantasy RPG, medieval, detailed`;
        break;

      case 'material':
        const matType = this._getMaterialType(item);
        prompt = `${matType} material, ${item.name}, resource icon, fantasy game`;
        
        if (item.tier) {
          prompt += `, tier ${item.tier} quality`;
        }
        break;

      case 'consumable':
        if (item.name.toLowerCase().includes('potion')) {
          prompt = `${item.name} potion bottle, glowing liquid, fantasy RPG`;
        } else if (item.name.toLowerCase().includes('food')) {
          prompt = `${item.name} food item, fantasy medieval feast`;
        } else {
          prompt = `${item.name} consumable item, fantasy RPG`;
        }
        break;

      case 'skill':
        prompt = `${item.name} skill icon, magic spell effect, fantasy ability icon`;
        break;

      default:
        prompt = `${item.name}, fantasy RPG game icon`;
    }

    prompt += ', dark background, centered, game UI icon style, 64x64 pixel art aesthetic';
    return prompt;
  }

  _getWeaponType(item) {
    const name = item.name.toLowerCase();
    const id = item.id?.toLowerCase() || '';
    
    if (name.includes('sword') || id.includes('sword')) return 'sword';
    if (name.includes('axe') || id.includes('axe')) return 'axe';
    if (name.includes('hammer') || id.includes('hammer')) return 'hammer';
    if (name.includes('dagger') || id.includes('dagger')) return 'dagger';
    if (name.includes('bow')) return 'bow';
    if (name.includes('staff') || id.includes('staff')) return 'staff';
    if (name.includes('spear') || id.includes('spear')) return 'spear';
    if (name.includes('crossbow')) return 'crossbow';
    if (name.includes('gun')) return 'gun';
    
    return 'fantasy weapon';
  }

  _getMaterialType(item) {
    const name = item.name.toLowerCase();
    
    if (name.includes('ore') || name.includes('metal')) return 'metal ore';
    if (name.includes('wood') || name.includes('lumber')) return 'wood';
    if (name.includes('leather') || name.includes('hide')) return 'leather';
    if (name.includes('cloth') || name.includes('fabric')) return 'cloth';
    if (name.includes('gem') || name.includes('crystal')) return 'gem';
    if (name.includes('herb') || name.includes('plant')) return 'herb';
    
    return 'crafting material';
  }

  async _blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  _saveToStorage(key, imageUrl) {
    try {
      // Store in localStorage with size limit check
      const storageKey = `grudge-img-${key}`;
      if (imageUrl.length < 1000000) { // < 1MB
        localStorage.setItem(storageKey, imageUrl);
      }
    } catch (e) {
      console.warn('Failed to save image to localStorage:', e);
    }
  }

  _loadFromStorage(key) {
    try {
      const storageKey = `grudge-img-${key}`;
      return localStorage.getItem(storageKey);
    } catch (e) {
      return null;
    }
  }

  _getFallbackImage(category) {
    // Return a simple colored square as fallback
    const colors = {
      weapon: '#d4a84b',
      armor: '#4b8bd4',
      material: '#8b4bd4',
      consumable: '#4bd48b',
      skill: '#d44b8b'
    };
    
    const color = colors[category] || '#888';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="${color}"/></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Batch generate images for multiple items
   */
  async generateBatch(items, category, onProgress) {
    const total = items.length;
    const results = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const imageUrl = await this.generateItemImage(item, category);
        results.push({ item, imageUrl, success: true });
      } catch (error) {
        results.push({ item, imageUrl: null, success: false, error });
      }

      if (onProgress) {
        onProgress({ current: i + 1, total, item });
      }

      // Rate limiting: wait 500ms between requests
      if (i < items.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return results;
  }

  /**
   * Clear cache and regenerate all images
   */
  clearCache() {
    this.generatedImages.clear();
    // Clear from localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('grudge-img-')) {
        localStorage.removeItem(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cached: this.generatedImages.size,
      pending: this.pendingRequests.size,
      storageSize: this._getStorageSize()
    };
  }

  _getStorageSize() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('grudge-img-')) {
        total += localStorage.getItem(key).length;
      }
    }
    return Math.round(total / 1024); // KB
  }
}

// Export singleton instance
export const imageGenerator = new GrudgeImageGenerator();
export default GrudgeImageGenerator;

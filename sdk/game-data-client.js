/**
 * Grudge Game Data Hub — Game Data Client
 * Unified client for accessing all game data + Grudge backend.
 *
 * Usage:
 *   const client = new GameDataClient();
 *   await client.init();
 *   const swords = client.search('sword', { tier: 5, type: 'weapon' });
 */

import { loadMasterItems, loadMasterRecipes, loadMasterMaterials, loadMasterAttributes } from '../lib/data-loader.js';
import { RecipeLinker } from '../lib/recipe-linker.js';
import { AccountConnector } from '../lib/account-connector.js';
import { generateUuid, parseUuid, isValid } from '../lib/uuid-registry.js';
import {
  getRaceCharacterUrl, getRaceCavalryUrl, getRaceSiegeUrl,
  getRaceMeta, getRaceIds, getAllRaces, getRaceManifest,
  getRaceData, getEquipmentSlots, getBoneContainers, getAnimationPacks,
  assetUrl, iconUrl, packIconUrl, modelUrl, effectUrl, shaderUrl,
  animationUrl, audioUrl, spriteUrl, textureUrl,
  CDN, RACES, RACE_META,
} from '../lib/objectstore-api.js';

export class GameDataClient {
  constructor() {
    this.linker = null;
    this.attributes = null;
    this.account = new AccountConnector();
    this.ready = false;
  }

  async init() {
    const [items, recipes, materials, attrs] = await Promise.all([
      loadMasterItems(), loadMasterRecipes(), loadMasterMaterials(), loadMasterAttributes(),
    ]);
    this.linker = new RecipeLinker(items, recipes, materials);
    this.attributes = attrs?.attributes || [];
    await this.account.init();
    this.ready = true;
    return this;
  }

  // --- Item Queries ---
  getItem(uuid) { return this.linker?.getItem(uuid); }
  search(query, filters) { return this.linker?.searchItems(query, filters) || []; }
  getCategories() { return this.linker?.getCategories() || []; }
  getStats() { return this.linker?.getStats() || {}; }

  // --- Recipe Queries ---
  getRecipe(uuid) { return this.linker?.getRecipe(uuid); }
  getRecipeForItem(itemUuid) { return this.linker?.getRecipeForItem(itemUuid); }
  getCraftingChain(itemUuid) { return this.linker?.getFullCraftingChain(itemUuid); }

  // --- Attributes ---
  getAttributes() { return this.attributes; }

  // --- UUID Tools ---
  generateUuid(type, meta) { return generateUuid(type, meta); }
  parseUuid(uuid) { return parseUuid(uuid); }
  isValidUuid(uuid) { return isValid(uuid); }

  // --- Race Characters (3D models from CF R2) ---
  getRaceCharacterUrl(race) { return getRaceCharacterUrl(race); }
  getRaceCavalryUrl(race) { return getRaceCavalryUrl(race); }
  getRaceSiegeUrl(race) { return getRaceSiegeUrl(race); }
  getRaceMeta(race) { return getRaceMeta(race); }
  getRaceIds() { return getRaceIds(); }
  getAllRaces() { return getAllRaces(); }
  async getRaceManifest() { return getRaceManifest(); }
  async getRaceData(race) { return getRaceData(race); }
  async getEquipmentSlots() { return getEquipmentSlots(); }
  async getBoneContainers() { return getBoneContainers(); }
  async getAnimationPacks() { return getAnimationPacks(); }

  // --- Asset URL Builders ---
  assetUrl(path) { return assetUrl(path); }
  iconUrl(path) { return iconUrl(path); }
  modelUrl(path) { return modelUrl(path); }
  effectUrl(path) { return effectUrl(path); }
  animationUrl(pack, clip) { return animationUrl(pack, clip); }

  // --- Account ---
  get isConnected() { return this.account.isConnected; }
  async connectAccount(username, password) { return this.account.login(username, password); }
  async getCharacters() { return this.account.getCharacters(); }
  async getInventory(charId) { return this.account.getInventory(charId); }
  async startCraft(charId, recipeKey) { return this.account.startCraft(charId, recipeKey); }
  disconnect() { this.account.logout(); }
}

export {
  generateUuid, parseUuid, isValid,
  getRaceCharacterUrl, getRaceCavalryUrl, getRaceSiegeUrl,
  getRaceMeta, getRaceIds, getAllRaces, getRaceManifest, getRaceData,
  assetUrl, iconUrl, packIconUrl, modelUrl, effectUrl, shaderUrl,
  animationUrl, audioUrl, spriteUrl, textureUrl,
  CDN, RACES, RACE_META,
};

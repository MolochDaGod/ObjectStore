/**
 * Grudge Game Data Hub — Account Connector
 * Wraps GrudgeSDK for authentication, character saves, inventory, and crafting.
 */

const SDK_URL = 'https://objectstore.grudge-studio.com/sdk/grudge-sdk.js';
const LS_TOKEN = 'grudge_auth_token';

export class AccountConnector {
  constructor() {
    this.sdk = null;
    this.token = null;
    this.user = null;
  }

  async init() {
    try {
      const mod = await import(SDK_URL);
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(LS_TOKEN) : null;
      this.sdk = new mod.GrudgeSDK({ token: stored || undefined });
      if (stored) {
        this.token = stored;
        try { this.user = await this.sdk.auth.getMe(); } catch { /* not logged in */ }
      }
    } catch (err) {
      console.warn('[AccountConnector] SDK unavailable, running in offline mode:', err.message);
    }
  }

  get isConnected() { return !!this.user; }

  async login(username, password) {
    if (!this.sdk) throw new Error('SDK not initialized');
    const res = await this.sdk.auth.loginAndStore('login', username, password);
    this.token = res.token;
    this.user = await this.sdk.auth.getMe();
    return this.user;
  }

  async getCharacters() {
    if (!this.sdk) return [];
    return this.sdk.game.listCharacters();
  }

  async getInventory(charId) {
    if (!this.sdk) return [];
    return this.sdk.game.getInventory?.(charId) || [];
  }

  async startCraft(charId, recipeKey) {
    if (!this.sdk) throw new Error('Not connected');
    return this.sdk.game.startCraft({ char_id: charId, recipe_key: recipeKey });
  }

  async getBalance(charId) {
    if (!this.sdk) return { gold: 0 };
    return this.sdk.game.getBalance(charId);
  }

  logout() {
    if (this.sdk) this.sdk.clearSession();
    this.token = null;
    this.user = null;
  }
}

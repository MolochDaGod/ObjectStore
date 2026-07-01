/**
 * Grudge Studio SDK — Unified Client for All Services
 * @version 6.0.0
 *
 * Provides access to:
 *   - ObjectStore static game data (GitHub Pages JSON)
 *   - R2 asset storage (Cloudflare Worker)
 *   - Grudge Identity / Auth (id.grudge-studio.com)
 *   - Game API (api.grudge-studio.com)
 *   - Account API (account.grudge-studio.com)
 *   - Launcher API (launcher.grudge-studio.com)
 *   - Asset Service (assets-api.grudge-studio.com)
 *   - WebSocket / Socket.IO (ws.grudge-studio.com)
 *   - Grudge UUID system
 *
 * Works in browsers and Node.js (with fetch polyfill).
 *
 * Usage:
 *   import { GrudgeSDK } from './grudge-sdk.js';
 *   const sdk = new GrudgeSDK({ token: '<JWT>' });
 *   const weapons = await sdk.getWeapons();
 *   const chars   = await sdk.game.listCharacters();
 */

import { ObjectStoreR2Client, DEFAULT_WORKER_URL } from './r2-client.js';

// ==========================================
// DEFAULTS
// ==========================================

const DEFAULT_BASE_URL      = 'https://objectstore.grudge-studio.com';
const DEFAULT_WORKER_API    = 'https://objectstore.grudge-studio.com';
const DEFAULT_ID_URL        = 'https://id.grudge-studio.com';
const DEFAULT_GAME_URL      = 'https://api.grudge-studio.com';
const DEFAULT_ACCOUNT_URL   = 'https://account.grudge-studio.com';
const DEFAULT_LAUNCHER_URL  = 'https://launcher.grudge-studio.com';
const DEFAULT_WS_URL        = 'https://ws.grudge-studio.com';
const DEFAULT_ASSETS_API_URL = 'https://assets-api.grudge-studio.com';
const DEFAULT_ASSETS_CDN_URL = 'https://assets.grudge-studio.com';
const DEFAULT_AI_URL        = 'https://ai.grudge-studio.com';
const DEFAULT_STATUS_URL    = 'https://status.grudge-studio.com';

// ==========================================
// TIER COLOR SYSTEM
// ==========================================

// D5: T5 renamed 'Legendary' -> 'Heroic'; T8 renamed 'Legendary Artifact' -> 'Legendary'.
// 'Legendary' is now reserved for the T8 tier label only; 'Artifact' is the weapon category (D3).
const TIER_COLORS = {
  1: { name: 'Bronze',  hex: '#8b7355', label: 'Common' },
  2: { name: 'Silver',  hex: '#a8a8a8', label: 'Uncommon' },
  3: { name: 'Blue',    hex: '#4a9eff', label: 'Rare' },
  4: { name: 'Purple',  hex: '#9d4dff', label: 'Epic' },
  5: { name: 'Red',     hex: '#ff4d4d', label: 'Heroic' },
  6: { name: 'Orange',  hex: '#ffaa00', label: 'Mythic' },
  7: { name: 'Gold',    hex: '#d4a84b', label: 'Ancient' },
  8: { name: 'Shimmer', hex: '#f0d890', label: 'Legendary' },
};

// ==========================================
// LOCALSTORAGE KEY CONVENTION
// ==========================================

const LS_KEYS = {
  AUTH_TOKEN:    'grudge_auth_token',
  USER_ID:       'grudge_user_id',
  USERNAME:      'grudge_username',
  DEVICE_ID:     'grudge_device_id',
  SESSION_TOKEN: 'grudge_session_token',
  SYNC_TOKEN:    'grudge_sync_token',
  SESSION_BLOB:  'grudge-session',
  API_KEY:       'grudge-api-key',
};

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

/** Parse a Grudge UUID into its components. */
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

/** Validate a Grudge UUID string. */
function isValidGrudgeUuid(uuid) {
  if (!uuid || typeof uuid !== 'string') return false;
  const pattern = /^[A-Z]{4}-\d{14}-[0-9A-F]{6}-[0-9A-F]{8}$/;
  return pattern.test(uuid);
}

// ==========================================
// AUTHENTICATED FETCH HELPERS
// ==========================================

/**
 * Resolve the best available auth token from localStorage.
 * Priority: explicit token > sync token > session blob token > API key header.
 */
function _resolveAuth(explicitToken) {
  const headers = {};
  if (explicitToken) {
    headers['Authorization'] = `Bearer ${explicitToken}`;
    return { headers, token: explicitToken };
  }
  if (typeof localStorage === 'undefined') return { headers, token: null };

  const main = localStorage.getItem(LS_KEYS.AUTH_TOKEN);
  if (main) { headers['Authorization'] = `Bearer ${main}`; return { headers, token: main }; }

  const sync = localStorage.getItem(LS_KEYS.SYNC_TOKEN);
  if (sync) { headers['Authorization'] = `Bearer ${sync}`; return { headers, token: sync }; }

  try {
    const sess = JSON.parse(localStorage.getItem(LS_KEYS.SESSION_BLOB) || '{}');
    if (sess.token) { headers['Authorization'] = `Bearer ${sess.token}`; return { headers, token: sess.token }; }
    if (sess.discordId) { headers['x-discord-id'] = sess.discordId; return { headers, token: null }; }
  } catch { /* ignore */ }

  const apiKey = localStorage.getItem(LS_KEYS.API_KEY);
  if (apiKey) { headers['x-api-key'] = apiKey; return { headers, token: null }; }

  return { headers, token: null };
}

/** Generic authenticated fetch — returns null on failure. */
async function _authFetch(baseUrl, path, token, opts = {}) {
  const { headers: authHeaders } = _resolveAuth(token);
  const url = `${baseUrl}${path}`;
  try {
    const res = await fetch(url, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...authHeaders, ...(opts.headers || {}) },
    });
    if (res.status === 401 && typeof localStorage !== 'undefined') {
      localStorage.removeItem(LS_KEYS.SYNC_TOKEN);
    }
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return res.json();
    return null;
  } catch { return null; }
}

/** Same as _authFetch but returns [] on failure. */
async function _authFetchList(baseUrl, path, token, opts) {
  const data = await _authFetch(baseUrl, path, token, opts);
  return Array.isArray(data) ? data : [];
}

// ==========================================
// AUTH CLIENT — id.grudge-studio.com
// ==========================================

class GrudgeAuthClient {
  constructor(baseUrl, getToken) { this._url = baseUrl; this._getToken = getToken; }

  async loginWeb3Auth(idToken, wallet) {
    return _authFetch(this._url, '/auth/web3auth', null, { method: 'POST', body: JSON.stringify({ idToken, wallet }) });
  }
  async loginDiscord(code, redirectUri) {
    return _authFetch(this._url, '/auth/discord/exchange', null, { method: 'POST', body: JSON.stringify({ code, redirect_uri: redirectUri }) });
  }
  async login(username, password) {
    return _authFetch(this._url, '/auth/login', null, { method: 'POST', body: JSON.stringify({ username, password }) });
  }
  async register(username, password, email) {
    return _authFetch(this._url, '/auth/register', null, { method: 'POST', body: JSON.stringify({ username, password, email }) });
  }
  async guest(deviceId) {
    return _authFetch(this._url, '/auth/guest', null, { method: 'POST', body: JSON.stringify({ deviceId }) });
  }
  async puter(puterUuid, puterUsername) {
    return _authFetch(this._url, '/auth/puter', null, { method: 'POST', body: JSON.stringify({ puterUuid, puterUsername }) });
  }
  async wallet(walletAddress, web3authToken) {
    return _authFetch(this._url, '/auth/wallet', null, { method: 'POST', body: JSON.stringify({ wallet_address: walletAddress, web3auth_token: web3authToken }) });
  }
  async verify(token) {
    return _authFetch(this._url, '/auth/verify', null, { method: 'POST', body: JSON.stringify({ token: token || this._getToken() }) });
  }
  async getMe() { return _authFetch(this._url, '/identity/me', this._getToken()); }
  async updateMe(data) { return _authFetch(this._url, '/identity/me', this._getToken(), { method: 'PATCH', body: JSON.stringify(data) }); }
  async lookup(grudgeId) { return _authFetch(this._url, `/identity/${encodeURIComponent(grudgeId)}`, null); }

  /** Perform login and auto-store token + user info in localStorage. */
  async loginAndStore(method, ...args) {
    const res = await this[method](...args);
    if (!res) return null;
    const token = res.token || res.data?.token;
    const grudgeId = res.grudge_id || res.grudgeId || res.data?.grudge_id;
    const username = res.username || res.data?.username;
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem(LS_KEYS.AUTH_TOKEN, token);
      if (grudgeId) localStorage.setItem(LS_KEYS.USER_ID, grudgeId);
      if (username) localStorage.setItem(LS_KEYS.USERNAME, username);
    }
    return res;
  }

  static clearSession() {
    if (typeof localStorage === 'undefined') return;
    Object.values(LS_KEYS).forEach(k => localStorage.removeItem(k));
  }
}

// ==========================================
// GAME API CLIENT — api.grudge-studio.com
// ==========================================

class GrudgeGameClient {
  constructor(baseUrl, getToken) { this._url = baseUrl; this._gt = getToken; }
  _get(p) { return _authFetch(this._url, p, this._gt()); }
  _getList(p) { return _authFetchList(this._url, p, this._gt()); }
  _post(p, body) { return _authFetch(this._url, p, this._gt(), { method: 'POST', body: JSON.stringify(body) }); }
  _patch(p, body) { return _authFetch(this._url, p, this._gt(), { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }); }
  _del(p) { return _authFetch(this._url, p, this._gt(), { method: 'DELETE' }); }

  async health() { return _authFetch(this._url, '/health', null); }

  // Characters
  async listCharacters() { return this._getList('/characters'); }
  async getCharacter(id) { return this._get(`/characters/${id}`); }
  async createCharacter(data) { return this._post('/characters', data); }
  async updateCharacter(id, data) { return this._patch(`/characters/${id}`, data); }
  async deleteCharacter(id) { return this._del(`/characters/${id}`); }
  async updateCharacterStats(id, stats) { return this._patch(`/characters/${id}/stats`, stats); }

  // Economy
  async getBalance(charId) { return this._get(`/economy/balance?char_id=${charId}`); }
  async spend(data) { return this._post('/economy/spend', data); }
  async transfer(data) { return this._post('/economy/transfer', data); }

  // Crafting
  async getRecipes(filters = {}) {
    const p = new URLSearchParams();
    if (filters.class) p.set('class', filters.class);
    if (filters.profession) p.set('profession', filters.profession);
    if (filters.tier) p.set('tier', String(filters.tier));
    const qs = p.toString();
    return this._getList(`/crafting/recipes${qs ? '?' + qs : ''}`);
  }
  async getCraftingQueue(charId) { return this._getList(`/crafting/queue${charId ? '?char_id=' + charId : ''}`); }
  async startCraft(data) { return this._post('/crafting/start', data); }
  async completeCraft(id) { return this._patch(`/crafting/${id}/complete`); }
  async cancelCraft(id) { return this._del(`/crafting/${id}`); }

  // Combat
  async getCombatHistory(charId) { return this._getList(`/combat/history?char_id=${charId}`); }
  async getCombatLeaderboard() { return this._getList('/combat/leaderboard'); }

  // PvP
  async listLobbies(filters = {}) {
    const p = new URLSearchParams();
    if (filters.mode) p.set('mode', filters.mode);
    if (filters.limit) p.set('limit', String(filters.limit));
    return this._getList(`/pvp/lobbies${p.toString() ? '?' + p : ''}`);
  }
  async createLobby(data) { return this._post('/pvp/lobbies', data); }
  async getLobby(code) { return this._get(`/pvp/lobbies/${code}`); }
  async joinLobby(code) { return this._post(`/pvp/lobbies/${code}/join`); }
  async readyLobby(code) { return this._post(`/pvp/lobbies/${code}/ready`); }
  async leaveLobby(code) { return this._post(`/pvp/lobbies/${code}/leave`); }
  async getPvPQueue() { return this._get('/pvp/queue'); }
  async joinPvPQueue(data) { return this._post('/pvp/queue', data); }
  async leavePvPQueue() { return this._del('/pvp/queue'); }
  async getPvPLeaderboard(filters = {}) {
    const p = new URLSearchParams();
    if (filters.mode) p.set('mode', filters.mode);
    if (filters.limit) p.set('limit', String(filters.limit));
    return this._getList(`/pvp/leaderboard${p.toString() ? '?' + p : ''}`);
  }
  async getPvPMatch(id) { return this._get(`/pvp/match/${id}`); }

  // Islands
  async listIslands() { return this._getList('/islands'); }
  async getIsland(key) { return this._get(`/islands/${key}`); }

  // Missions
  async listMissions() { return this._getList('/missions'); }
  async createMission(data) { return this._post('/missions', data); }
  async completeMission(id) { return this._patch(`/missions/${id}/complete`); }
  async abandonMission(id) { return this._del(`/missions/${id}`); }

  // Crews
  async getCrew() { return this._get('/crews'); }
  async createCrew(data) { return this._post('/crews/create', data); }
  async joinCrew(id) { return this._post(`/crews/${id}/join`); }
  async leaveCrew(id) { return this._post(`/crews/${id}/leave`); }
  async claimBase(id) { return this._post(`/crews/${id}/claim-base`); }

  // Factions
  async listFactions() { return this._getList('/factions/list'); }
  async getFaction(name) { return this._get(`/factions/${encodeURIComponent(name)}`); }
  async joinFaction(name) { return this._post(`/factions/${encodeURIComponent(name)}/join`); }
  async factionLeaderboard() { return this._getList('/factions/leaderboard'); }

  // Inventory
  async listInventory(charId) { return this._getList(`/inventory${charId ? '?char_id=' + charId : ''}`); }
  async addItem(data) { return this._post('/inventory', data); }
  async equipItem(id, data) { return this._patch(`/inventory/${id}/equip`, data); }
  async unequipItem(id) { return this._patch(`/inventory/${id}/unequip`); }
  async removeItem(id) { return this._del(`/inventory/${id}`); }

  // Professions
  async getProfessions(charId) { return this._getList(`/professions/${charId}`); }
  async addProfessionXP(charId, profession, xp) { return this._post(`/professions/${charId}/xp`, { profession, xp }); }

  // Gouldstones
  async listGouldstones() { return this._getList('/gouldstones'); }
  async cloneGouldstone(charId, name) { return this._post('/gouldstones/clone', { char_id: charId, name }); }
  async setGouldBehavior(id, behavior) { return this._patch(`/gouldstones/${id}/behavior`, { behavior_profile: behavior }); }
  async deployGouldstone(id, island) { return this._patch(`/gouldstones/${id}/deploy`, { island }); }
  async recallGouldstone(id) { return this._patch(`/gouldstones/${id}/recall`); }

  // Dungeons
  async startDungeon(charId, dungeonKey) { return this._post('/dungeon', { char_id: charId, dungeon_key: dungeonKey }); }
  async getDungeonRun(id) { return this._get(`/dungeon/${id}`); }

  // AI (proxied to internal ai-agent)
  async aiGenerateMission(data) { return this._post('/ai/mission/generate', data); }
  async aiCompanionInteract(data) { return this._post('/ai/companion/interact', data); }
  async aiGameContext() { return this._get('/ai/context'); }
  async aiFactionIntel() { return this._get('/ai/faction/intel'); }
  async aiCodeReview(data) { return this._post('/ai/dev/review', data); }
  async aiCodeGenerate(data) { return this._post('/ai/dev/generate', data); }
  async aiBalanceAnalyze(data) { return this._post('/ai/balance/analyze', data); }
  async aiLoreGenerate(data) { return this._post('/ai/lore/generate', data); }
  async aiArtPrompt(data) { return this._post('/ai/art/prompt', data); }
  async aiLLMStatus() { return this._get('/ai/llm/status'); }
}

// ==========================================
// ACCOUNT API CLIENT — account.grudge-studio.com
// ==========================================

class GrudgeAccountClient {
  constructor(baseUrl, getToken) { this._url = baseUrl; this._gt = getToken; }
  _get(p) { return _authFetch(this._url, p, this._gt()); }
  _getList(p) { return _authFetchList(this._url, p, this._gt()); }
  _post(p, body) { return _authFetch(this._url, p, this._gt(), { method: 'POST', body: JSON.stringify(body) }); }
  _patch(p, body) { return _authFetch(this._url, p, this._gt(), { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }); }
  _del(p) { return _authFetch(this._url, p, this._gt(), { method: 'DELETE' }); }

  async getProfile(grudgeId) { return this._get(`/profile/${grudgeId}`); }
  async updateProfile(grudgeId, data) { return this._patch(`/profile/${grudgeId}`, data); }
  async listFriends() { return this._getList('/friends'); }
  async sendFriendRequest(grudgeId) { return this._post('/friends/request', { grudge_id: grudgeId }); }
  async respondFriend(id, action) { return this._patch(`/friends/${id}`, { action }); }
  async removeFriend(grudgeId) { return this._del(`/friends/${grudgeId}`); }
  async listNotifications(unreadOnly = false) { return this._getList(`/notifications${unreadOnly ? '?unread=1' : ''}`); }
  async markRead(id) { return this._patch(`/notifications/${id}/read`); }
  async markAllRead() { return this._patch('/notifications/read-all'); }
  async getAchievementDefs() { return this._getList('/achievements/defs'); }
  async getMyAchievements() { return this._get('/achievements/mine'); }
  async getUserAchievements(grudgeId) { return this._get(`/achievements/${grudgeId}`); }
  async listSessions() { return this._getList('/sessions'); }
  async renameSession(computerId, label) { return this._patch(`/sessions/${computerId}/label`, { label }); }
  async revokeSession(computerId) { return this._del(`/sessions/${computerId}`); }
  async getPuterLink() { return this._get('/puter/link'); }
}

// ==========================================
// LAUNCHER API CLIENT — launcher.grudge-studio.com
// ==========================================

class GrudgeLauncherClient {
  constructor(baseUrl, getToken) { this._url = baseUrl; this._gt = getToken; }
  async getManifest(channel = 'stable') { return _authFetch(this._url, `/manifest?channel=${channel}`, this._gt()); }
  async getEntitlement() { return _authFetch(this._url, '/entitlement', this._gt()); }
  async getVersionHistory() { return _authFetchList(this._url, '/manifest/history', this._gt()); }
}

// ==========================================
// ASSET SERVICE CLIENT — assets-api.grudge-studio.com
// ==========================================

class GrudgeAssetServiceClient {
  constructor(baseUrl, getToken) { this._url = baseUrl; this._gt = getToken; }

  async health() { return _authFetch(this._url, '/health', null); }

  async upload(file, meta = {}) {
    const fd = new FormData();
    fd.append('file', file);
    if (meta.key) fd.append('key', meta.key);
    if (meta.category) fd.append('category', meta.category);
    if (meta.tags) fd.append('tags', JSON.stringify(meta.tags));
    if (meta.description) fd.append('description', meta.description);
    const { headers: authHeaders } = _resolveAuth(this._gt());
    const res = await fetch(`${this._url}/assets`, { method: 'POST', headers: authHeaders, body: fd });
    if (!res.ok) return null;
    return res.json();
  }

  async listAssets(query = {}) {
    const p = new URLSearchParams();
    if (query.prefix) p.set('prefix', query.prefix);
    if (query.limit) p.set('limit', String(query.limit));
    if (query.cursor) p.set('cursor', query.cursor);
    if (query.category) p.set('category', query.category);
    return _authFetchList(this._url, `/assets${p.toString() ? '?' + p : ''}`, this._gt());
  }

  async getAsset(key) { return _authFetch(this._url, `/assets/${encodeURIComponent(key)}`, this._gt()); }
  async deleteAsset(key) { return _authFetch(this._url, `/assets/${encodeURIComponent(key)}`, this._gt(), { method: 'DELETE' }); }
  getAssetUrl(key) { return `${this._url}/assets/${encodeURIComponent(key)}/file`; }
}

// ==========================================
// WEBSOCKET CLIENT — ws.grudge-studio.com
// ==========================================

// ==========================================
// AI CLIENT — ai.grudge-studio.com
// ==========================================

class GrudgeAIClient {
  constructor(baseUrl, getToken) { this._url = baseUrl; this._gt = getToken; }

  async _post(path, body) {
    const { headers } = _resolveAuth(this._gt());
    headers['Content-Type'] = 'application/json';
    const res = await fetch(`${this._url}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`AI API ${res.status}: ${res.statusText}`);
    return res.json();
  }

  /** Describe an asset image — pass asset_id (from R2) or image_url */
  async describe(opts) { return this._post('/v1/ai/describe', opts); }

  /** Generate a sprite from text prompt */
  async generateSprite(prompt, opts = {}) { return this._post('/v1/ai/generate-sprite', { prompt, ...opts }); }

  /** Generate an item icon from text prompt */
  async generateIcon(prompt, opts = {}) { return this._post('/v1/ai/generate-icon', { prompt, ...opts }); }

  /** Auto-tag an asset using AI */
  async tag(assetId) { return this._post('/v1/ai/tag', { asset_id: assetId }); }

  /** Semantic search across assets */
  async search(query, opts = {}) { return this._post('/v1/ai/search', { query, ...opts }); }

  /** Chat with a game agent (lore, balance, code, art, mission, qa) */
  async chat(prompt, opts = {}) { return this._post('/v1/ai/chat', { prompt, ...opts }); }

  /** Chat with conversation history */
  async chatMessages(messages, opts = {}) { return this._post('/v1/ai/chat', { messages, ...opts }); }

  /** Get AI job status */
  async getJob(jobId) {
    return _authFetch(this._url, `/v1/ai/jobs/${jobId}`, this._gt());
  }

  /** List recent AI jobs */
  async listJobs(opts = {}) {
    const p = new URLSearchParams();
    if (opts.type) p.set('type', opts.type);
    if (opts.limit) p.set('limit', String(opts.limit));
    return _authFetch(this._url, `/v1/ai/jobs${p.toString() ? '?' + p : ''}`, this._gt());
  }

  /** Health check */
  async health() {
    return _authFetch(this._url, '/health', null);
  }
}

class GrudgeWSClient {
  constructor(baseUrl, getToken) { this._url = baseUrl; this._gt = getToken; this._sockets = {}; }

  connect(namespace = '/game') {
    if (this._sockets[namespace]) return this._sockets[namespace];
    const io = typeof window !== 'undefined' ? window.io : null;
    if (!io) {
      // Dynamic import for ESM compatibility (require() fails in ESM mode)
      throw new Error('socket.io-client not available — load socket.io client script in browser, or use: const { io } = await import("socket.io-client")');
    }
    const socket = io(`${this._url}${namespace}`, { auth: { token: this._gt() }, transports: ['websocket', 'polling'] });
    this._sockets[namespace] = socket;
    return socket;
  }

  game() { return this.connect('/game'); }
  crew() { return this.connect('/crew'); }
  global() { return this.connect('/global'); }
  pvp() { return this.connect('/pvp'); }

  disconnect(namespace) {
    if (namespace) { this._sockets[namespace]?.disconnect(); delete this._sockets[namespace]; }
    else { Object.values(this._sockets).forEach(s => s.disconnect()); this._sockets = {}; }
  }
}

// ==========================================
// SDK CLASS
// ==========================================

class GrudgeSDK {
  /**
   * @param {string|object} opts
   * @param {string} [opts.baseUrl]       - ObjectStore GitHub Pages URL
   * @param {string} [opts.workerUrl]     - R2 Worker URL
   * @param {string} [opts.apiKey]        - R2 API key
   * @param {string} [opts.token]         - JWT auth token (or auto-read from localStorage)
   * @param {string} [opts.idUrl]         - Identity service URL
   * @param {string} [opts.gameUrl]       - Game API URL
   * @param {string} [opts.accountUrl]    - Account API URL
   * @param {string} [opts.launcherUrl]   - Launcher API URL
   * @param {string} [opts.wsUrl]         - WebSocket URL
   * @param {string} [opts.workerApiUrl]  - ObjectStore Worker API URL
   * @param {string} [opts.assetsApiUrl]  - Asset Service URL
   * @param {string} [opts.assetsCdnUrl]  - R2 CDN URL
   */
  constructor(opts = DEFAULT_BASE_URL) {
    if (typeof opts === 'string') opts = { baseUrl: opts };

    this.baseUrl = (opts.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this._workerApi = (opts.workerApiUrl || DEFAULT_WORKER_API).replace(/\/$/, '');
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000;

    this._explicitToken = opts.token || null;
    const getToken = () => {
      if (this._explicitToken) return this._explicitToken;
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(LS_KEYS.AUTH_TOKEN) || localStorage.getItem(LS_KEYS.SYNC_TOKEN) || null;
      }
      return null;
    };

    this.r2 = new ObjectStoreR2Client({ workerUrl: opts.workerUrl || DEFAULT_WORKER_URL, apiKey: opts.apiKey });

    // Backend service clients
    this.auth     = new GrudgeAuthClient(opts.idUrl || DEFAULT_ID_URL, getToken);
    this.game     = new GrudgeGameClient(opts.gameUrl || DEFAULT_GAME_URL, getToken);
    this.account  = new GrudgeAccountClient(opts.accountUrl || DEFAULT_ACCOUNT_URL, getToken);
    this.launcher = new GrudgeLauncherClient(opts.launcherUrl || DEFAULT_LAUNCHER_URL, getToken);
    this.assets   = new GrudgeAssetServiceClient(opts.assetsApiUrl || DEFAULT_ASSETS_API_URL, getToken);
    this.ai       = new GrudgeAIClient(opts.aiUrl || DEFAULT_AI_URL, getToken);
    this.ws       = new GrudgeWSClient(opts.wsUrl || DEFAULT_WS_URL, getToken);

    this.assetsCdnUrl = (opts.assetsCdnUrl || DEFAULT_ASSETS_CDN_URL).replace(/\/$/, '');
  }

  /** Update the auth token at runtime */
  setToken(token) { this._explicitToken = token; }

  /** Clear session data from localStorage */
  clearSession() { GrudgeAuthClient.clearSession(); this._explicitToken = null; }

  // ==========================================
  // OBJECTSTORE — CACHED STATIC DATA FETCHES
  // ==========================================

  async fetch(endpoint) {
    const url = `${this.baseUrl}${endpoint}`;
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) return cached.data;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
    const data = await response.json();
    this.cache.set(url, { data, timestamp: Date.now() });
    return data;
  }

  clearCache() { this.cache.clear(); }

  // ── Weapons ──
  async getWeapons() { return this.fetch('/api/v1/weapons.json'); }
  async getWeaponsByCategory(category) { const d = await this.getWeapons(); return d.categories[category] || null; }
  async getWeapon(weaponId) {
    const d = await this.getWeapons();
    for (const cat of Object.values(d.categories)) { const w = cat.items.find(w => w.id === weaponId); if (w) return w; }
    return null;
  }
  async getWeaponCategories() { return Object.keys((await this.getWeapons()).categories); }

  // ── Materials ──
  async getMaterials() { return this.fetch('/api/v1/materials.json'); }
  async getMaterialsByCategory(category) { const d = await this.getMaterials(); return d.categories[category] || null; }
  async getMaterialsByTier(tier) { const d = await this.getMaterials(); const r = []; for (const c of Object.values(d.categories)) r.push(...c.items.filter(m => m.tier === tier)); return r; }
  async getMaterialsByProfession(profession) { const d = await this.getMaterials(); const r = []; for (const c of Object.values(d.categories)) r.push(...c.items.filter(m => m.gatheredBy === profession)); return r; }

  // ── Armor ──
  async getArmor() { return this.fetch('/api/v1/armor.json'); }
  async getArmorByMaterial(material) { const d = await this.getArmor(); return d.materials[material] || null; }
  async getArmorBySlot(slot) { const d = await this.getArmor(); const r = []; for (const m of Object.values(d.materials)) r.push(...m.items.filter(i => i.type === slot)); return r.length ? r : null; }
  async getArmorBySet(setName) { const d = await this.getArmor(); const l = setName.toLowerCase(); const r = []; for (const m of Object.values(d.materials)) r.push(...m.items.filter(i => i.id.split('-')[1] === l)); return r.length ? r : null; }
  async getArmorItem(armorId) { const d = await this.getArmor(); for (const m of Object.values(d.materials)) { const i = m.items.find(i => i.id === armorId); if (i) return i; } return null; }

  // ── Consumables ──
  async getConsumables() { return this.fetch('/api/v1/consumables.json'); }
  async getConsumablesByCategory(category) { const d = await this.getConsumables(); return d.categories[category] || null; }
  async getConsumablesByProfession(profession) { const d = await this.getConsumables(); const r = {}; for (const [k, c] of Object.entries(d.categories)) { if (c.profession === profession) r[k] = c; } return Object.keys(r).length ? r : null; }

  // ── Skills ──
  async getSkills() { return this.fetch('/api/v1/skills.json'); }
  async getSkillsByWeapon(weaponType) { const d = await this.getSkills(); return d.categories[weaponType] || null; }
  async getSkill(skillId) { const d = await this.getSkills(); for (const c of Object.values(d.categories)) { const s = c.skills.find(s => s.id === skillId); if (s) return s; } return null; }

  // ── Professions ──
  async getProfessions() { return this.fetch('/api/v1/professions.json'); }
  async getProfession(professionId) { const d = await this.getProfessions(); return d.professions[professionId] || null; }

  // ── Races ──
  async getRaces() { return this.fetch('/api/v1/races.json'); }
  async getRace(raceId) { const d = await this.getRaces(); return d.races[raceId] || null; }
  async getRacesByFaction(factionId) { const d = await this.getRaces(); return Object.values(d.races).filter(r => r.faction === factionId); }

  // ── Classes ──
  async getClasses() { return this.fetch('/api/v1/classes.json'); }
  async getClass(classId) { const d = await this.getClasses(); return d.classes[classId] || null; }

  // ── Factions ──
  async getFactions() { return this.fetch('/api/v1/factions.json'); }
  async getFaction(factionId) { const d = await this.getFactions(); return d.factions[factionId] || null; }

  // ── Attributes (canonical: master-attributes.json) ──
  async getAttributes() { return this.getMasterAttributes(); }
  async getAttribute(attributeId) {
    const d = await this.getMasterAttributes();
    return d?.attributes?.find((a) => a.id === attributeId || a.abbrev === attributeId) || null;
  }

  // ── Weapon Skills (17 types, 207 skills with enhanced combat data) ──
  async getWeaponSkills() { return this.fetch('/api/v1/master-weaponSkills.json'); }
  async getWeaponSkillsByType(weaponType) {
    // Try Worker API first (filtered, cached)
    try {
      const res = await fetch(`${this._workerApi}/v1/weapon-skills/${weaponType}`);
      if (res.ok) return res.json();
    } catch { /* fall through */ }
    const d = await this.getWeaponSkills();
    const all = [...(d.weaponTypes || []), ...(d.artifactWeapons || [])];
    return all.find(wt => wt.id === weaponType.toUpperCase() || wt.name?.toLowerCase() === weaponType.toLowerCase()) || null;
  }
  async getWeaponSkillsForClass(className) {
    // Try Worker API first
    try {
      const res = await fetch(`${this._workerApi}/v1/weapon-skills?className=${className}`);
      if (res.ok) return res.json();
    } catch { /* fall through */ }
    const d = await this.getWeaponSkills();
    const allowed = d.classRestrictions?.[className] || [];
    return { className, weaponTypes: (d.weaponTypes || []).filter(wt => allowed.includes(wt.id)), classRestrictions: d.classRestrictions };
  }
  async getWeaponSkill(skillId) {
    const d = await this.getWeaponSkills();
    for (const wt of d.weaponTypes || []) {
      for (const slot of wt.slots || []) {
        const s = (slot.skills || []).find(s => s.id === skillId);
        if (s) return { ...s, weaponType: wt.id, weaponName: wt.name, slotType: slot.type };
      }
    }
    return null;
  }
  async searchWeaponSkills(query, filters = {}) {
    // Try Worker API search endpoint
    try {
      const p = new URLSearchParams();
      if (query) p.set('q', query);
      if (filters.damageType) p.set('damageType', filters.damageType);
      if (filters.slot) p.set('slot', filters.slot);
      if (filters.physics) p.set('physics', filters.physics);
      if (filters.projectile) p.set('projectile', filters.projectile);
      if (filters.limit) p.set('limit', String(filters.limit));
      const res = await fetch(`${this._workerApi}/v1/weapon-skills/search?${p}`);
      if (res.ok) return res.json();
    } catch { /* fall through */ }
    // Client-side fallback
    const d = await this.getWeaponSkills();
    const q = (query || '').toLowerCase();
    const results = [];
    for (const wt of d.weaponTypes || []) {
      for (const slot of wt.slots || []) {
        for (const skill of slot.skills || []) {
          const text = `${skill.name} ${skill.description} ${(skill.effects || []).join(' ')}`.toLowerCase();
          if (q && !text.includes(q)) continue;
          if (filters.damageType && skill.damageType !== filters.damageType) continue;
          if (filters.slot && slot.type !== filters.slot) continue;
          if (filters.physics && skill.physics !== filters.physics) continue;
          if (filters.projectile && skill.projectile !== filters.projectile) continue;
          results.push({ ...skill, weaponType: wt.id, weaponName: wt.name, slotType: slot.type });
        }
      }
    }
    return { query, count: results.length, results: results.slice(0, filters.limit || 50) };
  }
  getClassWeaponRestrictions() {
    return {
      Warrior: ['SWORD','AXE','HAMMER','SHIELD','GREATSWORD','GREATAXE','SCYTHE'],
      Mage:    ['STAFF','TOME','MACE','WAND','OFFHAND_RELIC'],
      Ranger:  ['BOW','CROSSBOW','GUN','DAGGER','GREATSWORD','SPEAR'],
      Worge:   ['STAFF','SPEAR','DAGGER','BOW','HAMMER','MACE','OFFHAND_RELIC','SCYTHE'],
    };
  }

  // ── Enemies & Bosses ──
  async getEnemies() { return this.fetch('/api/v1/enemies.json'); }
  async getEnemy(enemyId) { const d = await this.getEnemies(); return (d.enemies || []).find(e => e.id === enemyId) || null; }
  async getEnemiesByTier(tier) { const d = await this.getEnemies(); return (d.enemies || []).filter(e => e.tier === tier); }
  async getBosses() { return this.fetch('/api/v1/bosses.json'); }
  async getBoss(bossId) { const d = await this.getBosses(); return (d.bosses || []).find(b => b.id === bossId) || null; }

  // ── 2D Sprites ──
  async getSprites2d() { return this.fetch('/api/v1/sprites2d.json'); }
  async getSpritesByCategory(category) { const d = await this.getSprites2d(); return d.categories?.[category] || null; }
  async getSprites() { return this.fetch('/api/v1/sprites2d.json'); }
  async getSprite(uuid) { const d = await this.getSprites(); for (const c of Object.values(d.categories)) { const s = c.items.find(s => s.uuid === uuid); if (s) return s; } return null; }
  async searchSprites(query, opts = {}) {
    const q = (query || '').toLowerCase(); const d = await this.getSprites(); let results = [];
    for (const c of Object.values(d.categories)) results.push(...c.items);
    if (opts.category) results = results.filter(s => s.category === opts.category);
    if (q) results = results.filter(s => s.name?.toLowerCase().includes(q) || (s.category || '').includes(q) || (s.uuid || '').toLowerCase().includes(q) || (s.subcategory || '').includes(q));
    return results.slice(0, opts.limit || 50);
  }

  // ── VFX ──
  async getEffectSprites() { return this.fetch('/api/v1/effectSprites.json'); }
  async getAbilityEffects() { return this.fetch('/api/v1/abilityEffects.json'); }
  async getFactionUnits() { return this.fetch('/api/v1/factionUnits.json'); }

  // ── Characters (sprite-characters) ──
  async getCharacters(opts = {}) { const d = await this.fetch('/api/v1/sprite-characters.json'); let ch = d.characters || []; if (opts.category) ch = ch.filter(c => c.category === opts.category); return ch; }
  async getCharacter(uuid) { const d = await this.fetch('/api/v1/sprite-characters.json'); return (d.characters || []).find(c => c.uuid === uuid) || null; }
  async getAnimationUrl(charUuid, animName) { const ch = await this.getCharacter(charUuid); if (!ch) return null; const a = ch.animations.find(a => a.name === animName || a.id === animName); return a ? `${this.baseUrl}${a.path}` : null; }

  // ── Quests & Missions (v3) ──
  async getQuests() { return this.fetch('/api/v1/quests.json'); }
  async getQuestsForZone(zoneId) { const d = await this.getQuests(); return d.zoneQuests[zoneId] || []; }
  async getMissions() { return this.fetch('/api/v1/missions.json'); }
  async getDialogue() { return this.fetch('/api/v1/dialogue.json'); }
  async getCutscenes() { return this.fetch('/api/v1/cutscenes.json'); }
  async getRandomEvents() { return this.fetch('/api/v1/randomEvents.json'); }

  // ── World & Combat Data (v3) ──
  async getWorldMap() { return this.fetch('/api/v1/worldMap.json'); }
  async getRegions() { return this.fetch('/api/v1/regions.json'); }
  async getBattleFormations() { return this.fetch('/api/v1/battleFormations.json'); }
  async getEquipment() { return this.fetch('/api/v1/equipment.json'); }
  async getSkillTrees() { return this.fetch('/api/v1/master-skillTrees.json'); }
  async getGameDataManifest() { return this.fetch('/api/v1/game-data-manifest.json'); }
  async getMasterHarvestNodes() { return this.fetch('/api/v1/master-harvest-nodes.json'); }
  async getMasterProfessions() { return this.fetch('/api/v1/master-professions.json'); }
  async getMasterProfessionTrees() { return this.fetch('/api/v1/master-professionTrees.json'); }
  async getEnemyTemplates() { return this.fetch('/api/v1/enemyTemplates.json'); }
  async getLore() { return this.fetch('/api/v1/lore.json'); }

  // ── Media Assets (v3) ──
  async getAudioRegistry() { return this.fetch('/api/v1/audio.json'); }
  async getVideoRegistry() { return this.fetch('/api/v1/video.json'); }
  async getHeroesRegistry() { return this.fetch('/api/v1/heroes.json'); }
  async getModels3d() { return this.fetch('/api/v1/models3d.json'); }
  /** Grudge Armada fleet packs (units, vehicles, environments) on assets.grudge-studio.com */
  async getGrudgeArmada() { return this.fetch('/api/v1/grudge-armada.json'); }
  async getStudioManifest() { return this.fetch('/api/v1/studio.json'); }
  async getAnimations() { return this.fetch('/api/v1/animations.json'); }
  async getEntities() { return this.fetch('/api/v1/entities.json'); }

  // ── glTF Pipeline (optimized 3D assets) ──

  /** Get the glTF manifest with checksums for all optimized GLBs. */
  async getGltfManifest() { return this.fetch('/api/v1/gltf-manifest.json'); }

  /** Get BabylonJS-ready effect definitions (particle configs per texture). */
  async getEffectDefinitions() { return this.fetch('/api/v1/effect-definitions.json'); }

  /** Get animation clip registry (GLB retargeting files). */
  async getAnimationsGltf() { return this.fetch('/api/v1/animations-gltf.json'); }

  /**
   * Find a specific optimized 3D model by name.
   * @param {string} name - Model name (e.g. "cantina", "barracks", "xwing")
   * @returns {Promise<object|null>} Model entry with path, checksum, compression info
   */
  async getModel(name) {
    const d = await this.getModels3d();
    const q = name.toLowerCase();
    return (d.models || []).find(m =>
      m.name.toLowerCase().includes(q) || m.path.toLowerCase().includes(q)
    ) || null;
  }

  /**
   * Get a specific effect definition by id (e.g. "portals/arpg-effects_portal").
   * @param {string} effectId - Effect id (category/basename)
   * @returns {Promise<object|null>} Effect with texture path + BabylonJS config
   */
  async getEffect(effectId) {
    const d = await this.getEffectDefinitions();
    return (d.effects || []).find(e => e.id === effectId) || null;
  }

  /**
   * Get the full CDN URL for an optimized model GLB.
   * Tries R2 CDN first, falls back to GitHub Pages static path.
   * @param {string} modelPath - Relative model path from models3d.json
   * @returns {string} Absolute URL to the GLB file
   */
  getModelUrl(modelPath) {
    // Prefer R2/CDN for binary assets
    if (this.assetsCdnUrl && this.assetsCdnUrl !== 'https://assets.grudge-studio.com') {
      return `${this.assetsCdnUrl}/${modelPath}`;
    }
    return `${this.baseUrl}/${modelPath}`;
  }

  /**
   * Get the full CDN URL for an effect texture.
   * @param {string} texturePath - Relative texture path from effect-definitions.json
   * @returns {string} Absolute URL to the texture
   */
  getEffectTextureUrl(texturePath) {
    return `${this.baseUrl}/${texturePath}`;
  }

  /**
   * Load a complete effect config ready for BabylonJS ParticleSystem.
   * Returns the BabylonJS params + resolved texture URL + atlas info.
   * @param {string} effectId - Effect id (e.g. "fire/arpg-effects_fire_16x4")
   * @returns {Promise<object|null>} { textureUrl, atlas, babylonjs, category, pack }
   */
  async loadEffectConfig(effectId) {
    const effect = await this.getEffect(effectId);
    if (!effect) return null;
    return {
      textureUrl: this.getEffectTextureUrl(effect.texture),
      atlas: effect.atlas,
      width: effect.width,
      height: effect.height,
      category: effect.category,
      pack: effect.pack,
      ...effect.babylonjs,
    };
  }

  /**
   * Search optimized 3D models by name, category, or compression type.
   * @param {string} query - Search text
   * @param {object} [opts] - { category, compression, limit }
   * @returns {Promise<object[]>} Matching model entries with full URLs
   */
  async searchModels(query, opts = {}) {
    const d = await this.getModels3d();
    const q = (query || '').toLowerCase();
    let results = d.models || [];
    if (q) results = results.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.path.toLowerCase().includes(q)
    );
    if (opts.category) results = results.filter(m => m.category === opts.category);
    if (opts.compression) results = results.filter(m => m.compressionType === opts.compression);
    return results.slice(0, opts.limit || 50).map(m => ({
      ...m,
      url: this.getModelUrl(m.path),
    }));
  }

  /**
   * Search effects by name, category, pack, or tags.
   * @param {string} query - Search text
   * @param {object} [opts] - { category, pack, limit }
   * @returns {Promise<object[]>} Matching effects with resolved texture URLs
   */
  async searchEffects(query, opts = {}) {
    const d = await this.getEffectDefinitions();
    const q = (query || '').toLowerCase();
    let results = d.effects || [];
    if (q) results = results.filter(e =>
      e.id.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.pack.toLowerCase().includes(q)
    );
    if (opts.category) results = results.filter(e => e.category === opts.category);
    if (opts.pack) results = results.filter(e => e.pack === opts.pack);
    return results.slice(0, opts.limit || 50).map(e => ({
      ...e,
      textureUrl: this.getEffectTextureUrl(e.texture),
    }));
  }

  /**
   * Get all available effect categories with counts and default BabylonJS configs.
   * @returns {Promise<object[]>} [{ id, count, defaults }]
   */
  async getEffectCategories() {
    const d = await this.getEffectDefinitions();
    return d.categories || [];
  }

  /**
   * Search animation clips by name or weapon type.
   * @param {string} query - Search text
   * @param {object} [opts] - { weaponType, limit }
   * @returns {Promise<object[]>} Matching animation entries with full URLs
   */
  async searchAnimationClips(query, opts = {}) {
    const d = await this.getAnimationsGltf();
    const q = (query || '').toLowerCase();
    let results = d.animations || [];
    if (q) results = results.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.weaponType.toLowerCase().includes(q)
    );
    if (opts.weaponType) results = results.filter(a => a.weaponType === opts.weaponType);
    return results.slice(0, opts.limit || 50).map(a => ({
      ...a,
      url: this.getModelUrl(a.path),
    }));
  }

  // ── Game Data API (Worker) — generic collection access ──
  async listGameDataCollections() {
    try {
      const res = await fetch(`${this._workerApi}/v1/game-data`);
      if (res.ok) return res.json();
    } catch { /* fall through */ }
    return null;
  }
  async getGameData(name) {
    try {
      const res = await fetch(`${this._workerApi}/v1/game-data/${name}`);
      if (res.ok) return res.json();
    } catch { /* fall through */ }
    return this.fetch(`/api/v1/${name}.json`);
  }

  // ── Worker Health ──
  async getWorkerHealth() {
    try {
      const res = await fetch(`${this._workerApi}/health`);
      if (res.ok) return res.json();
    } catch { /* fall through */ }
    return null;
  }

  // ── Serverless API ──
  async serverlessSearch(query, type = 'all', limit = 50) { return this.fetch(`/api/search?${new URLSearchParams({ q: query, type, limit: String(limit) })}`); }
  async getServerlessStats() { return this.fetch('/api/stats'); }

  // ── Icons ──
  async getIcons() { return this.fetch('/icons/icon-index.json'); }
  getWeaponIconUrl(category, index, tier = 1) {
    const cfgs = { swords: { base: 'Sword', max: 40 }, axes1h: { base: 'Axe', max: 30 }, daggers: { base: 'Dagger', max: 30 }, bows: { base: 'Bow', max: 30 }, crossbows: { base: 'Crossbow', max: 30 }, hammers1h: { base: 'Hammer', max: 25 }, spears: { base: 'Spear', max: 30 }, fireStaves: { base: 'staff', max: 60, lowercase: true }, frostStaves: { base: 'staff', max: 60, lowercase: true, offset: 10 }, holyStaves: { base: 'staff', max: 60, lowercase: true, offset: 20 } };
    const c = cfgs[category]; if (!c) return null;
    const idx = ((index + (c.offset || 0) + (tier - 1) * 3) % c.max) + 1;
    const suffix = c.lowercase ? `${idx}.png` : `${String(idx).padStart(2, '0')}.png`;
    return `${this.baseUrl}/icons/weapons/${c.base}_${suffix}`;
  }
  getArmorIconUrl(slot, tier = 1) {
    const b = { helm: 'Helm', chest: 'Chest', boots: 'Boots', gloves: 'Gloves', pants: 'Pants', belt: 'Belt', shoulder: 'Shoulder', bracer: 'Bracer', ring: 'Ring', necklace: 'necklace', back: 'Back' }[slot];
    return b ? `${this.baseUrl}/icons/armor/${b}_${String(tier * 5).padStart(2, '0')}.png` : null;
  }
  getMaterialIconUrl(category, tier = 1) {
    const b = ['essence', 'gem', 'infusion'].includes(category) ? 'Loot' : 'Res';
    return `${this.baseUrl}/icons/resources/${b}_${String(tier * 5).padStart(2, '0')}.png`;
  }

  // ── Search ──
  async search(query) {
    const lower = query.toLowerCase();
    const results = { weapons: [], armor: [], materials: [], consumables: [], skills: [], races: [], classes: [] };
    const [weapons, armor, materials, consumables, skills, races, classes] = await Promise.all([
      this.getWeapons(), this.getArmor(), this.getMaterials(), this.getConsumables(), this.getSkills(), this.getRaces(), this.getClasses(),
    ]);
    for (const [cat, data] of Object.entries(weapons.categories)) results.weapons.push(...data.items.filter(w => w.name.toLowerCase().includes(lower) || w.id.includes(lower)).map(w => ({ ...w, category: cat })));
    for (const [mat, data] of Object.entries(armor.materials)) results.armor.push(...data.items.filter(a => a.name.toLowerCase().includes(lower) || a.id.includes(lower)).map(a => ({ ...a, materialCategory: mat })));
    for (const [cat, data] of Object.entries(materials.categories)) results.materials.push(...data.items.filter(m => m.name.toLowerCase().includes(lower) || m.id.includes(lower)).map(m => ({ ...m, category: cat })));
    for (const [cat, data] of Object.entries(consumables.categories)) results.consumables.push(...data.items.filter(c => c.name.toLowerCase().includes(lower)).map(c => ({ ...c, category: cat })));
    for (const [cat, data] of Object.entries(skills.categories)) results.skills.push(...data.skills.filter(s => s.name.toLowerCase().includes(lower) || s.id.includes(lower)).map(s => ({ ...s, weaponType: cat })));
    results.races.push(...Object.values(races.races).filter(r => r.name.toLowerCase().includes(lower) || r.id.includes(lower) || r.trait.toLowerCase().includes(lower)));
    results.classes.push(...Object.values(classes.classes).filter(c => c.name.toLowerCase().includes(lower) || c.id.includes(lower)));
    return results;
  }

  // ── R2 Storage Convenience ──
  async upload3DModel(file, meta = {}) { return this.r2.upload3DModel(file, meta); }
  getModelFileUrl(key) { return this.r2.getModelFileUrl(key); }
  async list3DModels(query = {}) { return this.r2.list3DModels(query); }
  async uploadAsset(file, meta = {}) { return this.r2.uploadAsset(file, meta); }

  // ── Master registry / items accessor (one-truth API) ──
  async getMasterRegistry() { return this.fetch('/api/v1/master-registry.json'); }
  async getMasterItems()      { return this.fetch('/api/v1/master-items.json'); }
  async getMasterRecipes()    { return this.fetch('/api/v1/master-recipes.json'); }
  async getMasterMaterials()  { return this.fetch('/api/v1/master-materials.json'); }
  /** Runtime weapon + harvest tool prefabs (ITEM-* + SKIL-*) — use for games */
  async getWeaponPrefabs()    { return this.fetch('/api/v1/master-weapon-prefabs.json'); }
  async getT0Weapons()          { return this.fetch('/api/v1/t0-weapons.json'); }
  async getGamesLibrary()       { return this.fetch('/api/v1/games-library.json'); }
  async getUmmorpgBridge()      { return this.fetch('/api/v1/ummorpg-systems-bridge.json'); }
  async getCanonicalEquipment() { return this.fetch('/api/v1/_meta/canonical-equipment-pattern.json'); }
  async getHarvestNodes()       { return this.fetch('/api/v1/master-harvest-nodes.json'); }
  async getMasterAttributes()   { return this.fetch('/api/v1/master-attributes.json'); }
  async getWeaponStatBridge()   { return this.fetch('/api/v1/weapon-stat-bridge.json'); }
  async getArchiveManifest()    { return this.fetch('/api/v1/archive/manifest.json'); }
  async getCanonicalItemsManifest() { return this.fetch('/api/v1/canonical-items-manifest.json'); }
  async getMasterArtifacts()  { return this.fetch('/api/v1/master-artifacts.json'); }
  /** Resolve a single item/artifact by uuid, slug, or base name. */
  async getItemByIdOrUuid(idOrUuid) {
    const [prefabs, items, artifacts] = await Promise.all([
      this.getWeaponPrefabs().catch(() => ({ prefabs: [] })),
      this.getMasterItems(),
      this.getMasterArtifacts().catch(() => ({})),
    ]);
    const fromPrefab = (prefabs?.prefabs || []).find((p) =>
      p.uuid === idOrUuid || p.id === idOrUuid
      || (p.name && p.name.toLowerCase() === String(idOrUuid).toLowerCase()),
    );
    if (fromPrefab) return { ...fromPrefab, type: 'weapon', source: 'prefab' };
    const mats = await this.getMasterMaterials().catch(() => ({ materials: [] }));
    const haystacks = [
      ...(items?.items || []),
      ...(artifacts?.artifacts || []),
      ...(mats?.materials || []),
    ];
    const key = (idOrUuid || '').toLowerCase();
    return haystacks.find(i =>
      i.uuid === idOrUuid ||
      (i.slug && i.slug.toLowerCase() === key) ||
      (i.baseName && i.baseName.toLowerCase() === key) ||
      (i.name && i.name.toLowerCase() === key)
    ) || null;
  }
  /** All items (tier-1 base rows) in a given category, excluding undiscovered artifacts for player surfaces. */
  async getItemsByCategory(category, { includeHiddenArtifacts = false } = {}) {
    const [items, artifacts] = await Promise.all([this.getMasterItems(), this.getMasterArtifacts().catch(() => ({}))]);
    const out = (items?.items || []).filter(i => i.category === category && (i.tier === 1 || i.tier == null));
    if (category === 'artifact') {
      const arts = (artifacts?.artifacts || []).filter(a => includeHiddenArtifacts || !a.discovery?.hiddenUntilFound);
      out.push(...arts);
    }
    return out;
  }
  /** Filter an array of artifact records for player-facing UIs (honors hiddenUntilFound). */
  static filterDiscoveredArtifacts(list, discoveredUuids = new Set()) {
    return (list || []).filter(a => !a.discovery?.hiddenUntilFound || discoveredUuids.has(a.uuid));
  }

  // ── Tier System ──
  static getTierColor(tier) { return TIER_COLORS[tier] || null; }
  static get TIER_COLORS() { return { ...TIER_COLORS }; }

  // ── UUID Utilities ──
  static generateGrudgeUuid(entityType, metadata) { return generateGrudgeUuid(entityType, metadata); }
  static parseGrudgeUuid(uuid) { return parseGrudgeUuid(uuid); }
  static isValidGrudgeUuid(uuid) { return isValidGrudgeUuid(uuid); }
  static get PREFIX_MAP() { return { ...PREFIX_MAP }; }
  static get LS_KEYS() { return { ...LS_KEYS }; }

  // ── Database / Infrastructure Info ──
  getDatabaseInfo() {
    return {
      provider: 'Self-hosted VPS (Docker + Coolify)',
      database: 'MySQL 8.0',
      cache: 'Redis 7',
      vps: '74.208.155.229',
      schemas: {
        users: ['users', 'sessions', 'character_wallets'],
        game: ['characters', 'gold_transactions', 'crafting_recipes', 'crafting_queue', 'combat_log', 'island_state', 'missions', 'crews', 'crew_members'],
      },
      services: {
        identity: DEFAULT_ID_URL, gameApi: DEFAULT_GAME_URL, accountApi: DEFAULT_ACCOUNT_URL,
        launcherApi: DEFAULT_LAUNCHER_URL, wsService: DEFAULT_WS_URL, assetService: DEFAULT_ASSETS_API_URL,
        assetsCdn: DEFAULT_ASSETS_CDN_URL, status: DEFAULT_STATUS_URL,
      },
      objectStore: {
        weapons: `${this.baseUrl}/api/v1/weapons.json`, armor: `${this.baseUrl}/api/v1/armor.json`,
        materials: `${this.baseUrl}/api/v1/materials.json`, consumables: `${this.baseUrl}/api/v1/consumables.json`,
        skills: `${this.baseUrl}/api/v1/skills.json`, weaponSkills: `${this.baseUrl}/api/v1/master-weaponSkills.json`,
        professions: `${this.baseUrl}/api/v1/professions.json`, races: `${this.baseUrl}/api/v1/races.json`,
        classes: `${this.baseUrl}/api/v1/classes.json`, factions: `${this.baseUrl}/api/v1/factions.json`,
        attributes: `${this.baseUrl}/api/v1/master-attributes.json`, enemies: `${this.baseUrl}/api/v1/enemies.json`,
        gamesLibrary: `${this.baseUrl}/api/v1/games-library.json`,
        weaponStatBridge: `${this.baseUrl}/api/v1/weapon-stat-bridge.json`,
        archive: `${this.baseUrl}/api/v1/archive/manifest.json`,
        bosses: `${this.baseUrl}/api/v1/bosses.json`,
      },
      gltfPipeline: {
        models3d: `${this.baseUrl}/api/v1/models3d.json`,
        gltfManifest: `${this.baseUrl}/api/v1/gltf-manifest.json`,
        effectDefinitions: `${this.baseUrl}/api/v1/effect-definitions.json`,
        animationsGltf: `${this.baseUrl}/api/v1/animations-gltf.json`,
      },
      r2Worker: { base: this.r2.workerUrl, assets: `${this.r2.workerUrl}/v1/assets`, health: `${this.r2.workerUrl}/v1/health` },
      workerApi: {
        base: this._workerApi,
        gameData: `${this._workerApi}/v1/game-data`,
        weaponSkills: `${this._workerApi}/v1/weapon-skills`,
        health: `${this._workerApi}/health`,
      },
      browsers: {
        itemDatabase: `${this.baseUrl}/GRUDGE_Item_Database.html`, spriteDatabase: `${this.baseUrl}/SPRITE_DATABASE.html`,
        vfxBrowser: `${this.baseUrl}/VFX_BROWSER.html`, weaponSkills: `${this.baseUrl}/WEAPON_SKILLS.html`,
        brand: `${this.baseUrl}/brand.html`, admin: `${this.baseUrl}/admin.html`,
      },
      docs: `${this.baseUrl}/docs/`,
    };
  }
}

// ==========================================
// MODULE EXPORTS
// ==========================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GrudgeSDK, ObjectStoreR2Client,
    GrudgeAuthClient, GrudgeGameClient, GrudgeAccountClient, GrudgeLauncherClient,
    GrudgeAssetServiceClient, GrudgeWSClient,
    generateGrudgeUuid, parseGrudgeUuid, isValidGrudgeUuid,
    PREFIX_MAP, TIER_COLORS, LS_KEYS,
  };
} else if (typeof window !== 'undefined') {
  window.GrudgeSDK = GrudgeSDK;
  window.ObjectStoreR2Client = ObjectStoreR2Client;
  window.GrudgeAuthClient = GrudgeAuthClient;
  window.GrudgeGameClient = GrudgeGameClient;
  window.GrudgeAccountClient = GrudgeAccountClient;
  window.GrudgeLauncherClient = GrudgeLauncherClient;
  window.GrudgeAssetServiceClient = GrudgeAssetServiceClient;
  window.GrudgeWSClient = GrudgeWSClient;
  window.generateGrudgeUuid = generateGrudgeUuid;
  window.parseGrudgeUuid = parseGrudgeUuid;
  window.isValidGrudgeUuid = isValidGrudgeUuid;
  window.PREFIX_MAP = PREFIX_MAP;
  window.TIER_COLORS = TIER_COLORS;
  window.LS_KEYS = LS_KEYS;
}

export {
  GrudgeSDK, ObjectStoreR2Client,
  GrudgeAuthClient, GrudgeGameClient, GrudgeAccountClient, GrudgeLauncherClient,
  GrudgeAssetServiceClient, GrudgeWSClient,
  generateGrudgeUuid, parseGrudgeUuid, isValidGrudgeUuid,
  PREFIX_MAP, TIER_COLORS, LS_KEYS,
};

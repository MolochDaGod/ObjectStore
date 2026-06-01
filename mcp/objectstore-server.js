#!/usr/bin/env node
/**
 * ObjectStore MCP Server
 * Exposes Grudge Studio game data as tools for AI agents.
 * Protocol: stdio (JSON-RPC over stdin/stdout)
 */

const BASE_URL = 'https://objectstore.grudge-studio.com';

async function fetchJSON(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}: ${res.status}`);
  return res.json();
}

const TOOLS = [
  {
    name: 'search_game_data',
    description: 'Search across all Grudge Warlords game data (weapons, armor, materials, enemies, bosses, skills, sprites)',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        type: { type: 'string', enum: ['all', 'weapons', 'armor', 'materials', 'consumables', 'enemies', 'bosses', 'skills', 'sprites'], default: 'all' },
        limit: { type: 'number', default: 20, description: 'Max results' }
      },
      required: ['query']
    }
  },
  {
    name: 'get_weapon',
    description: 'Get a specific weapon by ID or list all weapons in a category',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Weapon ID (e.g. "sword-bloodfeud")' },
        category: { type: 'string', description: 'Category to list (e.g. "swords", "bows")' }
      }
    }
  },
  {
    name: 'get_armor',
    description: 'Get armor items by material, slot, or set name',
    inputSchema: {
      type: 'object',
      properties: {
        material: { type: 'string', description: 'Material type (cloth, leather, metal, gem)' },
        slot: { type: 'string', description: 'Armor slot (Helm, Chest, Hands, Feet, etc.)' },
        set: { type: 'string', description: 'Set name (e.g. "Bloodfeud")' }
      }
    }
  },
  {
    name: 'get_enemies',
    description: 'Get enemies, optionally filtered by tier',
    inputSchema: {
      type: 'object',
      properties: {
        tier: { type: 'number', description: 'Filter by tier (1-8)' },
        id: { type: 'string', description: 'Specific enemy ID' }
      }
    }
  },
  {
    name: 'get_sprite',
    description: 'Search for 2D sprite assets by name or category',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query for sprite name' },
        category: { type: 'string', description: 'Category filter (characters, enemies, bosses, icons, backgrounds, etc.)' }
      },
      required: ['query']
    }
  },
  {
    name: 'get_stats',
    description: 'Get aggregate statistics for all ObjectStore data',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'get_classes',
    description: 'Get game classes and races data',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['classes', 'races', 'factions'], default: 'classes' }
      }
    }
  }
];

async function handleTool(name, args) {
  switch (name) {
    case 'search_game_data': {
      const data = await fetchJSON('/api/v1/weapons.json');
      const q = (args.query || '').toLowerCase();
      const results = [];
      for (const [cat, catData] of Object.entries(data.categories || {})) {
        for (const item of catData.items || []) {
          if (item.name?.toLowerCase().includes(q) || item.id?.includes(q) || item.lore?.toLowerCase().includes(q)) {
            results.push({ type: 'weapon', category: cat, id: item.id, name: item.name });
          }
        }
      }
      if (args.type === 'all' || args.type === 'enemies') {
        const enemies = await fetchJSON('/api/v1/enemies.json');
        for (const e of enemies.enemies || []) {
          if (e.name?.toLowerCase().includes(q) || e.id?.includes(q)) {
            results.push({ type: 'enemy', id: e.id, name: e.name, tier: e.tier });
          }
        }
      }
      return results.slice(0, args.limit || 20);
    }
    case 'get_weapon': {
      const data = await fetchJSON('/api/v1/weapons.json');
      if (args.id) {
        for (const cat of Object.values(data.categories || {})) {
          const w = (cat.items || []).find(i => i.id === args.id);
          if (w) return w;
        }
        return { error: 'Weapon not found' };
      }
      if (args.category) return data.categories[args.category] || { error: 'Category not found' };
      return { categories: Object.keys(data.categories), total: Object.values(data.categories).reduce((s, c) => s + (c.items?.length || 0), 0) };
    }
    case 'get_armor': {
      const data = await fetchJSON('/api/v1/armor.json');
      if (args.material) return data.materials?.[args.material] || { error: 'Material not found' };
      return { materials: Object.keys(data.materials || {}), totalItems: data.totalItems };
    }
    case 'get_enemies': {
      const data = await fetchJSON('/api/v1/enemies.json');
      if (args.id) return (data.enemies || []).find(e => e.id === args.id) || { error: 'Enemy not found' };
      if (args.tier) return (data.enemies || []).filter(e => e.tier === args.tier);
      return data;
    }
    case 'get_sprite': {
      const data = await fetchJSON('/api/v1/sprites2d.json');
      const q = (args.query || '').toLowerCase();
      const results = [];
      for (const [cat, catData] of Object.entries(data.categories || {})) {
        if (args.category && cat !== args.category) continue;
        for (const item of catData.items || []) {
          if (item.name?.toLowerCase().includes(q) || item.path?.toLowerCase().includes(q)) {
            results.push({ category: cat, name: item.name, path: item.path, source: item.source });
          }
          if (results.length >= 30) break;
        }
        if (results.length >= 30) break;
      }
      return results;
    }
    case 'get_stats': {
      const [weapons, sprites2d] = await Promise.all([
        fetchJSON('/api/v1/weapons.json'),
        fetchJSON('/api/v1/sprites2d.json')
      ]);
      let weaponCount = 0;
      for (const cat of Object.values(weapons.categories || {})) weaponCount += (cat.items?.length || 0);
      return {
        weapons: weaponCount, sprites2d: sprites2d.totalSprites,
        spriteCategories: Object.keys(sprites2d.categories || {}),
        baseUrl: BASE_URL
      };
    }
    case 'get_classes': {
      const endpoint = args.type === 'races' ? '/api/v1/races.json' : args.type === 'factions' ? '/api/v1/factions.json' : '/api/v1/classes.json';
      return fetchJSON(endpoint);
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// JSON-RPC stdio handler
let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  buffer += chunk;
  let newlineIdx;
  while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, newlineIdx).trim();
    buffer = buffer.slice(newlineIdx + 1);
    if (line) processMessage(line);
  }
});

async function processMessage(line) {
  let msg;
  try { msg = JSON.parse(line); } catch { return; }

  const respond = (result) => {
    const resp = { jsonrpc: '2.0', id: msg.id };
    if (result instanceof Error) resp.error = { code: -32000, message: result.message };
    else resp.result = result;
    process.stdout.write(JSON.stringify(resp) + '\n');
  };

  try {
    switch (msg.method) {
      case 'initialize':
        respond({
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'objectstore', version: '1.0.0' }
        });
        break;
      case 'initialized':
        break;
      case 'tools/list':
        respond({ tools: TOOLS });
        break;
      case 'tools/call': {
        const result = await handleTool(msg.params.name, msg.params.arguments || {});
        respond({ content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] });
        break;
      }
      default:
        respond(new Error(`Unknown method: ${msg.method}`));
    }
  } catch (err) {
    respond(err);
  }
}

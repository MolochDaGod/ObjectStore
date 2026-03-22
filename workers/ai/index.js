/**
 * Grudge Studio AI Worker — Cloudflare Workers AI + R2 + D1
 *
 * Deployed at: ai.grudge-studio.com
 * Shares R2 bucket (objectstore-assets) and D1 (objectstore-meta) with the main worker.
 *
 * Routes:
 *   POST /v1/ai/describe        — Describe an asset (image → text)
 *   POST /v1/ai/generate-sprite — Generate a sprite from text prompt
 *   POST /v1/ai/generate-icon   — Generate an icon from text prompt
 *   POST /v1/ai/tag             — Auto-tag an asset using vision AI
 *   POST /v1/ai/search          — Semantic search across assets
 *   POST /v1/ai/chat            — Game agent chat (lore, balance, code, art)
 *   GET  /v1/ai/jobs/:id        — Check generation job status
 *   GET  /v1/ai/jobs             — List recent jobs
 *   GET  /health                 — Health check
 */

// ── AI Model IDs ────────────────────────────────────────────────────
const MODELS = {
  TEXT:  '@cf/meta/llama-3.1-8b-instruct',
  IMAGE: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
  EMBED: '@cf/baai/bge-base-en-v1.5',
};

// ── Game context for agent prompts ──────────────────────────────────
const GAME_CONTEXT = `You are an AI assistant for Grudge Studio, a game development studio creating "Grudge Warlords" — an MMO RPG with:
- 6 races: Human, Orc, Elf, Undead, Barbarian, Dwarf
- 4 classes: Warrior, Mage, Ranger, Worge
- 3 factions: Crusade, Legion, Fabled
- 8 tier system (T1 Common → T8 Legendary Artifact)
- 17 weapon types, 6 armor sets per type, crafting with 5 harvesting professions
- Souls-like combat with parry/dodge/block mechanics
- Pirate/medieval theme with islands, crew system, and AI companions (Gouldstones)`;

const AGENT_PROMPTS = {
  lore: `${GAME_CONTEXT}\nYou are the Lore Agent. Generate world lore, character backstories, item descriptions, and faction history consistent with the Grudge Warlords universe.`,
  balance: `${GAME_CONTEXT}\nYou are the Balance Agent. Analyze game balance, suggest stat adjustments, compare items across tiers, and ensure fair combat scaling.`,
  code: `${GAME_CONTEXT}\nYou are the Code Agent. Help with game code — JavaScript, Node.js, Three.js, Cloudflare Workers, Unity C#. Focus on practical implementations.`,
  art: `${GAME_CONTEXT}\nYou are the Art Agent. Describe visual concepts for sprites, icons, VFX, and 3D models. Give detailed art direction for pixel art and voxel styles.`,
  mission: `${GAME_CONTEXT}\nYou are the Mission Agent. Design quests, missions, boss encounters, and progression systems. Include objectives, rewards, and narrative hooks.`,
  qa: `${GAME_CONTEXT}\nYou are the QA Agent. Identify edge cases, test strategies, potential exploits, and bugs. Focus on combat, economy, and multiplayer systems.`,
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    const origin = request.headers.get('Origin') || '';

    if (method === 'OPTIONS') {
      return cors(env, new Response(null, { status: 204 }), origin);
    }

    try {
      // ── Health ───────────────────────────────────────────────
      if (url.pathname === '/health' || url.pathname === '/v1/ai/health') {
        return cors(env, json({
          status: 'ok',
          service: 'grudge-ai-worker',
          version: '1.0.0',
          models: MODELS,
          agents: Object.keys(AGENT_PROMPTS),
        }), origin);
      }

      // ── AI Routes (all POST except jobs) ────────────────────
      if (url.pathname === '/v1/ai/describe' && method === 'POST') {
        return cors(env, await handleDescribe(request, env), origin);
      }
      if (url.pathname === '/v1/ai/generate-sprite' && method === 'POST') {
        return cors(env, await handleGenerateSprite(request, env), origin);
      }
      if (url.pathname === '/v1/ai/generate-icon' && method === 'POST') {
        return cors(env, await handleGenerateIcon(request, env), origin);
      }
      if (url.pathname === '/v1/ai/tag' && method === 'POST') {
        return cors(env, await handleAutoTag(request, env), origin);
      }
      if (url.pathname === '/v1/ai/search' && method === 'POST') {
        return cors(env, await handleSemanticSearch(request, env), origin);
      }
      if (url.pathname === '/v1/ai/chat' && method === 'POST') {
        return cors(env, await handleChat(request, env), origin);
      }

      // ── Job status ──────────────────────────────────────────
      const jobMatch = url.pathname.match(/^\/v1\/ai\/jobs\/([^/]+)$/);
      if (jobMatch && method === 'GET') {
        return cors(env, await handleGetJob(jobMatch[1], env), origin);
      }
      if (url.pathname === '/v1/ai/jobs' && method === 'GET') {
        return cors(env, await handleListJobs(url, env), origin);
      }

      // ── Proxy to ObjectStore worker for asset access ────────
      if (url.pathname.startsWith('/v1/assets') || url.pathname.startsWith('/v1/models')) {
        return cors(env, await proxyToObjectStore(request, env, url), origin);
      }

      return cors(env, json({ error: 'Not found' }, 404), origin);
    } catch (err) {
      console.error('AI Worker error:', err);
      return cors(env, json({ error: 'Internal error', detail: err.message }, 500), origin);
    }
  },
};

// ════════════════════════════════════════════════════════════════════
//  HANDLERS
// ════════════════════════════════════════════════════════════════════

/** POST /v1/ai/describe — Describe an asset image using AI */
async function handleDescribe(request, env) {
  const body = await request.json();
  const { asset_id, image_url, prompt } = body;

  let imageBytes;
  if (asset_id) {
    // Load from R2
    const row = await env.DB.prepare('SELECT key, mime FROM assets WHERE id = ?').bind(asset_id).first();
    if (!row) return json({ error: 'Asset not found' }, 404);
    const obj = await env.BUCKET.get(row.key);
    if (!obj) return json({ error: 'File missing from R2' }, 404);
    imageBytes = await obj.arrayBuffer();
  } else if (image_url) {
    const res = await fetch(image_url);
    if (!res.ok) return json({ error: 'Failed to fetch image' }, 400);
    imageBytes = await res.arrayBuffer();
  } else {
    return json({ error: 'Provide asset_id or image_url' }, 400);
  }

  const imageArray = [...new Uint8Array(imageBytes)];

  const result = await env.AI.run(MODELS.TEXT, {
    messages: [
      { role: 'system', content: `${GAME_CONTEXT}\nDescribe game assets in detail for the Grudge Warlords asset library.` },
      { role: 'user', content: prompt || 'Describe this game asset — what it depicts, style, colors, and suggested use in a fantasy RPG.' },
    ],
    image: imageArray,
  });

  return json({
    description: result.response,
    model: MODELS.TEXT,
    asset_id: asset_id || null,
  });
}

/** POST /v1/ai/generate-sprite — Generate a sprite sheet from text */
async function handleGenerateSprite(request, env) {
  const body = await request.json();
  const { prompt, style, save } = body;

  if (!prompt) return json({ error: 'prompt is required' }, 400);

  const fullPrompt = `pixel art sprite sheet, ${style || '32x32 RPG character'}, ${prompt}, transparent background, game asset, retro style, clean pixels, no anti-aliasing`;

  // Generate image
  const result = await env.AI.run(MODELS.IMAGE, { prompt: fullPrompt });
  const imageBytes = new Uint8Array(await result.arrayBuffer());

  // Optionally save to R2
  let savedAsset = null;
  if (save !== false) {
    const id = crypto.randomUUID();
    const filename = `ai-sprite-${id.slice(0, 8)}.png`;
    const key = `ai-generated/sprites/${filename}`;

    await env.BUCKET.put(key, imageBytes, {
      httpMetadata: { contentType: 'image/png' },
      customMetadata: { assetId: id, category: 'ai-sprites', prompt },
    });

    await env.DB.prepare(
      `INSERT INTO assets (id, key, filename, mime, size, tags, category, visibility, metadata, owner)
       VALUES (?, ?, ?, 'image/png', ?, '["ai-generated","sprite"]', 'ai-sprites', 'public', ?, 'ai-worker')`
    ).bind(id, key, filename, imageBytes.length, JSON.stringify({ prompt, style, model: MODELS.IMAGE })).run();

    savedAsset = { id, key, filename, url: `/v1/assets/${id}/file` };

    // Log job
    await logJob(env, 'generate-sprite', prompt, savedAsset);
  }

  // Return image as base64 + metadata
  const b64 = arrayBufferToBase64(imageBytes);
  return json({
    image: `data:image/png;base64,${b64}`,
    prompt: fullPrompt,
    model: MODELS.IMAGE,
    asset: savedAsset,
  });
}

/** POST /v1/ai/generate-icon — Generate an item icon from text */
async function handleGenerateIcon(request, env) {
  const body = await request.json();
  const { prompt, tier, category, save } = body;

  if (!prompt) return json({ error: 'prompt is required' }, 400);

  const tierColors = { 1: 'bronze', 2: 'silver', 3: 'blue', 4: 'purple', 5: 'red', 6: 'orange', 7: 'gold', 8: 'shimmering gold' };
  const tierHint = tier ? `, ${tierColors[tier] || ''} glow, tier ${tier}` : '';
  const catHint = category ? `, ${category} item` : '';

  const fullPrompt = `game icon, RPG item icon, ${prompt}${catHint}${tierHint}, dark background, detailed, fantasy style, centered, single object, 64x64 icon`;

  const result = await env.AI.run(MODELS.IMAGE, { prompt: fullPrompt });
  const imageBytes = new Uint8Array(await result.arrayBuffer());

  let savedAsset = null;
  if (save !== false) {
    const id = crypto.randomUUID();
    const filename = `ai-icon-${id.slice(0, 8)}.png`;
    const key = `ai-generated/icons/${filename}`;

    await env.BUCKET.put(key, imageBytes, {
      httpMetadata: { contentType: 'image/png' },
      customMetadata: { assetId: id, category: 'ai-icons', prompt },
    });

    await env.DB.prepare(
      `INSERT INTO assets (id, key, filename, mime, size, tags, category, visibility, metadata, owner)
       VALUES (?, ?, ?, 'image/png', ?, '["ai-generated","icon"]', 'ai-icons', 'public', ?, 'ai-worker')`
    ).bind(id, key, filename, imageBytes.length, JSON.stringify({ prompt, tier, category, model: MODELS.IMAGE })).run();

    savedAsset = { id, key, filename, url: `/v1/assets/${id}/file` };
    await logJob(env, 'generate-icon', prompt, savedAsset);
  }

  const b64 = arrayBufferToBase64(imageBytes);
  return json({
    image: `data:image/png;base64,${b64}`,
    prompt: fullPrompt,
    model: MODELS.IMAGE,
    asset: savedAsset,
  });
}

/** POST /v1/ai/tag — Auto-tag an asset using text AI */
async function handleAutoTag(request, env) {
  const body = await request.json();
  const { asset_id } = body;
  if (!asset_id) return json({ error: 'asset_id is required' }, 400);

  const row = await env.DB.prepare('SELECT * FROM assets WHERE id = ?').bind(asset_id).first();
  if (!row) return json({ error: 'Asset not found' }, 404);

  const currentTags = JSON.parse(row.tags || '[]');
  const filename = row.filename || '';
  const category = row.category || '';
  const mime = row.mime || '';

  const result = await env.AI.run(MODELS.TEXT, {
    messages: [
      { role: 'system', content: `You tag game assets for a fantasy RPG asset library. Return ONLY a JSON array of lowercase tags. No explanation.` },
      { role: 'user', content: `Tag this asset:\n- Filename: ${filename}\n- Category: ${category}\n- MIME: ${mime}\n- Current tags: ${JSON.stringify(currentTags)}\n\nSuggest 3-8 relevant tags for search/filtering. Return only a JSON array.` },
    ],
  });

  let newTags;
  try {
    const cleaned = result.response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    newTags = JSON.parse(cleaned);
    if (!Array.isArray(newTags)) throw new Error('Not an array');
  } catch {
    newTags = currentTags;
  }

  // Merge with existing tags, deduplicate
  const merged = [...new Set([...currentTags, ...newTags])].map(t => t.toLowerCase());

  // Update D1
  await env.DB.prepare('UPDATE assets SET tags = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .bind(JSON.stringify(merged), asset_id).run();

  return json({ asset_id, previous_tags: currentTags, new_tags: merged, model: MODELS.TEXT });
}

/** POST /v1/ai/search — Semantic search across assets */
async function handleSemanticSearch(request, env) {
  const body = await request.json();
  const { query, category, limit } = body;
  if (!query) return json({ error: 'query is required' }, 400);

  const maxResults = Math.min(limit || 20, 100);

  // Generate embedding for the query
  const embedResult = await env.AI.run(MODELS.EMBED, { text: [query] });
  const queryEmbedding = embedResult.data?.[0];

  // Fallback to keyword search if embedding fails
  if (!queryEmbedding) {
    const where = ["visibility = 'public'"];
    const params = [];
    where.push("(filename LIKE '%' || ? || '%' OR tags LIKE '%' || ? || '%' OR category LIKE '%' || ? || '%')");
    params.push(query, query, query);
    if (category) { where.push('category = ?'); params.push(category); }
    params.push(maxResults);

    const sql = `SELECT id, key, filename, mime, size, category, tags, created_at
                 FROM assets WHERE ${where.join(' AND ')}
                 ORDER BY created_at DESC LIMIT ?`;
    const { results } = await env.DB.prepare(sql).bind(...params).all();
    return json({ results: results.map(r => ({ ...r, tags: JSON.parse(r.tags || '[]') })), method: 'keyword' });
  }

  // For now, use keyword search with AI-enhanced query expansion
  const expandResult = await env.AI.run(MODELS.TEXT, {
    messages: [
      { role: 'system', content: 'Expand this search query into 3-5 related keywords for a game asset search. Return ONLY comma-separated keywords, no explanation.' },
      { role: 'user', content: query },
    ],
  });

  const keywords = [query, ...(expandResult.response || '').split(',').map(k => k.trim()).filter(Boolean)];

  const where = ["visibility = 'public'"];
  const params = [];
  const keywordClauses = keywords.slice(0, 5).map(() => "(filename LIKE '%' || ? || '%' OR tags LIKE '%' || ? || '%')");
  where.push(`(${keywordClauses.join(' OR ')})`);
  keywords.slice(0, 5).forEach(k => { params.push(k, k); });
  if (category) { where.push('category = ?'); params.push(category); }
  params.push(maxResults);

  const sql = `SELECT id, key, filename, mime, size, category, tags, created_at
               FROM assets WHERE ${where.join(' AND ')}
               ORDER BY created_at DESC LIMIT ?`;
  const { results } = await env.DB.prepare(sql).bind(...params).all();

  return json({
    results: results.map(r => ({ ...r, tags: JSON.parse(r.tags || '[]') })),
    expanded_keywords: keywords,
    method: 'semantic-keyword',
  });
}

/** POST /v1/ai/chat — Game agent chat */
async function handleChat(request, env) {
  const body = await request.json();
  const { agent, messages, prompt, context } = body;

  const agentType = agent || 'lore';
  const systemPrompt = AGENT_PROMPTS[agentType] || AGENT_PROMPTS.lore;

  // Build message history
  const chatMessages = [{ role: 'system', content: systemPrompt }];

  if (context) {
    chatMessages.push({ role: 'system', content: `Additional context: ${JSON.stringify(context)}` });
  }

  if (messages && Array.isArray(messages)) {
    chatMessages.push(...messages);
  } else if (prompt) {
    chatMessages.push({ role: 'user', content: prompt });
  } else {
    return json({ error: 'Provide prompt or messages array' }, 400);
  }

  const result = await env.AI.run(MODELS.TEXT, { messages: chatMessages });

  return json({
    agent: agentType,
    response: result.response,
    model: MODELS.TEXT,
  });
}

/** GET /v1/ai/jobs/:id — Job status */
async function handleGetJob(id, env) {
  const row = await env.DB.prepare('SELECT * FROM ai_jobs WHERE id = ?').bind(id).first();
  if (!row) return json({ error: 'Job not found' }, 404);
  row.result = JSON.parse(row.result || '{}');
  return json(row);
}

/** GET /v1/ai/jobs — List recent jobs */
async function handleListJobs(url, env) {
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
  const type = url.searchParams.get('type');

  let sql = 'SELECT id, type, prompt, status, created_at FROM ai_jobs';
  const params = [];
  if (type) { sql += ' WHERE type = ?'; params.push(type); }
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);

  const { results } = await env.DB.prepare(sql).bind(...params).all();
  return json({ jobs: results, count: results.length });
}

/** Proxy requests to the main ObjectStore worker */
async function proxyToObjectStore(request, env, url) {
  const objectStoreUrl = env.OBJECTSTORE_URL || 'https://objectstore.grudge-studio.com';
  const proxyUrl = `${objectStoreUrl}${url.pathname}${url.search}`;
  const res = await fetch(proxyUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' ? request.body : undefined,
  });
  return new Response(res.body, { status: res.status, headers: res.headers });
}

// ════════════════════════════════════════════════════════════════════
//  UTILITIES
// ════════════════════════════════════════════════════════════════════

async function logJob(env, type, prompt, result) {
  const id = crypto.randomUUID();
  try {
    await env.DB.prepare(
      `INSERT INTO ai_jobs (id, type, prompt, status, result) VALUES (?, ?, ?, 'complete', ?)`
    ).bind(id, type, prompt, JSON.stringify(result)).run();
  } catch { /* table may not exist yet */ }
  return id;
}

function cors(env, response, origin = '') {
  const allowed = (env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim());
  const headers = new Headers(response.headers);
  let o = '*';
  if (!allowed.includes('*') && origin) {
    if (allowed.some(a => origin === a || origin.endsWith(a.replace(/^https?:\/\//, '')))) o = origin;
    else if (allowed.length) o = allowed[0];
  }
  headers.set('Access-Control-Allow-Origin', o);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization');
  headers.set('Access-Control-Max-Age', '86400');
  if (o !== '*') headers.set('Vary', 'Origin');
  return new Response(response.body, { status: response.status, headers });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

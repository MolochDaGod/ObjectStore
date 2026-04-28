/**
 * Grudge AI Hub — Cloudflare Workers AI + R2 + D1 + KV
 *
 * Deployed at: ai.grudge-studio.com
 * Worker name: grudge-ai-hub
 *
 * Bindings:
 *   env.AI             — Cloudflare Workers AI
 *   env.DB             — D1 database (ai-specific: ai_jobs, ai_cache)
 *   env.BUCKET         — R2 bucket (objectstore-assets, shared with main ObjectStore worker)
 *   env.KV             — KV namespace (rate limit counters, response cache)
 *   env.OBJECTSTORE_DB — D1 database (objectstore-meta, for asset metadata queries)
 *
 * Routes:
 *   GET  /health                   — Health + binding status
 *   POST /v1/ai/chat               — Game agent chat (6 agents)
 *   POST /v1/ai/generate-sprite    — Text to sprite, saved to R2
 *   POST /v1/ai/generate-icon      — Text to icon, saved to R2
 *   POST /v1/ai/describe           — Image to text description
 *   POST /v1/ai/tag                — Auto-tag an R2 asset
 *   POST /v1/ai/search             — Semantic search across assets
 *   GET  /v1/ai/agents             — List available agents
 *   GET  /v1/ai/models             — List available AI models
 *   GET  /v1/ai/jobs               — List recent jobs
 *   GET  /v1/ai/jobs/:id           — Get job status
 *   POST /v1/ai/vps/:action        — Proxy to VPS AI agent backend
 *   *    /v1/assets/*              — Proxy to ObjectStore worker
 */

const VERSION = '2.0.0';

const MODELS = {
  TEXT:  '@cf/meta/llama-3.1-8b-instruct',
  IMAGE: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
  EMBED: '@cf/baai/bge-base-en-v1.5',
};

const GAME_CONTEXT = `You are an AI assistant for Grudge Studio, creating "Grudge Warlords" — an MMO RPG:
- 6 races: Human, Orc, Elf, Undead, Barbarian, Dwarf
- 4 classes: Warrior (stamina/parry), Mage (teleport blocks), Ranger (parry counter), Worge (3 forms: Bear/Raptor/Bird)
- 3 factions: Crusade, Legion, Fabled
- 8 tier system: T1 Common (bronze) to T8 Legendary Artifact (shimmer gold)
- 17 weapon types, 6 armor sets per material, crafting with 5 harvesting professions
- Souls-like combat: parry/dodge/block, stamina, perfect timing bonuses
- Pirate/medieval islands, crew system (3-5 members), AI companions (Gouldstones, max 15)
- Permadeath for AI crews, daily rotation at 11pm CST`;

const AGENTS = {
  lore:    { name: 'Lore Agent',    desc: 'World lore, backstories, item descriptions, faction history',       prompt: GAME_CONTEXT + '\nYou are the Lore Agent. Generate world lore, character backstories, item descriptions, and faction history consistent with the Grudge Warlords universe. Be creative but consistent.' },
  balance: { name: 'Balance Agent', desc: 'Stat analysis, tier scaling, economy balance, combat fairness',     prompt: GAME_CONTEXT + '\nYou are the Balance Agent. Analyze game balance, suggest stat adjustments, compare items across tiers. Use numbers and formulas. Be precise.' },
  code:    { name: 'Code Agent',    desc: 'JavaScript, Node.js, Three.js, Workers, Unity C# implementations',  prompt: GAME_CONTEXT + '\nYou are the Code Agent. Help with game code — JavaScript, Node.js, Three.js, Cloudflare Workers, Unity C#. Write practical, working code.' },
  art:     { name: 'Art Agent',     desc: 'Sprite concepts, icon design, VFX direction, voxel/pixel art',      prompt: GAME_CONTEXT + '\nYou are the Art Agent. Describe visual concepts for sprites, icons, VFX, and 3D models. Give detailed art direction for pixel art and voxel styles.' },
  mission: { name: 'Mission Agent', desc: 'Quest design, boss encounters, progression, reward structures',      prompt: GAME_CONTEXT + '\nYou are the Mission Agent. Design quests, missions, boss encounters, and progression systems. Include objectives, rewards, and narrative hooks.' },
  qa:      { name: 'QA Agent',      desc: 'Edge cases, exploits, test strategies, combat/economy bugs',         prompt: GAME_CONTEXT + '\nYou are the QA Agent. Identify edge cases, exploits, and bugs. Focus on combat, economy, and multiplayer. Be thorough and adversarial.' },
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    const origin = request.headers.get('Origin') || '';

    if (method === 'OPTIONS') return cors(env, new Response(null, { status: 204 }), origin);

    try {
      // Public routes
      if (url.pathname === '/health' || url.pathname === '/v1/ai/health') return cors(env, await handleHealth(env), origin);
      if (url.pathname === '/v1/ai/agents' && method === 'GET') return cors(env, json({ agents: Object.entries(AGENTS).map(function(e) { return { id: e[0], name: e[1].name, desc: e[1].desc }; }) }), origin);
      if (url.pathname === '/v1/ai/models' && method === 'GET') return cors(env, json({ models: MODELS }), origin);

      // Rate limiting via KV
      if (env.KV) {
        var clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
        var apiKey = request.headers.get('X-API-Key') || (request.headers.get('Authorization') || '').replace('Bearer ', '');
        var rpm = apiKey ? parseInt(env.RATE_LIMIT_RPM_ADMIN || '300') : parseInt(env.RATE_LIMIT_RPM || '60');
        var rlKey = 'rl:' + (apiKey || clientIP) + ':' + Math.floor(Date.now() / 60000);
        var count = parseInt(await env.KV.get(rlKey) || '0');
        if (count >= rpm) return cors(env, json({ error: 'Rate limit exceeded', limit: rpm, retry_after: 60 }, 429), origin);
        await env.KV.put(rlKey, String(count + 1), { expirationTtl: 120 });
      }

      // Payload size check
      var maxPayload = parseInt(env.MAX_PAYLOAD_BYTES || '65536');
      var contentLength = parseInt(request.headers.get('Content-Length') || '0');
      if (contentLength > maxPayload) return cors(env, json({ error: 'Payload too large', max: maxPayload }, 413), origin);

      // AI routes
      if (url.pathname === '/v1/ai/chat' && method === 'POST') return cors(env, await handleChat(request, env), origin);
      if (url.pathname === '/v1/ai/generate-sprite' && method === 'POST') return cors(env, await handleGenerateSprite(request, env), origin);
      if (url.pathname === '/v1/ai/generate-icon' && method === 'POST') return cors(env, await handleGenerateIcon(request, env), origin);
      if (url.pathname === '/v1/ai/describe' && method === 'POST') return cors(env, await handleDescribe(request, env), origin);
      if (url.pathname === '/v1/ai/tag' && method === 'POST') return cors(env, await handleAutoTag(request, env), origin);
      if (url.pathname === '/v1/ai/search' && method === 'POST') return cors(env, await handleSemanticSearch(request, env), origin);

      // Jobs
      var jobMatch = url.pathname.match(/^\/v1\/ai\/jobs\/([^/]+)$/);
      if (jobMatch && method === 'GET') return cors(env, await handleGetJob(jobMatch[1], env), origin);
      if (url.pathname === '/v1/ai/jobs' && method === 'GET') return cors(env, await handleListJobs(url, env), origin);

      // VPS proxy
      var vpsMatch = url.pathname.match(/^\/v1\/ai\/vps\/(.+)$/);
      if (vpsMatch && method === 'POST') return cors(env, await handleVpsProxy(request, env, vpsMatch[1]), origin);

      // ObjectStore proxy
      if (url.pathname.startsWith('/v1/assets') || url.pathname.startsWith('/v1/models')) {
        return cors(env, await proxyToObjectStore(request, env, url), origin);
      }

      return cors(env, json({ error: 'Not found' }, 404), origin);
    } catch (err) {
      console.error('AI Hub error:', err);
      return cors(env, json({ error: 'Internal error', detail: err.message }, 500), origin);
    }
  },
};

// ── Health ──────────────────────────────────────────────────────────

async function handleHealth(env) {
  var status = {
    status: 'ok', service: 'grudge-ai-hub', version: VERSION,
    environment: env.ENVIRONMENT || 'production',
    models: MODELS, agents: Object.keys(AGENTS),
    bindings: { ai: !!env.AI, r2: !!env.BUCKET, d1: !!env.DB, d1_objectstore: !!env.OBJECTSTORE_DB, kv: !!env.KV, vps: !!env.VPS_AI_AGENT_URL },
    providers: { workers_ai: env.AI ? 'available' : 'unavailable', vps_ai_agent: env.VPS_AI_AGENT_URL ? 'configured' : 'not configured', r2_storage: env.BUCKET ? 'available' : 'unavailable' },
    timestamp: new Date().toISOString(),
  };
  if (env.VPS_AI_AGENT_URL) {
    try { var r = await fetch(env.VPS_AI_AGENT_URL + '/health', { signal: AbortSignal.timeout(3000) }); status.providers.vps_ai_agent = r.ok ? 'healthy' : 'unhealthy'; }
    catch (e) { status.providers.vps_ai_agent = 'unreachable'; }
  }
  return json(status);
}

// ── Chat ───────────────────────────────────────────────────────────

async function handleChat(request, env) {
  var body = await request.json();
  var agentType = body.agent || 'lore';
  var agentDef = AGENTS[agentType];
  if (!agentDef) return json({ error: 'Unknown agent: ' + agentType, available: Object.keys(AGENTS) }, 400);

  var msgs = [{ role: 'system', content: agentDef.prompt }];
  if (body.context) msgs.push({ role: 'system', content: 'Context: ' + JSON.stringify(body.context) });
  if (body.messages && Array.isArray(body.messages)) msgs = msgs.concat(body.messages);
  else if (body.prompt) msgs.push({ role: 'user', content: body.prompt });
  else return json({ error: 'Provide prompt or messages' }, 400);

  // KV cache
  var cacheKey = 'chat:' + agentType + ':' + JSON.stringify(msgs.slice(-1));
  if (env.KV) { var cached = await env.KV.get(cacheKey); if (cached) return json({ agent: agentType, response: cached, model: MODELS.TEXT, cached: true }); }

  var result = await env.AI.run(MODELS.TEXT, { messages: msgs });
  if (env.KV && result.response) await env.KV.put(cacheKey, result.response, { expirationTtl: 600 }).catch(function() {});
  await logJob(env, 'chat', body.prompt || '', { agent: agentType });
  return json({ agent: agentType, response: result.response, model: MODELS.TEXT });
}

// ── Generate Sprite ────────────────────────────────────────────────

async function handleGenerateSprite(request, env) {
  var body = await request.json();
  if (!body.prompt) return json({ error: 'prompt is required' }, 400);
  var fullPrompt = 'pixel art sprite sheet, ' + (body.style || '32x32 RPG character') + ', ' + body.prompt + ', transparent background, game asset, retro style, clean pixels';
  var result = await env.AI.run(MODELS.IMAGE, { prompt: fullPrompt });
  var imageBytes = new Uint8Array(await result.arrayBuffer());
  var saved = null;
  if (body.save !== false && env.BUCKET) saved = await saveToR2(env, imageBytes, 'sprites', body.prompt, { prompt: body.prompt, style: body.style }, ['ai-generated', 'sprite']);
  await logJob(env, 'generate-sprite', body.prompt, saved);
  return json({ image: 'data:image/png;base64,' + ab2b64(imageBytes), prompt: fullPrompt, model: MODELS.IMAGE, asset: saved });
}

// ── Generate Icon ──────────────────────────────────────────────────

async function handleGenerateIcon(request, env) {
  var body = await request.json();
  if (!body.prompt) return json({ error: 'prompt is required' }, 400);
  var tc = { 1:'bronze',2:'silver',3:'blue',4:'purple',5:'red',6:'orange',7:'gold',8:'shimmering gold' };
  var th = body.tier ? ', ' + (tc[body.tier]||'') + ' glow, tier ' + body.tier : '';
  var ch = body.category ? ', ' + body.category + ' item' : '';
  var fullPrompt = 'game icon, RPG item icon, ' + body.prompt + ch + th + ', dark background, fantasy style, centered, 64x64';
  var result = await env.AI.run(MODELS.IMAGE, { prompt: fullPrompt });
  var imageBytes = new Uint8Array(await result.arrayBuffer());
  var saved = null;
  if (body.save !== false && env.BUCKET) saved = await saveToR2(env, imageBytes, 'icons', body.prompt, { prompt: body.prompt, tier: body.tier, category: body.category }, ['ai-generated', 'icon']);
  await logJob(env, 'generate-icon', body.prompt, saved);
  return json({ image: 'data:image/png;base64,' + ab2b64(imageBytes), prompt: fullPrompt, model: MODELS.IMAGE, asset: saved });
}

// ── Describe ───────────────────────────────────────────────────────

async function handleDescribe(request, env) {
  var body = await request.json();
  var imageBytes;
  if (body.asset_id && env.BUCKET) {
    var db = env.OBJECTSTORE_DB || env.DB;
    var row = await db.prepare('SELECT key, mime FROM assets WHERE id = ?').bind(body.asset_id).first();
    if (!row) return json({ error: 'Asset not found' }, 404);
    var obj = await env.BUCKET.get(row.key);
    if (!obj) return json({ error: 'File missing from R2' }, 404);
    imageBytes = await obj.arrayBuffer();
  } else if (body.image_url) {
    var res = await fetch(body.image_url);
    if (!res.ok) return json({ error: 'Failed to fetch image' }, 400);
    imageBytes = await res.arrayBuffer();
  } else { return json({ error: 'Provide asset_id or image_url' }, 400); }
  var result = await env.AI.run(MODELS.TEXT, { messages: [
    { role: 'system', content: GAME_CONTEXT + '\nDescribe game assets in detail.' },
    { role: 'user', content: body.prompt || 'Describe this game asset — what it depicts, style, colors, and suggested use.' }
  ], image: Array.from(new Uint8Array(imageBytes)) });
  return json({ description: result.response, model: MODELS.TEXT, asset_id: body.asset_id || null });
}

// ── Auto Tag ───────────────────────────────────────────────────────

async function handleAutoTag(request, env) {
  var body = await request.json();
  if (!body.asset_id) return json({ error: 'asset_id required' }, 400);
  var db = env.OBJECTSTORE_DB || env.DB;
  var row = await db.prepare('SELECT * FROM assets WHERE id = ?').bind(body.asset_id).first();
  if (!row) return json({ error: 'Asset not found' }, 404);
  var oldTags = JSON.parse(row.tags || '[]');
  var result = await env.AI.run(MODELS.TEXT, { messages: [
    { role: 'system', content: 'Tag game assets. Return ONLY a JSON array of lowercase tags.' },
    { role: 'user', content: 'Filename: ' + row.filename + '\nCategory: ' + row.category + '\nMIME: ' + row.mime + '\nCurrent: ' + JSON.stringify(oldTags) + '\nReturn 3-8 tags as JSON array.' }
  ] });
  var newTags = [];
  try { newTags = JSON.parse(result.response.replace(/```json?\n?/g,'').replace(/```/g,'').trim()); } catch(e) {}
  if (!Array.isArray(newTags)) newTags = [];
  var merged = Array.from(new Set(oldTags.concat(newTags))).map(function(t) { return String(t).toLowerCase(); });
  await db.prepare("UPDATE assets SET tags = ?, updated_at = datetime('now') WHERE id = ?").bind(JSON.stringify(merged), body.asset_id).run();
  return json({ asset_id: body.asset_id, previous_tags: oldTags, new_tags: merged, model: MODELS.TEXT });
}

// ── Semantic Search ────────────────────────────────────────────────

async function handleSemanticSearch(request, env) {
  var body = await request.json();
  if (!body.query) return json({ error: 'query required' }, 400);
  var max = Math.min(body.limit || 20, 100);
  var db = env.OBJECTSTORE_DB || env.DB;
  var exp = await env.AI.run(MODELS.TEXT, { messages: [
    { role: 'system', content: 'Expand this search into 3-5 related keywords for game assets. Return ONLY comma-separated keywords.' },
    { role: 'user', content: body.query }
  ] });
  var kws = [body.query].concat((exp.response||'').split(',').map(function(k){return k.trim();}).filter(Boolean)).slice(0,5);
  var where = ["visibility = 'public'"], params = [];
  var clauses = kws.map(function() { return "(filename LIKE '%' || ? || '%' OR tags LIKE '%' || ? || '%')"; });
  where.push('(' + clauses.join(' OR ') + ')');
  kws.forEach(function(k) { params.push(k, k); });
  if (body.category) { where.push('category = ?'); params.push(body.category); }
  params.push(max);
  var sql = 'SELECT id, key, filename, mime, size, category, tags, created_at FROM assets WHERE ' + where.join(' AND ') + ' ORDER BY created_at DESC LIMIT ?';
  var r = await db.prepare(sql).bind.apply(db.prepare(sql), params).all();
  return json({ results: r.results.map(function(x) { x.tags = JSON.parse(x.tags||'[]'); return x; }), expanded_keywords: kws, count: r.results.length });
}

// ── Jobs ───────────────────────────────────────────────────────────

async function handleGetJob(id, env) {
  var row = await env.DB.prepare('SELECT * FROM ai_jobs WHERE id = ?').bind(id).first();
  if (!row) return json({ error: 'Job not found' }, 404);
  try { row.result = JSON.parse(row.result || '{}'); } catch(e) {}
  return json(row);
}

async function handleListJobs(url, env) {
  var limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  var type = url.searchParams.get('type');
  var sql = 'SELECT id, type, prompt, status, created_at FROM ai_jobs';
  var params = [];
  if (type) { sql += ' WHERE type = ?'; params.push(type); }
  sql += ' ORDER BY created_at DESC LIMIT ?'; params.push(limit);
  var r = await env.DB.prepare(sql).bind.apply(env.DB.prepare(sql), params).all();
  return json({ jobs: r.results, count: r.results.length });
}

// ── VPS Proxy ──────────────────────────────────────────────────────

async function handleVpsProxy(request, env, action) {
  if (!env.VPS_AI_AGENT_URL) return json({ error: 'VPS AI agent not configured' }, 503);
  var headers = { 'Content-Type': 'application/json' };
  if (env.VPS_INTERNAL_KEY) headers['X-Internal-Key'] = env.VPS_INTERNAL_KEY;
  var body = await request.text();
  var res = await fetch(env.VPS_AI_AGENT_URL + '/api/ai/' + action, { method: 'POST', headers: headers, body: body, signal: AbortSignal.timeout(30000) });
  return new Response(res.body, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}

// ── ObjectStore Proxy ──────────────────────────────────────────────

async function proxyToObjectStore(request, env, url) {
  var base = env.OBJECTSTORE_URL || 'https://objectstore.grudge-studio.com';
  var res = await fetch(base + url.pathname + url.search, { method: request.method, headers: request.headers, body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined });
  return new Response(res.body, { status: res.status, headers: res.headers });
}

// ── Utilities ──────────────────────────────────────────────────────

async function saveToR2(env, imageBytes, subdir, prompt, metadata, tags) {
  var id = crypto.randomUUID();
  var filename = 'ai-' + subdir.replace(/s$/, '') + '-' + id.slice(0, 8) + '.png';
  var key = 'ai-generated/' + subdir + '/' + filename;
  await env.BUCKET.put(key, imageBytes, { httpMetadata: { contentType: 'image/png' }, customMetadata: { assetId: id, category: 'ai-' + subdir, prompt: (prompt||'').slice(0,200) } });
  var db = env.OBJECTSTORE_DB || env.DB;
  try { await db.prepare('INSERT INTO assets (id,key,filename,mime,size,tags,category,visibility,metadata,owner) VALUES (?,?,?,\'image/png\',?,?,?,\'public\',?,\'ai-worker\')').bind(id, key, filename, imageBytes.length, JSON.stringify(tags), 'ai-' + subdir, JSON.stringify(metadata)).run(); } catch(e) { console.error('D1 insert:', e.message); }
  return { id: id, key: key, filename: filename, url: 'https://objectstore.grudge-studio.com/v1/assets/' + id + '/file' };
}

async function logJob(env, type, prompt, result) {
  try { await env.DB.prepare('INSERT INTO ai_jobs (id,type,prompt,status,result,model) VALUES (?,?,?,\'complete\',?,?)').bind(crypto.randomUUID(), type, (prompt||'').slice(0,500), JSON.stringify(result||{}), MODELS.TEXT).run(); } catch(e) { /* non-fatal */ }
}

function originMatches(requestOrigin, entry) {
  if (!entry) return false;
  if (entry === '*') return true;
  if (!requestOrigin) return false;
  if (entry === requestOrigin) return true;
  if (entry.indexOf('*.') === 0) {
    var suffix = entry.slice(1);
    var host;
    try { host = new URL(requestOrigin).host; } catch (e) { return false; }
    return host === suffix.slice(1) || host.indexOf(suffix, host.length - suffix.length) !== -1;
  }
  if (!/^https?:\/\//i.test(entry)) {
    var h2;
    try { h2 = new URL(requestOrigin).host; } catch (e) { return false; }
    return h2 === entry;
  }
  return false;
}

function cors(env, response, origin) {
  var allowed = (env.ALLOWED_ORIGINS || '*').split(',').map(function(s){return s.trim();}).filter(Boolean);
  var headers = new Headers(response.headers);
  var o = '';
  if (allowed.indexOf('*') !== -1) {
    o = origin || '*';
  } else if (origin && allowed.some(function(a) { return originMatches(origin, a); })) {
    o = origin;
  }
  if (o) {
    headers.set('Access-Control-Allow-Origin', o);
    headers.set('Vary', 'Origin');
    if (o !== '*') headers.set('Access-Control-Allow-Credentials', 'true');
  }
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization');
  headers.set('Access-Control-Expose-Headers', 'ETag, Content-Length, Content-Type');
  headers.set('Access-Control-Max-Age', '86400');
  return new Response(response.body, { status: response.status, headers: headers });
}

function json(data, status) { return new Response(JSON.stringify(data), { status: status || 200, headers: { 'Content-Type': 'application/json' } }); }

function ab2b64(buf) { var b = ''; var a = new Uint8Array(buf); for (var i = 0; i < a.length; i++) b += String.fromCharCode(a[i]); return btoa(b); }

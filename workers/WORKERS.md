# Grudge Studio — Cloudflare Workers

All edge-deployed Cloudflare Workers for the Grudge Studio platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLOUDFLARE EDGE                             │
│                                                                 │
│  ┌──────────────────────┐     ┌──────────────────────────┐     │
│  │  grudgeassets         │     │  grudge-ai-hub            │     │
│  │  objectstore.grudge-  │     │  ai.grudge-studio.com     │     │
│  │  studio.com           │     │                            │     │
│  │                        │     │  Workers AI (LLaMA, SDXL) │     │
│  │  Asset CRUD API        │◄───►│  Game agents (6 types)    │     │
│  │  3D model serving      │     │  Sprite/icon generation   │     │
│  │  Metadata search       │     │  Auto-tagging & search    │     │
│  └──────────┬─────────────┘     │  VPS AI proxy             │     │
│             │                    └─────┬──────────┬──────────┘     │
│             │                          │          │                │
│  ┌──────────▼──────────────────────────▼──┐  ┌───▼───┐           │
│  │  R2: objectstore-assets                 │  │  KV   │           │
│  │  (shared bucket — models, sprites,      │  │  rate  │           │
│  │   icons, AI-generated assets)           │  │  limit │           │
│  └─────────────────────────────────────────┘  │  cache │           │
│                                                └───────┘           │
│  ┌──────────────────────┐  ┌──────────────────────┐               │
│  │  D1: objectstore-meta │  │  D1: grudge-ai-hub   │               │
│  │  (asset metadata)     │  │  (ai_jobs tracking)  │               │
│  └──────────────────────┘  └──────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  VPS Backend     │
                    │  api.grudge-     │
                    │  studio.com      │
                    │  (Docker/Coolify)│
                    └─────────────────┘
```

## Workers

### 1. `grudgeassets` — ObjectStore API
| | |
|---|---|
| **Domain** | `objectstore.grudge-studio.com` |
| **Source** | `workers/src/index.js` |
| **Config** | `wrangler.toml` (root) |

**Purpose:** CRUD API for all game assets stored in R2. Public reads, API-key-gated writes.

**Bindings:**
- `env.BUCKET` → R2 `objectstore-assets`
- `env.DB` → D1 `objectstore-meta`

**Routes:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/v1/assets` | API key | Upload asset (multipart or raw) |
| GET | `/v1/assets` | No | List/search assets |
| GET | `/v1/assets/:id` | No | Asset metadata |
| GET | `/v1/assets/:id/file` | No | Download file from R2 |
| DELETE | `/v1/assets/:id` | API key | Delete asset + R2 object |
| GET | `/v1/models` | No | List 3D models |
| GET | `/v1/models/:id` | No | Model metadata |
| GET | `/v1/models/:id/file` | No | Download 3D model |
| GET | `/v1/models/:id/thumbnail` | No | Model thumbnail |

---

### 2. `grudge-ai-hub` — AI Worker
| | |
|---|---|
| **Domain** | `ai.grudge-studio.com` |
| **Source** | `workers/ai/index.js` |
| **Config** | `workers/ai/wrangler.toml` |

**Purpose:** AI-powered asset generation, game agents, auto-tagging, and search. Full R2 access for reading/writing assets.

**Bindings:**
- `env.AI` → Cloudflare Workers AI
- `env.BUCKET` → R2 `objectstore-assets` (shared with ObjectStore worker)
- `env.DB` → D1 `grudge-ai-hub` (AI jobs tracking)
- `env.OBJECTSTORE_DB` → D1 `objectstore-meta` (asset metadata queries)
- `env.KV` → KV namespace (rate limiting + response cache)
- `env.VPS_AI_AGENT_URL` → `https://api.grudge-studio.com`

**Routes:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health + all binding status |
| GET | `/v1/ai/agents` | List available AI agents |
| GET | `/v1/ai/models` | List AI model IDs |
| POST | `/v1/ai/chat` | Chat with game agent (lore/balance/code/art/mission/qa) |
| POST | `/v1/ai/generate-sprite` | Text → sprite image, auto-saved to R2 |
| POST | `/v1/ai/generate-icon` | Text → RPG icon (tier-aware), auto-saved to R2 |
| POST | `/v1/ai/describe` | Describe an R2 asset or image URL |
| POST | `/v1/ai/tag` | Auto-tag an asset in D1 using AI |
| POST | `/v1/ai/search` | AI-expanded keyword search across assets |
| GET | `/v1/ai/jobs` | List recent AI jobs |
| GET | `/v1/ai/jobs/:id` | Get job status/result |
| POST | `/v1/ai/vps/:action` | Proxy to VPS AI agent backend |
| * | `/v1/assets/*` | Proxy to ObjectStore worker |

**AI Models Used:**
- `@cf/meta/llama-3.1-8b-instruct` — Text generation (chat, describe, tag, search expansion)
- `@cf/stabilityai/stable-diffusion-xl-base-1.0` — Image generation (sprites, icons)
- `@cf/baai/bge-base-en-v1.5` — Text embeddings (semantic search)

**Game Agents:**
| Agent | Purpose |
|-------|---------|
| `lore` | World lore, backstories, item descriptions, faction history |
| `balance` | Stat analysis, tier scaling, economy balance, combat fairness |
| `code` | JavaScript, Node.js, Three.js, Workers, Unity C# |
| `art` | Sprite concepts, icon design, VFX direction, voxel/pixel art |
| `mission` | Quest design, boss encounters, progression, rewards |
| `qa` | Edge cases, exploits, test strategies, combat/economy bugs |

---

## Shared Resources

### R2 Bucket: `objectstore-assets`
Shared by both workers. Contains:
- `models/` — 3D models (GLB, GLTF, FBX, OBJ)
- `sprites/` — 2D sprites and sprite sheets
- `icons/` — Item and ability icons
- `3dfx/` — Shader files and effect definitions
- `ai-generated/sprites/` — AI-generated sprites
- `ai-generated/icons/` — AI-generated icons
- `thumbnails/` — Auto-generated model thumbnails

### D1 Database: `objectstore-meta`
Asset metadata — used by ObjectStore worker (read/write) and AI hub (read for search/tag/describe).
- `assets` table: id, key, filename, mime, size, sha256, tags, category, visibility, metadata, owner

### D1 Database: `grudge-ai-hub`
AI job tracking — used only by the AI hub worker.
- `ai_jobs` table: id, type, prompt, status, result, model, owner

### KV Namespace
Used by AI hub for:
- **Rate limiting** — `rl:{ip-or-key}:{minute}` counters with 120s TTL
- **Response cache** — `chat:{agent}:{prompt-hash}` with 10min TTL

---

## Deployment

### Prerequisites
```bash
npm install -g wrangler
wrangler login
```

### Deploy ObjectStore Worker
```bash
wrangler deploy                    # uses root wrangler.toml
```

### Deploy AI Hub Worker
```bash
# First time: run D1 migration
wrangler d1 execute grudge-ai-hub --file=workers/ai/schema.sql --remote

# Deploy
wrangler deploy --config workers/ai/wrangler.toml
```

### Secrets
```bash
# ObjectStore worker — API key for upload/delete
wrangler secret put API_KEY

# AI hub worker — VPS internal key (optional)
wrangler secret put VPS_INTERNAL_KEY --config workers/ai/wrangler.toml
```

### Local Development
```bash
# ObjectStore worker
wrangler dev                        # http://localhost:8787

# AI hub worker
wrangler dev --config workers/ai/wrangler.toml   # http://localhost:8788
```

---

## Best Practices

### General
- **Never store secrets in wrangler.toml** — use `wrangler secret put` for API keys, internal keys
- **Always use `--remote` for D1 migrations** — local D1 is ephemeral
- **Test locally first** — `wrangler dev` simulates all bindings locally
- **Pin compatibility dates** — don't change unless you test all routes

### R2
- **Use descriptive keys** — `category/id/filename.ext` pattern
- **Set `Cache-Control: immutable`** for uploaded assets — they're content-addressed
- **Keep files under 100MB** — R2 free tier limit per object
- **Store metadata in D1, not R2 custom metadata** — D1 is searchable, R2 custom metadata is not

### D1
- **Use `IF NOT EXISTS` in all migrations** — makes them idempotent
- **Index columns you query** — category, tags, visibility, created_at
- **Parse JSON fields after SELECT** — tags and metadata are stored as JSON strings
- **Use `OBJECTSTORE_DB` binding in AI hub** for asset queries — keeps AI jobs in separate DB

### Workers AI
- **Rate limit all AI routes** — Workers AI has per-account quotas
- **Cache identical prompts** — KV cache prevents redundant AI calls
- **Keep prompts short** — LLaMA 3.1 8B has limited context
- **Validate AI output** — especially JSON responses from tag/search routes

### CORS
- **List specific origins** — avoid wildcard `*` in production
- **Reflect request origin** — check against allowed list, return matched origin
- **Set `Vary: Origin`** — when origin is not `*`, prevents cache poisoning

### Custom Domains
- **One worker per custom domain** — Cloudflare enforces this
- **No wildcards or paths** in custom domain patterns
- **DNS auto-created** by Cloudflare when you deploy with `custom_domain = true`

---

## Integration with SDK

```javascript
import { GrudgeSDK } from './sdk/grudge-sdk.js';
const sdk = new GrudgeSDK({ token: '<JWT>' });

// ObjectStore (objectstore.grudge-studio.com)
const assets = await sdk.r2.listAssets({ category: 'weapon' });
const url = sdk.r2.getAssetFileUrl('models/characters/knight.glb');

// AI Hub (ai.grudge-studio.com)
const sprite = await sdk.ai.generateSprite('orc warrior with axe');
const lore = await sdk.ai.chat('Describe the Crusade faction', { agent: 'lore' });
const tags = await sdk.ai.tag('asset-uuid-here');
const results = await sdk.ai.search('fire spell effects');
```

---

## Free Tier Limits

| Service | Limit |
|---------|-------|
| Workers | 100K requests/day (per worker) |
| R2 | 10 GB storage, 10M reads/mo, 1M writes/mo |
| D1 | 5M reads/day, 100K writes/day, 5 GB storage |
| KV | 100K reads/day, 1K writes/day |
| Workers AI | varies by model — ~10K inferences/day for text, ~100 for image |

---

## Monitoring

```bash
# Tail logs in real-time
wrangler tail                                          # ObjectStore worker
wrangler tail --config workers/ai/wrangler.toml        # AI hub worker

# Check deployments
wrangler deployments list
wrangler deployments list --config workers/ai/wrangler.toml
```

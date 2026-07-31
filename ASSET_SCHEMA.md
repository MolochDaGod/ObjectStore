# Grudge Studio — Asset Path Schema & Standards

## Fleet audit (era + readiness)

Production ops: **`npm run audit:assets`** — classifies **era**, scores **game-ready bake**, writes convert queue + purge dry-run. See `docs/ASSET_FLEET_AUDIT.md` and `docs/STUDIO_DEPLOY_ACCOUNTS_SSOT.md`.

| Field | Role |
|-------|------|
| `era` | grudge6 / tvs / warlords / legacy / gamedata / ui / audio / vfx |
| `readiness.score` | 0–100 bake/CDN/registry posture |
| `status` | draft / published / archived / quarantine (registry) |

UUID = identity only; era and scripts live in metadata.

---

## R2 Key Structure

All R2 keys follow a deterministic path schema. Every key contains a `crypto.randomUUID()` UUID
immediately before the file extension. **Never use `Date.now()` or `Math.random()` for asset IDs.**

```
{namespace}/{[ownerId/]}{category}/{[subcat/]}{uuid}.{ext}
```

### Namespaces

| Namespace  | Owner segment | Description                               | Example |
|------------|:------------:|-------------------------------------------|---------|
| `game`     | —            | Canonical game assets — ship immutable    | `game/sprite/9f1a…3b.png` |
| `players`  | `{grudgeId}` | Player-uploaded content                   | `players/g-abc123/avatar/7e2f….png` |
| `vfx`      | —            | VFX sheets / image sequences              | `vfx/fire/burst_01/4d9c….png` |
| `models`   | —            | 3-D model files (.glb)                    | `models/crusade/wk/2a1b….glb` |
| `ui`       | —            | UI sprites, icons, HUD elements           | `ui/hud/healthbar/c8f0….png` |

### Allowed extensions

`png jpg jpeg gif webp avif svg mp3 ogg wav glb gltf vox fbx json`

### UUID rule

Every asset key produced by any Grudge Studio worker must use `crypto.randomUUID()` via the
shared `newId()` helper. No timestamp-based IDs, no `Math.random()` slugs.

### Version strategy for model assets

Use the schema version in the **path** (e.g. `models/crusade/wk/v5/2a1b….glb`), never as a
query string (`?v2`). R2 and CDN edge caches key on the path; query strings are stripped or
ignored. Bump `SCHEMA_VER` in `index.js` when the layout changes.

---

## CDN & Image Transform URLs

| Pattern | What it does |
|---------|-------------|
| `https://assets.grudge-studio.com/{r2key}` | Direct R2 CDN — immutable cache header for `game/` keys |
| `https://ai.grudge-studio.com/cdn/{r2key}` | Worker-served with ETag + conditional 304 |
| `https://ai.grudge-studio.com/img/{preset}/{r2key}` | Cloudflare Image Resizing |

Image presets: `thumb` (64×64) · `icon` (128×128) · `card` (256×256) · `banner` (512×256) · `full`

---

## Workers & Bindings

### Canonical binding names (use these everywhere)

| Binding       | Type | Resource                  | Purpose |
|---------------|------|---------------------------|---------|
| `BUCKET`      | R2   | `grudge-assets`           | All asset storage — was "ASSETS" in v4, now standardised |
| `DB`          | D1   | `grudge-ai-hub`           | AI job queue |
| `OBJECTSTORE_DB` | D1 | `grudge-objectstore`     | Asset metadata index |
| `RATE_LIMIT`  | KV   | `AI_HUB_KV`               | Rate limiting — was wrongly `KV` in v4 |
| `AI_CACHE`    | KV   | `GAME_DATA`               | NPC/mission cache + debug logs |
| `AI`          | AI   | (Workers AI binding)      | All AI model calls |

**Never use the old `ASSETS` R2 binding name.** Any worker using `env.ASSETS` is pre-v5 and
needs updating. The `grudgeassets` objectstore worker was already using `BUCKET`; ai-hub is now
aligned.

---

## AI Endpoints

### Vision (new in v5)

```
POST ai.grudge-studio.com/ai/vision
{ "r2Key": "game/sprite/…uuid….png", "prompt": "optional override" }
→ { response: "natural language description", model, source }
```

### Auto-tag asset

```
POST ai.grudge-studio.com/ai/asset-tag
{ "r2Key": "game/sprite/…uuid….png" }
→ { category, tags, subject, style, quality, colors }
  also writes tags back to D1 assets table
```

### Fast classify

```
POST ai.grudge-studio.com/ai/classify
{ "r2Key": "…" }
→ { classifications: [ { label, score } ] }
```

Models used: LLaVA-1.5-7B (vision/tag), ResNet-50 (classify), Llama-3-8B (text), BGE-small (embed).

---

## Upload Flow

### 1. Request a key (POST)
```
POST ai.grudge-studio.com/assets/upload
{
  "filename":  "sword_01.png",
  "namespace": "game",          // default: "players"
  "category":  "sprite",
  "grudgeId":  "g-abc123",      // required for players namespace
  "tags":      ["weapon","sword"]
}
→ {
    id:          "uuid",
    key:         "game/sprite/uuid.png",   // canonical R2 key
    uploadUrl:   "https://ai.…/assets/upload?key=…",
    method:      "PUT",
    contentType: "image/png",
    cdn:         "https://assets.grudge-studio.com/…",
    img:         "https://ai.grudge-studio.com/img/card/…",
    raw:         "https://ai.grudge-studio.com/cdn/…"
  }
```

### 2. Stream the file (PUT)
```
PUT  {uploadUrl}
Content-Type: image/png
Body: <binary>
→ { success: true, id, key, cdn, img, raw }
```

The key is written to **both** R2 and the D1 `assets` table in one request.

---

## D1 Migration

Run once against both databases:

```powershell
npx wrangler d1 execute grudge-ai-hub      --config workers/ai/wrangler.toml --file workers/ai/schema.sql
npx wrangler d1 execute grudge-objectstore --config wrangler.toml             --file workers/ai/schema.sql
```

---

## Known issues fixed in v5

| Issue | Was | Fixed |
|-------|-----|-------|
| Rate limiting always passed | KV bound as `"KV"`, code read `env.RATE_LIMIT` | Binding renamed to `RATE_LIMIT` in wrangler.toml |
| R2 binding name mismatch | `ASSETS` in ai-hub, `BUCKET` in objectstore | Standardised to `BUCKET` everywhere |
| Debug logs polluted rate-limit KV | `debug:` prefix written to `RATE_LIMIT` KV | Debug logs use `AI_CACHE` KV under `dbg:` prefix |
| Asset uploads not indexed | D1 `OBJECTSTORE_DB` bound but never written | `indexAsset()` called on every upload |
| Non-UUID IDs | `Date.now() + Math.random()` for task/debug IDs | `crypto.randomUUID()` everywhere via `newId()` |
| Model cache-bust via query string | `model.glb?v2` — ignored by R2/CDN | Version in path segment; bump `SCHEMA_VER` |
| CORS wildcard | `*.vercel.app` allowed any deploy | Scoped to `grudge-*.vercel.app` pattern |
| No vision AI | No `/ai/vision` endpoint | LLaVA-1.5-7B via `/ai/vision`, `/ai/asset-tag`, `/ai/classify` |

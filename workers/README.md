# ObjectStore — Cloudflare Workers API

Asset storage API powered by **R2** (files) + **D1** (metadata).

## Architecture

```
Client → Worker API → R2 (files) + D1 (metadata)
         ↕
   objectstore.grudge-studio.com
```

- **R2 bucket** `objectstore-assets` — stores uploaded files
- **D1 database** `objectstore-meta` — stores asset metadata (id, key, tags, category, etc.)
- **Worker** `objectstore-api` — REST API with CORS + API key auth

## Free Tier Limits

| Service | Limit |
|---------|-------|
| R2 | 10 GB storage, 10M reads/mo, 1M writes/mo |
| D1 | 5M reads/day, 100K writes/day, 5 GB storage |
| Workers | 100K requests/day |

## Setup (one-time)

### 1. Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 2. Create R2 Bucket

```bash
wrangler r2 bucket create objectstore-assets
```

### 3. Create D1 Database

```bash
wrangler d1 create objectstore-meta
```

Copy the `database_id` from the output and paste it into `wrangler.toml`:

```toml
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 4. Run D1 Migrations

```bash
wrangler d1 execute objectstore-meta --file=workers/schema.sql
```

### 5. Set API Key Secret

```bash
wrangler secret put API_KEY
```

Enter a strong random key. This protects upload/delete endpoints.

### 6. Deploy

```bash
npm run worker:deploy
# or: wrangler deploy
```

### 7. Connect Custom Domain (optional)

1. Go to Cloudflare Dashboard → Workers & Pages → `objectstore-api`
2. Settings → Triggers → Add Custom Domain
3. Enter `objectstore.grudge-studio.com`
4. Cloudflare auto-creates the DNS record

## API Reference

### Health Check

```
GET /health
→ { "status": "ok", "service": "objectstore-api" }
```

### Upload Asset

```
POST /v1/assets
Headers: X-API-Key: <your-key>
Body: multipart/form-data
  - file: (binary)
  - category: "weapon" | "armor" | "icon" | "sprite" | ...
  - tags: '["sword","legendary"]'
  - visibility: "public" (default)
  - metadata: '{"tier":5}'

→ 201 { id, key, filename, mime, size, category, tags, url, created_at }
```

**Raw upload** (alternative — metadata via headers):

```
POST /v1/assets
Headers:
  X-API-Key: <key>
  X-Filename: my-icon.png
  X-Category: icon
  X-Tags: ["ui","button"]
  Content-Type: image/png
Body: <raw file bytes>
```

### List / Search Assets

```
GET /v1/assets?category=weapon&tag=sword&q=iron&limit=50&offset=0
→ { items: [...], count, limit, offset }
```

### Get Asset Metadata

```
GET /v1/assets/:id
→ { id, key, filename, mime, size, sha256, tags, category, metadata, file_url, ... }
```

### Download Asset File

```
GET /v1/assets/:id/file
→ (binary stream with Content-Type and Cache-Control headers)
```

### Delete Asset

```
DELETE /v1/assets/:id
Headers: X-API-Key: <your-key>
→ { deleted: true, id }
```

## Local Development

```bash
npm run worker:dev
```

This starts a local dev server at `http://localhost:8787` with R2 + D1 simulated locally.

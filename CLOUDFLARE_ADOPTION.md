# Cloudflare adoption review — Grudge Studio
Companion to `CLOUDFLARE_DNS_PLAN.md`. This doc answers three questions you asked on 2026-04-20:
1. What's the Cloudflare "thing" that game studios use for assets?
2. What can you do with CF that you're *not* currently doing?
3. Can you manage auth/login on Cloudflare?
Account: `Grudge` (`ee475864561b02d4588180b8b9acf694`), user `jonbemmons@gmail.com`.
---
## 1. The "asset stack" for game studios
The combination that makes Cloudflare outstanding for game assets is four products working together:
### R2 + Images + Stream + Tiered Cache / Cache Reserve
| Service | What it does | Why it matters for Grudge |
|---|---|---|
| **R2** | Zero-egress object storage | Bulk sprites/models/audio live here. No per-GB egress bill (unlike S3). |
| **Cloudflare Images** | On-the-fly image transforms + variants served from the edge | One source PNG → auto WebP/AVIF, 96px thumb for `2d.html` cards, 256px preview for item tooltips, 1024px full for the editors. No pre-baking needed. |
| **Cloudflare Stream** | HLS/DASH video hosting + adaptive bitrate | The MP4s in `public/videos/` get transcoded once, delivered in the right bitrate for every player. Cuts cutscene bandwidth 60-80%. |
| **Tiered Cache + Cache Reserve** | Guarantees R2 is read at most once globally, then cached at edge POPs forever | Makes R2 feel like a CDN for immutable game assets. Dramatically reduces R2 reads and latency. |
**You already have R2.** Images, Stream, Tiered Cache, and Cache Reserve are all billed a la carte — and are still dramatically cheaper than equivalent S3+CloudFront because of R2's zero egress.
---
## 2. What's currently provisioned on your account
Audited 2026-04-20 via `wrangler`:
**R2 buckets (3)**
- `grudge-assets` — primary game-asset bucket (created 2026-03-11)
- `objectstore-assets` — duplicate / legacy (created 2026-03-11, same day)
- `babylon-docs` — Babylon documentation mirror (created 2026-03-30)
**D1 databases**
- `grudge-objectstore` (`8fc367a8-9120-490e-a503-b0fcb755c044`) — bound to the `grudgeassets` Worker
**KV namespaces (6)**
- `AI_HUB_KV` — AI orchestration state
- `babylon-ai-workers-HAVOK_KV` — physics/knowledge KV
- `babylon-ai-workers-KNOWLEDGE_BASE` — RAG content cache
- `babylon-ai-workers-SAGE_KV` — "sage" agent state
- `GRUDGE_ANALYTICS` — analytics buffer
- `grudge-r2-cdn-GRUDGE_RATE_LIMIT` — per-IP rate limit counters
**Workers**
- `grudgeassets` — ObjectStore API worker, route `objectstore.grudge-studio.com`, bindings to R2 `grudge-assets` + D1 `grudge-objectstore` + DO `ConversionPipeline`.
- (From KV names) `babylon-ai-workers` + `grudge-r2-cdn` workers — at least two more deployed services.
**Cloudflare Pages**
- `grudge-studio-dash` — dashboard, live at `grudge-studio-dash.pages.dev` (last deploy ~4 weeks ago).
**DNS** — `grudge-studio.com` zone with `id.`, `api.`, `objectstore.`, `dash.`, likely others.
### Unused slots noted
- No `objectstore-assets` bucket usage visible in any worker's `wrangler.toml` I've inspected → candidate for deletion after confirming empty.
- `GRUDGE_ANALYTICS` KV is a questionable pattern (KV writes are eventually-consistent and expensive); **Cloudflare Analytics Engine** is the right tool for this and you're not using it yet.
---
## 3. What to adopt that you're NOT currently using
Ordered by expected game-studio ROI. All of these are additive and can be added incrementally.
### 3a. Cloudflare Images — **highest ROI for the 2D asset experience**
One-time setup, then every sprite/icon/background in your 2D hub gets free variants.
```
# enable on dashboard: Images → Enable, then define variants:
#   thumb    → 96px, fit=contain, format=auto
#   card     → 160px, fit=contain, format=auto
#   preview  → 512px, fit=contain, format=auto
#   full     → 2048px, fit=contain, format=auto, quality=90
```
Usage from the store client:
```
// js/store-client.js — already has assetUrl(rec); add a variant helper:
client.assetUrl(rec, { variant: 'thumb' })
// →  https://imagedelivery.net/<account-hash>/<image-id>/thumb
```
For existing R2-backed sprites, enable **Images from URL**: `https://imagedelivery.net/<hash>/https%3A%2F%2Fassets.grudge-studio.com%2Fgame-assets%2Fsprites%2F…/thumb`. Billed at $5/100k deliveries; way cheaper than pre-baking thumbnails.
### 3b. Cloudflare Stream — for `public/videos/`
Replaces the current `<video src="…mp4">` direct-from-R2 pattern.
```
# one-time upload per video:
wrangler stream upload ./public/videos/intro.mp4 --account-id ee475864561b02d4588180b8b9acf694
# returns a UID; embed via:
<stream src="<uid>" controls></stream>
# or use the store record's `streamUid` field (add to asset-kind.d.ts)
```
Add a new `'stream-video'` asset kind or reuse `video` with a `streamUid` field, migrate the 4–5 MP4s you have, kill their R2 copies.
### 3c. Tiered Cache + Cache Reserve — make R2 a true CDN
Tiered Cache is a dashboard toggle:
```
Dashboard → Caching → Tiered Cache → enable Smart Tiered Cache
Dashboard → Caching → Cache Reserve → enable (for grudge-studio.com zone, $0.015/GB-month)
```
Combined with the 1-year Cache-Control header recommended in `CLOUDFLARE_DNS_PLAN.md`, R2 reads drop to ~1 per asset per year.
### 3d. Cloudflare Queues — async asset ingest
Your `POST /api/ingest/wcs` is currently synchronous; big batches will time out. Convert to a Queue producer:
```
# wrangler.toml
[[queues.producers]]
binding = "INGEST_QUEUE"
queue   = "asset-ingest"
[[queues.consumers]]
queue   = "asset-ingest"
max_batch_size    = 50
max_batch_timeout = 10
```
Worker consumer writes each record to D1 + R2, then updates the manifest. Lets you ingest 100k RPG-MODULAR sprites without server timeouts.
### 3e. Cloudflare Browser Rendering — auto-generated 3D thumbnails
Point Browser Rendering at a minimal page hosting `<grudge-gltf-viewer>` with `?id=<assetId>&snapshot=1`; the viewer takes a snapshot, uploads to R2. Now every `model3d` asset has an actual rendered thumbnail in the 3D hub list instead of a "MOD" placeholder.
```
// worker/thumbnail.js
import puppeteer from "@cloudflare/puppeteer";
export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const browser = await puppeteer.launch(env.BROWSER);
    const page = await browser.newPage();
    await page.goto(`https://objectstore.grudge-studio.com/viewer-snapshot?id=${id}`);
    await page.waitForSelector("grudge-gltf-viewer[ready]");
    const buf = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: 512, height: 512 } });
    await env.BUCKET.put(`thumbs/${id}.png`, buf, { httpMetadata: { contentType: "image/png" }});
    return new Response("ok");
  },
};
```
### 3f. Cloudflare Workers AI + Vectorize — semantic asset search + auto-classification
Two wins:
1. **Auto-classify** the 631 `vfx2d` false-positives we flagged: run `@cf/openai/clip-vit-base-patch32` on each asset's preview, compare to reference embeddings of each `assetKind`, correct the record. Cost ≈ $0.01 per 10k classifications.
2. **Semantic search** in the 2D/3D hubs: user types "glowing blue sword" → `Workers AI` generates an embedding, **Vectorize** returns the nearest matching sprite records. Your existing `GET /api/search` becomes a semantic endpoint.
```
# wrangler.toml
[ai]
binding = "AI"
[[vectorize]]
binding = "ASSETS_VEC"
index_name = "grudge-assets"
```
### 3g. Cloudflare Analytics Engine — replace KV-based analytics
KV isn't designed for high-write telemetry. Analytics Engine is:
```
# wrangler.toml
[[analytics_engine_datasets]]
binding = "ANALYTICS"
# then in worker: env.ANALYTICS.writeDataPoint({ indexes: [user.id], doubles: [latency] });
```
Then query via GraphQL at `api.cloudflare.com/client/v4/graphql`.
### 3h. Cloudflare Turnstile — bot-free signups
Add to the `id.grudge-studio.com` sign-up form. Free, drop-in.
### 3i. Cloudflare Access — gate the admin editors
Covered more in section 4 below. In short: `/editors/*` and `/admin.html` should require a CF Access policy that allows only your admin identity list, **in addition to** the API-level JWT check already in `routes-v2.js`.
### 3j. Cloudflare Spectrum + Magic Transit — if you run real-time game servers
When you run the eventual multiplayer backend (WebSocket already works through CF, but raw UDP game servers need Spectrum), Spectrum proxies arbitrary TCP/UDP with CF's DDoS mitigation in front.
### 3k. Cloudflare Realtime (was "Calls") — in-game voice
SFU-as-a-service. You can build party/raid voice chat without running your own TURN+SFU.
### 3l. Cloudflare Waiting Room — launch days
Free plan gives you 2 rooms. Drop one in front of `wcs.grudge-studio.com/play` for launch/event surges so the game server isn't overwhelmed.
### 3m. Cloudflare Pages Functions — remove the need for a separate Node backend on grudge-wcs
Most of `wcs-api.grudge-studio.com` could run as Pages Functions if you swap `discord.js` for raw Discord REST (which you'd want to do anyway for edge cold-start reasons). Would delete the VPS dependency. Out of scope for now, but worth tracking.
---
## 4. Auth on Cloudflare — yes, three flavours
### 4a. Cloudflare Access (Zero Trust) — for admin/internal apps
**Best fit right now.** Wraps any app/subdomain with SSO. Supports Google, GitHub, OIDC, SAML, Okta, one-time PIN via email, etc. Users get a cookie; app code just trusts `CF-Access-Authenticated-User-Email` / JWT headers.
Wire plan for you:
```
# 1. Dashboard → Zero Trust → Access → Applications → Add
#    App name: Grudge ObjectStore Editors
#    Domain:   objectstore.grudge-studio.com
#    Path:     /editors/* AND /admin.html
#    Policy:   Allow email in [racalvin@…, …]
#
# 2. Add a JWT application audience (AUD) tag
# 3. Your Worker reads CF-Access-Jwt-Assertion + verifies with
#    https://<team>.cloudflareaccess.com/cdn-cgi/access/certs
```
Cost: free for up to 50 users (admin team is tiny). Applies to:
- `/editors/*` + `/admin.html` on `objectstore.grudge-studio.com`
- the grudgeDot launcher if it ever has an admin surface
- the Cloudflare Pages preview URLs for WIP work
### 4b. Your own SSO hosted on Workers + KV + D1 (for player-facing auth)
Your current `id.grudge-studio.com` is your player SSO. You can absolutely move it onto CF infra:
- **Workers** serve the `/auth`, `/auth/callback`, `/api/auth/verify` endpoints.
- **D1** stores `users` (uuid, email, puterId, discordId, solanaAddr, createdAt).
- **KV** stores short-lived session tokens (fast reads, TTL).
- **Durable Objects** for rate-limited login attempts per account.
- **Turnstile** on the sign-up / sign-in forms.
- **Workers AI** optional: anomaly detection on login patterns.
This migrates your SSO fully onto CF and eliminates whatever backend currently serves `id.grudge-studio.com`. It's a non-trivial project (~1–2 weeks of focused work), but it buys you global low latency on auth + no infra.
### 4c. Hybrid — keep player SSO external, use Access for staff
Most pragmatic. Keep `id.grudge-studio.com` as-is for players. Put CF Access in front of every internal/admin surface. This is what I'll wire up as part of the next turn unless you say otherwise.
---
## 5. Concrete cleanup actions (ready to execute)
In decreasing safety:
1. **Delete `objectstore-assets` bucket** (duplicate of `grudge-assets`). Verify empty first.
    ```
    wrangler r2 bucket list-object-versions objectstore-assets | Measure-Object
    # if 0 objects:
    wrangler r2 bucket delete objectstore-assets
    ```
2. **Enable Smart Tiered Cache** on zone `grudge-studio.com`. Dashboard toggle.
3. **Enable Cache Reserve** on zone `grudge-studio.com`. Dashboard toggle (~$0.015/GB-mo).
4. **Bind `assets.grudge-studio.com`** as a custom public domain on `grudge-assets`. (See `CLOUDFLARE_DNS_PLAN.md` §1.) Requires `R2:Edit` scope on the token.
5. **Enable Cloudflare Images.** Dashboard → Images → Enable. Create the variants listed in §3a. No code changes yet — just provisions the capability.
6. **Provision Cloudflare Stream.** Dashboard → Stream → Enable. We'll upload videos during the grudge-wcs migration step, not before.
7. **Provision Queues, Vectorize, Workers AI bindings** in a new `wrangler.toml` section (see §3d, §3f). Doesn't deploy anything until we write consumers.
8. **Create a CF Access application** for `objectstore.grudge-studio.com/editors/*` and `/admin.html`. Dashboard → Zero Trust → Access.
9. **Consolidate analytics** to Analytics Engine; leave `GRUDGE_ANALYTICS` KV read-only for migration, start writing only to AE.
10. **Rotate API token** with `Zone:DNS:Edit`, `Pages:Edit`, `Workers Routes:Edit`, `Cache Rules:Edit`, `R2:Edit`, `Access:Edit` so I can apply everything above via API instead of asking you to click through the dashboard.
---
## 6. Suggested next focus
Given grudge-wcs migration + ObjectStore rework are already in-flight, the highest-ROI CF additions in the same turn are:
- **Cloudflare Images** (replaces all sprite thumbnail work)
- **Tiered Cache + Cache Reserve** (zero code, just toggles)
- **R2 custom domain `assets.grudge-studio.com`** (unblocks the `assetUrl()` refactor in grudge-wcs)
- **CF Access on `/editors/*`** (locks down admin editors the moment they go live)
Stream, Queues, Vectorize, Workers AI thumbnail generation, and the SSO-on-Workers migration are larger projects — worth their own milestones.

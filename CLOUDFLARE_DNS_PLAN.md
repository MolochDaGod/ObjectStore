# Cloudflare DNS + Pages + Workers plan — grudge-studio.com
Written 2026-04 by Oz. Target zone: `grudge-studio.com` on Cloudflare account `Grudge` (`ee475864561b02d4588180b8b9acf694`).
Current `wrangler` token on this machine has scopes `account:read, user:read, workers:write`. **Missing `dns_records:edit` and `pages:edit`**, so DNS and Pages project creation must be done either (a) by you in the Cloudflare dashboard, or (b) after rotating the token to include those scopes, at which point I can apply everything via API.
## Domains this plan covers
```
id.grudge-studio.com          → Grudge SSO (already live, external to this plan)
api.grudge-studio.com         → Grudge backend (already live)
objectstore.grudge-studio.com → ObjectStore Worker (already live, grudgeassets)
assets.grudge-studio.com      → R2 public bucket grudge-assets (NEW — CDN for assets)
wcs.grudge-studio.com         → Cloudflare Pages (grudge-wcs SPA) (NEW)
wcs-api.grudge-studio.com     → Node backend on Grudge VPS (NEW)
grudgedot.grudge-studio.com   → Cloudflare Pages (GDevelopAssistant rebrand) (NEW, optional)
dash.grudge-studio.com        → Dashboard (already live)
ai.grudge-studio.com          → Legion AI hub (planned)
```
## DNS records to add
All A/AAAA records should be Proxied (orange cloud) unless noted. CNAMEs to Cloudflare-managed targets are automatically HTTPS-terminated.
### 1. `assets.grudge-studio.com` — R2 public bucket
Bind the R2 bucket `grudge-assets` to this hostname via the R2 dashboard:
1. Cloudflare dashboard → R2 → `grudge-assets` → Settings → Public Access → Custom Domains → Connect Domain → `assets.grudge-studio.com`. Cloudflare auto-creates the CNAME.
2. Verify `curl -I https://assets.grudge-studio.com/game-assets/<path>` returns 200 once an object exists.
Fallback (if R2 dashboard custom-domain binding is unavailable): add CNAME `assets` → `public.r2.dev` (not ideal — prefers the managed binding).
### 2. `wcs.grudge-studio.com` — Cloudflare Pages (grudge-wcs)
Create a Pages project first:
1. Dashboard → Workers & Pages → Create → Pages → Connect to Git → pick `MolochDaGod/grudge-wcs`.
2. Build settings: framework `None`, build command `npm run build`, output dir `dist`, root `/`, `NODE_VERSION=20`.
3. Pages env vars: `VITE_ASSET_BASE_URL=https://assets.grudge-studio.com`, `VITE_GRUDGE_BACKEND_URL=https://api.grudge-studio.com`, `VITE_GRUDGE_AUTH_URL=https://id.grudge-studio.com`, `BACKEND_URL=https://wcs-api.grudge-studio.com` (read by `functions/api/[[path]].js`).
4. Pages project → Custom Domains → add `wcs.grudge-studio.com`. Cloudflare auto-creates the CNAME.
### 3. `wcs-api.grudge-studio.com` — Node backend on Grudge VPS
Add CNAME (or A if the VPS IP is stable):
```
Type  Name     Target                          Proxy  TTL
CNAME wcs-api  <vps-host>.grudge-studio.com    ✓      Auto
```
Or if routing via the same Caddy/Traefik that already fronts `api.grudge-studio.com`:
```
CNAME wcs-api  api.grudge-studio.com           ✓      Auto
```
(then add a route rule in Caddy/Traefik matching `Host(wcs-api.grudge-studio.com)` to the grudge-wcs container on port 3001.)
### 4. `grudgedot.grudge-studio.com` — launcher (optional)
Same Pages flow as `wcs`, source repo `MolochDaGod/GDevelopAssistant` (the current grudgeDot rebrand). Pages custom domain `grudgedot.grudge-studio.com`.
## Worker config updates (wrangler.toml additions)
Once Pages/DNS are wired, extend `wrangler.toml` to add routes the Worker should answer on (read-heavy cache-friendly paths). Keep the existing `objectstore.grudge-studio.com` route.
```
routes = [
  { pattern = "objectstore.grudge-studio.com", custom_domain = true },
  { pattern = "assets.grudge-studio.com/api/manifest/*", zone_name = "grudge-studio.com" },
  { pattern = "assets.grudge-studio.com/api/search",     zone_name = "grudge-studio.com" },
]
```
Heavy endpoints (uploads, manifest rebuilds, conversions) stay on the Express backend because they need Node APIs (`multer`, `sharp`, `gltf-pipeline`, `obj2gltf`).
## Page Rules / Cache Rules
Under Rules → Cache Rules, add a rule for `assets.grudge-studio.com/*`:
- Cache Eligibility: eligible for cache.
- Edge TTL: `Override origin` → 31536000 seconds (1 year).
- Browser TTL: 31536000 seconds.
- Respect Strong ETags: on.
Immutability holds because R2 keys are content-addressed per ingest (sha256 suffix allowed in future versions).
## Access policies (future)
When the admin editors go live (`/editors/*`, `/admin.html`) add a Cloudflare Access policy on `objectstore.grudge-studio.com/editors/*` that requires a group membership (Racalvin + admins). For now access is enforced at the API layer via the SSO JWT.
## Token scopes needed for me to apply directly
If you'd like me to finish the DNS, Pages, and Access wiring via `wrangler` / `cloudflare-api`, rotate the token at `https://dash.cloudflare.com/profile/api-tokens` and add these scopes:
- `Zone:DNS:Edit` (zone: grudge-studio.com)
- `Account:Cloudflare Pages:Edit`
- `Zone:Workers Routes:Edit`
- `Zone:Cache Rules:Edit`
- `Account:R2 Storage:Edit`
Then set `CLOUDFLARE_API_TOKEN` in the shell (or drop it into `.env` — `.env` is git-ignored).
## Verification checklist
After applying the above:
```
curl -I https://assets.grudge-studio.com/game-assets/probe.txt      # expect 200 after ingest
curl -I https://wcs.grudge-studio.com/                              # expect 200 HTML from Pages
curl -I https://wcs-api.grudge-studio.com/api/health                # expect 200 JSON from VPS
curl -I https://objectstore.grudge-studio.com/api/manifest/v2?pageSize=1 # expect 200 JSON
```
Then smoke-test the SSO round-trip:
1. Incognito → `https://wcs.grudge-studio.com/` → redirected to `https://id.grudge-studio.com/auth?app=wcs&redirect=…`.
2. Log in → redirected back with `?token=` in URL → `grudge_auth_token` in localStorage.
3. Navigate to `https://grudgedot.grudge-studio.com/` → same token is reused (no re-auth).

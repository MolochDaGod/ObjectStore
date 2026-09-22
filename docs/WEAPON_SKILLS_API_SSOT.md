# Weapon skills — one catalog, one browse page

**Browse (PARKED):** `WEAPON_SKILLS.html` + skill PNGs may 404 — do not invent fixes.  
**JSON SSOT:** https://objectstore.grudge-studio.com/api/v1/master-weaponSkills.json  
**T0:** https://objectstore.grudge-studio.com/api/v1/t0-weapons.json  
**Hosts map:** `api/v1/_meta/weapon-skills-hosts.json`

Do **not** invent skill rows. Do **not** use sprite sheets for slot icons — each skill has its own PNG (`skill.icon` + `skill.iconUrl`).

| Role | URL |
|------|-----|
| Catalog / JSON SSOT | `objectstore.grudge-studio.com` (Cloudflare Worker) — **prefer Worker** links |
| Browse (PARKED) | `WEAPON_SKILLS.html` — may 404; do not invent fixes |
| Docs HTML | `info.grudge-studio.com` — docs host only, **not** catalog SSOT |
| Pages mirror | `grudge-objectstore.pages.dev/api/v1` fallback only |
| Drafts / promote | `weapon-skills.grudge-studio.com` — Casting production overrides, **not** the catalog |

Fetch order for the HTML page: info → `./api/v1` → Pages mirror.

Icons CDN: `https://assets.grudge-studio.com/game-assets/icons/...`  
Each skill row: `grudgeUuid` (`SKIL-*`), `iconUuid` (`ICON-*`), `iconUrl`, `prefab.animationClip` = `{pack}/{role}`.  
Wiki: https://info.grudge-studio.com/wiki.html · Law: `/api/v1/uuid-law.json`

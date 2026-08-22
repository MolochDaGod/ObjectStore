# Weapon skills — one catalog, one browse page

**Browse:** https://info.grudge-studio.com/WEAPON_SKILLS.html  
**JSON:** https://info.grudge-studio.com/api/v1/master-weaponSkills.json  
**T0:** https://info.grudge-studio.com/api/v1/t0-weapons.json  
**Hosts map:** `api/v1/_meta/weapon-skills-hosts.json`

Do **not** invent skill rows. Do **not** use sprite sheets for slot icons — each skill has its own PNG (`skill.icon` + `skill.iconUrl`).

| Role | URL |
|------|-----|
| SSOT browse + JSON | `info.grudge-studio.com` (ObjectStore Vercel) |
| Same deploy alias | `objectstore.grudge-studio.com` — prefer **info** links |
| Pages mirror | `grudge-objectstore.pages.dev/api/v1` fallback only |
| Drafts / promote | `weapon-skills.grudge-studio.com` — Casting production overrides, **not** the catalog |

Fetch order for the HTML page: info → `./api/v1` → Pages mirror.

Icons CDN: `https://assets.grudge-studio.com/icons/...` (single PNG files under `icons/skills`, `icons/skills_rpg`, `icons/abilities`).

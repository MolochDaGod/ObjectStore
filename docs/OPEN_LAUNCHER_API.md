# Open launcher — library, account, engine into games

**Machine:** [`/api/v1/open-launcher.json`](../api/v1/open-launcher.json)  
**Live:** https://open.grudge-studio.com  
**Code:** `gameopen` `entryCatch.ts` · `openRoutes.ts` · `grudgeAuth.ts`

Open is the **Steam-like library + Grudge ID hub**. It is not Warlords play, not GRUDOX cabinets, not Foundry.

## Starts

| Intent | URL |
|--------|-----|
| Library | https://open.grudge-studio.com/ |
| Danger lab | `/danger` (`?era=voxel\|warlords\|nexus\|armada`) |
| Account / roster | `/account` |
| Equipment sheet | `/equipment` |
| Login | `/login` |
| Create hero | https://character.grudge-studio.com/foundry |

Library filters: **Voxel · Warlords · Nexus · Armada · Account**.

## Account → engine → game

```
id.grudge-studio.com  (JWT)
  → Open stores grudge.open.token / sso_token
  → GET /api/auth/me
  → GET /api/characters?era=<era>
  → pick characters.id (UUID)
  → play host ?characterId=<uuid>&era=<era>
```

Same-origin on Open: `/api/*` → Railway `grudge-api-production`.  
Bag/wallet/island stay **account** scoped. XP/equip stay **character** scoped.

Map change: keep Controller, weaponId, skills, camera. Rebind terrain/water/foot sampler only.

## Bans

- Racer / GRUDOX cabinet on Open Danger
- Warlords `/home-island` on the Open SPA
- `returnTo` pointing at `character.*` or `id.*`
- Second bag DB per satellite game
- Handoff with `GRDG-…` or `GRUDGE_…` as hero PK

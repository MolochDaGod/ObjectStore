# Phase 1 — Spawn identity bind + honest character mirror

**Machine:** `api/v1/spawn-grudge-identity-contract.json`  
**Matrix:** `api/v1/spawn-grudge-share-matrix.json`  
**Cook:** `scripts/sync-spawn-grudge-account.mjs`

## Goal

Update **current accounts** by linking Spawn → existing `grudge_id`, and share an **honest** character roster into Spawn mirrors. No crypto. No bag fork. No fabricated heroes.

## Preferred flow (current accounts)

```
1. Player already has Grudge ID (Discord / Puter / wallet / …)
2. Sign in at id.grudge-studio.com → fleet JWT
3. POST /api/auth/spawn-link  + Spawn sak_
4. Stamp users.spawn_user_id (409 if Spawn id belongs to another user)
5. Cook/sync → player.state.grudge mirror (characters from Railway only)
```

Spawn-first players may still use `POST /api/auth/spawn` (creates `spawn:<uuid>` if unbound). Prefer **spawn-link** when the human already has a Grudge account.

## Mirror shape (`player.state.grudge`)

```json
{
  "v": 1,
  "grudgeId": "GRUDGE_…",
  "displayName": "…",
  "spawnUserId": "uuid",
  "spawnUsername": "…",
  "syncedAt": "ISO-8601",
  "characters": [
    { "id": "uuid", "name": "…", "era": "warlords", "grudgeCode": "GRDG-…", "level": 1, "active": true }
  ]
}
```

Never store JWT or `sak_` here. Never treat this as bag/wallet SSOT.

## Cook command

```powershell
$env:SPAWN_TOKEN = (Get-Content $env:USERPROFILE\.spawn\SPAWN_TOKEN -Raw).Trim()
cd F:\GitHub\ObjectStore
node scripts/sync-spawn-grudge-account.mjs
# optional: $env:NEMESIS = "1"  # also fetch Nemesis owned-cards into spawn/player-state-nemesis.json
```

Outputs under `ObjectStore/spawn/` (gitignored if present — do not commit tokens or live JWTs):

- `grudge-account-snapshot.json` — redacted proof  
- `player-state-grudge.json` — drop-in mirror for `player.state.grudge`

## Honesty checks

1. Every `characters[].id` from auth appears on `GET https://grudge-api-production-0d46.up.railway.app/api/characters?era=<era>` with the same fleet JWT.  
2. World product era matches (Links TCG → nexus cards path; Warlords worlds → `warlords`).  
3. UI shows “stale / unlinked” if sync missing — never invent a hero.

## Next (Phase 2a — verify before burn)

**Send to account wallet** for verify/testing — soft credit `fleet_bag_gbux`, no burn, no on-chain:

- Doc: `docs/SPAWN_WALLET_VERIFY_SEND.md`
- Contract: `api/v1/spawn-wallet-verify-send-contract.json`
- Script: `scripts/verify-spawn-account-wallet.mjs`
- API: `POST /api/wallet/verify-send-to-account` (GrudgeBuilder → Railway)

## Out of scope (Phase 2b)

Server GBuX **burns** for budz/gold expenses — only after verify-send is green. See matrix `burnCandidates`.

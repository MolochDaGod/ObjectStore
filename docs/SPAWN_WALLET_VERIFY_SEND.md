# Spawn / fleet wallet — verify-send to account (no burn)

**Best practice for verify & testing:** credit the **account bag wallet** (`accounts.gbux_balance` / `fleet_bag_gbux`) with a soft-ledger send. Do **not** burn first. Do **not** use on-chain `/api/wallet/send-gbux`. Do **not** open sales UX on Spawn.

| | |
|--|--|
| **Route** | `POST /api/wallet/verify-send-to-account` |
| **Host** | `https://id.grudge-studio.com` (custom domain for Railway grudge-api) |
| **Auth** | Admin — fleet JWT with studio admin/master **or** `X-Admin-Password` when `ADMIN_PASSWORD` is set |
| **Ledger** | Soft `creditGbux` → `accounts.gbux_balance` + `gbux_transactions` |
| **On-chain** | `false` |
| **Burn** | `false` |
| **Cap** | `WALLET_VERIFY_SEND_MAX` (default **1000**) |
| **Idempotency** | Required `idempotencyKey` (min 8) → `sourceRef = verify-send:{key}` |

## Why send-before-burn

1. Confirm Spawn → `grudge_id` bind and bag read path with a real balance delta.  
2. Exercise `GET /api/wallet/overview` / status with a fleet JWT.  
3. Keep burns for **expense settle** (Phase 2 debit) after the credit path is proven.  
4. Avoid conflating SPL / Phantom / `send-gbux` with Spawn merit play.

## Request

```json
{
  "grudgeId": "GRUDGE_…",
  "amount": 10,
  "purpose": "verify",
  "idempotencyKey": "spawn-verify-2026-10-04-a1",
  "note": "optional"
}
```

| Field | Required | Notes |
|-------|----------|--------|
| `grudgeId` **or** `accountId` | yes | Prefer `grudgeId` (uppercase `GRUDGE_…`) |
| `amount` | yes | Positive integer ≤ verify cap |
| `purpose` | yes* | `verify` \| `test` \| `spawn_verify` \| `ledger_verify` (*defaults to `verify` if omitted, but scripts should set it) |
| `idempotencyKey` | yes | Min 8 chars; same key replays without double-credit |
| `note` | no | Stored in tx metadata |

## Response (success)

```json
{
  "success": true,
  "idempotent": false,
  "kind": "verify_send_to_account_wallet",
  "onChain": false,
  "burn": false,
  "grudgeId": "GRUDGE_…",
  "accountId": "…",
  "amount": 10,
  "gbuxBalanceBefore": 0,
  "gbuxBalance": 10,
  "transactionId": "…",
  "sourceRef": "verify-send:spawn-verify-…",
  "next": "GET /api/wallet/overview or /api/wallet/status with fleet JWT to confirm"
}
```

Replay with the same `idempotencyKey` returns `idempotent: true` and the original tx amounts (no second credit).

## Confirm balance (player JWT)

After admin verify-send:

1. `POST https://id.grudge-studio.com/api/auth/spawn` with Spawn `sak_` → fleet JWT + `grudgeId`.  
2. `GET {API}/api/wallet/overview` with `Authorization: Bearer <fleet JWT>`.  
3. Assert `gbuxBalance` (or overview bag field) matches the credit.

## Smoke script

```powershell
# Admin credit (requires ADMIN_PASSWORD or admin fleet JWT)
$env:ADMIN_PASSWORD = "…"   # or $env:FLEET_ADMIN_JWT
$env:GRUDGE_ID = "GRUDGE_MUUK35XI96361"
$env:AMOUNT = "10"
$env:PURPOSE = "spawn_verify"
cd F:\GitHub\ObjectStore
node scripts/verify-spawn-account-wallet.mjs

# Optional: also resolve Spawn → JWT and read overview
$env:SPAWN_TOKEN = (Get-Content $env:USERPROFILE\.spawn\SPAWN_TOKEN -Raw).Trim()
$env:CONFIRM_OVERVIEW = "1"
node scripts/verify-spawn-account-wallet.mjs
```

## Related routes (do not use for this step)

| Route | Why rejected here |
|-------|-------------------|
| `POST /api/wallet/send-gbux` | On-chain; banned on Spawn |
| `POST /api/wallet/purchase*` | Sales |
| `POST /api/wallet/transfer-to-play` | Still requires Solana address |
| Admin burn / debit expense | Phase 2 — **after** verify-send is green |
| `POST /api/admin/grant-gbux` | Larger uncapped admin grants; OK ops, but verify path prefers capped + idempotent verify-send |

## Product locks

- No crypto / sales UX on Spawn.  
- Railway is player SSOT; Spawn `player.state` is mirror-only.  
- `fleet_bag_gbux` ≠ `nemesis_gbux` ≠ play gold ≠ SPL `$BUDZ`.  
- Burn settles expenses later; verify starts with **send to account wallet**.

## Matrix / contracts

- `api/v1/spawn-grudge-share-matrix.json` — `verifySend` + phaseGate  
- `api/v1/spawn-wallet-verify-send-contract.json` — machine shape  
- Phase 0/1 docs remain identity/research; this doc is the verify credit SSOT.

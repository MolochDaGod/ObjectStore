# Phase 0 — Spawn ↔ Grudge share research matrix

**Status:** research complete · **no burn/money code in this doc**  
**Product locks:** honest characters · no crypto/sales on Spawn · merit play · server GBuX burns settle budz/gold **expenses**  
**Machine JSON:** `api/v1/spawn-grudge-share-matrix.json`  
**Related:** Nemesis `SPAWN_NEMESIS_ACCOUNT_SYNC.md` · Links `GRUDGE_SOCIAL_AND_GBUX_ENTRY.md` · account-game-uuid law

## Why this phase exists

A silly plan would:

- Put Solana / `$BUDZ` SPL / `wallet.grudge-studio.com` sales inside Spawn  
- Treat golf `player.state` gold as paid GBuX  
- Invent a second bag or character roster in Spawn SQL  
- Reuse `/api/wallet/transfer-to-play` as-is (it still requires a Solana address even when the debit is server-side)

This matrix keeps currencies and character truth honest before any expense API is built.

## Currency piles (do not conflate)

| ID | Name | Authority | On-chain? | Spawn UI |
|----|------|-----------|-----------|----------|
| `fleet_bag_gbux` | Fleet bag GBUX | Railway `accounts.gbux_balance` via grudge-api `/api/wallet/*` | Soft ledger; **separate** `/send-gbux` is on-chain | Mirror balance OK; **no** send/purchase UI |
| `nemesis_gbux` | Nemesis game GBuX | Nemesis Railway `users.gbux_balance` + `gbux_transactions` | Soft ledger (packs/rewards) | Mirror OK; burns for Links/TCG **preferred** |
| `play_gold` | In-world gold (e.g. golf) | Often Spawn `player.state` | No | Play juice only — **≠ paid** |
| `play_budz` | Play “budz” expense token | TBD product ledger after burn receipt | No (on Spawn) | Shown after **server** expense settle |
| `spl_gbux_budz` | THC Labz `$BUDZ` = GBUX SPL mint | Solana + Dope-Budz rails | **Yes** | **Banned on Spawn** |
| `thc_vault` | Hub vault THC harvest | Dope-Budz Railway | Mixed | **Banned on Spawn** |

**Rule:** Spawn never opens Phantom checkout, DEX, or “buy GBUX” sales. Merit expenses = debit a **server** soft ledger, then stamp a receipt mirror.

## Spawn world → ledger recommendation

| Spawn surface | Identity | Character honesty | Expense burn (Phase 2 candidate) | Notes |
|---------------|----------|-------------------|----------------------------------|-------|
| `@survival/grudge-links` | `/api/auth/spawn` + spawn-link | Fleet JWT characters + Nemesis owned-cards cook | **`nemesis_gbux`** | SOCIAL drawer; golf gold ≠ GBuX |
| Nemesis TCG places in Links | same + Nemesis SSO | Card UUIDs from `user_season0_cards` only | **`nemesis_gbux`** | Already documented |
| `@survival/grudge-warlords-open-water` | spawn + fleet JWT | Warlords era heroes from grudge-api | **`fleet_bag_gbux`** via **new wallet-free burn** | Needs Phase 2 API design |
| `@racalvin/grudge-warlords` | same when linked | same | same as open-water | Editor standing separate |
| `@legion/*` social | optional link | Do not invent Grudge heroes | none unless product asks | Identity-only unless contracted |

## Burn path research (Phase 2 prerequisites)

| Candidate | Fits Spawn merit? | Blocker |
|-----------|-------------------|---------|
| Nemesis pack/spend debit on `gbux_balance` | **Yes** for Links/TCG | Need explicit “expense” receipt API + idempotency if not only packs |
| Fleet `debitGbux` on `accounts.gbux_balance` | **Yes** if new route | Do **not** require Solana wallet; do **not** call `/send-gbux` |
| `/api/wallet/transfer-to-play` | **No** for Spawn v1 | Requires Solana address; poker-oriented games list |
| `/api/wallet/send-gbux` / purchase | **No** | On-chain / sales — banned on Spawn |
| Decrement `player.state` only | **No** | Forks ledger |

**Phase 2 design target:** `POST` authenticated expense settle → `{ kind: budz_expense|gold_expense|entry_fee, amount, idempotencyKey }` → debit chosen soft ledger → `{ receiptId, balanceAfter }` → Spawn mirrors `player.state.grudge.expense`.

## Character honesty fields

### Returned today by `buildSpawnAuthBody` (id auth)

| Field | Source | Spawn may mirror |
|-------|--------|------------------|
| `grudgeId` | `users.grudge_id` | yes |
| `token` | fleet JWT | agent/cook only — **never** commit / player.state |
| `account.id` / `displayName` | accounts | yes |
| `spawn.userId` / `username` / `handle` | Spawn `/me` | yes |
| `characters[].id` | `characters.id` UUID | **required** for honesty |
| `characters[].name` | characters.name | yes |
| `characters[].era` | `game_era` | yes |
| `characters[].grudgeCode` | display stamp | yes (not PK) |
| `characters[].level` | characters.level | yes |
| `characters[].active` | activeForEra | yes |
| `isNew` | resolve path | diagnostics |

### Must stay Railway-only until a later read sync

`mesh_ids`, body equip, profession XP, bag qty, unique `grudge_uuid`, home island state — show only after a dedicated sync that reads the same APIs Foundry/Warlords use. Do not invent values in Spawn YAML.

### Honesty tests (Phase 1)

1. Every mirrored `characters[].id` exists on `GET /api/characters?era=` for that JWT.  
2. `era` matches the world product (warlords vs nexus).  
3. No hero appears on Spawn that Railway does not own.  
4. Handoff off-Spawn still uses `?characterId=<uuid>&era=` only.

## Identity bind (current accounts)

| Intent | API | Safe? |
|--------|-----|-------|
| Link Spawn → **existing** Grudge | `POST /api/auth/spawn-link` | **Preferred** |
| Spawn-first / already linked | `POST /api/auth/spawn` | OK; may create `spawn:<uuid>` user if unbound |
| Merge orphan `spawn:*` into Discord/Puter | support tooling | Optional later; audited |

## Shared database

**One physical player SSOT:** Railway Postgres for the product in play (grudge-api and/or Nemesis).  
Spawn world SQL / `player.state` = mirror. D1 = assets only.

## Anti-forks (carry into Phase 1–2)

- No crypto sales or Phantom flows in Spawn  
- No on-chain `$BUDZ` / SPL GBUX as Spawn expense  
- Golf gold ≠ GBuX ≠ THC vault  
- No second character roster  
- No “paid” without Railway/Nemesis receipt  
- No storing `sak_` or fleet JWT in git / world tree  

## Exit criteria for Phase 0

- [x] Currency piles named and separated  
- [x] Per-world ledger recommendation  
- [x] Character honesty field list from live auth shape  
- [x] Burn candidates ranked; transfer-to-play / send-gbux rejected for Spawn v1  
- [x] Matrix published on ObjectStore  

## Next

**Phase 1:** identity contract polish + SOCIAL/mirror + cook sync for honest roster.  
**Phase 2:** implement wallet-free server GBuX expense settle per matrix row.

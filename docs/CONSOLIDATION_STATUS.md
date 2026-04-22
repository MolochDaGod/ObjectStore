# Grudge Items - One-Truth Consolidation Status

Tracks progress of the category-by-category item/icon consolidation across
ObjectStore, `grudge-game-data-hub`, and every downstream Grudge deployment.

## Locked decisions (see `AGENTS.md` for full text)
- **D1** ObjectStore is the master; each game has its own consumer page.
- **D2** Legacy items fold in per-session with user sign-off.
- **D3** End-game magic weapons are the **Artifact** category (hidden-until-found).
- **D4** Tomes are tier-less off-hand spell-grants.
- **D5** Tier labels: T5 Heroic, T8 Legendary.
- **D6** `grudge-game-data-hub` moves to prefetch-at-build + revalidate-at-runtime.

## Foundation (done)
- `scripts/audit-items.mjs` produces `api/v1/_audit/items-audit.json` and `docs/ITEMS_AUDIT.md`.
- D5 tier labels applied in both generators; both `master-items.json` outputs regenerated.
- `api/v1/items-legacy.json` frozen (3,425 items) - source for legacy triage.
- `scripts/defs/` scaffolded: `weapons.mjs`, `armor.mjs`, `consumables.mjs`, `materials.mjs`, `offhand-tomes.mjs`, `artifacts.mjs` (all empty, filled during sessions).
- `docs/consolidation/session-1-swords-axes-daggers.md` prepared.

## Consolidation sessions
Session | Categories | Status
--- | --- | ---
#1 | swords, axes, daggers | In user review
#2 | hammers, greatswords, greataxes | Queued
#3 | spears, maces, shields | Queued
#4 | bows, crossbows, guns | Queued
#5 | fireStaves, frostStaves, holyStaves, lightningStaves, natureStaves | Queued
#6 | artifacts (arcane first) | Queued
#7 | offhand-tomes | Queued
#8 | armor (cloth / leather / mail / plate x slots x sets) | Queued
#9 | consumables - food (red/green/blue), potions, scrolls, throwables, bombs | Queued
#10 | materials (ore, ingot, wood, cloth, leather, essence, gem, herb) | Queued

## After all sessions
- Rewrite `scripts/generate-master-database.mjs` to import from `scripts/defs/*`.
- Unique-icon resolver: `icon-index.json` -> `/icons/weapons/<slug>.png` -> pack fallback; collisions fail the build.
- Publish new endpoints: `master-items.json`, `master-armor.json`, `master-consumables.json`, `master-artifacts.json`, `master-registry.json`.
- Worker route `GET /v1/items/:idOrUuid` resolves UUID / slug / base name.
- `grudge-game-data-hub` consumer loader ships -> delete its generator + static data.
- Word-control sweep: remove `tierLabel === 'Legendary'` from T5 sites; remove `'Legendary Artifact'` from T8 sites; route `'arcaneStaves'` / `'arcane'` staff references to `'artifact'` / `'artifact-arcane'`.
- Verification audit run + spot-checks on info.grudge-studio.com, molochdagod.github.io/ObjectStore, client.grudge-studio.com, grudge-crafting.puter.site.

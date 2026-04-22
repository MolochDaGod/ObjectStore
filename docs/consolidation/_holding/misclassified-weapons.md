# Holding: Misclassified legacy weapons

These items live in `items-legacy.json` under `category: "weapon"` with icon
paths that put them in the Sword / Axe / Dagger packs, but their tooltips
clearly describe different weapon types (staves, spires, hammers, mauls,
etc.). During Session #1 (swords / axes / daggers) these are **held** in
this file rather than folded, per Q-S1.3. Their true categories will
decide them in later sessions.

## How to triage each entry

When the matching future session opens (hammers / staves / etc.), resolve
each item with one of:

- **(a)** promote to a named base item in the true category, with bespoke
  icon at `/icons/weapons/<slug>.png` if present on disk;
- **(b)** fold into the T1 starter for the true category;
- **(c)** drop (redundant with an existing base item of the true category);
- **(d)** keep in legacy as lore-only and filter out of player-facing UIs.

## Entries

The listing below is keyed by the session that should resolve it.

### Session #2 - hammers (2h)

_Icon: Sword_*, true class: hammer/maul/pound/crush_

- Bloodpound - `Sword_42.png`
- Wrathpound - `Sword_15.png`
- Emberpound - `Sword_39.png`
- Ironcrush - `Sword_21.png`
- Embershatter - `Sword_54.png`
- Wrathquake - `Sword_37.png`
- Duskmallet - `Sword_14.png`
- Emberforge - `Sword_58.png`
- Ironbreaker - `Sword_35.png` (see bespoke `/icons/weapons/ironbreaker.png`)

### Session #5 - staves (fire / frost / holy / nature / lightning)

_Icon: Sword_*, true class: staff/spire_

- Bloodspire - `Sword_08.png` (see bespoke `/icons/weapons/bloodspire.png`)
- Doomspire - `Sword_12.png` (see bespoke `/icons/weapons/doomspire.png`)
- Voidspire - `Sword_54.png` (see bespoke `/icons/weapons/voidspire.png`)
- Chaos Spire - `Sword_05.png`
- Thunder Spire - `Sword_58.png`
- Blossom Fury - `Sword_06.png` (nature staff)
- Ember Heart - `Sword_08.png` (fire staff)
- Blizzard Heart - `Sword_57.png` (frost staff)
- Ether Heart - `Sword_37.png` (arcane-school tome/artifact?)
- Voltaic Heart - `Sword_41.png` (lightning staff)
- Arcane Fury - `Sword_30.png` (arcane staff)
- Blazing Wrath - `Sword_48.png` (fire staff)
- Celestial Grace - `Sword_15.png` (holy staff)
- Frozen Spite - `Sword_20.png` (frost staff)
- Holy Wrath - `Sword_54.png` (holy staff)
- Ice Warden - `Sword_30.png` (frost staff)
- Ironbreak - `Sword_30.png` (re-check: hammer or sword?)
- Mystic Grudge - `Sword_09.png` (arcane staff)
- Root Warden - `Sword_14.png` (nature staff)
- Shock Grudge - `Sword_22.png` (lightning staff)
- Void Warden - `Sword_37.png` (arcane/void)
- Wild Oathbreaker - `Sword_40.png` (nature staff)
- Winter Grudge - `Sword_42.png` (frost staff)

### Session #6 - Artifact (arcane)

_Likely end-game magic weapons, currently miscategorised as swords_

- Ironwrath - `Sword_33.png` (named bespoke; promote if set piece)
- Emberbrand - `Sword_03.png` (named bespoke)
- Wraithblade - `Sword_33.png` (named bespoke)
- Wraithhew - `Sword_26.png` (named bespoke)
- Dusksplitter - `Sword_25.png` (named bespoke)

### Uncategorized (review with user during Session #5-6)

- Hellfire Blade - `Sword_20.png` - hellfire weapon; could be artifact
- Sword Of The Storm - `Sword_28.png` - named unique; could be artifact
- Demons Shard - `Sword_12.png` - tier hint; maybe T-named item
- Emerald Sword - `Sword_23.png` - generic named; maybe sword fold-in
- Frost Blade - `Sword_12.png` - likely frost staff or artifact
- Runed Great Sword - `Sword_27.png` - greatsword (Session #2)

## Source

All entries are from `api/v1/items-legacy.json` filtered by the Session #1
extractor's classifier. Full tooltips and raw icons are kept in
`docs/consolidation/session-1-swords-axes-daggers.md` under `legacy -> sword`.

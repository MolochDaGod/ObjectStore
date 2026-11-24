# God hunts (draft)

Status: **draft**. Names are final: ALE chose them under Jonathan's delegation on 2026-11-23 ("you chose, and use original grudge lore systems best you can"), checked against a World of Warcraft name list. Numbers are tuning picks. No line is live in Grudge Warlords until its avatar has approved art.

Data: [`api/v1/god-hunts.json`](../api/v1/god-hunts.json). Check: `node scripts/check-god-hunts.mjs`.

## What this is
The five race gods ratified on 2026-11-23 (Lorian, Thalindra, Grundor, Kragoth, Zephyria) are canon bosses. Since the Godwake, each god walks the world as an avatar that tests its people. A hunt line starts with a quest-giver in a faction town, sends the player to a lore site, real foes and a gathering offering, then to the god's avatar on an event isle. Beating the avatar earns the god's mark. The god itself is never killed.

## Source of truth
Gameplay lives in Spawn (`@racalvin/grudge-warlords`, `scripts/lib/data/god-hunts.js`). This file mirrors it for info only. The draft is local on `ale/god-hunts-draft` (head `bdd8de8e`, tree `9cf4ec9e`, base main `ff7f83ed`) and has not been pushed; the push waits on Verdict's SIGN. God ids come from `api/v1/lore-canon.json` on `canon/manifest-lore-v1`.

## Id law
`LORE-XXXX-XXXX-XXXX` = first 12 hex of `sha1("grudge-lore:{kind}:{slug}")`. Boss: `boss:<god>`. Line: `quest:<god>-hunt`.

## Art
There is no avatar art yet. Clients show the missing marker. Approved art may only come from `assets.grudge-studio.com`. No stand-in art.

## Lines
### Lorian, the Weaver of Fate
- **Line:** The Unwoven Thread (`LORE-A901-0CA2-9AE4`), faction: crusade
- **Starts:** Herald Maud, Whitehaven
- **Steps:** Talk to Lord-Marshal Edric Halloway → Reach Raider Ridge → Defeat 3 × oathbreaker → Gather 12 through Woodcutting → Reach Ashen Ring → Defeat The Loomwarden
- **Boss:** The Loomwarden, Thread of Lorian (`LORE-7DF9-74F7-49BC`), level 20, 4800 HP, at Ashen Ring (`event:crusade:2`)
- **Abilities:** Severed Thread, Loom of Choices, Fate's Knot, Unweaving
- **Rewards:** 550 gold, 2100 XP, starweave-thread ×3, voidweave-thread ×1

### Thalindra, the Guardian of Nature
- **Line:** The Grove Remembers (`LORE-6EDA-6E49-D988`), faction: fabled
- **Starts:** Grove-Mother Illa, Sunspire
- **Steps:** Talk to Sael Thornwhisper → Reach Wildwood → Defeat 4 × carniflora → Gather 12 through Herbalism → Reach Starfall Shoal → Defeat The Thornmother
- **Boss:** The Thornmother, Wildheart of Thalindra (`LORE-E8B4-4D81-5E87`), level 20, 4600 HP, at Starfall Shoal (`event:fabled:2`)
- **Abilities:** Bramble Lash, Thornbind, Stag Rush, Greenburst
- **Rewards:** 550 gold, 2100 XP, worldtree-log ×2, ancient-essence ×1

### Grundor, the Forge Master
- **Line:** The Cold Forge (`LORE-54DD-36FA-D4BB`), faction: fabled
- **Starts:** Dagna Emberhollow, Sunspire
- **Steps:** Talk to Brunhild Copperbraid → Reach Dune Forge → Defeat 5 × shale golem → Gather 20 through Mining → Reach Rune Spire → Defeat Emberanvil
- **Boss:** Emberanvil, Forge-Born of Grundor (`LORE-620D-BCF2-225F`), level 20, 5200 HP, at Rune Spire (`event:fabled:1`)
- **Abilities:** Hammer Swing, Anvilfall, Ember Spray, Forge Heart
- **Rewards:** 550 gold, 2100 XP, starmetal-ingot ×2, radiant-gem ×1

### Kragoth, the Warlord of Rage
- **Line:** Trophies for the Tribe (`LORE-058E-6DB8-017A`), faction: legion
- **Starts:** Drillmaster Krug, Gorehold
- **Steps:** Talk to Grey-Mother Uska → Reach Goathorn Hills → Defeat 3 × chieftain → Defeat 2 × ogre blademaster → Reach Blood Reef → Defeat The Trophy-King
- **Boss:** The Trophy-King, Rage of Kragoth (`LORE-BF77-B6DC-6304`), level 20, 5000 HP, at Blood Reef (`event:legion:0`)
- **Abilities:** Trophy Cleave, Tusk Charge, Bloodroar, Unbroken Rage
- **Rewards:** 550 gold, 2100 XP, titan-hide ×2, titan-leather ×1

### Zephyria, the Eternal Flame
- **Line:** Ashes That Remember (`LORE-F93E-8451-22B7`), faction: none
- **Starts:** Korvash the Ember-Scaled, Saltgrudge Harbor
- **Steps:** Talk to Marta Saltgrudge → Reach Ember Rise → Defeat 4 × horned fire drake → Defeat 1 × caldera warden → Reach Throne Drift → Defeat The Unending Pyre
- **Boss:** The Unending Pyre, Wake of Zephyria (`LORE-04BF-2DE9-A7D7`), level 20, 5600 HP, at Throne Drift (`event:crusade:1`)
- **Abilities:** Pyre Breath, Ashfall, Cinder Talons, Pyre Renewal
- **Rewards:** 550 gold, 2100 XP, dragon-sinew ×3, divine-essence ×1

## Open items
- Avatar models for all five gods (blocking: lines stay hidden until then).
- Event isles are live 75 s per cycle. Holding an isle up while its avatar is engaged is proposed, not built.
- Starweave Canopy (elves) and Runeforge Hold (dwarves) have no NPCs, so Thalindra and Grundor start at Sunspire.
- Zephyria has no faction (dragons are not a playable race), so her line starts at Saltgrudge Harbor.
- Faction gating of who may take a line is not enforced.
- Starfall Shoal is the canon atlas name of event:fabled:2. "Starfall" is also a World of Warcraft spell; renaming an atlas isle is outside this pass.

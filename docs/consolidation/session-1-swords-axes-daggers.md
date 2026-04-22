# Consolidation Session #1 — Swords, Axes, Daggers

Goal: produce one authoritative list per category, with every item having a unique bespoke icon, a profession, a recipe, tier-8 stats, and a place in the new professions/class/RTS system. Legacy items fold into the new system (no auto-tagging); each group below needs your call.

## Current Grudge-system items (already in master-items.json)

### swords (6)
- **Bloodfeud Blade** — Forged in endless clan blood feuds. Vengeful Slash: Builds Grudge Mark stack.
    - icon now: `Sword_01.png`
    - abilities: Blood Rush, Iron Grudge, Clan Charge, Heroic Cleave, Parry Counter, Deep Wound
    - signature: Crimson Reprisal
    - passives: Bloodlust (5% lifesteal), Swift Vengeance (+15% atk speed), Deep Cuts (+20% bleed dmg)
- **Wraithfang** — Whispers forgotten grudges. Shadow Edge: Dash + Stun.
    - icon now: `Sword_02.png`
    - abilities: Shadow Edge, Execute, Bleed Chain, Fatal Strike
    - signature: Night's Judgment
    - passives: Life Leech, Aggressive Rush, Grudge Bleed
- **Oathbreaker** — Breaks ancient oaths. Lunging Strike: Ranged thrust.
    - icon now: `Sword_03.png`
    - abilities: Lunging Strike, Shadow Dash, Fearful Swipe, Hamstring, Betrayer's Mark, Oathbreak
    - signature: Ancestral Curse
    - passives: Resilience, Armor Pen, Block Mastery
- **Kinrend** — Rends bonds of kinship. Kin Strike: High single target damage.
    - icon now: `Sword_04.png`
    - abilities: Kin Strike, Ancestral Fury, Family Grudge, Root Bind
    - signature: Wrath of Kin
    - passives: Bloodlust, Swift Vengeance, Deep Cuts
- **Dusksinger** — Sings of twilight. Dusk Blade: Invisible dash.
    - icon now: `Sword_05.png`
    - abilities: Dusk Blade, Twilight Slash, Night Strike
    - signature: Eventide Reckoning
    - passives: Shadow Walk, Crit Surge, Evasion Master
- **Emberclad** — Clad in flames. Flame Slash: Applies burn.
    - icon now: `Sword_06.png`
    - abilities: Flame Slash, Inferno Wave, Magma Strike
    - signature: Solar Annihilation
    - passives: Burn Master, Fire Aura, Ember Shield

### axes (6)
- **Gorehowl** — Howls with gore. Rending Chop: Applies Bleed.
    - icon now: `Axe_01.png`
- **Skullsplitter** — Splits skulls. Headcracker: Stun + Damage.
    - icon now: `Axe_02.png`
- **Veinreaver** — Reaves veins. Blood Harvest: AoE Lifesteal.
    - icon now: `Axe_03.png`
- **Ironmaw** — Maw of iron. Iron Bite: Ignores defense.
    - icon now: `Axe_04.png`
- **Dreadcleaver** — Cleaves dread. Frenzied Chop: High burst damage.
    - icon now: `Axe_05.png`
- **Bonehew** — Hews bone. Bone Break: Reduces armor.
    - icon now: `Axe_06.png`

### daggers (6)
- **Nightfang** — Fang of night. Shadow Stab: Builds Mark.
    - icon now: `Dagger_01.png`
- **Bloodshiv** — Drips blood. Crimson Stab: High bleed.
    - icon now: `Dagger_02.png`
- **Wraithclaw** — Claw of wraith. Shadow Strike: AoE Silence.
    - icon now: `Dagger_03.png`
- **Emberfang** — Burning hate. Flame Dagger: Burn DoT.
    - icon now: `Dagger_04.png`
- **Ironspike** — Unyielding iron. Pinning Stab: Root burst.
    - icon now: `Dagger_05.png`
- **Duskblade** — Blade of dusk. Frenzied Cuts: Multi burst.
    - icon now: `Dagger_06.png`

## Bespoke icons available but not wired

- **swords**: 6
    - Bloodfeud Blade → `icons/weapons/bloodfeud-blade.png`
    - Wraithfang → `icons/weapons/wraithfang.png`
    - Oathbreaker → `icons/weapons/oathbreaker.png`
    - Kinrend → `icons/weapons/kinrend.png`
    - Dusksinger → `icons/weapons/dusksinger.png`
    - Emberclad → `icons/weapons/emberclad.png`
- **axes**: none (all current items either have bespoke icons or we haven't drawn bespokes yet)
- **daggers**: 3
    - Nightfang → `icons/weapons/nightfang.png`
    - Bloodshiv → `icons/weapons/bloodshiv.png`
    - Emberfang → `icons/weapons/emberfang.png`

## Legacy items to fold in (items-legacy.json)

Each legacy item below needs a decision: **(a)** fold into an existing current item as a reskin/rename, **(b)** fold in as a new named item in the same category, **(c)** move to a different category (e.g. greatsword → 2h swords), or **(d)** drop entirely.

### legacy → sword (164)
- **Blacksmiths Sword** — dmg 10, level 1, icon `Sword_10.png`  
    _Blacksmiths Sword_
- **Recurve** — dmg 25, level 5, icon `Sword_05.png`  
    _Recurve_
- **Hellfire Blade** — dmg 100, level 20, icon `Sword_20.png`  
    _Hellfire Blade_
- **Sword Of The Storm** — dmg 100, level 20, icon `Sword_28.png`  
    _Sword Of The Storm_
- **Metal Sword** — dmg 5, level 1, icon `Sword_03.png`  
    _Metal Sword_
- **Commandor Sword** — dmg 25, level 5, icon `Sword_25.png`  
    _Commandor Sword_
- **Demons Shard** — dmg 50, level 10, icon `Sword_12.png`  
    _Demons Shard_
- **Emerald Sword** — dmg 75, level 10, icon `Sword_23.png`  
    _Emerald Sword_
- **Frost Blade** — dmg 100, level 20, icon `Sword_12.png`  
    _Frost Blade_
- **Runed Great Sword** — dmg 100, level 20, icon `Sword_27.png`  
    _Runed Great Sword_
- **Fishing Pole** — dmg 10, level 1, icon `Sword_19.png`  
    _Fishing Pole_
- **Pickaxe** — dmg 10, level 1, icon `Sword_21.png`  
    _Pickaxe_
- **Arcane Fury** — dmg 72, level 5, icon `Sword_30.png`  
    _Arcane Fury - Fury of raw arcane power, unpredictable but devastating. | 72 Damage | 8 Defense | Tier 1 | Sells for: 60 Gold_
- **Blazing Wrath** — dmg 72, level 5, icon `Sword_48.png`  
    _Blazing Wrath - Wrath made blazing manifest, consuming all in flames. | 72 Damage | 8 Defense | Tier 1 | Sells for: 60 Gold_
- **Blizzard Heart** — dmg 65, level 5, icon `Sword_57.png`  
    _Blizzard Heart - Heart of a blizzard, summoning snowstorms at will. | 65 Damage | 10 Defense | Tier 1 | Sells for: 60 Gold_
- **Bloodpound** — dmg 88, level 5, icon `Sword_42.png`  
    _Bloodpound - Pounds enemies into bloody mist, horrifically effective. | 88 Damage | 36 Defense | Tier 1 | Sells for: 60 Gold_
- **Bloodspire** — dmg 78, level 5, icon `Sword_08.png`  
    _Bloodspire - Spire of bloodshed, stained crimson from countless battles. | 78 Damage | 33 Defense | Tier 1 | Sells for: 60 Gold_
- **Blossom Fury** — dmg 64, level 5, icon `Sword_06.png`  
    _Blossom Fury - Fury of blossoms, beautiful and deadly. | 64 Damage | 11 Defense | Tier 1 | Sells for: 60 Gold_
- **Celestial Grace** — dmg 52, level 5, icon `Sword_15.png`  
    _Celestial Grace - Grace of celestials, blessing all it touches. | 52 Damage | 20 Defense | Tier 1 | Sells for: 60 Gold_
- **Chaos Spire** — dmg 70, level 5, icon `Sword_05.png`  
    _Chaos Spire - Spire of pure chaos, effects unpredictable but powerful. | 70 Damage | 8 Defense | Tier 1 | Sells for: 60 Gold_
- **Doomspire** — dmg 80, level 5, icon `Sword_12.png`  
    _Doomspire - A towering blade of doom, crushing all before it. | 80 Damage | 35 Defense | Tier 1 | Sells for: 60 Gold_
- **Dusksplitter** — dmg 84, level 5, icon `Sword_25.png`  
    _Dusksplitter - Splits the twilight veil, drawing power from the dying light. | 84 Damage | 33 Defense | Tier 1 | Sells for: 60 Gold_
- **Ember Heart** — dmg 64, level 5, icon `Sword_08.png`  
    _Ember Heart - Heart of eternal ember, providing warmth and destruction. | 64 Damage | 12 Defense | Tier 1 | Sells for: 60 Gold_
- **Emberbrand** — dmg 84, level 5, icon `Sword_03.png`  
    _Emberbrand - Branded with eternal flame, scorching all it touches. | 84 Damage | 34 Defense | Tier 1 | Sells for: 60 Gold_
- **Emberpound** — dmg 57, level 5, icon `Sword_39.png`  
    _Emberpound - Pounds with ember heat, each strike leaving scorch marks. | 57 Damage | 28 Defense | Tier 1 | Sells for: 60 Gold_
- **Embershatter** — dmg 89, level 5, icon `Sword_54.png`  
    _Embershatter - Shatters with burning force, leaving fiery destruction. | 89 Damage | 37 Defense | Tier 1 | Sells for: 60 Gold_
- **Engineer's Toolkit** — dmg 42, level 5, icon `Sword_03.png`  
    _Engineer's Toolkit - Comprehensive toolkit for repairs and improvised combat. | 42 Damage | 14 Defense | Tier 1 | Sells for: 60 Gold_
- **Ether Heart** — dmg 60, level 5, icon `Sword_37.png`  
    _Ether Heart - Heart of pure ether, manipulating magical energies. | 60 Damage | 13 Defense | Tier 1 | Sells for: 60 Gold_
- **Frozen Spite** — dmg 68, level 5, icon `Sword_20.png`  
    _Frozen Spite - Spite made frozen, shattering enemies from within. | 68 Damage | 9 Defense | Tier 1 | Sells for: 60 Gold_
- **Heavy Iron Blade** — dmg 25, level ?, icon `Sword_14.png`  
    _Heavy Iron Blade - Unwieldy but packs a punch. | 25 Damage | 10 Defense | Tier 0 | Sells for: 20 Gold_
- **Holy Wrath** — dmg 65, level 5, icon `Sword_54.png`  
    _Holy Wrath - Wrath of the divine made manifest in holy fire. | 65 Damage | 12 Defense | Tier 1 | Sells for: 60 Gold_
- **Ice Warden** — dmg 58, level 5, icon `Sword_30.png`  
    _Ice Warden - Warden of ice that protects as it destroys. | 58 Damage | 15 Defense | Tier 1 | Sells for: 60 Gold_
- **Ironbreak** — dmg 62, level 5, icon `Sword_30.png`  
    _Ironbreak - Breaks iron with every swing, sundering metal and bone. | 62 Damage | 32 Defense | Tier 1 | Sells for: 60 Gold_
- **Ironcrush** — dmg 96, level 5, icon `Sword_21.png`  
    _Ironcrush - Crushes iron flat, nothing withstands its weight. | 96 Damage | 44 Defense | Tier 1 | Sells for: 60 Gold_
- **Ironedge** — dmg 76, level 5, icon `Sword_40.png`  
    _Ironedge - Pure iron edge that never dulls, cleaving through all. | 76 Damage | 38 Defense | Tier 1 | Sells for: 60 Gold_
- **Ironrend** — dmg 90, level 5, icon `Sword_28.png`  
    _Ironrend - Rends iron like cloth, nothing can withstand its edge. | 90 Damage | 36 Defense | Tier 1 | Sells for: 60 Gold_
- **Mining Pick** — dmg 40, level 5, icon `Sword_02.png`  
    _Mining Pick - Sturdy pick for mining operations and occasional combat. | 40 Damage | 15 Defense | Tier 1 | Sells for: 60 Gold_
- **Mining Sledge** — dmg 30, level ?, icon `Sword_51.png`  
    _Mining Sledge - A miner's sledgehammer, heavy and brutal. | 30 Damage | 12 Defense | Tier 0 | Sells for: 20 Gold_
- **Mystic Grudge** — dmg 64, level 5, icon `Sword_09.png`  
    _Mystic Grudge - Grudge channeled through mystic energies. | 64 Damage | 11 Defense | Tier 1 | Sells for: 60 Gold_
- **Old Flintlock** — dmg 22, level ?, icon `Sword_22.png`  
    _Old Flintlock - An antique firearm that still goes bang... sometimes. | 22 Damage | 2 Defense | Tier 0 | Sells for: 20 Gold_
- **Root Warden** — dmg 56, level 5, icon `Sword_14.png`  
    _Root Warden - Warden of ancient roots, commanding earth's power. | 56 Damage | 15 Defense | Tier 1 | Sells for: 60 Gold_
- **Rusty Sword** — dmg 15, level ?, icon `Sword_49.png`  
    _Rusty Sword - A worn blade, barely sharp enough to cut bread. | 15 Damage | 5 Defense | Tier 0 | Sells for: 20 Gold_
- **Shock Grudge** — dmg 62, level 5, icon `Sword_22.png`  
    _Shock Grudge - Grudge channeled through shocking power. | 62 Damage | 10 Defense | Tier 1 | Sells for: 60 Gold_
- **Thunder Spire** — dmg 70, level 5, icon `Sword_58.png`  
    _Thunder Spire - Spire that calls thunder with every spell. | 70 Damage | 8 Defense | Tier 1 | Sells for: 60 Gold_
- **Void Warden** — dmg 66, level 5, icon `Sword_37.png`  
    _Void Warden - Warden of the void, controlling darkness itself. | 66 Damage | 12 Defense | Tier 1 | Sells for: 60 Gold_
- **Voidspire** — dmg 68, level 5, icon `Sword_54.png`  
    _Voidspire - Spire reaching into the void, drawing forbidden power. | 68 Damage | 10 Defense | Tier 1 | Sells for: 60 Gold_
- **Voltaic Heart** — dmg 68, level 5, icon `Sword_41.png`  
    _Voltaic Heart - Heart of pure voltage, crackling with electric potential. | 68 Damage | 10 Defense | Tier 1 | Sells for: 60 Gold_
- **Wild Oathbreaker** — dmg 62, level 5, icon `Sword_40.png`  
    _Wild Oathbreaker - Breaks the oaths of civilization, returning to wild nature. | 62 Damage | 12 Defense | Tier 1 | Sells for: 60 Gold_
- **Winter Grudge** — dmg 62, level 5, icon `Sword_42.png`  
    _Winter Grudge - Grudge of endless winter, freezing hearts solid. | 62 Damage | 11 Defense | Tier 1 | Sells for: 60 Gold_
- **Wraithblade** — dmg 82, level 5, icon `Sword_33.png`  
    _Wraithblade - Ethereal edges that cut through the veil between worlds. | 82 Damage | 30 Defense | Tier 1 | Sells for: 60 Gold_
- **Wraithhew** — dmg 82, level 5, icon `Sword_26.png`  
    _Wraithhew - Hews through spirit and flesh alike, feared by the living and dead. | 82 Damage | 33 Defense | Tier 1 | Sells for: 60 Gold_
- **Wrathpound** — dmg 59, level 5, icon `Sword_15.png`  
    _Wrathpound - Pounds with divine wrath, righteous fury made manifest. | 59 Damage | 29 Defense | Tier 1 | Sells for: 60 Gold_
- **Wrathquake** — dmg 92, level 5, icon `Sword_37.png`  
    _Wrathquake - Creates earthquakes with wrathful strikes, splitting the ground. | 92 Damage | 42 Defense | Tier 1 | Sells for: 60 Gold_
- **Ironwrath** — dmg 73, level 5, icon `Sword_33.png`  
    _Ironwrath - Wrath of unyielding iron. | 73 Damage | 34 Defense | T1 | Sells for: 60 Gold_
- **Emberforge** — dmg 81, level 5, icon `Sword_58.png`  
    _Emberforge - Forge of ember strikes. | 81 Damage | 42 Defense | T1 | Sells for: 60 Gold_
- **Ironbreaker** — dmg 83, level 5, icon `Sword_35.png`  
    _Ironbreaker - Breaks iron with force. | 83 Damage | 44 Defense | T1 | Sells for: 60 Gold_
- **Duskmallet** — dmg 79, level 5, icon `Sword_14.png`  
    _Duskmallet - Mallet at dusk shock. | 79 Damage | 37 Defense | T1 | Sells for: 60 Gold_
- **Wraithknocker** — dmg 58, level 5, icon `Sword_38.png`  
    _Wraithknocker - Knocks wraiths. | 58 Damage | 21 Defense | T1 | Sells for: 60 Gold_
- **Embermallet** — dmg 61, level 5, icon `Sword_58.png`  
    _Embermallet - Mallet of ember. | 61 Damage | 27 Defense | T1 | Sells for: 60 Gold_
- **Flameblood Spire** — dmg 64, level 5, icon `Sword_08.png`  
    _Flameblood Spire - Spire forged from flameblood rituals. | 64 Damage | 11 Defense | T1 | Sells for: 60 Gold_
- **Hellfire Oathbreaker** — dmg 66, level 5, icon `Sword_29.png`  
    _Hellfire Oathbreaker - Oathbreaker staff of hellfire. | 66 Damage | 11 Defense | T1 | Sells for: 60 Gold_
- **Iceblood Spire** — dmg 59, level 5, icon `Sword_45.png`  
    _Iceblood Spire - Spire from iceblood rituals. | 59 Damage | 13 Defense | T1 | Sells for: 60 Gold_
- **Frigid Oathbreaker** — dmg 61, level 5, icon `Sword_21.png`  
    _Frigid Oathbreaker - Oathbreaker staff of frigid ice. | 61 Damage | 13 Defense | T1 | Sells for: 60 Gold_
- **Bloodvine Spire** — dmg 54, level 5, icon `Sword_50.png`  
    _Bloodvine Spire - Spire from bloodvine rituals. | 54 Damage | 15 Defense | T1 | Sells for: 60 Gold_
- **Bloodlight Spire** — dmg 49, level 5, icon `Sword_45.png`  
    _Bloodlight Spire - Spire from bloodlight rituals. | 49 Damage | 16 Defense | T1 | Sells for: 60 Gold_
- **Sacred Oathbreaker** — dmg 51, level 5, icon `Sword_25.png`  
    _Sacred Oathbreaker - Oathbreaker staff of sacred light. | 51 Damage | 16 Defense | T1 | Sells for: 60 Gold_
- **Etherblood Spire** — dmg 61, level 5, icon `Sword_21.png`  
    _Etherblood Spire - Spire from etherblood rituals. | 61 Damage | 12 Defense | T1 | Sells for: 60 Gold_
- **Aether Oathbreaker** — dmg 63, level 5, icon `Sword_02.png`  
    _Aether Oathbreaker - Oathbreaker staff of aether. | 63 Damage | 12 Defense | T1 | Sells for: 60 Gold_
- **Stormblood Spire** — dmg 67, level 5, icon `Sword_50.png`  
    _Stormblood Spire - Spire from stormblood rituals. | 67 Damage | 10 Defense | T1 | Sells for: 60 Gold_
- **Ironbound Sword T2** — dmg 49, level 10, icon `Sword_01.png`  
    _Ironbound Sword T2 — Ironbound Sword | 49 Damage | 8 Defense | T2 | Class: Warrior | Sells for: 120 Gold_
- **Ironbound Sword T3** — dmg 66, level 15, icon `Sword_01.png`  
    _Ironbound Sword T3 — Ironbound Sword | 66 Damage | 12 Defense | T3 | Class: Warrior | Sells for: 240 Gold_
- **Ironbound Sword T4** — dmg 88, level 20, icon `Sword_01.png`  
    _Ironbound Sword T4 — Ironbound Sword | 88 Damage | 17 Defense | T4 | Class: Warrior | Sells for: 480 Gold_
- **Ironbound Sword T5** — dmg 112, level 25, icon `Sword_01.png`  
    _Ironbound Sword T5 — Ironbound Sword | 112 Damage | 23 Defense | T5 | Class: Warrior | Sells for: 1000 Gold_
- **Ironbound Sword T6** — dmg 147, level 30, icon `Sword_01.png`  
    _Ironbound Sword T6 — Ironbound Sword | 147 Damage | 30 Defense | T6 | Class: Warrior | Sells for: 2000 Gold_
- **Ironbound Sword T7** — dmg 192, level 35, icon `Sword_01.png`  
    _Ironbound Sword T7 — Ironbound Sword | 192 Damage | 40 Defense | T7 | Class: Warrior | Sells for: 4000 Gold_
- **Ironbound Sword T8** — dmg 245, level 40, icon `Sword_01.png`  
    _Ironbound Sword T8 — Ironbound Sword | 245 Damage | 52 Defense | T8 | Class: Warrior | Sells for: 10000 Gold_
- **Bloodforged Sword T1** — dmg 35, level 5, icon `Sword_06.png`  
    _Bloodforged Sword T1 — Bloodforged Sword | 35 Damage | 5 Defense | T1 | Class: Warrior | Sells for: 60 Gold_
- **Bloodforged Sword T2** — dmg 49, level 10, icon `Sword_06.png`  
    _Bloodforged Sword T2 — Bloodforged Sword | 49 Damage | 8 Defense | T2 | Class: Warrior | Sells for: 120 Gold_
- **Bloodforged Sword T3** — dmg 66, level 15, icon `Sword_06.png`  
    _Bloodforged Sword T3 — Bloodforged Sword | 66 Damage | 12 Defense | T3 | Class: Warrior | Sells for: 240 Gold_
- **Bloodforged Sword T4** — dmg 88, level 20, icon `Sword_06.png`  
    _Bloodforged Sword T4 — Bloodforged Sword | 88 Damage | 17 Defense | T4 | Class: Warrior | Sells for: 480 Gold_
- **Bloodforged Sword T5** — dmg 112, level 25, icon `Sword_06.png`  
    _Bloodforged Sword T5 — Bloodforged Sword | 112 Damage | 23 Defense | T5 | Class: Warrior | Sells for: 1000 Gold_
- **Bloodforged Sword T6** — dmg 147, level 30, icon `Sword_06.png`  
    _Bloodforged Sword T6 — Bloodforged Sword | 147 Damage | 30 Defense | T6 | Class: Warrior | Sells for: 2000 Gold_
- **Bloodforged Sword T7** — dmg 192, level 35, icon `Sword_06.png`  
    _Bloodforged Sword T7 — Bloodforged Sword | 192 Damage | 40 Defense | T7 | Class: Warrior | Sells for: 4000 Gold_
- **Bloodforged Sword T8** — dmg 245, level 40, icon `Sword_06.png`  
    _Bloodforged Sword T8 — Bloodforged Sword | 245 Damage | 52 Defense | T8 | Class: Warrior | Sells for: 10000 Gold_
- **Stormborn Sword T1** — dmg 35, level 5, icon `Sword_11.png`  
    _Stormborn Sword T1 — Stormborn Sword | 35 Damage | 5 Defense | T1 | Class: Warrior | Sells for: 60 Gold_
- **Stormborn Sword T2** — dmg 49, level 10, icon `Sword_11.png`  
    _Stormborn Sword T2 — Stormborn Sword | 49 Damage | 8 Defense | T2 | Class: Warrior | Sells for: 120 Gold_
- **Stormborn Sword T3** — dmg 66, level 15, icon `Sword_11.png`  
    _Stormborn Sword T3 — Stormborn Sword | 66 Damage | 12 Defense | T3 | Class: Warrior | Sells for: 240 Gold_
- **Stormborn Sword T4** — dmg 88, level 20, icon `Sword_11.png`  
    _Stormborn Sword T4 — Stormborn Sword | 88 Damage | 17 Defense | T4 | Class: Warrior | Sells for: 480 Gold_
- **Stormborn Sword T5** — dmg 112, level 25, icon `Sword_11.png`  
    _Stormborn Sword T5 — Stormborn Sword | 112 Damage | 23 Defense | T5 | Class: Warrior | Sells for: 1000 Gold_
- **Stormborn Sword T6** — dmg 147, level 30, icon `Sword_11.png`  
    _Stormborn Sword T6 — Stormborn Sword | 147 Damage | 30 Defense | T6 | Class: Warrior | Sells for: 2000 Gold_
- **Stormborn Sword T7** — dmg 192, level 35, icon `Sword_11.png`  
    _Stormborn Sword T7 — Stormborn Sword | 192 Damage | 40 Defense | T7 | Class: Warrior | Sells for: 4000 Gold_
- **Stormborn Sword T8** — dmg 245, level 40, icon `Sword_11.png`  
    _Stormborn Sword T8 — Stormborn Sword | 245 Damage | 52 Defense | T8 | Class: Warrior | Sells for: 10000 Gold_
- **Emberforged Sword T1** — dmg 35, level 5, icon `Sword_16.png`  
    _Emberforged Sword T1 — Emberforged Sword | 35 Damage | 5 Defense | T1 | Class: Warrior | Sells for: 60 Gold_
- **Emberforged Sword T2** — dmg 49, level 10, icon `Sword_16.png`  
    _Emberforged Sword T2 — Emberforged Sword | 49 Damage | 8 Defense | T2 | Class: Warrior | Sells for: 120 Gold_
- **Emberforged Sword T3** — dmg 66, level 15, icon `Sword_16.png`  
    _Emberforged Sword T3 — Emberforged Sword | 66 Damage | 12 Defense | T3 | Class: Warrior | Sells for: 240 Gold_
- **Emberforged Sword T4** — dmg 88, level 20, icon `Sword_16.png`  
    _Emberforged Sword T4 — Emberforged Sword | 88 Damage | 17 Defense | T4 | Class: Warrior | Sells for: 480 Gold_
- **Emberforged Sword T5** — dmg 112, level 25, icon `Sword_16.png`  
    _Emberforged Sword T5 — Emberforged Sword | 112 Damage | 23 Defense | T5 | Class: Warrior | Sells for: 1000 Gold_
- **Emberforged Sword T6** — dmg 147, level 30, icon `Sword_16.png`  
    _Emberforged Sword T6 — Emberforged Sword | 147 Damage | 30 Defense | T6 | Class: Warrior | Sells for: 2000 Gold_
- **Emberforged Sword T7** — dmg 192, level 35, icon `Sword_16.png`  
    _Emberforged Sword T7 — Emberforged Sword | 192 Damage | 40 Defense | T7 | Class: Warrior | Sells for: 4000 Gold_
- **Emberforged Sword T8** — dmg 245, level 40, icon `Sword_16.png`  
    _Emberforged Sword T8 — Emberforged Sword | 245 Damage | 52 Defense | T8 | Class: Warrior | Sells for: 10000 Gold_
- **Frostbound Sword T1** — dmg 35, level 5, icon `Sword_21.png`  
    _Frostbound Sword T1 — Frostbound Sword | 35 Damage | 5 Defense | T1 | Class: Warrior | Sells for: 60 Gold_
- **Frostbound Sword T2** — dmg 49, level 10, icon `Sword_21.png`  
    _Frostbound Sword T2 — Frostbound Sword | 49 Damage | 8 Defense | T2 | Class: Warrior | Sells for: 120 Gold_
- **Frostbound Sword T3** — dmg 66, level 15, icon `Sword_21.png`  
    _Frostbound Sword T3 — Frostbound Sword | 66 Damage | 12 Defense | T3 | Class: Warrior | Sells for: 240 Gold_
- **Frostbound Sword T4** — dmg 88, level 20, icon `Sword_21.png`  
    _Frostbound Sword T4 — Frostbound Sword | 88 Damage | 17 Defense | T4 | Class: Warrior | Sells for: 480 Gold_
- **Frostbound Sword T5** — dmg 112, level 25, icon `Sword_21.png`  
    _Frostbound Sword T5 — Frostbound Sword | 112 Damage | 23 Defense | T5 | Class: Warrior | Sells for: 1000 Gold_
- **Frostbound Sword T6** — dmg 147, level 30, icon `Sword_21.png`  
    _Frostbound Sword T6 — Frostbound Sword | 147 Damage | 30 Defense | T6 | Class: Warrior | Sells for: 2000 Gold_
- **Frostbound Sword T7** — dmg 192, level 35, icon `Sword_21.png`  
    _Frostbound Sword T7 — Frostbound Sword | 192 Damage | 40 Defense | T7 | Class: Warrior | Sells for: 4000 Gold_
- **Frostbound Sword T8** — dmg 245, level 40, icon `Sword_21.png`  
    _Frostbound Sword T8 — Frostbound Sword | 245 Damage | 52 Defense | T8 | Class: Warrior | Sells for: 10000 Gold_
- **Voidtouched Sword T1** — dmg 35, level 5, icon `Sword_26.png`  
    _Voidtouched Sword T1 — Voidtouched Sword | 35 Damage | 5 Defense | T1 | Class: Warrior | Sells for: 60 Gold_
- **Voidtouched Sword T2** — dmg 49, level 10, icon `Sword_26.png`  
    _Voidtouched Sword T2 — Voidtouched Sword | 49 Damage | 8 Defense | T2 | Class: Warrior | Sells for: 120 Gold_
- **Voidtouched Sword T3** — dmg 66, level 15, icon `Sword_26.png`  
    _Voidtouched Sword T3 — Voidtouched Sword | 66 Damage | 12 Defense | T3 | Class: Warrior | Sells for: 240 Gold_
- **Voidtouched Sword T4** — dmg 88, level 20, icon `Sword_26.png`  
    _Voidtouched Sword T4 — Voidtouched Sword | 88 Damage | 17 Defense | T4 | Class: Warrior | Sells for: 480 Gold_
- **Voidtouched Sword T5** — dmg 112, level 25, icon `Sword_26.png`  
    _Voidtouched Sword T5 — Voidtouched Sword | 112 Damage | 23 Defense | T5 | Class: Warrior | Sells for: 1000 Gold_
- **Voidtouched Sword T6** — dmg 147, level 30, icon `Sword_26.png`  
    _Voidtouched Sword T6 — Voidtouched Sword | 147 Damage | 30 Defense | T6 | Class: Warrior | Sells for: 2000 Gold_
- **Voidtouched Sword T7** — dmg 192, level 35, icon `Sword_26.png`  
    _Voidtouched Sword T7 — Voidtouched Sword | 192 Damage | 40 Defense | T7 | Class: Warrior | Sells for: 4000 Gold_
- **Voidtouched Sword T8** — dmg 245, level 40, icon `Sword_26.png`  
    _Voidtouched Sword T8 — Voidtouched Sword | 245 Damage | 52 Defense | T8 | Class: Warrior | Sells for: 10000 Gold_
- **Ironbound Greatsword T1** — dmg 52, level 5, icon `Sword_31.png`  
    _Ironbound Greatsword T1 — Ironbound Greatsword | 52 Damage | 5 Defense | T1 | Class: Warrior/Ranger | Sells for: 60 Gold_
- **Ironbound Greatsword T2** — dmg 73, level 10, icon `Sword_31.png`  
    _Ironbound Greatsword T2 — Ironbound Greatsword | 73 Damage | 8 Defense | T2 | Class: Warrior/Ranger | Sells for: 120 Gold_
- **Ironbound Greatsword T3** — dmg 99, level 15, icon `Sword_31.png`  
    _Ironbound Greatsword T3 — Ironbound Greatsword | 99 Damage | 12 Defense | T3 | Class: Warrior/Ranger | Sells for: 240 Gold_
- **Ironbound Greatsword T4** — dmg 130, level 20, icon `Sword_31.png`  
    _Ironbound Greatsword T4 — Ironbound Greatsword | 130 Damage | 17 Defense | T4 | Class: Warrior/Ranger | Sells for: 480 Gold_
- **Ironbound Greatsword T5** — dmg 166, level 25, icon `Sword_31.png`  
    _Ironbound Greatsword T5 — Ironbound Greatsword | 166 Damage | 23 Defense | T5 | Class: Warrior/Ranger | Sells for: 1000 Gold_
- **Ironbound Greatsword T6** — dmg 218, level 30, icon `Sword_31.png`  
    _Ironbound Greatsword T6 — Ironbound Greatsword | 218 Damage | 30 Defense | T6 | Class: Warrior/Ranger | Sells for: 2000 Gold_
- **Ironbound Greatsword T7** — dmg 286, level 35, icon `Sword_31.png`  
    _Ironbound Greatsword T7 — Ironbound Greatsword | 286 Damage | 40 Defense | T7 | Class: Warrior/Ranger | Sells for: 4000 Gold_
- **Ironbound Greatsword T8** — dmg 364, level 40, icon `Sword_31.png`  
    _Ironbound Greatsword T8 — Ironbound Greatsword | 364 Damage | 52 Defense | T8 | Class: Warrior/Ranger | Sells for: 10000 Gold_
- **Bloodforged Greatsword T1** — dmg 52, level 5, icon `Sword_36.png`  
    _Bloodforged Greatsword T1 — Bloodforged Greatsword | 52 Damage | 5 Defense | T1 | Class: Warrior/Ranger | Sells for: 60 Gold_
- **Bloodforged Greatsword T2** — dmg 73, level 10, icon `Sword_36.png`  
    _Bloodforged Greatsword T2 — Bloodforged Greatsword | 73 Damage | 8 Defense | T2 | Class: Warrior/Ranger | Sells for: 120 Gold_
- **Bloodforged Greatsword T3** — dmg 99, level 15, icon `Sword_36.png`  
    _Bloodforged Greatsword T3 — Bloodforged Greatsword | 99 Damage | 12 Defense | T3 | Class: Warrior/Ranger | Sells for: 240 Gold_
- **Bloodforged Greatsword T4** — dmg 130, level 20, icon `Sword_36.png`  
    _Bloodforged Greatsword T4 — Bloodforged Greatsword | 130 Damage | 17 Defense | T4 | Class: Warrior/Ranger | Sells for: 480 Gold_
- **Bloodforged Greatsword T5** — dmg 166, level 25, icon `Sword_36.png`  
    _Bloodforged Greatsword T5 — Bloodforged Greatsword | 166 Damage | 23 Defense | T5 | Class: Warrior/Ranger | Sells for: 1000 Gold_
- **Bloodforged Greatsword T6** — dmg 218, level 30, icon `Sword_36.png`  
    _Bloodforged Greatsword T6 — Bloodforged Greatsword | 218 Damage | 30 Defense | T6 | Class: Warrior/Ranger | Sells for: 2000 Gold_
- **Bloodforged Greatsword T7** — dmg 286, level 35, icon `Sword_36.png`  
    _Bloodforged Greatsword T7 — Bloodforged Greatsword | 286 Damage | 40 Defense | T7 | Class: Warrior/Ranger | Sells for: 4000 Gold_
- **Bloodforged Greatsword T8** — dmg 364, level 40, icon `Sword_36.png`  
    _Bloodforged Greatsword T8 — Bloodforged Greatsword | 364 Damage | 52 Defense | T8 | Class: Warrior/Ranger | Sells for: 10000 Gold_
- **Stormborn Greatsword T1** — dmg 52, level 5, icon `Sword_41.png`  
    _Stormborn Greatsword T1 — Stormborn Greatsword | 52 Damage | 5 Defense | T1 | Class: Warrior/Ranger | Sells for: 60 Gold_
- **Stormborn Greatsword T2** — dmg 73, level 10, icon `Sword_41.png`  
    _Stormborn Greatsword T2 — Stormborn Greatsword | 73 Damage | 8 Defense | T2 | Class: Warrior/Ranger | Sells for: 120 Gold_
- **Stormborn Greatsword T3** — dmg 99, level 15, icon `Sword_41.png`  
    _Stormborn Greatsword T3 — Stormborn Greatsword | 99 Damage | 12 Defense | T3 | Class: Warrior/Ranger | Sells for: 240 Gold_
- **Stormborn Greatsword T4** — dmg 130, level 20, icon `Sword_41.png`  
    _Stormborn Greatsword T4 — Stormborn Greatsword | 130 Damage | 17 Defense | T4 | Class: Warrior/Ranger | Sells for: 480 Gold_
- **Stormborn Greatsword T5** — dmg 166, level 25, icon `Sword_41.png`  
    _Stormborn Greatsword T5 — Stormborn Greatsword | 166 Damage | 23 Defense | T5 | Class: Warrior/Ranger | Sells for: 1000 Gold_
- **Stormborn Greatsword T6** — dmg 218, level 30, icon `Sword_41.png`  
    _Stormborn Greatsword T6 — Stormborn Greatsword | 218 Damage | 30 Defense | T6 | Class: Warrior/Ranger | Sells for: 2000 Gold_
- **Stormborn Greatsword T7** — dmg 286, level 35, icon `Sword_41.png`  
    _Stormborn Greatsword T7 — Stormborn Greatsword | 286 Damage | 40 Defense | T7 | Class: Warrior/Ranger | Sells for: 4000 Gold_
- **Stormborn Greatsword T8** — dmg 364, level 40, icon `Sword_41.png`  
    _Stormborn Greatsword T8 — Stormborn Greatsword | 364 Damage | 52 Defense | T8 | Class: Warrior/Ranger | Sells for: 10000 Gold_
- **Emberforged Greatsword T1** — dmg 52, level 5, icon `Sword_46.png`  
    _Emberforged Greatsword T1 — Emberforged Greatsword | 52 Damage | 5 Defense | T1 | Class: Warrior/Ranger | Sells for: 60 Gold_
- **Emberforged Greatsword T2** — dmg 73, level 10, icon `Sword_46.png`  
    _Emberforged Greatsword T2 — Emberforged Greatsword | 73 Damage | 8 Defense | T2 | Class: Warrior/Ranger | Sells for: 120 Gold_
- **Emberforged Greatsword T3** — dmg 99, level 15, icon `Sword_46.png`  
    _Emberforged Greatsword T3 — Emberforged Greatsword | 99 Damage | 12 Defense | T3 | Class: Warrior/Ranger | Sells for: 240 Gold_
- **Emberforged Greatsword T4** — dmg 130, level 20, icon `Sword_46.png`  
    _Emberforged Greatsword T4 — Emberforged Greatsword | 130 Damage | 17 Defense | T4 | Class: Warrior/Ranger | Sells for: 480 Gold_
- **Emberforged Greatsword T5** — dmg 166, level 25, icon `Sword_46.png`  
    _Emberforged Greatsword T5 — Emberforged Greatsword | 166 Damage | 23 Defense | T5 | Class: Warrior/Ranger | Sells for: 1000 Gold_
- **Emberforged Greatsword T6** — dmg 218, level 30, icon `Sword_46.png`  
    _Emberforged Greatsword T6 — Emberforged Greatsword | 218 Damage | 30 Defense | T6 | Class: Warrior/Ranger | Sells for: 2000 Gold_
- **Emberforged Greatsword T7** — dmg 286, level 35, icon `Sword_46.png`  
    _Emberforged Greatsword T7 — Emberforged Greatsword | 286 Damage | 40 Defense | T7 | Class: Warrior/Ranger | Sells for: 4000 Gold_
- **Emberforged Greatsword T8** — dmg 364, level 40, icon `Sword_46.png`  
    _Emberforged Greatsword T8 — Emberforged Greatsword | 364 Damage | 52 Defense | T8 | Class: Warrior/Ranger | Sells for: 10000 Gold_
- **Frostbound Greatsword T1** — dmg 52, level 5, icon `Sword_51.png`  
    _Frostbound Greatsword T1 — Frostbound Greatsword | 52 Damage | 5 Defense | T1 | Class: Warrior/Ranger | Sells for: 60 Gold_
- **Frostbound Greatsword T2** — dmg 73, level 10, icon `Sword_51.png`  
    _Frostbound Greatsword T2 — Frostbound Greatsword | 73 Damage | 8 Defense | T2 | Class: Warrior/Ranger | Sells for: 120 Gold_
- **Frostbound Greatsword T3** — dmg 99, level 15, icon `Sword_51.png`  
    _Frostbound Greatsword T3 — Frostbound Greatsword | 99 Damage | 12 Defense | T3 | Class: Warrior/Ranger | Sells for: 240 Gold_
- **Frostbound Greatsword T4** — dmg 130, level 20, icon `Sword_51.png`  
    _Frostbound Greatsword T4 — Frostbound Greatsword | 130 Damage | 17 Defense | T4 | Class: Warrior/Ranger | Sells for: 480 Gold_
- **Frostbound Greatsword T5** — dmg 166, level 25, icon `Sword_51.png`  
    _Frostbound Greatsword T5 — Frostbound Greatsword | 166 Damage | 23 Defense | T5 | Class: Warrior/Ranger | Sells for: 1000 Gold_
- **Frostbound Greatsword T6** — dmg 218, level 30, icon `Sword_51.png`  
    _Frostbound Greatsword T6 — Frostbound Greatsword | 218 Damage | 30 Defense | T6 | Class: Warrior/Ranger | Sells for: 2000 Gold_
- **Frostbound Greatsword T7** — dmg 286, level 35, icon `Sword_51.png`  
    _Frostbound Greatsword T7 — Frostbound Greatsword | 286 Damage | 40 Defense | T7 | Class: Warrior/Ranger | Sells for: 4000 Gold_
- **Frostbound Greatsword T8** — dmg 364, level 40, icon `Sword_51.png`  
    _Frostbound Greatsword T8 — Frostbound Greatsword | 364 Damage | 52 Defense | T8 | Class: Warrior/Ranger | Sells for: 10000 Gold_
- **Voidtouched Greatsword T1** — dmg 52, level 5, icon `Sword_56.png`  
    _Voidtouched Greatsword T1 — Voidtouched Greatsword | 52 Damage | 5 Defense | T1 | Class: Warrior/Ranger | Sells for: 60 Gold_
- **Voidtouched Greatsword T2** — dmg 73, level 10, icon `Sword_56.png`  
    _Voidtouched Greatsword T2 — Voidtouched Greatsword | 73 Damage | 8 Defense | T2 | Class: Warrior/Ranger | Sells for: 120 Gold_
- **Voidtouched Greatsword T3** — dmg 99, level 15, icon `Sword_56.png`  
    _Voidtouched Greatsword T3 — Voidtouched Greatsword | 99 Damage | 12 Defense | T3 | Class: Warrior/Ranger | Sells for: 240 Gold_
- **Voidtouched Greatsword T4** — dmg 130, level 20, icon `Sword_56.png`  
    _Voidtouched Greatsword T4 — Voidtouched Greatsword | 130 Damage | 17 Defense | T4 | Class: Warrior/Ranger | Sells for: 480 Gold_
- **Voidtouched Greatsword T5** — dmg 166, level 25, icon `Sword_56.png`  
    _Voidtouched Greatsword T5 — Voidtouched Greatsword | 166 Damage | 23 Defense | T5 | Class: Warrior/Ranger | Sells for: 1000 Gold_
- **Voidtouched Greatsword T6** — dmg 218, level 30, icon `Sword_56.png`  
    _Voidtouched Greatsword T6 — Voidtouched Greatsword | 218 Damage | 30 Defense | T6 | Class: Warrior/Ranger | Sells for: 2000 Gold_
- **Voidtouched Greatsword T7** — dmg 286, level 35, icon `Sword_56.png`  
    _Voidtouched Greatsword T7 — Voidtouched Greatsword | 286 Damage | 40 Defense | T7 | Class: Warrior/Ranger | Sells for: 4000 Gold_
- **Voidtouched Greatsword T8** — dmg 364, level 40, icon `Sword_56.png`  
    _Voidtouched Greatsword T8 — Voidtouched Greatsword | 364 Damage | 52 Defense | T8 | Class: Warrior/Ranger | Sells for: 10000 Gold_

### legacy → axe (52)
- **Shrouded Axe** — dmg 75, level 10, icon `Axe_25.png`  
    _Shrouded Axe_
- **Hatchet** — dmg 10, level 1, icon `Axe_22.png`  
    _Hatchet_
- **Chipped Axe** — dmg 18, level ?, icon `Axe_22.png`  
    _Chipped Axe - A woodcutter's axe past its prime. | 18 Damage | 4 Defense | Tier 0 | Sells for: 20 Gold_
- **Lumber Axe** — dmg 45, level 5, icon `Axe_44.png`  
    _Lumber Axe - Heavy axe designed for felling trees, doubles as weapon. | 45 Damage | 18 Defense | Tier 1 | Sells for: 60 Gold_
- **Ironbound Axe T1** — dmg 40, level 5, icon `Axe_01.png`  
    _Ironbound Axe T1 — Ironbound Axe | 40 Damage | 5 Defense | T1 | Class: Warrior | Sells for: 60 Gold_
- **Ironbound Axe T2** — dmg 56, level 10, icon `Axe_01.png`  
    _Ironbound Axe T2 — Ironbound Axe | 56 Damage | 8 Defense | T2 | Class: Warrior | Sells for: 120 Gold_
- **Ironbound Axe T3** — dmg 76, level 15, icon `Axe_01.png`  
    _Ironbound Axe T3 — Ironbound Axe | 76 Damage | 12 Defense | T3 | Class: Warrior | Sells for: 240 Gold_
- **Ironbound Axe T4** — dmg 100, level 20, icon `Axe_01.png`  
    _Ironbound Axe T4 — Ironbound Axe | 100 Damage | 17 Defense | T4 | Class: Warrior | Sells for: 480 Gold_
- **Ironbound Axe T5** — dmg 128, level 25, icon `Axe_01.png`  
    _Ironbound Axe T5 — Ironbound Axe | 128 Damage | 23 Defense | T5 | Class: Warrior | Sells for: 1000 Gold_
- **Ironbound Axe T6** — dmg 168, level 30, icon `Axe_01.png`  
    _Ironbound Axe T6 — Ironbound Axe | 168 Damage | 30 Defense | T6 | Class: Warrior | Sells for: 2000 Gold_
- **Ironbound Axe T7** — dmg 220, level 35, icon `Axe_01.png`  
    _Ironbound Axe T7 — Ironbound Axe | 220 Damage | 40 Defense | T7 | Class: Warrior | Sells for: 4000 Gold_
- **Ironbound Axe T8** — dmg 280, level 40, icon `Axe_01.png`  
    _Ironbound Axe T8 — Ironbound Axe | 280 Damage | 52 Defense | T8 | Class: Warrior | Sells for: 10000 Gold_
- **Bloodforged Axe T1** — dmg 40, level 5, icon `Axe_06.png`  
    _Bloodforged Axe T1 — Bloodforged Axe | 40 Damage | 5 Defense | T1 | Class: Warrior | Sells for: 60 Gold_
- **Bloodforged Axe T2** — dmg 56, level 10, icon `Axe_06.png`  
    _Bloodforged Axe T2 — Bloodforged Axe | 56 Damage | 8 Defense | T2 | Class: Warrior | Sells for: 120 Gold_
- **Bloodforged Axe T3** — dmg 76, level 15, icon `Axe_06.png`  
    _Bloodforged Axe T3 — Bloodforged Axe | 76 Damage | 12 Defense | T3 | Class: Warrior | Sells for: 240 Gold_
- **Bloodforged Axe T4** — dmg 100, level 20, icon `Axe_06.png`  
    _Bloodforged Axe T4 — Bloodforged Axe | 100 Damage | 17 Defense | T4 | Class: Warrior | Sells for: 480 Gold_
- **Bloodforged Axe T5** — dmg 128, level 25, icon `Axe_06.png`  
    _Bloodforged Axe T5 — Bloodforged Axe | 128 Damage | 23 Defense | T5 | Class: Warrior | Sells for: 1000 Gold_
- **Bloodforged Axe T6** — dmg 168, level 30, icon `Axe_06.png`  
    _Bloodforged Axe T6 — Bloodforged Axe | 168 Damage | 30 Defense | T6 | Class: Warrior | Sells for: 2000 Gold_
- **Bloodforged Axe T7** — dmg 220, level 35, icon `Axe_06.png`  
    _Bloodforged Axe T7 — Bloodforged Axe | 220 Damage | 40 Defense | T7 | Class: Warrior | Sells for: 4000 Gold_
- **Bloodforged Axe T8** — dmg 280, level 40, icon `Axe_06.png`  
    _Bloodforged Axe T8 — Bloodforged Axe | 280 Damage | 52 Defense | T8 | Class: Warrior | Sells for: 10000 Gold_
- **Stormborn Axe T1** — dmg 40, level 5, icon `Axe_11.png`  
    _Stormborn Axe T1 — Stormborn Axe | 40 Damage | 5 Defense | T1 | Class: Warrior | Sells for: 60 Gold_
- **Stormborn Axe T2** — dmg 56, level 10, icon `Axe_11.png`  
    _Stormborn Axe T2 — Stormborn Axe | 56 Damage | 8 Defense | T2 | Class: Warrior | Sells for: 120 Gold_
- **Stormborn Axe T3** — dmg 76, level 15, icon `Axe_11.png`  
    _Stormborn Axe T3 — Stormborn Axe | 76 Damage | 12 Defense | T3 | Class: Warrior | Sells for: 240 Gold_
- **Stormborn Axe T4** — dmg 100, level 20, icon `Axe_11.png`  
    _Stormborn Axe T4 — Stormborn Axe | 100 Damage | 17 Defense | T4 | Class: Warrior | Sells for: 480 Gold_
- **Stormborn Axe T5** — dmg 128, level 25, icon `Axe_11.png`  
    _Stormborn Axe T5 — Stormborn Axe | 128 Damage | 23 Defense | T5 | Class: Warrior | Sells for: 1000 Gold_
- **Stormborn Axe T6** — dmg 168, level 30, icon `Axe_11.png`  
    _Stormborn Axe T6 — Stormborn Axe | 168 Damage | 30 Defense | T6 | Class: Warrior | Sells for: 2000 Gold_
- **Stormborn Axe T7** — dmg 220, level 35, icon `Axe_11.png`  
    _Stormborn Axe T7 — Stormborn Axe | 220 Damage | 40 Defense | T7 | Class: Warrior | Sells for: 4000 Gold_
- **Stormborn Axe T8** — dmg 280, level 40, icon `Axe_11.png`  
    _Stormborn Axe T8 — Stormborn Axe | 280 Damage | 52 Defense | T8 | Class: Warrior | Sells for: 10000 Gold_
- **Emberforged Axe T1** — dmg 40, level 5, icon `Axe_16.png`  
    _Emberforged Axe T1 — Emberforged Axe | 40 Damage | 5 Defense | T1 | Class: Warrior | Sells for: 60 Gold_
- **Emberforged Axe T2** — dmg 56, level 10, icon `Axe_16.png`  
    _Emberforged Axe T2 — Emberforged Axe | 56 Damage | 8 Defense | T2 | Class: Warrior | Sells for: 120 Gold_
- **Emberforged Axe T3** — dmg 76, level 15, icon `Axe_16.png`  
    _Emberforged Axe T3 — Emberforged Axe | 76 Damage | 12 Defense | T3 | Class: Warrior | Sells for: 240 Gold_
- **Emberforged Axe T4** — dmg 100, level 20, icon `Axe_16.png`  
    _Emberforged Axe T4 — Emberforged Axe | 100 Damage | 17 Defense | T4 | Class: Warrior | Sells for: 480 Gold_
- **Emberforged Axe T5** — dmg 128, level 25, icon `Axe_16.png`  
    _Emberforged Axe T5 — Emberforged Axe | 128 Damage | 23 Defense | T5 | Class: Warrior | Sells for: 1000 Gold_
- **Emberforged Axe T6** — dmg 168, level 30, icon `Axe_16.png`  
    _Emberforged Axe T6 — Emberforged Axe | 168 Damage | 30 Defense | T6 | Class: Warrior | Sells for: 2000 Gold_
- **Emberforged Axe T7** — dmg 220, level 35, icon `Axe_16.png`  
    _Emberforged Axe T7 — Emberforged Axe | 220 Damage | 40 Defense | T7 | Class: Warrior | Sells for: 4000 Gold_
- **Emberforged Axe T8** — dmg 280, level 40, icon `Axe_16.png`  
    _Emberforged Axe T8 — Emberforged Axe | 280 Damage | 52 Defense | T8 | Class: Warrior | Sells for: 10000 Gold_
- **Frostbound Axe T1** — dmg 40, level 5, icon `Axe_21.png`  
    _Frostbound Axe T1 — Frostbound Axe | 40 Damage | 5 Defense | T1 | Class: Warrior | Sells for: 60 Gold_
- **Frostbound Axe T2** — dmg 56, level 10, icon `Axe_21.png`  
    _Frostbound Axe T2 — Frostbound Axe | 56 Damage | 8 Defense | T2 | Class: Warrior | Sells for: 120 Gold_
- **Frostbound Axe T3** — dmg 76, level 15, icon `Axe_21.png`  
    _Frostbound Axe T3 — Frostbound Axe | 76 Damage | 12 Defense | T3 | Class: Warrior | Sells for: 240 Gold_
- **Frostbound Axe T4** — dmg 100, level 20, icon `Axe_21.png`  
    _Frostbound Axe T4 — Frostbound Axe | 100 Damage | 17 Defense | T4 | Class: Warrior | Sells for: 480 Gold_
- **Frostbound Axe T5** — dmg 128, level 25, icon `Axe_21.png`  
    _Frostbound Axe T5 — Frostbound Axe | 128 Damage | 23 Defense | T5 | Class: Warrior | Sells for: 1000 Gold_
- **Frostbound Axe T6** — dmg 168, level 30, icon `Axe_21.png`  
    _Frostbound Axe T6 — Frostbound Axe | 168 Damage | 30 Defense | T6 | Class: Warrior | Sells for: 2000 Gold_
- **Frostbound Axe T7** — dmg 220, level 35, icon `Axe_21.png`  
    _Frostbound Axe T7 — Frostbound Axe | 220 Damage | 40 Defense | T7 | Class: Warrior | Sells for: 4000 Gold_
- **Frostbound Axe T8** — dmg 280, level 40, icon `Axe_21.png`  
    _Frostbound Axe T8 — Frostbound Axe | 280 Damage | 52 Defense | T8 | Class: Warrior | Sells for: 10000 Gold_
- **Voidtouched Axe T1** — dmg 40, level 5, icon `Axe_26.png`  
    _Voidtouched Axe T1 — Voidtouched Axe | 40 Damage | 5 Defense | T1 | Class: Warrior | Sells for: 60 Gold_
- **Voidtouched Axe T2** — dmg 56, level 10, icon `Axe_26.png`  
    _Voidtouched Axe T2 — Voidtouched Axe | 56 Damage | 8 Defense | T2 | Class: Warrior | Sells for: 120 Gold_
- **Voidtouched Axe T3** — dmg 76, level 15, icon `Axe_26.png`  
    _Voidtouched Axe T3 — Voidtouched Axe | 76 Damage | 12 Defense | T3 | Class: Warrior | Sells for: 240 Gold_
- **Voidtouched Axe T4** — dmg 100, level 20, icon `Axe_26.png`  
    _Voidtouched Axe T4 — Voidtouched Axe | 100 Damage | 17 Defense | T4 | Class: Warrior | Sells for: 480 Gold_
- **Voidtouched Axe T5** — dmg 128, level 25, icon `Axe_26.png`  
    _Voidtouched Axe T5 — Voidtouched Axe | 128 Damage | 23 Defense | T5 | Class: Warrior | Sells for: 1000 Gold_
- **Voidtouched Axe T6** — dmg 168, level 30, icon `Axe_26.png`  
    _Voidtouched Axe T6 — Voidtouched Axe | 168 Damage | 30 Defense | T6 | Class: Warrior | Sells for: 2000 Gold_
- **Voidtouched Axe T7** — dmg 220, level 35, icon `Axe_26.png`  
    _Voidtouched Axe T7 — Voidtouched Axe | 220 Damage | 40 Defense | T7 | Class: Warrior | Sells for: 4000 Gold_
- **Voidtouched Axe T8** — dmg 280, level 40, icon `Axe_26.png`  
    _Voidtouched Axe T8 — Voidtouched Axe | 280 Damage | 52 Defense | T8 | Class: Warrior | Sells for: 10000 Gold_

### legacy → dagger (51)
- **Bone Dagger** — dmg 15, level 1, icon `Dagger_31.png`  
    _Bone Dagger_
- **Blunt Dagger** — dmg 12, level ?, icon `Dagger_02.png`  
    _Blunt Dagger - More of a butter knife than a weapon. | 12 Damage | 3 Defense | Tier 0 | Sells for: 20 Gold_
- **Skinning Knife** — dmg 35, level 5, icon `Dagger_39.png`  
    _Skinning Knife - Sharp knife for skinning game, quick in combat. | 35 Damage | 10 Defense | Tier 1 | Sells for: 60 Gold_
- **Ironbound Dagger T1** — dmg 22, level 5, icon `Dagger_01.png`  
    _Ironbound Dagger T1 — Ironbound Dagger | 22 Damage | 5 Defense | T1 | Class: Ranger/Worge | Sells for: 60 Gold_
- **Ironbound Dagger T2** — dmg 31, level 10, icon `Dagger_01.png`  
    _Ironbound Dagger T2 — Ironbound Dagger | 31 Damage | 8 Defense | T2 | Class: Ranger/Worge | Sells for: 120 Gold_
- **Ironbound Dagger T3** — dmg 42, level 15, icon `Dagger_01.png`  
    _Ironbound Dagger T3 — Ironbound Dagger | 42 Damage | 12 Defense | T3 | Class: Ranger/Worge | Sells for: 240 Gold_
- **Ironbound Dagger T4** — dmg 55, level 20, icon `Dagger_01.png`  
    _Ironbound Dagger T4 — Ironbound Dagger | 55 Damage | 17 Defense | T4 | Class: Ranger/Worge | Sells for: 480 Gold_
- **Ironbound Dagger T5** — dmg 70, level 25, icon `Dagger_01.png`  
    _Ironbound Dagger T5 — Ironbound Dagger | 70 Damage | 23 Defense | T5 | Class: Ranger/Worge | Sells for: 1000 Gold_
- **Ironbound Dagger T6** — dmg 92, level 30, icon `Dagger_01.png`  
    _Ironbound Dagger T6 — Ironbound Dagger | 92 Damage | 30 Defense | T6 | Class: Ranger/Worge | Sells for: 2000 Gold_
- **Ironbound Dagger T7** — dmg 121, level 35, icon `Dagger_01.png`  
    _Ironbound Dagger T7 — Ironbound Dagger | 121 Damage | 40 Defense | T7 | Class: Ranger/Worge | Sells for: 4000 Gold_
- **Ironbound Dagger T8** — dmg 154, level 40, icon `Dagger_01.png`  
    _Ironbound Dagger T8 — Ironbound Dagger | 154 Damage | 52 Defense | T8 | Class: Ranger/Worge | Sells for: 10000 Gold_
- **Bloodforged Dagger T1** — dmg 22, level 5, icon `Dagger_06.png`  
    _Bloodforged Dagger T1 — Bloodforged Dagger | 22 Damage | 5 Defense | T1 | Class: Ranger/Worge | Sells for: 60 Gold_
- **Bloodforged Dagger T2** — dmg 31, level 10, icon `Dagger_06.png`  
    _Bloodforged Dagger T2 — Bloodforged Dagger | 31 Damage | 8 Defense | T2 | Class: Ranger/Worge | Sells for: 120 Gold_
- **Bloodforged Dagger T3** — dmg 42, level 15, icon `Dagger_06.png`  
    _Bloodforged Dagger T3 — Bloodforged Dagger | 42 Damage | 12 Defense | T3 | Class: Ranger/Worge | Sells for: 240 Gold_
- **Bloodforged Dagger T4** — dmg 55, level 20, icon `Dagger_06.png`  
    _Bloodforged Dagger T4 — Bloodforged Dagger | 55 Damage | 17 Defense | T4 | Class: Ranger/Worge | Sells for: 480 Gold_
- **Bloodforged Dagger T5** — dmg 70, level 25, icon `Dagger_06.png`  
    _Bloodforged Dagger T5 — Bloodforged Dagger | 70 Damage | 23 Defense | T5 | Class: Ranger/Worge | Sells for: 1000 Gold_
- **Bloodforged Dagger T6** — dmg 92, level 30, icon `Dagger_06.png`  
    _Bloodforged Dagger T6 — Bloodforged Dagger | 92 Damage | 30 Defense | T6 | Class: Ranger/Worge | Sells for: 2000 Gold_
- **Bloodforged Dagger T7** — dmg 121, level 35, icon `Dagger_06.png`  
    _Bloodforged Dagger T7 — Bloodforged Dagger | 121 Damage | 40 Defense | T7 | Class: Ranger/Worge | Sells for: 4000 Gold_
- **Bloodforged Dagger T8** — dmg 154, level 40, icon `Dagger_06.png`  
    _Bloodforged Dagger T8 — Bloodforged Dagger | 154 Damage | 52 Defense | T8 | Class: Ranger/Worge | Sells for: 10000 Gold_
- **Stormborn Dagger T1** — dmg 22, level 5, icon `Dagger_11.png`  
    _Stormborn Dagger T1 — Stormborn Dagger | 22 Damage | 5 Defense | T1 | Class: Ranger/Worge | Sells for: 60 Gold_
- **Stormborn Dagger T2** — dmg 31, level 10, icon `Dagger_11.png`  
    _Stormborn Dagger T2 — Stormborn Dagger | 31 Damage | 8 Defense | T2 | Class: Ranger/Worge | Sells for: 120 Gold_
- **Stormborn Dagger T3** — dmg 42, level 15, icon `Dagger_11.png`  
    _Stormborn Dagger T3 — Stormborn Dagger | 42 Damage | 12 Defense | T3 | Class: Ranger/Worge | Sells for: 240 Gold_
- **Stormborn Dagger T4** — dmg 55, level 20, icon `Dagger_11.png`  
    _Stormborn Dagger T4 — Stormborn Dagger | 55 Damage | 17 Defense | T4 | Class: Ranger/Worge | Sells for: 480 Gold_
- **Stormborn Dagger T5** — dmg 70, level 25, icon `Dagger_11.png`  
    _Stormborn Dagger T5 — Stormborn Dagger | 70 Damage | 23 Defense | T5 | Class: Ranger/Worge | Sells for: 1000 Gold_
- **Stormborn Dagger T6** — dmg 92, level 30, icon `Dagger_11.png`  
    _Stormborn Dagger T6 — Stormborn Dagger | 92 Damage | 30 Defense | T6 | Class: Ranger/Worge | Sells for: 2000 Gold_
- **Stormborn Dagger T7** — dmg 121, level 35, icon `Dagger_11.png`  
    _Stormborn Dagger T7 — Stormborn Dagger | 121 Damage | 40 Defense | T7 | Class: Ranger/Worge | Sells for: 4000 Gold_
- **Stormborn Dagger T8** — dmg 154, level 40, icon `Dagger_11.png`  
    _Stormborn Dagger T8 — Stormborn Dagger | 154 Damage | 52 Defense | T8 | Class: Ranger/Worge | Sells for: 10000 Gold_
- **Emberforged Dagger T1** — dmg 22, level 5, icon `Dagger_16.png`  
    _Emberforged Dagger T1 — Emberforged Dagger | 22 Damage | 5 Defense | T1 | Class: Ranger/Worge | Sells for: 60 Gold_
- **Emberforged Dagger T2** — dmg 31, level 10, icon `Dagger_16.png`  
    _Emberforged Dagger T2 — Emberforged Dagger | 31 Damage | 8 Defense | T2 | Class: Ranger/Worge | Sells for: 120 Gold_
- **Emberforged Dagger T3** — dmg 42, level 15, icon `Dagger_16.png`  
    _Emberforged Dagger T3 — Emberforged Dagger | 42 Damage | 12 Defense | T3 | Class: Ranger/Worge | Sells for: 240 Gold_
- **Emberforged Dagger T4** — dmg 55, level 20, icon `Dagger_16.png`  
    _Emberforged Dagger T4 — Emberforged Dagger | 55 Damage | 17 Defense | T4 | Class: Ranger/Worge | Sells for: 480 Gold_
- **Emberforged Dagger T5** — dmg 70, level 25, icon `Dagger_16.png`  
    _Emberforged Dagger T5 — Emberforged Dagger | 70 Damage | 23 Defense | T5 | Class: Ranger/Worge | Sells for: 1000 Gold_
- **Emberforged Dagger T6** — dmg 92, level 30, icon `Dagger_16.png`  
    _Emberforged Dagger T6 — Emberforged Dagger | 92 Damage | 30 Defense | T6 | Class: Ranger/Worge | Sells for: 2000 Gold_
- **Emberforged Dagger T7** — dmg 121, level 35, icon `Dagger_16.png`  
    _Emberforged Dagger T7 — Emberforged Dagger | 121 Damage | 40 Defense | T7 | Class: Ranger/Worge | Sells for: 4000 Gold_
- **Emberforged Dagger T8** — dmg 154, level 40, icon `Dagger_16.png`  
    _Emberforged Dagger T8 — Emberforged Dagger | 154 Damage | 52 Defense | T8 | Class: Ranger/Worge | Sells for: 10000 Gold_
- **Frostbound Dagger T1** — dmg 22, level 5, icon `Dagger_21.png`  
    _Frostbound Dagger T1 — Frostbound Dagger | 22 Damage | 5 Defense | T1 | Class: Ranger/Worge | Sells for: 60 Gold_
- **Frostbound Dagger T2** — dmg 31, level 10, icon `Dagger_21.png`  
    _Frostbound Dagger T2 — Frostbound Dagger | 31 Damage | 8 Defense | T2 | Class: Ranger/Worge | Sells for: 120 Gold_
- **Frostbound Dagger T3** — dmg 42, level 15, icon `Dagger_21.png`  
    _Frostbound Dagger T3 — Frostbound Dagger | 42 Damage | 12 Defense | T3 | Class: Ranger/Worge | Sells for: 240 Gold_
- **Frostbound Dagger T4** — dmg 55, level 20, icon `Dagger_21.png`  
    _Frostbound Dagger T4 — Frostbound Dagger | 55 Damage | 17 Defense | T4 | Class: Ranger/Worge | Sells for: 480 Gold_
- **Frostbound Dagger T5** — dmg 70, level 25, icon `Dagger_21.png`  
    _Frostbound Dagger T5 — Frostbound Dagger | 70 Damage | 23 Defense | T5 | Class: Ranger/Worge | Sells for: 1000 Gold_
- **Frostbound Dagger T6** — dmg 92, level 30, icon `Dagger_21.png`  
    _Frostbound Dagger T6 — Frostbound Dagger | 92 Damage | 30 Defense | T6 | Class: Ranger/Worge | Sells for: 2000 Gold_
- **Frostbound Dagger T7** — dmg 121, level 35, icon `Dagger_21.png`  
    _Frostbound Dagger T7 — Frostbound Dagger | 121 Damage | 40 Defense | T7 | Class: Ranger/Worge | Sells for: 4000 Gold_
- **Frostbound Dagger T8** — dmg 154, level 40, icon `Dagger_21.png`  
    _Frostbound Dagger T8 — Frostbound Dagger | 154 Damage | 52 Defense | T8 | Class: Ranger/Worge | Sells for: 10000 Gold_
- **Voidtouched Dagger T1** — dmg 22, level 5, icon `Dagger_26.png`  
    _Voidtouched Dagger T1 — Voidtouched Dagger | 22 Damage | 5 Defense | T1 | Class: Ranger/Worge | Sells for: 60 Gold_
- **Voidtouched Dagger T2** — dmg 31, level 10, icon `Dagger_26.png`  
    _Voidtouched Dagger T2 — Voidtouched Dagger | 31 Damage | 8 Defense | T2 | Class: Ranger/Worge | Sells for: 120 Gold_
- **Voidtouched Dagger T3** — dmg 42, level 15, icon `Dagger_26.png`  
    _Voidtouched Dagger T3 — Voidtouched Dagger | 42 Damage | 12 Defense | T3 | Class: Ranger/Worge | Sells for: 240 Gold_
- **Voidtouched Dagger T4** — dmg 55, level 20, icon `Dagger_26.png`  
    _Voidtouched Dagger T4 — Voidtouched Dagger | 55 Damage | 17 Defense | T4 | Class: Ranger/Worge | Sells for: 480 Gold_
- **Voidtouched Dagger T5** — dmg 70, level 25, icon `Dagger_26.png`  
    _Voidtouched Dagger T5 — Voidtouched Dagger | 70 Damage | 23 Defense | T5 | Class: Ranger/Worge | Sells for: 1000 Gold_
- **Voidtouched Dagger T6** — dmg 92, level 30, icon `Dagger_26.png`  
    _Voidtouched Dagger T6 — Voidtouched Dagger | 92 Damage | 30 Defense | T6 | Class: Ranger/Worge | Sells for: 2000 Gold_
- **Voidtouched Dagger T7** — dmg 121, level 35, icon `Dagger_26.png`  
    _Voidtouched Dagger T7 — Voidtouched Dagger | 121 Damage | 40 Defense | T7 | Class: Ranger/Worge | Sells for: 4000 Gold_
- **Voidtouched Dagger T8** — dmg 154, level 40, icon `Dagger_26.png`  
    _Voidtouched Dagger T8 — Voidtouched Dagger | 154 Damage | 52 Defense | T8 | Class: Ranger/Worge | Sells for: 10000 Gold_

### legacy → other / unclassified (708)
- **Club** — dmg 10, level 1, icon `Hammer_11.png`  
    _Club_
- **White Bow** — dmg 10, level 1, icon `Bow_12.png`  
    _White Bow_
- **Tome Of The Magi** — dmg 100, level 20, icon `Book_22.png`  
    _Tome Of The Magi_
- **Book Of Storms Vol I** — dmg 5, level 1, icon `Book_23.png`  
    _Book Of Storms Vol I_
- **Holy Spell Book Vol I** — dmg 5, level 1, icon `Book_11.png`  
    _Holy Spell Book Vol I_
- **Nature Spell Book Vol I** — dmg 5, level 1, icon `Book_4.png`  
    _Nature Spell Book Vol I_
- **Tome Of Fire Vol I** — dmg 5, level 1, icon `Book_11.png`  
    _Tome Of Fire Vol I_
- **Tome Of Ice Vol I** — dmg 5, level 1, icon `Book_12.png`  
    _Tome Of Ice Vol I_
- **Book Of Storms Vol II** — dmg 50, level 10, icon `Book_23.png`  
    _Book Of Storms Vol II_
- **Holy Spell Book Vol II** — dmg 50, level 10, icon `Book_11.png`  
    _Holy Spell Book Vol II_
- **Nature Spell Book Vol II** — dmg 50, level 10, icon `Book_4.png`  
    _Nature Spell Book Vol II_
- **Tome Of Fire Vol II** — dmg 50, level 10, icon `Book_11.png`  
    _Tome Of Fire Vol II_
- **Tome Of Ice Vol II** — dmg 50, level 10, icon `Book_12.png`  
    _Tome Of Ice Vol II_
- **Book Of Storms Vol III** — dmg 100, level 20, icon `Book_23.png`  
    _Book Of Storms Vol III_
- **Holy Spell Book Vol III** — dmg 100, level 20, icon `Book_11.png`  
    _Holy Spell Book Vol III_
- **Nature Spell Book Vol III** — dmg 100, level 20, icon `Book_4.png`  
    _Nature Spell Book Vol III_
- **Tome Of Fire Vol III** — dmg 100, level 20, icon `Book_11.png`  
    _Tome Of Fire Vol III_
- **Tome Of Ice Vol III** — dmg 100, level 20, icon `Book_12.png`  
    _Tome Of Ice Vol III_
- **Swift Bow** — dmg 100, level 20, icon `Bow_20.png`  
    _Swift Bow_
- **War Bow** — dmg 100, level 20, icon `Bow_39.png`  
    _War Bow_
- **Bow** — dmg 10, level 1, icon `Bow_27.png`  
    _Bow_
- **Wood Bow** — dmg 5, level 1, icon `Bow_32.png`  
    _Wood Bow_
- **Steady Bow** — dmg 50, level 10, icon `Bow_05.png`  
    _Steady Bow_
- **Razer Bow** — dmg 75, level 10, icon `Bow_23.png`  
    _Razer Bow_
- **Wind Walker Bow** — dmg 100, level 20, icon `Bow_33.png`  
    _Wind Walker Bow_
- **Royal Spear** — dmg 100, level 20, icon `Spear_17.png`  
    _Royal Spear_
- **Spear Of Destiny** — dmg 100, level 20, icon `Spear_25.png`  
    _Spear Of Destiny_
- **Pike** — dmg 5, level 1, icon `Spear_04.png`  
    _Pike_
- **Spear** — dmg 5, level 1, icon `Spear_18.png`  
    _Spear_
- **Light Spear** — dmg 25, level 5, icon `Spear_32.png`  
    _Light Spear_
- **Lance** — dmg 50, level 10, icon `Spear_04.png`  
    _Lance_
- **Metal Spear** — dmg 75, level 10, icon `Spear_01.png`  
    _Metal Spear_
- **War Spear** — dmg 100, level 20, icon `Spear_16.png`  
    _War Spear_
- **Thor's Hammer** — dmg 100, level 20, icon `Hammer_34.png`  
    _Thor's Hammer_
- **Sledge Hammer** — dmg 5, level 1, icon `Hammer_43.png`  
    _Sledge Hammer_
- **Steel Maul** — dmg 25, level 5, icon `Hammer_29.png`  
    _Steel Maul_
- **Spiked Club** — dmg 50, level 10, icon `Hammer_41.png`  
    _Spiked Club_
- **War Hammer** — dmg 100, level 20, icon `Hammer_07.png`  
    _War Hammer_
- **Hammer** — dmg 10, level 1, icon `Hammer_25.png`  
    _Hammer_
- **Apprentice Staff** — dmg 16, level ?, icon `staff_21.png`  
    _Apprentice Staff - A novice mage's first channeling focus. | 16 Damage | 4 Defense | Tier 0 | Sells for: 20 Gold_
- ... (+668 more hidden for brevity)

## Proposed consolidation (my first draft — await your edits)

For each current base item I propose keeping the existing name + signature + passives but:

1. Wire the bespoke icon at `/icons/weapons/<slug>.png` so no two base items share an icon.
2. Move the item definition into `scripts/defs/weapons.mjs` with a `slug` field.
3. Fold any legacy item that is clearly a generic duplicate (e.g. "Club", "Wood Bow", "Blacksmiths Sword") into the T1 common-tier bucket of the matching base item, or drop it if redundant.
4. Any legacy item that has a distinct identity (e.g. named, quest-gated, unique tooltip) stays on the triage list for your call.

Per-category proposals:

### swords — proposed
- keep **Bloodfeud Blade**, slug `bloodfeud-blade`, bespoke icon: `/icons/weapons/bloodfeud-blade.png`
- keep **Wraithfang**, slug `wraithfang`, bespoke icon: `/icons/weapons/wraithfang.png`
- keep **Oathbreaker**, slug `oathbreaker`, bespoke icon: `/icons/weapons/oathbreaker.png`
- keep **Kinrend**, slug `kinrend`, bespoke icon: `/icons/weapons/kinrend.png`
- keep **Dusksinger**, slug `dusksinger`, bespoke icon: `/icons/weapons/dusksinger.png`
- keep **Emberclad**, slug `emberclad`, bespoke icon: `/icons/weapons/emberclad.png`
- fold legacy swords (164) into the T1 common-tier generic slot unless you call out named exceptions

### axes — proposed
- keep **Gorehowl**, slug `gorehowl`, bespoke icon: `/icons/weapons/gorehowl.png`
- keep **Skullsplitter**, slug `skullsplitter`, bespoke icon: `/icons/weapons/skullsplitter.png`
- keep **Veinreaver**, slug `veinreaver`, bespoke icon: `/icons/weapons/veinreaver.png`
- keep **Ironmaw**, slug `ironmaw`, bespoke icon: `/icons/weapons/ironmaw.png`
- keep **Dreadcleaver**, slug `dreadcleaver`, bespoke icon: `/icons/weapons/dreadcleaver.png`
- keep **Bonehew**, slug `bonehew`, bespoke icon: `/icons/weapons/bonehew.png`
- fold legacy axes (52) into the T1 common-tier generic slot unless you call out named exceptions

### daggers — proposed
- keep **Nightfang**, slug `nightfang`, bespoke icon: `/icons/weapons/nightfang.png`
- keep **Bloodshiv**, slug `bloodshiv`, bespoke icon: `/icons/weapons/bloodshiv.png`
- keep **Wraithclaw**, slug `wraithclaw`, bespoke icon: `/icons/weapons/wraithclaw.png`
- keep **Emberfang**, slug `emberfang`, bespoke icon: `/icons/weapons/emberfang.png`
- keep **Ironspike**, slug `ironspike`, bespoke icon: `/icons/weapons/ironspike.png`
- keep **Duskblade**, slug `duskblade`, bespoke icon: `/icons/weapons/duskblade.png`
- fold legacy daggers (51) into the T1 common-tier generic slot unless you call out named exceptions

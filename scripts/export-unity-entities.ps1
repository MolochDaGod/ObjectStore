# ═══════════════════════════════════════════════════════════════
# export-unity-entities.ps1 — Unity Monsters, Creatures, NPCs,
# Mercs, Characters → ObjectStore
# Exports textures + FBX models into organized categories.
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"

$UNITY = "D:\GRUDGE-NEW-GGG\FRESH GRUDGE\Assets"
$OUT   = "D:\ObjectStore"

# ── Entity source packs ───────────────────────────────────────
$ENTITY_PACKS = @(
    # ── MONSTERS / BOSSES ──
    @{ Name="fantasy-monster-pack";  Path="FANTASY MONSTER PACK01";                  Category="monsters"; Tags=@("monster","enemy","fantasy","pack") }
    @{ Name="fantasy-monster-3in1";  Path="Fantasy Monster(3 in 1)";                 Category="monsters"; Tags=@("monster","enemy","3in1") }
    @{ Name="four-evil-dragons";     Path="FourEvilDragonsHP";                       Category="monsters"; Tags=@("dragon","boss","flying") }
    @{ Name="fantasy-dragons";       Path="Fantasy-dragons";                         Category="monsters"; Tags=@("dragon","flying") }
    @{ Name="dragon-terror";         Path="DragonTerrorBringer";                     Category="monsters"; Tags=@("dragon","boss","terror") }
    @{ Name="minotaur";              Path="minotaur1";                               Category="monsters"; Tags=@("minotaur","boss","melee") }
    @{ Name="cave-troll";            Path="cave_troll";                              Category="monsters"; Tags=@("troll","cave","melee") }
    @{ Name="earthborn-troll";       Path="Earthborn Troll";                         Category="monsters"; Tags=@("troll","earthborn","heavy") }
    @{ Name="mean-troll";            Path="Mean Looking Troll";                      Category="monsters"; Tags=@("troll","enemy") }
    @{ Name="battle-spider";         Path="Fantasy_creature_Battle Spider";          Category="monsters"; Tags=@("spider","creature","boss") }
    @{ Name="spider-green";          Path="Spider Green";                            Category="monsters"; Tags=@("spider","creature","green") }
    @{ Name="arachnid";              Path="character arachnid";                      Category="monsters"; Tags=@("spider","arachnid","creature") }
    @{ Name="tortoise-boss";         Path="Tortoise Boss";                           Category="monsters"; Tags=@("tortoise","boss","heavy") }
    @{ Name="big-bat";               Path="big_bat_carb";                            Category="monsters"; Tags=@("bat","flying","cave") }
    @{ Name="wolf-rpg";              Path="Casual RPG Monster - 26 Wolf";            Category="monsters"; Tags=@("wolf","beast","pack") }
    @{ Name="velociraptor";          Path="PBRVelociraptor";                         Category="monsters"; Tags=@("raptor","dinosaur","beast") }
    @{ Name="rhino";                 Path="Rhino";                                   Category="monsters"; Tags=@("rhino","beast","charge") }
    @{ Name="true-creatures";        Path="True_Fantastic_Creatures";                Category="monsters"; Tags=@("creature","fantastic","mixed") }
    @{ Name="egypt-monsters";        Path="EgyptMonsters";                           Category="monsters"; Tags=@("egypt","undead","desert") }
    @{ Name="creatures-titan";       Path="Creatures Titan";                         Category="monsters"; Tags=@("titan","boss","giant") }
    @{ Name="lowpoly-monsters";      Path="LowPoly Fantasy Monsters Pack Ver1.0_Demo"; Category="monsters"; Tags=@("lowpoly","monster","pack") }
    @{ Name="boss-hunter";           Path="Boss_Character_Hunter";                   Category="monsters"; Tags=@("boss","hunter","elite") }
    @{ Name="juggernaut";            Path="Character Juggernaut";                    Category="monsters"; Tags=@("juggernaut","boss","heavy") }
    @{ Name="reptile";               Path="Character_Reptile";                       Category="monsters"; Tags=@("reptile","creature","lizard") }
    @{ Name="mini-legion-grunt";     Path="Mini Legion Grunt PBR HP Polyart";        Category="monsters"; Tags=@("grunt","legion","minion") }
    @{ Name="mini-legion-golem";     Path="Mini Legion Rock Golem PBR HP Polyart";   Category="monsters"; Tags=@("golem","legion","rock") }
    @{ Name="mini-orc";              Path="mini_orc_free";                           Category="monsters"; Tags=@("orc","minion","small") }
    @{ Name="mimic";                 Path="Mimic";                                   Category="monsters"; Tags=@("mimic","trap","chest") }
    @{ Name="orc-army";              Path="Orc Army Pack";                           Category="monsters"; Tags=@("orc","army","enemy") }
    @{ Name="orc-weapons";           Path="OrcWeapons";                              Category="monsters"; Tags=@("orc","weapon") }
    @{ Name="lowpoly-ghost-tiger";   Path="LowPoly_GhostTiger";                     Category="monsters"; Tags=@("ghost","tiger","undead","beast") }
    @{ Name="polygonal-metalon";     Path="Polygonal Metalon";                       Category="monsters"; Tags=@("metalon","construct","golem") }

    # ── Character/NewMonster (Chinese-named but actual game monsters) ──
    @{ Name="monster-bear";          Path="Character\NewMonster\bear";               Category="monsters"; Tags=@("bear","beast","cave") }
    @{ Name="monster-gargoyle";      Path="Character\NewMonster\gargoyle+";          Category="monsters"; Tags=@("gargoyle","flying","stone") }
    @{ Name="monster-goblin";        Path="Character\NewMonster\goblin+";            Category="monsters"; Tags=@("goblin","minion","cave") }
    @{ Name="monster-megma";         Path="Character\NewMonster\megma+";             Category="monsters"; Tags=@("magma","elemental","fire") }
    @{ Name="monster-mengyan";       Path="Character\NewMonster\mengyan";            Category="monsters"; Tags=@("demon","melee") }
    @{ Name="monster-mengyan2";      Path="Character\NewMonster\mengyan+";           Category="monsters"; Tags=@("demon","melee","upgraded") }
    @{ Name="monster-mengyan3";      Path="Character\NewMonster\mengyan++";          Category="monsters"; Tags=@("demon","elite") }
    @{ Name="monster-mengyan4";      Path="Character\NewMonster\mengyan+++";         Category="monsters"; Tags=@("demon","boss") }
    @{ Name="monster-bull-demon";    Path="Character\NewMonster\niutouguai+";        Category="monsters"; Tags=@("bull","demon","minotaur") }
    @{ Name="monster-crystal";       Path="Character\NewMonster\ntzs+";             Category="monsters"; Tags=@("crystal","elemental") }
    @{ Name="monster-desert-lion";   Path="Character\NewMonster\shamosishi";         Category="monsters"; Tags=@("lion","desert","beast") }
    @{ Name="monster-siren";         Path="Character\NewMonster\shiren";             Category="monsters"; Tags=@("siren","water","creature") }
    @{ Name="monster-dual-head";     Path="Character\NewMonster\shuangtouguai+";    Category="monsters"; Tags=@("two-headed","creature","boss") }
    @{ Name="monster-push-demon";    Path="Character\NewMonster\tuishimo+";          Category="monsters"; Tags=@("demon","push","melee") }
    @{ Name="monster-fog";           Path="Character\NewMonster\wuyao";              Category="monsters"; Tags=@("fog","wraith","undead") }
    @{ Name="monster-scorpion";      Path="Character\NewMonster\xieren";             Category="monsters"; Tags=@("scorpion","desert","creature") }
    @{ Name="monster-crab";          Path="Character\NewMonster\xiezi+";             Category="monsters"; Tags=@("crab","creature","beach") }
    @{ Name="monster-vampire";       Path="Character\NewMonster\xiyiren+";           Category="monsters"; Tags=@("vampire","undead","dark") }
    @{ Name="monster-yeti";          Path="Character\NewMonster\xueyuan+";           Category="monsters"; Tags=@("yeti","ice","beast") }
    @{ Name="monster-wolf-dark";     Path="Character\NewMonster\yelang";             Category="monsters"; Tags=@("wolf","dark","beast") }
    @{ Name="monster-wolf-pack";     Path="Character\NewMonster\yelang+";            Category="monsters"; Tags=@("wolf","pack","beast") }
    @{ Name="monster-harpy";         Path="Character\NewMonster\yinlingniao";        Category="monsters"; Tags=@("harpy","flying","creature") }
    @{ Name="monster-octopus-boss";  Path="Character\NewMonster\zhangyuboss";        Category="monsters"; Tags=@("octopus","boss","water") }
    @{ Name="monster-spider-cave";   Path="Character\NewMonster\zhizhu+";            Category="monsters"; Tags=@("spider","cave","creature") }
    @{ Name="monster-zombie";        Path="Character\NewMonster\zombie";             Category="monsters"; Tags=@("zombie","undead") }
    @{ Name="monster-zombie-elite";  Path="Character\NewMonster\zombie+";            Category="monsters"; Tags=@("zombie","undead","elite") }

    # ── NECROMANCER / DARK ELF / MERCS ──
    @{ Name="necromancer";           Path="Necromancer";                              Category="npcs"; Tags=@("necromancer","dark","mage","boss") }
    @{ Name="demonic-ui";            Path="Demonic_UI";                              Category="ui"; Tags=@("demonic","dark","ui","icons") }
    @{ Name="captain-cat-sparrow";   Path="CaptainCatSparrow";                      Category="npcs"; Tags=@("pirate","captain","npc","merc") }
    @{ Name="poly-ninja";            Path="Poly Ninja";                              Category="npcs"; Tags=@("ninja","merc","stealth") }
    @{ Name="suriyun-characters";    Path="Suriyun";                                 Category="npcs"; Tags=@("character","npc","varied") }
    @{ Name="phat-phrog";            Path="Phat Phrog Studios";                      Category="npcs"; Tags=@("character","npc","stylized") }
    @{ Name="travis-assets";         Path="Travis Game Assets";                      Category="npcs"; Tags=@("character","npc","traveler") }
    @{ Name="allstar-library";       Path="AllStarCharacterLibrary";                 Category="npcs"; Tags=@("character","library","mixed") }
    @{ Name="siuniaev-chars";        Path="SiuniaevCharacters";                      Category="npcs"; Tags=@("character","dark-elf","merc") }
    @{ Name="cartoon-heroes";        Path="Cartoon Heroes";                          Category="npcs"; Tags=@("hero","cartoon","merc") }

    # ── PLAYER CHARACTER CLASSES ──
    @{ Name="player-archer";         Path="Character\MainCharacter\archer+";         Category="characters"; Tags=@("player","ranger","archer") }
    @{ Name="player-assassin";       Path="Character\MainCharacter\assassin+";       Category="characters"; Tags=@("player","rogue","assassin") }
    @{ Name="player-mage";           Path="Character\MainCharacter\mage+";           Category="characters"; Tags=@("player","mage","caster") }
    @{ Name="player-warrior";        Path="Character\MainCharacter\warrior++";       Category="characters"; Tags=@("player","warrior","tank") }
    @{ Name="npc-guardian";          Path="Character\NPC\shouhunvshen000";           Category="npcs"; Tags=@("npc","guardian","quest") }

    # ── TOON_RTS RACE MODELS ──
    @{ Name="toon-barbarians";       Path="Toon_RTS\Barbarians";                    Category="characters"; Tags=@("barbarian","race","toon") }
    @{ Name="toon-dwarves";          Path="Toon_RTS\Dwarves";                       Category="characters"; Tags=@("dwarf","race","toon") }
    @{ Name="toon-elves";            Path="Toon_RTS\Elves";                         Category="characters"; Tags=@("elf","race","toon") }
    @{ Name="toon-orcs";             Path="Toon_RTS\Orcs";                          Category="characters"; Tags=@("orc","race","toon") }
    @{ Name="toon-undead";           Path="Toon_RTS\Undead";                        Category="characters"; Tags=@("undead","race","toon") }
    @{ Name="toon-humans";           Path="Toon_RTS\WesternKingdoms";               Category="characters"; Tags=@("human","race","toon","crusade") }

    # ── WINGS / MOUNTS / SPECIAL ──
    @{ Name="angel-wings";           Path="AngelWings";                              Category="mounts"; Tags=@("wings","angel","flying") }
    @{ Name="phoenix-wings";         Path="Phoenix_Wings";                           Category="mounts"; Tags=@("wings","phoenix","fire") }
    @{ Name="polygonal-wings";       Path="Polygonal Wings Pack";                    Category="mounts"; Tags=@("wings","varied","mount") }
    @{ Name="pirate-ship";           Path="Stylized_Pirate_Ship";                   Category="ships"; Tags=@("ship","pirate","sailing") }

    # ── ISLAND ENVIRONMENT ──
    @{ Name="deep-nest";             Path="DeepNest";                                Category="environment"; Tags=@("cave","dungeon","dark") }
    @{ Name="deep-zone";             Path="DeepZone";                                Category="environment"; Tags=@("underwater","deep","zone") }
    @{ Name="ancient-ruins";         Path="AncientRuins";                            Category="environment"; Tags=@("ruins","ancient","temple") }
    @{ Name="medieval-castle";       Path="Medieval Castle";                         Category="environment"; Tags=@("castle","medieval","fortress") }
    @{ Name="modular-castle";        Path="Modular Castle";                          Category="environment"; Tags=@("castle","modular","building") }
    @{ Name="medieval-fortification";Path="Medieval Fortification";                  Category="environment"; Tags=@("fortification","wall","tower") }
    @{ Name="triple-dungeon";        Path="Triple Dungeon Pack";                     Category="environment"; Tags=@("dungeon","cave","underground") }
    @{ Name="toon-nature";           Path="Toon Nature";                             Category="environment"; Tags=@("nature","trees","island") }
    @{ Name="fantasy-forest";        Path="Fantasy Forest Environment Free Sample";  Category="environment"; Tags=@("forest","trees","nature") }
    @{ Name="donjon";                Path="donjon";                                  Category="environment"; Tags=@("dungeon","generator","tileset") }
    @{ Name="caves-parts";           Path="Caves Parts Set";                         Category="environment"; Tags=@("cave","parts","modular") }
    @{ Name="crystal-mine";          Path="Crystal_Mine";                            Category="environment"; Tags=@("mine","crystal","underground") }
    @{ Name="fantasy-village";       Path="fantasy village mobile pack";             Category="environment"; Tags=@("village","buildings","town") }
    @{ Name="medieval-cartoon-village"; Path="Medieval_Cartoon_Village";              Category="environment"; Tags=@("village","medieval","cartoon") }
    @{ Name="medieval-house";        Path="Medieval_house_lite";                     Category="environment"; Tags=@("house","building","medieval") }
    @{ Name="toon-crystals";         Path="Toon Crystals pack";                      Category="environment"; Tags=@("crystal","resource","toon") }
)

# ── Create output categories ──────────────────────────────────
$CATS = @("monsters","npcs","characters","mounts","ships","environment","ui")
foreach ($cat in $CATS) {
    foreach ($sub in @("textures","models")) {
        $dir = Join-Path $OUT "$cat\$sub"
        if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    }
}

Write-Host "=== Unity Entities -> ObjectStore Export ===" -ForegroundColor Cyan
Write-Host "Source: $UNITY"
Write-Host "Target: $OUT"
Write-Host ""

# ── Process ───────────────────────────────────────────────────
$manifest = @{
    version   = "1.0.0"
    generated = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    source    = "FRESH GRUDGE Unity Project"
    packs     = @()
    assets    = @()
    stats     = @{ totalTextures = 0; totalModels = 0; totalBytes = 0; categories = @{} }
}

$totalTex = 0; $totalMdl = 0

foreach ($pack in $ENTITY_PACKS) {
    $srcDir = Join-Path $UNITY $pack.Path
    if (-not (Test-Path -LiteralPath $srcDir)) {
        Write-Host "  SKIP: $($pack.Name) - not found" -ForegroundColor DarkGray
        continue
    }

    $cat = $pack.Category
    $pngFiles = @(Get-ChildItem -LiteralPath $srcDir -Recurse -Filter *.png -EA 0)
    $tgaFiles = @(Get-ChildItem -LiteralPath $srcDir -Recurse -Filter *.tga -EA 0)
    $fbxFiles = @(Get-ChildItem -LiteralPath $srcDir -Recurse -Filter *.fbx -EA 0)
    $matFiles = @(Get-ChildItem -LiteralPath $srcDir -Recurse -Filter *.mat -EA 0)

    $packTexCount = 0; $packMdlCount = 0; $packEntries = @()

    # Copy textures (PNG + TGA)
    foreach ($file in ($pngFiles + $tgaFiles)) {
        $destName = "$($pack.Name)_$($file.Name)"
        $destPath = Join-Path $OUT "$cat\textures\$destName"
        if (-not (Test-Path -LiteralPath $destPath)) {
            Copy-Item -LiteralPath $file.FullName -Destination $destPath -Force
        }
        $packEntries += @{
            filename = $destName; original = $file.Name; type = "texture"
            category = $cat; pack = $pack.Name; size = $file.Length
            tags = $pack.Tags; path = "$cat/textures/$destName"
        }
        $manifest.stats.totalBytes += $file.Length
        $packTexCount++; $totalTex++
    }

    # Copy FBX models
    foreach ($file in $fbxFiles) {
        $destName = "$($pack.Name)_$($file.Name)"
        $destPath = Join-Path $OUT "$cat\models\$destName"
        if (-not (Test-Path -LiteralPath $destPath)) {
            Copy-Item -LiteralPath $file.FullName -Destination $destPath -Force
        }
        $packEntries += @{
            filename = $destName; original = $file.Name; type = "model"
            category = $cat; pack = $pack.Name; size = $file.Length
            tags = $pack.Tags; path = "$cat/models/$destName"
        }
        $manifest.stats.totalBytes += $file.Length
        $packMdlCount++; $totalMdl++
    }

    $manifest.assets += $packEntries
    $manifest.packs += @{
        name = $pack.Name; source = $pack.Path; category = $cat
        textures = $packTexCount; models = $packMdlCount; tags = $pack.Tags
    }

    if (-not $manifest.stats.categories[$cat]) { $manifest.stats.categories[$cat] = @{ textures=0; models=0 } }
    $manifest.stats.categories[$cat].textures += $packTexCount
    $manifest.stats.categories[$cat].models += $packMdlCount

    $color = if (($packTexCount + $packMdlCount) -gt 0) { "Green" } else { "DarkGray" }
    Write-Host "  $($pack.Name) [$cat]: $packTexCount tex, $packMdlCount mdl" -ForegroundColor $color
}

$manifest.stats.totalTextures = $totalTex
$manifest.stats.totalModels = $totalMdl

# ── Write manifests ───────────────────────────────────────────
$manifestPath = Join-Path $OUT "entities-manifest.json"
$manifestJson = $manifest | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText($manifestPath, $manifestJson, [System.Text.Encoding]::UTF8)
Write-Host "`nManifest: $manifestPath" -ForegroundColor Yellow

$apiPath = Join-Path $OUT "api\v1\entities.json"
$apiDir = Split-Path $apiPath -Parent
if (-not (Test-Path -LiteralPath $apiDir)) { New-Item -ItemType Directory -Path $apiDir -Force | Out-Null }

$apiData = @{
    version = "1.0.0"; generated = $manifest.generated
    baseUrl = "https://molochdagod.github.io/ObjectStore"
    cdnUrl  = "https://assets.grudge-studio.com"
    totalTextures = $totalTex; totalModels = $totalMdl
    categories = $manifest.stats.categories
    packs = $manifest.packs
    assets = $manifest.assets | ForEach-Object {
        @{ filename=$_.filename; type=$_.type; category=$_.category; pack=$_.pack; tags=$_.tags; path=$_.path; size=$_.size }
    }
}
$apiJson = $apiData | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText($apiPath, $apiJson, [System.Text.Encoding]::UTF8)
Write-Host "API JSON: $apiPath" -ForegroundColor Yellow

# ── Summary ───────────────────────────────────────────────────
Write-Host "`n=== Export Complete ===" -ForegroundColor Cyan
Write-Host "Textures: $totalTex | Models: $totalMdl | Size: $([math]::Round($manifest.stats.totalBytes / 1MB, 1)) MB"
Write-Host "Categories:"
foreach ($cat in $manifest.stats.categories.GetEnumerator()) {
    Write-Host "  $($cat.Key): $($cat.Value.textures) tex, $($cat.Value.models) mdl"
}

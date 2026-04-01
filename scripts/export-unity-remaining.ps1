# ═══════════════════════════════════════════════════════════════
# export-unity-remaining.ps1 — Final sweep: weapons, ships,
# animals, buildings, and remaining packs
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"
$UNITY = "D:\GRUDGE-NEW-GGG\FRESH GRUDGE\Assets"
$OUT   = "D:\ObjectStore"

$PACKS = @(
    # ── WEAPONS ──
    @{ Name="blink-new-wep";        Path="Blink NEW TEXTURE NEW WEP"; Category="weapons"; Tags=@("weapon","texture","blink","new") }
    @{ Name="blunt-weapons";        Path="Blunt_Weapon_Pack";         Category="weapons"; Tags=@("weapon","blunt","mace","hammer") }
    @{ Name="cartoon-weapons";      Path="Cartoon_Weapon_Pack";       Category="weapons"; Tags=@("weapon","cartoon","toon") }
    @{ Name="dk-sword-shield";      Path="DKSwordAndShield";          Category="weapons"; Tags=@("weapon","sword","shield","dark-knight") }
    @{ Name="elven-weapons";        Path="Elven Weapons";             Category="weapons"; Tags=@("weapon","elf","elven") }
    @{ Name="free-weapons";         Path="FreeWeapons";               Category="weapons"; Tags=@("weapon","free","mixed") }
    @{ Name="greatsword-frozen";    Path="GreatswordofFrozenNight";   Category="weapons"; Tags=@("weapon","greatsword","ice","legendary") }
    @{ Name="handpainted-weapons";  Path="Hand_Painted_Weapon_set";   Category="weapons"; Tags=@("weapon","handpainted","rpg") }
    @{ Name="low-poly-weapons";     Path="Low-Poly Weapons";          Category="weapons"; Tags=@("weapon","lowpoly") }
    @{ Name="lowpoly-sword";        Path="Low Poly Fantasy Sword";    Category="weapons"; Tags=@("weapon","sword","lowpoly") }
    @{ Name="myfg-weapons";         Path="MYFG-Weapon Pack Lite";     Category="weapons"; Tags=@("weapon","pack","mixed") }
    @{ Name="rpg-starter-weapons";  Path="RPGStarterStylizedWeaponPack"; Category="weapons"; Tags=@("weapon","rpg","starter") }
    @{ Name="stone-age-weapons";    Path="Stone Age Weapons Pack";    Category="weapons"; Tags=@("weapon","primitive","stone") }
    @{ Name="stylized-knife";       Path="Stylezed_knife";            Category="weapons"; Tags=@("weapon","knife","dagger") }
    @{ Name="toon-fantasy-sword";   Path="Toon Fantasy Sword";        Category="weapons"; Tags=@("weapon","sword","toon") }
    @{ Name="basic-rpg-weapons";    Path="Basic Handpainted RPG Weapons"; Category="weapons"; Tags=@("weapon","basic","rpg") }
    @{ Name="warrior-weapon";       Path="Warrior";                   Category="weapons"; Tags=@("weapon","warrior") }
    @{ Name="weapons-misc";         Path="Weapons";                   Category="weapons"; Tags=@("weapon","misc") }

    # ── SHIPS / BOATS ──
    @{ Name="sailing-ships";        Path="Sailing Ships";             Category="ships"; Tags=@("ship","sailing","ocean") }
    @{ Name="ussc-brig-sloop";      Path="USSC Brig Sloop";          Category="ships"; Tags=@("ship","brig","sloop","naval") }
    @{ Name="boats";                Path="Boats";                     Category="ships"; Tags=@("boat","small","water") }
    @{ Name="balloon-boat";         Path="Balloon_Boat_Dark";         Category="ships"; Tags=@("boat","balloon","flying") }

    # ── ANIMALS ──
    @{ Name="wild-animals";         Path="StylizedWildAnimalsPack";   Category="monsters"; Tags=@("animal","wild","beast","island") }

    # ── BUILDINGS / ENVIRONMENT ──
    @{ Name="lowpoly-medieval-bldg"; Path="low poly medieval buildings"; Category="environment"; Tags=@("building","medieval","lowpoly") }
    @{ Name="simple-temple";        Path="Simple Temple Props";       Category="environment"; Tags=@("temple","props","ancient") }
    @{ Name="ancient-altar";        Path="_AncientAltar";             Category="environment"; Tags=@("altar","ancient","ritual") }
    @{ Name="fantasy-furniture";    Path="Fantasy Furniture Pack";    Category="environment"; Tags=@("furniture","interior","props") }
    @{ Name="animated-chest";       Path="Animated Fantasy Polygon Chest"; Category="environment"; Tags=@("chest","loot","animated") }
    @{ Name="wood-splitting";       Path="Wood Splitting Pack 1";     Category="environment"; Tags=@("wood","harvesting","resource") }
    @{ Name="palm-tree";            Path="Palm tree";                 Category="environment"; Tags=@("tree","palm","island","tropical") }

    # ── EXPLOSIONS / MELEE ANIMS ──
    @{ Name="explosive-llc";        Path="ExplosiveLLC";              Category="effects"; Tags=@("explosion","impact","destructible") }
    @{ Name="melee-animations";     Path="Melee Animations";          Category="characters"; Tags=@("animation","melee","combat") }
    @{ Name="energalis";            Path="Energalis";                 Category="effects"; Tags=@("energy","magic","aura") }

    # ── REMAINING CHARACTERS ──
    @{ Name="characters-extra";     Path="!! Characters!!";           Category="characters"; Tags=@("character","extra","mixed") }
    @{ Name="3d-assets-misc";       Path="3D Assets";                 Category="environment"; Tags=@("3d","prop","misc") }
)

# Create dirs
foreach ($cat in @("weapons","ships","effects")) {
    foreach ($sub in @("textures","models")) {
        $dir = Join-Path $OUT "$cat\$sub"
        if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    }
}

Write-Host "=== Final Sweep Export ===" -ForegroundColor Cyan

$manifest = @{ version="1.0.0"; generated=(Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"); packs=@(); assets=@(); stats=@{ totalTextures=0; totalModels=0; totalBytes=0; categories=@{} } }
$totalTex = 0; $totalMdl = 0

foreach ($pack in $PACKS) {
    $srcDir = Join-Path $UNITY $pack.Path
    if (-not (Test-Path -LiteralPath $srcDir)) { Write-Host "  SKIP: $($pack.Name)" -ForegroundColor DarkGray; continue }

    $cat = $pack.Category
    $pngFiles = @(Get-ChildItem -LiteralPath $srcDir -Recurse -Filter *.png -EA 0)
    $tgaFiles = @(Get-ChildItem -LiteralPath $srcDir -Recurse -Filter *.tga -EA 0)
    $fbxFiles = @(Get-ChildItem -LiteralPath $srcDir -Recurse -Filter *.fbx -EA 0)

    $ptc = 0; $pmc = 0; $entries = @()

    foreach ($file in ($pngFiles + $tgaFiles)) {
        $destName = "$($pack.Name)_$($file.Name)"
        $destDir = Join-Path $OUT "$cat\textures"
        if (-not (Test-Path -LiteralPath $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
        $destPath = Join-Path $destDir $destName
        if (-not (Test-Path -LiteralPath $destPath)) { Copy-Item -LiteralPath $file.FullName -Destination $destPath -Force }
        $entries += @{ filename=$destName; type="texture"; category=$cat; pack=$pack.Name; size=$file.Length; tags=$pack.Tags; path="$cat/textures/$destName" }
        $manifest.stats.totalBytes += $file.Length; $ptc++; $totalTex++
    }

    foreach ($file in $fbxFiles) {
        $destName = "$($pack.Name)_$($file.Name)"
        $destDir = Join-Path $OUT "$cat\models"
        if (-not (Test-Path -LiteralPath $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
        $destPath = Join-Path $destDir $destName
        if (-not (Test-Path -LiteralPath $destPath)) { Copy-Item -LiteralPath $file.FullName -Destination $destPath -Force }
        $entries += @{ filename=$destName; type="model"; category=$cat; pack=$pack.Name; size=$file.Length; tags=$pack.Tags; path="$cat/models/$destName" }
        $manifest.stats.totalBytes += $file.Length; $pmc++; $totalMdl++
    }

    $manifest.assets += $entries
    $manifest.packs += @{ name=$pack.Name; category=$cat; textures=$ptc; models=$pmc; tags=$pack.Tags }
    if (-not $manifest.stats.categories[$cat]) { $manifest.stats.categories[$cat] = @{ textures=0; models=0 } }
    $manifest.stats.categories[$cat].textures += $ptc
    $manifest.stats.categories[$cat].models += $pmc

    $color = if (($ptc + $pmc) -gt 0) { "Green" } else { "DarkGray" }
    Write-Host "  $($pack.Name) [$cat]: $ptc tex, $pmc mdl" -ForegroundColor $color
}

$manifest.stats.totalTextures = $totalTex; $manifest.stats.totalModels = $totalMdl

$mPath = Join-Path $OUT "remaining-manifest.json"
[System.IO.File]::WriteAllText($mPath, ($manifest | ConvertTo-Json -Depth 6), [System.Text.Encoding]::UTF8)

# Merge into main entities API
$apiPath = Join-Path $OUT "api\v1\remaining.json"
$apiData = @{ version="1.0.0"; generated=$manifest.generated; baseUrl="https://molochdagod.github.io/ObjectStore"; cdnUrl="https://assets.grudge-studio.com"; totalTextures=$totalTex; totalModels=$totalMdl; categories=$manifest.stats.categories; packs=$manifest.packs; assets=$manifest.assets | ForEach-Object { @{ filename=$_.filename; type=$_.type; category=$_.category; pack=$_.pack; tags=$_.tags; path=$_.path; size=$_.size } } }
[System.IO.File]::WriteAllText($apiPath, ($apiData | ConvertTo-Json -Depth 5), [System.Text.Encoding]::UTF8)

Write-Host "`n=== Complete ===" -ForegroundColor Cyan
Write-Host "Textures: $totalTex | Models: $totalMdl | Size: $([math]::Round($manifest.stats.totalBytes / 1MB, 1)) MB"
foreach ($c in $manifest.stats.categories.GetEnumerator()) { Write-Host "  $($c.Key): $($c.Value.textures) tex, $($c.Value.models) mdl" }

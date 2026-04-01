# ═══════════════════════════════════════════════════════════════
# export-unity-vfx.ps1 — Unity VFX → ObjectStore exporter
# Copies all VFX textures (PNG) from FRESH GRUDGE into
# ObjectStore/effects/3d/ with automatic categorization.
# Also generates manifest.json and api/v1/3dEffects.json.
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"

$UNITY_ASSETS = "D:\GRUDGE-NEW-GGG\FRESH GRUDGE\Assets"
$OUT_BASE     = "D:\ObjectStore\effects\3d"
$MANIFEST_OUT = "$OUT_BASE\manifest.json"
$API_OUT      = "D:\ObjectStore\api\v1\3dEffects.json"

# ── VFX source packs ──────────────────────────────────────────
$VFX_PACKS = @(
    @{ Name = "arpg-effects";      Path = "!FX";                                 Tags = @("combat","arpg","portals","loot","orbs") }
    @{ Name = "aoe-magic-spells";  Path = "NEW EFFECTS\AOE Magic spells Vol.1";  Tags = @("aoe","spell","magic","circle") }
    @{ Name = "magic-effects";     Path = "NEW EFFECTS\Magic effects pack";      Tags = @("magic","spell","cast") }
    @{ Name = "sword-slash";       Path = "NEW EFFECTS\Sword slash VFX";         Tags = @("slash","melee","sword","swing") }
    @{ Name = "wizard-spells";     Path = "NEW EFFECTS\Wizard spells pack";      Tags = @("wizard","spell","projectile","cast") }
    @{ Name = "magic-sword";       Path = "NEW EFFECTS\Magic sword";             Tags = @("enchant","weapon","glow") }
    @{ Name = "pbr-staff";         Path = "NEW EFFECTS\PBR Fantasy staff";       Tags = @("staff","weapon","mage") }
    @{ Name = "sine-vfx";          Path = "SineVFX";                             Tags = @("topdown","premium","energy") }
    @{ Name = "kriptofx";          Path = "KriptoFX";                            Tags = @("realistic","fire","explosion","smoke") }
    @{ Name = "vefects";           Path = "Vefects";                             Tags = @("pickup","sparkle","item") }
    @{ Name = "game-buffs";        Path = "Game Buffs";                          Tags = @("buff","debuff","aura","status") }
    @{ Name = "blink";             Path = "Blink";                               Tags = @("teleport","dash","warp","blink") }
    @{ Name = "lightning-skills";   Path = "Skills Particle VFX Pack_Lightning";  Tags = @("lightning","bolt","electric","shock") }
    @{ Name = "ktk-effects";       Path = "KTK_Effect_Samples";                  Tags = @("slash","impact","hit","particle") }
    @{ Name = "fire-ice";          Path = "FireIceNEW EFFECTS";                  Tags = @("fire","ice","elemental","dual") }
    @{ Name = "spells-pack";       Path = "Spells Pack";                         Tags = @("spell","cast","magic") }
    @{ Name = "shield-effects";    Path = "FXVShieldEffect";                     Tags = @("shield","barrier","defense","block") }
    @{ Name = "ky-effects";        Path = "KY_effects";                          Tags = @("energy","particle","misc") }
    @{ Name = "melee-trail";       Path = "MeleeWeaponTrail";                    Tags = @("trail","melee","slash","swing") }
    @{ Name = "particles";         Path = "Particles";                           Tags = @("particle","generic") }
    @{ Name = "elemental-free";    Path = "Elemental Free";                      Tags = @("elemental","nature","magic") }
    @{ Name = "elemental-totems";  Path = "Elemental Magic Totems";              Tags = @("totem","summon","elemental") }
    @{ Name = "pinwheel-fantasy";  Path = "PinwheelFantasyEffect";               Tags = @("fantasy","swirl","energy") }
    @{ Name = "pyro-particles";    Path = "PyroParticles";                       Tags = @("fire","explosion","pyro") }
    @{ Name = "new-effects-misc";  Path = "NEW EFFECTS\HSFiles";                 Tags = @("misc","effect") }
    @{ Name = "new-effects-res";   Path = "NEW EFFECTS\Resources";               Tags = @("resource","sprite","sheet") }
)

# ── Categories (auto-detect from filename) ────────────────────
$CATEGORY_RULES = @(
    @{ Category = "auras";        Patterns = @("aura","glow","radiance","halo","circle_ground","ground_effect","emanat") }
    @{ Category = "spells";       Patterns = @("spell","magic","cast","mana","arcane","mystic","enchant","rune","sigil") }
    @{ Category = "slashes";      Patterns = @("slash","swing","strike","swipe","cut","slice","melee_trail","weapon_trail","trail") }
    @{ Category = "projectiles";  Patterns = @("projectile","bullet","bolt","arrow","missile","fireball","orb_fly","shot") }
    @{ Category = "shields";      Patterns = @("shield","barrier","ward","protect","block","absorb","dome","bubble") }
    @{ Category = "buffs";        Patterns = @("buff","debuff","status","icon_","overlay","empower","weaken","curse","bless") }
    @{ Category = "impacts";      Patterns = @("impact","hit","explod","burst","shatter","crack","smash","crit","damage") }
    @{ Category = "portals";      Patterns = @("portal","warp","teleport","blink","gate","rift","vortex") }
    @{ Category = "lightning";    Patterns = @("lightning","thunder","electric","shock","spark","zap","bolt_l","chain_l") }
    @{ Category = "fire";         Patterns = @("fire","flame","burn","inferno","ember","lava","blaze","scorch","heat","pyro") }
    @{ Category = "ice";          Patterns = @("ice","frost","freeze","snow","cold","crystal","blizzard","shard") }
    @{ Category = "environment";  Patterns = @("fog","smoke","dust","wind","rain","cloud","ambient","weather","mist","steam") }
)

function Get-Category($filename) {
    $lower = $filename.ToLower()
    foreach ($rule in $CATEGORY_RULES) {
        foreach ($pat in $rule.Patterns) {
            if ($lower -match $pat) { return $rule.Category }
        }
    }
    return "misc"
}

# ── Create output directories ─────────────────────────────────
$CATEGORIES = @("auras","spells","slashes","projectiles","shields","buffs","impacts","portals","lightning","fire","ice","environment","misc")
foreach ($cat in $CATEGORIES) {
    $dir = Join-Path $OUT_BASE $cat
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
}

Write-Host "═══ Unity VFX → ObjectStore Export ═══" -ForegroundColor Cyan
Write-Host "Source: $UNITY_ASSETS"
Write-Host "Target: $OUT_BASE"
Write-Host ""

# ── Process each pack ─────────────────────────────────────────
$manifest = @{
    version   = "1.0.0"
    generated = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    source    = "FRESH GRUDGE Unity Project"
    packs     = @()
    textures  = @()
    stats     = @{ totalTextures = 0; totalBytes = 0; categories = @{} }
}

$totalCopied = 0

foreach ($pack in $VFX_PACKS) {
    $srcDir = Join-Path $UNITY_ASSETS $pack.Path
    if (-not (Test-Path -LiteralPath $srcDir)) {
        Write-Host "  SKIP: $($pack.Name) - path not found" -ForegroundColor DarkGray
        continue
    }

    $pngFiles = @(Get-ChildItem -LiteralPath $srcDir -Recurse -Filter *.png -ErrorAction SilentlyContinue)
    $tgaFiles = @(Get-ChildItem -LiteralPath $srcDir -Recurse -Filter *.tga -ErrorAction SilentlyContinue)
    $fbxFiles = @(Get-ChildItem -LiteralPath $srcDir -Recurse -Filter *.fbx -ErrorAction SilentlyContinue)

    $packTexCount = 0
    $packEntries = @()

    # Copy PNGs
    foreach ($file in $pngFiles) {
        $category = Get-Category $file.Name
        # Prefix with pack name to avoid collisions
        $destName = "$($pack.Name)_$($file.Name)"
        $destPath = Join-Path (Join-Path $OUT_BASE $category) $destName

        if (-not (Test-Path $destPath)) {
            Copy-Item -Path $file.FullName -Destination $destPath -Force
        }

        $packEntries += @{
            filename = $destName
            original = $file.Name
            category = $category
            pack     = $pack.Name
            size     = $file.Length
            tags     = $pack.Tags
            path     = "effects/3d/$category/$destName"
        }

        # Update stats
        if (-not $manifest.stats.categories[$category]) { $manifest.stats.categories[$category] = 0 }
        $manifest.stats.categories[$category]++
        $manifest.stats.totalBytes += $file.Length
        $packTexCount++
        $totalCopied++
    }

    # Copy TGA as-is (web conversion can happen later or via pipeline)
    foreach ($file in $tgaFiles) {
        $category = Get-Category $file.Name
        $destName = "$($pack.Name)_$($file.BaseName).tga"
        $destPath = Join-Path (Join-Path $OUT_BASE $category) $destName

        if (-not (Test-Path $destPath)) {
            Copy-Item -Path $file.FullName -Destination $destPath -Force
        }

        $packEntries += @{
            filename = $destName
            original = $file.Name
            category = $category
            pack     = $pack.Name
            size     = $file.Length
            tags     = $pack.Tags
            path     = "effects/3d/$category/$destName"
            needsConversion = $true
        }

        $manifest.stats.categories[$category]++
        $manifest.stats.totalBytes += $file.Length
        $packTexCount++
        $totalCopied++
    }

    $manifest.textures += $packEntries
    $manifest.packs += @{
        name     = $pack.Name
        source   = $pack.Path
        textures = $packTexCount
        meshes   = @($fbxFiles).Count
        tags     = $pack.Tags
    }

    $color = if ($packTexCount -gt 0) { "Green" } else { "DarkGray" }
    Write-Host "  $($pack.Name): $packTexCount textures, $(@($fbxFiles).Count) meshes" -ForegroundColor $color
}

$manifest.stats.totalTextures = $totalCopied

# ── Write manifest ────────────────────────────────────────────
$manifestJson = $manifest | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText($MANIFEST_OUT, $manifestJson, [System.Text.Encoding]::UTF8)
Write-Host ""
Write-Host "Manifest: $MANIFEST_OUT" -ForegroundColor Yellow

# ── Write API JSON ────────────────────────────────────────────
$apiDir = Split-Path $API_OUT -Parent
if (-not (Test-Path $apiDir)) { New-Item -ItemType Directory -Path $apiDir -Force | Out-Null }

$apiData = @{
    version      = "1.0.0"
    generated    = $manifest.generated
    baseUrl      = "https://molochdagod.github.io/ObjectStore/effects/3d"
    cdnUrl       = "https://assets.grudge-studio.com/effects/3d"
    totalTextures = $totalCopied
    categories   = $manifest.stats.categories
    packs        = $manifest.packs
    textures     = $manifest.textures | ForEach-Object {
        @{
            filename = $_.filename
            category = $_.category
            pack     = $_.pack
            tags     = $_.tags
            path     = $_.path
            size     = $_.size
        }
    }
}

$apiJson = $apiData | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText($API_OUT, $apiJson, [System.Text.Encoding]::UTF8)
Write-Host "API JSON: $API_OUT" -ForegroundColor Yellow

# ── Summary ───────────────────────────────────────────────────
Write-Host ""
Write-Host "═══ Export Complete ═══" -ForegroundColor Cyan
Write-Host "Total textures exported: $totalCopied"
Write-Host "Total size: $([math]::Round($manifest.stats.totalBytes / 1MB, 1)) MB"
Write-Host "Categories:"
foreach ($cat in ($manifest.stats.categories.GetEnumerator() | Sort-Object Value -Descending)) {
    Write-Host "  $($cat.Key): $($cat.Value)"
}

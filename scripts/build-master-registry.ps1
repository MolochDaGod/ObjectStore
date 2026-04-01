# ═══════════════════════════════════════════════════════════════
# build-master-registry.ps1 — Master Asset Registry
#
# Merges all export manifests, assigns UUIDs, generates:
#   1. api/v1/master-registry.json — full UUID-indexed catalog
#   2. api/v1/asset-categories.json — category summary for browsers
#   3. r2-upload-manifest.json — R2-ready upload queue with keys
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"
$OUT = "D:\ObjectStore"

# ── Load all manifests ────────────────────────────────────────
$manifests = @()
foreach ($f in @("effects\3d\manifest.json", "entities-manifest.json", "remaining-manifest.json")) {
    $path = Join-Path $OUT $f
    if (Test-Path -LiteralPath $path) {
        $data = Get-Content -LiteralPath $path -Raw | ConvertFrom-Json
        $manifests += $data
        Write-Host "Loaded: $f ($($data.stats.totalTextures) items)" -ForegroundColor Green
    }
}

# ── Build master registry with UUIDs ──────────────────────────
$registry = @{
    version    = "2.0.0"
    generated  = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    source     = "FRESH GRUDGE Unity Project - Grudge Studio"
    baseUrl    = "https://molochdagod.github.io/ObjectStore"
    cdnUrl     = "https://assets.grudge-studio.com"
    r2Bucket   = "grudge-assets"
    assets     = @()
    categories = @{}
    packs      = @()
    stats      = @{
        totalAssets    = 0
        totalTextures  = 0
        totalModels    = 0
        totalSizeBytes = 0
        categoryCount  = 0
        packCount      = 0
    }
}

$seenPacks = @{}
$catStats = @{}

foreach ($manifest in $manifests) {
    # Merge packs
    if ($manifest.packs) {
        foreach ($p in $manifest.packs) {
            $key = $p.name
            if (-not $seenPacks[$key]) {
                $seenPacks[$key] = $true
                $registry.packs += @{
                    name     = $p.name
                    category = if ($p.category) { $p.category } else { "effects" }
                    textures = if ($p.textures) { $p.textures } else { 0 }
                    models   = if ($p.models) { $p.models } else { 0 }
                    tags     = if ($p.tags) { $p.tags } else { @() }
                }
            }
        }
    }

    # Merge assets (from 'textures' array in VFX manifest, 'assets' in entity manifests)
    $items = @()
    if ($manifest.textures) { $items += $manifest.textures }
    if ($manifest.assets) { $items += $manifest.assets }

    foreach ($item in $items) {
        $uuid = [guid]::NewGuid().ToString()
        $type = if ($item.type) { $item.type } else { "texture" }
        $cat  = if ($item.category) { $item.category } else { "misc" }
        $size = if ($item.size) { [long]$item.size } else { 0 }
        $path = if ($item.path) { $item.path } else { "$cat/$($item.filename)" }

        # R2 key: use structured path for CDN delivery
        $r2Key = "game-assets/$path"

        $entry = @{
            id       = $uuid
            filename = $item.filename
            original = if ($item.original) { $item.original } else { $item.filename }
            type     = $type
            category = $cat
            pack     = if ($item.pack) { $item.pack } else { "unknown" }
            tags     = if ($item.tags) { $item.tags } else { @() }
            size     = $size
            path     = $path
            r2Key    = $r2Key
            cdnUrl   = "https://assets.grudge-studio.com/$r2Key"
            ghUrl    = "https://molochdagod.github.io/ObjectStore/$path"
        }

        $registry.assets += $entry

        # Category stats
        if (-not $catStats[$cat]) { $catStats[$cat] = @{ textures=0; models=0; totalSize=0; count=0 } }
        $catStats[$cat].count++
        if ($type -eq "texture") { $catStats[$cat].textures++ } else { $catStats[$cat].models++ }
        $catStats[$cat].totalSize += $size

        $registry.stats.totalSizeBytes += $size
        if ($type -eq "texture") { $registry.stats.totalTextures++ } else { $registry.stats.totalModels++ }
    }
}

$registry.stats.totalAssets = $registry.assets.Count
$registry.stats.packCount = $registry.packs.Count
$registry.categories = $catStats
$registry.stats.categoryCount = $catStats.Count

# ── Write master registry ─────────────────────────────────────
$apiDir = Join-Path $OUT "api\v1"
if (-not (Test-Path -LiteralPath $apiDir)) { New-Item -ItemType Directory -Path $apiDir -Force | Out-Null }

$registryPath = Join-Path $apiDir "master-registry.json"
$registryJson = $registry | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText($registryPath, $registryJson, [System.Text.Encoding]::UTF8)
Write-Host "`nMaster Registry: $registryPath" -ForegroundColor Yellow

# ── Write category summary (lightweight for browsers) ─────────
$catSummary = @{
    version    = "2.0.0"
    generated  = $registry.generated
    categories = @{}
    totalAssets = $registry.stats.totalAssets
}
foreach ($c in $catStats.GetEnumerator()) {
    $catSummary.categories[$c.Key] = @{
        textures  = $c.Value.textures
        models    = $c.Value.models
        count     = $c.Value.count
        sizeMB    = [math]::Round($c.Value.totalSize / 1MB, 1)
    }
}
$catPath = Join-Path $apiDir "asset-categories.json"
[System.IO.File]::WriteAllText($catPath, ($catSummary | ConvertTo-Json -Depth 4), [System.Text.Encoding]::UTF8)
Write-Host "Categories:  $catPath" -ForegroundColor Yellow

# ── Write R2 upload manifest ──────────────────────────────────
# This is what the upload script uses to push to Cloudflare R2
$r2Manifest = @{
    version     = "1.0.0"
    generated   = $registry.generated
    bucket      = "grudge-assets"
    totalFiles  = $registry.stats.totalAssets
    totalSizeMB = [math]::Round($registry.stats.totalSizeBytes / 1MB, 1)
    files       = $registry.assets | ForEach-Object {
        @{
            id       = $_.id
            localPath = $_.path
            r2Key    = $_.r2Key
            mime     = if ($_.filename -match '\.png$') { "image/png" }
                       elseif ($_.filename -match '\.tga$') { "image/x-tga" }
                       elseif ($_.filename -match '\.fbx$') { "model/fbx" }
                       elseif ($_.filename -match '\.glb$') { "model/gltf-binary" }
                       else { "application/octet-stream" }
            size     = $_.size
            category = $_.category
            tags     = $_.tags
        }
    }
}
$r2Path = Join-Path $OUT "r2-upload-manifest.json"
[System.IO.File]::WriteAllText($r2Path, ($r2Manifest | ConvertTo-Json -Depth 5), [System.Text.Encoding]::UTF8)
Write-Host "R2 Manifest: $r2Path" -ForegroundColor Yellow

# ── Summary ───────────────────────────────────────────────────
Write-Host "`n=== Master Registry Built ===" -ForegroundColor Cyan
Write-Host "Total Assets:   $($registry.stats.totalAssets)"
Write-Host "  Textures:     $($registry.stats.totalTextures)"
Write-Host "  Models:       $($registry.stats.totalModels)"
Write-Host "  Size:         $([math]::Round($registry.stats.totalSizeBytes / 1MB, 1)) MB"
Write-Host "  Packs:        $($registry.stats.packCount)"
Write-Host "  Categories:   $($registry.stats.categoryCount)"
Write-Host ""
Write-Host "Categories:"
foreach ($c in ($catStats.GetEnumerator() | Sort-Object { $_.Value.count } -Descending)) {
    Write-Host "  $($c.Key): $($c.Value.count) assets ($($c.Value.textures) tex, $($c.Value.models) mdl) - $([math]::Round($c.Value.totalSize / 1MB, 1)) MB"
}

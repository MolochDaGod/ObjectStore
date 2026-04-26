# Import Craftpix batch B (2026-04) — skills, items, UI.
# Idempotent. Strips PSDs. Preserves background (_framed) and no-background (_noBg) variants.
#
# Usage:  pwsh ./scripts/import-craftpix-batch-2026-04b.ps1

param(
    [string]$Root   = "C:\Users\nugye\Documents\1111111\ObjectStore",
    [string]$ZipDir = "C:\Users\nugye\Documents"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Ensure-Dir($p) { if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p -Force | Out-Null } }

function Extract-CraftpixPack {
    param(
        [string]$ZipPath,
        [string]$OutDir,
        [string]$Prefix,     # e.g. "paladin" -> paladin_01.png, paladin_01_framed.png
        [string]$Mode = 'skills'   # 'skills' (flat PNG/), 'items' (PNG/background + PNG/without background), 'named' (keep original names)
    )
    if (-not (Test-Path $ZipPath)) { Write-Warning "Missing: $ZipPath"; return 0 }
    Ensure-Dir $OutDir
    Write-Host "  -> $(Split-Path -Leaf $ZipPath)" -ForegroundColor Cyan
    $z = [System.IO.Compression.ZipFile]::OpenRead($ZipPath)
    $written = 0
    try {
        $entries = @($z.Entries | Where-Object {
            $_.FullName -notmatch '__MACOSX' -and
            $_.FullName -notmatch '\.DS_Store$' -and
            $_.FullName -notmatch '\.psd$' -and        # strip PSD sources
            -not $_.FullName.EndsWith('/')
        })

        if ($Mode -eq 'named') {
            foreach ($e in $entries) {
                if ($e.FullName -notmatch '\.png$') { continue }
                $leaf = [IO.Path]::GetFileName($e.FullName).ToLowerInvariant() -replace ' ', '-'
                $dst = Join-Path $OutDir $leaf
                if (Test-Path $dst) { continue }
                $s = $e.Open(); try { $fs = [IO.File]::Open($dst, 'Create', 'Write'); try { $s.CopyTo($fs) } finally { $fs.Dispose() } } finally { $s.Dispose() }
                $written++
            }
            return $written
        }

        # Partition entries into "bg" (PNG/background) vs "noBg" (PNG/without background OR flat PNG/)
        # Note: we must exclude 'without background' / 'no background' from the bg set.
        $noBg = @($entries | Where-Object { $_.FullName -match '(?i)/(without[_\- ]?background|no[_\- ]?background)/' })
        $bg   = @($entries | Where-Object { $_.FullName -match '(?i)/background/' -and $_.FullName -notmatch '(?i)/(without[_\- ]?background|no[_\- ]?background)/' })
        $flat = @($entries | Where-Object {
            $_.FullName -match '\.png$' -and
            $_.FullName -notmatch '(?i)background'
        })

        # Prefer no-background as primary; framed (background) as secondary.
        # If only flat, treat flat as primary (no-background).
        $primary = if ($noBg.Count) { $noBg } else { $flat }
        $framed  = $bg

        function SortByNum($list) {
            return $list | Sort-Object {
                $n = [IO.Path]::GetFileNameWithoutExtension($_.FullName)
                if ($n -match '(\d+)\s*$') { [int]$Matches[1] } else { 99999 }
            }
        }

        $i = 0
        foreach ($e in (SortByNum $primary)) {
            $i++
            $dst = Join-Path $OutDir ("{0}_{1:00}.png" -f $Prefix, $i)
            if (-not (Test-Path $dst)) {
                $s = $e.Open(); try { $fs = [IO.File]::Open($dst, 'Create', 'Write'); try { $s.CopyTo($fs) } finally { $fs.Dispose() } } finally { $s.Dispose() }
                $written++
            }
        }
        $i = 0
        foreach ($e in (SortByNum $framed)) {
            $i++
            $dst = Join-Path $OutDir ("{0}_{1:00}_framed.png" -f $Prefix, $i)
            if (-not (Test-Path $dst)) {
                $s = $e.Open(); try { $fs = [IO.File]::Open($dst, 'Create', 'Write'); try { $s.CopyTo($fs) } finally { $fs.Dispose() } } finally { $s.Dispose() }
                $written++
            }
        }
    } finally { $z.Dispose() }
    return $written
}

# ─────────── Class skill packs (10) ───────────
$classPacks = @(
    @{ file = 'craftpix-net-291633-50-rpg-paladin-skill-icons.zip';     slug = 'paladin' },
    @{ file = 'craftpix-net-416397-rpg-thief-skill-icons.zip';          slug = 'thief' },
    @{ file = 'craftpix-net-443659-druid-skill-game-icons.zip';         slug = 'druid' },
    @{ file = 'craftpix-net-893941-rpg-crossbowman-skill-icons.zip';    slug = 'crossbowman' },
    @{ file = 'craftpix-net-792075-rpg-tannery-skill-icons.zip';        slug = 'tannery' },
    @{ file = 'craftpix-net-316029-rpg-blacksmith-skill-icons.zip';     slug = 'blacksmith-skill' },
    @{ file = 'craftpix-net-336197-rpg-swordsman-skill-icons.zip';      slug = 'swordsman' },
    @{ file = 'craftpix-net-194977-50-rpg-archer-skill-icons.zip';      slug = 'archer' },
    @{ file = 'craftpix-net-920178-50-rpg-farmer-skill-icons.zip';      slug = 'farmer' },
    @{ file = 'craftpix-net-477647-50-rpg-pirate-icons.zip';            slug = 'pirate' }
)
Write-Host "`n== Class skill packs ==" -ForegroundColor Yellow
foreach ($p in $classPacks) {
    $zip = Join-Path $ZipDir $p.file
    $out = Join-Path $Root "icons/skills/class/$($p.slug)"
    $n = Extract-CraftpixPack -ZipPath $zip -OutDir $out -Prefix $p.slug -Mode 'skills'
    Write-Host "     -> $n file(s)"
}

# ─────────── Item / resource packs (12) ───────────
$itemPacks = @(
    @{ file = 'craftpix-net-606038-100-rpg-game-icons.zip';                      slug = 'rpg-general';      dir = 'rpg-general' },
    @{ file = 'craftpix-net-871594-50-rpg-staff-icons.zip';                      slug = 'staves';           dir = 'staves' },
    @{ file = 'craftpix-net-266337-50-rpg-scroll-icons.zip';                     slug = 'scrolls';          dir = 'scrolls' },
    @{ file = 'craftpix-net-249534-magical-artifact-rpg-game-icons.zip';         slug = 'artifacts';        dir = 'artifacts' },
    @{ file = 'craftpix-net-789213-rpg-potion-icons.zip';                        slug = 'potions';          dir = 'potions' },
    @{ file = 'craftpix-net-668473-rpg-gems-icons-pack.zip';                     slug = 'gems';             dir = 'gems' },
    @{ file = 'craftpix-net-871774-fishing-rpg-icons.zip';                       slug = 'fishing';          dir = 'fishing' },
    @{ file = 'craftpix-net-719464-50-alchemical-herbs-icons.zip';               slug = 'herbs';            dir = 'herbs' },
    @{ file = 'craftpix-net-176699-50-free-alchemical-ingredient-icons.zip';     slug = 'alchemy';          dir = 'alchemy' },
    @{ file = 'craftpix-net-392725-rpg-farming-icons-set.zip';                   slug = 'farming';          dir = 'farming' },
    @{ file = 'craftpix-net-804368-rpg-blacksmith-game-icons.zip';               slug = 'blacksmith-items'; dir = 'blacksmith-items' },
    @{ file = 'craftpix-net-297799-rpg-craft-resources-game-icons-pack.zip';     slug = 'craft-resources';  dir = 'craft-resources' }
)
Write-Host "`n== Item / resource packs ==" -ForegroundColor Yellow
foreach ($p in $itemPacks) {
    $zip = Join-Path $ZipDir $p.file
    $out = Join-Path $Root "icons/items/$($p.dir)"
    $n = Extract-CraftpixPack -ZipPath $zip -OutDir $out -Prefix $p.slug -Mode 'items'
    Write-Host "     -> $n file(s)"
}

# ─────────── UI buttons (1) ───────────
Write-Host "`n== UI buttons ==" -ForegroundColor Yellow
$zip = Join-Path $ZipDir 'craftpix-net-454303-game-button-icons.zip'
$out = Join-Path $Root 'icons/ui/buttons/craftpix-games'
$n = Extract-CraftpixPack -ZipPath $zip -OutDir $out -Prefix 'btn' -Mode 'named'
Write-Host "     -> $n file(s)"

Write-Host "`nDone." -ForegroundColor Green

# Import 2026-04 asset pack batch into the ObjectStore repo.
# Idempotent. Safe to re-run. Strips __MACOSX / .DS_Store. Lowercases filenames.
#
# Usage:  pwsh ./scripts/import-asset-packs-2026-04.ps1
#
# Layout written:
#   icons/skills/class/<slug>/<slug>_NN.png   (8 class packs)
#   ui/packs/<slug>/...                        (4 UI kits)
#   models/environments/aquatic-ruins/...      (extracted, tracked via manifest)
#   docs/imports/2026-04-manifest.json         (what was imported, sizes)

param(
    [string]$Root    = "C:\Users\nugye\Documents\1111111\ObjectStore",
    [string]$ZipDir  = "C:\Users\nugye\Documents"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Ensure-Dir($p) {
    if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p -Force | Out-Null }
}

function Clean-Name([string]$n) {
    # Strip leading folder components, lowercase, replace spaces with dashes.
    $n = $n -replace '\\', '/'
    $n = $n.ToLowerInvariant()
    $n = $n -replace ' ', '-'
    return $n
}

function Should-Skip([string]$full) {
    if ($full -match '__MACOSX') { return $true }
    if ($full -match '(^|/)\.ds_store$') { return $true }
    if ($full.EndsWith('/')) { return $true } # directory entry
    return $false
}

function Extract-Pack {
    param(
        [string]$ZipPath,
        [string]$OutDir,
        [string]$Prefix = $null,   # if set, rename files to <prefix>_NN.png
        [switch]$Flatten,
        [switch]$KeepStructure
    )
    if (-not (Test-Path $ZipPath)) {
        Write-Warning "Missing: $ZipPath"
        return @()
    }
    Ensure-Dir $OutDir
    Write-Host "  -> $ZipPath" -ForegroundColor Cyan
    $z = [System.IO.Compression.ZipFile]::OpenRead($ZipPath)
    $manifest = @()
    try {
        $entries = @($z.Entries | Where-Object { -not (Should-Skip $_.FullName) })
        # When prefix rename mode, collect PNGs in natural numeric order
        if ($Prefix) {
            $pngs = @($entries | Where-Object { $_.FullName -match '\.png$' })
            # Sort by trailing integer in the filename when possible
            $pngs = $pngs | Sort-Object {
                $n = [IO.Path]::GetFileNameWithoutExtension($_.FullName)
                if ($n -match '(\d+)\s*$') { [int]$Matches[1] } else { 99999 }
            }
            $i = 0
            foreach ($e in $pngs) {
                $i++
                $dst = Join-Path $OutDir ("{0}_{1:00}.png" -f $Prefix, $i)
                if (-not (Test-Path $dst)) {
                    $s = $e.Open()
                    try {
                        $fs = [IO.File]::Open($dst, 'Create', 'Write')
                        try { $s.CopyTo($fs) } finally { $fs.Dispose() }
                    } finally { $s.Dispose() }
                }
                $manifest += [pscustomobject]@{ src = $e.FullName; dst = (Resolve-Path $dst).Path.Substring($Root.Length+1).Replace('\','/'); size = $e.Length }
            }
            return $manifest
        }
        foreach ($e in $entries) {
            $rel = $e.FullName
            if ($Flatten) {
                $leaf = [IO.Path]::GetFileName($rel)
                if ([string]::IsNullOrWhiteSpace($leaf)) { continue }
                $dst = Join-Path $OutDir (Clean-Name $leaf)
            } else {
                # Drop the top folder to avoid nested "FireMage_Free/FireMage_Free" style paths
                $parts = $rel.Split('/')
                if ($parts.Length -gt 1) { $parts = $parts[1..($parts.Length-1)] }
                $relOut = ($parts -join '/')
                if ([string]::IsNullOrWhiteSpace($relOut)) { continue }
                $dst = Join-Path $OutDir (Clean-Name $relOut)
            }
            Ensure-Dir ([IO.Path]::GetDirectoryName($dst))
            if (-not (Test-Path $dst)) {
                $s = $e.Open()
                try {
                    $fs = [IO.File]::Open($dst, 'Create', 'Write')
                    try { $s.CopyTo($fs) } finally { $fs.Dispose() }
                } finally { $s.Dispose() }
            }
            $manifest += [pscustomobject]@{ src = $e.FullName; dst = (Resolve-Path $dst).Path.Substring($Root.Length+1).Replace('\','/'); size = $e.Length }
        }
    } finally {
        $z.Dispose()
    }
    return $manifest
}

$results = @{}

# ---- Class skill icon packs ----
$classPacks = @(
    @{ zip = 'Necromancer_Free.zip'; slug = 'necromancer' },
    @{ zip = 'FireMage_Free.zip';    slug = 'firemage'    },
    @{ zip = 'BloodMage_Free.zip';   slug = 'bloodmage'   },
    @{ zip = 'EarthMage_Free.zip';   slug = 'earthmage'   },
    @{ zip = 'FrostMage_Free.zip';   slug = 'frostmage'   },
    @{ zip = 'Hunter_Free.zip';      slug = 'hunter'      },
    @{ zip = 'Barbarian_Free.zip';   slug = 'barbarian'   },
    @{ zip = 'Engineer_Free.zip';    slug = 'engineer'    }
)
Write-Host "`n== Class skill icon packs ==" -ForegroundColor Yellow
foreach ($p in $classPacks) {
    $zip = Join-Path $ZipDir $p.zip
    $out = Join-Path $Root  "icons/skills/class/$($p.slug)"
    $m = Extract-Pack -ZipPath $zip -OutDir $out -Prefix $p.slug
    $results["class_$($p.slug)"] = $m
}

# ---- UI kits ----
$uiPacks = @(
    @{ zip = 'SciFi_FPS_UI.zip';                    slug = 'scifi-fps'        },
    @{ zip = 'WenrexaAssetsUI_SciFI.zip';           slug = 'wenrexa-scifi'    },
    @{ zip = '1. Free Hologram Interface Wenrexa.zip'; slug = 'wenrexa-hologram' },
    @{ zip = 'Wenrexa Interface UI KIT #4.zip';     slug = 'wenrexa-kit4'     }
)
Write-Host "`n== UI kits ==" -ForegroundColor Yellow
foreach ($p in $uiPacks) {
    $zip = Join-Path $ZipDir $p.zip
    $out = Join-Path $Root "ui/packs/$($p.slug)"
    $m = Extract-Pack -ZipPath $zip -OutDir $out -KeepStructure
    $results["ui_$($p.slug)"] = $m
}

# ---- Aquatic Ruins 3D environment ----
Write-Host "`n== 3D environment: aquatic-ruins ==" -ForegroundColor Yellow
$zip = Join-Path $ZipDir 'Batch_Aquatic_Ruins.zip'
$out = Join-Path $Root 'models/environments/aquatic-ruins'
$m = Extract-Pack -ZipPath $zip -OutDir $out -KeepStructure
$results['env_aquatic-ruins'] = $m

# ---- Write overall manifest ----
Ensure-Dir (Join-Path $Root 'docs/imports')
$manifestOut = Join-Path $Root 'docs/imports/2026-04-manifest.json'
$summary = @{
    importedAt = (Get-Date).ToString('o')
    batch = '2026-04-character-skill-packs'
    packs = @{}
}
foreach ($k in $results.Keys) {
    $list = $results[$k]
    $summary.packs[$k] = @{
        count = $list.Count
        totalBytes = ($list | Measure-Object size -Sum).Sum
        files = ($list | ForEach-Object { $_.dst })
    }
}
$summary | ConvertTo-Json -Depth 6 | Out-File -FilePath $manifestOut -Encoding utf8
Write-Host "`nWrote manifest: $manifestOut" -ForegroundColor Green
Write-Host "Done." -ForegroundColor Green

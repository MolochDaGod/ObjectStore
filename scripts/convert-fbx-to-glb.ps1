# ═══════════════════════════════════════════════════════════════
# convert-fbx-to-glb.ps1 — FBX → GLB batch converter
#
# Downloads FBX2glTF (Facebook's converter) if not present,
# then converts all FBX models in ObjectStore to GLB format
# for BabylonJS/web game use.
#
# Usage:
#   .\convert-fbx-to-glb.ps1                     # convert all
#   .\convert-fbx-to-glb.ps1 -Category monsters  # one category
#   .\convert-fbx-to-glb.ps1 -DryRun             # preview
# ═══════════════════════════════════════════════════════════════

param(
    [switch]$DryRun,
    [string]$Category = ""
)

$ErrorActionPreference = "Continue"
$OUT = "D:\ObjectStore"
$TOOL_DIR = Join-Path $OUT "tools"
$FBX2GLTF = Join-Path $TOOL_DIR "FBX2glTF-windows-x64.exe"
$FBX2GLTF_URL = "https://github.com/facebookincubator/FBX2glTF/releases/download/v0.13.1/FBX2glTF-windows-x64.exe"

# ── Download FBX2glTF if not present ──────────────────────────
if (-not (Test-Path -LiteralPath $FBX2GLTF)) {
    Write-Host "Downloading FBX2glTF..." -ForegroundColor Cyan
    if (-not (Test-Path -LiteralPath $TOOL_DIR)) { New-Item -ItemType Directory -Path $TOOL_DIR -Force | Out-Null }
    try {
        Invoke-WebRequest -Uri $FBX2GLTF_URL -OutFile $FBX2GLTF -UseBasicParsing
        Write-Host "Downloaded: $FBX2GLTF" -ForegroundColor Green
    } catch {
        Write-Host "Failed to download FBX2glTF: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Download manually from: $FBX2GLTF_URL" -ForegroundColor Yellow
        Write-Host "Place at: $FBX2GLTF" -ForegroundColor Yellow
        exit 1
    }
}

# ── Find all FBX model directories ────────────────────────────
$modelDirs = @(
    "monsters\models", "npcs\models", "characters\models",
    "environment\models", "mounts\models", "ships\models",
    "weapons\models", "effects\models"
)

$total = 0; $converted = 0; $skipped = 0; $failed = 0
$startTime = Get-Date

Write-Host "=== FBX to GLB Batch Converter ===" -ForegroundColor Cyan
if ($DryRun) { Write-Host "DRY RUN" -ForegroundColor Yellow }

foreach ($dir in $modelDirs) {
    if ($Category -and -not $dir.StartsWith($Category)) { continue }
    $fullDir = Join-Path $OUT $dir
    if (-not (Test-Path -LiteralPath $fullDir)) { continue }

    $fbxFiles = @(Get-ChildItem -LiteralPath $fullDir -Filter *.fbx -EA 0)
    if ($fbxFiles.Count -eq 0) { continue }

    Write-Host "`n  $dir ($($fbxFiles.Count) FBX files)" -ForegroundColor Cyan

    foreach ($file in $fbxFiles) {
        $total++
        $glbPath = Join-Path $fullDir "$($file.BaseName).glb"

        # Skip if GLB already exists
        if (Test-Path -LiteralPath $glbPath) {
            $skipped++
            continue
        }

        if ($DryRun) {
            Write-Host "    DRY: $($file.Name) -> $($file.BaseName).glb" -ForegroundColor Yellow
            $skipped++
            continue
        }

        # Convert
        try {
            $result = & $FBX2GLTF -i "$($file.FullName)" -o "$($file.DirectoryName)\$($file.BaseName)" --binary 2>&1
            if (Test-Path -LiteralPath $glbPath) {
                $converted++
                Write-Host "    OK: $($file.BaseName).glb" -ForegroundColor Green
            } else {
                # FBX2glTF sometimes outputs to .glb in current dir
                $altPath = "$($file.DirectoryName)\$($file.BaseName).glb"
                if (Test-Path -LiteralPath $altPath) {
                    $converted++
                    Write-Host "    OK: $($file.BaseName).glb" -ForegroundColor Green
                } else {
                    $failed++
                    Write-Host "    FAIL: $($file.Name) (no output)" -ForegroundColor Red
                }
            }
        } catch {
            $failed++
            Write-Host "    ERR: $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

$elapsed = (Get-Date) - $startTime

Write-Host "`n=== Conversion Complete ===" -ForegroundColor Cyan
Write-Host "Total:     $total"
Write-Host "Converted: $converted"
Write-Host "Skipped:   $skipped (already exist)"
Write-Host "Failed:    $failed"
Write-Host "Time:      $([math]::Round($elapsed.TotalMinutes, 1)) min"

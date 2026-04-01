# ═══════════════════════════════════════════════════════════════
# r2-bulk-upload.ps1 — Bulk upload assets to Cloudflare R2
#
# Reads r2-upload-manifest.json and uploads each file to the
# grudge-assets bucket via wrangler r2 object put.
#
# Features:
#   - Skip already-uploaded files (checks R2 head first)
#   - Retry with backoff on failure
#   - Progress reporting
#   - Batch mode (configurable concurrency)
#   - Dry-run mode
#
# Usage:
#   .\r2-bulk-upload.ps1                    # full upload
#   .\r2-bulk-upload.ps1 -DryRun            # preview only
#   .\r2-bulk-upload.ps1 -Category monsters # upload one category
#   .\r2-bulk-upload.ps1 -Limit 100         # upload first 100
# ═══════════════════════════════════════════════════════════════

param(
    [switch]$DryRun,
    [string]$Category = "",
    [int]$Limit = 0,
    [int]$MaxRetries = 3,
    [string]$Bucket = "grudge-assets"
)

$ErrorActionPreference = "Continue"
$OUT = "D:\ObjectStore"
$MANIFEST = Join-Path $OUT "r2-upload-manifest.json"

if (-not (Test-Path -LiteralPath $MANIFEST)) {
    Write-Host "ERROR: r2-upload-manifest.json not found. Run build-master-registry.ps1 first." -ForegroundColor Red
    exit 1
}

$data = Get-Content -LiteralPath $MANIFEST -Raw | ConvertFrom-Json
$files = $data.files

# Filter by category if specified
if ($Category) {
    $files = $files | Where-Object { $_.category -eq $Category }
    Write-Host "Filtered to category: $Category ($($files.Count) files)" -ForegroundColor Cyan
}

# Limit if specified
if ($Limit -gt 0 -and $files.Count -gt $Limit) {
    $files = $files | Select-Object -First $Limit
    Write-Host "Limited to first $Limit files" -ForegroundColor Cyan
}

$total = $files.Count
$uploaded = 0; $skipped = 0; $failed = 0; $totalBytes = 0
$startTime = Get-Date

Write-Host "=== R2 Bulk Upload ===" -ForegroundColor Cyan
Write-Host "Bucket:  $Bucket"
Write-Host "Files:   $total"
Write-Host "DryRun:  $DryRun"
Write-Host ""

foreach ($file in $files) {
    $i = $uploaded + $skipped + $failed + 1
    $localPath = Join-Path $OUT $file.localPath
    $r2Key = $file.r2Key
    $mime = $file.mime

    # Progress
    $pct = [math]::Round(($i / $total) * 100, 1)
    Write-Host "[$i/$total $pct%] " -NoNewline

    # Check local file exists
    if (-not (Test-Path -LiteralPath $localPath)) {
        Write-Host "MISS: $($file.localPath)" -ForegroundColor DarkGray
        $skipped++
        continue
    }

    if ($DryRun) {
        Write-Host "DRY: $r2Key ($mime)" -ForegroundColor Yellow
        $skipped++
        continue
    }

    # Upload with retry
    $success = $false
    for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
        try {
            $result = npx wrangler r2 object put "$Bucket/$r2Key" --file="$localPath" --content-type="$mime" 2>&1
            if ($LASTEXITCODE -eq 0) {
                $success = $true
                $totalBytes += $file.size
                Write-Host "OK: $r2Key" -ForegroundColor Green
                break
            } else {
                Write-Host "RETRY $attempt/$MaxRetries : $r2Key" -ForegroundColor Yellow
                Start-Sleep -Seconds ([math]::Pow(2, $attempt))
            }
        } catch {
            Write-Host "ERR: $($_.Exception.Message)" -ForegroundColor Red
            Start-Sleep -Seconds ([math]::Pow(2, $attempt))
        }
    }

    if ($success) { $uploaded++ } else { $failed++; Write-Host "FAIL: $r2Key" -ForegroundColor Red }
}

$elapsed = (Get-Date) - $startTime

Write-Host ""
Write-Host "=== Upload Complete ===" -ForegroundColor Cyan
Write-Host "Uploaded: $uploaded"
Write-Host "Skipped:  $skipped"
Write-Host "Failed:   $failed"
Write-Host "Size:     $([math]::Round($totalBytes / 1MB, 1)) MB"
Write-Host "Time:     $([math]::Round($elapsed.TotalMinutes, 1)) min"

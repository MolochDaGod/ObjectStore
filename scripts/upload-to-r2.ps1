# ═══════════════════════════════════════════════════════════════
# Upload ObjectStore images to R2 via worker API
# Usage: .\scripts\upload-to-r2.ps1 [-Category backgrounds] [-Limit 50]
# ═══════════════════════════════════════════════════════════════
param(
  [string]$Category = "all",
  [int]$Limit = 500,
  [switch]$DryRun
)

$WORKER_URL = "https://grudgeassets.grudge.workers.dev"
$API_KEY = "44d059ed85871fc6af7670533f06db20a06983d7ce11a2e9eec3870213de6396"
$BASE_DIR = "C:\Users\david\Desktop\ObjectStore"

$categories = if ($Category -eq "all") {
  @("backgrounds","images","sprites","icons","heroes")
} else { @($Category) }

$uploaded = 0; $skipped = 0; $failed = 0

foreach ($cat in $categories) {
  $dir = Join-Path $BASE_DIR $cat
  if (-not (Test-Path $dir)) { Write-Host "Skip: $cat (not found)" -ForegroundColor Yellow; continue }
  
  $files = Get-ChildItem $dir -Recurse -File -Include "*.png","*.jpg","*.gif","*.svg","*.webp" | Select-Object -First $Limit
  Write-Host "[$cat] $($files.Count) files to upload" -ForegroundColor Cyan
  
  foreach ($f in $files) {
    $relPath = $f.FullName.Replace("$BASE_DIR\","").Replace("\","/")
    $uploadCat = $cat
    
    if ($DryRun) {
      Write-Host "  [DRY] $relPath" -ForegroundColor Gray
      $skipped++
      continue
    }
    
    try {
      $mime = switch ($f.Extension.ToLower()) {
        ".png"  { "image/png" }
        ".jpg"  { "image/jpeg" }
        ".gif"  { "image/gif" }
        ".svg"  { "image/svg+xml" }
        ".webp" { "image/webp" }
        default { "application/octet-stream" }
      }
      
      $boundary = [System.Guid]::NewGuid().ToString()
      $fileBytes = [System.IO.File]::ReadAllBytes($f.FullName)
      $fileB64 = [Convert]::ToBase64String($fileBytes)
      
      # Use raw body upload with headers
      $headers = @{
        "X-API-Key" = $API_KEY
        "x-filename" = $f.Name
        "x-category" = $uploadCat
        "x-tags" = "[$([char]34)$uploadCat$([char]34),$([char]34)image$([char]34)]"
        "Content-Type" = $mime
      }
      
      $response = Invoke-WebRequest -Uri "$WORKER_URL/v1/assets" -Method POST -Headers $headers -Body $fileBytes -UseBasicParsing -TimeoutSec 30
      
      if ($response.StatusCode -eq 201 -or $response.StatusCode -eq 200) {
        $uploaded++
        if ($uploaded % 25 -eq 0) { Write-Host "  Uploaded $uploaded files..." -ForegroundColor Green }
      } else {
        $failed++
        Write-Host "  [FAIL] $relPath ($($response.StatusCode))" -ForegroundColor Red
      }
    } catch {
      $failed++
      if ($failed -le 5) { Write-Host "  [ERR] $relPath : $($_.Exception.Message)" -ForegroundColor Red }
    }
  }
}

Write-Host ""
Write-Host "=== Upload Complete ===" -ForegroundColor Cyan
Write-Host "  Uploaded: $uploaded" -ForegroundColor Green
Write-Host "  Skipped:  $skipped" -ForegroundColor Yellow
Write-Host "  Failed:   $failed" -ForegroundColor Red

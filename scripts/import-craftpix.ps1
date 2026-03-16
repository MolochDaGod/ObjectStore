Add-Type -AssemblyName System.IO.Compression.FileSystem

$osRoot = "C:\Users\nugye\Documents\GitHub\ObjectStore"

# ── 1. Fantasy Game Interface (PNG only, skip AI/EPS) ──────────────
$uiZip = "C:\Users\nugye\Documents\craftpix-855112-fantasy-game-interface.zip"
$uiDest = Join-Path $osRoot "sprites\ui\fantasy-interface"

Write-Host "Extracting Fantasy UI PNGs..."
$archive = [System.IO.Compression.ZipFile]::OpenRead($uiZip)
$uiCount = 0
foreach ($entry in $archive.Entries) {
    if ($entry.FullName.StartsWith("PNG/") -and $entry.Length -gt 0) {
        $rel = $entry.FullName.Substring(4)
        $target = Join-Path $uiDest $rel
        $dir = Split-Path $target
        if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true)
        $uiCount++
    }
}
$archive.Dispose()
Write-Host "  -> Extracted $uiCount Fantasy UI PNGs"

# ── 2. Magic Sprite Sheet Effects ──────────────────────────────────
$magicZip = "C:\Users\nugye\Documents\craftpix-671189-10-magic-sprite-sheet-effects-pixel-art.zip"
$effectsDest = Join-Path $osRoot "sprites\effects\magic"
$iconsDest = Join-Path $osRoot "icons\magic-effects"

Write-Host "Extracting Magic Effects..."
$archive2 = [System.IO.Compression.ZipFile]::OpenRead($magicZip)
$effectCount = 0
$iconCount = 0
foreach ($entry in $archive2.Entries) {
    if ($entry.Length -eq 0) { continue }

    if ($entry.FullName.StartsWith("Icons/") -and $entry.FullName.EndsWith(".png")) {
        $rel = $entry.FullName.Substring(6)
        $target = Join-Path $iconsDest $rel
        $dir = Split-Path $target
        if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true)
        $iconCount++
    }
    elseif ($entry.FullName.EndsWith(".png") -and !$entry.FullName.StartsWith("PSD/") -and !$entry.FullName.StartsWith("Icons/")) {
        # Flatten "1 Lightning/Lightning.png" -> "lightning.png"
        $filename = (Split-Path $entry.FullName -Leaf).ToLower().Replace(" ", "-")
        $target = Join-Path $effectsDest $filename
        $dir = Split-Path $target
        if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $true)
        $effectCount++
    }
}
$archive2.Dispose()
Write-Host "  -> Extracted $effectCount magic effect sheets, $iconCount icons"
Write-Host "Total: $($uiCount + $effectCount + $iconCount) files"

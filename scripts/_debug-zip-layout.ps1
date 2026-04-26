param([string]$Zip = "C:\Users\nugye\Documents\craftpix-net-668473-rpg-gems-icons-pack.zip")
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead($Zip)
$top = @{}
foreach ($e in $z.Entries) {
    if ($e.FullName.EndsWith('/')) { continue }
    $parts = $e.FullName.Split('/')
    if ($parts.Length -gt 1) {
        $folder = ($parts[0..($parts.Length - 2)] -join '/')
    } else {
        $folder = '<root>'
    }
    if (-not $top.ContainsKey($folder)) { $top[$folder] = 0 }
    $top[$folder]++
}
$z.Dispose()
$top.GetEnumerator() | Sort-Object Name | Format-Table Name, Value -AutoSize

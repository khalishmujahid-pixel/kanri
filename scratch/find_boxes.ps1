Add-Type -AssemblyName System.Drawing
$imgPath = (Get-Item "public/assets/improvements/ubf_st5_real_mapping.png").FullName
$bmp = [System.Drawing.Image]::FromFile($imgPath)
Write-Host "Image dimensions: $($bmp.Width) x $($bmp.Height)"

# Scan y from 220 to 260
$orangeCols = @{}
for ($y = 220; $y -lt 270; $y += 5) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 180 -and $c.G -gt 50 -and $c.G -lt 160 -and $c.B -lt 40) {
            $orangeCols[$x] = $true
        }
    }
}
$bmp.Dispose()

$sortedCols = $orangeCols.Keys | Sort-Object
Write-Host "Found $($sortedCols.Count) orange columns."
Write-Host "Sample columns: $($sortedCols -join ' ')"

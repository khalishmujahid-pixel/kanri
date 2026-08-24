Add-Type -AssemblyName System.Drawing
$imgPath = (Get-Item "public/assets/improvements/ubf_st5_real_mapping.png").FullName
$bmp = [System.Drawing.Image]::FromFile($imgPath)

# Find all pixels with orange border around R ~ 237, G ~ 125, B ~ 48
$orangeList = @()
for ($y = 210; $y -lt 280; $y++) {
    for ($x = 180; $x -lt 650; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 210 -and $c.G -gt 100 -and $c.G -lt 150 -and $c.B -lt 70) {
            $orangeList += [PSCustomObject]@{X=$x; Y=$y}
        }
    }
}
$bmp.Dispose()

$xValues = $orangeList | Select-Object -ExpandProperty X -Unique | Sort-Object
$yValues = $orangeList | Select-Object -ExpandProperty Y -Unique | Sort-Object

Write-Host "Y Range: $($yValues[0]) to $($yValues[-1])"

# Group X into contiguous clusters (the boxes)
$clusters = @()
$currentCluster = @()
foreach ($x in $xValues) {
    if ($currentCluster.Count -eq 0 -or ($x - $currentCluster[-1] -le 6)) {
        $currentCluster += $x
    } else {
        $clusters += ,$currentCluster
        $currentCluster = @($x)
    }
}
if ($currentCluster.Count -gt 0) { $clusters += ,$currentCluster }

Write-Host "Found $($clusters.Count) box clusters:"
for ($i = 0; $i -lt $clusters.Count; $i++) {
    $cl = $clusters[$i]
    $minX = $cl[0]
    $maxX = $cl[-1]
    $centerX = [Math]::Round(($minX + $maxX) / 2)
    $pct = [Math]::Round(($centerX / 1024) * 100, 2)
    Write-Host "Box $($i+1): X = $minX to $maxX, Center = $centerX px ($pct%)"
}

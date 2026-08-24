Add-Type -AssemblyName System.Drawing
$imgPath = (Get-Item "public/assets/improvements/ubf_st5_real_mapping.png").FullName
$bmp = [System.Drawing.Image]::FromFile($imgPath)

# Sample pixels across y = 245
$results = @()
for ($x = 180; $x -lt 650; $x += 4) {
    $c = $bmp.GetPixel($x, 245)
    if ($c.R -gt 100 -or $c.G -gt 100 -or $c.B -gt 100) {
        $results += [PSCustomObject]@{X=$x; R=$c.R; G=$c.G; B=$c.B; Hex="#$($c.R.ToString('X2'))$($c.G.ToString('X2'))$($c.B.ToString('X2'))"}
    }
}
$bmp.Dispose()

$results | Format-Table -AutoSize

# Převod loga: tmavé linie -> výrazné bílé na průhledném PNG (silnější tahy)
Add-Type -AssemblyName System.Drawing

$assetsDir = "C:\Users\monik\.cursor\projects\c-Users-monik-OneDrive-Plocha-PodPlot\assets"
$outDir = "C:\Users\monik\OneDrive\Plocha\PodPlot\app\public"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$sourcePath = Join-Path $assetsDir "c__Users_monik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_1000076629_1_-c0489291-859e-42bb-a9a3-59e72ebd8968.png"

function Test-Checkerboard([System.Drawing.Color]$c) {
  $avg = ($c.R + $c.G + $c.B) / 3
  return ($avg -gt 175 -and $avg -lt 245 -and [Math]::Abs($c.R - $c.G) -lt 20 -and [Math]::Abs($c.G - $c.B) -lt 20)
}

function Get-Luminance([System.Drawing.Color]$c) {
  return 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B
}

function Dilate-Alpha($alphaMap, $width, $height, $radius) {
  $out = New-Object int[] ($width * $height)
  for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
      $max = 0
      for ($dy = -$radius; $dy -le $radius; $dy++) {
        for ($dx = -$radius; $dx -le $radius; $dx++) {
          $nx = $x + $dx
          $ny = $y + $dy
          if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $width -or $ny -ge $height) { continue }
          $v = $alphaMap[$ny * $width + $nx]
          if ($v -gt $max) { $max = $v }
        }
      }
      $out[$y * $width + $x] = $max
    }
  }
  return $out
}

if (-not (Test-Path $sourcePath)) {
  Write-Error "Logo source missing: $sourcePath"
  exit 1
}

$img = [System.Drawing.Image]::FromFile($sourcePath)
$width = $img.Width
$height = $img.Height
$bmp = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, $width, $height)
$g.Dispose()
$img.Dispose()

$alphaMap = New-Object int[] ($width * $height)

for ($y = 0; $y -lt $height; $y++) {
  for ($x = 0; $x -lt $width; $x++) {
    $c = $bmp.GetPixel($x, $y)
    $lum = Get-Luminance $c
    $isChecker = Test-Checkerboard $c

    if ($isChecker -or $lum -gt 205) {
      $alphaMap[$y * $width + $x] = 0
    } else {
      $alpha = [Math]::Min(255, [int]((255 - $lum) * 2.4))
      if ($alpha -gt 24) {
        $alphaMap[$y * $width + $x] = [Math]::Max($alpha, 220)
      }
    }
  }
}

# Zesílení linek — silnější dilatace
$alphaMap = Dilate-Alpha $alphaMap $width $height 2
$alphaMap = Dilate-Alpha $alphaMap $width $height 1

for ($y = 0; $y -lt $height; $y++) {
  for ($x = 0; $x -lt $width; $x++) {
    $alpha = $alphaMap[$y * $width + $x]
    if ($alpha -gt 40) {
      $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    } else {
      $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    }
  }
}

$finalPath = Join-Path $outDir "logo-podplot.png"
$bmp.Save($finalPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

$bytes = [System.IO.File]::ReadAllBytes($finalPath)
$b64 = [Convert]::ToBase64String($bytes)
$assetPath = "C:\Users\monik\OneDrive\Plocha\PodPlot\app\src\data\logoAsset.js"
$content = "export const LOGO_PODPLOT_SRC = `"data:image/png;base64,$b64`";`n"
[System.IO.File]::WriteAllText($assetPath, $content)
Write-Output "logo regenerated -> $finalPath ($($content.Length) chars)"

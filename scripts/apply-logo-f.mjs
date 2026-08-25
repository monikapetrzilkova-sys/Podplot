/**
 * Nasadí logo F (dům + plot + ruce) do appky + PWA ikon.
 * Zdroj: ../Logo-navrhy/navrh-F.jpg
 * Ikony: zelené pozadí + logo se zachovaným poměrem stran (bez protáhnutí).
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceJpg = join(root, "..", "Logo-navrhy", "navrh-F.jpg");
const publicDir = join(root, "public");
const iconsDir = join(publicDir, "icons");

if (!existsSync(sourceJpg)) {
  console.error("Chybí zdroj:", sourceJpg);
  process.exit(1);
}

mkdirSync(iconsDir, { recursive: true });
copyFileSync(sourceJpg, join(publicDir, "logo-podplot.jpg"));

const psScript = `
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
$srcPath = '${sourceJpg.replace(/\\/g, "\\\\")}'
$publicDir = '${publicDir.replace(/\\/g, "\\\\")}'
$iconsDir = '${iconsDir.replace(/\\/g, "\\\\")}'
$brand = [System.Drawing.Color]::FromArgb(255, 27, 77, 62)

function Load-Bitmap([string]$path) {
  $bytes = [System.IO.File]::ReadAllBytes($path)
  $ms = New-Object System.IO.MemoryStream(,$bytes)
  return [System.Drawing.Bitmap]::FromStream($ms)
}

function Save-Png($bitmap, [string]$path) {
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

# Ořízne téměř bílé / průhledné okraje kolem zeleného loga
function Crop-Content([System.Drawing.Bitmap]$src) {
  $w = $src.Width
  $h = $src.Height
  $minX = $w; $minY = $h; $maxX = -1; $maxY = -1
  for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
      $c = $src.GetPixel($x, $y)
      $isBg = ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245) -or ($c.A -lt 20)
      if (-not $isBg) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  if ($maxX -lt 0) { return $src.Clone() }
  $cw = $maxX - $minX + 1
  $ch = $maxY - $minY + 1
  $side = [Math]::Max($cw, $ch)
  $pad = [int]([Math]::Round($side * 0.06))
  $side = $side + (2 * $pad)
  $out = New-Object System.Drawing.Bitmap $side, $side
  $g = [System.Drawing.Graphics]::FromImage($out)
  $g.Clear($brand)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $ox = [int](($side - $cw) / 2)
  $oy = [int](($side - $ch) / 2)
  $g.DrawImage($src, (New-Object System.Drawing.Rectangle $ox, $oy, $cw, $ch), (New-Object System.Drawing.Rectangle $minX, $minY, $cw, $ch), [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  return $out
}

function Resize-Square([System.Drawing.Image]$src, [int]$size, [double]$safeInset = 0.0) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear($brand)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $pad = [int]([Math]::Round($size * $safeInset))
  $inner = $size - (2 * $pad)
  $g.DrawImage($src, $pad, $pad, $inner, $inner)
  $g.Dispose()
  return $bmp
}

$raw = Load-Bitmap $srcPath
Write-Output ("source " + $raw.Width + "x" + $raw.Height)
$square = Crop-Content $raw
Write-Output ("cropped square " + $square.Width + "x" + $square.Height)
$raw.Dispose()

$main = Resize-Square $square 512 0.0
Save-Png $main (Join-Path $publicDir 'logo-podplot.png')
$main.Dispose()

$icon192 = Resize-Square $square 192 0.0
Save-Png $icon192 (Join-Path $iconsDir 'icon-192.png')
$icon192.Dispose()

$icon512 = Resize-Square $square 512 0.0
Save-Png $icon512 (Join-Path $iconsDir 'icon-512.png')
$icon512.Dispose()

$maskable = Resize-Square $square 512 0.12
Save-Png $maskable (Join-Path $iconsDir 'icon-512-maskable.png')
$maskable.Dispose()

$apple = Resize-Square $square 180 0.0
Save-Png $apple (Join-Path $publicDir 'apple-touch-icon.png')
$apple.Dispose()

$square.Dispose()
Write-Output 'icons written'
`;

const psPath = join(root, "scripts", "_apply-logo-f.ps1");
writeFileSync(psPath, psScript, "utf8");
const r = spawnSync(
  "powershell.exe",
  ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", psPath],
  { encoding: "utf8" }
);
if (r.status !== 0) {
  console.error(r.stdout);
  console.error(r.stderr);
  process.exit(r.status ?? 1);
}
console.log(r.stdout.trim());

const pngBuf = readFileSync(join(publicDir, "logo-podplot.png"));
const asset = `export const LOGO_PODPLOT_SRC = "data:image/png;base64,${pngBuf.toString("base64")}";\n`;
writeFileSync(join(root, "src", "data", "logoAsset.js"), asset);
console.log("logoAsset.js updated", asset.length, "chars");

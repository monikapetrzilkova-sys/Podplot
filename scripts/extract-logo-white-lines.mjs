/**
 * Extrahuje bílé linie loga F → průhledné PNG (záhlaví)
 * a app ikony na zeleném pozadí záhlaví (#1B4D3E).
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { decode } from "jpeg-js";
import { PNG } from "pngjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceCandidates = [
  join(root, "scripts", "_logo-f-good.png"),
  join(root, "dist", "assets", "logo-podplot-B2uHxoZk.png"),
  join(root, "scripts", "_logo-f-src.jpg"),
  join(root, "public", "logo-podplot.jpg"),
];
const sourcePath = sourceCandidates.find((p) => existsSync(p));
if (!sourcePath) throw new Error("Missing logo source");

const assetsDir = join(root, "src", "assets");
const publicDir = join(root, "public");
const iconsDir = join(publicDir, "icons");
const HEADER_R = 27;
const HEADER_G = 77;
const HEADER_B = 62;

mkdirSync(assetsDir, { recursive: true });
mkdirSync(iconsDir, { recursive: true });

function loadRgba(path) {
  const buf = readFileSync(path);
  if (path.toLowerCase().endsWith(".png")) {
    const png = PNG.sync.read(buf);
    return { width: png.width, height: png.height, data: png.data };
  }
  const decoded = decode(buf, { useTArray: true });
  const { width, height, data } = decoded;
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = data[i * 3];
    rgba[i * 4 + 1] = data[i * 3 + 1];
    rgba[i * 4 + 2] = data[i * 3 + 2];
    rgba[i * 4 + 3] = 255;
  }
  return { width, height, data: rgba };
}

function isGreenFill(r, g, b) {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (lum > 200) return false;
  if (r > 200 && g > 200 && b > 200) return false;
  return (g > r + 15 && g > b + 5) || (g >= 50 && g > r && g > b);
}

function isWhiteLine(r, g, b) {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (lum < 165) return false;
  if (g > r + 25 && g > b + 25 && lum < 220) return false;
  return true;
}

function idx(x, y, w) {
  return (y * w + x) * 4;
}

function extractWhiteLines({ width, height, data }) {
  const n = width * height;
  const white = new Uint8Array(n);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    if (!isWhiteLine(data[o], data[o + 1], data[o + 2])) continue;
    // přeskoč téměř čistě vnější padding (rohové zelené mimo squircle — bílá tam není)
    white[i] = 1;
    const x = i % width;
    const y = (i / width) | 0;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  if (maxX < 0) throw new Error("No white pixels");

  // Ořízni vnější bílý rámeček: nech jen vnitřních ~78 % bboxu
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const insetX = Math.round(bw * 0.11);
  const insetY = Math.round(bh * 0.11);
  const innerMinX = minX + insetX;
  const innerMaxX = maxX - insetX;
  const innerMinY = minY + insetY;
  const innerMaxY = maxY - insetY;

  const keep = new Uint8Array(n);
  for (let y = innerMinY; y <= innerMaxY; y++) {
    for (let x = innerMinX; x <= innerMaxX; x++) {
      const i = y * width + x;
      if (!white[i]) continue;
      // ještě vyžaduj blízkost zelené (odfiltruje případný šum)
      let nearGreen = false;
      for (let dy = -4; dy <= 4 && !nearGreen; dy++) {
        for (let dx = -4; dx <= 4 && !nearGreen; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const o = idx(nx, ny, width);
          if (isGreenFill(data[o], data[o + 1], data[o + 2])) nearGreen = true;
        }
      }
      if (nearGreen) keep[i] = 1;
    }
  }

  minX = width;
  minY = height;
  maxX = -1;
  maxY = -1;
  let count = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!keep[y * width + x]) continue;
      count++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (count < 500) throw new Error(`Too few white line pixels (${count})`);

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const pad = Math.max(4, Math.round(Math.max(cw, ch) * 0.03));
  const side = Math.max(cw, ch) + 2 * pad;
  const out = Buffer.alloc(side * side * 4);
  const ox = Math.floor((side - cw) / 2);
  const oy = Math.floor((side - ch) / 2);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (!keep[y * width + x]) continue;
      const px = ox + (x - minX);
      const py = oy + (y - minY);
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx * dx + dy * dy > 5) continue;
          const tx = px + dx;
          const ty = py + dy;
          if (tx < 0 || ty < 0 || tx >= side || ty >= side) continue;
          const o = idx(tx, ty, side);
          out[o] = 255;
          out[o + 1] = 255;
          out[o + 2] = 255;
          out[o + 3] = 255;
        }
      }
    }
  }
  return { width: side, height: side, data: out };
}

function placeOnGreen(lines, size, inset = 0.14) {
  const out = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const o = i * 4;
    out[o] = HEADER_R;
    out[o + 1] = HEADER_G;
    out[o + 2] = HEADER_B;
    out[o + 3] = 255;
  }
  const pad = Math.round(size * inset);
  const inner = size - 2 * pad;
  for (let y = 0; y < inner; y++) {
    for (let x = 0; x < inner; x++) {
      const sx = Math.min(lines.width - 1, Math.floor((x / inner) * lines.width));
      const sy = Math.min(lines.height - 1, Math.floor((y / inner) * lines.height));
      const so = idx(sx, sy, lines.width);
      if (lines.data[so + 3] < 20) continue;
      const o = idx(pad + x, pad + y, size);
      out[o] = 255;
      out[o + 1] = 255;
      out[o + 2] = 255;
      out[o + 3] = 255;
    }
  }
  return { width: size, height: size, data: out };
}

function writePng(path, img) {
  const png = new PNG({ width: img.width, height: img.height });
  img.data.copy(png.data);
  writeFileSync(path, PNG.sync.write(png));
}

console.log("source", sourcePath);
const rgba = loadRgba(sourcePath);
console.log("loaded", rgba.width, "x", rgba.height);
const lines = extractWhiteLines(rgba);
console.log("lines", lines.width, "x", lines.height);

const transparentPath = join(assetsDir, "logo-podplot.png");
writePng(transparentPath, lines);
copyFileSync(transparentPath, join(publicDir, "logo-podplot.png"));

writePng(join(iconsDir, "icon-192.png"), placeOnGreen(lines, 192, 0.08));
writePng(join(iconsDir, "icon-512.png"), placeOnGreen(lines, 512, 0.08));
writePng(join(iconsDir, "icon-512-maskable.png"), placeOnGreen(lines, 512, 0.12));
writePng(join(publicDir, "apple-touch-icon.png"), placeOnGreen(lines, 180, 0.08));
console.log("done");

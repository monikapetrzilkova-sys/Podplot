/**
 * Převod loga: tmavé linie → bílé na průhledném PNG.
 * Používá jpeg-js + pngjs přes esm.sh (bez npm).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir =
  "C:/Users/monik/.cursor/projects/c-Users-monik-OneDrive-Plocha-PodPlot/assets";

const sources = [
  {
    id: "black-lines",
    path: join(
      assetsDir,
      "c__Users_monik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_1000076629_1_-c0489291-859e-42bb-a9a3-59e72ebd8968.png"
    ),
  },
  {
    id: "white-lines",
    path: join(
      assetsDir,
      "c__Users_monik_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_1000076630-583c6085-de0c-4ea4-ad1b-5405c65e670f.png"
    ),
  },
];

const { decode } = await import("https://esm.sh/jpeg-js@0.4.4");
const { PNG } = await import("https://esm.sh/pngjs@7.0.0");

function isCheckerboard(r, g, b) {
  const avg = (r + g + b) / 3;
  return avg > 175 && avg < 245 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20;
}

function processBlackLines(raw) {
  const { width, height, data } = raw;
  const out = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (isCheckerboard(r, g, b) || lum > 210) {
      out[i * 4] = 0;
      out[i * 4 + 1] = 0;
      out[i * 4 + 2] = 0;
      out[i * 4 + 3] = 0;
    } else {
      const alpha = Math.min(255, Math.round((255 - lum) * 1.35));
      out[i * 4] = 255;
      out[i * 4 + 1] = 255;
      out[i * 4 + 2] = 255;
      out[i * 4 + 3] = alpha;
    }
  }

  return { width, height, data: out };
}

function processWhiteLines(raw) {
  const { width, height, data } = raw;
  const out = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (isCheckerboard(r, g, b) || lum < 150) {
      out[i * 4] = 0;
      out[i * 4 + 1] = 0;
      out[i * 4 + 2] = 0;
      out[i * 4 + 3] = 0;
    } else {
      const alpha = Math.min(255, Math.round((lum - 150) * 2.2));
      out[i * 4] = 255;
      out[i * 4 + 1] = 255;
      out[i * 4 + 2] = 255;
      out[i * 4 + 3] = alpha;
    }
  }

  return { width, height, data: out };
}

function decodeJpeg(path) {
  const buf = readFileSync(path);
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

function toPngBuffer({ width, height, data }) {
  const png = new PNG({ width, height });
  data.copy(png.data);
  return PNG.sync.write(png);
}

mkdirSync(join(root, "public"), { recursive: true });

let best = null;

for (const source of sources) {
  const raw = decodeJpeg(source.path);
  const processed =
    source.id === "black-lines" ? processBlackLines(raw) : processWhiteLines(raw);

  let opaque = 0;
  for (let i = 3; i < processed.data.length; i += 4) {
    if (processed.data[i] > 20) opaque++;
  }

  const pngBuf = toPngBuffer(processed);
  const outPath = join(root, "public", `logo-podplot-${source.id}.png`);
  writeFileSync(outPath, pngBuf);

  const score = opaque;
  console.log(source.id, "opaque pixels:", opaque, "->", outPath);

  if (!best || score > best.score) {
    best = { id: source.id, pngBuf, score };
  }
}

const finalPath = join(root, "public", "logo-podplot.png");
writeFileSync(finalPath, best.pngBuf);
console.log("selected:", best.id, "->", finalPath);

const b64 = best.pngBuf.toString("base64");
const asset = `export const LOGO_PODPLOT_SRC = "data:image/png;base64,${b64}";\n`;
writeFileSync(join(root, "src", "data", "logoAsset.js"), asset);
console.log("logoAsset.js updated", asset.length, "chars");

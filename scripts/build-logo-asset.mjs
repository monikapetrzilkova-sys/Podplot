import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "public", "logo-podplot.jpg");
const b64 = readFileSync(src).toString("base64");
const out = `export const LOGO_PODPLOT_SRC = "data:image/jpeg;base64,${b64}";\n`;
writeFileSync(join(root, "src", "data", "logoAsset.js"), out);
console.log("logoAsset.js written", out.length, "chars");

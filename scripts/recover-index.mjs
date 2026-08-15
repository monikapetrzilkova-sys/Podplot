import { createReadStream, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";

const transcriptsRoot =
  "C:/Users/monik/.cursor/projects/c-Users-monik-OneDrive-Plocha-PodPlot/agent-transcripts";

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (name.endsWith(".jsonl")) acc.push(p);
  }
  return acc;
}

function normalizePath(p = "") {
  return String(p).replace(/\\/g, "/");
}

function isAppIndex(p) {
  const n = normalizePath(p);
  return n.endsWith("/app/index.html") || n.endsWith("PodPlot/app/index.html");
}

const files = walk(transcriptsRoot);
let current = null;
let source = null;

for (const file of files) {
  const rl = createInterface({ input: createReadStream(file), crlfDelay: Infinity });
  let lineNo = 0;
  for await (const line of rl) {
    lineNo += 1;
    if (!line.includes("index.html")) continue;
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    const content = obj?.message?.content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (part?.type !== "tool_use" || !part.input) continue;
      const p = normalizePath(part.input.path || "");
      if (!isAppIndex(p)) continue;
      if (part.name === "Write" && typeof part.input.contents === "string") {
        current = part.input.contents;
        source = `${file}:${lineNo}:Write`;
      } else if (part.name === "StrReplace" && current != null) {
        const oldStr = part.input.old_string;
        const newStr = part.input.new_string;
        if (typeof oldStr === "string" && typeof newStr === "string" && current.includes(oldStr)) {
          current = current.split(oldStr).join(newStr);
          source = `${file}:${lineNo}:StrReplace`;
        }
      }
    }
  }
}

if (!current) {
  console.log("NO_RECOVERED_CONTENT");
  process.exit(2);
}

const out = "C:/Users/monik/OneDrive/Plocha/PodPlot/app/index.html";
writeFileSync(out, current, "utf8");
console.log("RECOVERED", current.length, "from", source);
console.log(current.slice(0, 800));

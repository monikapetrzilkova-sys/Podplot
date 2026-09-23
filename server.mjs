/**
 * PodPlot dev server — Node.js bez npm.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import {
  getGoogleMapsApiKey,
  googlePlacesNearby,
  googlePlaceDetails,
  resolveGooglePlacePhotoUrl,
  googlePlacesTextSearch,
  proxyAddressSearch,
  lookupPscCity,
  mockNearbyPlaces,
  handleAddressSearch,
} from "./lib/podplotBackend.mjs";
import { lookupAresCompany } from "./lib/aresLookup.mjs";
import {
  lookupMunicipalityOfficesByPsc,
  lookupMunicipalityOfficeByIco,
  lookupOfficialMunicipalityDomain,
} from "./lib/municipalityLookup.mjs";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PORT = 5173;

/** Načte KEY=VALUE z .env.local do process.env (nepřepisuje už nastavené). */
function loadDotEnv() {
  const filePath = join(ROOT, ".env.local");
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf-8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadDotEnv();

const babelCode = readFileSync(join(ROOT, "lib/babel.min.js"), "utf-8");
const babelContext = { globalThis: {}, console };
babelContext.globalThis = babelContext;
vm.createContext(babelContext);
vm.runInContext(babelCode, babelContext);
const Babel = babelContext.Babel;

function transformJsx(code, filename) {
  return Babel.transform(code, {
    presets: [["react", { runtime: "automatic", importSource: "react" }]],
    filename,
  }).code;
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".jsx": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const BINARY_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico"]);


const GOOGLE_MAPS_API_KEY = getGoogleMapsApiKey();

function jsonResponse(res, status, body) {
  res.writeHead(status, { "Content-Type": MIME[".json"] });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  try {
    let url = decodeURIComponent(req.url.split("?")[0]);

    if (url === "/api/psc-lookup") {
      const psc = new URL(req.url, "http://localhost").searchParams.get("psc")?.replace(/\D/g, "") ?? "";
      if (psc.length !== 5) {
        res.writeHead(400, { "Content-Type": MIME[".json"] });
        res.end(JSON.stringify({ error: "Neplatné PSČ" }));
        return;
      }
      try {
        const data = await lookupPscCity(psc);
        res.writeHead(200, { "Content-Type": MIME[".json"] });
        res.end(JSON.stringify(data ?? { city: null, psc: `${psc.slice(0, 3)} ${psc.slice(3)}` }));
      } catch {
        res.writeHead(200, { "Content-Type": MIME[".json"] });
        res.end(JSON.stringify({ city: null, psc: `${psc.slice(0, 3)} ${psc.slice(3)}` }));
      }
      return;
    }

    if (url === "/api/ares-lookup") {
      const ico = new URL(req.url, "http://localhost").searchParams.get("ico") ?? "";
      try {
        const data = await lookupAresCompany(ico);
        jsonResponse(res, data.ok ? 200 : 400, data);
      } catch (err) {
        jsonResponse(res, 500, { ok: false, error: err.message || "ARES lookup failed" });
      }
      return;
    }

    if (url === "/api/municipality-offices") {
      const params = new URL(req.url, "http://localhost").searchParams;
      const ico = params.get("ico")?.replace(/\D/g, "") ?? "";
      const psc = params.get("psc")?.replace(/\D/g, "") ?? "";
      try {
        if (ico.length === 8) {
          const office = await lookupMunicipalityOfficeByIco(ico);
          jsonResponse(res, 200, { ok: Boolean(office), offices: office ? [office] : [] });
          return;
        }
        if (psc.length !== 5) {
          jsonResponse(res, 400, { ok: false, offices: [], error: "Zadej pětimístné PSČ." });
          return;
        }
        jsonResponse(res, 200, await lookupMunicipalityOfficesByPsc(psc));
      } catch (err) {
        jsonResponse(res, 500, { ok: false, offices: [], error: err.message || "Lookup failed" });
      }
      return;
    }

    if (url === "/api/municipality-domain") {
      const params = new URL(req.url, "http://localhost").searchParams;
      try {
        const data = await lookupOfficialMunicipalityDomain({
          website: params.get("website"),
          city: params.get("city"),
          psc: params.get("psc"),
          name: params.get("name"),
          ico: params.get("ico"),
        });
        jsonResponse(res, data.ok ? 200 : 404, data);
      } catch (err) {
        jsonResponse(res, 500, { ok: false, domain: null, error: err.message || "Lookup failed" });
      }
      return;
    }

    if (url === "/api/address-search") {
      const params = new URL(req.url, "http://localhost").searchParams;
      const q = params.get("q")?.trim() ?? "";
      const street = params.get("street")?.trim() ?? "";
      const city = params.get("city")?.trim() ?? "";
      const psc = params.get("psc")?.trim() ?? "";
      const houseNumber = params.get("houseNumber")?.trim() ?? "";
      if (!q && !street) {
        res.writeHead(200, { "Content-Type": MIME[".json"] });
        res.end(JSON.stringify({ source: "empty", features: [], items: [] }));
        return;
      }
      const data = await handleAddressSearch({ street, city, psc, houseNumber, q });
      res.writeHead(200, { "Content-Type": MIME[".json"] });
      res.end(JSON.stringify(data));
      return;
    }

    if (url === "/api/config/maps") {
      jsonResponse(res, 200, {
        enabled: Boolean(GOOGLE_MAPS_API_KEY),
        apiKey: GOOGLE_MAPS_API_KEY || null,
        source: GOOGLE_MAPS_API_KEY ? "env" : "mock-fallback",
        mockPlaces: !GOOGLE_MAPS_API_KEY,
      });
      return;
    }

    if (url === "/api/config/supabase") {
      const sbUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
      const sbKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();
      jsonResponse(res, 200, {
        enabled: Boolean(sbUrl && sbKey),
        url: sbUrl || null,
        anonKey: sbKey || null,
        source: sbUrl && sbKey ? "env" : "offline",
      });
      return;
    }

    if (url === "/api/places/nearby") {
      const params = new URL(req.url, "http://localhost").searchParams;
      const lat = params.get("lat");
      const lng = params.get("lng");
      const radius = Math.min(15000, Math.max(200, Number(params.get("radius")) || 5000));
      const type = params.get("type") ?? "";
      const category = params.get("category") ?? "vse";
      if (!lat || !lng) {
        jsonResponse(res, 400, { error: "Chybí souřadnice" });
        return;
      }
      try {
        const data = await googlePlacesNearby(lat, lng, radius, { type, category });
        jsonResponse(res, 200, data);
      } catch (err) {
        jsonResponse(res, 200, { places: mockNearbyPlaces(lat, lng), source: "mock", error: err.message });
      }
      return;
    }

    if (url === "/api/places/details") {
      const placeId = new URL(req.url, "http://localhost").searchParams.get("placeId")?.trim();
      if (!placeId) {
        jsonResponse(res, 400, { error: "Chybí placeId" });
        return;
      }
      try {
        const data = await googlePlaceDetails(placeId);
        jsonResponse(res, 200, data ?? { error: "Místo nenalezeno" });
      } catch (err) {
        jsonResponse(res, 500, { error: err.message });
      }
      return;
    }

    if (url === "/api/places/photo") {
      const params = new URL(req.url, "http://localhost").searchParams;
      const ref = params.get("ref")?.trim() ?? "";
      const maxwidth = Number(params.get("maxwidth")) || 800;
      if (!ref || ref.length > 2048) {
        jsonResponse(res, 400, { error: "Chybí photo reference" });
        return;
      }
      try {
        const location = await resolveGooglePlacePhotoUrl(ref, maxwidth);
        if (!location) {
          jsonResponse(res, 404, { error: "Fotka nenalezena" });
          return;
        }
        res.writeHead(302, {
          Location: location,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        });
        res.end();
      } catch (err) {
        jsonResponse(res, 500, { error: err.message });
      }
      return;
    }

    if (url === "/api/places/search") {
      const params = new URL(req.url, "http://localhost").searchParams;
      const q = params.get("q")?.trim() ?? "";
      const lat = params.get("lat");
      const lng = params.get("lng");
      if (q.length < 2) {
        jsonResponse(res, 200, { places: [] });
        return;
      }
      try {
        const data = await googlePlacesTextSearch(q, lat, lng);
        jsonResponse(res, 200, data);
      } catch (err) {
        jsonResponse(res, 200, { places: [], error: err.message });
      }
      return;
    }

    if (url === "/") url = "/index.html";

    const cleanUrl = url.replace(/\.\./g, "");
    let filepath = join(ROOT, cleanUrl);
    try {
      await stat(filepath);
    } catch {
      filepath = join(ROOT, "public", cleanUrl.replace(/^\//, ""));
      await stat(filepath);
    }

    const ext = extname(filepath);

    if (BINARY_EXT.has(ext)) {
      const dest = req.headers["sec-fetch-dest"] || "";
      const accept = req.headers.accept || "";
      const asModule =
        dest === "script" ||
        dest === "module" ||
        accept.includes("text/javascript") ||
        accept.includes("application/javascript");
      if (asModule) {
        res.writeHead(200, { "Content-Type": MIME[".js"] });
        res.end(`export default ${JSON.stringify(url)};`);
        return;
      }
      const content = await readFile(filepath);
      res.writeHead(200, { "Content-Type": MIME[ext] ?? "application/octet-stream" });
      res.end(content);
      return;
    }

    let content = await readFile(filepath, "utf-8");

    if (ext === ".jsx") {
      try {
        content = transformJsx(content, filepath);
      } catch (transformErr) {
        console.error("JSX transform error:", url, transformErr.message);
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(`Chyba prekladu ${url}: ${transformErr.message}`);
        return;
      }
    }

    res.writeHead(200, { "Content-Type": MIME[ext] ?? "text/plain; charset=utf-8" });
    res.end(content);
  } catch (err) {
    console.error("Request error:", req.url, err.message);
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n  Port ${PORT} je obsazeny.`);
    console.error("  Server uz pravdepodobne bezi — otevrenete http://localhost:" + PORT);
    console.error("  Nebo ukoncete stare okno PodPlot (Ctrl+C) a spustte znovu.\n");
  } else {
    console.error("\n  Chyba serveru:", err.message, "\n");
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log("\n  PodPlot:  http://localhost:" + PORT);
  console.log("  Maps:     " + (GOOGLE_MAPS_API_KEY ? "Google Maps API aktivní" : "bez klíče — simulovaná mapa + mock Places"));
  const sbOn = Boolean(
    (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").trim() &&
      (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim()
  );
  console.log("  Supabase: " + (sbOn ? "zapnuto (sdílené příspěvky)" : "vypnuto — doplňte VITE_SUPABASE_* do .env.local"));
  console.log("  Ukoncit:  Ctrl+C\n");
});

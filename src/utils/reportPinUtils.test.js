import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildReportDisplayPositions } from "./reportPinUtils.js";
import { MAP_CENTER } from "../data/mapRadiusSettings.js";

/** n hlášení na jednom místě — typicky celoobecní oznámení nebo zamítnutá geolokace. */
function coLocated(n, pos = { x: MAP_CENTER.x, y: MAP_CENTER.y }) {
  return Array.from({ length: n }, (_, i) => ({ id: `r${i}`, mapPos: { ...pos } }));
}

function inBounds(p) {
  return p.x >= 8 && p.x <= 92 && p.y >= 8 && p.y <= 92;
}

describe("buildReportDisplayPositions", () => {
  it("skončí i pro hlášení namačkaná na jednom bodě", () => {
    // Regrese: cyklus neměl strop, poloměr přerostl mapu, clamp ho vracel
    // na obsazený okraj — od 88. špendlíku se karta prohlížeče zasekla natvrdo.
    for (const n of [50, 87, 88, 200]) {
      const out = buildReportDisplayPositions(coLocated(n));
      assert.equal(out.size, n, `pro ${n} špendlíků chybí pozice`);
    }
  });

  it("drží každý špendlík uvnitř mapy", () => {
    const out = buildReportDisplayPositions(coLocated(150));
    for (const [id, pos] of out) {
      assert.ok(inBounds(pos), `${id} je mimo mapu: ${JSON.stringify(pos)}`);
      assert.ok(Number.isFinite(pos.x) && Number.isFinite(pos.y), `${id} není číslo`);
    }
  });

  it("rozhodí špendlíky, které by se překrývaly", () => {
    const out = buildReportDisplayPositions(coLocated(6, { x: 30, y: 30 }));
    const seen = new Set([...out.values()].map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`));
    assert.equal(seen.size, 6, "některé špendlíky zůstaly na sobě");
  });

  it("uhne špendlíkem Domov", () => {
    const out = buildReportDisplayPositions(
      [{ id: "r1", mapPos: { x: MAP_CENTER.x, y: MAP_CENTER.y } }],
      MAP_CENTER
    );
    const p = out.get("r1");
    const dist = Math.hypot(p.x - MAP_CENTER.x, p.y - MAP_CENTER.y);
    assert.ok(dist > 0, "špendlík zůstal přesně na Domově");
  });

  it("nechá daleko od sebe ležící špendlíky na místě", () => {
    const reports = [
      { id: "a", mapPos: { x: 20, y: 20 } },
      { id: "b", mapPos: { x: 70, y: 70 } },
    ];
    const out = buildReportDisplayPositions(reports);
    assert.deepEqual(out.get("a"), { x: 20, y: 20 });
    assert.deepEqual(out.get("b"), { x: 70, y: 70 });
  });

  it("přeskočí hlášení bez platné pozice", () => {
    const out = buildReportDisplayPositions([
      { id: "ok", mapPos: { x: 40, y: 40 } },
      { id: "chybi" },
      { id: "nan", mapPos: { x: "abc", y: 10 } },
      { id: "null", mapPos: null },
    ]);
    assert.deepEqual([...out.keys()], ["ok"]);
  });

  it("zvládne prázdný vstup", () => {
    assert.equal(buildReportDisplayPositions([]).size, 0);
  });
});

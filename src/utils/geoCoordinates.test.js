import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { addressSuggestionToPick, buildMapPickResult } from "./geoCoordinates.js";

const JESENICE = { lat: 49.966, lng: 14.512 };
const RADIUS_KM = 7;

describe("addressSuggestionToPick", () => {
  it("dá stejný výsledek jako klepnutí do mapy", () => {
    // Našeptávač vrací lon, klepnutí do mapy lng — výsledek musí být totožný,
    // jinak by adresa a špendlík ukazovaly jinam.
    const suggestion = { id: "x", lat: 49.972, lon: 14.52 };
    const fromAddress = addressSuggestionToPick(suggestion, JESENICE, RADIUS_KM);
    const fromTap = buildMapPickResult(49.972, 14.52, JESENICE, RADIUS_KM);
    assert.deepEqual(fromAddress, fromTap);
  });

  it("bere i lng, když ho našeptávač pošle místo lon", () => {
    const a = addressSuggestionToPick({ lat: 49.97, lng: 14.52 }, JESENICE, RADIUS_KM);
    const b = addressSuggestionToPick({ lat: 49.97, lon: 14.52 }, JESENICE, RADIUS_KM);
    assert.deepEqual(a, b);
  });

  it("vrací pozici uvnitř mapy i GPS", () => {
    const pick = addressSuggestionToPick({ lat: 49.97, lon: 14.52 }, JESENICE, RADIUS_KM);
    assert.ok(pick.x >= 8 && pick.x <= 92, `x mimo mapu: ${pick.x}`);
    assert.ok(pick.y >= 8 && pick.y <= 92, `y mimo mapu: ${pick.y}`);
    assert.ok(Number.isFinite(pick.lat) && Number.isFinite(pick.lng));
  });

  it("adresa na sever od středu je na mapě výš", () => {
    const north = addressSuggestionToPick({ lat: 49.99, lon: 14.512 }, JESENICE, RADIUS_KM);
    const south = addressSuggestionToPick({ lat: 49.94, lon: 14.512 }, JESENICE, RADIUS_KM);
    assert.ok(north.y < south.y, "sever musí mít menší y než jih");
  });

  it("vrací null, když adresa nemá souřadnice", () => {
    for (const bad of [
      null,
      undefined,
      {},
      { lat: 49.97 },
      { lon: 14.52 },
      { lat: "abc", lon: 14.52 },
      { lat: 49.97, lon: null },
      { lat: Number.NaN, lon: 14.52 },
    ]) {
      assert.equal(addressSuggestionToPick(bad, JESENICE, RADIUS_KM), null, JSON.stringify(bad));
    }
  });

  it("zvládne souřadnice jako text", () => {
    const pick = addressSuggestionToPick({ lat: "49.97", lon: "14.52" }, JESENICE, RADIUS_KM);
    assert.ok(pick && Number.isFinite(pick.x));
  });
});

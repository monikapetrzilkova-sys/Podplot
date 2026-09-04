import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CZECHIA_BOUNDS, CZECHIA_CENTER } from "./czechiaMapView.js";

describe("czechiaMapView", () => {
  it("covers the Czech Republic with a wide bounding box", () => {
    assert.ok(CZECHIA_BOUNDS.south < CZECHIA_BOUNDS.north);
    assert.ok(CZECHIA_BOUNDS.west < CZECHIA_BOUNDS.east);
    assert.ok(CZECHIA_CENTER.lat > CZECHIA_BOUNDS.south && CZECHIA_CENTER.lat < CZECHIA_BOUNDS.north);
    assert.ok(CZECHIA_CENTER.lng > CZECHIA_BOUNDS.west && CZECHIA_CENTER.lng < CZECHIA_BOUNDS.east);
    assert.ok(CZECHIA_BOUNDS.south < 49 && CZECHIA_BOUNDS.north > 50.5);
    assert.ok(CZECHIA_BOUNDS.west < 13 && CZECHIA_BOUNDS.east > 18);
  });
});

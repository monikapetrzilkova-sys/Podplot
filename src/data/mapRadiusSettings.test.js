import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { radiusKmToMeters } from "./mapRadiusSettings.js";
import { distanceBetweenKm, filterByActiveLocation } from "./geoFilter.js";
import { offsetLatLng } from "../utils/geoCoordinates.js";

describe("radiusKmToMeters", () => {
  it("maps slider kilometres to real metres for the map circle", () => {
    assert.equal(radiusKmToMeters(0.5), 500);
    assert.equal(radiusKmToMeters(1), 1000);
    assert.equal(radiusKmToMeters(2), 2000);
    assert.equal(radiusKmToMeters(5), 5000);
  });
});

describe("neighbor radius scale", () => {
  const jesenice = { lat: 49.9683, lng: 14.5175 };

  it("treats 1 km as about 1 km on the ground around Jesenice", () => {
    const oneKmNorth = offsetLatLng(jesenice.lat, jesenice.lng, 0, 1000);
    const dist = distanceBetweenKm(jesenice, oneKmNorth);
    assert.ok(dist > 0.98 && dist < 1.02, `expected ~1 km, got ${dist}`);
  });

  it("keeps a pin 1.5 km away inside a 2 km obec circle and drops 3 km", () => {
    const near = { id: "near", ...offsetLatLng(jesenice.lat, jesenice.lng, 1500, 0) };
    const far = { id: "far", ...offsetLatLng(jesenice.lat, jesenice.lng, 3000, 0) };
    const home = {
      id: "domov",
      municipality: "Jesenice",
      lat: jesenice.lat,
      lng: jesenice.lng,
      radiusKm: 2,
    };
    const visible = filterByActiveLocation([near, far], "domov", home).map((i) => i.id);
    assert.deepEqual(visible, ["near"]);
  });
});

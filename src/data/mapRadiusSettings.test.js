import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { radiusKmToMeters, resolveGuidePlacesRadiusM } from "./mapRadiusSettings.js";
import { distanceBetweenKm, filterByActiveLocation, filterGuidePlacesByInterest } from "./geoFilter.js";
import { offsetLatLng } from "../utils/geoCoordinates.js";

describe("radiusKmToMeters", () => {
  it("maps slider kilometres to real metres for the map circle", () => {
    assert.equal(radiusKmToMeters(0.5), 500);
    assert.equal(radiusKmToMeters(1), 1000);
    assert.equal(radiusKmToMeters(2), 2000);
    assert.equal(radiusKmToMeters(5), 5000);
  });
});

describe("resolveGuidePlacesRadiusM", () => {
  it("follows interest radius without a 5 km floor", () => {
    assert.equal(resolveGuidePlacesRadiusM({ radiusKm: 2 }), 2300);
    assert.equal(resolveGuidePlacesRadiusM({ radiusKm: 0.5 }), 575);
    assert.equal(resolveGuidePlacesRadiusM({ radiusKm: 5 }), 5750);
  });
});

describe("neighbor radius scale", () => {
  const jesenice = { lat: 49.9683, lng: 14.5175 };

  it("treats 1 km as about 1 km on the ground around Jesenice", () => {
    const oneKmNorth = offsetLatLng(jesenice.lat, jesenice.lng, 0, 1000);
    const km = distanceBetweenKm(jesenice, oneKmNorth);
    assert.ok(km > 0.95 && km < 1.05, `expected ~1 km, got ${km}`);
  });

  it("keeps near items and drops far ones for active home radius", () => {
    const near = {
      id: "near",
      locationId: "domov",
      lat: jesenice.lat,
      lng: jesenice.lng,
    };
    const far = offsetLatLng(jesenice.lat, jesenice.lng, 0, 8000);
    const farItem = {
      id: "far",
      locationId: "domov",
      lat: far.lat,
      lng: far.lng,
    };
    const home = {
      id: "domov",
      municipality: "Jesenice",
      lat: jesenice.lat,
      lng: jesenice.lng,
      radiusKm: 2,
    };
    const visible = filterByActiveLocation([near, farItem], "domov", home).map((i) => i.id);
    assert.deepEqual(visible, ["near"]);
  });
});

describe("filterGuidePlacesByInterest", () => {
  const jesenice = { lat: 49.9683, lng: 14.5175, municipality: "Jesenice", radiusKm: 2, id: "domov" };

  it("hides Prague places outside the interest radius for Jesenice", () => {
    const localShop = {
      id: "local",
      name: "Albert Jesenice",
      lat: jesenice.lat,
      lng: jesenice.lng,
    };
    // ~12 km north ≈ Praha
    const pragueGarden = offsetLatLng(jesenice.lat, jesenice.lng, 0, 12000);
    const chladek = {
      id: "chladek",
      name: "Zahradnictví Chládek",
      lat: pragueGarden.lat,
      lng: pragueGarden.lng,
      address: "Praha",
    };
    const visible = filterGuidePlacesByInterest([localShop, chladek], jesenice).map((p) => p.id);
    assert.deepEqual(visible, ["local"]);
  });
});

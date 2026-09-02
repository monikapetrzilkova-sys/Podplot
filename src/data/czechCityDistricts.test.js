import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  prahaDistrictFromPsc,
  refineLocalityFromPsc,
  parseCityDistrict,
  isBareStatutoryCity,
  localityShortLabel,
} from "./czechCityDistricts.js";
import {
  municipalitiesMatch,
  officialMunicipalityMatch,
  filterByActiveLocation,
  filterSecurityReportsByLocation,
} from "./geoFilter.js";

describe("prahaDistrictFromPsc", () => {
  it("maps Prague ZIP codes to numbered districts", () => {
    assert.equal(prahaDistrictFromPsc("110 00"), "Praha 1");
    assert.equal(prahaDistrictFromPsc("14200"), "Praha 4");
    assert.equal(prahaDistrictFromPsc("15000"), "Praha 5");
    assert.equal(prahaDistrictFromPsc("60200"), null);
  });
});

describe("refineLocalityFromPsc", () => {
  it("does not leave a Prague ZIP as bare Praha", () => {
    assert.equal(refineLocalityFromPsc("142 00", "Praha"), "Praha 4 — Lhotka");
    assert.equal(refineLocalityFromPsc("11000", "Praha"), "Praha 1 — Staré Město");
    assert.equal(refineLocalityFromPsc("60200", "Brno"), "Brno-střed");
    assert.equal(refineLocalityFromPsc("25222", "Jesenice u Prahy"), "Jesenice u Prahy");
  });
});

describe("municipalitiesMatch", () => {
  it("does not treat all of Prague as one town", () => {
    assert.equal(municipalitiesMatch("Praha 4 — Lhotka", "Praha 1"), false);
    assert.equal(municipalitiesMatch("Praha 4", "Praha"), false);
    assert.equal(municipalitiesMatch("Praha", "Praha 5"), false);
    assert.equal(municipalitiesMatch("Praha 4 — Lhotka", "Praha 4"), true);
    assert.equal(municipalitiesMatch("Jesenice", "Jesenice u Prahy"), true);
    assert.equal(municipalitiesMatch("Praha", "Jesenice u Prahy"), false);
    assert.equal(municipalitiesMatch("Praha", "Praha"), false);
    assert.equal(municipalitiesMatch("Jesenice", "Jesenice"), true);
  });
});

describe("officialMunicipalityMatch", () => {
  it("lets city-wide official news reach a Prague district", () => {
    assert.equal(officialMunicipalityMatch("Praha", "Praha 4 — Lhotka"), true);
    assert.equal(officialMunicipalityMatch("Praha 1", "Praha 4"), false);
  });
});

describe("parseCityDistrict", () => {
  it("reads numbered Prague districts", () => {
    assert.deepEqual(parseCityDistrict("Praha 4 — Lhotka"), { city: "praha", district: "4" });
    assert.equal(isBareStatutoryCity("Praha"), true);
    assert.equal(isBareStatutoryCity("Praha 4"), false);
    assert.equal(localityShortLabel("Praha 4 — Lhotka"), "Praha 4");
  });
});

describe("filterByActiveLocation", () => {
  const home = {
    id: "domov",
    municipality: "Praha 4 — Lhotka",
    lat: 50.016,
    lng: 14.428,
    radiusKm: 2,
  };

  it("keeps a nearby Prague 5 pin and drops distant Prague 1", () => {
    const items = [
      { id: "near", municipality: "Praha 5", lat: 50.02, lng: 14.42 },
      { id: "far", municipality: "Praha 1", lat: 50.087, lng: 14.42 },
    ];
    const visible = filterByActiveLocation(items, "domov", home).map((i) => i.id);
    assert.deepEqual(visible, ["near"]);
  });

  it("does not treat bare Praha as the same locality when GPS is missing", () => {
    const items = [
      { id: "citywide", municipality: "Praha" },
      { id: "same", municipality: "Praha 4" },
    ];
    const visible = filterByActiveLocation(items, "domov", { ...home, lat: null, lng: null }).map((i) => i.id);
    assert.deepEqual(visible, ["same"]);
  });

  it("hides Wenceslas Square bike theft from Praha 4 — Lhotka", () => {
    const bike = {
      id: "r6",
      type: "Odcizení kola",
      body: "U Václavského náměstí zmizelo kolo u stojanu — černý rám, červené blatníky.",
      municipality: "Praha 1",
      locationId: "prace",
      lat: 50.0813,
      lng: 14.4273,
    };
    assert.deepEqual(filterByActiveLocation([bike], "domov", home).map((i) => i.id), []);
    assert.deepEqual(
      filterSecurityReportsByLocation([bike], "domov", home).map((i) => i.id),
      []
    );
  });

  it("hides a Václavák post without coordinates from Lhotka", () => {
    const post = {
      id: "remote-bike",
      title: "Odcizení kola",
      body: "U Václavského náměstí zmizelo kolo u stojanu.",
    };
    assert.deepEqual(filterByActiveLocation([post], "domov", home).map((i) => i.id), []);
  });
});

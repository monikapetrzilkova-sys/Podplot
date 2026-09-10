import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseRuianAddressText,
  parseStreetAndHouseNumber,
  buildRuianQueryStrings,
  ruianCityQueryName,
  ruianCityQueryVariants,
  escapeRuianSql,
} from "./ruianAddress.mjs";

describe("parseRuianAddressText", () => {
  it("parses a street without a house number", () => {
    assert.deepEqual(parseRuianAddressText("Pražská, Jesenice"), {
      street: "Pražská",
      houseNumber: "",
      suburb: "",
      psc: "",
      city: "Jesenice",
    });
  });

  it("parses číslo popisné and PSČ", () => {
    assert.equal(parseRuianAddressText("Pražská 21, Osnice, 25242 Jesenice").street, "Pražská");
    assert.equal(parseRuianAddressText("Pražská 21, Osnice, 25242 Jesenice").houseNumber, "21");
    assert.equal(parseRuianAddressText("Pražská 21, Osnice, 25242 Jesenice").psc, "252 42");
    assert.equal(parseRuianAddressText("Pražská 21, Osnice, 25242 Jesenice").city, "Jesenice");
    assert.equal(parseRuianAddressText("Budějovická 477/34, Krč, 14000 Praha 4").houseNumber, "477/34");
    assert.equal(parseRuianAddressText("Pražská č.ev. 110, Osnice, 25242 Jesenice").houseNumber, "110");
  });
});

describe("parseStreetAndHouseNumber", () => {
  it("keeps a street without a house number", () => {
    assert.deepEqual(parseStreetAndHouseNumber("Platanová"), {
      street: "Platanová",
      houseNumber: "",
    });
    assert.deepEqual(parseStreetAndHouseNumber("5. května"), {
      street: "5. května",
      houseNumber: "",
    });
  });

  it("splits a trailing číslo popisné", () => {
    assert.deepEqual(parseStreetAndHouseNumber("Platanová 1568"), {
      street: "Platanová",
      houseNumber: "1568",
    });
    assert.deepEqual(parseStreetAndHouseNumber("Budějovická 477/34"), {
      street: "Budějovická",
      houseNumber: "477/34",
    });
  });
});

describe("buildRuianQueryStrings", () => {
  it("searches the municipality after the first letter", () => {
    assert.deepEqual(buildRuianQueryStrings({ street: "P", city: "Jesenice", psc: "252 42" }), [
      "P, Jesenice",
      "P, 25242 Jesenice",
      "P, 25242",
    ]);
  });

  it("looks up a specific house number even when it is typed into the street field", () => {
    const queries = buildRuianQueryStrings({
      street: "Platanová 1568",
      city: "Jesenice u Prahy",
      psc: "252 42",
    });
    assert.ok(queries.includes("Platanová 1568, Jesenice"));
    assert.ok(queries.includes("Platanová 1568, 25242"));
  });

  it("strips the neighborhood suffix from the city", () => {
    assert.equal(ruianCityQueryName("Praha 4 — Lhotka"), "Praha 4");
    assert.equal(ruianCityQueryVariants("Jesenice u Prahy").includes("Jesenice"), true);
    assert.ok(buildRuianQueryStrings({ street: "Bud", city: "Praha 4 — Lhotka" }).includes("Bud, Praha 4"));
  });
});

describe("escapeRuianSql", () => {
  it("doubles single quotes for ArcGIS where clauses", () => {
    assert.equal(escapeRuianSql("Jesenice"), "Jesenice");
    assert.equal(escapeRuianSql("U 'potoka"), "U ''potoka");
    assert.equal(escapeRuianSql(""), "");
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseRuianAddressText,
  buildRuianQueryStrings,
  ruianCityQueryName,
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

describe("buildRuianQueryStrings", () => {
  it("searches the municipality after the first letter", () => {
    assert.deepEqual(buildRuianQueryStrings({ street: "P", city: "Jesenice", psc: "252 42" }), [
      "P, Jesenice",
      "P, 25242 Jesenice",
      "P, 25242",
    ]);
  });

  it("strips the neighborhood suffix from the city", () => {
    assert.equal(ruianCityQueryName("Praha 4 — Lhotka"), "Praha 4");
    assert.ok(buildRuianQueryStrings({ street: "Bud", city: "Praha 4 — Lhotka" }).includes("Bud, Praha 4"));
  });
});

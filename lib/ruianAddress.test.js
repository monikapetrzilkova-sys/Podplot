import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseRuianAddressText,
  buildRuianQueryStrings,
  ruianCityQueryName,
  likePrefixes,
  formatHouseNumberFromRuian,
  streetMatchesPrefix,
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

describe("likePrefixes", () => {
  it("expands Czech diacritics in the typed prefix", () => {
    const prefixes = likePrefixes("Pr");
    assert.ok(prefixes.includes("Pr%"));
    assert.ok(prefixes.includes("Př%"));
    assert.ok(prefixes.includes("pr%"));
  });
});

describe("formatHouseNumberFromRuian", () => {
  it("joins descriptive and orientation numbers", () => {
    assert.equal(formatHouseNumberFromRuian({ cislodomovni: 477, cisloorientacni: 34 }), "477/34");
    assert.equal(formatHouseNumberFromRuian({ cislodomovni: 21 }), "21");
    assert.equal(
      formatHouseNumberFromRuian({ cislodomovni: 12, cisloorientacni: 3, cisloorientacnipismeno: "a" }),
      "12/3a"
    );
  });
});

describe("streetMatchesPrefix", () => {
  it("matches without requiring diacritics", () => {
    assert.equal(streetMatchesPrefix("Příčná", "P"), true);
    assert.equal(streetMatchesPrefix("Příčná", "Pr"), true);
    assert.equal(streetMatchesPrefix("Příčná", "Pri"), true);
    assert.equal(streetMatchesPrefix("Parková", "Po"), false);
  });
});

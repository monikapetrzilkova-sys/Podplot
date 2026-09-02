import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeHouseNumber,
  houseNumberMatches,
  buildAddressSearchQuery,
  canSearchAddress,
  rankAddressSuggestions,
} from "./addressAutocomplete.js";

describe("houseNumberMatches", () => {
  it("matches the same number and common Czech suffixes", () => {
    assert.equal(houseNumberMatches("12", "12"), true);
    assert.equal(houseNumberMatches("12a", "12"), true);
    assert.equal(houseNumberMatches("12/1", "12"), true);
    assert.equal(houseNumberMatches("12a", "12a"), true);
    assert.equal(houseNumberMatches("12", "12a"), false);
    assert.equal(houseNumberMatches("120", "12"), false);
    assert.equal(houseNumberMatches("5", "12"), false);
  });

  it("treats empty filter as match-all", () => {
    assert.equal(houseNumberMatches("12", ""), true);
    assert.equal(houseNumberMatches("", "12"), false);
  });
});

describe("buildAddressSearchQuery", () => {
  it("puts house number first so suggestions can narrow streets", () => {
    assert.equal(buildAddressSearchQuery({ houseNumber: "12", street: "Hlavní", city: "Jesenice" }), "12 Hlavní Jesenice");
    assert.equal(buildAddressSearchQuery({ houseNumber: "12", street: "Hl" }), "12 Hl");
    assert.equal(normalizeHouseNumber(" 12 A "), "12a");
  });

  it("needs at least 3 characters before searching", () => {
    assert.equal(canSearchAddress({ houseNumber: "12" }), false);
    assert.equal(canSearchAddress({ houseNumber: "12", street: "H" }), true);
    assert.equal(canSearchAddress({ houseNumber: "12", city: "Jesenice" }), true);
  });
});

describe("rankAddressSuggestions", () => {
  it("keeps only matching house numbers when any match exists", () => {
    const ranked = rankAddressSuggestions(
      [
        { street: "Hlavní", houseNumber: "5" },
        { street: "Hlavní", houseNumber: "12" },
        { street: "Lípová", houseNumber: "12a" },
        { street: "Na Louce", houseNumber: "120" },
      ],
      "12"
    );
    assert.deepEqual(
      ranked.map((i) => `${i.street} ${i.houseNumber}`),
      ["Hlavní 12", "Lípová 12a"]
    );
  });
});

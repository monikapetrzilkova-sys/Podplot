import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeHouseNumber,
  houseNumberMatches,
  buildAddressSearchQuery,
  canSearchAddress,
  rankAddressSuggestions,
  filterSuggestionsByLocality,
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
  it("puts street first and keeps the locality from PSČ", () => {
    assert.equal(
      buildAddressSearchQuery({ street: "Hlavní", houseNumber: "12", psc: "142 00", city: "Praha 4" }),
      "Hlavní 12 142 00 Praha 4"
    );
    assert.equal(buildAddressSearchQuery({ street: "Hl", psc: "142 00" }), "Hl 142 00");
    assert.equal(normalizeHouseNumber(" 12 A "), "12a");
  });

  it("needs a locality and a street before searching", () => {
    assert.equal(canSearchAddress({ houseNumber: "12" }), false);
    assert.equal(canSearchAddress({ street: "Hlavní" }), false);
    assert.equal(canSearchAddress({ street: "Hl", psc: "14200" }), true);
    assert.equal(canSearchAddress({ street: "P", psc: "25242" }), true);
    assert.equal(canSearchAddress({ street: "P", city: "Jesenice" }), true);
    assert.equal(canSearchAddress({ street: "Hlavní", city: "Jesenice" }), true);
    assert.equal(canSearchAddress({ houseNumber: "12", city: "Jesenice" }), false);
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

describe("filterSuggestionsByLocality", () => {
  it("keeps addresses in the same PSČ when any match exists", () => {
    const filtered = filterSuggestionsByLocality(
      [
        { street: "Hlavní", houseNumber: "12", psc: "142 00", city: "Praha 4" },
        { street: "Hlavní", houseNumber: "8", psc: "252 42", city: "Jesenice" },
      ],
      { psc: "14200" }
    );
    assert.deepEqual(
      filtered.map((i) => `${i.street} ${i.houseNumber}`),
      ["Hlavní 12"]
    );
  });

  it("keeps streets without PSČ when the city matches", () => {
    const filtered = filterSuggestionsByLocality(
      [
        { street: "Pražská", houseNumber: "", psc: "", city: "Jesenice" },
        { street: "Pražská", houseNumber: "21", psc: "252 42", city: "Jesenice" },
        { street: "Hlavní", houseNumber: "1", psc: "110 00", city: "Praha 1" },
      ],
      { psc: "25242", city: "Jesenice" }
    );
    assert.deepEqual(
      filtered.map((i) => `${i.street} ${i.houseNumber}`.trim()),
      ["Pražská", "Pražská 21"]
    );
  });
});

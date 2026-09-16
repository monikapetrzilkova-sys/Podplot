import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeHouseNumber,
  houseNumberMatches,
  houseNumberSuggests,
  buildAddressSearchQuery,
  canSearchAddress,
  rankAddressSuggestions,
  filterSuggestionsByLocality,
  normalizeStreetName,
  streetsMatch,
  localityMatches,
  isExistingHouseMatch,
  matchExistingAddress,
  fieldErrorsFromAddressVerify,
  ADDRESS_NOT_FOUND_MESSAGE,
  ADDRESS_HOUSE_NOT_FOUND_MESSAGE,
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

  it("suggests longer house numbers while typing", () => {
    assert.equal(houseNumberSuggests("1568", "15"), true);
    assert.equal(houseNumberSuggests("1568", "156"), true);
    assert.equal(houseNumberSuggests("1568", "1568"), true);
    assert.equal(houseNumberSuggests("835", "156"), false);
  });
});

describe("buildAddressSearchQuery", () => {
  it("puts street first and keeps the locality from PSČ", () => {
    assert.equal(
      buildAddressSearchQuery({ street: "Hlavní", houseNumber: "12", psc: "142 00", city: "Praha 4" }),
      "Hlavní 12 142 00 Praha 4"
    );
    assert.equal(buildAddressSearchQuery({ street: "Hl", psc: "142 00" }), "Hl 142 00");
    assert.equal(
      buildAddressSearchQuery({ street: "Platanová 1568", psc: "252 42", city: "Jesenice" }),
      "Platanová 1568 252 42 Jesenice"
    );
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
      ["Hlavní 12", "Lípová 12a", "Na Louce 120"]
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

describe("existing address match", () => {
  const pražská21 = {
    street: "Pražská",
    houseNumber: "21",
    psc: "252 42",
    city: "Jesenice",
    lat: 49.96,
    lon: 14.51,
  };

  it("treats diacritics and ulice prefix as the same street", () => {
    assert.equal(normalizeStreetName("Ulice Pražská"), "prazska");
    assert.equal(streetsMatch("Prazska", "Pražská"), true);
    assert.equal(streetsMatch("Nesmyslná", "Pražská"), false);
  });

  it("accepts the same PSČ even when the city label differs slightly", () => {
    assert.equal(localityMatches(pražská21, { psc: "25242", city: "Jesenice u Prahy" }), true);
    assert.equal(localityMatches(pražská21, { psc: "14200", city: "Praha 4" }), false);
  });

  it("requires a real house on the typed street — not just the municipality", () => {
    assert.equal(
      isExistingHouseMatch(pražská21, {
        street: "Pražská",
        houseNumber: "21",
        psc: "252 42",
        city: "Jesenice",
      }),
      true
    );
    assert.equal(
      isExistingHouseMatch(pražská21, {
        street: "Nesmyslná",
        houseNumber: "21",
        psc: "252 42",
        city: "Jesenice",
      }),
      false
    );
    assert.equal(
      isExistingHouseMatch({ city: "Jesenice", psc: "252 42", lat: 49.96, lon: 14.51 }, {
        street: "Nesmyslná",
        houseNumber: "999",
        psc: "252 42",
        city: "Jesenice",
      }),
      false
    );
  });

  it("rejects a made-up street even when the city exists", () => {
    const result = matchExistingAddress(
      [
        { street: "Pražská", houseNumber: "21", psc: "252 42", city: "Jesenice" },
        { city: "Jesenice", psc: "252 42", lat: 49.96, lon: 14.51 },
      ],
      { street: "Nesmyslná", houseNumber: "1", psc: "252 42", city: "Jesenice" }
    );
    assert.equal(result.ok, false);
    assert.equal(result.reason, "missing");
  });

  it("rejects a missing číslo popisné on an otherwise real street", () => {
    const result = matchExistingAddress([pražská21], {
      street: "Pražská",
      houseNumber: "99999",
      psc: "252 42",
      city: "Jesenice",
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, "house");
    assert.equal(
      fieldErrorsFromAddressVerify({ ok: false, reason: "house", error: ADDRESS_HOUSE_NOT_FOUND_MESSAGE })
        .houseNumber,
      ADDRESS_HOUSE_NOT_FOUND_MESSAGE
    );
  });

  it("prefers the exact house number when several candidates exist", () => {
    const result = matchExistingAddress(
      [
        { street: "Pražská", houseNumber: "21a", psc: "252 42", city: "Jesenice", lat: 1, lon: 1 },
        { street: "Pražská", houseNumber: "21", psc: "252 42", city: "Jesenice", lat: 2, lon: 2 },
      ],
      { street: "Pražská", houseNumber: "21", psc: "252 42", city: "Jesenice" }
    );
    assert.equal(result.ok, true);
    assert.equal(result.match.houseNumber, "21");
    assert.equal(result.match.lat, 2);
  });

  it("maps a missing street to the registration field error", () => {
    assert.deepEqual(
      fieldErrorsFromAddressVerify({ ok: false, reason: "missing", error: ADDRESS_NOT_FOUND_MESSAGE }),
      { street: ADDRESS_NOT_FOUND_MESSAGE }
    );
  });
});

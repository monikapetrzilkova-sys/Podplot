import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isValidIco, normalizeIco, mapAresEntity, parseAresTextAddress } from "./aresLookup.mjs";

describe("IČO", () => {
  it("normalizes and checks the Czech control digit", () => {
    assert.equal(normalizeIco("27074358"), "27074358");
    assert.equal(isValidIco("27074358"), true);
    assert.equal(isValidIco("00000000"), false);
    assert.equal(isValidIco("123"), false);
  });
});

describe("mapAresEntity", () => {
  it("keeps Prague district and suburb from the seat, not just Praha", () => {
    const company = mapAresEntity({
      ico: "27074358",
      obchodniJmeno: "Asseco Central Europe, a.s.",
      sidlo: {
        nazevObce: "Praha",
        nazevMestskeCastiObvodu: "Praha 4",
        nazevMestskehoObvodu: "Praha 4",
        nazevCastiObce: "Michle",
        nazevUlice: "Budějovická",
        cisloDomovni: 778,
        cisloOrientacni: 3,
        cisloOrientacniPismeno: "a",
        psc: 14000,
        textovaAdresa: "Budějovická 778/3a, Michle, 14000 Praha 4",
      },
    });
    assert.equal(company.city, "Praha");
    assert.equal(company.district, "Praha 4");
    assert.equal(company.suburb, "Michle");
    assert.equal(company.psc, "140 00");
    assert.equal(company.street, "Budějovická");
    assert.equal(company.houseNumber, "778/3a");
  });

  it("parses textovaAdresa when structured street is missing", () => {
    const parsed = parseAresTextAddress("Hlavní 12, 252 42 Jesenice");
    assert.deepEqual(parsed, {
      street: "Hlavní",
      houseNumber: "12",
      suburb: "",
      psc: "25242",
      city: "Jesenice",
    });
    const company = mapAresEntity({
      ico: "12345678",
      obchodniJmeno: "Jan Novák",
      sidlo: { textovaAdresa: "Hlavní 12, 252 42 Jesenice" },
    });
    assert.equal(company.street, "Hlavní");
    assert.equal(company.houseNumber, "12");
    assert.equal(company.city, "Jesenice");
    assert.equal(company.psc, "252 42");
  });
});

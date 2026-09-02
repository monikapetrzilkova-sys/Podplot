import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { czechVocativeFirstName, greetingFirstName } from "./czechVocative.js";

describe("czechVocativeFirstName", () => {
  it("turns feminine -a names into vocative -o", () => {
    assert.equal(czechVocativeFirstName("Monika"), "Moniko");
    assert.equal(czechVocativeFirstName("Jana"), "Jano");
    assert.equal(czechVocativeFirstName("Anna"), "Anno");
    assert.equal(czechVocativeFirstName("Lucie"), "Lucie");
    assert.equal(czechVocativeFirstName("Marie"), "Marie");
  });

  it("normalizes messy capitalization on the first name", () => {
    assert.equal(czechVocativeFirstName("MOnika Petržílková"), "Moniko");
    assert.equal(czechVocativeFirstName("MONIKA"), "Moniko");
    assert.equal(czechVocativeFirstName("monika"), "Moniko");
  });

  it("inflects common masculine names", () => {
    assert.equal(czechVocativeFirstName("Petr Novák"), "Petře");
    assert.equal(czechVocativeFirstName("Marek"), "Marku");
    assert.equal(czechVocativeFirstName("Honza"), "Honzo");
    assert.equal(czechVocativeFirstName("Jiří"), "Jiří");
  });

  it("skips academic titles and leaves empty input empty", () => {
    assert.equal(czechVocativeFirstName("Ing. Monika Petržílková"), "Moniko");
    assert.equal(czechVocativeFirstName(""), "");
    assert.equal(czechVocativeFirstName(null), "");
  });
});

describe("greetingFirstName", () => {
  it("falls back to vocative sousede", () => {
    assert.equal(greetingFirstName(""), "sousede");
    assert.equal(greetingFirstName("Monika"), "Moniko");
  });
});

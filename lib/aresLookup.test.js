import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isValidIco, normalizeIco } from "./aresLookup.mjs";

describe("IČO", () => {
  it("normalizes and checks the Czech control digit", () => {
    assert.equal(normalizeIco("27074358"), "27074358");
    assert.equal(isValidIco("27074358"), true);
    assert.equal(isValidIco("00000000"), false);
    assert.equal(isValidIco("123"), false);
  });
});

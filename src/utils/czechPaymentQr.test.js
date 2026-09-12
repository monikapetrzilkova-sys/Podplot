import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSpdString,
  formatPaymentSummary,
  toCzechIban,
} from "./czechPaymentQr.js";

describe("czechPaymentQr", () => {
  it("converts classic Czech account to IBAN", () => {
    assert.equal(toCzechIban("19-2000145399/0800"), "CZ6508000000192000145399");
  });

  it("keeps valid IBAN", () => {
    assert.equal(toCzechIban("CZ65 0800 0000 1920 0014 5399"), "CZ6508000000192000145399");
  });

  it("builds SPD payment string", () => {
    const spd = buildSpdString({
      iban: "19-2000145399/0800",
      amount: "350",
      message: "Smyslohrani",
      variableSymbol: "2026",
    });
    assert.match(spd, /^SPD\*1\.0\*ACC:CZ6508000000192000145399\*AM:350\.00\*CC:CZK/);
    assert.match(spd, /\*MSG:Smyslohrani/);
    assert.match(spd, /\*X-VS:2026/);
  });

  it("formats chat summary", () => {
    assert.equal(formatPaymentSummary({ amount: "350", message: "Akce" }), "QR platba · 350,00 Kč · Akce");
  });
});

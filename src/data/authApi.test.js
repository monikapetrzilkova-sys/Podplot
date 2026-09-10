import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  EMAIL_TAKEN_CODE,
  getPasswordStrength,
  isExistingAccountSignUp,
  validatePassword,
} from "./authApi.js";

describe("validatePassword", () => {
  it("rejects short passwords", () => {
    assert.equal(validatePassword("abc").ok, false);
  });

  it("rejects mismatched confirmation", () => {
    assert.equal(validatePassword("abcdef", "abcdeg").ok, false);
  });
});

describe("getPasswordStrength", () => {
  it("is empty when nothing is typed", () => {
    assert.equal(getPasswordStrength("").score, 0);
  });

  it("marks short passwords as weak", () => {
    assert.equal(getPasswordStrength("abc").tone, "weak");
  });

  it("rates a long mixed password as strong", () => {
    const strength = getPasswordStrength("LesniDum-42!");
    assert.ok(strength.score >= 3);
  });
});

describe("isExistingAccountSignUp", () => {
  it("detects the explicit already-registered error", () => {
    assert.equal(isExistingAccountSignUp(null, { message: "User already registered" }), true);
    assert.equal(isExistingAccountSignUp(null, { code: "user_already_exists" }), true);
  });

  it("detects a silent duplicate (empty identities)", () => {
    assert.equal(isExistingAccountSignUp({ user: { identities: [] } }, null), true);
  });

  it("allows a new signup", () => {
    assert.equal(
      isExistingAccountSignUp({ user: { identities: [{ id: "1" }] } }, null),
      false
    );
  });
});

describe("email taken code", () => {
  it("is stable for the registration UI", () => {
    assert.equal(EMAIL_TAKEN_CODE, "email_taken");
  });
});

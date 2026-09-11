import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getPodplotInviteText,
  mailtoInviteUrl,
  whatsappInviteUrl,
} from "./appInviteShare.js";

describe("appInviteShare", () => {
  it("builds invite text with app url placeholder when window is missing", () => {
    const text = getPodplotInviteText({ name: "Monika Nováková" });
    assert.match(text, /^Monika,/);
    assert.match(text, /Podplot/);
    assert.match(text, /https:\/\/podplot\.vercel\.app\//);
  });

  it("builds whatsapp and mailto links", () => {
    const text = getPodplotInviteText();
    assert.match(whatsappInviteUrl(text), /^https:\/\/wa\.me\/\?text=/);
    assert.match(mailtoInviteUrl(text), /^mailto:\?subject=/);
  });
});

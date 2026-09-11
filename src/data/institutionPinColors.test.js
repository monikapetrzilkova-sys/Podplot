import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  INSTITUTION_CATEGORY_LEGEND_COLORS,
  INSTITUTION_PIN_COLORS,
  institutionPinColorsForVariant,
} from "./institutionPinColors.js";
import { institutionPinVariant } from "./institutionsMapData.js";
import { institutionMarkerIconSvg } from "../utils/institutionPinMarkerSvg.js";

describe("institution pin palette", () => {
  it("keeps category colors inside the Podplot green family", () => {
    for (const [key, c] of Object.entries(INSTITUTION_PIN_COLORS)) {
      assert.ok(c.bg.startsWith("#"), key);
      assert.notEqual(c.bg.toLowerCase(), "#4285f4", `${key} must not use Google blue`);
      assert.notEqual(c.bg.toLowerCase(), "#f4a261", `${key} must not use old orange`);
      assert.notEqual(c.bg.toLowerCase(), "#7209b7", `${key} must not use purple`);
    }
  });

  it("maps guide categories to distinct pin colors", () => {
    const gastro = institutionPinColorsForVariant(institutionPinVariant({ category: "gastro" }));
    const shop = institutionPinColorsForVariant(institutionPinVariant({ category: "obchody" }));
    const services = institutionPinColorsForVariant(institutionPinVariant({ category: "sluzby" }));
    assert.notEqual(gastro.bg, shop.bg);
    assert.notEqual(shop.bg, services.bg);
    assert.equal(INSTITUTION_CATEGORY_LEGEND_COLORS.gastro, gastro.bg);
  });

  it("colors Google places by category, not Google blue", () => {
    const raw = institutionMarkerIconSvg({
      category: "obchody",
      isGooglePlace: true,
      name: "Albert",
    });
    const svg = decodeURIComponent(raw.replace(/^data:image\/svg\+xml;charset=UTF-8,/, ""));
    assert.ok(svg.includes(INSTITUTION_PIN_COLORS.shop.bg));
    assert.ok(!/#4285F4/i.test(svg));
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MAP_PIN_H,
  MAP_PIN_W,
  googleMapsPinIcon,
  mapPinDisplaySize,
  mapPinSvgOpenTag,
  mapPinTeardropPath,
} from "./mapPinShape.js";

function fakeMaps() {
  return {
    Size: class {
      constructor(width, height) {
        this.width = width;
        this.height = height;
      }
    },
    Point: class {
      constructor(x, y) {
        this.x = x;
        this.y = y;
      }
    },
  };
}

describe("map pin icon metrics", () => {
  it("keeps Google Maps size equal to scaledSize so the tip is not cropped", () => {
    for (const selected of [false, true]) {
      const display = mapPinDisplaySize(selected);
      const icon = googleMapsPinIcon(fakeMaps(), "data:image/svg+xml,test", selected);
      assert.equal(icon.size.width, display.w);
      assert.equal(icon.size.height, display.h);
      assert.equal(icon.scaledSize.width, icon.size.width);
      assert.equal(icon.scaledSize.height, icon.size.height);
      assert.equal(icon.anchor.x, Math.round(display.w / 2));
      assert.equal(icon.anchor.y, display.h);
    }
  });

  it("emits SVG at the same pixel size Maps will display", () => {
    const selected = mapPinDisplaySize(true);
    const tag = mapPinSvgOpenTag(true);
    assert.match(tag, new RegExp(`width="${selected.w}"`));
    assert.match(tag, new RegExp(`height="${selected.h}"`));
    assert.match(tag, new RegExp(`viewBox="0 0 ${MAP_PIN_W} ${MAP_PIN_H}"`));
  });

  it("keeps the teardrop tip inside the viewBox including stroke", () => {
    const d = mapPinTeardropPath();
    assert.match(d, /13 32\.5/);
    assert.ok(50 + 0.8 < MAP_PIN_H, "stroke at the tip must stay inside the canvas");
    assert.ok(d.includes("20 4.5"));
  });
});

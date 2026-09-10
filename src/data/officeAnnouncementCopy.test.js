import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { activePostsLabel } from "./officeAnnouncementCopy.js";

describe("activePostsLabel", () => {
  it("uses Czech plural forms", () => {
    assert.equal(activePostsLabel(0), "Žádný aktivní příspěvek");
    assert.equal(activePostsLabel(1), "1 aktivní příspěvek");
    assert.equal(activePostsLabel(3), "3 aktivní příspěvky");
    assert.equal(activePostsLabel(5), "5 aktivních příspěvků");
  });
});

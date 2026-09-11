import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  expandReportedIds,
  isReportedContent,
  reportCandidatesFromFeedItem,
} from "./reportedContent.js";

describe("reportedContent", () => {
  it("expands prefixed feed ids", () => {
    assert.deepEqual(expandReportedIds("post-f8").sort(), ["f8", "post-f8"].sort());
  });

  it("matches when report stored raw id and feed uses prefixed id", () => {
    assert.equal(isReportedContent(["f8"], "post-f8"), true);
    assert.equal(isReportedContent(["post-f8"], "f8"), true);
    assert.equal(isReportedContent(["f8"], "f9"), false);
  });

  it("hides live feed listing item after report", () => {
    const item = { id: "post-f8", kind: "listing", post: { id: "f8", title: "Kolo" } };
    const reported = expandReportedIds("f8");
    assert.equal(isReportedContent(reported, ...reportCandidatesFromFeedItem(item)), true);
  });
});

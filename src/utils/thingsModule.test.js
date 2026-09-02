import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isCommunityAnnouncementPost, isGroupFeedPost, isThingsModuleListing } from "./thingsModule.js";

const groupBoardPost = {
  boardPost: true,
  groupId: "tenis",
  groupName: "Tenis Lhotka",
  categoryId: "diskuse",
  type: "Příspěvek",
  title: "Hledám partnera na čtyřhru",
  body: "Sobota odpoledne na kurtech.",
};

describe("group feed posts vs announcements", () => {
  it("recognizes a group board post", () => {
    assert.equal(isGroupFeedPost(groupBoardPost), true);
  });

  it("does not treat a group board post as a map announcement / hlášení", () => {
    assert.equal(isCommunityAnnouncementPost(groupBoardPost), false);
  });

  it("does not treat a group board post as a things listing", () => {
    assert.equal(isThingsModuleListing(groupBoardPost), false);
  });

  it("still classifies a tip as an announcement", () => {
    assert.equal(
      isCommunityAnnouncementPost({
        type: "Tip",
        feedSubtype: "hlaseni",
        title: "Nová kavárna",
        body: "Tip: výborná káva u parku",
      }),
      true
    );
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isGroupBoardDiscussionPost,
  getGroupPosts,
  getRecentGroupPosts,
  groupPostsLocation,
  mergePostsById,
} from "./groups.js";
import { getGroupsForLocation, getMyMemberGroups } from "./locations.js";
import { rowToFeedPost } from "./communityApi.js";
import { loadGroupBoardPosts, persistGroupBoardPosts } from "./groupPostsStorage.js";

describe("group membership", () => {
  it("does not treat catalog groups as joined by default", () => {
    const catalog = [
      { id: "maminky", name: "Maminky" },
      { id: "tenis", name: "Tenis" },
    ];
    assert.deepEqual(getMyMemberGroups(catalog, []), []);
    assert.deepEqual(
      getMyMemberGroups(catalog, ["tenis"]).map((g) => g.id),
      ["tenis"]
    );
  });
});

describe("group board posts", () => {
  it("keeps explicit board posts on the group wall", () => {
    assert.equal(
      isGroupBoardDiscussionPost({ boardPost: true, groupId: "tenis" }),
      true
    );
  });

  it("does not treat marketplace listings as board posts", () => {
    assert.equal(
      isGroupBoardDiscussionPost({
        boardPost: false,
        groupId: "tenis",
        categoryId: "prodam",
        type: "Prodám",
      }),
      false
    );
  });

  it("restores legacy discussion posts that only have groupId", () => {
    assert.equal(
      isGroupBoardDiscussionPost({
        groupId: "tenis",
        categoryId: "diskuse",
        type: "Příspěvek",
      }),
      true
    );
  });

  it("shows a user tennis post on the tennis board", () => {
    const posts = getGroupPosts("tenis", [
      {
        id: "gp-user-1",
        boardPost: true,
        groupId: "tenis",
        categoryId: "diskuse",
        type: "Příspěvek",
        title: "Hledám partnera na čtyřhru",
      },
    ]);
    assert.equal(
      posts.some((p) => p.id === "gp-user-1"),
      true
    );
  });

  it("mergePostsById prefers existing and sorts newest first", () => {
    const merged = mergePostsById(
      [{ id: "a", createdAt: 1 }],
      [
        { id: "a", createdAt: 99 },
        { id: "b", createdAt: 50 },
      ]
    );
    assert.deepEqual(
      merged.map((p) => p.id),
      ["b", "a"]
    );
    assert.equal(merged.find((p) => p.id === "a").createdAt, 1);
  });

  it("rowToFeedPost restores boardPost and groupIds from payload", () => {
    const post = rowToFeedPost(
      {
        id: "gp-user-1",
        author_id: "u1",
        author_name: "Anna",
        title: "Hledám partnera na čtyřhru",
        body: "Sobota 10:00 na kurtech.",
        type: "Příspěvek",
        feed_type: "komunita",
        payload: {
          categoryId: "diskuse",
          groupId: "tenis",
          groupIds: ["tenis"],
          groupName: "Tenis",
          boardPost: true,
        },
        created_at: "2026-08-26T12:00:00.000Z",
      },
      "u1"
    );
    assert.equal(post.boardPost, true);
    assert.equal(post.groupId, "tenis");
    assert.deepEqual(post.groupIds, ["tenis"]);
    assert.equal(post.groupName, "Tenis");
    assert.equal(isGroupBoardDiscussionPost(post), true);
  });

  it("roundtrips board posts through local storage", () => {
    const store = new Map();
    globalThis.localStorage = {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => {
        store.set(key, String(value));
      },
    };
    persistGroupBoardPosts("u1", [
      { id: "gp-1", title: "Tenis v sobotu", boardPost: true, groupId: "tenis" },
    ]);
    const loaded = loadGroupBoardPosts("u1");
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0].id, "gp-1");
    assert.equal(loaded[0].groupId, "tenis");
  });
});

describe("group locality", () => {
  const jesenice = {
    id: "domov",
    municipality: "Jesenice",
    lat: 49.966,
    lng: 14.512,
    radiusKm: 7,
  };
  const brno = {
    id: "domov",
    municipality: "Brno-střed",
    lat: 49.195,
    lng: 16.608,
    radiusKm: 3,
  };
  const location = (loc) => groupPostsLocation(loc.id, loc);

  it("shows the demo Tenis catalog only in Jesenice, not in another town", () => {
    const homeGroups = getGroupsForLocation("domov", "Jesenice");
    assert.equal(homeGroups.some((g) => g.id === "tenis"), true);
    assert.equal(getGroupsForLocation("domov", "Brno-střed").some((g) => g.id === "tenis"), false);
    assert.equal(getGroupsForLocation("domov", "Jesenice u Prahy").some((g) => g.id === "tenis"), true);
  });

  it("keeps Praha work-slot catalog off a remapped home in another city", () => {
    assert.equal(getGroupsForLocation("prace", "Praha").some((g) => g.id === "praha-obedy"), true);
    assert.equal(getGroupsForLocation("prace", "Brno-střed").length, 0);
  });

  it("hides a tennis tip from another municipality on the local board", () => {
    const foreign = {
      id: "gp-user-foreign",
      boardPost: true,
      groupId: "tenis",
      categoryId: "diskuse",
      type: "Příspěvek",
      title: "Tip na trenéra",
      municipality: "Praha 1",
      locationId: "domov",
    };
    const local = {
      id: "gp-user-local",
      boardPost: true,
      groupId: "tenis",
      categoryId: "diskuse",
      type: "Příspěvek",
      title: "Kurty v Jesenici",
      municipality: "Jesenice",
      locationId: "domov",
    };
    const posts = getGroupPosts("tenis", [foreign, local], location(jesenice));
    assert.equal(posts.some((p) => p.id === "gp-user-foreign"), false);
    assert.equal(posts.some((p) => p.id === "gp-user-local"), true);
  });

  it("does not show Jesenice seed group posts in another town", () => {
    const posts = getGroupPosts("maminky", [], location(brno));
    assert.equal(posts.some((p) => p.id === "gp1"), false);
  });

  it("keeps own group posts visible even from another slot", () => {
    const mine = {
      id: "gp-user-mine",
      boardPost: true,
      groupId: "tenis",
      categoryId: "diskuse",
      type: "Příspěvek",
      title: "Hledám spoluhráče",
      municipality: "Praha 1",
      locationId: "prace",
      mine: true,
    };
    const posts = getGroupPosts("tenis", [mine], location(jesenice));
    assert.equal(posts.some((p) => p.id === "gp-user-mine"), true);
  });

  it("limits recent group posts to joined groups in the active locality", () => {
    const foreign = {
      id: "gp-user-foreign-recent",
      boardPost: true,
      groupId: "tenis",
      categoryId: "diskuse",
      type: "Příspěvek",
      title: "Tip na trenéra",
      municipality: "Praha 1",
      locationId: "domov",
    };
    const recent = getRecentGroupPosts([foreign], 5, ["tenis"], location(jesenice));
    assert.equal(recent.some((p) => p.id === "gp-user-foreign-recent"), false);
  });
});

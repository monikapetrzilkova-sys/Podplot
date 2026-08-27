import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isGroupBoardDiscussionPost,
  getGroupPosts,
  mergePostsById,
} from "./groups.js";
import { rowToFeedPost } from "./communityApi.js";
import { loadGroupBoardPosts, persistGroupBoardPosts } from "./groupPostsStorage.js";

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

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  persistUserActivity,
  loadUserActivity,
  persistActivityMerge,
  applyEventPatches,
  DEFAULT_JOINED_EVENT_IDS,
} from "./userActivityStorage.js";
import { mergeCommentsById, SEED_GROUP_POST_COMMENTS } from "./groupPostComments.js";

function mockLocalStorage() {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
  };
}

describe("user activity persistence", () => {
  it("stores joined events, comments and event chat across reload", () => {
    mockLocalStorage();
    persistUserActivity("u1", {
      joinedEventIds: ["ev-past2", "ev1"],
      comments: [
        {
          id: "gpc-user",
          postId: "gp1",
          authorId: "u1",
          authorName: "Anna",
          text: "Přidám se v úterý.",
          createdAt: 10,
        },
      ],
      eventPatches: {
        ev1: {
          chat: [{ sender: "Anna", text: "Beru deku", time: "17:01" }],
          attendees: [{ id: "u1", name: "Anna", initials: "AN" }],
          galleryPhotos: [],
        },
      },
      helpOffersByPost: {
        nh2: [{ helperId: "u1", helperName: "Anna", postTitle: "Pes" }],
      },
      myUsefulPosts: ["f2", "f9"],
    });
    persistActivityMerge("u1", { joinedEventIds: ["ev-past2", "ev1", "ev3"] });

    const loaded = loadUserActivity("u1");
    assert.deepEqual(loaded.joinedEventIds, ["ev-past2", "ev1", "ev3"]);
    assert.equal(loaded.comments[0].text, "Přidám se v úterý.");
    assert.equal(loaded.eventPatches.ev1.chat[0].text, "Beru deku");
    assert.equal(loaded.helpOffersByPost.nh2[0].helperId, "u1");
    assert.ok(loaded.myUsefulPosts.includes("f9"));
  });

  it("keeps seed comments and overlays saved ones", () => {
    const merged = mergeCommentsById(SEED_GROUP_POST_COMMENTS, [
      { id: "gpc-user", postId: "gp1", text: "Nový komentář", createdAt: 99 },
    ]);
    assert.ok(merged.some((c) => c.id === "gpc1"));
    assert.ok(merged.some((c) => c.id === "gpc-user"));
  });

  it("applies join patches onto seed events", () => {
    const events = applyEventPatches(
      [
        {
          id: "ev1",
          title: "Grilovačka",
          attendees: [{ id: "petr", name: "Petr" }],
          chat: [{ sender: "Petr", text: "Beru gril", time: "10:30" }],
        },
      ],
      {
        ev1: {
          attendees: [{ id: "u1", name: "Anna" }],
          chat: [{ sender: "Anna", text: "Jdu taky", time: "11:00" }],
        },
      },
      ["ev1"],
      { id: "u1", name: "Anna" }
    );
    assert.equal(events[0].attendees.some((a) => a.id === "u1"), true);
    assert.equal(events[0].chat.length, 2);
  });

  it("uses default joined events when nothing is stored", () => {
    mockLocalStorage();
    assert.deepEqual(loadUserActivity("fresh").joinedEventIds, DEFAULT_JOINED_EVENT_IDS);
  });
});

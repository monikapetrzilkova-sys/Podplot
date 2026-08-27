import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isHelpFeedPost,
  isEventFeedPost,
  helpItemToFeedPost,
  feedPostToHelpItem,
  eventToFeedPost,
  feedPostToEvent,
  lendingItemFromPost,
} from "./persistedFeedItems.js";
import { persistUserPosts, loadUserPosts, persistHelpPosts, loadHelpPosts, persistUserEvents, loadUserEvents } from "./userContentStorage.js";
import { isGroupBoardDiscussionPost } from "./groups.js";
import { isThingsModuleListing } from "../utils/thingsModule.js";

function mockLocalStorage() {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
  };
}

describe("all post types persist", () => {
  it("keeps things listings as marketplace posts, not help/events/groups", () => {
    const listing = {
      id: "user-1",
      categoryId: "daruji",
      type: "Daruji",
      feedType: "komunita",
      title: "Daruji židli",
    };
    assert.equal(isThingsModuleListing(listing), true);
    assert.equal(isHelpFeedPost(listing), false);
    assert.equal(isEventFeedPost(listing), false);
    assert.equal(isGroupBoardDiscussionPost({ ...listing, boardPost: false }), false);
  });

  it("roundtrips výpomoc through a feed post", () => {
    const item = {
      id: "nh-1",
      type: "hledam",
      title: "Hlídání psa",
      body: "Víkend, klidný pes.",
      author: "Anna",
      initials: "AN",
      createdAt: 100,
    };
    const post = helpItemToFeedPost(item, { id: "u1", name: "Anna", initials: "AN" });
    assert.equal(isHelpFeedPost(post), true);
    assert.equal(isThingsModuleListing(post), false);
    const back = feedPostToHelpItem(post);
    assert.equal(back.type, "hledam");
    assert.equal(back.title, "Hlídání psa");
    assert.equal(back.mine, true);
  });

  it("roundtrips an event through a feed post", () => {
    const event = {
      id: "ev-user-1",
      title: "Sraz na kurtech",
      description: "Sobota 10:00",
      organizer: "Anna",
      locationId: "domov",
      mine: true,
      createdAt: 50,
    };
    const post = eventToFeedPost(event, { id: "u1", name: "Anna" });
    assert.equal(isEventFeedPost(post), true);
    assert.equal(isThingsModuleListing(post), false);
    const back = feedPostToEvent(post);
    assert.equal(back.title, "Sraz na kurtech");
    assert.equal(back.mine, true);
  });

  it("rebuilds a půjčovna catalog item from a listing post", () => {
    const lending = lendingItemFromPost({
      id: "user-2",
      categoryId: "pujcovna",
      type: "Půjčovna",
      title: "Vrtačka",
      body: "Na den",
      listingPrice: 80,
      mine: true,
    });
    assert.equal(lending.item, "Vrtačka");
    assert.equal(lending.credits, 80);
  });

  it("stores listings, help and events in local storage", () => {
    mockLocalStorage();
    persistUserPosts("u1", [{ id: "p1", title: "Daruji židli", categoryId: "daruji", createdAt: 3 }]);
    persistHelpPosts("u1", [
      { id: "h1", title: "Hlídání", mine: true, createdAt: 2 },
      { id: "seed", title: "Mock", mine: false, createdAt: 1 },
    ]);
    persistUserEvents("u1", [
      { id: "e1", title: "Grilovačka", mine: true, createdAt: 4 },
      { id: "ev1", title: "Seed", mine: false },
    ]);
    assert.equal(loadUserPosts("u1")[0].title, "Daruji židli");
    assert.deepEqual(
      loadHelpPosts("u1").map((h) => h.id),
      ["h1"]
    );
    assert.deepEqual(
      loadUserEvents("u1").map((e) => e.id),
      ["e1"]
    );
  });
});

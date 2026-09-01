import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isHelpFeedPost,
  isEventFeedPost,
  isActivityFeedPost,
  helpItemToFeedPost,
  feedPostToHelpItem,
  eventToFeedPost,
  feedPostToEvent,
  hostedActivityToFeedPost,
  feedPostToHostedActivity,
  isHostedActivityFeedPost,
  lendingItemFromPost,
  commentToFeedPost,
  feedPostToComment,
  eventJoinToFeedPost,
  feedPostToEventJoin,
  eventChatToFeedPost,
  collectActivityFromPosts,
  COMMENT_FEED_SUBTYPE,
  EVENT_JOIN_FEED_SUBTYPE,
} from "./persistedFeedItems.js";
import { persistUserPosts, loadUserPosts, persistHelpPosts, loadHelpPosts, persistUserEvents, loadUserEvents, persistUserHostedActivities, loadUserHostedActivities } from "./userContentStorage.js";
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
      hostedActivityId: "act-1",
      mine: true,
      createdAt: 50,
    };
    const post = eventToFeedPost(event, { id: "u1", name: "Anna" });
    assert.equal(isEventFeedPost(post), true);
    assert.equal(isThingsModuleListing(post), false);
    const back = feedPostToEvent(post);
    assert.equal(back.title, "Sraz na kurtech");
    assert.equal(back.mine, true);
    assert.equal(back.hostedActivityId, "act-1");
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

  it("roundtrips a kroužek through a feed post and does not treat it as a listing or event", () => {
    const activity = {
      id: "act-1",
      title: "Smyslohranní",
      description: "Batolata",
      hostName: "Marie K.",
      placeName: "MC Pohádka",
      locationId: "domov",
      mine: true,
      createdAt: 9,
    };
    const post = hostedActivityToFeedPost(activity, { id: "u1", name: "Marie K." });
    assert.equal(isHostedActivityFeedPost(post), true);
    assert.equal(isEventFeedPost(post), false);
    assert.equal(isHelpFeedPost(post), false);
    assert.equal(isActivityFeedPost(post), false);
    assert.equal(isThingsModuleListing(post), false);
    const back = feedPostToHostedActivity(post);
    assert.equal(back.title, "Smyslohranní");
    assert.equal(back.placeName, "MC Pohádka");
    assert.equal(back.mine, true);
  });

  it("does not wipe stored kroužky or events when persist gets an empty list", () => {
    mockLocalStorage();
    persistUserHostedActivities("u1", [{ id: "act-1", title: "Smyslohranní", mine: true, createdAt: 1 }]);
    persistUserEvents("u1", [{ id: "e1", title: "Termín", mine: true, hostedActivityId: "act-1", createdAt: 2 }]);
    persistUserHostedActivities("u1", []);
    persistUserEvents("u1", []);
    assert.deepEqual(loadUserHostedActivities("u1").map((a) => a.id), ["act-1"]);
    assert.deepEqual(loadUserEvents("u1").map((e) => e.id), ["e1"]);
    persistUserHostedActivities("u1", [], { replaceEmpty: true });
    persistUserEvents("u1", [], { replaceEmpty: true });
    assert.deepEqual(loadUserHostedActivities("u1"), []);
    assert.deepEqual(loadUserEvents("u1"), []);
  });

  it("roundtrips a group comment without treating it as a listing or event", () => {
    const comment = {
      id: "gpc-9",
      postId: "gp1",
      authorId: "u1",
      authorName: "Anna",
      authorInitials: "AN",
      text: "Jdu taky, díky za tip.",
      createdAt: 42,
    };
    const post = commentToFeedPost(comment, { id: "u1", name: "Anna", initials: "AN" });
    assert.equal(post.feedSubtype, COMMENT_FEED_SUBTYPE);
    assert.equal(isActivityFeedPost(post), true);
    assert.equal(isHelpFeedPost(post), false);
    assert.equal(isEventFeedPost(post), false);
    assert.equal(isThingsModuleListing(post), false);
    const back = feedPostToComment(post);
    assert.equal(back.postId, "gp1");
    assert.equal(back.text, "Jdu taky, díky za tip.");
  });

  it("roundtrips jdu na akci without creating a duplicate event", () => {
    const post = eventJoinToFeedPost("ev1", "Sousedská grilovačka", {
      id: "u1",
      name: "Anna",
      initials: "AN",
    });
    assert.equal(post.feedSubtype, EVENT_JOIN_FEED_SUBTYPE);
    assert.equal(isActivityFeedPost(post), true);
    assert.equal(isEventFeedPost(post), false);
    const back = feedPostToEventJoin(post);
    assert.equal(back.eventId, "ev1");
    assert.equal(back.attendee.id, "u1");
  });

  it("collects joins, comments and event chat from remote activity posts", () => {
    const commentPost = commentToFeedPost(
      { id: "c1", postId: "gp1", text: "Ahoj", createdAt: 1, authorName: "Anna" },
      { id: "u1", name: "Anna" }
    );
    const joinPost = eventJoinToFeedPost("ev1", "Grilovačka", { id: "u1", name: "Anna", initials: "AN" });
    const chatPost = eventChatToFeedPost(
      "ev1",
      { sender: "Anna", text: "Beru salát", time: "12:00" },
      { id: "u1", name: "Anna" }
    );
    const collected = collectActivityFromPosts([commentPost, joinPost, chatPost]);
    assert.equal(collected.comments[0].text, "Ahoj");
    assert.deepEqual(collected.myJoinedEventIds, ["ev1"]);
    assert.equal(collected.chatsByEvent.ev1[0].text, "Beru salát");
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  activityVenueLabel,
  filterEventsByKind,
  isHostedActivityEvent,
  activitiesForPlace,
  reconstructActivitiesFromEvents,
} from "./hostedActivities.js";

describe("hostedActivities", () => {
  it("labels venue by kind", () => {
    assert.equal(activityVenueLabel({ venueKind: "place", placeName: "MC Pohádka" }), "MC Pohádka");
    assert.equal(activityVenueLabel({ venueKind: "outdoor", address: "Park Na Louce" }), "Park Na Louce");
    assert.equal(activityVenueLabel({ venueKind: "outdoor" }), "Venku");
  });

  it("filters calendar by kind", () => {
    const events = [{ id: "a" }, { id: "b", hostedActivityId: "act-1" }];
    assert.equal(filterEventsByKind(events, "krouzky").length, 1);
    assert.equal(filterEventsByKind(events, "jednorazove").length, 1);
    assert.equal(filterEventsByKind(events, "all").length, 2);
    assert.equal(isHostedActivityEvent(events[1]), true);
  });

  it("finds activities hosted at a place", () => {
    const list = [
      { id: "1", placeId: "inst-mc-pohadka" },
      { id: "2", placeId: "inst-skola1" },
    ];
    assert.deepEqual(
      activitiesForPlace(list, "inst-mc-pohadka").map((a) => a.id),
      ["1"]
    );
  });

  it("rebuilds a club card from leftover calendar dates", () => {
    const rebuilt = reconstructActivitiesFromEvents(
      [
        {
          hostedActivityId: "act-1",
          title: "Smyslohranní",
          address: "MC Pohádka",
          organizer: "Marie K.",
          mine: true,
        },
      ],
      new Set()
    );
    assert.equal(rebuilt[0].id, "act-1");
    assert.equal(rebuilt[0].title, "Smyslohranní");
    assert.equal(rebuilt[0].hostName, "Marie K.");
  });
});

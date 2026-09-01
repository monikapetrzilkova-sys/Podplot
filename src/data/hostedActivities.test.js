import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  activityVenueLabel,
  filterEventsByKind,
  isHostedActivityEvent,
  activitiesForPlace,
  upcomingWeekdayDates,
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

  it("lists upcoming weekdays", () => {
    const from = new Date(2026, 8, 1, 10, 0, 0);
    const dates = upcomingWeekdayDates(3, 4, from);
    assert.equal(dates[0], "2026-09-02");
    assert.equal(dates.length, 4);
  });
});

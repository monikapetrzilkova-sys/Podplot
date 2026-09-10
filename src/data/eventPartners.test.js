import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeEventPartners,
  eventHasPartner,
  upsertEventPartner,
  partnerFromPlace,
  partnerFromActivity,
  partnerFromGroup,
} from "./eventPartners.js";

describe("eventPartners", () => {
  it("keeps unique named partners and drops empty rows", () => {
    const list = normalizeEventPartners([
      { id: "sp1", kind: "podnik", name: "U Ráje" },
      { id: "sp1", kind: "podnik", name: "U Ráje znovu" },
      { id: "", name: "Nic" },
      { id: "maminky", kind: "sdruzeni", name: "Maminky" },
    ]);
    assert.deepEqual(
      list.map((p) => p.id),
      ["sp1", "maminky"]
    );
  });

  it("detects a tagged business by place id or name", () => {
    const event = {
      partners: [{ id: "sp3", kind: "podnik", name: "Kavárna Na Louce", placeId: "sp3" }],
    };
    assert.equal(eventHasPartner(event, { placeId: "sp3" }), true);
    assert.equal(eventHasPartner(event, { name: "Kavárna Na Louce" }), true);
    assert.equal(eventHasPartner(event, { id: "sp1" }), false);
  });

  it("maps catalog, kroužek and group into partner records", () => {
    assert.equal(partnerFromPlace({ id: "sp1", name: "U Ráje", accountType: "podnik" }).kind, "podnik");
    assert.equal(partnerFromPlace({ id: "inst-1", name: "Úřad", category: "instituce" }).kind, "instituce");
    assert.equal(partnerFromActivity({ id: "act-1", title: "Jóga" }).kind, "krouzek");
    assert.equal(partnerFromGroup({ id: "zahradkari", name: "Zahrádkáři" }).kind, "sdruzeni");
    assert.deepEqual(
      upsertEventPartner([], { id: "sp1", kind: "podnik", name: "U Ráje" }).map((p) => p.id),
      ["sp1"]
    );
  });
});

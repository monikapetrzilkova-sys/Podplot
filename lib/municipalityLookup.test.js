import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseRuianAddress,
  officeSearchTargets,
  shortlistMunicipalEntities,
  mapOfficeName,
  officeKind,
  cityMatches,
  isCityWideCapitalOffice,
  isPostalCityLabel,
  isStatutoryCityName,
} from "./municipalityLookup.mjs";

describe("parseRuianAddress", () => {
  it("reads Prague postal city and neighborhood", () => {
    const parsed = parseRuianAddress("Donovalská 2222, Chodov, 14900 Praha 4");
    assert.deepEqual(parsed, {
      street: "Donovalská 2222",
      part: "Chodov",
      psc: "14900",
      postalCity: "Praha 4",
    });
  });
});

describe("officeSearchTargets", () => {
  it("uses official RÚIAN districts, not the postal label Praha 4", () => {
    const targets = officeSearchTargets("14900", {
      districts: ["Praha 11", "Praha-Šeberov"],
      obce: ["Jesenice"],
    });
    assert.deepEqual(
      targets.map((t) => t.name),
      ["Praha 11", "Praha-Šeberov", "Jesenice"]
    );
    assert.equal(targets[0].type, "mestska_cast");
    assert.ok(!targets.some((t) => t.name === "Praha 4" || t.name === "Praha"));
  });

  it("falls back to the Prague ZIP map only when RÚIAN found no district", () => {
    const targets = officeSearchTargets("14900", { districts: [], obce: [] });
    assert.deepEqual(targets, [{ name: "Praha 11", type: "mestska_cast" }]);
  });

  it("still finds a regular town office outside Prague", () => {
    const targets = officeSearchTargets("25242", { districts: [], obce: ["Jesenice", "Vestec"] });
    assert.deepEqual(targets, [
      { name: "Jesenice", type: "obec" },
      { name: "Vestec", type: "obec" },
    ]);
  });

  it("does not treat Praha / Brno as an obec when a district exists", () => {
    const targets = officeSearchTargets("14000", { districts: ["Praha 4"], obce: ["Praha", "Praha 4"] });
    assert.deepEqual(targets, [{ name: "Praha 4", type: "mestska_cast" }]);
  });
});

describe("shortlistMunicipalEntities", () => {
  const praha11 = {
    ico: "00231126",
    obchodniJmeno: "Městská část Praha 11",
    sidlo: { psc: 14900, nazevObce: "Praha", nazevMestskeCastiObvodu: "Praha 11" },
  };
  const praha4 = {
    ico: "00063584",
    obchodniJmeno: "Městská část Praha 4",
    sidlo: { psc: 14000, nazevObce: "Praha", nazevMestskeCastiObvodu: "Praha 4" },
  };
  const magistrat = {
    ico: "00064581",
    obchodniJmeno: "HLAVNÍ MĚSTO PRAHA",
    sidlo: { psc: 11000, nazevObce: "Praha", nazevMestskeCastiObvodu: "Praha 1" },
  };
  const jesenice = {
    ico: "00241318",
    obchodniJmeno: "Město Jesenice",
    sidlo: { psc: 25242, nazevObce: "Jesenice" },
  };

  it("keeps the district office with matching PSČ and drops the magistrát", () => {
    const picked = shortlistMunicipalEntities([praha11, magistrat], {
      psc: "14900",
      targetName: "Praha 11",
    });
    assert.deepEqual(
      picked.map((row) => row.ico),
      ["00231126"]
    );
  });

  it("keeps a district office whose seat PSČ differs, when RÚIAN says the addresses belong there", () => {
    const picked = shortlistMunicipalEntities([praha4], {
      psc: "14100",
      targetName: "Praha 4",
      allowNameMatch: true,
    });
    assert.deepEqual(
      picked.map((row) => row.ico),
      ["00063584"]
    );
  });

  it("does not fall back to Jesenice for a Prague district PSČ", () => {
    const picked = shortlistMunicipalEntities([jesenice], {
      psc: "14900",
      targetName: "Jesenice",
    });
    assert.deepEqual(picked, []);
  });

  it("recognizes a city-wide office", () => {
    assert.equal(isCityWideCapitalOffice(magistrat), true);
    assert.equal(isCityWideCapitalOffice({ obchodniJmeno: "Statutární město Brno" }), true);
    assert.equal(isCityWideCapitalOffice(praha11), false);
  });
});

describe("office labels", () => {
  it("names a municipal district office", () => {
    assert.equal(mapOfficeName("Městská část Praha 11", "Praha 11", "801"), "Úřad městské části Praha 11");
    assert.equal(officeKind("Městská část Praha 11", "801"), "mestska_cast");
    assert.equal(
      cityMatches(
        {
          obchodniJmeno: "Městská část Praha 11",
          sidlo: { nazevObce: "Praha", nazevMestskeCastiObvodu: "Praha 11" },
        },
        "Praha 11"
      ),
      true
    );
  });

  it("tells postal labels from real municipalities", () => {
    assert.equal(isPostalCityLabel("Praha 4"), true);
    assert.equal(isPostalCityLabel("Jesenice"), false);
    assert.equal(isStatutoryCityName("Praha"), true);
    assert.equal(isStatutoryCityName("Praha 11"), false);
  });
});

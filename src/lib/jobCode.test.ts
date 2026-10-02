import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { beirutMonth, commercialTerm, describeJob, generateTagCode, isJobCode, isParentCode, jobCode } from "./jobCode.ts";

const bdf = { name: "Beirut Duty Free", code: "BDF" };
const soc = { name: "Social media and content", code: "SOC" };
const SEPT = new Date("2026-09-21T10:00:00Z");

describe("isJobCode (spec section 5)", () => {
  it("accepts the spec's valid examples", () => {
    for (const code of [
      "BDF-0926-SOC-SeptemberPromotions",
      "WB-0926-PRD-AarousTVC",
      "CAN-0926-STR-ScopeOfWork",
      "BDF-0326-ADV-SummerCampaign-TVC",
    ]) {
      assert.equal(isJobCode(code), true, code);
    }
  });

  it("rejects the spec's invalid examples", () => {
    for (const code of [
      "CANDIA-0926-STR-ScopeOfWork",
      "BDF-926-SOC-Promo",
      "BDF-0926-DESIGN-Promo",
      "BDF-0926-SOC-september promo",
      "BDF-0926-SOC-Promo-Story-Reel",
    ]) {
      assert.equal(isJobCode(code), false, code);
    }
  });

  it("rejects en dashes, underscores and impossible months", () => {
    assert.equal(isJobCode("BDF–0926–SOC–Promo"), false);
    assert.equal(isJobCode("BDF_0926_SOC_Promo"), false);
    assert.equal(isJobCode("BDF-1326-SOC-Promo"), false);
    assert.equal(isJobCode("BDF-0026-SOC-Promo"), false);
  });

  it("tells parents from sub-jobs", () => {
    assert.equal(isParentCode("BDF-0326-ADV-SummerCampaign"), true);
    assert.equal(isParentCode("BDF-0326-ADV-SummerCampaign-TVC"), false);
  });
});

describe("describeJob (rule 3)", () => {
  it("CamelCases the name and drops filler words", () => {
    assert.equal(describeJob("summer campaign v2 final"), "SummerCampaign");
    assert.equal(describeJob("September promotions"), "SeptemberPromotions");
    assert.equal(describeJob("Aarous TVC"), "AarousTVC");
    assert.equal(describeJob("scope of work (NEW draft)"), "ScopeOfWork");
  });

  it("moves leading numbers to the end, since a description starts with a letter", () => {
    assert.equal(describeJob("2026 calendar"), "Calendar2026");
    assert.equal(describeJob("Q3 2026 report"), "Q32026Report");
  });

  it("strips punctuation and accents", () => {
    assert.equal(describeJob("Dr. Dan's clinic – café launch!"), "DrDansClinicCafeLaunch");
  });

  it("stops at a word boundary within the limit", () => {
    const d = describeJob("International airport duty free summer campaign rollout plan");
    assert.equal(d, "InternationalAirportDutyFreeSummer");
    assert.ok(d.length <= 40);
    assert.equal(describeJob("a".repeat(50)).length, 40);
  });
});

describe("beirutMonth (rule 1)", () => {
  it("uses Beirut time, not UTC", () => {
    // 22:30 UTC on 31 Aug is already 1 Sep in Beirut.
    assert.equal(beirutMonth(new Date("2026-08-31T22:30:00Z")), "0926");
    assert.equal(beirutMonth(new Date("2026-03-02T09:00:00Z")), "0326");
  });
});

describe("commercialTerm (rule 6)", () => {
  it("finds prices and commercial terms", () => {
    assert.equal(commercialTerm("Promo shoot $2,500"), "$");
    assert.equal(commercialTerm("Send budget to client"), "budget");
    assert.equal(commercialTerm("Invoice 1200 USD"), "USD");
  });
  it("leaves ordinary names alone", () => {
    assert.equal(commercialTerm("Summer campaign 2026 TVC"), null);
    assert.equal(commercialTerm("Send the quote and invoice"), null);
  });
});

describe("jobCode", () => {
  it("generates CLIENT-MMYY-TYPE-Description from the task name", () => {
    assert.deepEqual(jobCode({ client: bdf, type: soc, name: "September promotions (final)", openedAt: SEPT }), {
      code: "BDF-0926-SOC-SeptemberPromotions",
      missing: [],
    });
  });

  it("adds one segment to the parent for a sub-job, keeping the parent's month", () => {
    const sub = jobCode({ client: undefined, type: undefined, name: "TVC", openedAt: SEPT, parent: "BDF-0326-ADV-SummerCampaign" });
    assert.equal(sub.code, "BDF-0326-ADV-SummerCampaign-TVC");
  });

  it("never goes two segments deep", () => {
    const sub = jobCode({ client: bdf, type: soc, name: "Reel", openedAt: SEPT, parent: "BDF-0926-SOC-Promo-Story" });
    assert.equal(sub.code, null);
  });

  it("says what is missing instead of guessing", () => {
    assert.deepEqual(jobCode({ client: undefined, type: undefined, name: "", openedAt: SEPT }).missing, [
      "a client",
      "a type of work",
      "a task name",
    ]);
    assert.deepEqual(jobCode({ client: { name: "Naturea", code: null }, type: soc, name: "Promo", openedAt: SEPT }).missing, [
      "a code for Naturea",
    ]);
    assert.deepEqual(jobCode({ client: bdf, type: soc, name: "2026", openedAt: SEPT }).missing, [
      "a task name with a word in it, not only numbers",
    ]);
  });
});

describe("generateTagCode", () => {
  it("makes client codes from initials, or a single word's first letters", () => {
    assert.equal(generateTagCode("Wooden Bakery", "client", []), "WB");
    assert.equal(generateTagCode("Beirut Duty Free", "client", []), "BDF");
    assert.equal(generateTagCode("Candia", "client", []), "CAN");
    assert.equal(generateTagCode("GEMS", "client", []), "GEM");
    assert.equal(generateTagCode("The Source", "client", []), "SOU");
    assert.equal(generateTagCode("Café Nour", "client", []), "CN");
  });

  it("makes type codes from the first letter and following consonants", () => {
    assert.equal(generateTagCode("Training", "type", []), "TRN");
    assert.equal(generateTagCode("Strategy, planning, scope", "type", []), "STR");
  });

  it("steps to another code when one is taken", () => {
    assert.equal(generateTagCode("Wooden Bakery", "client", ["WB"]), "WOO");
    assert.equal(generateTagCode("Candia", "client", ["CAN"]), "CND");
    assert.equal(generateTagCode("Training", "type", ["TRN", "TRA"]), "TRI");
  });

  it("gives up only on names without letters", () => {
    assert.equal(generateTagCode("2026", "client", []), null);
    assert.equal(generateTagCode("X", "client", []), "XAA");
  });
});

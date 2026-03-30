import {
  clampLandingTeamSize,
  getLandingGrowthDisplayPrice,
  getLandingStarterDisplayPrice
} from "@/lib/landing-pricing";

describe("landing pricing", () => {
  it("uses the shared free starter pricing", () => {
    expect(getLandingStarterDisplayPrice("monthly")).toEqual({
      amount: "$0",
      cadence: "/month",
      note: null
    });
  });

  it("uses the shared growth headline pricing", () => {
    expect(getLandingGrowthDisplayPrice("monthly")).toEqual({
      amount: "$29",
      cadence: "/month",
      note: "1-3 members, then volume pricing from $8/member/month"
    });

    expect(getLandingGrowthDisplayPrice("annual")).toEqual({
      amount: "$290",
      cadence: "/year",
      note: "1-3 members, then volume pricing from $80/member/year"
    });
  });

  it("clamps landing team sizes into the supported range", () => {
    expect(clampLandingTeamSize(0)).toBe(1);
    expect(clampLandingTeamSize(71)).toBe(50);
  });
});

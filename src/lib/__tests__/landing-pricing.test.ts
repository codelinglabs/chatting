import {
  clampLandingProTeamSize,
  getLandingFreePrice,
  getLandingProPricingQuote,
  getLandingStarterPrice
} from "@/lib/landing-pricing";

describe("landing pricing", () => {
  it("keeps the free plan at zero with the reduced team and conversation caps", () => {
    expect(getLandingFreePrice()).toEqual({
      totalLabel: "$0",
      cadenceLabel: "/month",
      yearlyNote: null
    });
  });

  it("keeps starter pricing fixed for small teams", () => {
    expect(getLandingStarterPrice("monthly")).toEqual({
      totalLabel: "$29",
      cadenceLabel: "/month",
      yearlyNote: null
    });

    expect(getLandingStarterPrice("yearly")).toEqual({
      totalLabel: "$290",
      cadenceLabel: "/year",
      yearlyNote: "$290/year (2 months free)"
    });
  });

  it("calculates pro monthly pricing tiers", () => {
    expect(getLandingProPricingQuote(8, "monthly")).toMatchObject({
      teamLabel: "8 team members",
      totalLabel: "$64",
      perUserLabel: "$8 per user",
      savingsLabel: null
    });

    expect(getLandingProPricingQuote(10, "monthly")).toMatchObject({
      totalLabel: "$70",
      perUserLabel: "$7 per user",
      savingsLabel: "You save $10/mo"
    });

    expect(getLandingProPricingQuote(25, "monthly")).toMatchObject({
      totalLabel: "$150",
      perUserLabel: "$6 per user",
      savingsLabel: "You save $50/mo"
    });
  });

  it("calculates pro yearly pricing tiers", () => {
    expect(getLandingProPricingQuote(8, "yearly")).toMatchObject({
      totalLabel: "$640",
      cadenceLabel: "/year",
      perUserLabel: "$80 per user/year",
      savingsLabel: null
    });

    expect(getLandingProPricingQuote(15, "yearly")).toMatchObject({
      totalLabel: "$1,050",
      perUserLabel: "$70 per user/year",
      savingsLabel: "You save $150/year"
    });
  });

  it("clamps pro team sizes into the supported range", () => {
    expect(clampLandingProTeamSize(1)).toBe(4);
    expect(clampLandingProTeamSize(71)).toBe(50);
  });
});

import {
  formatBillingPriceLabel,
  formatSeatTotalLabel,
  getBillingDisplayPrice,
  getBillingPlanDefinition
} from "@/lib/billing-plans";

describe("billing plans", () => {
  it("defines starter as a one-seat free plan", () => {
    const starter = getBillingPlanDefinition("starter");

    expect(starter.seatLimit).toBe(1);
    expect(starter.marketingFeatures).toContain("1 team member");
    expect(starter.marketingFeatures).not.toContain("Basic analytics");
    expect(starter.marketingFeatures).not.toContain("Chatting branding");
  });

  it("keeps growth features aligned with the shared pricing cards", () => {
    const growth = getBillingPlanDefinition("growth");

    expect(growth.marketingFeatures).toContain("API access");
    expect(growth.marketingFeatures).not.toContain("Volume pricing from $6/member after that");
  });

  it("describes growth pricing with tiered member pricing", () => {
    expect(formatBillingPriceLabel("growth", "monthly")).toBe(
      "$20/month for 1-3 members, then $6/member from 4-9, $5/member from 10-24, and $4/member from 25-49"
    );
    expect(getBillingDisplayPrice("growth", "monthly")).toEqual({
      amount: "$20",
      cadence: "/month",
      note: "1-3 members, then volume pricing from $6/member/month"
    });
  });

  it("calculates growth totals across the pricing tiers", () => {
    expect(formatSeatTotalLabel("growth", "monthly", 1)).toBe("1 member - $20/month");
    expect(formatSeatTotalLabel("growth", "monthly", 3)).toBe("3 members - $20/month");
    expect(formatSeatTotalLabel("growth", "monthly", 4)).toBe("4 members - $24/month");
    expect(formatSeatTotalLabel("growth", "monthly", 12)).toBe("12 members - $60/month");
    expect(formatSeatTotalLabel("growth", "annual", 26)).toBe("26 members - $1,040/year");
    expect(formatSeatTotalLabel("growth", "annual", 50)).toBe("50+ members - Contact us");
  });
});

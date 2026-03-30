import { isBillingTrialExtensionEligible } from "@/lib/billing-trials";

describe("billing trial eligibility", () => {
  it("allows extension for an active locally seeded growth trial", () => {
    expect(
      isBillingTrialExtensionEligible({
        planKey: "growth",
        subscriptionStatus: null,
        stripeSubscriptionId: null,
        trialEndsAt: "2099-04-12T12:00:00.000Z",
        trialExtensionUsedAt: null,
        siteCount: 2,
        conversationCount: 3,
        usedSeats: 1
      })
    ).toBe(true);
  });

  it("blocks extension after the local trial was already extended", () => {
    expect(
      isBillingTrialExtensionEligible({
        planKey: "growth",
        subscriptionStatus: null,
        stripeSubscriptionId: null,
        trialEndsAt: "2099-04-12T12:00:00.000Z",
        trialExtensionUsedAt: "2026-03-30T12:00:00.000Z",
        siteCount: 2,
        conversationCount: 3,
        usedSeats: 1
      })
    ).toBe(false);
  });
});

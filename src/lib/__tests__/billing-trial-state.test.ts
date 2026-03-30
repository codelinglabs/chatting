import { getEffectiveBillingSubscriptionStatus, isLocalGrowthTrialActive } from "@/lib/billing-trial-state";

describe("billing trial state", () => {
  it("treats local growth trials without a stripe subscription as active before expiry", () => {
    expect(
      isLocalGrowthTrialActive(
        {
          planKey: "growth",
          stripeSubscriptionId: null,
          trialEndsAt: "2026-04-12T12:00:00.000Z"
        },
        new Date("2026-03-29T12:00:00.000Z")
      )
    ).toBe(true);
  });

  it("treats the trial as inactive once a stripe subscription exists or the trial expires", () => {
    expect(
      isLocalGrowthTrialActive(
        {
          planKey: "growth",
          stripeSubscriptionId: "sub_123",
          trialEndsAt: "2026-04-12T12:00:00.000Z"
        },
        new Date("2026-03-29T12:00:00.000Z")
      )
    ).toBe(false);

    expect(
      isLocalGrowthTrialActive(
        {
          planKey: "growth",
          stripeSubscriptionId: null,
          trialEndsAt: "2026-03-01T12:00:00.000Z"
        },
        new Date("2026-03-29T12:00:00.000Z")
      )
    ).toBe(false);
  });

  it("maps a local active growth trial to an effective trialing subscription status", () => {
    expect(
      getEffectiveBillingSubscriptionStatus(
        {
          planKey: "growth",
          subscriptionStatus: null,
          stripeSubscriptionId: null,
          trialEndsAt: "2026-04-12T12:00:00.000Z"
        },
        new Date("2026-03-29T12:00:00.000Z")
      )
    ).toBe("trialing");

    expect(
      getEffectiveBillingSubscriptionStatus(
        {
          planKey: "growth",
          subscriptionStatus: "active",
          stripeSubscriptionId: "sub_123",
          trialEndsAt: "2026-04-12T12:00:00.000Z"
        },
        new Date("2026-03-29T12:00:00.000Z")
      )
    ).toBe("active");
  });
});

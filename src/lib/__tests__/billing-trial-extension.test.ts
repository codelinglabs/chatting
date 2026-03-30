const mocks = vi.hoisted(() => ({
  ensureOwnerGrowthTrialBillingAccount: vi.fn(),
  extendStripeTrial: vi.fn(),
  upsertBillingAccountRow: vi.fn()
}));

vi.mock("@/lib/billing-default-account", () => ({
  ensureOwnerGrowthTrialBillingAccount: mocks.ensureOwnerGrowthTrialBillingAccount
}));

vi.mock("@/lib/stripe-billing", () => ({
  extendStripeTrial: mocks.extendStripeTrial
}));

vi.mock("@/lib/repositories/billing-repository", () => ({
  upsertBillingAccountRow: mocks.upsertBillingAccountRow
}));

import { extendBillingTrial } from "@/lib/billing-trial-extension";

describe("billing trial extension", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extends a local growth trial without requiring stripe", async () => {
    mocks.ensureOwnerGrowthTrialBillingAccount.mockResolvedValueOnce({
      user_id: "user_123",
      plan_key: "growth",
      billing_interval: "monthly",
      seat_quantity: 1,
      next_billing_date: "2099-04-12T12:00:00.000Z",
      stripe_customer_id: "cus_123",
      stripe_subscription_id: null,
      stripe_price_id: null,
      stripe_status: null,
      stripe_current_period_end: null,
      trial_started_at: "2099-03-29T12:00:00.000Z",
      trial_ends_at: "2099-04-12T12:00:00.000Z",
      trial_extension_used_at: null,
      created_at: "2099-03-29T12:00:00.000Z",
      updated_at: "2099-03-29T12:00:00.000Z"
    });

    const result = await extendBillingTrial("user_123", 7);

    expect(mocks.extendStripeTrial).not.toHaveBeenCalled();
    expect(mocks.upsertBillingAccountRow).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_123",
        planKey: "growth",
        stripeCustomerId: "cus_123",
        trialStartedAt: "2099-03-29T12:00:00.000Z",
        trialEndsAt: "2099-04-19T12:00:00.000Z"
      })
    );
    expect(result).toEqual({ trialEndsAt: "2099-04-19T12:00:00.000Z" });
  });

  it("delegates to stripe when a subscription already exists", async () => {
    mocks.ensureOwnerGrowthTrialBillingAccount.mockResolvedValueOnce({
      stripe_subscription_id: "sub_123"
    });
    mocks.extendStripeTrial.mockResolvedValueOnce({ trialEndsAt: "2099-04-19T12:00:00.000Z" });

    await expect(extendBillingTrial("user_123", 7, 3)).resolves.toEqual({
      trialEndsAt: "2099-04-19T12:00:00.000Z"
    });

    expect(mocks.extendStripeTrial).toHaveBeenCalledWith("user_123", 7, 3);
  });
});

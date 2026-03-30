const mocks = vi.hoisted(() => ({
  findBillingAccountRow: vi.fn(),
  upsertBillingAccountRow: vi.fn()
}));

vi.mock("@/lib/repositories/billing-repository", () => ({
  findBillingAccountRow: mocks.findBillingAccountRow,
  upsertBillingAccountRow: mocks.upsertBillingAccountRow
}));

import {
  buildDefaultGrowthTrialBillingAccount,
  ensureOwnerGrowthTrialBillingAccount
} from "@/lib/billing-default-account";

describe("billing default account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds a growth trial billing row by default", () => {
    const account = buildDefaultGrowthTrialBillingAccount("user_123", new Date("2026-03-29T12:00:00.000Z"));

    expect(account).toMatchObject({
      user_id: "user_123",
      plan_key: "growth",
      billing_interval: "monthly",
      seat_quantity: 1,
      next_billing_date: "2026-04-12T12:00:00.000Z",
      trial_started_at: "2026-03-29T12:00:00.000Z",
      trial_ends_at: "2026-04-12T12:00:00.000Z"
    });
  });

  it("reuses an existing billing row instead of replacing it", async () => {
    const existing = {
      user_id: "user_123",
      plan_key: "starter",
      billing_interval: "monthly",
      seat_quantity: 1,
      next_billing_date: null,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      stripe_price_id: null,
      stripe_status: null,
      stripe_current_period_end: null,
      trial_started_at: null,
      trial_ends_at: null,
      trial_extension_used_at: null,
      created_at: "2026-03-01T00:00:00.000Z",
      updated_at: "2026-03-01T00:00:00.000Z"
    };
    mocks.findBillingAccountRow.mockResolvedValueOnce(existing);

    await expect(ensureOwnerGrowthTrialBillingAccount("user_123")).resolves.toBe(existing);
    expect(mocks.upsertBillingAccountRow).not.toHaveBeenCalled();
  });

  it("creates a growth trial row when the owner has no billing account yet", async () => {
    mocks.findBillingAccountRow.mockResolvedValueOnce(null);

    const account = await ensureOwnerGrowthTrialBillingAccount("user_123", new Date("2026-03-29T12:00:00.000Z"));

    expect(mocks.upsertBillingAccountRow).toHaveBeenCalledWith({
      userId: "user_123",
      planKey: "growth",
      billingInterval: "monthly",
      seatQuantity: 1,
      nextBillingDate: "2026-04-12T12:00:00.000Z",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeStatus: null,
      stripeCurrentPeriodEnd: null,
      trialStartedAt: "2026-03-29T12:00:00.000Z",
      trialEndsAt: "2026-04-12T12:00:00.000Z",
      trialExtensionUsedAt: null
    });
    expect(account.plan_key).toBe("growth");
  });
});

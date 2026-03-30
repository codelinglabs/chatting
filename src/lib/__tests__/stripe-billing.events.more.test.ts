const mocks = vi.hoisted(() => ({
  billingPortalCreate: vi.fn(),
  customersCreate: vi.fn(),
  ensureAccount: vi.fn(),
  findBillingAccountRowByStripeCustomerId: vi.fn(),
  findBillingAccountRowByStripeSubscriptionId: vi.fn(),
  isStripeBillingReady: vi.fn(),
  isStripeConfigured: vi.fn(),
  syncReferralRewardsForUser: vi.fn(),
  upsertBillingAccountRow: vi.fn()
}));

vi.mock("@/lib/billing-default-account", () => ({ ensureOwnerGrowthTrialBillingAccount: mocks.ensureAccount }));
vi.mock("@/lib/billing-trial-state", () => ({ isLocalGrowthTrialActive: vi.fn() }));
vi.mock("@/lib/env.server", () => ({ getOptionalServerEnv: vi.fn(() => null) }));
vi.mock("@/lib/referrals", () => ({ syncReferralRewardsForUser: mocks.syncReferralRewardsForUser }));
vi.mock("@/lib/repositories/billing-repository", () => ({
  clearBillingPaymentMethodRow: vi.fn(),
  findBillingAccountRow: vi.fn(),
  findBillingAccountRowByStripeCustomerId: mocks.findBillingAccountRowByStripeCustomerId,
  findBillingAccountRowByStripeSubscriptionId: mocks.findBillingAccountRowByStripeSubscriptionId,
  insertBillingInvoiceRow: vi.fn(),
  upsertBillingAccountRow: mocks.upsertBillingAccountRow,
  upsertBillingPaymentMethodRow: vi.fn()
}));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    billingPortal: { sessions: { create: mocks.billingPortalCreate } },
    checkout: { sessions: { create: vi.fn() } },
    customers: { create: mocks.customersCreate, retrieve: vi.fn() },
    invoices: { list: vi.fn() },
    subscriptions: { list: vi.fn(), retrieve: vi.fn(), update: vi.fn() }
  }),
  getStripeAppUrl: () => "https://app.example",
  getStripePriceId: (_planKey: string, interval: string) => (interval === "annual" ? "price_growth_annual" : "price_growth_monthly"),
  isStripeBillingReady: mocks.isStripeBillingReady,
  isStripeConfigured: mocks.isStripeConfigured
}));

import { createStripeBillingPortalSession, syncStripeBillingStateFromEvent } from "@/lib/stripe-billing";

describe("stripe billing event helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isStripeBillingReady.mockReturnValue(true);
    mocks.isStripeConfigured.mockReturnValue(true);
    mocks.ensureAccount.mockResolvedValue(null);
  });

  it("creates a billing portal customer with starter fallback defaults when no account exists yet", async () => {
    mocks.customersCreate.mockResolvedValue({ id: "cus_new" });
    mocks.billingPortalCreate.mockResolvedValue({ url: "https://portal.example" });

    await expect(createStripeBillingPortalSession("user_1", "owner@example.com")).resolves.toBe("https://portal.example");

    expect(mocks.upsertBillingAccountRow).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user_1",
      planKey: "starter",
      billingInterval: "monthly",
      stripeCustomerId: "cus_new"
    }));
  });

  it("returns early for unconfigured or unresolvable event syncs and trims customer ids", async () => {
    mocks.isStripeConfigured.mockReturnValue(false);
    await syncStripeBillingStateFromEvent({ customerId: " cus_123 " });
    expect(mocks.upsertBillingAccountRow).not.toHaveBeenCalled();

    mocks.isStripeConfigured.mockReturnValue(true);
    mocks.findBillingAccountRowByStripeCustomerId.mockResolvedValueOnce({ user_id: "user_1" });
    mocks.ensureAccount.mockResolvedValueOnce({
      plan_key: "growth",
      billing_interval: "annual",
      seat_quantity: 2,
      next_billing_date: "2026-04-12T00:00:00.000Z",
      stripe_subscription_id: null,
      stripe_price_id: null,
      stripe_status: null,
      stripe_current_period_end: null,
      trial_started_at: null,
      trial_ends_at: null,
      trial_extension_used_at: null
    });

    await syncStripeBillingStateFromEvent({ customerId: " cus_123 " });
    expect(mocks.upsertBillingAccountRow).toHaveBeenCalledWith(expect.objectContaining({ stripeCustomerId: "cus_123" }));
    expect(mocks.syncReferralRewardsForUser).toHaveBeenCalledWith("user_1");

    vi.clearAllMocks();
    mocks.isStripeConfigured.mockReturnValue(true);
    await syncStripeBillingStateFromEvent({ subscriptionId: "sub_missing" });
    expect(mocks.syncReferralRewardsForUser).not.toHaveBeenCalled();
  });
});

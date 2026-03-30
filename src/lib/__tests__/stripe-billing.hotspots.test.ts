const mocks = vi.hoisted(() => ({
  clearBillingPaymentMethodRow: vi.fn(),
  customersCreate: vi.fn(),
  customersRetrieve: vi.fn(),
  ensureAccount: vi.fn(),
  findBillingAccountRow: vi.fn(),
  getOptionalServerEnv: vi.fn(),
  insertBillingInvoiceRow: vi.fn(),
  invoicesList: vi.fn(),
  isLocalGrowthTrialActive: vi.fn(),
  isStripeBillingReady: vi.fn(),
  isStripeConfigured: vi.fn(),
  subscriptionsList: vi.fn(),
  subscriptionsRetrieve: vi.fn(),
  subscriptionsUpdate: vi.fn(),
  syncReferralRewardsForUser: vi.fn(),
  upsertBillingAccountRow: vi.fn(),
  upsertBillingPaymentMethodRow: vi.fn()
}));
vi.mock("@/lib/billing-default-account", () => ({ ensureOwnerGrowthTrialBillingAccount: mocks.ensureAccount }));
vi.mock("@/lib/billing-trial-state", () => ({ isLocalGrowthTrialActive: mocks.isLocalGrowthTrialActive }));
vi.mock("@/lib/env.server", () => ({ getOptionalServerEnv: mocks.getOptionalServerEnv }));
vi.mock("@/lib/referrals", () => ({ syncReferralRewardsForUser: mocks.syncReferralRewardsForUser }));
vi.mock("@/lib/repositories/billing-repository", () => ({
  clearBillingPaymentMethodRow: mocks.clearBillingPaymentMethodRow,
  findBillingAccountRow: mocks.findBillingAccountRow,
  findBillingAccountRowByStripeCustomerId: vi.fn(),
  findBillingAccountRowByStripeSubscriptionId: vi.fn(),
  insertBillingInvoiceRow: mocks.insertBillingInvoiceRow,
  upsertBillingAccountRow: mocks.upsertBillingAccountRow,
  upsertBillingPaymentMethodRow: mocks.upsertBillingPaymentMethodRow
}));
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    billingPortal: { sessions: { create: vi.fn() } },
    checkout: { sessions: { create: vi.fn() } },
    customers: { create: mocks.customersCreate, retrieve: mocks.customersRetrieve },
    invoices: { list: mocks.invoicesList },
    subscriptions: { list: mocks.subscriptionsList, retrieve: mocks.subscriptionsRetrieve, update: mocks.subscriptionsUpdate }
  }),
  getStripeAppUrl: () => "https://app.example",
  getStripePriceId: (_planKey: string, interval: string) => (interval === "annual" ? "price_growth_annual" : "price_growth_monthly"),
  isStripeBillingReady: mocks.isStripeBillingReady,
  isStripeConfigured: mocks.isStripeConfigured
}));
import { extendStripeTrial, syncStripeBillingState } from "@/lib/stripe-billing";

function accountRow(overrides: Record<string, unknown> = {}) {
  return { plan_key: "growth", billing_interval: "monthly", seat_quantity: 2, next_billing_date: "2026-04-12T00:00:00.000Z", stripe_customer_id: "cus_123", stripe_subscription_id: null, stripe_price_id: null, stripe_status: null, stripe_current_period_end: null, trial_started_at: "2026-03-29T00:00:00.000Z", trial_ends_at: "2026-04-12T00:00:00.000Z", trial_extension_used_at: null, ...overrides };
}

describe("stripe billing hotspots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.ensureAccount.mockResolvedValue(accountRow());
    mocks.isLocalGrowthTrialActive.mockReturnValue(false);
    mocks.isStripeBillingReady.mockReturnValue(true);
    mocks.isStripeConfigured.mockReturnValue(true);
    mocks.getOptionalServerEnv.mockImplementation((key: string) =>
      key === "STRIPE_PRICE_PRO_ANNUAL" ? "legacy_annual" : null
    );
  });

  it("creates a missing customer, clears unsupported payment methods, and maps legacy invoice price ids", async () => {
    mocks.ensureAccount.mockResolvedValue(accountRow({
      plan_key: "starter",
      stripe_customer_id: null,
      trial_started_at: null,
      trial_ends_at: null
    }));
    mocks.customersCreate.mockResolvedValue({ id: "cus_new" });
    mocks.customersRetrieve.mockResolvedValue({
      deleted: false,
      name: null,
      email: "owner@example.com",
      invoice_settings: { default_payment_method: "pm_123" }
    });
    mocks.subscriptionsList.mockResolvedValue({ data: [] });
    mocks.invoicesList.mockResolvedValue({
      data: [{
        id: "in_legacy",
        description: "",
        amount_paid: 0,
        amount_due: 29000,
        currency: null,
        status: "draft",
        hosted_invoice_url: null,
        invoice_pdf: null,
        created: 1711670400,
        period_start: null,
        period_end: null,
        status_transitions: { paid_at: null },
        lines: { data: [{ quantity: null, description: "", pricing: { price_details: { price: "legacy_annual" } } }] }
      }]
    });
    await expect(syncStripeBillingState("user_1", "owner@example.com")).resolves.toEqual({
      customerId: "cus_new",
      subscriptionId: null
    });
    expect(mocks.customersCreate).toHaveBeenCalledWith({ email: "owner@example.com", metadata: { userId: "user_1" } });
    expect(mocks.clearBillingPaymentMethodRow).toHaveBeenCalledWith("user_1");
    expect(mocks.insertBillingInvoiceRow).toHaveBeenCalledWith(expect.objectContaining({
      planKey: "growth",
      billingInterval: "annual",
      description: "Chatting billing event",
      currency: "USD"
    }));
  });

  it("keeps canceled subscriptions unchanged and falls back to starter when no local trial remains", async () => {
    mocks.customersRetrieve.mockResolvedValue({
      deleted: false,
      name: null,
      email: "owner@example.com",
      invoice_settings: { default_payment_method: { id: "pm_bank", type: "us_bank_account", card: null } }
    });
    mocks.subscriptionsList.mockResolvedValue({
      data: [{
        id: "sub_canceled",
        status: "canceled",
        created: 2,
        metadata: {},
        items: { data: [{ id: "si_1", quantity: 1, price: { id: "price_growth_monthly" } }] },
        current_period_end: 1713484800,
        trial_start: null,
        trial_end: null
      }]
    });
    mocks.invoicesList.mockResolvedValue({ data: [] });
    await syncStripeBillingState("user_1", "owner@example.com", 5);
    expect(mocks.subscriptionsUpdate).not.toHaveBeenCalled();
    expect(mocks.upsertBillingAccountRow).toHaveBeenLastCalledWith(expect.objectContaining({
      userId: "user_1",
      planKey: "growth",
      stripeStatus: "canceled",
      nextBillingDate: null,
      seatQuantity: 1
    }));
    expect(mocks.clearBillingPaymentMethodRow).toHaveBeenCalledWith("user_1");
  });

  it("extends trialing subscriptions after syncing seats and persists customer objects without a period end", async () => {
    mocks.findBillingAccountRow.mockResolvedValue(accountRow({ stripe_subscription_id: "sub_123", stripe_customer_id: null, seat_quantity: 4 }));
    mocks.subscriptionsRetrieve.mockResolvedValue({
      id: "sub_123",
      status: "trialing",
      customer: "cus_123",
      metadata: {},
      trial_start: 1711670400,
      trial_end: 1712880000,
      current_period_end: 1712880000,
      items: { data: [{ id: "si_123", quantity: 2, price: { id: "price_growth_monthly" } }] }
    });
    mocks.subscriptionsUpdate
      .mockResolvedValueOnce({
        id: "sub_123",
        status: "trialing",
        customer: "cus_123",
        metadata: {},
        trial_start: 1711670400,
        trial_end: 1712880000,
        current_period_end: 1712880000,
        items: { data: [{ id: "si_123", quantity: 6, price: { id: "price_growth_monthly" } }] }
      })
      .mockResolvedValueOnce({
        id: "sub_123",
        status: "trialing",
        customer: { id: "cus_object" },
        metadata: {},
        trial_start: 1711670400,
        trial_end: 1713484800,
        current_period_end: null,
        items: { data: [] }
      });
    await expect(extendStripeTrial("user_1", 7, 6)).resolves.toEqual({ trialEndsAt: "2024-04-19T00:00:00.000Z" });
    expect(mocks.subscriptionsUpdate).toHaveBeenNthCalledWith(1, "sub_123", expect.objectContaining({
      items: [{ id: "si_123", quantity: 6 }],
      proration_behavior: "none"
    }));
    expect(mocks.upsertBillingAccountRow).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user_1",
      stripeCustomerId: "cus_object",
      seatQuantity: 6,
      nextBillingDate: "2024-04-19T00:00:00.000Z"
    }));
  });
});

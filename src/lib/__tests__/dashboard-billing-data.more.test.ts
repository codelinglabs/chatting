const mocks = vi.hoisted(() => ({
  countBillableWorkspaceSeats: vi.fn(),
  createStripeBillingPortalSession: vi.fn(),
  createStripeCheckoutSession: vi.fn(),
  ensureOwnerGrowthTrialBillingAccount: vi.fn(),
  extendBillingTrial: vi.fn(),
  findBillingInsightsRow: vi.fn(),
  findBillingPaymentMethodRow: vi.fn(),
  findBillingUsageRow: vi.fn(),
  getDashboardReferralSummary: vi.fn(),
  getEffectiveBillingSubscriptionStatus: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  isActiveTrialWorkspace: vi.fn(),
  isBillingTrialExtensionEligible: vi.fn(),
  isStripeBillingReady: vi.fn(),
  isStripeConfigured: vi.fn(),
  listBillingInvoiceRows: vi.fn(),
  sendTrialExtensionOutreachEmail: vi.fn(),
  syncReferralRewardsForUser: vi.fn(),
  syncStripeBillingState: vi.fn()
}));

vi.mock("@/lib/billing-default-account", () => ({ ensureOwnerGrowthTrialBillingAccount: mocks.ensureOwnerGrowthTrialBillingAccount }));
vi.mock("@/lib/billing-outreach", () => ({ sendTrialExtensionOutreachEmail: mocks.sendTrialExtensionOutreachEmail }));
vi.mock("@/lib/billing-seats", () => ({ countBillableWorkspaceSeats: mocks.countBillableWorkspaceSeats, normalizeBillableSeatCount: (value: number) => value }));
vi.mock("@/lib/billing-trial-extension", () => ({ extendBillingTrial: mocks.extendBillingTrial }));
vi.mock("@/lib/billing-trial-state", () => ({ getEffectiveBillingSubscriptionStatus: mocks.getEffectiveBillingSubscriptionStatus }));
vi.mock("@/lib/billing-trials", () => ({ isActiveTrialWorkspace: mocks.isActiveTrialWorkspace, isBillingTrialExtensionEligible: mocks.isBillingTrialExtensionEligible }));
vi.mock("@/lib/referrals", () => ({ getDashboardReferralSummary: mocks.getDashboardReferralSummary, syncReferralRewardsForUser: mocks.syncReferralRewardsForUser }));
vi.mock("@/lib/repositories/billing-insights-repository", () => ({ findBillingInsightsRow: mocks.findBillingInsightsRow }));
vi.mock("@/lib/repositories/billing-repository", () => ({
  findBillingPaymentMethodRow: mocks.findBillingPaymentMethodRow,
  findBillingUsageRow: mocks.findBillingUsageRow,
  listBillingInvoiceRows: mocks.listBillingInvoiceRows
}));
vi.mock("@/lib/stripe", () => ({ isStripeBillingReady: mocks.isStripeBillingReady, isStripeConfigured: mocks.isStripeConfigured }));
vi.mock("@/lib/stripe-billing", () => ({
  createStripeBillingPortalSession: mocks.createStripeBillingPortalSession,
  createStripeCheckoutSession: mocks.createStripeCheckoutSession,
  syncStripeBillingState: mocks.syncStripeBillingState
}));
vi.mock("@/lib/workspace-access", () => ({ getWorkspaceAccess: mocks.getWorkspaceAccess }));

import { getDashboardBillingSummary, requestDashboardTrialExtension, syncDashboardBillingSummary } from "@/lib/data/billing";

const referrals = { programs: [], attributedSignups: [], rewards: [], pendingRewardCount: 0, earnedRewardCount: 0, earnedFreeMonths: 0, earnedDiscountCents: 0, earnedCommissionCents: 0 };

describe("dashboard billing data more", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1", ownerEmail: null });
    mocks.getDashboardReferralSummary.mockResolvedValue(referrals);
    mocks.findBillingInsightsRow.mockResolvedValue({ site_count: 0, conversation_count: 18, message_count: null, avg_response_seconds: null });
    mocks.findBillingUsageRow.mockResolvedValue({ site_count: 2, conversation_count: 9 });
    mocks.findBillingPaymentMethodRow.mockResolvedValue(null);
    mocks.listBillingInvoiceRows.mockResolvedValue([{ id: "in_1", plan_key: "starter", billing_interval: null, seat_quantity: null, description: "Starter", amount_cents: 0, currency: "usd", status: "paid", hosted_invoice_url: null, invoice_pdf_url: null, issued_at: "2026-03-29T00:00:00.000Z", paid_at: null, period_start: null, period_end: null }]);
    mocks.countBillableWorkspaceSeats.mockResolvedValue(2);
    mocks.ensureOwnerGrowthTrialBillingAccount.mockResolvedValue({ plan_key: "starter", billing_interval: "monthly", seat_quantity: null, next_billing_date: null, stripe_customer_id: null, stripe_subscription_id: null, stripe_status: null, trial_ends_at: null, trial_extension_used_at: null });
    mocks.getEffectiveBillingSubscriptionStatus.mockReturnValue(null);
    mocks.isActiveTrialWorkspace.mockReturnValue(false);
    mocks.isBillingTrialExtensionEligible.mockReturnValue(true);
    mocks.isStripeBillingReady.mockReturnValue(false);
    mocks.isStripeConfigured.mockReturnValue(true);
    mocks.syncStripeBillingState.mockResolvedValue(undefined);
    mocks.syncReferralRewardsForUser.mockResolvedValue(undefined);
    mocks.extendBillingTrial.mockResolvedValue({ trialEndsAt: "2026-04-19T00:00:00.000Z" });
  });

  it("builds starter summaries without stripe sync when billing is not ready or no customer exists", async () => {
    const billing = await getDashboardBillingSummary("owner_1", 7);
    expect(mocks.countBillableWorkspaceSeats).not.toHaveBeenCalled();
    expect(mocks.syncStripeBillingState).not.toHaveBeenCalled();
    expect(billing).toMatchObject({
      planKey: "starter",
      usedSeats: 7,
      paymentMethod: null,
      portalAvailable: false,
      checkoutAvailable: false,
      subscriptionStatus: null,
      referrals
    });
    expect(billing.invoices[0]).toMatchObject({ billingInterval: null, seatQuantity: null, status: "paid" });
  });

  it("syncs billing with a fallback owner email and reports outreach failures without breaking the extension", async () => {
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1", ownerEmail: "" });
    mocks.ensureOwnerGrowthTrialBillingAccount.mockResolvedValue({ plan_key: "growth", billing_interval: "monthly", seat_quantity: 2, next_billing_date: null, stripe_customer_id: "cus_123", stripe_subscription_id: null, stripe_status: "trialing", trial_ends_at: "2026-04-12T00:00:00.000Z", trial_extension_used_at: null });
    mocks.getEffectiveBillingSubscriptionStatus.mockReturnValue("trialing");
    mocks.isActiveTrialWorkspace.mockReturnValue(true);
    mocks.sendTrialExtensionOutreachEmail.mockRejectedValueOnce(new Error("smtp down"));

    await syncDashboardBillingSummary("user_1", "fallback@example.com", 3);
    expect(mocks.syncStripeBillingState).toHaveBeenCalledWith("owner_1", "fallback@example.com", 3);

    const result = await requestDashboardTrialExtension("user_1", "fallback@example.com");
    expect(result.outreachQueued).toBe(false);
    expect(mocks.sendTrialExtensionOutreachEmail).toHaveBeenCalledWith(expect.objectContaining({ to: "fallback@example.com" }));
  });

  it("skips outreach when the extension returns no trial end date", async () => {
    mocks.ensureOwnerGrowthTrialBillingAccount.mockResolvedValue({ plan_key: "growth", billing_interval: "monthly", seat_quantity: 2, next_billing_date: null, stripe_customer_id: "cus_123", stripe_subscription_id: null, stripe_status: "trialing", trial_ends_at: "2026-04-12T00:00:00.000Z", trial_extension_used_at: null });
    mocks.getEffectiveBillingSubscriptionStatus.mockReturnValue("trialing");
    mocks.extendBillingTrial.mockResolvedValueOnce({ trialEndsAt: null });

    const result = await requestDashboardTrialExtension("user_1", "fallback@example.com");
    expect(result.outreachQueued).toBe(true);
    expect(mocks.sendTrialExtensionOutreachEmail).not.toHaveBeenCalled();
  });

  it("skips stripe sync entirely when stripe configuration is disabled", async () => {
    mocks.isStripeConfigured.mockReturnValue(false);
    await syncDashboardBillingSummary("user_1", "fallback@example.com", 4);
    expect(mocks.syncStripeBillingState).not.toHaveBeenCalled();

    mocks.isBillingTrialExtensionEligible.mockReturnValue(false);
    await expect(requestDashboardTrialExtension("user_1", "fallback@example.com")).rejects.toThrow("TRIAL_EXTENSION_UNAVAILABLE");
    expect(mocks.syncStripeBillingState).not.toHaveBeenCalled();
  });
});

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

vi.mock("@/lib/billing-default-account", () => ({
  ensureOwnerGrowthTrialBillingAccount: mocks.ensureOwnerGrowthTrialBillingAccount
}));
vi.mock("@/lib/billing-outreach", () => ({
  sendTrialExtensionOutreachEmail: mocks.sendTrialExtensionOutreachEmail
}));
vi.mock("@/lib/billing-seats", () => ({
  countBillableWorkspaceSeats: mocks.countBillableWorkspaceSeats,
  normalizeBillableSeatCount: (value: number) => value
}));
vi.mock("@/lib/billing-trial-extension", () => ({ extendBillingTrial: mocks.extendBillingTrial }));
vi.mock("@/lib/billing-trial-state", () => ({
  getEffectiveBillingSubscriptionStatus: mocks.getEffectiveBillingSubscriptionStatus
}));
vi.mock("@/lib/billing-trials", () => ({
  isActiveTrialWorkspace: mocks.isActiveTrialWorkspace,
  isBillingTrialExtensionEligible: mocks.isBillingTrialExtensionEligible
}));
vi.mock("@/lib/referrals", () => ({
  getDashboardReferralSummary: mocks.getDashboardReferralSummary,
  syncReferralRewardsForUser: mocks.syncReferralRewardsForUser
}));
vi.mock("@/lib/repositories/billing-insights-repository", () => ({
  findBillingInsightsRow: mocks.findBillingInsightsRow
}));
vi.mock("@/lib/repositories/billing-repository", () => ({
  findBillingPaymentMethodRow: mocks.findBillingPaymentMethodRow,
  findBillingUsageRow: mocks.findBillingUsageRow,
  listBillingInvoiceRows: mocks.listBillingInvoiceRows
}));
vi.mock("@/lib/stripe", () => ({
  isStripeBillingReady: mocks.isStripeBillingReady,
  isStripeConfigured: mocks.isStripeConfigured
}));
vi.mock("@/lib/stripe-billing", () => ({
  createStripeBillingPortalSession: mocks.createStripeBillingPortalSession,
  createStripeCheckoutSession: mocks.createStripeCheckoutSession,
  syncStripeBillingState: mocks.syncStripeBillingState
}));
vi.mock("@/lib/workspace-access", () => ({ getWorkspaceAccess: mocks.getWorkspaceAccess }));

import {
  createDashboardBillingCheckoutSession,
  createDashboardBillingPortalSession,
  getDashboardBillingSummary,
  requestDashboardTrialExtension
} from "@/lib/data/billing";
const referrals = { programs: [], attributedSignups: [], rewards: [], pendingRewardCount: 0, earnedRewardCount: 0, earnedFreeMonths: 0, earnedDiscountCents: 0, earnedCommissionCents: 0 };

function accountRow() {
  return {
    user_id: "owner_1",
    plan_key: "growth",
    billing_interval: "annual",
    seat_quantity: 3,
    next_billing_date: "2026-04-12T00:00:00.000Z",
    stripe_customer_id: "cus_123",
    stripe_subscription_id: null,
    stripe_price_id: null,
    stripe_status: null,
    stripe_current_period_end: null,
    trial_started_at: "2026-03-29T00:00:00.000Z",
    trial_ends_at: "2026-04-12T00:00:00.000Z",
    trial_extension_used_at: null
  };
}

describe("dashboard billing data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1", ownerEmail: "owner@example.com" });
    mocks.countBillableWorkspaceSeats.mockResolvedValue(3);
    mocks.ensureOwnerGrowthTrialBillingAccount.mockResolvedValue(accountRow());
    mocks.findBillingInsightsRow.mockResolvedValue({
      site_count: 2,
      conversation_count: 24,
      message_count: 40,
      avg_response_seconds: 72
    });
    mocks.findBillingUsageRow.mockResolvedValue({ site_count: 2, conversation_count: 24 });
    mocks.findBillingPaymentMethodRow.mockResolvedValue({
      brand: "visa",
      last4: "4242",
      exp_month: 4,
      exp_year: 2028,
      holder_name: "Tina Bauer",
      updated_at: "2026-03-29T00:00:00.000Z"
    });
    mocks.listBillingInvoiceRows.mockResolvedValue([]);
    mocks.getDashboardReferralSummary.mockResolvedValue(referrals);
    mocks.getEffectiveBillingSubscriptionStatus.mockReturnValue("trialing");
    mocks.isActiveTrialWorkspace.mockReturnValue(true);
    mocks.isBillingTrialExtensionEligible.mockReturnValue(true);
    mocks.isStripeBillingReady.mockReturnValue(true);
    mocks.isStripeConfigured.mockReturnValue(true);
    mocks.syncStripeBillingState.mockResolvedValue(undefined);
    mocks.syncReferralRewardsForUser.mockResolvedValue(undefined);
    mocks.extendBillingTrial.mockResolvedValue({ trialEndsAt: "2026-04-19T00:00:00.000Z" });
    mocks.sendTrialExtensionOutreachEmail.mockResolvedValue(undefined);
  });

  it("builds the billing summary for the workspace owner and syncs stripe state", async () => {
    const billing = await getDashboardBillingSummary("member_1");
    expect(mocks.syncStripeBillingState).toHaveBeenCalledWith("owner_1", undefined, 3);
    expect(mocks.syncReferralRewardsForUser).toHaveBeenCalledWith("owner_1");
    expect(billing).toMatchObject({
      planKey: "growth",
      billingInterval: "annual",
      usedSeats: 3,
      billedSeats: 3,
      siteCount: 2,
      conversationCount: 24,
      messageCount: 40,
      avgResponseSeconds: 72,
      trialEndsAt: "12 April 2026",
      subscriptionStatus: "trialing",
      portalAvailable: true,
      checkoutAvailable: true,
      customerId: "cus_123",
      paymentMethod: {
        brand: "visa",
        last4: "4242"
      },
      referrals
    });
    expect(billing.priceLabel).toContain("/year");
  });

  it("delegates checkout and portal session creation to the workspace owner account", async () => {
    mocks.createStripeCheckoutSession.mockResolvedValue("https://checkout.example");
    mocks.createStripeBillingPortalSession.mockResolvedValue("https://portal.example");
    await expect(
      createDashboardBillingCheckoutSession("member_1", "fallback@example.com", {
        planKey: "growth",
        billingInterval: "annual",
        seatQuantity: 4
      })
    ).resolves.toBe("https://checkout.example");
    await expect(createDashboardBillingPortalSession("member_1", "fallback@example.com")).resolves.toBe("https://portal.example");
    expect(mocks.createStripeCheckoutSession).toHaveBeenCalledWith("owner_1", "owner@example.com", {
      planKey: "growth",
      billingInterval: "annual",
      seatQuantity: 4
    });
    expect(mocks.createStripeBillingPortalSession).toHaveBeenCalledWith("owner_1", "owner@example.com");
  });

  it("extends eligible trials and queues outreach email", async () => {
    const result = await requestDashboardTrialExtension("member_1", "fallback@example.com");
    expect(mocks.extendBillingTrial).toHaveBeenCalledWith("owner_1", 7, 3);
    expect(mocks.sendTrialExtensionOutreachEmail).toHaveBeenCalledWith({ to: "owner@example.com", planName: "Growth", trialEndsAt: "2026-04-19T00:00:00.000Z" });
    expect(result.outreachQueued).toBe(true);
    expect(result.billing.planKey).toBe("growth");
  });

  it("rejects trial extension requests when the workspace is not eligible", async () => {
    mocks.isBillingTrialExtensionEligible.mockReturnValueOnce(false);
    await expect(requestDashboardTrialExtension("member_1", "fallback@example.com")).rejects.toThrow("TRIAL_EXTENSION_UNAVAILABLE");
    expect(mocks.extendBillingTrial).not.toHaveBeenCalled();
    expect(mocks.sendTrialExtensionOutreachEmail).not.toHaveBeenCalled();
  });
});

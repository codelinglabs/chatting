import { renderToStaticMarkup } from "react-dom/server";
import type { DashboardBillingSummary } from "@/lib/data";
import type { DashboardReferralSummary } from "@/lib/referrals";
import { DashboardSettingsBillingBanners } from "./dashboard-settings-billing-banners";
import { DashboardSettingsBillingTrialCard } from "./dashboard-settings-billing-trial-card";
import { SettingsReferralsSection } from "./dashboard-settings-referrals-section";

const referrals: DashboardReferralSummary = {
  programs: [],
  attributedSignups: [],
  rewards: [],
  pendingRewardCount: 0,
  earnedRewardCount: 0,
  earnedFreeMonths: 0,
  earnedDiscountCents: 0,
  earnedCommissionCents: 0
};

const baseBilling = {
  planKey: "growth",
  planName: "Growth",
  priceLabel: "$29/month",
  billingInterval: "monthly",
  usedSeats: 1,
  billedSeats: 1,
  seatLimit: null,
  siteCount: 1,
  conversationCount: 10,
  messageCount: 24,
  avgResponseSeconds: 18,
  conversationLimit: null,
  conversationUsagePercent: null,
  upgradePromptThreshold: 30,
  remainingConversations: null,
  showUpgradePrompt: false,
  limitReached: false,
  nextBillingDate: "12 April 2026",
  trialEndsAt: "12 April 2026",
  trialExtensionEligible: false,
  trialExtensionUsedAt: null,
  activityQualifiedForTrialExtension: false,
  subscriptionStatus: "trialing",
  customerId: "cus_123",
  portalAvailable: true,
  checkoutAvailable: true,
  features: { billedPerSeat: true, proactiveChat: true, removeBranding: true, trialExtensions: true },
  paymentMethod: null,
  invoices: [],
  referrals
} as DashboardBillingSummary;

describe("dashboard billing helper cards", () => {
  it("renders payment issue and trial banner states", () => {
    const paymentIssueHtml = renderToStaticMarkup(
      <DashboardSettingsBillingBanners
        billing={{ ...baseBilling, subscriptionStatus: "past_due" }}
        trialExtensionPending={false}
        onOpenUpdatePayment={() => {}}
        onExtendTrial={() => {}}
        onOpenBillingPortal={() => {}}
      />
    );
    const trialHtml = renderToStaticMarkup(
      <DashboardSettingsBillingBanners
        billing={{ ...baseBilling, subscriptionStatus: "trialing", trialExtensionEligible: true }}
        trialExtensionPending
        onOpenUpdatePayment={() => {}}
        onExtendTrial={() => {}}
        onOpenBillingPortal={() => {}}
      />
    );

    expect(paymentIssueHtml).toContain("Payment failed");
    expect(paymentIssueHtml).toContain("Update now");
    expect(trialHtml).toContain("left in your trial");
    expect(trialHtml).toContain("extend the trial by 7 days");
    expect(trialHtml).toContain("Extending...");
  });

  it("hides the trial card when ineligible and shows the support copy when eligible", () => {
    expect(
      renderToStaticMarkup(
        <DashboardSettingsBillingTrialCard
          billing={{ ...baseBilling, trialExtensionEligible: false, trialEndsAt: null }}
          trialExtensionPending={false}
          onExtendTrial={() => {}}
        />
      )
    ).toBe("");

    const html = renderToStaticMarkup(
      <DashboardSettingsBillingTrialCard
        billing={{ ...baseBilling, trialExtensionEligible: true }}
        trialExtensionPending={false}
        onExtendTrial={() => {}}
      />
    );

    expect(html).toContain("Need a little more time?");
    expect(html).toContain("Extend trial by 7 days");
    expect(html).toContain("12 April 2026");
  });

  it("renders the referrals section wrapper copy around the billing referrals card", () => {
    const html = renderToStaticMarkup(
      <SettingsReferralsSection
        title="Referrals"
        subtitle="Track referral programs and earned rewards."
        referrals={referrals}
      />
    );

    expect(html).toContain("Referrals");
    expect(html).toContain("Track referral programs and earned rewards.");
    expect(html).toContain("No referred signups yet.");
  });
});

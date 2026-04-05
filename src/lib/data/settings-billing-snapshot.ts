import {
  formatBillingPriceLabel,
  getBillingPlanDefinition,
  getBillingPlanFeatures,
  isPaidPlan,
  normalizeBillingInterval,
  normalizeBillingPlanKey
} from "@/lib/billing-plans";
import { ensureOwnerGrowthTrialBillingAccount } from "@/lib/billing-default-account";
import type { DashboardBillingSummary } from "@/lib/data/billing-types";
import { isStripeBillingReady } from "@/lib/stripe";

const EMPTY_REFERRALS = {
  programs: [],
  attributedSignups: [],
  rewards: [],
  pendingRewardCount: 0,
  earnedRewardCount: 0,
  earnedFreeMonths: 0,
  earnedDiscountCents: 0,
  earnedCommissionCents: 0
} as DashboardBillingSummary["referrals"];

export async function getDashboardSettingsBillingSnapshot(input: {
  ownerUserId: string;
  usedSeats: number;
  siteCount: number;
}): Promise<DashboardBillingSummary> {
  const account = await ensureOwnerGrowthTrialBillingAccount(input.ownerUserId);
  const planKey = normalizeBillingPlanKey(account.plan_key);
  const billingInterval = isPaidPlan(planKey) ? normalizeBillingInterval(account.billing_interval) : null;
  const plan = getBillingPlanDefinition(planKey);
  const billingReady = isStripeBillingReady();

  return {
    planKey,
    planName: plan.dashboardName,
    priceLabel: formatBillingPriceLabel(planKey, billingInterval),
    billingInterval,
    usedSeats: input.usedSeats,
    billedSeats: isPaidPlan(planKey) ? Number(account.seat_quantity ?? input.usedSeats) : null,
    seatLimit: plan.seatLimit,
    siteCount: input.siteCount,
    conversationCount: 0,
    messageCount: 0,
    avgResponseSeconds: null,
    conversationLimit: null,
    conversationUsagePercent: null,
    upgradePromptThreshold: null,
    remainingConversations: null,
    showUpgradePrompt: false,
    limitReached: false,
    nextBillingDate: null,
    trialEndsAt: null,
    subscriptionStatus: account.stripe_status,
    customerId: account.stripe_customer_id,
    portalAvailable: Boolean(account.stripe_customer_id && billingReady),
    checkoutAvailable: billingReady,
    features: getBillingPlanFeatures(planKey),
    paymentMethod: null,
    invoices: [],
    referrals: EMPTY_REFERRALS
  };
}

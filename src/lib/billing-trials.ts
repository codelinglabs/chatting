import {
  type BillingPlanKey,
  getBillingPlanFeatures,
  isPaidPlan
} from "@/lib/billing-plans";
import { getEffectiveBillingSubscriptionStatus } from "@/lib/billing-trial-state";

export type BillingTrialEligibilityInput = {
  planKey: BillingPlanKey;
  subscriptionStatus: string | null;
  stripeSubscriptionId: string | null;
  trialEndsAt: string | null;
  trialExtensionUsedAt: string | null;
  siteCount: number;
  conversationCount: number;
  usedSeats: number;
};

export function isActiveTrialWorkspace(input: Pick<
  BillingTrialEligibilityInput,
  "siteCount" | "conversationCount" | "usedSeats"
>) {
  return input.conversationCount >= 3 || input.usedSeats >= 2 || input.siteCount >= 2;
}

export function isBillingTrialExtensionEligible(input: BillingTrialEligibilityInput) {
  if (!isPaidPlan(input.planKey)) {
    return false;
  }

  if (!getBillingPlanFeatures(input.planKey).trialExtensions) {
    return false;
  }

  if (
    getEffectiveBillingSubscriptionStatus({
      planKey: input.planKey,
      subscriptionStatus: input.subscriptionStatus,
      stripeSubscriptionId: input.stripeSubscriptionId,
      trialEndsAt: input.trialEndsAt
    }) !== "trialing"
  ) {
    return false;
  }

  if (input.trialExtensionUsedAt) {
    return false;
  }

  return isActiveTrialWorkspace(input);
}

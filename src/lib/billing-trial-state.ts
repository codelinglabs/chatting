import type { BillingPlanKey } from "@/lib/billing-plans";

function hasFutureTrialEnd(trialEndsAt: string | null, now = new Date()) {
  if (!trialEndsAt) {
    return false;
  }

  const trialEndDate = new Date(trialEndsAt);
  if (Number.isNaN(trialEndDate.getTime())) {
    return false;
  }

  return trialEndDate.getTime() > now.getTime();
}

export function isLocalGrowthTrialActive(
  input: {
    planKey: BillingPlanKey;
    stripeSubscriptionId: string | null;
    trialEndsAt: string | null;
  },
  now = new Date()
) {
  if (input.planKey !== "growth" || input.stripeSubscriptionId) {
    return false;
  }

  return hasFutureTrialEnd(input.trialEndsAt, now);
}

export function getEffectiveBillingSubscriptionStatus(
  input: {
    planKey: BillingPlanKey;
    subscriptionStatus: string | null;
    stripeSubscriptionId: string | null;
    trialEndsAt: string | null;
  },
  now = new Date()
) {
  if (input.subscriptionStatus) {
    return input.subscriptionStatus;
  }

  return isLocalGrowthTrialActive(
    {
      planKey: input.planKey,
      stripeSubscriptionId: input.stripeSubscriptionId,
      trialEndsAt: input.trialEndsAt
    },
    now
  )
    ? "trialing"
    : null;
}

import { ensureOwnerGrowthTrialBillingAccount } from "@/lib/billing-default-account";
import { isLocalGrowthTrialActive } from "@/lib/billing-trial-state";
import { upsertBillingAccountRow } from "@/lib/repositories/billing-repository";
import { extendStripeTrial } from "@/lib/stripe-billing";

const DAY_MS = 24 * 60 * 60 * 1000;

async function extendLocalGrowthTrial(account: Awaited<ReturnType<typeof ensureOwnerGrowthTrialBillingAccount>>, extensionDays: number) {
  if (
    !isLocalGrowthTrialActive({
      planKey: account.plan_key,
      stripeSubscriptionId: account.stripe_subscription_id,
      trialEndsAt: account.trial_ends_at
    })
    || account.trial_extension_used_at
  ) {
    throw new Error("TRIAL_EXTENSION_UNAVAILABLE");
  }

  const trialEndsAt = new Date(new Date(account.trial_ends_at!).getTime() + extensionDays * DAY_MS).toISOString();
  const extensionUsedAt = new Date().toISOString();

  await upsertBillingAccountRow({
    userId: account.user_id,
    planKey: account.plan_key,
    billingInterval: account.billing_interval,
    seatQuantity: account.seat_quantity,
    nextBillingDate: trialEndsAt,
    stripeCustomerId: account.stripe_customer_id,
    stripeSubscriptionId: account.stripe_subscription_id,
    stripePriceId: account.stripe_price_id,
    stripeStatus: account.stripe_status,
    stripeCurrentPeriodEnd: account.stripe_current_period_end,
    trialStartedAt: account.trial_started_at,
    trialEndsAt,
    trialExtensionUsedAt: extensionUsedAt
  });

  return { trialEndsAt };
}

export async function extendBillingTrial(userId: string, extensionDays: number, desiredSeatCount?: number) {
  const account = await ensureOwnerGrowthTrialBillingAccount(userId);

  if (account.stripe_subscription_id) {
    return extendStripeTrial(userId, extensionDays, desiredSeatCount);
  }

  return extendLocalGrowthTrial(account, extensionDays);
}

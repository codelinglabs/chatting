import { BILLING_TRIAL_DAYS } from "@/lib/billing-plans";
import {
  findBillingAccountRow,
  type BillingAccountRow,
  upsertBillingAccountRow
} from "@/lib/repositories/billing-repository";

const BILLING_TRIAL_MS = BILLING_TRIAL_DAYS * 24 * 60 * 60 * 1000;

export function buildDefaultGrowthTrialBillingAccount(userId: string, now = new Date()): BillingAccountRow {
  const createdAt = now.toISOString();
  const trialEndsAt = new Date(now.getTime() + BILLING_TRIAL_MS).toISOString();

  return {
    user_id: userId,
    plan_key: "growth",
    billing_interval: "monthly",
    seat_quantity: 1,
    next_billing_date: trialEndsAt,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    stripe_price_id: null,
    stripe_status: null,
    stripe_current_period_end: null,
    trial_started_at: createdAt,
    trial_ends_at: trialEndsAt,
    trial_extension_used_at: null,
    created_at: createdAt,
    updated_at: createdAt
  };
}

export async function ensureOwnerGrowthTrialBillingAccount(userId: string, now = new Date()) {
  const existing = await findBillingAccountRow(userId);
  if (existing) {
    return existing;
  }

  const account = buildDefaultGrowthTrialBillingAccount(userId, now);
  await upsertBillingAccountRow({
    userId,
    planKey: account.plan_key,
    billingInterval: account.billing_interval,
    seatQuantity: account.seat_quantity,
    nextBillingDate: account.next_billing_date,
    stripeCustomerId: account.stripe_customer_id,
    stripeSubscriptionId: account.stripe_subscription_id,
    stripePriceId: account.stripe_price_id,
    stripeStatus: account.stripe_status,
    stripeCurrentPeriodEnd: account.stripe_current_period_end,
    trialStartedAt: account.trial_started_at,
    trialEndsAt: account.trial_ends_at,
    trialExtensionUsedAt: account.trial_extension_used_at
  });

  return account;
}

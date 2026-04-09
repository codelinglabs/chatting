import { query } from "@/lib/db";
import { normalizeExpiredGrowthTrialWorkspaceRow } from "@/lib/repositories/billing-timestamp-normalizers";

export type ExpiredGrowthTrialWorkspaceRow = {
  user_id: string;
  trial_ends_at: string;
};

export async function listExpiredGrowthTrialWorkspaceRows(referenceTime: string) {
  const result = await query<ExpiredGrowthTrialWorkspaceRow>(
    `
      SELECT user_id, trial_ends_at
      FROM billing_accounts
      WHERE plan_key = 'growth'
        AND trial_ends_at IS NOT NULL
        AND trial_ends_at <= $1
        AND (
          stripe_subscription_id IS NULL
          OR stripe_status IN ('canceled', 'incomplete_expired')
        )
    `,
    [referenceTime]
  );

  return result.rows.map(normalizeExpiredGrowthTrialWorkspaceRow);
}

export async function downgradeExpiredGrowthTrialWorkspace(userId: string) {
  await query(
    `
      UPDATE billing_accounts
      SET
        plan_key = 'starter',
        billing_interval = 'monthly',
        seat_quantity = 1,
        next_billing_date = NULL,
        stripe_subscription_id = NULL,
        stripe_price_id = NULL,
        stripe_status = NULL,
        stripe_current_period_end = NULL,
        trial_started_at = NULL,
        trial_ends_at = NULL,
        trial_extension_used_at = NULL,
        updated_at = NOW()
      WHERE user_id = $1
        AND plan_key = 'growth'
    `,
    [userId]
  );
}

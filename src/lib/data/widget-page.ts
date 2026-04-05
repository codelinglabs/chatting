import { ensureOwnerGrowthTrialBillingAccount } from "@/lib/billing-default-account";
import { getBillingPlanFeatures, normalizeBillingPlanKey } from "@/lib/billing-plans";
import { mapSite, querySites } from "./shared";

export async function getDashboardWidgetPageData(ownerUserId: string) {
  const [sitesResult, billingAccount] = await Promise.all([
    querySites("s.user_id = $1", [ownerUserId], "ORDER BY s.created_at ASC"),
    ensureOwnerGrowthTrialBillingAccount(ownerUserId)
  ]);

  return {
    sites: sitesResult.rows.map(mapSite),
    proactiveChatUnlocked: getBillingPlanFeatures(normalizeBillingPlanKey(billingAccount.plan_key)).proactiveChat
  };
}

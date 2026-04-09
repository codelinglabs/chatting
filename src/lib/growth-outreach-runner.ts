import { runExpiredGrowthTrialDowngrades } from "@/lib/billing-lifecycle";
import { maybeSendSiteLifecycleEmails } from "@/lib/growth-outreach";
import { maybeSendTrialExpiredEmail, maybeSendTrialEndingReminder } from "@/lib/growth-trial-outreach";
import { withRetryableDatabaseConnectionRetry } from "@/lib/retryable-database-errors";
import { listGrowthLifecycleSiteRows } from "@/lib/repositories/growth-outreach-repository";

export async function runScheduledGrowthLifecycleEmails() {
  const { downgradedWorkspaces, expiredTrials } =
    await withRetryableDatabaseConnectionRetry(() => runExpiredGrowthTrialDowngrades());
  const sites = await withRetryableDatabaseConnectionRetry(() =>
    listGrowthLifecycleSiteRows()
  );
  let processed = 0;

  for (const trial of expiredTrials) {
    try {
      await maybeSendTrialExpiredEmail(trial);
    } catch (error) {
      console.error("growth trial expired email failed", trial.userId, error);
    }
  }

  for (const site of sites) {
    try {
      await maybeSendSiteLifecycleEmails(site.site_id);
    } catch (error) {
      console.error("growth lifecycle site email failed", site.site_id, site.user_id, error);
    }

    try {
      await maybeSendTrialEndingReminder(site.user_id);
    } catch (error) {
      console.error("growth trial ending reminder failed", site.user_id, error);
    }
    processed += 1;
  }

  return {
    processedSites: processed,
    downgradedWorkspaces
  };
}

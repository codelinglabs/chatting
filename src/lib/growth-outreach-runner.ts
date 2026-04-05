import { runExpiredGrowthTrialDowngrades } from "@/lib/billing-lifecycle";
import { maybeSendSiteLifecycleEmails } from "@/lib/growth-outreach";
import { maybeSendTrialExpiredEmail, maybeSendTrialEndingReminder } from "@/lib/growth-trial-outreach";
import { listGrowthLifecycleSiteRows } from "@/lib/repositories/growth-outreach-repository";

export async function runScheduledGrowthLifecycleEmails() {
  const { downgradedWorkspaces, expiredTrials } = await runExpiredGrowthTrialDowngrades();
  const sites = await listGrowthLifecycleSiteRows();
  let processed = 0;

  for (const trial of expiredTrials) {
    await maybeSendTrialExpiredEmail(trial);
  }

  for (const site of sites) {
    await maybeSendSiteLifecycleEmails(site.site_id);
    await maybeSendTrialEndingReminder(site.user_id);
    processed += 1;
  }

  return {
    processedSites: processed,
    downgradedWorkspaces
  };
}

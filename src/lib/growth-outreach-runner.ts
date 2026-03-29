import { maybeSendSiteLifecycleEmails } from "@/lib/growth-outreach";
import { listGrowthLifecycleSiteRows } from "@/lib/repositories/growth-outreach-repository";

export async function runScheduledGrowthLifecycleEmails() {
  const sites = await listGrowthLifecycleSiteRows();
  let processed = 0;

  for (const site of sites) {
    await maybeSendSiteLifecycleEmails(site.site_id);
    processed += 1;
  }

  return {
    processedSites: processed
  };
}

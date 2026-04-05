import {
  downgradeExpiredGrowthTrialWorkspace,
  listExpiredGrowthTrialWorkspaceRows
} from "@/lib/repositories/billing-lifecycle-repository";

export async function runExpiredGrowthTrialDowngrades(now = new Date()) {
  const rows = await listExpiredGrowthTrialWorkspaceRows(now.toISOString());
  let downgradedWorkspaces = 0;

  for (const row of rows) {
    await downgradeExpiredGrowthTrialWorkspace(row.user_id);
    downgradedWorkspaces += 1;
  }

  return {
    downgradedWorkspaces,
    expiredTrials: rows.map((row) => ({
      userId: row.user_id,
      trialEndedAt: row.trial_ends_at
    }))
  };
}

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

  return { downgradedWorkspaces };
}

import "server-only";

import { IntervalScheduler, resolveGlobalIntervalScheduler } from "@/lib/runtime/interval-scheduler";

const GROWTH_LIFECYCLE_INTERVAL_MS = 60 * 60 * 1000;

export const growthLifecycleScheduler = resolveGlobalIntervalScheduler(
  "__chatlyGrowthLifecycleScheduler__",
  () =>
    new IntervalScheduler({
      intervalMs: GROWTH_LIFECYCLE_INTERVAL_MS,
      failureMessage: "growth lifecycle scheduler failed",
      task: async () => {
        const { runScheduledGrowthLifecycleEmails } = await import("@/lib/growth-outreach-runner");
        await runScheduledGrowthLifecycleEmails();
      }
    })
);

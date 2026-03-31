import "server-only";

import { IntervalScheduler, resolveGlobalIntervalScheduler } from "@/lib/runtime/interval-scheduler";

const DAILY_DIGEST_INTERVAL_MS = 60 * 60 * 1000;

export const dailyDigestScheduler = resolveGlobalIntervalScheduler(
  "__chatlyDailyDigestScheduler__",
  () =>
    new IntervalScheduler({
      intervalMs: DAILY_DIGEST_INTERVAL_MS,
      failureMessage: "daily digest scheduler failed",
      task: async () => {
        const { runScheduledDailyDigests } = await import("@/lib/daily-digest");
        await runScheduledDailyDigests();
      }
    })
);

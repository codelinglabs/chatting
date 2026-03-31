import "server-only";

import { IntervalScheduler, resolveGlobalIntervalScheduler } from "@/lib/runtime/interval-scheduler";

const WEEKLY_PERFORMANCE_INTERVAL_MS = 60 * 60 * 1000;

export const weeklyPerformanceScheduler = resolveGlobalIntervalScheduler(
  "__chatlyWeeklyPerformanceScheduler__",
  () =>
    new IntervalScheduler({
      intervalMs: WEEKLY_PERFORMANCE_INTERVAL_MS,
      failureMessage: "weekly performance scheduler failed",
      task: async () => {
        const { runScheduledWeeklyPerformanceEmails } = await import("@/lib/weekly-performance");
        await runScheduledWeeklyPerformanceEmails();
      }
    })
);

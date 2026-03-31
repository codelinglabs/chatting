import "server-only";

export async function startNodeRuntimeServices() {
  const [
    { assertStartupProductionCoreEnvConfigured },
    { dailyDigestScheduler },
    { growthLifecycleScheduler },
    { weeklyPerformanceScheduler }
  ] = await Promise.all([
    import("@/lib/env.server"),
    import("@/lib/runtime/daily-digest-scheduler"),
    import("@/lib/runtime/growth-lifecycle-scheduler"),
    import("@/lib/runtime/weekly-performance-scheduler")
  ]);

  assertStartupProductionCoreEnvConfigured();
  dailyDigestScheduler.start();
  growthLifecycleScheduler.start();
  weeklyPerformanceScheduler.start();
}

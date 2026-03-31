describe("startup orchestrator", () => {
  it("runs the startup env assertions", async () => {
    vi.resetModules();

    const assertStartupProductionCoreEnvConfigured = vi.fn();
    const dailyDigestStart = vi.fn();
    const schedulerStart = vi.fn();
    const weeklyPerformanceStart = vi.fn();

    vi.doMock("@/lib/env.server", () => ({
      assertStartupProductionCoreEnvConfigured
    }));
    vi.doMock("@/lib/runtime/daily-digest-scheduler", () => ({
      dailyDigestScheduler: {
        start: dailyDigestStart
      }
    }));
    vi.doMock("@/lib/runtime/growth-lifecycle-scheduler", () => ({
      growthLifecycleScheduler: {
        start: schedulerStart
      }
    }));
    vi.doMock("@/lib/runtime/weekly-performance-scheduler", () => ({
      weeklyPerformanceScheduler: {
        start: weeklyPerformanceStart
      }
    }));

    const { startNodeRuntimeServices } = await import("@/lib/runtime/startup-orchestrator");
    await startNodeRuntimeServices();

    expect(assertStartupProductionCoreEnvConfigured).toHaveBeenCalledTimes(1);
    expect(dailyDigestStart).toHaveBeenCalledTimes(1);
    expect(schedulerStart).toHaveBeenCalledTimes(1);
    expect(weeklyPerformanceStart).toHaveBeenCalledTimes(1);
  });
});

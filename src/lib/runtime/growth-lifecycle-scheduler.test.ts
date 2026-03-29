describe("growth lifecycle scheduler", () => {
  it("starts once and runs lifecycle emails on an interval", async () => {
    vi.useFakeTimers();
    vi.resetModules();
    (globalThis as typeof globalThis & { __chatlyGrowthLifecycleScheduler__?: unknown })
      .__chatlyGrowthLifecycleScheduler__ = undefined;

    const runScheduledGrowthLifecycleEmails = vi.fn().mockResolvedValue(undefined);
    vi.doMock("@/lib/growth-outreach-runner", () => ({
      runScheduledGrowthLifecycleEmails
    }));

    const { growthLifecycleScheduler } = await import("@/lib/runtime/growth-lifecycle-scheduler");

    growthLifecycleScheduler.start();
    await vi.runAllTicks();

    expect(runScheduledGrowthLifecycleEmails).toHaveBeenCalledTimes(1);

    growthLifecycleScheduler.start();
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

    expect(runScheduledGrowthLifecycleEmails).toHaveBeenCalledTimes(2);

    growthLifecycleScheduler.stop();
    vi.useRealTimers();
  });

  it("skips overlapping lifecycle runs", async () => {
    vi.useFakeTimers();
    vi.resetModules();
    (globalThis as typeof globalThis & { __chatlyGrowthLifecycleScheduler__?: unknown })
      .__chatlyGrowthLifecycleScheduler__ = undefined;

    let resolveRun: (() => void) | null = null;
    const runScheduledGrowthLifecycleEmails = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRun = resolve;
        })
    );
    vi.doMock("@/lib/growth-outreach-runner", () => ({
      runScheduledGrowthLifecycleEmails
    }));

    const { growthLifecycleScheduler } = await import("@/lib/runtime/growth-lifecycle-scheduler");

    growthLifecycleScheduler.start();
    await vi.runAllTicks();
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

    expect(runScheduledGrowthLifecycleEmails).toHaveBeenCalledTimes(1);

    resolveRun?.();
    await vi.runAllTicks();

    growthLifecycleScheduler.stop();
    vi.useRealTimers();
  });
});

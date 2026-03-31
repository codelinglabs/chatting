async function flushAsyncImports() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe("weekly performance scheduler", () => {
  it("starts once and runs weekly emails on an interval", async () => {
    vi.useFakeTimers();
    vi.resetModules();
    (globalThis as typeof globalThis & { __chatlyWeeklyPerformanceScheduler__?: unknown })
      .__chatlyWeeklyPerformanceScheduler__ = undefined;

    const runScheduledWeeklyPerformanceEmails = vi.fn().mockResolvedValue(undefined);
    vi.doMock("@/lib/weekly-performance", () => ({
      runScheduledWeeklyPerformanceEmails
    }));
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

    const { weeklyPerformanceScheduler } = await import("@/lib/runtime/weekly-performance-scheduler");

    weeklyPerformanceScheduler.start();
    await flushAsyncImports();
    const afterStart = runScheduledWeeklyPerformanceEmails.mock.calls.length;

    weeklyPerformanceScheduler.start();
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    await flushAsyncImports();

    expect(runScheduledWeeklyPerformanceEmails.mock.calls.length).toBeGreaterThan(afterStart);

    weeklyPerformanceScheduler.stop();
    setIntervalSpy.mockRestore();
    vi.useRealTimers();
  });

  it("skips overlapping weekly runs", async () => {
    vi.useFakeTimers();
    vi.resetModules();
    (globalThis as typeof globalThis & { __chatlyWeeklyPerformanceScheduler__?: unknown })
      .__chatlyWeeklyPerformanceScheduler__ = undefined;

    let resolveRun: (() => void) | null = null;
    const runScheduledWeeklyPerformanceEmails = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRun = resolve;
        })
    );
    vi.doMock("@/lib/weekly-performance", () => ({
      runScheduledWeeklyPerformanceEmails
    }));

    const { weeklyPerformanceScheduler } = await import("@/lib/runtime/weekly-performance-scheduler");

    weeklyPerformanceScheduler.start();
    await flushAsyncImports();
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    await flushAsyncImports();

    expect(runScheduledWeeklyPerformanceEmails).toHaveBeenCalledTimes(1);

    resolveRun?.();
    await flushAsyncImports();

    weeklyPerformanceScheduler.stop();
    vi.useRealTimers();
  });
});

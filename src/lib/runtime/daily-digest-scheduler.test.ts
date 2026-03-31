async function flushAsyncImports() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe("daily digest scheduler", () => {
  it("starts once and runs digests on an interval", async () => {
    vi.useFakeTimers();
    vi.resetModules();
    (globalThis as typeof globalThis & { __chatlyDailyDigestScheduler__?: unknown })
      .__chatlyDailyDigestScheduler__ = undefined;

    const runScheduledDailyDigests = vi.fn().mockResolvedValue(undefined);
    vi.doMock("@/lib/daily-digest", () => ({
      runScheduledDailyDigests
    }));
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

    const { dailyDigestScheduler } = await import("@/lib/runtime/daily-digest-scheduler");

    dailyDigestScheduler.start();
    await flushAsyncImports();
    const afterStart = runScheduledDailyDigests.mock.calls.length;

    dailyDigestScheduler.start();
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    await flushAsyncImports();

    expect(runScheduledDailyDigests.mock.calls.length).toBeGreaterThan(afterStart);

    dailyDigestScheduler.stop();
    setIntervalSpy.mockRestore();
    vi.useRealTimers();
  });

  it("skips overlapping digest runs", async () => {
    vi.useFakeTimers();
    vi.resetModules();
    (globalThis as typeof globalThis & { __chatlyDailyDigestScheduler__?: unknown })
      .__chatlyDailyDigestScheduler__ = undefined;

    let resolveRun: (() => void) | null = null;
    const runScheduledDailyDigests = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRun = resolve;
        })
    );
    vi.doMock("@/lib/daily-digest", () => ({
      runScheduledDailyDigests
    }));

    const { dailyDigestScheduler } = await import("@/lib/runtime/daily-digest-scheduler");

    dailyDigestScheduler.start();
    await flushAsyncImports();
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    await flushAsyncImports();

    expect(runScheduledDailyDigests).toHaveBeenCalledTimes(1);

    resolveRun?.();
    await flushAsyncImports();

    dailyDigestScheduler.stop();
    vi.useRealTimers();
  });
});

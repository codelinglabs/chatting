describe("env.server validation caching", () => {
  it("reuses startup and stripe validation caches when the environment matches", async () => {
    vi.resetModules();
    const getMissingRequiredEnvVars = vi.fn()
      .mockReturnValueOnce([])
      .mockReturnValueOnce([])
      .mockReturnValueOnce(["STRIPE_SECRET_KEY"]);
    vi.doMock("@/lib/env", () => ({ getRuntimeEnvironment: () => "production" }));
    vi.doMock("@/lib/env-server/core", () => ({ getMissingRequiredEnvVars }));

    const module = await import("@/lib/env-server/validation");

    expect(() => module.assertStartupProductionCoreEnvConfigured({ environment: "production" })).not.toThrow();
    expect(() => module.assertStartupProductionCoreEnvConfigured({ environment: "production" })).not.toThrow();
    expect(getMissingRequiredEnvVars).toHaveBeenCalledTimes(1);

    expect(() => module.assertStripeBillingEnvConfigured({ environment: "development" })).not.toThrow();
    expect(() => module.assertStripeBillingEnvConfigured({ environment: "development" })).not.toThrow();
    expect(getMissingRequiredEnvVars).toHaveBeenCalledTimes(2);

    expect(() => module.assertStripeBillingEnvConfigured({ environment: "production" })).toThrow("[StripeBillingConfig]");
    expect(getMissingRequiredEnvVars).toHaveBeenCalledTimes(3);
  });

  it("skips R2 checks outside production and caches successful production validation", async () => {
    vi.resetModules();
    const getMissingRequiredEnvVars = vi.fn()
      .mockReturnValueOnce([])
      .mockReturnValueOnce(["R2_ACCOUNT_ID"]);
    vi.doMock("@/lib/env", () => ({ getRuntimeEnvironment: () => "development" }));
    vi.doMock("@/lib/env-server/core", () => ({ getMissingRequiredEnvVars }));

    const module = await import("@/lib/env-server/validation");

    expect(() => module.assertR2EnvConfigured({ environment: "development" })).not.toThrow();
    expect(getMissingRequiredEnvVars).not.toHaveBeenCalled();

    expect(() => module.assertR2EnvConfigured({ environment: "production" })).not.toThrow();
    expect(() => module.assertR2EnvConfigured({ environment: "production" })).not.toThrow();
    expect(getMissingRequiredEnvVars).toHaveBeenCalledTimes(1);

    expect(() =>
      module.assertR2EnvConfigured({
        environment: "production",
        cache: false
      })
    ).toThrow("[R2Config]");
    expect(getMissingRequiredEnvVars).toHaveBeenCalledTimes(2);
  });
});

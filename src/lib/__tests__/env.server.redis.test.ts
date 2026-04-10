describe("env.server redis live validation", () => {
  it("requires redis live env vars in every environment and caches successful validation", async () => {
    vi.resetModules();
    const getMissingEnvVarsForGroup = vi.fn()
      .mockReturnValueOnce([])
      .mockReturnValueOnce(["REDIS_URL"]);
    vi.doMock("@/lib/env", () => ({ getRuntimeEnvironment: () => "development" }));
    vi.doMock("@/lib/env-server/groups", () => ({ getMissingEnvVarsForGroup }));

    const module = await import("@/lib/env-server/validation");

    expect(() => module.assertRedisLiveEnvConfigured({ environment: "development" })).not.toThrow();
    expect(() => module.assertRedisLiveEnvConfigured({ environment: "development" })).not.toThrow();
    expect(getMissingEnvVarsForGroup).toHaveBeenCalledTimes(1);

    expect(() =>
      module.assertRedisLiveEnvConfigured({
        environment: "development",
        cache: false
      })
    ).toThrow("[RedisLiveConfig]");
    expect(getMissingEnvVarsForGroup).toHaveBeenCalledTimes(2);
  });
});

describe("onboarding data flows", () => {
  it("reads, updates, and composes onboarding state", async () => {
    vi.resetModules();
    const updateUserOnboardingStep = vi.fn().mockResolvedValue(undefined);
    vi.doMock("@/lib/repositories/onboarding-repository", () => ({
      findUserOnboardingState: vi.fn().mockResolvedValueOnce({ onboarding_step: "team" }).mockResolvedValueOnce({ onboarding_step: "install" }).mockResolvedValueOnce({ onboarding_step: "done" }),
      updateUserOnboardingStep
    }));
    vi.doMock("@/lib/data/sites", () => ({ listSitesForUser: vi.fn().mockResolvedValue([{ id: "site_1" }]) }));

    const module = await import("@/lib/data/onboarding");
    await expect(module.getUserOnboardingStep("user_1")).resolves.toBe("customize");
    await expect(module.getPostAuthPath("user_1")).resolves.toBe("/onboarding?step=install");
    await expect(module.setUserOnboardingStep("user_1", "done")).resolves.toBeUndefined();
    await expect(module.getOnboardingData("user_1")).resolves.toEqual({ step: "done", site: { id: "site_1" } });

    expect(updateUserOnboardingStep).toHaveBeenCalledWith("user_1", "done");
  });
});

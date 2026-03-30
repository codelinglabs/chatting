describe("dashboard growth data", () => {
  afterEach(() => vi.useRealTimers());

  it("builds growth data from snapshot, billing, and helper builders", async () => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-29T12:00:00.000Z"));
    vi.doMock("@/lib/data/billing", () => ({ getDashboardBillingSummary: vi.fn().mockResolvedValue({ planKey: "growth" }) }));
    vi.doMock("@/lib/repositories/dashboard-growth-repository", () => ({
      getDashboardGrowthSnapshot: vi.fn().mockResolvedValue({
        total_conversations: "12",
        conversations_last_7_days: "5",
        conversations_previous_7_days: "4",
        login_sessions_last_7_days: "6",
        first_conversation_at: "2026-03-20T12:00:00.000Z",
        last_login_at: "2026-03-28T12:00:00.000Z"
      })
    }));
    vi.doMock("@/lib/data/dashboard-growth-activation-health", () => ({
      buildActivation: vi.fn().mockReturnValue({ status: "active" }),
      buildHealth: vi.fn().mockReturnValue({ status: "healthy" })
    }));
    vi.doMock("@/lib/data/dashboard-growth-expansion", () => ({
      buildExpansion: vi.fn().mockReturnValue({ prompts: ["upgrade"] })
    }));

    const module = await import("@/lib/data/dashboard-growth");
    await expect(module.getDashboardGrowthData("user_1", "2026-03-01T00:00:00.000Z", true, 45)).resolves.toEqual({
      activation: { status: "active" },
      health: { status: "healthy" },
      expansion: { prompts: ["upgrade"] }
    });
  });
});

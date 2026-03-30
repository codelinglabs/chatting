const mocks = vi.hoisted(() => ({
  downgradeExpiredGrowthTrialWorkspace: vi.fn(),
  listExpiredGrowthTrialWorkspaceRows: vi.fn()
}));

vi.mock("@/lib/repositories/billing-lifecycle-repository", () => ({
  downgradeExpiredGrowthTrialWorkspace: mocks.downgradeExpiredGrowthTrialWorkspace,
  listExpiredGrowthTrialWorkspaceRows: mocks.listExpiredGrowthTrialWorkspaceRows
}));

import { runExpiredGrowthTrialDowngrades } from "@/lib/billing-lifecycle";

describe("billing lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("downgrades each expired unpaid growth trial workspace", async () => {
    mocks.listExpiredGrowthTrialWorkspaceRows.mockResolvedValueOnce([
      { user_id: "user_1" },
      { user_id: "user_2" }
    ]);

    const result = await runExpiredGrowthTrialDowngrades(new Date("2026-03-29T12:00:00.000Z"));

    expect(mocks.listExpiredGrowthTrialWorkspaceRows).toHaveBeenCalledWith("2026-03-29T12:00:00.000Z");
    expect(mocks.downgradeExpiredGrowthTrialWorkspace).toHaveBeenNthCalledWith(1, "user_1");
    expect(mocks.downgradeExpiredGrowthTrialWorkspace).toHaveBeenNthCalledWith(2, "user_2");
    expect(result).toEqual({ downgradedWorkspaces: 2 });
  });
});

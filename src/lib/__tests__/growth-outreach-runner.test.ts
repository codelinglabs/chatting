const mocks = vi.hoisted(() => ({
  runExpiredGrowthTrialDowngrades: vi.fn(),
  listGrowthLifecycleSiteRows: vi.fn(),
  maybeSendSiteLifecycleEmails: vi.fn(),
  maybeSendTrialEndingReminder: vi.fn(),
  maybeSendTrialExpiredEmail: vi.fn()
}));

vi.mock("@/lib/billing-lifecycle", () => ({
  runExpiredGrowthTrialDowngrades: mocks.runExpiredGrowthTrialDowngrades
}));

vi.mock("@/lib/repositories/growth-outreach-repository", () => ({
  listGrowthLifecycleSiteRows: mocks.listGrowthLifecycleSiteRows
}));

vi.mock("@/lib/growth-outreach", () => ({
  maybeSendSiteLifecycleEmails: mocks.maybeSendSiteLifecycleEmails
}));
vi.mock("@/lib/growth-trial-outreach", () => ({
  maybeSendTrialEndingReminder: mocks.maybeSendTrialEndingReminder,
  maybeSendTrialExpiredEmail: mocks.maybeSendTrialExpiredEmail
}));

import { runScheduledGrowthLifecycleEmails } from "@/lib/growth-outreach-runner";

describe("growth outreach runner", () => {
  it("processes each scheduled lifecycle site once", async () => {
    mocks.runExpiredGrowthTrialDowngrades.mockResolvedValueOnce({
      downgradedWorkspaces: 1,
      expiredTrials: [{ userId: "user_9", trialEndedAt: "2026-03-29T00:00:00.000Z" }]
    });
    mocks.listGrowthLifecycleSiteRows.mockResolvedValueOnce([
      { site_id: "site_1", user_id: "user_1" },
      { site_id: "site_2", user_id: "user_2" }
    ]);

    const result = await runScheduledGrowthLifecycleEmails();

    expect(mocks.runExpiredGrowthTrialDowngrades).toHaveBeenCalledTimes(1);
    expect(mocks.maybeSendTrialExpiredEmail).toHaveBeenCalledWith({
      userId: "user_9",
      trialEndedAt: "2026-03-29T00:00:00.000Z"
    });
    expect(mocks.maybeSendSiteLifecycleEmails).toHaveBeenCalledTimes(2);
    expect(mocks.maybeSendSiteLifecycleEmails).toHaveBeenNthCalledWith(1, "site_1");
    expect(mocks.maybeSendSiteLifecycleEmails).toHaveBeenNthCalledWith(2, "site_2");
    expect(mocks.maybeSendTrialEndingReminder).toHaveBeenNthCalledWith(1, "user_1");
    expect(mocks.maybeSendTrialEndingReminder).toHaveBeenNthCalledWith(2, "user_2");
    expect(result).toEqual({ processedSites: 2, downgradedWorkspaces: 1 });
  });
});

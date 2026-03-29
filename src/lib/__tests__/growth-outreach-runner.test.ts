const mocks = vi.hoisted(() => ({
  listGrowthLifecycleSiteRows: vi.fn(),
  maybeSendSiteLifecycleEmails: vi.fn()
}));

vi.mock("@/lib/repositories/growth-outreach-repository", () => ({
  listGrowthLifecycleSiteRows: mocks.listGrowthLifecycleSiteRows
}));

vi.mock("@/lib/growth-outreach", () => ({
  maybeSendSiteLifecycleEmails: mocks.maybeSendSiteLifecycleEmails
}));

import { runScheduledGrowthLifecycleEmails } from "@/lib/growth-outreach-runner";

describe("growth outreach runner", () => {
  it("processes each scheduled lifecycle site once", async () => {
    mocks.listGrowthLifecycleSiteRows.mockResolvedValueOnce([
      { site_id: "site_1", user_id: "user_1" },
      { site_id: "site_2", user_id: "user_2" }
    ]);

    const result = await runScheduledGrowthLifecycleEmails();

    expect(mocks.maybeSendSiteLifecycleEmails).toHaveBeenCalledTimes(2);
    expect(mocks.maybeSendSiteLifecycleEmails).toHaveBeenNthCalledWith(1, "site_1");
    expect(mocks.maybeSendSiteLifecycleEmails).toHaveBeenNthCalledWith(2, "site_2");
    expect(result).toEqual({ processedSites: 2 });
  });
});

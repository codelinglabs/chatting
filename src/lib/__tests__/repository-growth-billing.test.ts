const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import { findBillingInsightsRow } from "@/lib/repositories/billing-insights-repository";
import {
  downgradeExpiredGrowthTrialWorkspace,
  listExpiredGrowthTrialWorkspaceRows
} from "@/lib/repositories/billing-lifecycle-repository";
import {
  findGrowthEmailNudgeRow,
  upsertGrowthEmailNudgeRow
} from "@/lib/repositories/growth-email-nudges-repository";
import { listGrowthLifecycleSiteRows } from "@/lib/repositories/growth-outreach-repository";

describe("growth and billing repositories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists lifecycle sites and reads growth email nudges with a null fallback", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ site_id: "site_1", user_id: "user_1" }] })
      .mockResolvedValueOnce({ rows: [{ user_id: "user_1", nudge_key: "trial", last_sent_at: "2026-03-29T10:00:00.000Z" }] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(listGrowthLifecycleSiteRows()).resolves.toEqual([{ site_id: "site_1", user_id: "user_1" }]);
    await expect(findGrowthEmailNudgeRow("user_1", "trial")).resolves.toMatchObject({ nudge_key: "trial" });
    await expect(findGrowthEmailNudgeRow("user_2", "trial")).resolves.toBeNull();

    expect(mocks.query.mock.calls[0]?.[0]).toContain("SELECT DISTINCT ON (s.user_id)");
    expect(mocks.query.mock.calls[1]?.[1]).toEqual(["user_1", "trial"]);
  });

  it("writes growth email nudges and downgrades expired trials", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ user_id: "user_1" }] })
      .mockResolvedValueOnce({ rows: [] });

    await upsertGrowthEmailNudgeRow("user_1", "trial");
    await expect(listExpiredGrowthTrialWorkspaceRows("2026-04-12T00:00:00.000Z")).resolves.toEqual([
      { user_id: "user_1" }
    ]);
    await downgradeExpiredGrowthTrialWorkspace("user_1");

    expect(mocks.query.mock.calls[0]?.[0]).toContain("INSERT INTO growth_email_nudges");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual(["user_1", "trial"]);
    expect(mocks.query.mock.calls[1]?.[0]).toContain("stripe_status IN ('canceled', 'incomplete_expired')");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("SET");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("plan_key = 'starter'");
  });

  it("returns billing insights rows and the zeroed default fallback", async () => {
    mocks.query
      .mockResolvedValueOnce({
        rows: [
          {
            conversation_count: "12",
            site_count: "3",
            message_count: "41",
            avg_response_seconds: "18"
          }
        ]
      })
      .mockResolvedValueOnce({ rows: [] });

    await expect(findBillingInsightsRow("user_1")).resolves.toEqual({
      conversation_count: "12",
      site_count: "3",
      message_count: "41",
      avg_response_seconds: "18"
    });
    await expect(findBillingInsightsRow("user_2")).resolves.toEqual({
      conversation_count: "0",
      site_count: "0",
      message_count: "0",
      avg_response_seconds: null
    });

    expect(mocks.query.mock.calls[0]?.[0]).toContain("WITH workspace_sites AS");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual(["user_1"]);
  });
});

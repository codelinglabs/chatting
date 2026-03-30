const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  claimTemplateDelivery,
  deletePendingTemplateDelivery,
  findConversationTemplateContext,
  listConversationTranscriptRows,
  markTemplateDeliverySent
} from "@/lib/repositories/conversation-template-email-repository";
import { getDashboardGrowthSnapshot } from "@/lib/repositories/dashboard-growth-repository";
import {
  getConversationTotalsForUser,
  getRatedConversationCountForUser,
  listTopTagsForUser
} from "@/lib/repositories/stats-repository";

describe("dashboard growth, stats, and conversation template repositories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns dashboard growth rows and the empty snapshot fallback", async () => {
    mocks.query
      .mockResolvedValueOnce({
        rows: [
          {
            total_conversations: "14",
            first_conversation_at: "2026-03-01T10:00:00.000Z",
            conversations_last_7_days: "4",
            conversations_previous_7_days: "2",
            login_sessions_last_7_days: "7",
            last_login_at: "2026-03-29T10:00:00.000Z"
          }
        ]
      })
      .mockResolvedValueOnce({ rows: [] });

    await expect(getDashboardGrowthSnapshot("user_1")).resolves.toMatchObject({
      total_conversations: "14",
      login_sessions_last_7_days: "7"
    });
    await expect(getDashboardGrowthSnapshot("user_2")).resolves.toEqual({
      total_conversations: "0",
      first_conversation_at: null,
      conversations_last_7_days: "0",
      conversations_previous_7_days: "0",
      login_sessions_last_7_days: "0",
      last_login_at: null
    });

    expect(mocks.query.mock.calls[0]?.[0]).toContain("CROSS JOIN");
  });

  it("reads totals, ratings, and top tags for the stats dashboard", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ total: "12", answered: "9" }] })
      .mockResolvedValueOnce({ rows: [{ rated: "5" }] })
      .mockResolvedValueOnce({ rows: [{ tag: "pricing", count: "3" }] });

    await expect(getConversationTotalsForUser("user_1")).resolves.toEqual({ total: "12", answered: "9" });
    await expect(getRatedConversationCountForUser("user_1")).resolves.toBe("5");
    await expect(listTopTagsForUser("user_1")).resolves.toEqual([{ tag: "pricing", count: "3" }]);

    expect(mocks.query.mock.calls[0]?.[0]).toContain("COUNT(*) FILTER");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("FROM feedback f");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("LIMIT 4");
  });

  it("reads conversation template context and transcript rows", async () => {
    mocks.query
      .mockResolvedValueOnce({
        rows: [
          {
            conversation_id: "conv_1",
            user_id: "user_1",
            site_name: "Docs",
            domain: "docs.usechatting.com",
            email: "hello@example.com",
            plan_key: "growth"
          }
        ]
      })
      .mockResolvedValueOnce({
        rows: [{ id: "msg_1", sender: "user", content: "Hi", created_at: "2026-03-29T10:00:00.000Z" }]
      });

    await expect(findConversationTemplateContext("conv_1")).resolves.toMatchObject({ site_name: "Docs" });
    await expect(listConversationTranscriptRows("conv_1")).resolves.toEqual([
      { id: "msg_1", sender: "user", content: "Hi", created_at: "2026-03-29T10:00:00.000Z" }
    ]);

    expect(mocks.query.mock.calls[0]?.[0]).toContain("LEFT JOIN billing_accounts");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("ORDER BY created_at ASC");
  });

  it("claims, marks, and deletes template deliveries", async () => {
    mocks.query.mockResolvedValueOnce({ rowCount: 1 }).mockResolvedValue({ rows: [] });

    await expect(
      claimTemplateDelivery({
        deliveryId: "delivery_1",
        conversationId: "conv_1",
        templateKey: "follow_up",
        deliveryKey: "follow_up:conv_1",
        recipientEmail: "hello@example.com"
      })
    ).resolves.toBe(true);
    await markTemplateDeliverySent("follow_up:conv_1");
    await deletePendingTemplateDelivery("follow_up:conv_1");

    expect(mocks.query.mock.calls[0]?.[0]).toContain("ON CONFLICT (delivery_key) DO NOTHING");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("SET status = 'sent'");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("AND status = 'pending'");
  });
});

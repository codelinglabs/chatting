const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  findBillingSummaryRow,
  findDashboardSettingsRow,
  findEmailTemplateSettingsRow,
  findNotificationSettingsRow,
  findUserIdByEmailExcludingUser,
  listPendingTeamInviteRows
} from "@/lib/repositories/settings-repository";

describe("settings repository reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns notification, email template, and dashboard settings rows with null fallback", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ email: "alex@example.com", notification_email: "team@example.com" }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ email: "alex@example.com", email_signature: "Best,\nAlex" }] })
      .mockResolvedValueOnce({
        rows: [{ user_id: "user_1", email: "alex@example.com", created_at: "2026-03-29T10:00:00.000Z" }]
      })
      .mockResolvedValueOnce({ rows: [] });

    await expect(findNotificationSettingsRow("user_1")).resolves.toMatchObject({
      notification_email: "team@example.com"
    });
    await expect(findNotificationSettingsRow("user_2")).resolves.toBeNull();
    await expect(findEmailTemplateSettingsRow("user_1")).resolves.toMatchObject({
      email_signature: "Best,\nAlex"
    });
    await expect(findDashboardSettingsRow("user_1")).resolves.toMatchObject({
      user_id: "user_1"
    });
    await expect(findDashboardSettingsRow("user_2")).resolves.toBeNull();

    expect(mocks.query.mock.calls[0]?.[0]).toContain("us.notification_email");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("us.email_signature");
    expect(mocks.query.mock.calls[3]?.[0]).toContain("LEFT JOIN user_presence up");
  });

  it("lists pending invites and billing summaries and finds duplicate emails", async () => {
    mocks.query
      .mockResolvedValueOnce({
        rows: [{ id: "invite_1", email: "sam@example.com", role: "member", status: "pending" }]
      })
      .mockResolvedValueOnce({ rows: [{ conversation_count: "12", site_count: "3" }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: "user_2" }] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(listPendingTeamInviteRows("owner_1")).resolves.toHaveLength(1);
    await expect(findBillingSummaryRow("owner_1")).resolves.toEqual({
      conversation_count: "12",
      site_count: "3"
    });
    await expect(findBillingSummaryRow("owner_2")).resolves.toEqual({
      conversation_count: "0",
      site_count: "0"
    });
    await expect(findUserIdByEmailExcludingUser("sam@example.com", "user_1")).resolves.toBe("user_2");
    await expect(findUserIdByEmailExcludingUser("nobody@example.com", "user_1")).resolves.toBeNull();

    expect(mocks.query.mock.calls[0]?.[0]).toContain("status = 'pending'");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("COUNT(DISTINCT s.id)::text AS site_count");
    expect(mocks.query.mock.calls[3]?.[0]).toContain("AND id <> $2");
  });
});

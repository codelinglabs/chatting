const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import { upsertUserPresence } from "@/lib/repositories/presence-repository";
import {
  findSiteOwnerRow,
  findVisitorPresenceSessionRow,
  listVisitorPresenceRowsForUser,
  upsertVisitorPresenceSessionRow
} from "@/lib/repositories/visitor-presence-repository";

describe("presence repositories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts dashboard user presence", async () => {
    mocks.query.mockResolvedValueOnce({ rows: [] });

    await upsertUserPresence("user_1");

    expect(mocks.query.mock.calls[0]?.[0]).toContain("INSERT INTO user_presence");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual(["user_1"]);
  });

  it("reads owner and existing visitor presence rows", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ user_id: "owner_1" }] })
      .mockResolvedValueOnce({
        rows: [
          {
            site_id: "site_1",
            session_id: "sess_1",
            conversation_id: null,
            email: null,
            current_page_url: "/pricing",
            referrer: "google",
            user_agent: "Safari",
            country: "GB",
            region: "London",
            city: "London",
            timezone: "Europe/London",
            locale: "en-GB",
            started_at: "2026-03-01T10:00:00.000Z",
            last_seen_at: "2026-03-01T10:05:00.000Z"
          }
        ]
      });

    await expect(findSiteOwnerRow("site_1")).resolves.toEqual({ user_id: "owner_1" });
    await expect(findVisitorPresenceSessionRow("site_1", "sess_1")).resolves.toMatchObject({
      current_page_url: "/pricing"
    });

    expect(mocks.query.mock.calls[0]?.[0]).toContain("FROM sites");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("FROM visitor_presence_sessions");
  });

  it("writes and lists visitor presence rows", async () => {
    const row = {
      site_id: "site_1",
      session_id: "sess_1",
      conversation_id: "conv_1",
      email: "hello@example.com",
      current_page_url: "/pricing",
      referrer: "google",
      user_agent: "Safari",
      country: "GB",
      region: "London",
      city: "London",
      timezone: "Europe/London",
      locale: "en-GB",
      started_at: "2026-03-01T10:00:00.000Z",
      last_seen_at: "2026-03-01T10:05:00.000Z"
    };
    mocks.query.mockResolvedValueOnce({ rows: [row] }).mockResolvedValueOnce({ rows: [row] });

    await expect(
      upsertVisitorPresenceSessionRow({
        siteId: "site_1",
        sessionId: "sess_1",
        conversationId: "conv_1",
        email: "hello@example.com",
        currentPageUrl: "/pricing",
        referrer: "google",
        userAgent: "Safari",
        country: "GB",
        region: "London",
        city: "London",
        timezone: "Europe/London",
        locale: "en-GB"
      })
    ).resolves.toMatchObject({ session_id: "sess_1" });
    await expect(listVisitorPresenceRowsForUser("user_1")).resolves.toEqual([row]);

    expect(mocks.query.mock.calls[0]?.[0]).toContain("ON CONFLICT (site_id, session_id)");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("ORDER BY vps.last_seen_at DESC");
  });
});

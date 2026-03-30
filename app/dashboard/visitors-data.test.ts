import { buildVisitorRecords } from "./visitors-data";

describe("buildVisitorRecords", () => {
  it("merges passive live sessions into conversation-backed visitors", () => {
    const records = buildVisitorRecords(
      [
        {
          id: "conv_1",
          siteId: "site_1",
          siteName: "Chatting",
          email: "alex@example.com",
          sessionId: "session_1",
          status: "open",
          createdAt: "2026-03-29T10:00:00.000Z",
          updatedAt: "2026-03-29T10:05:00.000Z",
          pageUrl: "/pricing",
          referrer: "https://google.com",
          userAgent: "Mozilla/5.0 Chrome Mac OS",
          country: "United Kingdom",
          region: "England",
          city: "London",
          timezone: "Europe/London",
          locale: "en-GB",
          lastMessageAt: "2026-03-29T10:05:00.000Z",
          lastMessagePreview: "Hello",
          unreadCount: 1,
          rating: null,
          tags: ["lead"]
        }
      ],
      [
        {
          siteId: "site_1",
          sessionId: "session_1",
          conversationId: "conv_1",
          email: "alex@example.com",
          currentPageUrl: "/docs",
          referrer: "https://google.com",
          userAgent: "Mozilla/5.0 Chrome Mac OS",
          country: "United Kingdom",
          region: "England",
          city: "London",
          timezone: "Europe/London",
          locale: "en-GB",
          startedAt: "2026-03-29T10:00:00.000Z",
          lastSeenAt: new Date().toISOString()
        }
      ]
    );

    expect(records).toHaveLength(1);
    expect(records[0].currentPage).toBe("/docs");
    expect(records[0].latestConversationId).toBe("conv_1");
    expect(records[0].online).toBe(true);
  });

  it("creates visitor records for passive sessions without conversations", () => {
    const records = buildVisitorRecords([], [
      {
        siteId: "site_1",
        sessionId: "session_2",
        conversationId: null,
        email: null,
        currentPageUrl: "/pricing",
        referrer: "https://google.com",
        userAgent: "Mozilla/5.0 Chrome Mac OS",
        country: "United States",
        region: "California",
        city: "San Francisco",
        timezone: "America/Los_Angeles",
        locale: "en-US",
        startedAt: "2026-03-29T10:00:00.000Z",
        lastSeenAt: new Date().toISOString()
      }
    ]);

    expect(records).toHaveLength(1);
    expect(records[0].hasConversation).toBe(false);
    expect(records[0].latestConversationId).toBeNull();
    expect(records[0].currentPage).toBe("/pricing");
  });

  it("does not duplicate page history for same-page heartbeats", () => {
    const records = buildVisitorRecords(
      [
        {
          id: "conv_1",
          siteId: "site_1",
          siteName: "Chatting",
          email: "alex@example.com",
          sessionId: "session_1",
          status: "open",
          createdAt: "2026-03-29T10:00:00.000Z",
          updatedAt: "2026-03-29T10:05:00.000Z",
          pageUrl: "/pricing",
          referrer: "https://google.com",
          userAgent: "Mozilla/5.0 Chrome Mac OS",
          country: "United Kingdom",
          region: "England",
          city: "London",
          timezone: "Europe/London",
          locale: "en-GB",
          lastMessageAt: "2026-03-29T10:05:00.000Z",
          lastMessagePreview: "Hello",
          unreadCount: 1,
          rating: null,
          tags: ["lead"]
        }
      ],
      [
        {
          siteId: "site_1",
          sessionId: "session_1",
          conversationId: "conv_1",
          email: "alex@example.com",
          currentPageUrl: "/docs",
          referrer: "https://google.com",
          userAgent: "Mozilla/5.0 Chrome Mac OS",
          country: "United Kingdom",
          region: "England",
          city: "London",
          timezone: "Europe/London",
          locale: "en-GB",
          startedAt: "2026-03-29T10:00:00.000Z",
          lastSeenAt: "2026-03-29T10:06:00.000Z"
        },
        {
          siteId: "site_1",
          sessionId: "session_1",
          conversationId: "conv_1",
          email: "alex@example.com",
          currentPageUrl: "/docs",
          referrer: "https://google.com",
          userAgent: "Mozilla/5.0 Chrome Mac OS",
          country: "United Kingdom",
          region: "England",
          city: "London",
          timezone: "Europe/London",
          locale: "en-GB",
          startedAt: "2026-03-29T10:00:00.000Z",
          lastSeenAt: "2026-03-29T10:07:00.000Z"
        }
      ]
    );

    expect(records[0].pageHistory.filter((entry) => entry.page === "/docs")).toHaveLength(1);
  });

  it("keeps the newest live session as the current page", () => {
    const records = buildVisitorRecords([], [
      {
        siteId: "site_1",
        sessionId: "session_old",
        conversationId: null,
        email: "alex@example.com",
        currentPageUrl: "/pricing",
        referrer: "https://google.com",
        userAgent: "Mozilla/5.0 Chrome Mac OS",
        country: "United States",
        region: "California",
        city: "San Francisco",
        timezone: "America/Los_Angeles",
        locale: "en-US",
        startedAt: "2026-03-29T10:00:00.000Z",
        lastSeenAt: "2026-03-29T10:05:00.000Z"
      },
      {
        siteId: "site_1",
        sessionId: "session_new",
        conversationId: null,
        email: "alex@example.com",
        currentPageUrl: "/docs",
        referrer: "https://google.com",
        userAgent: "Mozilla/5.0 Chrome Mac OS",
        country: "United States",
        region: "California",
        city: "San Francisco",
        timezone: "America/Los_Angeles",
        locale: "en-US",
        startedAt: "2026-03-29T10:06:00.000Z",
        lastSeenAt: "2026-03-29T10:07:00.000Z"
      }
    ]);

    expect(records).toHaveLength(1);
    expect(records[0].currentPage).toBe("/docs");
  });

  it("keeps same-email visitors separate per site", () => {
    const records = buildVisitorRecords([
      {
        id: "conv_1",
        siteId: "site_1",
        siteName: "Primary",
        email: "alex@example.com",
        sessionId: "session_1",
        status: "open",
        createdAt: "2026-03-29T10:00:00.000Z",
        updatedAt: "2026-03-29T10:05:00.000Z",
        pageUrl: "/pricing",
        referrer: null,
        userAgent: null,
        country: null,
        region: null,
        city: null,
        timezone: null,
        locale: null,
        lastMessageAt: "2026-03-29T10:05:00.000Z",
        lastMessagePreview: "Hello",
        unreadCount: 1,
        rating: null,
        tags: []
      },
      {
        id: "conv_2",
        siteId: "site_2",
        siteName: "Secondary",
        email: "alex@example.com",
        sessionId: "session_2",
        status: "open",
        createdAt: "2026-03-29T11:00:00.000Z",
        updatedAt: "2026-03-29T11:05:00.000Z",
        pageUrl: "/docs",
        referrer: null,
        userAgent: null,
        country: null,
        region: null,
        city: null,
        timezone: null,
        locale: null,
        lastMessageAt: "2026-03-29T11:05:00.000Z",
        lastMessagePreview: "Hello",
        unreadCount: 1,
        rating: null,
        tags: []
      }
    ]);

    expect(records).toHaveLength(2);
    expect(records.map((record) => record.siteId).sort()).toEqual(["site_1", "site_2"]);
  });
});

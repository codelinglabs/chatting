import { buildVisitorRecords } from "./visitors-data";

function conversation(overrides: Record<string, unknown> = {}) {
  return {
    id: "conv_1",
    siteId: "site_1",
    siteName: "Chatting",
    email: "alex@example.com",
    sessionId: "session_1",
    status: "open",
    createdAt: "2026-03-29T10:00:00.000Z",
    updatedAt: "2026-03-29T10:10:00.000Z",
    pageUrl: "https://example.com/pricing",
    referrer: null,
    userAgent: null,
    country: "United Kingdom",
    region: "England",
    city: "London",
    timezone: "Europe/London",
    locale: "en-GB",
    lastMessageAt: "2026-03-29T10:10:00.000Z",
    lastMessagePreview: "Hello",
    unreadCount: 1,
    rating: null,
    tags: ["pricing"],
    ...overrides
  };
}

function session(overrides: Record<string, unknown> = {}) {
  return {
    siteId: "site_1",
    sessionId: "session_1",
    conversationId: null,
    email: null,
    currentPageUrl: "/pricing",
    referrer: null,
    userAgent: null,
    country: "United States",
    region: "California",
    city: "San Francisco",
    timezone: "America/Los_Angeles",
    locale: "en-US",
    startedAt: "2026-03-29T10:00:00.000Z",
    lastSeenAt: "2026-03-29T10:05:00.000Z",
    ...overrides
  };
}

describe("visitors data more", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-29T10:30:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("derives source, browser, and session metadata across visitor records", () => {
    const records = buildVisitorRecords([], [
      session({ email: "edge@example.com", referrer: null, userAgent: "Mozilla/5.0 Edg/123 Windows" }),
      session({ sessionId: "session_2", email: "safari@example.com", referrer: "https://mail.example", userAgent: "Mozilla/5.0 Safari iPhone", lastSeenAt: "2026-03-29T10:06:00.000Z" }),
      session({ sessionId: "session_3", email: "firefox@example.com", referrer: "https://twitter.com/chatting", userAgent: "Mozilla/5.0 Firefox Android", lastSeenAt: "2026-03-29T10:07:00.000Z" }),
      session({ sessionId: "session_4", referrer: "not-a-url", userAgent: "CustomAgent", currentPageUrl: null, lastSeenAt: "2026-03-29T10:08:00.000Z" })
    ]);

    expect(records.map(({ browser }) => browser)).toEqual([
      "Browser on OS",
      "Firefox on Android",
      "Safari on iOS",
      "Edge on Windows"
    ]);
    expect(records.map(({ sourceCategory }) => sourceCategory)).toEqual(["other", "social", "email", "direct"]);
    expect(records[0]).toMatchObject({ currentPage: "/", pagesViewed: 1, hasConversation: false });
  });

  it("builds conversation-backed records with deduped tags, returned flags, and merged sessions", () => {
    const records = buildVisitorRecords(
      [
        conversation({ id: "conv_1", email: null, referrer: "https://google.com", userAgent: "Mozilla/5.0 Chrome Mac OS", tags: ["sales", "pricing"] }),
        conversation({ id: "conv_2", email: null, pageUrl: "https://example.com/docs", updatedAt: "2026-03-29T10:20:00.000Z", referrer: "https://linkedin.com", userAgent: "Mozilla/5.0 Firefox Windows", tags: ["pricing", "bug"] })
      ],
      [
        session({ sessionId: "session_99", conversationId: "conv_2", email: "alex@example.com", currentPageUrl: "/docs", referrer: "https://google.com", userAgent: "Mozilla/5.0 Chrome Mac OS", lastSeenAt: "2026-03-29T10:25:00.000Z" }),
        session({ sessionId: "session_old", conversationId: "conv_2", email: "alex@example.com", currentPageUrl: "/docs", referrer: "https://google.com", userAgent: "Mozilla/5.0 Chrome Mac OS", lastSeenAt: "2026-03-29T10:15:00.000Z" })
      ]
    );

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      name: "Alex",
      currentPage: "/docs",
      latestConversationId: "conv_2",
      returnedVisitor: true,
      newVisitor: false,
      sourceCategory: "google",
      tags: ["bug", "pricing", "sales"]
    });
    expect(records[0].pageHistory.filter((entry) => entry.page === "/docs")).toHaveLength(1);
  });
});

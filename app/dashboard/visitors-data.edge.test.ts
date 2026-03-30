import { buildVisitorRecords, formatDuration } from "./visitors-data";

function conversation(overrides: Record<string, unknown> = {}) {
  return {
    id: "conv_1",
    siteId: "site_1",
    siteName: "Chatting",
    email: null,
    sessionId: "session_1",
    status: "open",
    createdAt: "2026-03-29T10:00:00.000Z",
    updatedAt: "2026-03-29T10:05:00.000Z",
    pageUrl: null,
    referrer: null,
    userAgent: null,
    country: null,
    region: null,
    city: null,
    timezone: null,
    locale: null,
    lastMessageAt: "2026-03-29T10:05:00.000Z",
    lastMessagePreview: "Hello",
    unreadCount: 0,
    rating: null,
    tags: [],
    ...overrides
  };
}

function session(overrides: Record<string, unknown> = {}) {
  return {
    siteId: "site_1",
    sessionId: "session_1",
    conversationId: null,
    email: null,
    currentPageUrl: null,
    referrer: null,
    userAgent: null,
    country: null,
    region: null,
    city: null,
    timezone: null,
    locale: null,
    startedAt: "2026-03-29T10:00:00.000Z",
    lastSeenAt: "2026-03-29T10:05:00.000Z",
    ...overrides
  };
}

describe("visitors data edge cases", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-29T10:30:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats durations across zero, seconds, minutes, and hours", () => {
    expect(formatDuration(Number.NaN)).toBe("0s");
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(125)).toBe("2m 05s");
    expect(formatDuration(3720)).toBe("1h 2m");
  });

  it("builds fallback visitor records for unknown browser, direct traffic, and google traffic", () => {
    const records = buildVisitorRecords([
      conversation(),
      conversation({
        id: "conv_2",
        siteId: "site_2",
        sessionId: "session_2",
        email: "alex@example.com",
        pageUrl: "https://example.com/pricing",
        referrer: "https://www.google.com/search?q=chat",
        userAgent: "Mozilla/5.0 Chrome Mac OS",
        updatedAt: "2026-03-29T10:10:00.000Z"
      })
    ]);

    expect(records[0]).toMatchObject({
      source: "google.com",
      sourceCategory: "google",
      browser: "Chrome on macOS"
    });
    expect(records[1]).toMatchObject({
      name: "Visitor",
      currentPage: "/",
      source: "Direct",
      browser: "Unknown browser"
    });
  });

  it("keeps newer record identity when an older session heartbeat arrives", () => {
    const [record] = buildVisitorRecords(
      [conversation({ email: "alex@example.com", pageUrl: "https://example.com/docs", updatedAt: "2026-03-29T10:20:00.000Z" })],
      [
        session({
          sessionId: "session_old",
          email: "alex@example.com",
          currentPageUrl: "/pricing",
          lastSeenAt: "2026-03-29T10:10:00.000Z"
        })
      ]
    );

    expect(record.id).toBe("email:site_1:alex@example.com");
    expect(record.sessionId).toBe("session_1");
    expect(record.currentPage).toBe("/pricing");
    expect(record.pageHistory[0]?.page).toBe("/pricing");
  });
});

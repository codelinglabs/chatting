import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams()
}));

vi.mock("./dashboard-shell", () => ({
  useDashboardNavigation: () => ({
    navigate: vi.fn()
  })
}));

import { DashboardVisitorsPage } from "./dashboard-visitors-page";

describe("dashboard visitors page", () => {
  it("renders live visitors and the recent visitors table", () => {
    const now = new Date().toISOString();

    const html = renderToStaticMarkup(
      <DashboardVisitorsPage
        initialConversations={[
          {
            id: "conv_1",
            siteId: "site_1",
            siteName: "Chatting",
            email: "alex@example.com",
            sessionId: "session_1",
            status: "open",
            createdAt: now,
            updatedAt: now,
            pageUrl: "/pricing",
            referrer: "google.com",
            userAgent: "Chrome on macOS",
            country: "United States",
            region: "California",
            city: "San Francisco",
            timezone: "America/Los_Angeles",
            locale: "en-US",
            lastMessageAt: now,
            lastMessagePreview: "Quick question about pricing...",
            unreadCount: 1,
            rating: 5,
            tags: ["lead", "pricing"]
          },
          {
            id: "conv_2",
            siteId: "site_1",
            siteName: "Chatting",
            email: "emma@example.com",
            sessionId: "session_2",
            status: "resolved",
            createdAt: now,
            updatedAt: now,
            pageUrl: "/features",
            referrer: "direct",
            userAgent: "Safari on iPhone",
            country: "United Kingdom",
            region: "England",
            city: "London",
            timezone: "Europe/London",
            locale: "en-GB",
            lastMessageAt: now,
            lastMessagePreview: "Is there a free trial?",
            unreadCount: 0,
            rating: null,
            tags: []
          }
        ]}
        initialLiveSessions={[
          {
            siteId: "site_1",
            sessionId: "session_3",
            conversationId: null,
            email: null,
            currentPageUrl: "/docs",
            referrer: "https://google.com",
            userAgent: "Mozilla/5.0 Chrome Mac OS",
            country: "United States",
            region: "California",
            city: "San Francisco",
            timezone: "America/Los_Angeles",
            locale: "en-US",
            startedAt: now,
            lastSeenAt: now
          }
        ]}
      />
    );

    expect(html).toContain("Live now");
    expect(html).toContain("All contacts");
    expect(html).toContain("Recent visitors");
    expect(html).toContain("Alex");
    expect(html).toContain("Emma");
    expect(html).toContain("/pricing");
    expect(html).toContain("/docs");
    expect(html).toContain("View visitor");
  });
});

import type { VisitorFilterState, VisitorRecord } from "./visitors-data";

export function createVisitor(overrides: Partial<VisitorRecord> = {}): VisitorRecord {
  return {
    id: "visitor_1",
    siteId: "site_1",
    sessionId: "session_1",
    name: "Alex Stone",
    initials: "AS",
    email: "alex@example.com",
    location: "London, England, UK",
    browser: "Chrome on macOS",
    timezone: "Europe/London",
    currentPage: "/pricing",
    source: "google.com",
    sourceCategory: "google",
    firstSeenAt: "2026-03-29T10:00:00.000Z",
    lastSeenAt: "2026-03-29T10:10:00.000Z",
    timeOnSiteSeconds: 185,
    pagesViewed: 3,
    conversationCount: 2,
    pageHistory: [
      { page: "/pricing", seenAt: "2026-03-29T10:10:00.000Z", durationSeconds: 120 }
    ],
    visitHistory: [
      {
        conversationId: "conv_1",
        startedAt: "2026-03-29T10:00:00.000Z",
        lastSeenAt: "2026-03-29T10:10:00.000Z",
        page: "/pricing",
        source: "google.com"
      }
    ],
    tags: ["lead", "pricing"],
    latestConversationId: "conv_1",
    online: true,
    returnedVisitor: true,
    newVisitor: false,
    hasEmail: true,
    hasConversation: true,
    ...overrides
  };
}

export function createVisitorFilters(
  overrides: Partial<VisitorFilterState> = {}
): VisitorFilterState {
  return {
    status: "all",
    locationQuery: "",
    source: "all",
    pageQuery: "",
    visitCount: "all",
    timeOnSite: "all",
    hasEmail: "all",
    hasConversation: "all",
    ...overrides
  };
}

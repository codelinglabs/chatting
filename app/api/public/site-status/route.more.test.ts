const mocks = vi.hoisted(() => ({
  getSitePresenceStatus: vi.fn(),
  recordSiteWidgetSeen: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getSitePresenceStatus: mocks.getSitePresenceStatus,
  recordSiteWidgetSeen: mocks.recordSiteWidgetSeen
}));

import { GET } from "./route";

describe("public site-status route more", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records optional params as null when they are absent", async () => {
    mocks.getSitePresenceStatus.mockResolvedValueOnce({ online: false, lastSeenAt: null });

    const response = await GET(
      new Request("http://localhost/api/public/site-status?siteId=site_123", {
        headers: { "user-agent": "Mozilla/5.0" }
      })
    );

    expect(mocks.recordSiteWidgetSeen).toHaveBeenCalledWith({
      siteId: "site_123",
      pageUrl: null,
      sessionId: undefined,
      conversationId: null,
      email: null,
      referrer: null,
      userAgent: "Mozilla/5.0",
      country: null,
      region: null,
      city: null,
      timezone: null,
      locale: null
    });
    expect(await response.json()).toEqual({ ok: true, online: false, lastSeenAt: null });
  });

  it("returns a stable 500 when recording widget activity fails", async () => {
    mocks.getSitePresenceStatus.mockResolvedValueOnce({ online: true, lastSeenAt: "2026-03-29T12:00:00.000Z" });
    mocks.recordSiteWidgetSeen.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(new Request("http://localhost/api/public/site-status?siteId=site_123"));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to load site status." });
  });
});

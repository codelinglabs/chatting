const mocks = vi.hoisted(() => ({
  getSitePresenceStatus: vi.fn(),
  recordSiteWidgetSeen: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getSitePresenceStatus: mocks.getSitePresenceStatus,
  recordSiteWidgetSeen: mocks.recordSiteWidgetSeen
}));

import { GET } from "./route";
import { OPTIONS } from "./route";

describe("public site-status route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the shared cors preflight response", async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("requires a site id", async () => {
    const response = await GET(new Request("http://localhost/api/public/site-status"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "siteId is required." });
  });

  it("returns a not-found response when the site does not exist", async () => {
    mocks.getSitePresenceStatus.mockResolvedValueOnce(null);

    const response = await GET(new Request("http://localhost/api/public/site-status?siteId=missing"));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Site not found." });
  });

  it("records passive visitor session presence while returning status", async () => {
    mocks.getSitePresenceStatus.mockResolvedValueOnce({
      online: true,
      lastSeenAt: "2026-03-29T12:00:00.000Z"
    });

    const response = await GET(
      new Request(
        "http://localhost/api/public/site-status?siteId=site_123&pageUrl=https://example.com/pricing&sessionId=session_123&conversationId=conv_123&email=alex%40example.com&referrer=https%3A%2F%2Fgoogle.com&timezone=Europe%2FLondon&locale=en-GB",
        {
          headers: {
            "user-agent": "Mozilla/5.0"
          }
        }
      )
    );

    expect(mocks.recordSiteWidgetSeen).toHaveBeenCalledWith({
      siteId: "site_123",
      pageUrl: "https://example.com/pricing",
      sessionId: "session_123",
      conversationId: "conv_123",
      email: "alex@example.com",
      referrer: "https://google.com",
      userAgent: "Mozilla/5.0",
      country: null,
      region: null,
      city: null,
      timezone: "Europe/London",
      locale: "en-GB"
    });
    expect(await response.json()).toEqual({
      ok: true,
      online: true,
      lastSeenAt: "2026-03-29T12:00:00.000Z"
    });
  });

  it("maps unexpected failures to a stable error response", async () => {
    mocks.getSitePresenceStatus.mockRejectedValueOnce(new Error("boom"));

    const response = await GET(new Request("http://localhost/api/public/site-status?siteId=site_123"));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Unable to load site status." });
  });
});

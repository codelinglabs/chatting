const mocks = vi.hoisted(() => ({
  getSiteByPublicId: vi.fn(),
  publishDashboardLive: vi.fn(),
  updateVisitorTyping: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getSiteByPublicId: mocks.getSiteByPublicId,
  updateVisitorTyping: mocks.updateVisitorTyping
}));

vi.mock("@/lib/live-events", () => ({
  publishDashboardLive: mocks.publishDashboardLive
}));

import { OPTIONS, POST } from "./route";

describe("public typing route", () => {
  it("returns the preflight response", async () => {
    expect((await OPTIONS()).status).toBe(204);
  });

  it("requires site, session, and conversation ids", async () => {
    const response = await POST(
      new Request("http://localhost/api/public/typing", { method: "POST", body: JSON.stringify({ siteId: "site_1" }) })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "siteId, sessionId, and conversationId are required." });
  });

  it("returns not found when the conversation cannot be updated", async () => {
    mocks.updateVisitorTyping.mockResolvedValueOnce(null);

    const response = await POST(
      new Request("http://localhost/api/public/typing", {
        method: "POST",
        body: JSON.stringify({ siteId: "site_1", sessionId: "session_1", conversationId: "conv_1", typing: true })
      })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Conversation not found." });
  });

  it("updates typing state and publishes the dashboard event when the site exists", async () => {
    mocks.updateVisitorTyping.mockResolvedValueOnce({ conversationId: "conv_1" });
    mocks.getSiteByPublicId.mockResolvedValueOnce({ userId: "user_1" });

    const response = await POST(
      new Request("http://localhost/api/public/typing", {
        method: "POST",
        body: JSON.stringify({ siteId: "site_1", sessionId: "session_1", conversationId: "conv_1", typing: true })
      })
    );

    expect(mocks.publishDashboardLive).toHaveBeenCalledWith("user_1", {
      type: "typing.updated",
      conversationId: "conv_1",
      actor: "visitor",
      typing: true
    });
    expect(await response.json()).toEqual({ ok: true, conversationId: "conv_1", typing: true });
  });
});

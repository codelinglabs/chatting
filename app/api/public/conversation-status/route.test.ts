const mocks = vi.hoisted(() => ({
  getPublicConversationTypingStatus: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getPublicConversationTypingStatus: mocks.getPublicConversationTypingStatus
}));

import { GET, OPTIONS } from "./route";

describe("public conversation status route", () => {
  it("returns the preflight response", () => {
    expect(OPTIONS().status).toBe(204);
  });

  it("requires the full conversation identity", async () => {
    const response = await GET(new Request("http://localhost/api/public/conversation-status?siteId=site_1"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "siteId, sessionId, and conversationId are required." });
  });

  it("returns not found when the conversation is missing", async () => {
    mocks.getPublicConversationTypingStatus.mockResolvedValueOnce(null);

    const response = await GET(
      new Request("http://localhost/api/public/conversation-status?siteId=site_1&sessionId=session_1&conversationId=conv_1")
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Conversation not found." });
  });

  it("returns the team typing state", async () => {
    mocks.getPublicConversationTypingStatus.mockResolvedValueOnce({ teamTyping: true });

    const response = await GET(
      new Request("http://localhost/api/public/conversation-status?siteId=site_1&sessionId=session_1&conversationId=conv_1")
    );

    expect(await response.json()).toEqual({ ok: true, teamTyping: true });
  });
});

const mocks = vi.hoisted(() => ({
  saveVisitorConversationEmail: vi.fn(),
  sendWelcomeTemplateEmail: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  saveVisitorConversationEmail: mocks.saveVisitorConversationEmail
}));

vi.mock("@/lib/conversation-template-emails", () => ({
  sendWelcomeTemplateEmail: mocks.sendWelcomeTemplateEmail
}));

import { OPTIONS, POST } from "./route";

describe("public conversation email route", () => {
  it("returns the CORS preflight response", async () => {
    expect((await OPTIONS()).status).toBe(204);
  });

  it("requires site, session, conversation, and email", async () => {
    const response = await POST(
      new Request("http://localhost/api/public/conversation-email", {
        method: "POST",
        body: JSON.stringify({ siteId: "site_1" })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "siteId, sessionId, conversationId, and email are required."
    });
  });

  it("returns not found when the visitor session does not match", async () => {
    mocks.saveVisitorConversationEmail.mockResolvedValueOnce({ updated: false });

    const response = await POST(
      new Request("http://localhost/api/public/conversation-email", {
        method: "POST",
        body: JSON.stringify({
          siteId: "site_1",
          sessionId: "session_1",
          conversationId: "conv_1",
          email: "alex@example.com"
        })
      })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Conversation not found for this visitor session." });
  });

  it("saves the email and triggers the welcome template when eligible", async () => {
    mocks.saveVisitorConversationEmail.mockResolvedValueOnce({
      updated: true,
      welcomeEmailEligible: true,
      ownerUserId: "user_1"
    });

    const response = await POST(
      new Request("http://localhost/api/public/conversation-email", {
        method: "POST",
        body: JSON.stringify({
          siteId: "site_1",
          sessionId: "session_1",
          conversationId: "conv_1",
          email: "alex@example.com"
        })
      })
    );

    expect(mocks.sendWelcomeTemplateEmail).toHaveBeenCalledWith({
      conversationId: "conv_1",
      userId: "user_1"
    });
    expect(await response.json()).toEqual({ ok: true });
  });
});

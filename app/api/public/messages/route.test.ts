const mocks = vi.hoisted(() => ({
  createUserMessage: vi.fn(),
  extractUploadedAttachments: vi.fn(),
  extractVisitorMetadata: vi.fn(),
  notifyIncomingVisitorMessage: vi.fn(),
  publishConversationLive: vi.fn(),
  sendWelcomeTemplateEmail: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  createUserMessage: mocks.createUserMessage
}));
vi.mock("@/lib/conversation-io", () => ({
  extractUploadedAttachments: mocks.extractUploadedAttachments,
  extractVisitorMetadata: mocks.extractVisitorMetadata
}));
vi.mock("@/lib/conversation-template-emails", () => ({
  sendWelcomeTemplateEmail: mocks.sendWelcomeTemplateEmail
}));
vi.mock("@/lib/live-events", () => ({
  publishConversationLive: mocks.publishConversationLive
}));
vi.mock("@/lib/team-notifications", () => ({
  notifyIncomingVisitorMessage: mocks.notifyIncomingVisitorMessage
}));

import { OPTIONS, POST } from "./route";

describe("public messages route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.extractUploadedAttachments.mockResolvedValue([]);
    mocks.extractVisitorMetadata.mockReturnValue({ pageUrl: "https://example.com/pricing" });
    mocks.notifyIncomingVisitorMessage.mockResolvedValue(undefined);
    mocks.sendWelcomeTemplateEmail.mockResolvedValue(undefined);
  });

  it("returns the preflight response", () => {
    expect(OPTIONS().status).toBe(204);
  });

  it("requires site, session, and message content or attachments", async () => {
    const response = await POST(
      new Request("http://localhost/api/public/messages", {
        method: "POST",
        body: JSON.stringify({ siteId: "site_1", sessionId: "session_1", content: "   " })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "siteId, sessionId, and either content or an attachment are required."
    });
  });

  it("stores visitor messages, publishes live events, and sends the welcome template", async () => {
    mocks.createUserMessage.mockResolvedValueOnce({
      conversationId: "conv_1",
      siteUserId: "user_1",
      siteName: "Main site",
      visitorLabel: "Alex",
      pageUrl: "https://example.com/pricing",
      location: "London, UK",
      preview: "Hello there",
      isNewConversation: true,
      isNewVisitor: true,
      highIntent: true,
      welcomeEmailEligible: true,
      message: {
        id: "msg_1",
        conversationId: "conv_1",
        sender: "user",
        content: "Hello there",
        createdAt: "2026-03-29T10:00:00.000Z",
        attachments: []
      }
    });

    const response = await POST(
      new Request("http://localhost/api/public/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ siteId: "site_1", sessionId: "session_1", content: "Hello there", pageUrl: "https://example.com/pricing" })
      })
    );

    expect(mocks.createUserMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        siteId: "site_1",
        sessionId: "session_1",
        content: "Hello there",
        attachments: [],
        metadata: { pageUrl: "https://example.com/pricing" }
      })
    );
    expect(mocks.publishConversationLive).toHaveBeenCalledTimes(2);
    expect(mocks.notifyIncomingVisitorMessage).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user_1", conversationId: "conv_1", attachmentsCount: 0, highIntent: true })
    );
    expect(mocks.sendWelcomeTemplateEmail).toHaveBeenCalledWith({ conversationId: "conv_1", userId: "user_1" });
    expect(await response.json()).toEqual({
      ok: true,
      conversationId: "conv_1",
      message: {
        id: "msg_1",
        conversationId: "conv_1",
        sender: "user",
        content: "Hello there",
        createdAt: "2026-03-29T10:00:00.000Z",
        attachments: []
      }
    });
  });

  it("maps known site and attachment errors", async () => {
    mocks.createUserMessage.mockRejectedValueOnce(new Error("SITE_NOT_FOUND"));
    let response = await POST(
      new Request("http://localhost/api/public/messages", {
        method: "POST",
        body: JSON.stringify({ siteId: "site_1", sessionId: "session_1", content: "Hello there" })
      })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Unknown siteId. Create a site in the dashboard first." });

    mocks.createUserMessage.mockRejectedValueOnce(new Error("ATTACHMENT_LIMIT"));
    response = await POST(
      new Request("http://localhost/api/public/messages", {
        method: "POST",
        body: JSON.stringify({ siteId: "site_1", sessionId: "session_1", content: "Hello there" })
      })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "You can attach up to 3 files per message." });
  });
});

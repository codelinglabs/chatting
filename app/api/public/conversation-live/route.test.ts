const mocks = vi.hoisted(() => ({
  getPublicConversationMessages: vi.fn(),
  subscribeConversationLive: vi.fn(),
  unsubscribe: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getPublicConversationMessages: mocks.getPublicConversationMessages
}));

vi.mock("@/lib/live-events", () => ({
  subscribeConversationLive: mocks.subscribeConversationLive
}));

import { GET, OPTIONS } from "./route";

describe("public conversation live route", () => {
  it("returns the preflight response", async () => {
    expect((await OPTIONS()).status).toBe(204);
  });

  it("requires the full conversation identity", async () => {
    const response = await GET(new Request("http://localhost/api/public/conversation-live?siteId=site_1"));

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Missing conversation identity.");
  });

  it("returns not found when the conversation does not exist", async () => {
    mocks.getPublicConversationMessages.mockResolvedValueOnce(null);

    const response = await GET(
      new Request("http://localhost/api/public/conversation-live?siteId=site_1&sessionId=session_1&conversationId=conv_1")
    );

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("Conversation not found.");
  });

  it("streams a connected event and live updates over SSE", async () => {
    const controller = new AbortController();
    mocks.getPublicConversationMessages.mockResolvedValueOnce([{ id: "msg_1" }]);
    mocks.subscribeConversationLive.mockImplementationOnce((_conversationId, onEvent) => {
      onEvent({ type: "message.created", conversationId: "conv_1" });
      return mocks.unsubscribe;
    });

    const response = await GET(
      new Request(
        "http://localhost/api/public/conversation-live?siteId=site_1&sessionId=session_1&conversationId=conv_1",
        { signal: controller.signal }
      )
    );

    controller.abort();
    const body = await response.text();

    expect(response.headers.get("Content-Type")).toBe("text/event-stream; charset=utf-8");
    expect(body).toContain('"type":"connected"');
    expect(body).toContain('"type":"message.created"');
    expect(mocks.unsubscribe).toHaveBeenCalled();
  });
});

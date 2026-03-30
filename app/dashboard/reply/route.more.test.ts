const liveEventMocks = vi.hoisted(() => ({
  publishConversationLive: vi.fn(),
  publishDashboardLive: vi.fn()
}));

const mocks = vi.hoisted(() => ({
  addFounderReply: vi.fn(),
  extractUploadedAttachments: vi.fn(),
  getConversationEmail: vi.fn(),
  markConversationRead: vi.fn(),
  requireJsonRouteUser: vi.fn(),
  sendOfflineReplyTemplateEmail: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  addFounderReply: mocks.addFounderReply,
  getConversationEmail: mocks.getConversationEmail,
  markConversationRead: mocks.markConversationRead
}));
vi.mock("@/lib/conversation-template-emails", () => ({ sendOfflineReplyTemplateEmail: mocks.sendOfflineReplyTemplateEmail }));
vi.mock("@/lib/conversation-io", () => ({ extractUploadedAttachments: mocks.extractUploadedAttachments }));
vi.mock("@/lib/live-events", () => ({
  publishConversationLive: liveEventMocks.publishConversationLive,
  publishDashboardLive: liveEventMocks.publishDashboardLive
}));
vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) => Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) => Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("dashboard reply route more", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_123",
        email: "hello@example.com",
        createdAt: "2026-03-27T00:00:00.000Z",
        workspaceOwnerId: "owner_123",
        workspaceRole: "admin"
      }
    });
    mocks.extractUploadedAttachments.mockResolvedValue([]);
  });

  it("returns the auth response early", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "unauthorized" }, { status: 401 })
    });
    const response = await POST(new Request("http://localhost/dashboard/reply", { method: "POST" }));
    expect(response.status).toBe(401);
  });

  it("returns not found when the reply insert fails and marks email delivery as sent when email succeeds", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("content", "Hello there");

    mocks.getConversationEmail.mockResolvedValueOnce({ email: "visitor@example.com" }).mockResolvedValueOnce({ email: "visitor@example.com" });
    mocks.addFounderReply.mockResolvedValueOnce(false).mockResolvedValueOnce({ id: "msg_1", createdAt: "2026-03-27T12:00:00.000Z" });
    mocks.sendOfflineReplyTemplateEmail.mockResolvedValueOnce("sent");

    const notFound = await POST(new Request("http://localhost/dashboard/reply", { method: "POST", body: formData }));
    const sent = await POST(new Request("http://localhost/dashboard/reply", { method: "POST", body: formData }));

    expect(notFound.status).toBe(404);
    expect((await sent.json()).emailDelivery).toBe("sent");
  });

  it("maps attachment-too-large and generic failures", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("content", "Hello there");
    mocks.getConversationEmail.mockResolvedValue({ email: null });
    mocks.addFounderReply.mockRejectedValueOnce(new Error("ATTACHMENT_TOO_LARGE")).mockRejectedValueOnce(new Error("boom"));

    const tooLarge = await POST(new Request("http://localhost/dashboard/reply", { method: "POST", body: formData }));
    const generic = await POST(new Request("http://localhost/dashboard/reply", { method: "POST", body: formData }));

    expect(tooLarge.status).toBe(400);
    expect(await tooLarge.json()).toEqual({ ok: false, error: "attachment-too-large" });
    expect(generic.status).toBe(500);
    expect(await generic.json()).toEqual({ ok: false, error: "reply-failed" });
  });
});

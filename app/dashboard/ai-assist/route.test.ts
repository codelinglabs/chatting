const mocks = vi.hoisted(() => ({
  generateDashboardAiAssist: vi.fn(),
  getConversationById: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getConversationById: mocks.getConversationById
}));

vi.mock("@/lib/dashboard-ai-assist-service", () => ({
  generateDashboardAiAssist: mocks.generateDashboardAiAssist
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("dashboard ai assist route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_123",
        email: "hello@chatting.example",
        createdAt: "2026-04-02T00:00:00.000Z",
        workspaceOwnerId: "owner_123",
        workspaceRole: "admin"
      }
    });
  });

  it("returns auth responses and validates required fields", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "auth" }, { status: 401 })
    });
    const authResponse = await POST(new Request("http://localhost/dashboard/ai-assist", { method: "POST", body: "{}" }));
    const missingResponse = await POST(
      new Request("http://localhost/dashboard/ai-assist", {
        method: "POST",
        body: JSON.stringify({ action: "summarize", conversationId: "" })
      })
    );

    expect(authResponse.status).toBe(401);
    expect(missingResponse.status).toBe(400);
    expect(await missingResponse.json()).toEqual({ ok: false, error: "missing-fields" });
  });

  it("maps draft validation, missing conversations, and provider failures", async () => {
    const draftRequired = await POST(
      new Request("http://localhost/dashboard/ai-assist", {
        method: "POST",
        body: JSON.stringify({ action: "rewrite", conversationId: "conv_1", draft: "" })
      })
    );

    mocks.getConversationById.mockResolvedValueOnce(null);
    const missingConversation = await POST(
      new Request("http://localhost/dashboard/ai-assist", {
        method: "POST",
        body: JSON.stringify({ action: "reply", conversationId: "conv_404" })
      })
    );

    mocks.getConversationById.mockResolvedValueOnce({ id: "conv_1" });
    mocks.generateDashboardAiAssist.mockRejectedValueOnce(new Error("MINIMAX_NOT_CONFIGURED"));
    const providerFailure = await POST(
      new Request("http://localhost/dashboard/ai-assist", {
        method: "POST",
        body: JSON.stringify({ action: "reply", conversationId: "conv_1" })
      })
    );

    expect(draftRequired.status).toBe(422);
    expect(await draftRequired.json()).toEqual({ ok: false, error: "draft-required" });
    expect(missingConversation.status).toBe(404);
    expect(await missingConversation.json()).toEqual({ ok: false, error: "not-found" });
    expect(providerFailure.status).toBe(500);
    expect(await providerFailure.json()).toEqual({ ok: false, error: "ai-provider-not-configured" });
  });

  it("returns generated ai assist results for valid requests", async () => {
    mocks.getConversationById.mockResolvedValueOnce({ id: "conv_1", messages: [] });
    mocks.generateDashboardAiAssist.mockResolvedValueOnce({
      action: "reply",
      draft: "Happy to help. What plan size are you looking at?"
    });

    const response = await POST(
      new Request("http://localhost/dashboard/ai-assist", {
        method: "POST",
        body: JSON.stringify({ action: "reply", conversationId: "conv_1" })
      })
    );

    expect(mocks.getConversationById).toHaveBeenCalledWith("conv_1", "user_123");
    expect(mocks.generateDashboardAiAssist).toHaveBeenCalledWith({
      action: "reply",
      conversation: { id: "conv_1", messages: [] },
      draft: ""
    });
    expect(await response.json()).toEqual({
      ok: true,
      action: "reply",
      result: {
        action: "reply",
        draft: "Happy to help. What plan size are you looking at?"
      }
    });
  });
});

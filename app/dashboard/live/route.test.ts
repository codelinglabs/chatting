const mocks = vi.hoisted(() => ({
  requireJsonRouteUser: vi.fn(),
  subscribeDashboardLive: vi.fn(),
  unsubscribe: vi.fn()
}));

vi.mock("@/lib/live-events", () => ({
  subscribeDashboardLive: mocks.subscribeDashboardLive
}));

vi.mock("@/lib/route-helpers", () => ({
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { GET } from "./route";

describe("dashboard live route", () => {
  it("returns the auth response when the request is not authorized", async () => {
    const response = Response.json({ ok: false }, { status: 401 });
    mocks.requireJsonRouteUser.mockResolvedValueOnce({ response });

    await expect(GET(new Request("http://localhost/dashboard/live"))).resolves.toBe(response);
  });

  it("streams dashboard live events for the authenticated workspace owner", async () => {
    const controller = new AbortController();
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      user: { workspaceOwnerId: "owner_1" }
    });
    mocks.subscribeDashboardLive.mockImplementationOnce((_ownerId, onEvent) => {
      onEvent({ type: "message.created", conversationId: "conv_1" });
      return mocks.unsubscribe;
    });

    const response = await GET(new Request("http://localhost/dashboard/live", { signal: controller.signal }));

    controller.abort();
    const body = await response.text();

    expect(response.headers.get("Content-Type")).toBe("text/event-stream; charset=utf-8");
    expect(body).toContain('"type":"connected"');
    expect(body).toContain('"type":"message.created"');
    expect(mocks.subscribeDashboardLive).toHaveBeenCalledWith("owner_1", expect.any(Function));
    expect(mocks.unsubscribe).toHaveBeenCalled();
  });
});

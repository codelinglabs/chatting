const mocks = vi.hoisted(() => ({
  getDashboardUnreadCount: vi.fn(),
  jsonOk: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  getDashboardUnreadCount: mocks.getDashboardUnreadCount
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonOk: mocks.jsonOk,
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { GET } from "./route";

describe("dashboard unread-count route", () => {
  it("returns the auth response when the request is not authorized", async () => {
    const response = Response.json({ ok: false }, { status: 401 });
    mocks.requireJsonRouteUser.mockResolvedValueOnce({ response });

    await expect(GET()).resolves.toBe(response);
  });

  it("returns the lightweight unread total for the current viewer", async () => {
    const response = Response.json({ ok: true, unreadCount: 4 });
    mocks.requireJsonRouteUser.mockResolvedValueOnce({ user: { id: "user_1" } });
    mocks.getDashboardUnreadCount.mockResolvedValueOnce(4);
    mocks.jsonOk.mockReturnValueOnce(response);

    await expect(GET()).resolves.toBe(response);
    expect(mocks.getDashboardUnreadCount).toHaveBeenCalledWith("user_1");
    expect(mocks.jsonOk).toHaveBeenCalledWith({ unreadCount: 4 });
  });
});

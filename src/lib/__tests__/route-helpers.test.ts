const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn()
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mocks.getCurrentUser
}));

import { jsonError, jsonOk, redirect303, requireJsonRouteUser } from "@/lib/route-helpers";

describe("route helpers", () => {
  it("builds redirect, ok, and error responses", async () => {
    const redirect = redirect303(new Request("https://chatting.test/dashboard"), "/login");
    expect(redirect.status).toBe(303);
    expect(redirect.headers.get("location")).toBe("https://chatting.test/login");

    await expect(jsonOk({ ready: true }).json()).resolves.toEqual({ ok: true, ready: true });
    await expect(jsonError("nope", 418).json()).resolves.toEqual({ ok: false, error: "nope" });
  });

  it("returns either the current user or an auth response", async () => {
    mocks.getCurrentUser.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: "user_1" });

    const missing = await requireJsonRouteUser();
    const present = await requireJsonRouteUser();

    expect("response" in missing && missing.response.status).toBe(401);
    expect(present).toEqual({ user: { id: "user_1" } });
  });
});

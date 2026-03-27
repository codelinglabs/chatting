const mocks = vi.hoisted(() => ({
  toggleTag: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  toggleTag: mocks.toggleTag
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./route";

describe("dashboard tags route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: { id: "user_123", email: "hello@chatly.example", createdAt: "2026-03-27T00:00:00.000Z" }
    });
  });

  it("rejects missing fields", async () => {
    const response = await POST(
      new Request("http://localhost/dashboard/tags", { method: "POST", body: new FormData() })
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: "missing-fields" });
  });

  it("returns not found when the tag toggle fails", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("tag", "pricing");
    mocks.toggleTag.mockResolvedValueOnce(false);

    const response = await POST(
      new Request("http://localhost/dashboard/tags", { method: "POST", body: formData })
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, error: "not-found" });
  });

  it("toggles tags for the current user", async () => {
    const formData = new FormData();
    formData.set("conversationId", "conv_1");
    formData.set("tag", "pricing");
    mocks.toggleTag.mockResolvedValueOnce(true);

    const response = await POST(
      new Request("http://localhost/dashboard/tags", { method: "POST", body: formData })
    );

    expect(mocks.toggleTag).toHaveBeenCalledWith("conv_1", "pricing", "user_123");
    expect(await response.json()).toEqual({
      ok: true,
      conversationId: "conv_1",
      tag: "pricing"
    });
  });
});

const mocks = vi.hoisted(() => ({
  createHelpCenterArticle: vi.fn(),
  deleteHelpCenterArticle: vi.fn(),
  updateHelpCenterArticle: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  createHelpCenterArticle: mocks.createHelpCenterArticle,
  deleteHelpCenterArticle: mocks.deleteHelpCenterArticle,
  updateHelpCenterArticle: mocks.updateHelpCenterArticle
}));

vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) =>
    Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) =>
    Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { POST } from "./articles/route";

describe("dashboard help center route", () => {
  beforeEach(() => {
    mocks.requireJsonRouteUser.mockResolvedValue({
      user: {
        id: "user_123",
        email: "hello@chatting.example",
        workspaceRole: "admin"
      }
    });
  });

  it("creates, updates, and deletes help-center articles", async () => {
    mocks.createHelpCenterArticle.mockResolvedValueOnce({
      id: "article_1",
      title: "Billing",
      slug: "billing",
      body: "Billing answer",
      updatedAt: "2026-04-02T12:00:00.000Z"
    });
    mocks.updateHelpCenterArticle.mockResolvedValueOnce({
      id: "article_1",
      title: "Billing updated",
      slug: "billing",
      body: "Updated answer",
      updatedAt: "2026-04-02T12:05:00.000Z"
    });

    const createResponse = await POST(
      new Request("http://localhost/dashboard/help-center/articles", {
        method: "POST",
        body: JSON.stringify({ action: "create", title: "Billing", slug: "billing", body: "Billing answer" })
      })
    );
    const updateResponse = await POST(
      new Request("http://localhost/dashboard/help-center/articles", {
        method: "POST",
        body: JSON.stringify({ action: "update", id: "article_1", title: "Billing updated", slug: "billing", body: "Updated answer" })
      })
    );
    const deleteResponse = await POST(
      new Request("http://localhost/dashboard/help-center/articles", {
        method: "POST",
        body: JSON.stringify({ action: "delete", id: "article_1" })
      })
    );

    expect(await createResponse.json()).toEqual({
      ok: true,
      article: {
        id: "article_1",
        title: "Billing",
        slug: "billing",
        body: "Billing answer",
        updatedAt: "2026-04-02T12:00:00.000Z"
      }
    });
    expect(await updateResponse.json()).toEqual({
      ok: true,
      article: {
        id: "article_1",
        title: "Billing updated",
        slug: "billing",
        body: "Updated answer",
        updatedAt: "2026-04-02T12:05:00.000Z"
      }
    });
    expect(await deleteResponse.json()).toEqual({ ok: true, id: "article_1" });
  });

  it("forbids members and maps slug conflicts, missing ids, and not-found deletes", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      user: { id: "user_456", email: "member@chatting.example", workspaceRole: "member" }
    });
    const forbidden = await POST(
      new Request("http://localhost/dashboard/help-center/articles", {
        method: "POST",
        body: JSON.stringify({ action: "create", title: "Billing", body: "Answer" })
      })
    );

    mocks.createHelpCenterArticle.mockRejectedValueOnce(new Error("SLUG_TAKEN"));
    const conflict = await POST(
      new Request("http://localhost/dashboard/help-center/articles", {
        method: "POST",
        body: JSON.stringify({ action: "create", title: "Billing", slug: "billing", body: "Answer" })
      })
    );

    const missingId = await POST(
      new Request("http://localhost/dashboard/help-center/articles", {
        method: "POST",
        body: JSON.stringify({ action: "delete", id: "" })
      })
    );

    mocks.deleteHelpCenterArticle.mockRejectedValueOnce(new Error("NOT_FOUND"));
    const notFoundResponse = await POST(
      new Request("http://localhost/dashboard/help-center/articles", {
        method: "POST",
        body: JSON.stringify({ action: "delete", id: "missing" })
      })
    );

    expect(forbidden.status).toBe(403);
    expect(await forbidden.json()).toEqual({ ok: false, error: "forbidden" });
    expect(conflict.status).toBe(409);
    expect(await conflict.json()).toEqual({ ok: false, error: "slug-taken" });
    expect(missingId.status).toBe(400);
    expect(await missingId.json()).toEqual({ ok: false, error: "missing-fields" });
    expect(notFoundResponse.status).toBe(404);
    expect(await notFoundResponse.json()).toEqual({ ok: false, error: "not-found" });
  });
});

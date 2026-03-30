const mocks = vi.hoisted(() => ({
  removeSiteTeamPhoto: vi.fn(),
  updateSiteTeamPhoto: vi.fn(),
  getTeamPhotoConstraints: vi.fn(),
  requireJsonRouteUser: vi.fn()
}));

vi.mock("@/lib/data", () => ({
  removeSiteTeamPhoto: mocks.removeSiteTeamPhoto,
  updateSiteTeamPhoto: mocks.updateSiteTeamPhoto
}));
vi.mock("@/lib/r2", () => ({ getTeamPhotoConstraints: mocks.getTeamPhotoConstraints }));
vi.mock("@/lib/route-helpers", () => ({
  jsonError: (error: string, status: number) => Response.json({ ok: false, error }, { status }),
  jsonOk: (body: Record<string, unknown>, status = 200) => Response.json({ ok: true, ...body }, { status }),
  requireJsonRouteUser: mocks.requireJsonRouteUser
}));

import { DELETE, POST } from "./route";

describe("dashboard team photo route extra coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireJsonRouteUser.mockResolvedValue({ user: { id: "user_1" } });
    mocks.getTeamPhotoConstraints.mockReturnValue({ acceptedContentTypes: ["image/png"], maxBytes: 1024 });
  });

  it("returns auth responses immediately", async () => {
    mocks.requireJsonRouteUser.mockResolvedValueOnce({
      response: Response.json({ ok: false, error: "auth" }, { status: 401 })
    });
    const response = await POST(new Request("https://chatting.test", { method: "POST", body: new FormData() }));
    expect(response.status).toBe(401);
  });

  it("covers missing files, missing delete ids, and missing records", async () => {
    const upload = new FormData();
    upload.set("siteId", "site_1");
    const missingFile = await POST(new Request("https://chatting.test", { method: "POST", body: upload }));
    expect(await missingFile.json()).toEqual({ ok: false, error: "file-missing" });

    const validUpload = new FormData();
    validUpload.set("siteId", "site_1");
    validUpload.set("file", new File(["png"], "photo.png", { type: "image/png" }));
    mocks.updateSiteTeamPhoto.mockResolvedValueOnce(null);
    const uploadNotFound = await POST(new Request("https://chatting.test", { method: "POST", body: validUpload }));
    expect(uploadNotFound.status).toBe(404);

    const deleteMissingId = await DELETE(new Request("https://chatting.test", { method: "DELETE", body: JSON.stringify({}) }));
    expect(await deleteMissingId.json()).toEqual({ ok: false, error: "site-id-missing" });

    mocks.removeSiteTeamPhoto.mockResolvedValueOnce(null);
    const deleteNotFound = await DELETE(new Request("https://chatting.test", { method: "DELETE", body: JSON.stringify({ siteId: "site_1" }) }));
    expect(deleteNotFound.status).toBe(404);
  });

  it("maps upload and delete failures to stable errors", async () => {
    const upload = new FormData();
    upload.set("siteId", "site_1");
    upload.set("file", new File(["png"], "photo.png", { type: "image/png" }));

    mocks.updateSiteTeamPhoto.mockRejectedValueOnce(new Error("kaboom"));
    const uploadError = await POST(new Request("https://chatting.test", { method: "POST", body: upload }));
    expect(await uploadError.json()).toEqual({ ok: false, error: "team-photo-upload-failed" });

    const deleteError = await DELETE(new Request("https://chatting.test", { method: "DELETE", body: "not-json" }));
    expect(deleteError.status).toBe(500);
    expect(await deleteError.json()).toEqual({ ok: false, error: "team-photo-delete-failed" });
  });
});

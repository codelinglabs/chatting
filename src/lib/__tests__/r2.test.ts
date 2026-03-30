const mocks = vi.hoisted(() => ({
  deleteObjectCommand: vi.fn(function (input) {
    this.input = input;
  }),
  getRequiredServerEnv: vi.fn(),
  putObjectCommand: vi.fn(function (input) {
    this.input = input;
  }),
  randomUUID: vi.fn(() => "uuid_123"),
  s3Client: vi.fn(function () {
    return { send: mocks.send };
  }),
  send: vi.fn()
}));

vi.mock("node:crypto", () => ({ randomUUID: mocks.randomUUID }));
vi.mock("@aws-sdk/client-s3", () => ({
  DeleteObjectCommand: mocks.deleteObjectCommand,
  PutObjectCommand: mocks.putObjectCommand,
  S3Client: mocks.s3Client
}));
vi.mock("@/lib/env.server", () => ({ getRequiredServerEnv: mocks.getRequiredServerEnv }));

async function loadModule() {
  return import("@/lib/r2");
}

describe("r2 helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.getRequiredServerEnv.mockImplementation((key: string) => {
      const values: Record<string, string> = {
        R2_ACCOUNT_ID: "account_123",
        R2_ACCESS_KEY_ID: "access_123",
        R2_SECRET_ACCESS_KEY: "secret_123",
        R2_BUCKET_NAME: "uploads",
        R2_PUBLIC_BASE_URL: "https://cdn.example.com/"
      };
      return values[key];
    });
    mocks.send.mockResolvedValue(undefined);
  });

  it("returns the accepted team photo constraints", async () => {
    const { getTeamPhotoConstraints } = await loadModule();
    expect(getTeamPhotoConstraints()).toEqual({
      maxBytes: 2097152,
      acceptedContentTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"]
    });
  });

  it("rejects invalid image types and oversized files", async () => {
    const { uploadSiteTeamPhotoToR2 } = await loadModule();

    await expect(
      uploadSiteTeamPhotoToR2({
        siteId: "site_1",
        fileName: "team.svg",
        contentType: "image/svg+xml",
        content: Buffer.from("hello")
      })
    ).rejects.toThrow("INVALID_IMAGE_TYPE");

    await expect(
      uploadSiteTeamPhotoToR2({
        siteId: "site_1",
        fileName: "team.png",
        contentType: "image/png",
        content: Buffer.alloc(2097153)
      })
    ).rejects.toThrow("IMAGE_TOO_LARGE");
  });

  it.each([
    ["image/png", ".png"],
    ["image/jpeg", ".jpg"],
    ["image/gif", ".gif"],
    ["image/webp", ".webp"]
  ])("uploads %s files with the right extension", async (contentType, extension) => {
    const { uploadSiteTeamPhotoToR2 } = await loadModule();

    const result = await uploadSiteTeamPhotoToR2({
      siteId: "site_1",
      fileName: "team",
      contentType,
      content: Buffer.from("hello")
    });

    expect(mocks.putObjectCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: "uploads",
        Key: expect.stringContaining(extension),
        ContentType: contentType
      })
    );
    expect(result.url).toMatch(/^https:\/\/cdn\.example\.com\/sites\/site_1\/team-photos\//);
  });

  it("skips empty deletes and sends delete requests when a key exists", async () => {
    const { deleteR2Object } = await loadModule();

    await deleteR2Object("");
    expect(mocks.deleteObjectCommand).not.toHaveBeenCalled();

    await deleteR2Object("sites/site_1/team-photos/team.png");
    expect(mocks.deleteObjectCommand).toHaveBeenCalledWith({
      Bucket: "uploads",
      Key: "sites/site_1/team-photos/team.png"
    });
  });
});

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getAttachmentForPublic: vi.fn(),
  getAttachmentForUser: vi.fn()
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mocks.getCurrentUser
}));

vi.mock("@/lib/data", () => ({
  getAttachmentForPublic: mocks.getAttachmentForPublic,
  getAttachmentForUser: mocks.getAttachmentForUser
}));

import { GET } from "./route";

describe("attachment download route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when required params are missing", async () => {
    const response = await GET(
      new Request("https://chatting.test/api/files/attachment_1"),
      { params: Promise.resolve({ attachmentId: "" }) }
    );

    expect(response.status).toBe(404);
    await expect(response.text()).resolves.toBe("Attachment not found.");
  });

  it("uses the authenticated lookup and inlines image attachments", async () => {
    mocks.getCurrentUser.mockResolvedValueOnce({ id: "user_1" });
    mocks.getAttachmentForUser.mockResolvedValueOnce({
      content: Buffer.from("image-data"),
      content_type: "image/png",
      file_name: "logo.png",
      size_bytes: 10
    });

    const response = await GET(
      new Request("https://chatting.test/api/files/attachment_1?conversationId=conversation_1"),
      { params: Promise.resolve({ attachmentId: "attachment_1" }) }
    );

    expect(mocks.getAttachmentForUser).toHaveBeenCalledWith({
      attachmentId: "attachment_1",
      conversationId: "conversation_1",
      userId: "user_1"
    });
    expect(response.headers.get("Content-Disposition")).toContain('inline; filename="logo.png"');
  });

  it("uses the public lookup and downloads non-image attachments", async () => {
    mocks.getCurrentUser.mockResolvedValueOnce(null);
    mocks.getAttachmentForPublic.mockResolvedValueOnce({
      content: Buffer.from("pdf-data"),
      content_type: "application/pdf",
      file_name: "quote.pdf",
      size_bytes: 8
    });

    const response = await GET(
      new Request("https://chatting.test/api/files/attachment_1?conversationId=conversation_1&siteId=site_1&sessionId=session_1"),
      { params: Promise.resolve({ attachmentId: "attachment_1" }) }
    );

    expect(mocks.getAttachmentForPublic).toHaveBeenCalledWith({
      attachmentId: "attachment_1",
      conversationId: "conversation_1",
      siteId: "site_1",
      sessionId: "session_1"
    });
    expect(response.headers.get("Content-Disposition")).toContain('attachment; filename="quote.pdf"');
  });
});

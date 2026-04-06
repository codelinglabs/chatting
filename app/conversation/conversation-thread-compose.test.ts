vi.mock("@/lib/grometrics", () => ({
  trackGrometricsEvent: vi.fn()
}));

import {
  createOptimisticConversationAttachments,
  postPublicConversationReply,
  revokeOptimisticConversationAttachments
} from "./conversation-thread-compose";
import { trackGrometricsEvent } from "@/lib/grometrics";

describe("conversation thread compose helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("creates and revokes optimistic attachment urls", () => {
    vi.stubGlobal("crypto", { randomUUID: vi.fn(() => "uuid-1") });
    vi.stubGlobal("window", {
      URL: {
        createObjectURL: vi.fn(() => "blob:one"),
        revokeObjectURL: vi.fn()
      },
      setTimeout: (callback: () => void) => {
        callback();
        return 0;
      }
    });

    const attachments = createOptimisticConversationAttachments([
      { name: "brief.pdf", type: "application/pdf", size: 12 } as File
    ]);

    expect(attachments).toEqual([
      expect.objectContaining({
        id: "optimistic-attachment-uuid-1",
        fileName: "brief.pdf",
        url: "blob:one",
        isImage: false
      })
    ]);

    revokeOptimisticConversationAttachments(attachments);
    expect(globalThis.window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:one");
  });

  it("posts multipart visitor replies with attachments and surfaces route errors", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async (_url: string, init?: RequestInit) => {
        const formData = init?.body as FormData;
        expect(formData.get("siteId")).toBe("site_1");
        expect(formData.get("sessionId")).toBe("session_1");
        expect(formData.get("conversationId")).toBe("conv_1");
        expect(formData.get("content")).toBe("Here you go");
        expect(formData.get("pageUrl")).toBe("https://usechatting.com/conversation/abc");
        expect(formData.getAll("attachments")).toHaveLength(1);

        return Response.json({
          ok: true,
          conversationId: "conv_1",
          message: {
            id: "msg_1",
            content: "Here you go",
            createdAt: "2026-04-01T12:00:00.000Z",
            attachments: []
          }
        });
      })
      .mockResolvedValueOnce(
        Response.json(
          { error: "Each attachment must be smaller than 4 MB." },
          { status: 400 }
        )
      );

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      postPublicConversationReply({
        identity: { siteId: "site_1", sessionId: "session_1", conversationId: "conv_1" },
        content: "Here you go",
        attachments: [new File(["hello"], "brief.txt", { type: "text/plain" })],
        pageUrl: "https://usechatting.com/conversation/abc"
      })
    ).resolves.toMatchObject({ ok: true, conversationId: "conv_1" });
    expect(trackGrometricsEvent).toHaveBeenCalledWith("visitor_reply_sent", {
      source: "conversation_resume",
      has_content: true,
      has_attachments: true,
      attachment_count: 1
    });

    await expect(
      postPublicConversationReply({
        identity: { siteId: "site_1", sessionId: "session_1", conversationId: "conv_1" },
        content: "",
        attachments: [new File(["hello"], "huge.txt", { type: "text/plain" })],
        pageUrl: "https://usechatting.com/conversation/abc"
      })
    ).rejects.toThrow("Each attachment must be smaller than 4 MB.");
    expect(trackGrometricsEvent).toHaveBeenCalledTimes(1);
  });
});

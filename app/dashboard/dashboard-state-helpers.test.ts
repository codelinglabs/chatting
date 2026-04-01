import {
  createOptimisticAttachmentUrls,
  nextTagsForToggle,
  previewForMessage,
  revokeOptimisticAttachmentUrls,
  settleOptimisticMessage,
  toSummary
} from "./dashboard-state-helpers";
import { createConversationThread } from "./use-dashboard-actions.test-helpers";

describe("dashboard state helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds message previews and thread summaries", () => {
    expect(previewForMessage({ id: "m1", conversationId: "c1", sender: "user", content: " Hello ", createdAt: "", attachments: [] })).toBe(" Hello ");
    expect(previewForMessage({ id: "m1", conversationId: "c1", sender: "user", content: " ", createdAt: "", attachments: [{ id: "a1", fileName: "photo.png", contentType: "image/png", sizeBytes: 1, url: "", isImage: true }] })).toBe("Shared photo.png");
    expect(previewForMessage({ id: "m1", conversationId: "c1", sender: "user", content: "", createdAt: "", attachments: [{ id: "a1", fileName: "a", contentType: "", sizeBytes: 1, url: "", isImage: false }, { id: "a2", fileName: "b", contentType: "", sizeBytes: 1, url: "", isImage: false }] })).toBe("Shared 2 files");
    expect(previewForMessage({ id: "m1", conversationId: "c1", sender: "user", content: "", createdAt: "", attachments: [] })).toBe("No messages yet");
    expect(toSummary(createConversationThread())).not.toHaveProperty("messages");
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

    const attachments = createOptimisticAttachmentUrls([
      { name: "photo.png", type: "image/png", size: 3 } as File,
      { name: "", type: "", size: 0 } as File
    ]);

    expect(attachments).toEqual([
      expect.objectContaining({ id: "optimistic-attachment-uuid-1", fileName: "photo.png", isImage: true, url: "blob:one" }),
      expect.objectContaining({ fileName: "Attachment", contentType: "application/octet-stream", sizeBytes: 0, isImage: false })
    ]);

    revokeOptimisticAttachmentUrls({
      id: "m1",
      conversationId: "c1",
      sender: "user",
      content: "",
      createdAt: "",
      attachments: [...attachments, { ...attachments[0], id: "remote", url: "https://example.com/file" }]
    });

    expect(globalThis.window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:one");
    expect(globalThis.window.URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });

  it("toggles tags, removes messages, and settles optimistic replies", () => {
    const optimistic = { id: "optimistic", conversationId: "c1", sender: "team", content: "Reply", createdAt: "", attachments: [], pending: true };
    const real = { id: "msg_2", conversationId: "c1", sender: "team", content: "Reply", createdAt: "", attachments: [] };

    expect(nextTagsForToggle(["pricing"], "bug")).toEqual(["bug", "pricing"]);
    expect(nextTagsForToggle(["pricing", "bug"], "bug")).toEqual(["pricing"]);
    expect(settleOptimisticMessage([optimistic], "optimistic", real)[0]).toMatchObject({ id: "msg_2", pending: false });
    expect(settleOptimisticMessage([real], "optimistic", real)).toEqual([real]);
    expect(settleOptimisticMessage([], "optimistic", real)).toEqual([real]);
  });
});

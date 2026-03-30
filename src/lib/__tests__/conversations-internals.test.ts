const repoMocks = vi.hoisted(() => ({
  findConversationById: vi.fn(),
  findConversationIdentityForActivity: vi.fn(),
  findPreviousConversationByIdentity: vi.fn(),
  hasPublicConversationAccessRecord: vi.fn(),
  insertAttachmentRecord: vi.fn(),
  insertConversationRecord: vi.fn(),
  insertMessageRecord: vi.fn(),
  listConversationMessageRows: vi.fn(),
  touchConversationAfterMessage: vi.fn(),
  upsertConversationMetadataRecord: vi.fn(),
  getConversationVisitorActivityAggregate: vi.fn()
}));

const sharedMocks = vi.hoisted(() => ({
  mapAttachment: vi.fn((row, url) => ({ id: row.id, messageId: row.message_id, url })),
  mapMessage: vi.fn((row, attachments) => ({ id: row.id, attachments, content: row.content })),
  queryMessageAttachmentRows: vi.fn(),
  updateConversationEmailValue: vi.fn()
}));

vi.mock("node:crypto", () => ({ randomUUID: vi.fn(() => "uuid-123") }));
vi.mock("@/lib/repositories/conversations-repository", () => repoMocks);
vi.mock("@/lib/workspace-access", () => ({ getWorkspaceAccess: vi.fn(async () => ({ ownerUserId: "owner_1" })) }));
vi.mock("@/lib/utils", () => ({ optionalText: (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null) }));
vi.mock("@/lib/data/shared", () => sharedMocks);

import {
  ensureConversation,
  getConversationVisitorActivity,
  getPublicConversationAccess,
  hasPreviousVisitorConversation,
  insertAttachments,
  insertMessage,
  loadConversationMessages,
  upsertMetadata
} from "@/lib/data/conversations-internals";

describe("conversation internals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reuses requested conversations on the same site and creates new ones otherwise", async () => {
    repoMocks.findConversationById.mockResolvedValueOnce({ site_id: "site_1", email: null });
    expect(await ensureConversation({ siteId: "site_1", sessionId: "session_1", conversationId: "conv_1", email: "alex@example.com" } as never)).toEqual({
      conversationId: "conv_1",
      createdConversation: false,
      emailCaptured: true
    });

    repoMocks.findConversationById.mockResolvedValueOnce({ site_id: "site_2", email: "known@example.com" });
    expect(await ensureConversation({ siteId: "site_1", sessionId: "session_1", conversationId: "conv_1", email: null } as never)).toEqual({
      conversationId: "uuid-123",
      createdConversation: true,
      emailCaptured: false
    });
    expect(repoMocks.insertConversationRecord).toHaveBeenCalledWith({
      conversationId: "uuid-123",
      siteId: "site_1",
      email: null,
      sessionId: "session_1"
    });
  });

  it("uses email and session identity branches for visitor access helpers", async () => {
    await hasPreviousVisitorConversation({ siteId: "site_1", conversationId: "conv_1", email: "alex@example.com", sessionId: "session_1" });
    await hasPreviousVisitorConversation({ siteId: "site_1", conversationId: "conv_1", email: null, sessionId: "session_1" });
    expect(repoMocks.findPreviousConversationByIdentity.mock.calls).toEqual([
      [{ siteId: "site_1", conversationId: "conv_1", useEmail: true, matchValue: "alex@example.com" }],
      [{ siteId: "site_1", conversationId: "conv_1", useEmail: false, matchValue: "session_1" }]
    ]);

    repoMocks.hasPublicConversationAccessRecord.mockResolvedValueOnce(true);
    await expect(getPublicConversationAccess({ siteId: "site_1", sessionId: "session_1", conversationId: "conv_1" })).resolves.toBe(true);
  });

  it("builds visitor activity, metadata, attachments, and loaded messages", async () => {
    repoMocks.findConversationIdentityForActivity.mockResolvedValueOnce(null).mockResolvedValueOnce({ site_id: "site_1", email: "alex@example.com", session_id: "session_1" }).mockResolvedValueOnce({ site_id: "site_1", email: null, session_id: "session_1" });
    repoMocks.getConversationVisitorActivityAggregate.mockResolvedValueOnce({ other_questions_last_month: "2", other_conversations_last_month: "3", other_conversations_total: "4", last_seen_at: "2026-03-29T10:00:00.000Z" }).mockResolvedValueOnce(null);

    expect(await getConversationVisitorActivity("conv_1", "user_1")).toBeNull();
    expect(await getConversationVisitorActivity("conv_1", "user_1")).toMatchObject({ matchType: "email", otherConversationsTotal: 4 });
    expect(await getConversationVisitorActivity("conv_1", "user_1")).toMatchObject({ matchType: "session", otherConversationsTotal: 0 });

    await upsertMetadata("conv_1", { pageUrl: " /pricing ", referrer: "", userAgent: "UA", country: "", region: "England", city: "London", timezone: "UTC", locale: "en-GB" });
    expect(repoMocks.upsertConversationMetadataRecord).toHaveBeenCalledWith(expect.objectContaining({ pageUrl: "/pricing", referrer: null, country: null }));

    await insertAttachments("msg_1", [{ fileName: "brief.pdf", contentType: "application/pdf", sizeBytes: 5, content: Buffer.from("x") }]);
    expect(repoMocks.insertAttachmentRecord).toHaveBeenCalledWith(expect.objectContaining({ messageId: "msg_1", fileName: "brief.pdf" }));

    repoMocks.listConversationMessageRows.mockResolvedValueOnce([{ id: "msg_1", content: "Hello" }]);
    sharedMocks.queryMessageAttachmentRows.mockResolvedValueOnce([{ id: "att_1", message_id: "msg_1" }]);
    await expect(loadConversationMessages("conv_1", (id) => `https://cdn/${id}`)).resolves.toEqual([{ id: "msg_1", attachments: [{ id: "att_1", messageId: "msg_1", url: "https://cdn/att_1" }], content: "Hello" }]);
  });

  it("inserts messages, trims content, and builds attachment urls", async () => {
    repoMocks.insertMessageRecord.mockResolvedValueOnce({ id: "uuid-123", content: "Hello", message_id: "uuid-123" });
    sharedMocks.queryMessageAttachmentRows.mockResolvedValueOnce([{ id: "att_1", message_id: "uuid-123" }]);

    await expect(insertMessage("conv_1", "founder", "  Hello  ", [{ fileName: "brief.pdf", contentType: "application/pdf", sizeBytes: 5, content: Buffer.from("x") }], { reopenConversation: true })).resolves.toEqual({
      id: "uuid-123",
      attachments: [{ id: "att_1", messageId: "uuid-123", url: "/api/files/att_1?conversationId=conv_1" }],
      content: "Hello"
    });
    expect(repoMocks.touchConversationAfterMessage).toHaveBeenCalledWith("conv_1", true);
  });
});

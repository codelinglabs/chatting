const mocks = vi.hoisted(() => ({
  deleteConversationTag: vi.fn(),
  deleteConversationTypingRecord: vi.fn(),
  deleteVisitorTypingRecord: vi.fn(),
  ensureConversation: vi.fn(),
  findActiveConversationTyping: vi.fn(),
  findConversationById: vi.fn(),
  findConversationEmailById: vi.fn(),
  findConversationEmailStateForUser: vi.fn(),
  findConversationIdentityForActivity: vi.fn(),
  findConversationNotificationContextRow: vi.fn(),
  findConversationTag: vi.fn(),
  findPublicAttachmentRecord: vi.fn(),
  findVisitorConversationEmailState: vi.fn(),
  getConversationVisitorActivity: vi.fn(),
  getPublicConversationAccess: vi.fn(),
  getSiteByPublicId: vi.fn(),
  hasConversationAccess: vi.fn(),
  hasPreviousVisitorConversation: vi.fn(),
  insertConversationTag: vi.fn(),
  insertMessage: vi.fn(),
  loadConversationMessages: vi.fn(),
  migrateVisitorNoteIdentity: vi.fn(),
  previewIncomingMessage: vi.fn(),
  queryConversationSummaries: vi.fn(),
  recordVisitorPresence: vi.fn(),
  upsertConversationFeedback: vi.fn(),
  upsertConversationRead: vi.fn(),
  upsertConversationTypingRecord: vi.fn(),
  upsertMetadata: vi.fn(),
  upsertVisitorTypingRecord: vi.fn(),
  updateConversationEmailValue: vi.fn(),
  updateConversationStatusRecord: vi.fn(),
  updateVisitorConversationEmailRecord: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  isHighIntentPage: vi.fn()
}));

vi.mock("@/lib/repositories/conversations-repository", () => ({
  deleteConversationTag: mocks.deleteConversationTag,
  deleteConversationTypingRecord: mocks.deleteConversationTypingRecord,
  deleteVisitorTypingRecord: mocks.deleteVisitorTypingRecord,
  findActiveConversationTyping: mocks.findActiveConversationTyping,
  findConversationById: mocks.findConversationById,
  findConversationEmailById: mocks.findConversationEmailById,
  findConversationEmailStateForUser: mocks.findConversationEmailStateForUser,
  findConversationIdentityForActivity: mocks.findConversationIdentityForActivity,
  findConversationNotificationContextRow: mocks.findConversationNotificationContextRow,
  findConversationTag: mocks.findConversationTag,
  findPublicAttachmentRecord: mocks.findPublicAttachmentRecord,
  findVisitorConversationEmailState: mocks.findVisitorConversationEmailState,
  insertConversationTag: mocks.insertConversationTag,
  updateConversationStatusRecord: mocks.updateConversationStatusRecord,
  updateVisitorConversationEmailRecord: mocks.updateVisitorConversationEmailRecord,
  upsertConversationFeedback: mocks.upsertConversationFeedback,
  upsertConversationRead: mocks.upsertConversationRead,
  upsertConversationTypingRecord: mocks.upsertConversationTypingRecord,
  upsertVisitorTypingRecord: mocks.upsertVisitorTypingRecord
}));
vi.mock("@/lib/notification-utils", () => ({
  isHighIntentPage: mocks.isHighIntentPage,
  previewIncomingMessage: mocks.previewIncomingMessage
}));
vi.mock("@/lib/workspace-access", () => ({ getWorkspaceAccess: mocks.getWorkspaceAccess }));
vi.mock("@/lib/data/sites", () => ({ getSiteByPublicId: mocks.getSiteByPublicId }));
vi.mock("@/lib/data/visitor-notes", () => ({ migrateVisitorNoteIdentity: mocks.migrateVisitorNoteIdentity }));
vi.mock("@/lib/data/visitors", () => ({ recordVisitorPresence: mocks.recordVisitorPresence }));
vi.mock("@/lib/data/conversations-internals", () => ({
  ensureConversation: mocks.ensureConversation,
  getConversationVisitorActivity: mocks.getConversationVisitorActivity,
  getPublicConversationAccess: mocks.getPublicConversationAccess,
  hasPreviousVisitorConversation: mocks.hasPreviousVisitorConversation,
  insertMessage: mocks.insertMessage,
  loadConversationMessages: mocks.loadConversationMessages,
  upsertMetadata: mocks.upsertMetadata
}));
vi.mock("@/lib/data/shared", () => ({
  hasConversationAccess: mocks.hasConversationAccess,
  mapAttachment: vi.fn(),
  mapMessage: vi.fn(),
  mapSummary: (row: Record<string, unknown>) => ({ id: row.id, pageUrl: row.page_url, city: row.city, region: row.region, country: row.country }),
  queryConversationSummaries: mocks.queryConversationSummaries,
  updateConversationEmailValue: mocks.updateConversationEmailValue
}));

import {
  createUserMessage,
  getConversationById,
  saveVisitorConversationEmail,
  updateVisitorTyping
} from "@/lib/data/conversations";

describe("conversation data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.previewIncomingMessage.mockReturnValue("Hello there");
    mocks.ensureConversation.mockResolvedValue({ conversationId: "conv_1", createdConversation: true, emailCaptured: true });
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1" });
    mocks.getSiteByPublicId.mockResolvedValue({ id: "site_1", userId: "owner_1", name: "Main site" });
    mocks.findConversationById.mockResolvedValue({ site_id: "site_1", email: null, session_id: "session_1" });
    mocks.hasPreviousVisitorConversation.mockResolvedValue(false);
    mocks.insertMessage.mockResolvedValue({ id: "msg_1", createdAt: "2026-03-29T10:00:00.000Z" });
    mocks.queryConversationSummaries.mockResolvedValue({ rowCount: 1, rows: [{ id: "conv_1", page_url: "https://example.com/pricing", city: "London", region: "England", country: "UK" }] });
    mocks.isHighIntentPage.mockReturnValue(true);
    mocks.getConversationVisitorActivity.mockResolvedValue({ matchType: "email" });
    mocks.loadConversationMessages.mockResolvedValue([{ id: "msg_1" }]);
  });

  it("creates user messages and returns the derived notification payload", async () => {
    const result = await createUserMessage({
      siteId: "site_1",
      sessionId: "session_1",
      email: "alex@example.com",
      content: "Hello there",
      attachments: [],
      metadata: { pageUrl: "https://example.com/pricing" }
    } as never);

    expect(mocks.recordVisitorPresence).toHaveBeenCalledWith(expect.objectContaining({ siteId: "site_1", sessionId: "session_1", conversationId: "conv_1" }));
    expect(result).toMatchObject({
      conversationId: "conv_1",
      siteUserId: "owner_1",
      siteName: "Main site",
      preview: "Hello there",
      location: "London, England, UK",
      visitorLabel: "alex@example.com",
      isNewConversation: true,
      isNewVisitor: true,
      highIntent: true,
      welcomeEmailEligible: true
    });
  });

  it("updates saved visitor emails and migrates the visitor identity", async () => {
    mocks.findVisitorConversationEmailState.mockResolvedValueOnce({ email: null, user_id: "owner_1" });
    mocks.updateVisitorConversationEmailRecord.mockResolvedValueOnce(true);

    const result = await saveVisitorConversationEmail({
      siteId: "site_1",
      sessionId: "session_1",
      conversationId: "conv_1",
      email: "alex@example.com"
    });

    expect(result).toEqual({ updated: true, welcomeEmailEligible: true, ownerUserId: "owner_1" });
    expect(mocks.migrateVisitorNoteIdentity).toHaveBeenCalledWith(expect.objectContaining({ nextEmail: "alex@example.com" }));
    expect(mocks.recordVisitorPresence).toHaveBeenCalledWith(expect.objectContaining({ email: "alex@example.com" }));
  });

  it("loads a full conversation thread when both summary and activity exist", async () => {
    const thread = await getConversationById("conv_1", "user_1");

    expect(thread).toEqual({
      id: "conv_1",
      pageUrl: "https://example.com/pricing",
      city: "London",
      region: "England",
      country: "UK",
      messages: [{ id: "msg_1" }],
      visitorActivity: { matchType: "email" }
    });
  });

  it("updates visitor typing by inserting or deleting the typing record", async () => {
    mocks.getPublicConversationAccess.mockResolvedValue(true);

    await expect(updateVisitorTyping({ siteId: "site_1", sessionId: "session_1", conversationId: "conv_1", typing: true })).resolves.toBe(true);
    await expect(updateVisitorTyping({ siteId: "site_1", sessionId: "session_1", conversationId: "conv_1", typing: false })).resolves.toBe(true);

    expect(mocks.upsertVisitorTypingRecord).toHaveBeenCalledWith("conv_1", "session_1");
    expect(mocks.deleteVisitorTypingRecord).toHaveBeenCalledWith("conv_1", "session_1");
  });
});

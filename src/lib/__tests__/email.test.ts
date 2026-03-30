const mocks = vi.hoisted(() => ({
  buildConversationFeedbackLinks: vi.fn(),
  renderConversationFeedbackScale: vi.fn(),
  renderConversationFeedbackText: vi.fn(),
  renderNewMessageNotificationEmail: vi.fn(),
  sendSesEmail: vi.fn()
}));

vi.mock("@/lib/chatly-notification-emails", () => ({
  renderNewMessageNotificationEmail: mocks.renderNewMessageNotificationEmail
}));
vi.mock("@/lib/conversation-feedback", () => ({
  buildConversationFeedbackLinks: mocks.buildConversationFeedbackLinks
}));
vi.mock("@/lib/conversation-feedback-email", () => ({
  renderConversationFeedbackScale: mocks.renderConversationFeedbackScale,
  renderConversationFeedbackText: mocks.renderConversationFeedbackText
}));
vi.mock("@/lib/env", () => ({ getPublicAppUrl: () => "https://app.example" }));
vi.mock("@/lib/env.server", () => ({
  getAppDisplayName: () => "Chatting",
  getMailFromAddress: () => "team@chatting.test",
  getReplyDomain: () => "reply.chatting.test"
}));
vi.mock("@/lib/ses-email", () => ({ sendSesEmail: mocks.sendSesEmail }));

import {
  sendFounderReplyEmail,
  sendSettingsTemplateTestEmail,
  sendTeamNewMessageEmail
} from "@/lib/email";

describe("email helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.buildConversationFeedbackLinks.mockReturnValue({ positive: "yes", negative: "no" });
    mocks.renderConversationFeedbackText.mockReturnValue("1 2 3 4 5");
    mocks.renderConversationFeedbackScale.mockReturnValue("<div>Scale</div>");
    mocks.renderNewMessageNotificationEmail.mockReturnValue({
      subject: "New visitor message",
      bodyText: "Preview text",
      bodyHtml: "<table></table></td></tr></table>"
    });
    mocks.sendSesEmail.mockResolvedValue(undefined);
  });

  it("sends founder reply emails with feedback links and a reply alias", async () => {
    await sendFounderReplyEmail({
      conversationId: "conv_1",
      to: "alex@example.com",
      content: "Line 1\nLine 2",
      attachments: [{ fileName: "pricing.pdf", contentType: "application/pdf", content: Buffer.from("x") }]
    });

    expect(mocks.sendSesEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "team@chatting.test",
        to: "alex@example.com",
        replyTo: "reply+conv_1@reply.chatting.test",
        subject: "Reply from Chatting",
        bodyText: expect.stringContaining("Reply to this email to continue the conversation."),
        bodyHtml: expect.stringContaining("Attached: pricing.pdf")
      })
    );
  });

  it("sends team new-message emails with reply and inbox links", async () => {
    await sendTeamNewMessageEmail({
      to: "team@example.com",
      siteName: "Main site",
      conversationId: "conv_1",
      content: "Need help",
      visitorEmail: "alex@example.com",
      pageUrl: "https://example.com/pricing",
      attachmentsCount: 2
    });

    expect(mocks.renderNewMessageNotificationEmail).toHaveBeenCalledWith({
      visitorName: "alex@example.com",
      visitorEmail: "alex@example.com",
      currentPage: "https://example.com/pricing",
      messagePreview: "Need help",
      replyNowUrl: "mailto:reply+conv_1@reply.chatting.test",
      inboxUrl: "https://app.example/dashboard?id=conv_1"
    });
    expect(mocks.sendSesEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "team@example.com",
        subject: "New visitor message",
        bodyText: expect.stringContaining("Workspace: Main site\nAttachments: 2"),
        bodyHtml: expect.stringContaining("Workspace: Main site")
      })
    );
  });

  it("sends settings template test emails through the shared rich-email path", async () => {
    await sendSettingsTemplateTestEmail({
      to: "team@example.com",
      subject: "Template preview",
      bodyText: "Plain body",
      bodyHtml: "<p>HTML body</p>"
    });

    expect(mocks.sendSesEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "team@chatting.test",
        to: "team@example.com",
        subject: "Template preview",
        bodyText: "Plain body",
        bodyHtml: expect.stringContaining("<p>HTML body</p>")
      })
    );
  });
});

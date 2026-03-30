const mocks = vi.hoisted(() => ({
  renderStarterUpgradePromptEmail: vi.fn(),
  sendRichEmail: vi.fn(),
  sendStyledTrialExtensionOutreachEmail: vi.fn()
}));

vi.mock("@/lib/chatly-marketing-email-senders", () => ({
  sendStyledTrialExtensionOutreachEmail: mocks.sendStyledTrialExtensionOutreachEmail
}));

vi.mock("@/lib/email", () => ({
  sendRichEmail: mocks.sendRichEmail
}));

vi.mock("@/lib/team-notification-email", () => ({
  renderStarterUpgradePromptEmail: mocks.renderStarterUpgradePromptEmail
}));

import { sendTrialExtensionOutreachEmail } from "@/lib/billing-outreach";
import { sendStarterUpgradePromptEmail } from "@/lib/billing-upgrade-email";

describe("billing email helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("formats trial extension outreach before delegating to the marketing sender", async () => {
    await sendTrialExtensionOutreachEmail({
      to: "owner@example.com",
      planName: "Growth",
      trialEndsAt: "2026-04-12T00:00:00.000Z"
    });

    expect(mocks.sendStyledTrialExtensionOutreachEmail).toHaveBeenCalledWith({
      to: "owner@example.com",
      planName: "Growth",
      formattedEndDate: "12 April 2026"
    });
  });

  it("renders upgrade prompt emails before sending them", async () => {
    mocks.renderStarterUpgradePromptEmail.mockReturnValue({
      subject: "Upgrade now",
      bodyText: "Text body",
      bodyHtml: "<p>HTML body</p>"
    });

    await sendStarterUpgradePromptEmail({
      to: "owner@example.com",
      prompt: { conversationCount: 50, conversationLimit: 50, remainingConversations: 0, billingUrl: "https://usechatting.com", limitReached: true }
    });

    expect(mocks.sendRichEmail).toHaveBeenCalledWith({
      to: "owner@example.com",
      subject: "Upgrade now",
      bodyText: "Text body",
      bodyHtml: "<p>HTML body</p>"
    });
  });
});

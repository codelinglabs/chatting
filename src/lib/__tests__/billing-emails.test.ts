const mocks = vi.hoisted(() => ({
  renderStarterUpgradePromptEmail: vi.fn(),
  sendRenderedEmail: vi.fn(),
  resolvePrimaryBrandHelloMailFrom: vi.fn()
}));

vi.mock("@/lib/rendered-email-delivery", () => ({
  sendRenderedEmail: mocks.sendRenderedEmail
}));

vi.mock("@/lib/team-notification-email", () => ({
  renderStarterUpgradePromptEmail: mocks.renderStarterUpgradePromptEmail
}));

vi.mock("@/lib/mail-from-addresses", () => ({
  resolvePrimaryBrandHelloMailFrom: mocks.resolvePrimaryBrandHelloMailFrom
}));

import { sendStarterUpgradePromptEmail } from "@/lib/billing-upgrade-email";

describe("billing email helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders upgrade prompt emails before sending them", async () => {
    mocks.resolvePrimaryBrandHelloMailFrom.mockReturnValue("Chatting <hello@usechatting.com>");
    mocks.renderStarterUpgradePromptEmail.mockReturnValue({
      subject: "Upgrade now",
      bodyText: "Text body",
      bodyHtml: "<p>HTML body</p>"
    });

    await sendStarterUpgradePromptEmail({
      to: "owner@example.com",
      prompt: { conversationCount: 50, conversationLimit: 50, remainingConversations: 0, billingUrl: "https://usechatting.com", limitReached: true }
    });

    expect(mocks.sendRenderedEmail).toHaveBeenCalledWith({
      from: "Chatting <hello@usechatting.com>",
      to: "owner@example.com",
      emailCategory: "optional",
      footerTeamName: "Chatting",
      rendered: {
        subject: "Upgrade now",
        bodyText: "Text body",
        bodyHtml: "<p>HTML body</p>"
      }
    });
  });
});

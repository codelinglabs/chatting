import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

function createInitialData() {
  return {
    profile: { firstName: "Tina", lastName: "Bauer", email: "tina@usechatting.com", jobTitle: "Founder", avatarDataUrl: null },
    notifications: { browserNotifications: true, soundAlerts: true, emailNotifications: true, newVisitorAlerts: false, highIntentAlerts: true },
    aiAssist: { replySuggestionsEnabled: true, conversationSummariesEnabled: true, rewriteAssistanceEnabled: true, suggestedTagsEnabled: true },
    email: { notificationEmail: "team@usechatting.com", replyToEmail: "reply@usechatting.com", templates: [], emailSignature: "Best,\nChatting" },
    reports: {
      weeklyReportEnabled: true,
      weeklyReportSendTime: "09:00",
      weeklyReportIncludePersonalStats: true,
      workspaceWeeklyReportsEnabled: true,
      workspaceIncludeTeamLeaderboard: true,
      workspaceAiInsightsEnabled: true,
      canManageWorkspaceReports: true,
      recipientTimeZone: "Europe/London",
      teamTimeZone: "Europe/London"
    },
    teamMembers: [],
    teamInvites: [],
    billing: {
      planKey: "starter",
      planName: "Starter Plan",
      priceLabel: "$0/month",
      billingInterval: null,
      usedSeats: 1,
      billedSeats: null,
      seatLimit: 5,
      siteCount: 1,
      conversationCount: 12,
      messageCount: 34,
      avgResponseSeconds: 72,
      conversationLimit: 50,
      conversationUsagePercent: 24,
      upgradePromptThreshold: 30,
      remainingConversations: 38,
      showUpgradePrompt: false,
      limitReached: false,
      nextBillingDate: null,
      trialEndsAt: null,
      subscriptionStatus: null,
      customerId: null,
      portalAvailable: true,
      checkoutAvailable: true,
      features: { billedPerSeat: false, proactiveChat: false, removeBranding: false },
      paymentMethod: null,
      invoices: [],
      referrals: { programs: [], attributedSignups: [], rewards: [], pendingRewardCount: 0, earnedRewardCount: 0, earnedFreeMonths: 0, earnedDiscountCents: 0, earnedCommissionCents: 0 }
    }
  };
}

async function loadSettingsPage(search = "") {
  vi.resetModules();
  const reactMocks = createMockReactHooks();
  const captures: Record<string, unknown> = {};
  const trackGrometricsEvent = vi.fn();

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(search) }));
  vi.doMock("@/lib/billing-plans", () => ({ shouldShowTranscriptBranding: (planKey: string) => planKey === "starter" }));
  vi.doMock("@/lib/grometrics", () => ({ trackGrometricsEvent }));
  vi.doMock("../ui/toast-provider", () => ({ useToast: () => ({ showToast: vi.fn() }) }));
  vi.doMock("./dashboard-settings-scaffold", () => ({
    DashboardSettingsScaffold: ({ children }: { children: unknown }) => <div>{children}</div>
  }));
  vi.doMock("./dashboard-settings-automation-section", () => ({ SettingsAutomationSection: () => <div>automation</div> }));
  vi.doMock("./dashboard-settings-profile-section", () => ({ SettingsProfileSection: () => <div>profile</div> }));
  vi.doMock("./dashboard-settings-notifications-section", () => ({ SettingsNotificationsSection: () => <div>notifications</div> }));
  vi.doMock("./dashboard-settings-ai-assist-section", () => ({ SettingsAiAssistSection: () => <div>ai assist</div> }));
  vi.doMock("./dashboard-settings-reports-section", () => ({ SettingsReportsSection: () => <div>reports</div> }));
  vi.doMock("./dashboard-settings-email-billing-sections", () => ({
    SettingsEmailSection: () => <div>email</div>,
    SettingsBillingSection: (props: unknown) => ((captures.billing = props), <div>billing</div>)
  }));
  vi.doMock("./dashboard-settings-referrals-section", () => ({ SettingsReferralsSection: () => <div>referrals</div> }));

  const module = await import("./dashboard-settings-page");
  return { DashboardSettingsPage: module.DashboardSettingsPage, captures, reactMocks, trackGrometricsEvent };
}

describe("dashboard settings billing analytics", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("tracks checkout starts when a starter workspace upgrades to growth", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, billing: { ...createInitialData().billing, billingInterval: "monthly" } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, redirectUrl: "https://stripe.example/checkout" }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", {
      setTimeout: vi.fn().mockReturnValue(1),
      clearTimeout: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      location: { assign: vi.fn() }
    });

    const { DashboardSettingsPage, captures, reactMocks, trackGrometricsEvent } = await loadSettingsPage("section=billing");
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);
    await runMockEffects(reactMocks.effects);
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);

    await (captures.billing as { onChangePlan: (plan: "growth", interval: "monthly", seatQuantity: number) => Promise<void> }).onChangePlan("growth", "monthly", 3);

    expect(trackGrometricsEvent).toHaveBeenCalledWith("checkout_started", {
      plan: "growth",
      billing: "monthly",
      seat_quantity: 3,
      source: "dashboard_billing"
    });
    expect((globalThis.window as Window).location.assign).toHaveBeenCalledWith("https://stripe.example/checkout");
  });
});

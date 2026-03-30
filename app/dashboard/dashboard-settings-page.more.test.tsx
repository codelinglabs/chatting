import { renderToStaticMarkup } from "react-dom/server";
import { createMockReactHooks, runMockEffects } from "./test-react-hooks";

function createInitialData() {
  return {
    profile: { firstName: "Tina", lastName: "Bauer", email: "tina@usechatting.com", jobTitle: "Founder", avatarDataUrl: null },
    notifications: { browserNotifications: true, soundAlerts: true, emailNotifications: true, newVisitorAlerts: false, highIntentAlerts: true },
    email: { notificationEmail: "team@usechatting.com", replyToEmail: "reply@usechatting.com", templates: [], emailSignature: "Best,\nChatting" },
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
      trialExtensionEligible: true,
      trialExtensionUsedAt: null,
      activityQualifiedForTrialExtension: true,
      subscriptionStatus: null,
      customerId: null,
      portalAvailable: true,
      checkoutAvailable: true,
      features: { billedPerSeat: false, proactiveChat: false, removeBranding: false, trialExtensions: true },
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

  vi.doMock("react", () => reactMocks.moduleFactory());
  vi.doMock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(search) }));
  vi.doMock("@/lib/billing-plans", () => ({ shouldShowTranscriptBranding: (planKey: string) => planKey === "starter" }));
  vi.doMock("./dashboard-controls", () => ({ DashboardTopNotice: ({ notice }: { notice: unknown }) => ((captures.notice = notice), <div>notice</div>) }));
  vi.doMock("./dashboard-settings-scaffold", () => ({ DashboardSettingsScaffold: ({ children, ...props }: { children: unknown }) => ((captures.scaffold = props), <div>{children}</div>) }));
  vi.doMock("./dashboard-settings-profile-section", () => ({ SettingsProfileSection: (props: unknown) => ((captures.profile = props), <div>profile</div>) }));
  vi.doMock("./dashboard-settings-notifications-section", () => ({ SettingsNotificationsSection: (props: unknown) => ((captures.notifications = props), <div>notifications</div>) }));
  vi.doMock("./dashboard-settings-email-billing-sections", () => ({
    SettingsEmailSection: (props: unknown) => ((captures.email = props), <div>email</div>),
    SettingsBillingSection: (props: unknown) => ((captures.billing = props), <div>billing</div>)
  }));
  vi.doMock("./dashboard-settings-referrals-section", () => ({ SettingsReferralsSection: (props: unknown) => ((captures.referrals = props), <div>referrals</div>) }));

  const module = await import("./dashboard-settings-page");
  return { DashboardSettingsPage: module.DashboardSettingsPage, captures, reactMocks };
}

describe("dashboard settings page more", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("maps billing search states and sync failures into notices", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ ok: false, error: "billing-sync-failed" }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { setTimeout: vi.fn().mockReturnValue(1), clearTimeout: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(), location: { assign: vi.fn() } });

    const cancelled = await loadSettingsPage("section=billing&billing=checkout-cancelled");
    cancelled.reactMocks.beginRender();
    renderToStaticMarkup(<cancelled.DashboardSettingsPage initialData={createInitialData()} />);
    await runMockEffects(cancelled.reactMocks.effects);
    cancelled.reactMocks.beginRender();
    renderToStaticMarkup(<cancelled.DashboardSettingsPage initialData={createInitialData()} />);
    expect(cancelled.captures.notice).toEqual({ tone: "error", message: "Stripe checkout was cancelled" });
    expect((cancelled.captures.scaffold as { activeSection: string }).activeSection).toBe("billing");

    const portalReturn = await loadSettingsPage("section=billing&billing=portal-return");
    portalReturn.reactMocks.beginRender();
    renderToStaticMarkup(<portalReturn.DashboardSettingsPage initialData={createInitialData()} />);
    await runMockEffects(portalReturn.reactMocks.effects);
    portalReturn.reactMocks.beginRender();
    renderToStaticMarkup(<portalReturn.DashboardSettingsPage initialData={createInitialData()} />);
    expect(portalReturn.captures.notice).toEqual({
      tone: "error",
      message: "We couldn't refresh billing from Stripe right now."
    });
  });

  it("maps save, portal, plan, and trial-extension failures while skipping redundant starter changes", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, json: async () => ({ ok: false, error: "missing_current_password" }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ ok: false, error: "billing-portal-session-failed" }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ ok: false, error: "contact_sales_required" }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ ok: false, error: "trial_extension_unavailable" }) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { setTimeout: vi.fn().mockReturnValue(1), clearTimeout: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(), location: { assign: vi.fn() } });

    const { DashboardSettingsPage, captures, reactMocks } = await loadSettingsPage("section=billing");
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);
    await runMockEffects(reactMocks.effects);
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);

    await (captures.scaffold as { onSave: () => Promise<void> }).onSave();
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);
    expect(captures.notice).toEqual({ tone: "error", message: "Enter your current password before choosing a new one." });

    await (captures.billing as { onOpenBillingPortal: () => Promise<void> }).onOpenBillingPortal();
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);
    expect(captures.notice).toEqual({ tone: "error", message: "We couldn't open the Stripe billing portal right now." });

    await (captures.billing as { onChangePlan: (plan: "starter" | "growth", interval: "monthly") => Promise<void> }).onChangePlan("starter", "monthly");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await (captures.billing as { onChangePlan: (plan: "starter" | "growth", interval: "monthly") => Promise<void> }).onChangePlan("growth", "monthly");
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);
    expect(captures.notice).toEqual({ tone: "error", message: "Teams with 50 or more members need a custom setup right now." });

    await (captures.billing as { onRequestTrialExtension: () => Promise<void> }).onRequestTrialExtension();
    reactMocks.beginRender();
    renderToStaticMarkup(<DashboardSettingsPage initialData={createInitialData()} />);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[3]?.[0]).toBe("/dashboard/settings/billing/trial-extension");
  });
});

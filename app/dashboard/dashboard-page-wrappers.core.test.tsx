import { renderToStaticMarkup } from "react-dom/server";
import {
  OWNER_USER,
  SHELL_DATA,
  primeWrapperDefaults
} from "./dashboard-page-wrappers.test-helpers";

const mocks = {
  getDashboardShellData: vi.fn(),
  getDashboardSettingsData: vi.fn(),
  getDashboardTeamPageData: vi.fn(),
  getDashboardWidgetPageData: vi.fn(),
  getUserOnboardingStep: vi.fn(),
  listConversationSummaries: vi.fn(),
  listVisitorPresenceSessions: vi.fn(),
  redirect: vi.fn(),
  requireUser: vi.fn(),
  usePathname: vi.fn()
};

vi.mock("@/lib/auth", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/data/dashboard-shell-data", () => ({
  getDashboardShellData: mocks.getDashboardShellData
}));
vi.mock("@/lib/data/widget-page", () => ({
  getDashboardWidgetPageData: mocks.getDashboardWidgetPageData
}));
vi.mock("@/lib/data", () => ({
  getDashboardSettingsData: mocks.getDashboardSettingsData,
  getDashboardTeamPageData: mocks.getDashboardTeamPageData,
  getUserOnboardingStep: mocks.getUserOnboardingStep,
  listConversationSummaries: mocks.listConversationSummaries,
  listVisitorPresenceSessions: mocks.listVisitorPresenceSessions
}));
vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  usePathname: mocks.usePathname
}));

describe("dashboard page wrappers core", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    primeWrapperDefaults(mocks);
  });

  it("loads widget, visitors, and team pages with the expected child props", async () => {
    const captures: Record<string, unknown> = {};
    mocks.getDashboardWidgetPageData.mockResolvedValue({
      sites: [{ id: "site_1" }],
      proactiveChatUnlocked: true
    });
    mocks.listConversationSummaries.mockResolvedValue([{ id: "conv_1" }]);
    mocks.listVisitorPresenceSessions.mockResolvedValue([{ sessionId: "session_1" }]);
    mocks.getDashboardTeamPageData.mockResolvedValue({
      teamMembers: [{ id: "member_1" }],
      teamInvites: [{ id: "invite_1" }]
    });

    vi.doMock("./widget/widget-page-client", () => ({
      DashboardWidgetPageClient: (props: unknown) => ((captures.widget = props), <div>widget</div>)
    }));
    vi.doMock("./dashboard-visitors-page", () => ({
      DashboardVisitorsPage: (props: unknown) => ((captures.visitors = props), <div>visitors</div>)
    }));
    vi.doMock("./dashboard-team-page", () => ({
      DashboardTeamPage: (props: unknown) => ((captures.team = props), <div>team</div>)
    }));

    const widgetPage = (await import("./widget/page")).default;
    const visitorsPage = (await import("./visitors/page")).default;
    const teamPage = (await import("./team/page")).default;

    expect(renderToStaticMarkup(await widgetPage())).toContain("widget");
    expect(renderToStaticMarkup(await visitorsPage())).toContain("visitors");
    expect(renderToStaticMarkup(await teamPage())).toContain("team");
    expect(captures.widget).toEqual({
      initialSites: [{ id: "site_1" }],
      proactiveChatUnlocked: true
    });
    expect(captures.visitors).toEqual({
      initialConversations: [{ id: "conv_1" }],
      initialLiveSessions: [{ sessionId: "session_1" }]
    });
    expect(captures.team).toEqual({
      canManageTeam: true,
      initialMembers: [{ id: "member_1" }],
      initialInvites: [{ id: "invite_1" }]
    });
  });

  it("passes member permissions through the team wrapper", async () => {
    const captures: Record<string, unknown> = {};
    mocks.requireUser.mockResolvedValueOnce({ ...OWNER_USER, id: "user_2", email: "member@example.com", workspaceRole: "member" });
    mocks.getDashboardTeamPageData.mockResolvedValueOnce({ teamMembers: [], teamInvites: [] });
    vi.doMock("./dashboard-team-page", () => ({
      DashboardTeamPage: (props: unknown) => ((captures.team = props), <div>team</div>)
    }));

    const teamPage = (await import("./team/page")).default;
    renderToStaticMarkup(await teamPage());

    expect(captures.team).toEqual({ canManageTeam: false, initialMembers: [], initialInvites: [] });
  });

  it("loads dashboard layout, home, settings, and both loading variants", async () => {
    const captures: Record<string, unknown> = {};
    mocks.getDashboardShellData.mockResolvedValueOnce(SHELL_DATA);
    mocks.getDashboardSettingsData.mockResolvedValueOnce({ profile: { email: OWNER_USER.email } });
    vi.doMock("./dashboard-shell", () => ({
      DashboardShell: (props: unknown) => ((captures.shell = props), <div>shell</div>)
    }));
    vi.doMock("./dashboard-home", () => ({
      DashboardHome: (props: unknown) => ((captures.home = props), <div>home</div>)
    }));
    vi.doMock("./dashboard-settings-page", () => ({
      DashboardSettingsPage: (props: unknown) => ((captures.settings = props), <div>settings</div>)
    }));

    const dashboardLayout = (await import("./layout")).default;
    const dashboardPage = (await import("./page")).default;
    const settingsPage = (await import("./settings/page")).default;
    const DashboardLoading = (await import("./loading")).default;

    expect(renderToStaticMarkup(await dashboardLayout({ children: <div>child</div> }))).toContain("shell");
    expect(renderToStaticMarkup(await dashboardPage())).toContain("home");
    expect(renderToStaticMarkup(await settingsPage())).toContain("settings");

    mocks.usePathname.mockReturnValue("/dashboard/inbox");
    const inboxLoading = renderToStaticMarkup(<DashboardLoading />);
    mocks.usePathname.mockReturnValue("/dashboard");
    const pageLoading = renderToStaticMarkup(<DashboardLoading />);

    expect(captures.shell).toMatchObject({
      userEmail: OWNER_USER.email,
      unreadCount: 3,
      notificationSettings: { email: true }
    });
    expect(captures.home).toEqual({
      userEmail: OWNER_USER.email,
      userId: OWNER_USER.id,
      workspaceOwnerId: OWNER_USER.workspaceOwnerId
    });
    expect(captures.settings).toEqual({
      initialData: { profile: { email: OWNER_USER.email } },
      canManageSavedReplies: true,
      activeSection: "profile"
    });
    expect(inboxLoading).toContain("h-24 rounded-xl bg-slate-50");
    expect(pageLoading).toContain("xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]");
  });

  it("redirects to onboarding before rendering the dashboard shell", async () => {
    mocks.getUserOnboardingStep.mockResolvedValueOnce("install");
    mocks.redirect.mockImplementation((url: string) => {
      throw new Error(url);
    });

    const dashboardLayout = (await import("./layout")).default;

    await expect(dashboardLayout({ children: <div>child</div> })).rejects.toThrow(
      "/onboarding?step=install"
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/onboarding?step=install");
  });
});

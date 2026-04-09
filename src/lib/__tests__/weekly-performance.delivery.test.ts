const mocks = vi.hoisted(() => ({
  getPublicAppUrl: vi.fn(),
  claimWeeklyPerformanceDelivery: vi.fn(),
  releaseWeeklyPerformanceDelivery: vi.fn(),
  getOrCreateWeeklyPerformanceSnapshot: vi.fn(),
  sendWeeklyPerformanceEmail: vi.fn(),
  sendWeeklyWidgetInstallEmail: vi.fn()
}));

vi.mock("@/lib/chatting-notification-email-senders", () => ({
  sendWeeklyPerformanceEmail: mocks.sendWeeklyPerformanceEmail,
  sendWeeklyWidgetInstallEmail: mocks.sendWeeklyWidgetInstallEmail
}));
vi.mock("@/lib/env", () => ({ getPublicAppUrl: mocks.getPublicAppUrl }));
vi.mock("@/lib/repositories/weekly-performance-repository", () => ({
  claimWeeklyPerformanceDelivery: mocks.claimWeeklyPerformanceDelivery,
  listWeeklyPerformanceRecipientRows: vi.fn(),
  listWeeklyPerformanceWorkspaceRows: vi.fn(),
  releaseWeeklyPerformanceDelivery: mocks.releaseWeeklyPerformanceDelivery
}));
vi.mock("@/lib/weekly-performance-snapshot-service", () => ({
  getOrCreateWeeklyPerformanceSnapshot: mocks.getOrCreateWeeklyPerformanceSnapshot
}));

import {
  sendUserWeeklyPerformanceEmail,
  shouldRunWeeklyPerformanceEmails
} from "@/lib/weekly-performance";

function snapshot(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    teamName: "Chatting",
    dateRange: "Mar 23 – Mar 29",
    previewText: "4 conversations, 4m avg response time",
    reportUrl: "https://usechatting.com/dashboard/analytics?range=last_week",
    settingsUrl: "https://usechatting.com/dashboard/settings?section=reports",
    widgetUrl: "https://usechatting.com/dashboard/widget",
    quietWeek: false,
    metrics: [{ label: "Conversations", value: "4", trendLabel: "↑ 33% vs last week", trendTone: "positive", trendDirection: "up" }],
    heatmapHours: ["8am"],
    heatmapRows: [{ label: "Mon", cells: [{ count: 2, intensity: "medium" }] }],
    peakLabel: "Mon 8am-9am (2 conversations)",
    topPages: [{ label: "/pricing", count: 3, widthPercent: 100 }],
    insight: "Response time improved this week.",
    tip: { text: "Save a few quick replies for common questions to keep first-response time down.", href: "https://usechatting.com/dashboard/settings?section=savedReplies", label: "Create saved replies" },
    teamPerformance: [{ userId: "user_1", name: "Tina Bauer", initials: "TB", conversationsLabel: "4 conversations", avgResponseLabel: "4m avg", resolutionLabel: "75% resolved", satisfactionLabel: "⭐ 4.8", conversationCount: 4 }],
    personalPerformanceByUserId: { user_1: { userId: "user_1", name: "Tina Bauer", conversationsLabel: "4 conversations", avgResponseLabel: "4m avg", resolutionLabel: "75% resolved", satisfactionLabel: "⭐ 4.8", teamAverageLabel: "4m avg · 75% resolved · ⭐ 4.8" } },
    ...overrides
  };
}

describe("weekly performance delivery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T13:15:00.000Z"));
    mocks.getPublicAppUrl.mockReturnValue("https://usechatting.com");
    mocks.claimWeeklyPerformanceDelivery.mockResolvedValue(true);
    mocks.getOrCreateWeeklyPerformanceSnapshot.mockResolvedValue(snapshot());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("sends a personalized weekly report from the frozen workspace snapshot", async () => {
    await expect(
      sendUserWeeklyPerformanceEmail({
        userId: "user_1",
        ownerUserId: "owner_1",
        notificationEmail: "team@example.com",
        recipientTimeZone: "UTC",
        teamTimeZone: "UTC",
        teamName: "Acme Support",
        widgetInstalled: true,
        now: new Date("2026-03-30T13:15:00.000Z")
      })
    ).resolves.toBe("sent");

    expect(mocks.getOrCreateWeeklyPerformanceSnapshot).toHaveBeenCalledWith({
      ownerUserId: "owner_1",
      teamName: "Acme Support",
      weekStart: "2026-03-23",
      teamTimeZone: "UTC",
      reportUrl: "https://usechatting.com/dashboard/analytics?range=last_week",
      settingsUrl: "https://usechatting.com/dashboard/settings?section=reports",
      widgetUrl: "https://usechatting.com/dashboard/widget",
      includeAiInsights: true,
      includeTeamLeaderboard: true
    });
    expect(mocks.sendWeeklyPerformanceEmail).toHaveBeenCalledWith({
      to: "team@example.com",
      footerTeamName: "Acme Support",
      report: expect.objectContaining({
        recipientUserId: "user_1",
        dateRange: "Mar 23 – Mar 29",
        personalPerformance: expect.objectContaining({ userId: "user_1" }),
        teamPerformance: expect.arrayContaining([expect.objectContaining({ userId: "user_1" })])
      })
    });
    expect(mocks.claimWeeklyPerformanceDelivery).toHaveBeenCalledWith("user_1", "owner_1", "2026-03-23");
    expect(mocks.releaseWeeklyPerformanceDelivery).not.toHaveBeenCalled();
  });

  it("sends the install-widget fallback instead of skipping the report", async () => {
    await expect(
      sendUserWeeklyPerformanceEmail({
        userId: "user_1",
        ownerUserId: "owner_1",
        notificationEmail: "team@example.com",
        recipientTimeZone: "UTC",
        teamTimeZone: "UTC",
        teamName: "Acme Support",
        widgetInstalled: false,
        now: new Date("2026-03-30T13:15:00.000Z")
      })
    ).resolves.toBe("sent");

    expect(mocks.sendWeeklyWidgetInstallEmail).toHaveBeenCalledWith({
      to: "team@example.com",
      teamName: "Acme Support",
      widgetUrl: "https://usechatting.com/dashboard/widget",
      settingsUrl: "https://usechatting.com/dashboard/settings?section=reports"
    });
    expect(mocks.sendWeeklyPerformanceEmail).not.toHaveBeenCalled();
    expect(mocks.getOrCreateWeeklyPerformanceSnapshot).not.toHaveBeenCalled();
  });

  it("retries cleanup when a claimed weekly delivery cannot be released on the first transient DB timeout", async () => {
    mocks.sendWeeklyPerformanceEmail.mockRejectedValueOnce(new Error("SEND_FAILED"));
    mocks.releaseWeeklyPerformanceDelivery
      .mockRejectedValueOnce(new Error("Authentication timed out"))
      .mockResolvedValueOnce(undefined);

    await expect(
      sendUserWeeklyPerformanceEmail({
        userId: "user_1",
        ownerUserId: "owner_1",
        notificationEmail: "team@example.com",
        recipientTimeZone: "UTC",
        teamTimeZone: "UTC",
        teamName: "Acme Support",
        widgetInstalled: true,
        now: new Date("2026-03-30T13:15:00.000Z")
      })
    ).rejects.toThrow("SEND_FAILED");

    expect(mocks.releaseWeeklyPerformanceDelivery).toHaveBeenCalledTimes(2);
    expect(mocks.releaseWeeklyPerformanceDelivery).toHaveBeenNthCalledWith(1, "user_1", "owner_1", "2026-03-23");
    expect(mocks.releaseWeeklyPerformanceDelivery).toHaveBeenNthCalledWith(2, "user_1", "owner_1", "2026-03-23");
  });

  it("gates on the local send window including minutes and workspace week alignment", () => {
    expect(shouldRunWeeklyPerformanceEmails(new Date("2026-03-30T08:59:00.000Z"), "UTC", "UTC", 9, 0)).toBe(false);
    expect(shouldRunWeeklyPerformanceEmails(new Date("2026-03-30T09:29:00.000Z"), "UTC", "UTC", 9, 30)).toBe(false);
    expect(shouldRunWeeklyPerformanceEmails(new Date("2026-03-30T09:30:00.000Z"), "UTC", "UTC", 9, 30)).toBe(true);
    expect(shouldRunWeeklyPerformanceEmails(new Date("2026-03-30T00:30:00.000Z"), "Asia/Tokyo", "America/Los_Angeles", 9, 0)).toBe(false);
  });
});

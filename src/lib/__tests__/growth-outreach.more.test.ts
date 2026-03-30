const mocks = vi.hoisted(() => ({
  buildActivation: vi.fn(),
  buildHealth: vi.fn(),
  findAuthUserById: vi.fn(),
  findGrowthEmailNudgeRow: vi.fn(),
  findNotificationSettingsRow: vi.fn(),
  getActivationReminderKey: vi.fn(),
  getDashboardBillingSummary: vi.fn(),
  getDashboardGrowthSnapshot: vi.fn(),
  getDashboardHomeResponseMetrics: vi.fn(),
  getDashboardGrowthSnapshotRules: vi.fn(),
  isGrowthNudgeDue: vi.fn(),
  isSiteWidgetInstalled: vi.fn(),
  mapSite: vi.fn((row) => row),
  querySites: vi.fn(),
  sendActivationReminderEmail: vi.fn(),
  sendExpansionReminderEmail: vi.fn(),
  sendHealthReminderEmail: vi.fn(),
  shouldSendAnalyticsExpansionReminder: vi.fn(),
  shouldSendHealthReminder: vi.fn(),
  shouldSendTeamExpansionReminder: vi.fn(),
  upsertGrowthEmailNudgeRow: vi.fn()
}));

vi.mock("@/lib/data/dashboard-growth-activation-health", () => ({
  buildActivation: mocks.buildActivation,
  buildHealth: mocks.buildHealth
}));
vi.mock("@/lib/data/billing", () => ({ getDashboardBillingSummary: mocks.getDashboardBillingSummary }));
vi.mock("@/lib/data/shared", () => ({ querySites: mocks.querySites, mapSite: mocks.mapSite }));
vi.mock("@/lib/growth-outreach-email", () => ({
  sendActivationReminderEmail: mocks.sendActivationReminderEmail,
  sendExpansionReminderEmail: mocks.sendExpansionReminderEmail,
  sendHealthReminderEmail: mocks.sendHealthReminderEmail
}));
vi.mock("@/lib/growth-outreach-rules", () => ({
  getActivationReminderKey: mocks.getActivationReminderKey,
  isGrowthNudgeDue: mocks.isGrowthNudgeDue,
  shouldSendAnalyticsExpansionReminder: mocks.shouldSendAnalyticsExpansionReminder,
  shouldSendHealthReminder: mocks.shouldSendHealthReminder,
  shouldSendTeamExpansionReminder: mocks.shouldSendTeamExpansionReminder
}));
vi.mock("@/lib/repositories/auth-repository", () => ({ findAuthUserById: mocks.findAuthUserById }));
vi.mock("@/lib/repositories/dashboard-growth-repository", () => ({ getDashboardGrowthSnapshot: mocks.getDashboardGrowthSnapshot }));
vi.mock("@/lib/repositories/dashboard-home-repository", () => ({ getDashboardHomeResponseMetrics: mocks.getDashboardHomeResponseMetrics }));
vi.mock("@/lib/repositories/growth-email-nudges-repository", () => ({
  findGrowthEmailNudgeRow: mocks.findGrowthEmailNudgeRow,
  upsertGrowthEmailNudgeRow: mocks.upsertGrowthEmailNudgeRow
}));
vi.mock("@/lib/repositories/settings-repository", () => ({ findNotificationSettingsRow: mocks.findNotificationSettingsRow }));
vi.mock("@/lib/site-installation", () => ({ isSiteWidgetInstalled: mocks.isSiteWidgetInstalled }));

import {
  maybeSendAnalyticsExpansionEmail,
  maybeSendSiteLifecycleEmails,
  maybeSendTeamExpansionEmail
} from "@/lib/growth-outreach";

describe("growth outreach more", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => "mockReset" in mock && mock.mockReset());
    mocks.isGrowthNudgeDue.mockReturnValue(true);
  });

  it("skips lifecycle emails when the site or delivery settings are missing", async () => {
    mocks.querySites.mockResolvedValueOnce({ rows: [] });
    await maybeSendSiteLifecycleEmails("site_1");

    mocks.querySites.mockResolvedValueOnce({ rows: [{ id: "site_1", userId: "user_1", name: "Acme" }] });
    mocks.findAuthUserById.mockResolvedValueOnce({ created_at: "2026-03-28T00:00:00.000Z" });
    mocks.findNotificationSettingsRow.mockResolvedValueOnce({ email: "owner@example.com", notification_email: null, email_notifications: false });
    await maybeSendSiteLifecycleEmails("site_1");

    expect(mocks.sendActivationReminderEmail).not.toHaveBeenCalled();
    expect(mocks.sendHealthReminderEmail).not.toHaveBeenCalled();
  });

  it("sends health and analytics reminders when the rules match", async () => {
    mocks.querySites.mockResolvedValueOnce({ rows: [{ id: "site_1", userId: "user_1", name: "Acme", widgetLastSeenUrl: "/pricing" }] });
    mocks.findAuthUserById.mockResolvedValueOnce({ created_at: "2026-03-28T00:00:00.000Z" });
    mocks.findNotificationSettingsRow
      .mockResolvedValueOnce({ email: "owner@example.com", notification_email: "team@example.com", email_notifications: true })
      .mockResolvedValueOnce({ email: "owner@example.com", notification_email: null, email_notifications: true });
    mocks.getDashboardGrowthSnapshot.mockResolvedValueOnce({
      total_conversations: "7",
      first_conversation_at: "2026-03-28T08:00:00.000Z",
      conversations_last_7_days: "1",
      conversations_previous_7_days: "6",
      login_sessions_last_7_days: "0",
      last_login_at: "2026-03-20T08:00:00.000Z"
    });
    mocks.getDashboardHomeResponseMetrics.mockResolvedValueOnce({ current_avg_seconds: "121" });
    mocks.buildActivation.mockReturnValue({ status: "healthy" });
    mocks.getActivationReminderKey.mockReturnValue(null);
    mocks.buildHealth.mockReturnValue({ status: "at-risk", score: 38 });
    mocks.shouldSendHealthReminder.mockReturnValue(true);
    mocks.getDashboardBillingSummary.mockResolvedValueOnce({ planKey: "growth", usedSeats: 3, conversationCount: 45 });
    mocks.shouldSendAnalyticsExpansionReminder.mockReturnValue(true);

    await maybeSendSiteLifecycleEmails("site_1");
    await maybeSendAnalyticsExpansionEmail("user_1");

    expect(mocks.sendHealthReminderEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "team@example.com", score: 38 })
    );
    expect(mocks.upsertGrowthEmailNudgeRow).toHaveBeenCalledWith("user_1", "health-at-risk");
    expect(mocks.sendExpansionReminderEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "owner@example.com", mode: "analytics" })
    );
  });

  it("respects cooldown checks and logs expansion failures", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.findNotificationSettingsRow
      .mockResolvedValueOnce({ email: "owner@example.com", notification_email: null, email_notifications: true })
      .mockResolvedValueOnce({ email: "owner@example.com", notification_email: null, email_notifications: true });
    mocks.getDashboardBillingSummary
      .mockResolvedValueOnce({ planKey: "starter", usedSeats: 2, conversationCount: 12 })
      .mockResolvedValueOnce({ planKey: "growth", usedSeats: 3, conversationCount: 45 });
    mocks.shouldSendTeamExpansionReminder.mockReturnValue(true);
    mocks.shouldSendAnalyticsExpansionReminder.mockReturnValue(true);
    mocks.isGrowthNudgeDue.mockReturnValueOnce(false).mockReturnValueOnce(true);
    mocks.sendExpansionReminderEmail.mockRejectedValueOnce(new Error("send failed"));

    await maybeSendTeamExpansionEmail("user_1");
    await maybeSendAnalyticsExpansionEmail("user_1");

    expect(mocks.sendExpansionReminderEmail).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith("growth analytics expansion email failed", expect.any(Error));
    errorSpy.mockRestore();
  });
});

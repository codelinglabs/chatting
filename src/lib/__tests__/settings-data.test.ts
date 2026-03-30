const mocks = vi.hoisted(() => ({
  changeUserPassword: vi.fn(),
  findDashboardSettingsRow: vi.fn(),
  findEmailTemplateSettingsRow: vi.fn(),
  findNotificationSettingsRow: vi.fn(),
  findUserIdByEmailExcludingUser: vi.fn(),
  getDashboardBillingSummary: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  listActiveTeamMemberRows: vi.fn(),
  listPendingTeamInviteRows: vi.fn(),
  listSitesForUser: vi.fn(),
  parseDashboardEmailTemplates: vi.fn(),
  seatCountFromActiveMemberships: vi.fn(),
  serializeDashboardEmailTemplates: vi.fn(),
  updateSettingsUserEmail: vi.fn(),
  upsertUserSettingsRecord: vi.fn()
}));

vi.mock("@/lib/auth", () => ({ changeUserPassword: mocks.changeUserPassword }));
vi.mock("@/lib/billing-seats", () => ({ seatCountFromActiveMemberships: mocks.seatCountFromActiveMemberships }));
vi.mock("@/lib/chatly-transactional-email-senders", () => ({ sendTeamInvitationEmail: vi.fn() }));
vi.mock("@/lib/data/billing", () => ({ getDashboardBillingSummary: mocks.getDashboardBillingSummary }));
vi.mock("@/lib/email-templates", () => ({
  parseDashboardEmailTemplates: mocks.parseDashboardEmailTemplates,
  serializeDashboardEmailTemplates: mocks.serializeDashboardEmailTemplates
}));
vi.mock("@/lib/env", () => ({ getPublicAppUrl: () => "https://app.example" }));
vi.mock("@/lib/growth-outreach", () => ({ maybeSendTeamExpansionEmail: vi.fn() }));
vi.mock("@/lib/repositories/settings-repository", () => ({
  findDashboardSettingsRow: mocks.findDashboardSettingsRow,
  findEmailTemplateSettingsRow: mocks.findEmailTemplateSettingsRow,
  findNotificationSettingsRow: mocks.findNotificationSettingsRow,
  findUserIdByEmailExcludingUser: mocks.findUserIdByEmailExcludingUser,
  insertTeamInviteRecord: vi.fn(),
  listPendingTeamInviteRows: mocks.listPendingTeamInviteRows,
  revokePendingTeamInvite: vi.fn(),
  touchPendingTeamInvite: vi.fn(),
  updatePendingTeamInviteRole: vi.fn(),
  updateSettingsUserEmail: mocks.updateSettingsUserEmail,
  upsertUserSettingsRecord: mocks.upsertUserSettingsRecord
}));
vi.mock("@/lib/repositories/workspace-repository", () => ({
  countActiveTeamMembershipRows: vi.fn(),
  listActiveTeamMemberRows: mocks.listActiveTeamMemberRows
}));
vi.mock("@/lib/workspace-access", () => ({ getWorkspaceAccess: mocks.getWorkspaceAccess }));
vi.mock("@/lib/data/sites", () => ({ listSitesForUser: mocks.listSitesForUser }));

import {
  getDashboardEmailTemplateSettings,
  getDashboardNotificationDeliverySettings,
  getDashboardNotificationSettings,
  getDashboardSettingsData,
  updateDashboardSettings
} from "@/lib/data/settings";

const billing = {
  planKey: "starter",
  planName: "Starter",
  priceLabel: "$0/month"
} as never;

function settingsRow(overrides: Record<string, unknown> = {}) {
  return {
    user_id: "user_1",
    email: "tina@usechatting.com",
    created_at: "2026-03-29T00:00:00.000Z",
    first_name: "Tina",
    last_name: "Bauer",
    job_title: "Founder",
    avatar_data_url: null,
    notification_email: null,
    reply_to_email: null,
    email_templates_json: "[]",
    browser_notifications: true,
    sound_alerts: true,
    email_notifications: true,
    new_visitor_alerts: false,
    high_intent_alerts: true,
    email_signature: "Best,\nChatting",
    last_seen_at: "2026-03-29T11:58:30.000Z",
    ...overrides
  };
}

describe("settings data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(new Date("2026-03-29T12:00:00.000Z").getTime());
    mocks.findNotificationSettingsRow.mockResolvedValue(settingsRow());
    mocks.findEmailTemplateSettingsRow.mockResolvedValue(settingsRow());
    mocks.findDashboardSettingsRow.mockResolvedValue(settingsRow());
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1" });
    mocks.listPendingTeamInviteRows.mockResolvedValue([]);
    mocks.listActiveTeamMemberRows.mockResolvedValue([
      { user_id: "user_2", email: "alex@usechatting.com", first_name: "Alex", last_name: "Rivera", role: "admin", last_seen_at: "2026-03-29T11:40:00.000Z", avatar_data_url: null }
    ]);
    mocks.seatCountFromActiveMemberships.mockReturnValue(2);
    mocks.getDashboardBillingSummary.mockResolvedValue(billing);
    mocks.parseDashboardEmailTemplates.mockReturnValue([{ id: "welcome" }]);
    mocks.serializeDashboardEmailTemplates.mockReturnValue('[{"id":"welcome"}]');
    mocks.findUserIdByEmailExcludingUser.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns notification settings with sensible email fallback", async () => {
    await expect(getDashboardNotificationSettings("user_1")).resolves.toEqual({
      browserNotifications: true,
      soundAlerts: true,
      emailNotifications: true,
      newVisitorAlerts: false,
      highIntentAlerts: true
    });
    await expect(getDashboardNotificationDeliverySettings("user_1")).resolves.toEqual({
      browserNotifications: true,
      soundAlerts: true,
      emailNotifications: true,
      newVisitorAlerts: false,
      highIntentAlerts: true,
      notificationEmail: "tina@usechatting.com"
    });
  });

  it("returns email template settings with parsed templates", async () => {
    const settings = await getDashboardEmailTemplateSettings("user_1");

    expect(settings.profile).toMatchObject({
      firstName: "Tina",
      lastName: "Bauer",
      email: "tina@usechatting.com"
    });
    expect(settings.email).toMatchObject({
      notificationEmail: "tina@usechatting.com",
      replyToEmail: "tina@usechatting.com",
      templates: [{ id: "welcome" }],
      emailSignature: "Best,\nChatting"
    });
  });

  it("builds the combined dashboard settings payload for a workspace member", async () => {
    mocks.getWorkspaceAccess.mockResolvedValueOnce({ ownerUserId: "owner_1" });
    mocks.findDashboardSettingsRow
      .mockResolvedValueOnce(settingsRow())
      .mockResolvedValueOnce(settingsRow({ user_id: "owner_1", email: "owner@usechatting.com", first_name: "Owner", last_name: "Person" }));

    const data = await getDashboardSettingsData("user_1");

    expect(mocks.getDashboardBillingSummary).toHaveBeenCalledWith("owner_1", 2);
    expect(data.profile.email).toBe("tina@usechatting.com");
    expect(data.teamMembers).toEqual([
      expect.objectContaining({ id: "owner_1", role: "owner", status: "online", isCurrentUser: false }),
      expect.objectContaining({ id: "user_2", role: "admin", status: "offline", isCurrentUser: false })
    ]);
    expect(data.billing).toBe(billing);
  });

  it("updates the user settings record and changes the password when requested", async () => {
    mocks.findDashboardSettingsRow.mockResolvedValue(settingsRow({ email: "new@usechatting.com" }));

    const result = await updateDashboardSettings("user_1", {
      profile: { firstName: "Tina", lastName: "Bauer", email: "new@usechatting.com", jobTitle: "Founder", avatarDataUrl: null },
      notifications: { browserNotifications: true, soundAlerts: false, emailNotifications: true, newVisitorAlerts: true, highIntentAlerts: true },
      email: { notificationEmail: "team@usechatting.com", replyToEmail: "reply@usechatting.com", templates: [{ id: "welcome" }] as never, emailSignature: "Best,\nTina" },
      password: { currentPassword: "old", newPassword: "new-pass", confirmPassword: "new-pass" }
    });

    expect(mocks.updateSettingsUserEmail).toHaveBeenCalledWith("user_1", "new@usechatting.com");
    expect(mocks.upsertUserSettingsRecord).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user_1",
      notificationEmail: "team@usechatting.com",
      replyToEmail: "reply@usechatting.com",
      emailTemplatesJson: '[{"id":"welcome"}]'
    }));
    expect(mocks.changeUserPassword).toHaveBeenCalledWith("user_1", "old", "new-pass");
    expect(result.profile.email).toBe("new@usechatting.com");
  });
});

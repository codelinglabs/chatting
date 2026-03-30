const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  insertTeamInviteRecord,
  revokePendingTeamInvite,
  touchPendingTeamInvite,
  updatePendingTeamInviteRole,
  updateSettingsUserEmail,
  upsertUserSettingsRecord
} from "@/lib/repositories/settings-repository";

describe("settings repository writes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates user email and upserts the full settings record", async () => {
    await updateSettingsUserEmail("user_1", "alex@example.com");
    await upsertUserSettingsRecord({
      userId: "user_1",
      firstName: "Alex",
      lastName: "Stone",
      jobTitle: "Founder",
      avatarDataUrl: "data:image/png;base64,abc",
      notificationEmail: "team@example.com",
      replyToEmail: "reply@example.com",
      emailTemplatesJson: "{\"reply\":\"Hi\"}",
      browserNotifications: true,
      soundAlerts: true,
      emailNotifications: false,
      newVisitorAlerts: true,
      highIntentAlerts: true,
      emailSignature: "Best,\nAlex"
    });

    expect(mocks.query).toHaveBeenCalledTimes(2);
    expect(mocks.query.mock.calls[0]?.[0]).toContain("UPDATE users");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual(["user_1", "alex@example.com"]);
    expect(mocks.query.mock.calls[1]?.[0]).toContain("ON CONFLICT (user_id) DO UPDATE SET");
    expect(mocks.query.mock.calls[1]?.[1]).toEqual([
      "user_1",
      "Alex",
      "Stone",
      "Founder",
      "data:image/png;base64,abc",
      "team@example.com",
      "reply@example.com",
      "{\"reply\":\"Hi\"}",
      true,
      true,
      false,
      true,
      true,
      "Best,\nAlex"
    ]);
  });

  it("creates, touches, updates, and revokes pending invites", async () => {
    await insertTeamInviteRecord({
      inviteId: "invite_1",
      ownerUserId: "owner_1",
      email: "sam@example.com",
      role: "member",
      message: "Join us"
    });
    await touchPendingTeamInvite("owner_1", "invite_1");
    await updatePendingTeamInviteRole("owner_1", "invite_1", "admin");
    await revokePendingTeamInvite("owner_1", "invite_1");

    expect(mocks.query).toHaveBeenCalledTimes(4);
    expect(mocks.query.mock.calls[0]?.[0]).toContain("INSERT INTO team_invites");
    expect(mocks.query.mock.calls[0]?.[1]).toEqual([
      "invite_1",
      "owner_1",
      "sam@example.com",
      "member",
      "Join us"
    ]);
    expect(mocks.query.mock.calls[1]?.[0]).toContain("SET updated_at = NOW()");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("SET role = $3, updated_at = NOW()");
    expect(mocks.query.mock.calls[2]?.[1]).toEqual(["invite_1", "owner_1", "admin"]);
    expect(mocks.query.mock.calls[3]?.[0]).toContain("SET status = 'revoked'");
  });
});

const mocks = vi.hoisted(() => ({
  query: vi.fn()
}));

vi.mock("@/lib/db", () => ({
  query: mocks.query
}));

import {
  clearSiteTeamPhotoRecord,
  findCreatedSiteRow,
  findSitePresenceRow,
  findSiteTeamPhotoRecord,
  insertSiteRecord,
  markSiteWidgetInstallVerifiedRecord,
  touchSiteWidgetSeenRecord,
  updateSiteOnboardingSetupRecord,
  updateSiteTeamPhotoRecord,
  updateSiteWidgetSettingsRecord,
  updateSiteWidgetTitleRecord
} from "@/lib/repositories/sites-repository";

describe("sites repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts sites and returns created rows with null fallback", async () => {
    mocks.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rows: [{ id: "site_1", conversation_count: "0" }] })
      .mockResolvedValueOnce({ rows: [] });

    await insertSiteRecord({
      siteId: "site_1",
      userId: "user_1",
      name: "Marketing",
      domain: "usechatting.com",
      brandColor: "#2563EB",
      widgetTitle: "Talk with us",
      greetingText: "How can we help?"
    });
    await expect(findCreatedSiteRow("site_1")).resolves.toMatchObject({
      id: "site_1",
      conversation_count: "0"
    });
    await expect(findCreatedSiteRow("site_2")).resolves.toBeNull();

    expect(mocks.query.mock.calls[0]?.[0]).toContain("INSERT INTO sites");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("'0'::text AS conversation_count");
  });

  it("updates widget titles, onboarding setup, and full widget settings", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ widget_title: "Need help?" }] })
      .mockResolvedValueOnce({ rows: [{ id: "site_1" }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: "site_1" }] });

    await expect(updateSiteWidgetTitleRecord("site_1", "user_1", "Need help?")).resolves.toBe("Need help?");
    await expect(
      updateSiteOnboardingSetupRecord({
        siteId: "site_1",
        userId: "user_1",
        name: "Docs",
        domain: "docs.usechatting.com",
        widgetTitle: "Questions?"
      })
    ).resolves.toBe(true);
    await expect(
      updateSiteWidgetSettingsRecord({
        siteId: "site_1",
        userId: "user_1",
        domain: null,
        brandColor: "#1D4ED8",
        widgetTitle: "Questions?",
        greetingText: "We reply fast",
        launcherPosition: "right",
        avatarStyle: "team-photo",
        showOnlineStatus: true,
        requireEmailOffline: false,
        soundNotifications: true,
        autoOpenPaths: ["/pricing"],
        responseTimeMode: "minutes",
        operatingHoursEnabled: true,
        operatingHoursTimezone: "Europe/London",
        operatingHoursJson: "{\"monday\":[]}"
      })
    ).resolves.toBe(false);
    await expect(
      updateSiteWidgetSettingsRecord({
        siteId: "site_1",
        userId: "user_1",
        domain: "usechatting.com",
        brandColor: "#2563EB",
        widgetTitle: "Talk with us",
        greetingText: "How can we help?",
        launcherPosition: "left",
        avatarStyle: "logo",
        showOnlineStatus: false,
        requireEmailOffline: true,
        soundNotifications: false,
        autoOpenPaths: [],
        responseTimeMode: "instant",
        operatingHoursEnabled: false,
        operatingHoursTimezone: "UTC",
        operatingHoursJson: "{}"
      })
    ).resolves.toBe(true);

    expect(mocks.query.mock.calls[0]?.[0]).toContain("RETURNING widget_title");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("SET\n        name = $3");
    expect(mocks.query.mock.calls[3]?.[0]).toContain("operating_hours_json = $16");
  });

  it("reads and mutates site team photo records", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ id: "site_1", team_photo_url: "https://cdn/photo.png", team_photo_key: "photo-key" }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: "site_1" }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: "site_1" }] });

    await expect(findSiteTeamPhotoRecord("site_1", "user_1")).resolves.toMatchObject({
      team_photo_key: "photo-key"
    });
    await expect(findSiteTeamPhotoRecord("site_2", "user_1")).resolves.toBeNull();
    await expect(updateSiteTeamPhotoRecord("site_1", "user_1", "https://cdn/photo.png", "photo-key")).resolves.toBe(true);
    await expect(clearSiteTeamPhotoRecord("site_1", "user_2")).resolves.toBe(false);
    await expect(clearSiteTeamPhotoRecord("site_1", "user_1")).resolves.toBe(true);

    expect(mocks.query.mock.calls[2]?.[0]).toContain("team_photo_key = $4");
    expect(mocks.query.mock.calls[3]?.[0]).toContain("team_photo_url = NULL");
  });

  it("marks widget verification, reads presence, and tracks widget sighting", async () => {
    mocks.query
      .mockResolvedValueOnce({ rows: [{ id: "site_1" }] })
      .mockResolvedValueOnce({ rows: [{ last_seen_at: "2026-03-29T10:00:00.000Z" }] })
      .mockResolvedValueOnce(undefined);

    await expect(markSiteWidgetInstallVerifiedRecord("site_1", "user_1", "https://usechatting.com")).resolves.toBe(true);
    await expect(findSitePresenceRow("site_1")).resolves.toEqual({
      last_seen_at: "2026-03-29T10:00:00.000Z"
    });
    await touchSiteWidgetSeenRecord("site_1", "/pricing");

    expect(mocks.query.mock.calls[0]?.[0]).toContain("widget_install_verified_at = NOW()");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("LEFT JOIN user_presence up");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("widget_last_seen_url = COALESCE($2, widget_last_seen_url)");
    expect(mocks.query.mock.calls[2]?.[1]).toEqual(["site_1", "/pricing"]);
  });
});

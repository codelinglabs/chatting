const mocks = vi.hoisted(() => ({
  clearSiteTeamPhotoRecord: vi.fn(),
  deleteR2Object: vi.fn(),
  findCreatedSiteRow: vi.fn(),
  findSitePresenceRow: vi.fn(),
  findSiteTeamPhotoRecord: vi.fn(),
  getWorkspaceAccess: vi.fn(),
  insertSiteRecord: vi.fn(),
  mapSite: vi.fn(),
  querySites: vi.fn(),
  recordVisitorPresence: vi.fn(),
  updateSiteOnboardingSetupRecord: vi.fn(),
  updateSiteWidgetTitleRecord: vi.fn()
}));

vi.mock("node:crypto", () => ({ randomUUID: () => "site_123" }));
vi.mock("@/lib/repositories/sites-repository", () => ({
  clearSiteTeamPhotoRecord: mocks.clearSiteTeamPhotoRecord,
  findCreatedSiteRow: mocks.findCreatedSiteRow,
  findSitePresenceRow: mocks.findSitePresenceRow,
  findSiteTeamPhotoRecord: mocks.findSiteTeamPhotoRecord,
  insertSiteRecord: mocks.insertSiteRecord,
  markSiteWidgetInstallVerifiedRecord: vi.fn(),
  touchSiteWidgetSeenRecord: vi.fn(),
  updateSiteOnboardingSetupRecord: mocks.updateSiteOnboardingSetupRecord,
  updateSiteTeamPhotoRecord: vi.fn(),
  updateSiteWidgetSettingsRecord: vi.fn(),
  updateSiteWidgetTitleRecord: mocks.updateSiteWidgetTitleRecord
}));
vi.mock("@/lib/r2", () => ({ deleteR2Object: mocks.deleteR2Object, uploadSiteTeamPhotoToR2: vi.fn() }));
vi.mock("@/lib/workspace-access", () => ({ getWorkspaceAccess: mocks.getWorkspaceAccess }));
vi.mock("@/lib/data/shared", () => ({ mapSite: mocks.mapSite, querySites: mocks.querySites }));
vi.mock("@/lib/data/visitors", () => ({ recordVisitorPresence: mocks.recordVisitorPresence }));

import {
  createSiteForUser,
  getSiteByPublicId,
  getSitePresenceStatus,
  listSitesForUser,
  recordSiteWidgetSeen,
  removeSiteTeamPhoto,
  updateSiteOnboardingSetup,
  updateSiteWidgetTitle
} from "@/lib/data/sites";

describe("sites data additional coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(new Date("2026-03-29T12:00:00.000Z").getTime());
    mocks.getWorkspaceAccess.mockResolvedValue({ ownerUserId: "owner_1" });
    mocks.mapSite.mockImplementation((row: Record<string, unknown>) => row);
    mocks.querySites.mockResolvedValue({ rows: [{ id: "site_123", userId: "owner_1", widgetTitle: "Talk to us" }] });
    mocks.deleteR2Object.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a site with defaults and returns the mapped record", async () => {
    mocks.findCreatedSiteRow.mockResolvedValue({ id: "site_123", user_id: "user_1", widget_title: "Talk to us" });

    const site = await createSiteForUser("user_1", { name: "Docs", domain: "https://docs.example.com" });

    expect(mocks.insertSiteRecord).toHaveBeenCalledWith(
      expect.objectContaining({ siteId: "site_123", userId: "user_1", name: "Docs" })
    );
    expect(site).toEqual({ id: "site_123", user_id: "user_1", widget_title: "Talk to us" });
  });

  it("lists sites for the workspace owner and updates the widget title through owner access", async () => {
    await expect(listSitesForUser("user_1")).resolves.toEqual([{ id: "site_123", userId: "owner_1", widgetTitle: "Talk to us" }]);
    await updateSiteWidgetTitle("site_123", "New title", "user_1");

    expect(mocks.querySites).toHaveBeenCalledWith("s.user_id = $1", ["owner_1"], "ORDER BY s.created_at ASC");
    expect(mocks.updateSiteWidgetTitleRecord).toHaveBeenCalledWith("site_123", "owner_1", "New title");
  });

  it("validates onboarding setup inputs and reloads the updated site", async () => {
    await expect(updateSiteOnboardingSetup("site_123", "user_1", { name: " ", domain: "https://example.com" })).rejects.toThrow("MISSING_SITE_NAME");
    await expect(updateSiteOnboardingSetup("site_123", "user_1", { name: "Docs", domain: " " })).rejects.toThrow("MISSING_DOMAIN");

    mocks.updateSiteOnboardingSetupRecord.mockResolvedValueOnce({ id: "site_123" });
    await expect(updateSiteOnboardingSetup("site_123", "user_1", { name: "Docs", domain: "example.com" })).resolves.toEqual({
      id: "site_123",
      userId: "owner_1",
      widgetTitle: "Talk to us"
    });
  });

  it("reads public sites, reports presence, skips anonymous presence recording, and removes team photos", async () => {
    mocks.findSitePresenceRow
      .mockResolvedValueOnce({ last_seen_at: "2026-03-29T11:58:00.000Z" })
      .mockResolvedValueOnce({ last_seen_at: "2026-03-29T10:00:00.000Z" })
      .mockResolvedValueOnce(null);
    mocks.findSiteTeamPhotoRecord.mockResolvedValueOnce({ team_photo_key: "photo-key" });
    mocks.clearSiteTeamPhotoRecord.mockResolvedValueOnce({ id: "site_123" });

    await expect(getSiteByPublicId("site_123")).resolves.toEqual({ id: "site_123", userId: "owner_1", widgetTitle: "Talk to us" });
    await expect(getSitePresenceStatus("site_123")).resolves.toEqual({ online: true, lastSeenAt: "2026-03-29T11:58:00.000Z" });
    await expect(getSitePresenceStatus("site_123")).resolves.toEqual({ online: false, lastSeenAt: "2026-03-29T10:00:00.000Z" });
    await expect(getSitePresenceStatus("site_123")).resolves.toBeNull();
    await recordSiteWidgetSeen("site_123", "https://example.com/pricing");
    await expect(removeSiteTeamPhoto("site_123", "user_1")).resolves.toEqual({ id: "site_123", userId: "owner_1", widgetTitle: "Talk to us" });

    expect(mocks.recordVisitorPresence).not.toHaveBeenCalled();
    expect(mocks.deleteR2Object).toHaveBeenCalledWith("photo-key");
  });
});

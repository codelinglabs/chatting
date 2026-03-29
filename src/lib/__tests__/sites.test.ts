const mocks = vi.hoisted(() => ({
  touchSiteWidgetSeenRecord: vi.fn(),
  maybeSendSiteLifecycleEmails: vi.fn()
}));

vi.mock("@/lib/billing-plans", () => ({
  getBillingPlanFeatures: vi.fn(),
  normalizeBillingPlanKey: vi.fn(),
  shouldShowWidgetBranding: vi.fn()
}));
vi.mock("@/lib/repositories/billing-repository", () => ({ findBillingAccountRow: vi.fn() }));
vi.mock("@/lib/repositories/sites-repository", () => ({
  clearSiteTeamPhotoRecord: vi.fn(),
  findCreatedSiteRow: vi.fn(),
  findSitePresenceRow: vi.fn(),
  findSiteTeamPhotoRecord: vi.fn(),
  insertSiteRecord: vi.fn(),
  markSiteWidgetInstallVerifiedRecord: vi.fn(),
  touchSiteWidgetSeenRecord: mocks.touchSiteWidgetSeenRecord,
  updateSiteOnboardingSetupRecord: vi.fn(),
  updateSiteTeamPhotoRecord: vi.fn(),
  updateSiteWidgetSettingsRecord: vi.fn(),
  updateSiteWidgetTitleRecord: vi.fn()
}));
vi.mock("@/lib/growth-outreach", () => ({
  maybeSendSiteLifecycleEmails: mocks.maybeSendSiteLifecycleEmails
}));
vi.mock("@/lib/r2", () => ({ deleteR2Object: vi.fn(), uploadSiteTeamPhotoToR2: vi.fn() }));
vi.mock("@/lib/env", () => ({ getPublicAppUrl: vi.fn() }));
vi.mock("@/lib/widget-branding-attribution", () => ({ getWidgetBrandingAttributionUrl: vi.fn() }));
vi.mock("@/lib/utils", () => ({
  optionalText: (value: string | null | undefined) => {
    const normalized = typeof value === "string" ? value.trim() : "";
    return normalized || null;
  }
}));
vi.mock("@/lib/widget-settings", () => ({
  DEFAULT_BRAND_COLOR: "#2563EB",
  DEFAULT_GREETING_TEXT: "Hello there",
  DEFAULT_OPERATING_TIMEZONE: "UTC",
  DEFAULT_WIDGET_TITLE: "Chat",
  normalizeAutoOpenPaths: vi.fn(),
  normalizeAvatarStyle: vi.fn(),
  normalizeBrandColor: vi.fn(),
  normalizeLauncherPosition: vi.fn(),
  normalizeSiteDomain: vi.fn(),
  normalizeResponseTimeMode: vi.fn(),
  serializeOperatingHours: vi.fn()
}));
vi.mock("@/lib/data/shared", () => ({ mapSite: vi.fn(), querySites: vi.fn() }));

import { recordSiteWidgetSeen } from "@/lib/data/sites";

describe("site activity recording", () => {
  beforeEach(() => {
    mocks.touchSiteWidgetSeenRecord.mockReset();
    mocks.maybeSendSiteLifecycleEmails.mockReset();
  });

  it("records widget activity without triggering lifecycle email checks", async () => {
    await recordSiteWidgetSeen("site_123", "https://example.com/pricing");

    expect(mocks.touchSiteWidgetSeenRecord).toHaveBeenCalledWith("site_123", "https://example.com/pricing");
    expect(mocks.maybeSendSiteLifecycleEmails).not.toHaveBeenCalled();
  });
});

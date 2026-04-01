const mocks = vi.hoisted(() => ({ query: vi.fn() }));

vi.mock("@/lib/db", () => ({ query: mocks.query }));

import {
  completeUserOwnerOnboarding,
  findUserOwnerOnboardingState,
  updateUserOwnerOnboardingIntent,
  updateUserOwnerOnboardingStage
} from "@/lib/repositories/auth-owner-onboarding-repository";

describe("auth owner onboarding repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads owner onboarding state and updates each resumable step", async () => {
    mocks.query
      .mockResolvedValueOnce({
        rows: [{
          owner_onboarding_stage: "account_created",
          owner_onboarding_site_domain: "https://acme.com",
          owner_onboarding_referral_code: "AFF-123"
        }]
      })
      .mockResolvedValueOnce({
        rows: [{
          owner_onboarding_stage: "site_created",
          owner_onboarding_site_domain: "https://acme.com",
          owner_onboarding_referral_code: "AFF-123"
        }]
      })
      .mockResolvedValueOnce({
        rows: [{
          owner_onboarding_stage: "site_created",
          owner_onboarding_site_domain: "https://acme.com",
          owner_onboarding_referral_code: "AFF-123"
        }]
      })
      .mockResolvedValueOnce({
        rows: [{
          owner_onboarding_stage: "complete",
          owner_onboarding_site_domain: null,
          owner_onboarding_referral_code: null
        }]
      });

    await expect(findUserOwnerOnboardingState("user_1")).resolves.toEqual({
      owner_onboarding_stage: "account_created",
      owner_onboarding_site_domain: "https://acme.com",
      owner_onboarding_referral_code: "AFF-123"
    });
    await expect(updateUserOwnerOnboardingStage("user_1", "site_created")).resolves.toMatchObject({
      owner_onboarding_stage: "site_created"
    });
    await expect(
      updateUserOwnerOnboardingIntent({
        userId: "user_1",
        siteDomain: "https://acme.com",
        referralCode: "AFF-123"
      })
    ).resolves.toMatchObject({
      owner_onboarding_referral_code: "AFF-123"
    });
    await expect(completeUserOwnerOnboarding("user_1")).resolves.toEqual({
      owner_onboarding_stage: "complete",
      owner_onboarding_site_domain: null,
      owner_onboarding_referral_code: null
    });

    expect(mocks.query.mock.calls[0]?.[0]).toContain("owner_onboarding_stage");
    expect(mocks.query.mock.calls[1]?.[0]).toContain("SET owner_onboarding_stage = $2");
    expect(mocks.query.mock.calls[2]?.[0]).toContain("owner_onboarding_site_domain = $2");
    expect(mocks.query.mock.calls[3]?.[0]).toContain("owner_onboarding_stage = 'complete'");
  });
});

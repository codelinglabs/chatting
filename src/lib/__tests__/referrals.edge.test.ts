const referralMocks = vi.hoisted(() => ({
  findReferralAttributionByReferredUserId: vi.fn(),
  findReferralProgramByCode: vi.fn(),
  insertReferralAttribution: vi.fn(),
  insertReferralProgram: vi.fn(),
  listReferralAttributionsByOwnerUserId: vi.fn(),
  listReferralProgramsByOwnerUserId: vi.fn(),
  listReferralRewardsByBeneficiaryUserId: vi.fn(),
  listReferralWorkspaceNames: vi.fn(),
  upsertReferralReward: vi.fn()
}));

vi.mock("@/lib/repositories/referral-repository", () => referralMocks);
vi.mock("@/lib/referral-workspace-names", () => ({ listReferralWorkspaceNames: referralMocks.listReferralWorkspaceNames }));

describe("referrals edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    referralMocks.listReferralWorkspaceNames.mockResolvedValue(new Map());
  });

  it("creates missing default programs and retries duplicate referral codes", async () => {
    referralMocks.listReferralProgramsByOwnerUserId
      .mockResolvedValueOnce([
        {
          id: "program_customer",
          owner_user_id: "user_1",
          code: "REF-123",
          program_type: "customer"
        }
      ])
      .mockResolvedValueOnce([
        { id: "program_customer", owner_user_id: "user_1", code: "REF-123", program_type: "customer" },
        { id: "program_affiliate", owner_user_id: "user_1", code: "AFF-123", program_type: "affiliate" },
        { id: "program_mutual", owner_user_id: "user_1", code: "GIVE-123", program_type: "mutual" }
      ]);
    referralMocks.insertReferralProgram
      .mockRejectedValueOnce(new Error("referral_programs_code_key"))
      .mockResolvedValue(undefined);

    const module = await import("@/lib/referrals");
    await expect(module.ensureDefaultReferralPrograms("user_1")).resolves.toHaveLength(3);
    expect(referralMocks.insertReferralProgram).toHaveBeenCalledTimes(3);
  });

  it("validates signup referral codes across blank, inactive, and active paths", async () => {
    const module = await import("@/lib/referrals");

    await expect(module.validateReferralCodeForSignup("   ")).resolves.toBeNull();

    referralMocks.findReferralProgramByCode.mockResolvedValueOnce(null);
    await expect(module.validateReferralCodeForSignup("BAD")).rejects.toThrow("INVALID_REFERRAL_CODE");

    referralMocks.findReferralProgramByCode.mockResolvedValueOnce({ id: "program_1", is_active: false });
    await expect(module.validateReferralCodeForSignup("OFF")).rejects.toThrow("INVALID_REFERRAL_CODE");

    referralMocks.findReferralProgramByCode.mockResolvedValueOnce({ id: "program_1", is_active: true });
    await expect(module.validateReferralCodeForSignup("AFF-123")).resolves.toEqual({ id: "program_1", is_active: true });
  });

  it("reuses existing attributions, blocks self-referrals, and creates mutual rewards for both sides", async () => {
    const module = await import("@/lib/referrals");

    referralMocks.findReferralProgramByCode.mockResolvedValueOnce({
      id: "program_1",
      owner_user_id: "user_1",
      code: "AFF-123",
      program_type: "affiliate",
      label: "Affiliate",
      referrer_reward_months: 0,
      referrer_reward_cents: 0,
      referred_reward_cents: 0,
      commission_bps: 2500,
      is_active: true
    });
    await expect(
      module.applyReferralCodeForSignup({ userId: "user_1", email: "owner@example.com", referralCode: "AFF-123" })
    ).rejects.toThrow("SELF_REFERRAL");

    referralMocks.findReferralProgramByCode.mockResolvedValueOnce({
      id: "program_2",
      owner_user_id: "owner_2",
      code: "GIVE-123",
      program_type: "mutual",
      label: "Mutual",
      referrer_reward_months: 0,
      referrer_reward_cents: 1000,
      referred_reward_cents: 1000,
      commission_bps: 0,
      is_active: true
    });
    referralMocks.findReferralAttributionByReferredUserId.mockResolvedValueOnce({
      id: "attr_1",
      owner_user_id: "owner_2",
      program_type: "mutual"
    });

    await expect(
      module.applyReferralCodeForSignup({ userId: "user_3", email: "new@example.com", referralCode: "GIVE-123" })
    ).resolves.toMatchObject({ id: "attr_1" });
    expect(referralMocks.insertReferralAttribution).not.toHaveBeenCalled();
    expect(referralMocks.upsertReferralReward).toHaveBeenCalledTimes(2);
  });
});

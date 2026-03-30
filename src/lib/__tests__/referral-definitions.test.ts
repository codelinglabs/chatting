import {
  commissionFromAmount,
  incentiveLabel,
  normalizeAttributionRows,
  normalizeProgramRows,
  normalizeReferralCode,
  normalizeRewardRows,
  rewardDescription,
  rewardKey
} from "@/lib/referral-definitions";

describe("referral definitions", () => {
  it("formats incentive labels across every program type", () => {
    expect(
      incentiveLabel({
        program_type: "customer",
        referrer_reward_months: 1,
        referrer_reward_cents: 0,
        referred_reward_cents: 0,
        commission_bps: 0
      })
    ).toBe("1 free month");
    expect(
      incentiveLabel({
        program_type: "customer",
        referrer_reward_months: 2,
        referrer_reward_cents: 0,
        referred_reward_cents: 0,
        commission_bps: 0
      })
    ).toBe("2 free months");
    expect(
      incentiveLabel({
        program_type: "affiliate",
        referrer_reward_months: 0,
        referrer_reward_cents: 0,
        referred_reward_cents: 0,
        commission_bps: 2500
      })
    ).toBe("25% recurring commission");
    expect(
      incentiveLabel({
        program_type: "mutual",
        referrer_reward_months: 0,
        referrer_reward_cents: 1000,
        referred_reward_cents: 1000,
        commission_bps: 0
      })
    ).toBe("$10 for you and $10 for them");
  });

  it("builds reward descriptions for each program path", () => {
    const customer = { program_type: "customer", commission_bps: 0 } as const;
    const affiliate = { program_type: "affiliate", commission_bps: 2500 } as const;
    const mutual = { program_type: "mutual", commission_bps: 0 } as const;

    expect(rewardDescription(customer as never, "referrer", false)).toContain("Pending free month");
    expect(rewardDescription(customer as never, "referrer", true)).toContain("Free month earned");
    expect(rewardDescription(affiliate as never, "referrer", false)).toContain("Pending affiliate commission");
    expect(rewardDescription(affiliate as never, "referrer", true)).toContain("Affiliate commission earned");
    expect(rewardDescription(mutual as never, "referrer", false)).toContain("Pending $10 referral credit");
    expect(rewardDescription(mutual as never, "referrer", true)).toContain("Referral credit earned");
    expect(rewardDescription(mutual as never, "referred", false)).toContain("Pending $10 welcome credit");
    expect(rewardDescription(mutual as never, "referred", true)).toContain("Welcome credit earned");
  });

  it("normalizes program, attribution, and reward rows", () => {
    expect(
      normalizeProgramRows([
        {
          id: "program_1",
          owner_user_id: "owner_1",
          code: "REF-1",
          label: "Customer referrals",
          program_type: "customer",
          referrer_reward_months: 1,
          referrer_reward_cents: 0,
          referred_reward_cents: 0,
          commission_bps: 0,
          is_active: true,
          created_at: "2026-03-29T00:00:00.000Z",
          updated_at: "2026-03-29T00:00:00.000Z"
        }
      ])
    ).toEqual([
      expect.objectContaining({
        id: "program_1",
        incentiveLabel: "1 free month",
        shareUrl: expect.stringContaining("REF-1")
      })
    ]);

    expect(
      normalizeAttributionRows(
        [
          {
            id: "attr_1",
            owner_user_id: "owner_1",
            program_id: "program_1",
            program_label: "Affiliate",
            program_type: "affiliate",
            code: "AFF-1",
            referred_email: "alex@example.com",
            referred_user_id: "user_1",
            converted_to_paid_at: "2026-03-29T00:00:00.000Z",
            created_at: "2026-03-28T00:00:00.000Z"
          }
        ] as never,
        new Map([["user_1", "Acme"]])
      )
    ).toEqual([
      expect.objectContaining({ workspaceName: "Acme", status: "converted" })
    ]);

    expect(
      normalizeRewardRows([
        {
          id: "reward_1",
          owner_user_id: "owner_1",
          attribution_id: "attr_1",
          program_label: "Affiliate",
          program_type: "affiliate",
          reward_role: "referrer",
          reward_kind: "commission",
          status: "earned",
          description: "Commission earned",
          reward_months: "0",
          reward_cents: "500",
          commission_bps: "2500",
          source_invoice_id: null,
          source_invoice_amount_cents: null,
          created_at: "2026-03-29T00:00:00.000Z",
          earned_at: "2026-03-30T00:00:00.000Z"
        }
      ] as never)
    ).toEqual([
      expect.objectContaining({ rewardMonths: 0, rewardCents: 500, commissionBps: 2500 })
    ]);
  });

  it("normalizes referral helpers", () => {
    expect(rewardKey("attr_1", "referrer")).toBe("attr_1:referrer");
    expect(commissionFromAmount(1999, 2500)).toBe(500);
    expect(normalizeReferralCode("  ref-1!*  ")).toBe("REF-1");
  });
});

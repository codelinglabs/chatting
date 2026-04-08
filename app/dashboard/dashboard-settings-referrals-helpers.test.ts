import {
  earnedValueLabel,
  earnedValueToneClass,
  formatReferralDate,
  referralProgramBadge,
  referralProgramShortLabel,
  referralRewardToneClass,
  referralShareLinkLabel,
  referralStatusMeta,
  referralWorkspaceLabel
} from "./dashboard-settings-referrals-helpers";

describe("dashboard settings referrals helpers", () => {
  it("derives workspace labels from business and public email domains", () => {
    expect(
      referralWorkspaceLabel({
        workspaceName: null,
        referredEmail: "alex@rocket-labs.io"
      } as never)
    ).toBe("Rocket Labs");
    expect(
      referralWorkspaceLabel({
        workspaceName: null,
        referredEmail: "alex@gmail.com"
      } as never)
    ).toBe("Alex");
    expect(
      referralWorkspaceLabel({
        workspaceName: "Acme Workspace",
        referredEmail: "alex@gmail.com"
      } as never)
    ).toBe("Acme Workspace");
  });

  it("formats referral dates, share links, badges, tones, and statuses", () => {
    expect(formatReferralDate("2026-03-29T00:00:00.000Z")).toBe("Mar 29, 2026");
    expect(referralShareLinkLabel("https://chatting.example/signup?ref=ABC")).toBe("chatting.example/signup?ref=ABC");
    expect(referralProgramShortLabel("customer")).toBe("Customer");
    expect(referralProgramShortLabel("affiliate")).toBe("Affiliate");
    expect(referralProgramShortLabel("mutual")).toBe("Give $10");
    expect(referralRewardToneClass("customer")).toBe("text-blue-600");
    expect(referralRewardToneClass("affiliate")).toBe("text-emerald-600");
    expect(referralRewardToneClass("mutual")).toBe("text-violet-600");
    expect(referralProgramBadge("customer")).toBeNull();
    expect(referralProgramBadge("affiliate")).toEqual({
      label: "Recurring",
      className: "bg-emerald-100 text-emerald-700"
    });
    expect(referralStatusMeta("pending")).toEqual({
      label: "Signed up",
      className: "bg-blue-100 text-blue-700"
    });
    expect(referralStatusMeta("converted")).toEqual({
      label: "Paid",
      className: "bg-emerald-100 text-emerald-700"
    });
  });

  it("formats earned values and tone classes for empty and populated rewards", () => {
    expect(
      earnedValueLabel({
        earnedFreeMonths: 0,
        earnedDiscountCents: 0,
        earnedCommissionCents: 0
      } as never)
    ).toBe("US$0.00");
    expect(
      earnedValueLabel({
        earnedFreeMonths: 2,
        earnedDiscountCents: 1000,
        earnedCommissionCents: 500
      } as never)
    ).toBe("2 free months + US$15.00");
    expect(
      earnedValueToneClass({
        earnedFreeMonths: 0,
        earnedDiscountCents: 0,
        earnedCommissionCents: 0
      } as never)
    ).toBe("text-slate-900");
    expect(
      earnedValueToneClass({
        earnedFreeMonths: 1,
        earnedDiscountCents: 0,
        earnedCommissionCents: 0
      } as never)
    ).toBe("text-emerald-600");
  });
});

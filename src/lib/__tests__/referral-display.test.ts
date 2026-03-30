import {
  commissionRateLabel,
  formatCommission,
  rewardLedgerLabel,
  rewardValueLabel
} from "@/lib/referral-display";

const money = (amountCents: number) => `$${(amountCents / 100).toFixed(2)}`;

describe("referral display helpers", () => {
  it("formats commission labels consistently", () => {
    expect(commissionRateLabel(1250)).toBe("12.5% recurring");
    expect(formatCommission(1250)).toBe("12.5% recurring commission");
  });

  it("formats reward values for free months, commissions, and flat credits", () => {
    expect(rewardValueLabel({ rewardKind: "free_month", rewardMonths: 2, rewardCents: 0, commissionBps: 0 }, money)).toBe("2 free months");
    expect(rewardValueLabel({ rewardKind: "commission", rewardMonths: 0, rewardCents: 0, commissionBps: 1500 }, money)).toBe("15% recurring");
    expect(rewardValueLabel({ rewardKind: "discount_credit", rewardMonths: 0, rewardCents: 2500, commissionBps: 0 }, money)).toBe("$25.00");
  });

  it("formats ledger copy for pending and tracked commission rewards", () => {
    expect(rewardLedgerLabel({
      rewardKind: "commission",
      rewardMonths: 0,
      rewardCents: 0,
      commissionBps: 1000,
      sourceInvoiceAmountCents: null
    }, money)).toContain("once the referred workspace converts");

    expect(rewardLedgerLabel({
      rewardKind: "commission",
      rewardMonths: 0,
      rewardCents: 0,
      commissionBps: 1000,
      sourceInvoiceAmountCents: 9900
    }, money)).toContain("$99.00 paid invoice");
  });
});

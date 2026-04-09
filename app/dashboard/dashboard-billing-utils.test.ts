import { billingHasPaymentIssue, billingLostFeatures, billingPeriodLabel, formatResponseTime, invoiceStatusMeta } from "./dashboard-billing-utils";

describe("dashboard billing utils", () => {
  it("formats billing periods and response times across thresholds", () => {
    expect(billingPeriodLabel(new Date("2026-03-15T00:00:00.000Z"))).toBe("1 Mar 2026 - 31 Mar 2026");
    expect(formatResponseTime(null)).toBe("—");
    expect(formatResponseTime(45)).toBe("45s");
    expect(formatResponseTime(90)).toBe("1m 30s");
    expect(formatResponseTime(900)).toBe("15m");
    expect(formatResponseTime(113820)).toBe("1d 7h");
  });

  it("maps invoice statuses and payment issue states", () => {
    expect(invoiceStatusMeta("paid")).toMatchObject({ label: "Paid" });
    expect(invoiceStatusMeta("failed")).toMatchObject({ label: "Failed" });
    expect(invoiceStatusMeta("refunded")).toMatchObject({ label: "Refunded" });
    expect(invoiceStatusMeta("open")).toMatchObject({ label: "Pending" });
    expect(billingHasPaymentIssue("past_due")).toBe(true);
    expect(billingHasPaymentIssue("unpaid")).toBe(true);
    expect(billingHasPaymentIssue("incomplete")).toBe(true);
    expect(billingHasPaymentIssue("active")).toBe(false);
  });

  it("lists billing feature losses based on the active plan", () => {
    expect(
      billingLostFeatures({
        planKey: "starter",
        features: { proactiveChat: false, removeBranding: false }
      } as never)
    ).toEqual(["Paid-seat access and unlimited conversations"]);
    expect(
      billingLostFeatures({
        planKey: "growth",
        features: { proactiveChat: true, removeBranding: true }
      } as never)
    ).toEqual([
      "Proactive chat on high-intent pages",
      "Visitor tracking",
      "White-label widget and transcript branding removal",
      "Advanced analytics",
      "API access"
    ]);
  });
});

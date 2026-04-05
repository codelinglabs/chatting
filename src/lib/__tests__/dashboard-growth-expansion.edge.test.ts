import { buildExpansion } from "@/lib/data/dashboard-growth-expansion";
import type { DashboardBillingSummary } from "@/lib/data/billing";

function billing(overrides: Partial<DashboardBillingSummary> = {}): DashboardBillingSummary {
  return {
    planKey: "starter",
    planName: "Starter",
    priceLabel: "$0/month",
    usedSeats: 1,
    seatLimit: 3,
    siteCount: 1,
    conversationCount: 0,
    nextBillingDate: null,
    subscriptionStatus: null,
    customerId: null,
    portalAvailable: false,
    checkoutAvailable: false,
    paymentMethod: null,
    invoices: [],
    ...overrides
  } as DashboardBillingSummary;
}

describe("dashboard growth expansion edge cases", () => {
  it("describes quiet starter workspaces without upgrade pressure", () => {
    const expansion = buildExpansion(billing());
    expect(expansion.prompts).toEqual([]);
    expect(expansion.description).toContain("No upgrade pressure yet");
  });

  it("describes growth workspaces as already unlocked", () => {
    const expansion = buildExpansion(billing({ planKey: "growth" }));
    expect(expansion.prompts).toEqual([]);
    expect(expansion.description).toContain("already on Growth");
  });

  it("builds seat prompts with neutral and warning tones", () => {
    const neutral = buildExpansion(billing({ usedSeats: 2, seatLimit: 5 })).prompts.find((item) => item.id === "team");
    const warning = buildExpansion(billing({ usedSeats: 3, seatLimit: 3 })).prompts.find((item) => item.id === "team");

    expect(neutral).toMatchObject({
      tone: "neutral",
      title: "Your inbox is becoming a team sport"
    });
    expect(warning).toMatchObject({
      tone: "warning",
      title: "Starter seats are full"
    });
  });

  it("builds conversation prompts for one remaining slot and for a full cap", () => {
    const almostFull = buildExpansion(billing({ conversationCount: 49 })).prompts.find(
      (item) => item.id === "conversations"
    );
    const full = buildExpansion(billing({ conversationCount: 50 })).prompts.find(
      (item) => item.id === "conversations"
    );

    expect(almostFull).toMatchObject({
      tone: "neutral",
      description: "Only one conversation remains on Starter this month."
    });
    expect(full).toMatchObject({
      tone: "warning",
      title: "The monthly conversation cap is full",
      description: "Upgrade to keep new chats flowing without interruptions."
    });
  });

  it("adds analytics prompts when either team size or conversations grow", () => {
    expect(buildExpansion(billing({ usedSeats: 2 })).prompts.map((item) => item.id)).toContain("analytics");
    expect(buildExpansion(billing({ conversationCount: 39 })).prompts.map((item) => item.id)).not.toContain(
      "analytics"
    );
    expect(buildExpansion(billing({ conversationCount: 40 })).prompts.map((item) => item.id)).toContain("analytics");
  });
});

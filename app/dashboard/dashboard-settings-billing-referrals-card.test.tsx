import { renderToStaticMarkup } from "react-dom/server";
import { DashboardSettingsBillingReferralsCard } from "./dashboard-settings-billing-referrals-card";

function buildReferrals() {
  return {
    programs: [
      {
        id: "program_customer",
        code: "REF-4A02A1",
        label: "Customer referrals",
        programType: "customer" as const,
        incentiveLabel: "1 free month",
        description: "Give one free month when a referred signup becomes a paid workspace.",
        shareUrl: "https://chatly.example/signup?ref=REF-4A02A1"
      },
      {
        id: "program_affiliate",
        code: "AFF-4656DE",
        label: "Affiliate program",
        programType: "affiliate" as const,
        incentiveLabel: "25% recurring commission",
        description: "Earn a recurring 25% commission on paid invoices from referred workspaces.",
        shareUrl: "https://chatly.example/signup?ref=AFF-4656DE"
      },
      {
        id: "program_mutual",
        code: "GIVE-240425",
        label: "Give $10, get $10",
        programType: "mutual" as const,
        incentiveLabel: "$10 for you and $10 for them",
        description: "Unlock a $10 credit for both sides after the referred workspace becomes paid.",
        shareUrl: "https://chatly.example/signup?ref=GIVE-240425"
      }
    ],
    attributedSignups: [
      {
        id: "signup_paid",
        code: "AFF-4656DE",
        referredEmail: "hello@acme.com",
        workspaceName: "Acme Support",
        programLabel: "Affiliate program",
        programType: "affiliate" as const,
        status: "converted" as const,
        createdAt: "2026-03-10T09:00:00.000Z",
        convertedAt: "2026-03-15T09:00:00.000Z"
      },
      {
        id: "signup_pending",
        code: "REF-4A02A1",
        referredEmail: "sarah@gmail.com",
        workspaceName: null,
        programLabel: "Customer referrals",
        programType: "customer" as const,
        status: "pending" as const,
        createdAt: "2026-03-18T09:00:00.000Z",
        convertedAt: null
      }
    ],
    rewards: [],
    pendingRewardCount: 1,
    earnedRewardCount: 1,
    earnedFreeMonths: 0,
    earnedDiscountCents: 0,
    earnedCommissionCents: 1975
  };
}

describe("dashboard settings billing referrals card", () => {
  it("renders the stats, program cards, and referred signup rows", () => {
    const html = renderToStaticMarkup(
      <DashboardSettingsBillingReferralsCard referrals={buildReferrals()} />
    );

    expect(html).toContain("Pending rewards");
    expect(html).toContain("Earned value tracked");
    expect(html).toContain("US$19.75");
    expect(html).toContain("Customer referrals");
    expect(html).toContain("Affiliate program");
    expect(html).toContain("Give $10, get $10");
    expect(html).toContain("chatly.example/signup?ref=REF-4A02A1");
    expect(html).toContain('href="https://chatly.example/signup?ref=REF-4A02A1"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Acme Support");
    expect(html).toContain("hello@acme.com");
    expect(html).toContain("Paid");
    expect(html).toContain("Signed up");
    expect(html).toContain("REF-4A02A1");
  });

  it("shows the empty state when there are no referred signups yet", () => {
    const referrals = buildReferrals();
    referrals.attributedSignups = [];

    const html = renderToStaticMarkup(
      <DashboardSettingsBillingReferralsCard referrals={referrals} />
    );

    expect(html).toContain("No referred signups yet.");
    expect(html).toContain("Share one of the codes above to start tracking attribution.");
  });
});

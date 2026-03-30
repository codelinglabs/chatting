import { renderToStaticMarkup } from "react-dom/server";

vi.mock("./dashboard-shell", () => ({
  DashboardLink: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  )
}));

import { DashboardOverview } from "./dashboard-overview";
import { DashboardPlaceholderPage } from "./dashboard-placeholder-page";

describe("dashboard overview and placeholders", () => {
  it("renders stats, top tags, and the banner state", () => {
    const html = renderToStaticMarkup(
      <DashboardOverview
        userEmail="owner@example.com"
        conversationsCount={12}
        answeredConversations={9}
        ratedConversations={4}
        topTags={[{ tag: "pricing", count: 3 }]}
        banner={{ tone: "success", text: "Billing synced." }}
      />
    );

    expect(html).toContain("Workspace inbox");
    expect(html).toContain("Signed in as owner@example.com");
    expect(html).toContain("Conversations");
    expect(html).toContain("pricing (3)");
    expect(html).toContain("Billing synced.");
    expect(html).toContain("Log out");
  });

  it("renders the empty tag state and placeholder navigation links", () => {
    const overviewHtml = renderToStaticMarkup(
      <DashboardOverview
        userEmail="owner@example.com"
        conversationsCount={0}
        answeredConversations={0}
        ratedConversations={0}
        topTags={[]}
        banner={null}
      />
    );
    const placeholderHtml = renderToStaticMarkup(
      <DashboardPlaceholderPage description="This page is still on the way." />
    );

    expect(overviewHtml).toContain("No tagging data yet.");
    expect(placeholderHtml).toContain("This page is still on the way.");
    expect(placeholderHtml).toContain('href="/dashboard/inbox"');
    expect(placeholderHtml).toContain("Open Inbox");
    expect(placeholderHtml).toContain('href="/dashboard"');
  });
});

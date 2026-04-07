import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardPublishingPage } from "./dashboard-publishing-page";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

describe("dashboard publishing page", () => {
  it("renders queued posts with status, dates, author, and category", () => {
    const html = renderToStaticMarkup(
      <DashboardPublishingPage
        queuedPosts={[
          {
            slug: "zendesk-alternatives-small-teams",
            title: "Zendesk alternatives for small teams",
            excerpt: "Excerpt",
            subtitle: "Subtitle",
            publicationStatus: "draft",
            publishedAt: "2026-04-14T09:00:00.000Z",
            updatedAt: "2026-04-14T09:00:00.000Z",
            readingTime: 10,
            authorSlug: "tina",
            categorySlug: "comparisons",
            image: { src: "/blog/test.svg", alt: "Test" },
            relatedSlugs: [],
            sections: [],
            author: { slug: "tina", name: "Tina", role: "Role", bio: "Bio", initials: "T", links: [] },
            category: { slug: "comparisons", label: "Comparisons", description: "Desc", badgeClassName: "bg-slate-100 text-slate-700" }
          }
        ]}
      />
    );

    expect(html).toContain("Queued blog posts");
    expect(html).toContain("Zendesk alternatives for small teams");
    expect(html).toContain('href="/dashboard/publishing/zendesk-alternatives-small-teams"');
    expect(html).toContain("/zendesk-alternatives-small-teams");
    expect(html).toContain("draft");
    expect(html).toContain("14 Apr 2026");
    expect(html).toContain("Tina");
    expect(html).toContain("Comparisons");
  });

  it("renders an empty state when nothing is queued", () => {
    const html = renderToStaticMarkup(<DashboardPublishingPage queuedPosts={[]} />);

    expect(html).toContain("Nothing is queued right now.");
  });
});

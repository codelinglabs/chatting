import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardPublishingPreviewPage } from "./dashboard-publishing-preview-page";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

describe("dashboard publishing preview page", () => {
  it("renders the queued article preview with a back link", () => {
    const html = renderToStaticMarkup(
      <DashboardPublishingPreviewPage
        post={{
          slug: "traffic-low-conversion",
          title: "Getting traffic but not enough sales or leads?",
          excerpt: "Excerpt",
          subtitle: "Subtitle",
          publicationStatus: "draft",
          publishedAt: "2026-04-17T09:00:00.000Z",
          updatedAt: "2026-04-17T09:00:00.000Z",
          readingTime: 8,
          authorSlug: "tina",
          categorySlug: "conversion",
          image: { src: "/blog/test.svg", alt: "Test" },
          relatedSlugs: [],
          sections: [],
          author: { slug: "tina", name: "Tina", role: "Role", bio: "Bio", initials: "T", links: [] },
          category: { slug: "conversion", label: "Conversion", description: "Desc", badgeClassName: "bg-emerald-50 text-emerald-700" }
        }}
        relatedPosts={[]}
      />
    );

    expect(html).toContain("Preview queued article");
    expect(html).toContain("Back to publishing queue");
    expect(html).toContain("Getting traffic but not enough sales or leads?");
    expect(html).toContain("17 Apr 2026");
  });
});

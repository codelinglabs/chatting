const mocks = vi.hoisted(() => ({
  notFound: vi.fn(),
  requireUser: vi.fn(),
  getQueuedBlogPostBySlug: vi.fn(),
  getRelatedBlogPosts: vi.fn()
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/blog-data", () => ({
  getQueuedBlogPostBySlug: mocks.getQueuedBlogPostBySlug,
  getRelatedBlogPosts: mocks.getRelatedBlogPosts
}));
vi.mock("../../dashboard-publishing-preview-page", () => ({
  DashboardPublishingPreviewPage: ({ post }: { post: { slug: string } }) => <div>preview:{post.slug}</div>
}));

import { renderToStaticMarkup } from "react-dom/server";
import PublishingPreviewRoute from "./page";

describe("dashboard publishing preview route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.notFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
    mocks.requireUser.mockResolvedValue({ email: "tina@usechatting.com" });
    mocks.getQueuedBlogPostBySlug.mockReturnValue({ slug: "traffic-low-conversion" });
    mocks.getRelatedBlogPosts.mockReturnValue([]);
  });

  it("renders the queued preview for the allowed viewer", async () => {
    const html = renderToStaticMarkup(
      await PublishingPreviewRoute({ params: Promise.resolve({ slug: "traffic-low-conversion" }) })
    );

    expect(html).toContain("preview:traffic-low-conversion");
  });

  it("blocks other signed-in users and missing posts", async () => {
    mocks.requireUser.mockResolvedValueOnce({ email: "alex@example.com" });
    await expect(
      PublishingPreviewRoute({ params: Promise.resolve({ slug: "traffic-low-conversion" }) })
    ).rejects.toThrow("NOT_FOUND");

    mocks.getQueuedBlogPostBySlug.mockReturnValueOnce(null);
    await expect(
      PublishingPreviewRoute({ params: Promise.resolve({ slug: "missing-post" }) })
    ).rejects.toThrow("NOT_FOUND");
  });
});

const mocks = vi.hoisted(() => ({
  notFound: vi.fn(),
  requireUser: vi.fn(),
  getQueuedBlogPosts: vi.fn()
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/lib/auth", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/blog-data", () => ({ getQueuedBlogPosts: mocks.getQueuedBlogPosts }));
vi.mock("../dashboard-publishing-page", () => ({
  DashboardPublishingPage: ({ queuedPosts }: { queuedPosts: Array<{ slug: string }> }) => <div>queued:{queuedPosts.map((post) => post.slug).join(",")}</div>
}));

import { renderToStaticMarkup } from "react-dom/server";
import PublishingPage from "./page";

describe("dashboard publishing route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.notFound.mockImplementation(() => {
      throw new Error("NOT_FOUND");
    });
    mocks.requireUser.mockResolvedValue({ email: "tina@usechatting.com" });
    mocks.getQueuedBlogPosts.mockReturnValue([{ slug: "traffic-low-conversion" }]);
  });

  it("renders the queue for the allowed viewer", async () => {
    const html = renderToStaticMarkup(await PublishingPage());

    expect(html).toContain("queued:traffic-low-conversion");
  });

  it("blocks other signed-in users", async () => {
    mocks.requireUser.mockResolvedValueOnce({ email: "alex@example.com" });

    await expect(PublishingPage()).rejects.toThrow("NOT_FOUND");
  });
});

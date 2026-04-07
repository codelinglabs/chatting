import {
  getPublishedBlogPosts,
  getQueuedBlogPosts,
  isPublishedBlogPost,
  isQueuedBlogPost
} from "@/lib/blog-publication";
import type { BlogPost } from "@/lib/blog-types";

function createPost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: "sample-post",
    title: "Sample post",
    excerpt: "Excerpt",
    subtitle: "Subtitle",
    publishedAt: "2026-04-01T09:00:00.000Z",
    updatedAt: "2026-04-01T09:00:00.000Z",
    readingTime: 5,
    authorSlug: "tina",
    categorySlug: "comparisons",
    image: {
      src: "/blog/sample.svg",
      alt: "Sample"
    },
    relatedSlugs: [],
    sections: [],
    ...overrides
  };
}

describe("blog publication", () => {
  const now = new Date("2026-04-06T12:00:00.000Z");

  it("hides draft posts from publication", () => {
    expect(isPublishedBlogPost(createPost({ publicationStatus: "draft" }), now)).toBe(false);
  });

  it("hides posts scheduled after the current timestamp", () => {
    expect(
      isPublishedBlogPost(
        createPost({ publicationStatus: "scheduled", publishedAt: "2026-04-08T09:00:00.000Z" }),
        now
      )
    ).toBe(false);
  });

  it("publishes scheduled posts once their publish time passes", () => {
    expect(
      isPublishedBlogPost(
        createPost({ publicationStatus: "scheduled", publishedAt: "2026-04-06T09:00:00.000Z" }),
        now
      )
    ).toBe(true);
  });

  it("returns only visible posts sorted newest first", () => {
    const visiblePosts = getPublishedBlogPosts(
      [
        createPost({ slug: "draft-post", publicationStatus: "draft" }),
        createPost({ slug: "future-post", publishedAt: "2026-04-08T09:00:00.000Z" }),
        createPost({ slug: "older-post", publishedAt: "2026-03-31T09:00:00.000Z" }),
        createPost({ slug: "newer-post", publishedAt: "2026-04-02T09:00:00.000Z" })
      ],
      now
    );

    expect(visiblePosts.map((post) => post.slug)).toEqual(["newer-post", "older-post"]);
  });

  it("treats drafts and future scheduled posts as queued", () => {
    expect(isQueuedBlogPost(createPost({ publicationStatus: "draft" }), now)).toBe(true);
    expect(
      isQueuedBlogPost(
        createPost({ publicationStatus: "scheduled", publishedAt: "2026-04-08T09:00:00.000Z" }),
        now
      )
    ).toBe(true);
    expect(
      isQueuedBlogPost(
        createPost({ publicationStatus: "published", publishedAt: "2026-04-08T09:00:00.000Z" }),
        now
      )
    ).toBe(false);
  });

  it("returns only queued posts sorted by target date", () => {
    const queuedPosts = getQueuedBlogPosts(
      [
        createPost({ slug: "draft-post", publicationStatus: "draft", publishedAt: "2026-04-10T09:00:00.000Z" }),
        createPost({ slug: "future-scheduled", publicationStatus: "scheduled", publishedAt: "2026-04-08T09:00:00.000Z" }),
        createPost({ slug: "already-live", publicationStatus: "scheduled", publishedAt: "2026-04-05T09:00:00.000Z" })
      ],
      now
    );

    expect(queuedPosts.map((post) => post.slug)).toEqual(["future-scheduled", "draft-post"]);
  });
});

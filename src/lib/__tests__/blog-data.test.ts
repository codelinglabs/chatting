import {
  getAllBlogAuthors,
  getBlogAuthorBySlug,
  getBlogPostBySlug,
  getBlogPostsByAuthor,
  getFeaturedBlogPost,
  getRelatedBlogPosts
} from "@/lib/blog-data";

describe("blog data", () => {
  it("returns the featured post with hydrated author and category data", () => {
    const post = getFeaturedBlogPost();

    expect(post.slug).toBe("chatting-vs-intercom");
    expect(post.author.name).toBe("Tina");
    expect(post.category.label).toBe("Comparisons");
  });

  it("returns related posts without duplicates", () => {
    const post = getBlogPostBySlug("chatting-vs-zendesk");

    expect(post).not.toBeNull();
    expect(post && getRelatedBlogPosts(post).map((entry) => entry.slug)).toEqual([
      "chatting-vs-intercom",
      "intercom-alternatives-small-business",
      "reduce-response-time-under-2-minutes"
    ]);
  });

  it("resolves the old Intercom alternatives slug as an alias", () => {
    const post = getBlogPostBySlug("best-intercom-alternatives-small-teams");

    expect(post?.slug).toBe("intercom-alternatives-small-business");
  });

  it("resolves the new Intercom retarget slug as an alias", () => {
    const post = getBlogPostBySlug("intercom-alternative-for-small-teams");

    expect(post?.slug).toBe("intercom-alternatives-small-business");
  });

  it("returns blog authors that have published posts and resolves their post collections", () => {
    expect(getAllBlogAuthors().map((author) => author.slug)).toEqual(["tina"]);
    expect(getBlogAuthorBySlug("tina")?.name).toBe("Tina");
    expect(getBlogPostsByAuthor("tina").every((post) => post.author.slug === "tina")).toBe(true);
  });

  it("resolves the old WordPress guide slug as an alias", () => {
    const post = getBlogPostBySlug("wordpress-live-chat-setup");

    expect(post?.slug).toBe("wordpress-live-chat");
  });

  it("resolves the Zendesk retarget slug and the new startups article", () => {
    expect(getBlogPostBySlug("zendesk-vs-simple-live-chat")?.slug).toBe("chatting-vs-zendesk");
    expect(getBlogPostBySlug("best-live-chat-for-startups")?.slug).toBe("best-live-chat-for-startups");
  });
});

import type { BlogPost } from "@/lib/blog-types";

function parseTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function isPublishedBlogPost(post: BlogPost, now = new Date()) {
  if (post.publicationStatus === "draft") {
    return false;
  }

  const publishedAt = parseTimestamp(post.publishedAt);
  return publishedAt !== null && publishedAt <= now.getTime();
}

export function getPublishedBlogPosts(posts: BlogPost[], now = new Date()) {
  return posts
    .filter((post) => isPublishedBlogPost(post, now))
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export function isQueuedBlogPost(post: BlogPost, now = new Date()) {
  if (post.publicationStatus === "draft") {
    return true;
  }

  if (post.publicationStatus !== "scheduled") {
    return false;
  }

  const publishedAt = parseTimestamp(post.publishedAt);
  return publishedAt !== null && publishedAt > now.getTime();
}

export function getQueuedBlogPosts(posts: BlogPost[], now = new Date()) {
  return posts
    .filter((post) => isQueuedBlogPost(post, now))
    .sort((left, right) => left.publishedAt.localeCompare(right.publishedAt));
}

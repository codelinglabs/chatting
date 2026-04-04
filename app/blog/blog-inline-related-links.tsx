import Link from "next/link";
import type { BlogPostWithDetails } from "@/lib/blog-types";
import { BlogCategoryBadge } from "./blog-primitives";

export function BlogInlineRelatedLinks({ posts }: { posts: BlogPostWithDetails[] }) {
  if (!posts.length) {
    return null;
  }

  return (
    <aside className="rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Keep reading</p>
      <h3 className="display-font mt-3 text-2xl text-slate-900">Related guides inside this topic</h3>
      <div className="mt-5 space-y-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-[18px] border border-slate-200 bg-white px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50/50"
          >
            <BlogCategoryBadge category={post.category} />
            <p className="mt-3 text-base font-semibold text-slate-900">{post.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </aside>
  );
}

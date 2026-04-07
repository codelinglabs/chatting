import Link from "next/link";
import { BlogArticleBody } from "../blog/blog-article-body";
import { BlogAuthorCard, BlogRelatedPosts } from "../blog/blog-article-extras";
import { BlogCategoryBadge } from "../blog/blog-primitives";
import type { BlogPostWithDetails } from "@/lib/blog-types";
import { formatBlogDate, formatReadingTime } from "@/lib/blog-utils";

export function DashboardPublishingPreviewPage({
  post,
  relatedPosts
}: {
  post: BlogPostWithDetails;
  relatedPosts: BlogPostWithDetails[];
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/dashboard/publishing" className="inline-flex text-sm font-medium text-blue-600 transition hover:text-blue-700">
              ← Back to publishing queue
            </Link>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Preview queued article</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              This internal preview shows the draft as it stands in code without making it public.
            </p>
          </div>
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            {post.publicationStatus ?? "draft"}
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="mx-auto max-w-4xl">
          <BlogCategoryBadge category={post.category} />
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{post.title}</h1>
          <p className="mt-5 max-w-3xl text-xl leading-8 text-slate-600">{post.subtitle}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>{post.author.name}</span>
            <span>•</span>
            <span>{formatBlogDate(post.publishedAt)}</span>
            <span>•</span>
            <span>{formatReadingTime(post.readingTime)}</span>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-[1000px] overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_30%),linear-gradient(135deg,#dbeafe_0%,#eff6ff_42%,#fff7ed_100%)] p-4 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
          <img src={post.image.src} alt={post.image.alt} className="aspect-[2/1] w-full rounded-[20px] object-cover" />
        </div>

        <div className="mx-auto mt-12 max-w-[1200px]">
          <div className="mx-auto max-w-[680px]">
            <BlogArticleBody post={post} relatedPosts={relatedPosts} />
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <BlogAuthorCard author={post.author} />
        {relatedPosts.length > 0 ? <BlogRelatedPosts posts={relatedPosts} /> : null}
      </div>
    </div>
  );
}

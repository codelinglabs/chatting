import { formatBlogDate } from "@/lib/blog-utils";
import type { BlogPostWithDetails } from "@/lib/blog-types";
import { BlogCategoryBadge } from "../blog/blog-primitives";
import Link from "next/link";

function queueStatus(post: BlogPostWithDetails): "draft" | "scheduled" {
  return post.publicationStatus === "scheduled" ? "scheduled" : "draft";
}

function statusClasses(status: "draft" | "scheduled") {
  return status === "draft"
    ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200"
    : "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
}

function queueCounts(posts: BlogPostWithDetails[]) {
  return posts.reduce(
    (summary, post) => {
      if (post.publicationStatus === "draft") {
        summary.drafts += 1;
      } else if (post.publicationStatus === "scheduled") {
        summary.scheduled += 1;
      }

      return summary;
    },
    { drafts: 0, scheduled: 0 }
  );
}

export function DashboardPublishingPage({ queuedPosts }: { queuedPosts: BlogPostWithDetails[] }) {
  const counts = queueCounts(queuedPosts);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Queued blog posts</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              This internal view stays locked to hidden drafts and future scheduled posts so you can see what is coming without exposing it on the public blog.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Drafts</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{counts.drafts}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Scheduled</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{counts.scheduled}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white">
        {queuedPosts.length === 0 ? (
          <div className="p-6 text-sm leading-6 text-slate-500">Nothing is queued right now.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Post</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Target date</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {queuedPosts.map((post) => {
                  const status = queueStatus(post);

                  return (
                    <tr key={post.slug} className="align-top">
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <Link href={`/dashboard/publishing/${post.slug}`} className="text-sm font-medium text-slate-900 transition hover:text-blue-700">
                            {post.title}
                          </Link>
                          <p className="font-mono text-xs text-slate-500">/{post.slug}</p>
                          <Link href={`/dashboard/publishing/${post.slug}`} className="inline-flex text-xs font-medium text-blue-600 transition hover:text-blue-700">
                            Preview post
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusClasses(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">{formatBlogDate(post.publishedAt)}</td>
                      <td className="px-6 py-5 text-sm text-slate-600">{post.author.name}</td>
                      <td className="px-6 py-5"><BlogCategoryBadge category={post.category} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

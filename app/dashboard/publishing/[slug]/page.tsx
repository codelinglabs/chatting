import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getQueuedBlogPostBySlug, getRelatedBlogPosts } from "@/lib/blog-data";
import { canAccessDashboardPublishing } from "@/lib/dashboard-publishing-access";
import { DashboardPublishingPreviewPage } from "../../dashboard-publishing-preview-page";

type PublishingPreviewRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublishingPreviewRoute({ params }: PublishingPreviewRouteProps) {
  const user = await requireUser();

  if (!canAccessDashboardPublishing(user.email)) {
    notFound();
  }

  const { slug } = await params;
  const post = getQueuedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <DashboardPublishingPreviewPage post={post} relatedPosts={getRelatedBlogPosts(post)} />;
}

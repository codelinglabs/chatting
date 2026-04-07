import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getQueuedBlogPosts } from "@/lib/blog-data";
import { canAccessDashboardPublishing } from "@/lib/dashboard-publishing-access";
import { DashboardPublishingPage } from "../dashboard-publishing-page";

export default async function PublishingPage() {
  const user = await requireUser();

  if (!canAccessDashboardPublishing(user.email)) {
    notFound();
  }

  return <DashboardPublishingPage queuedPosts={getQueuedBlogPosts()} />;
}

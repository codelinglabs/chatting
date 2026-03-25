import { toggleTag } from "@/lib/data";
import { dashboardRedirect, requireRouteUser } from "@/lib/route-helpers";

export async function POST(request: Request) {
  const auth = await requireRouteUser(request);
  if ("response" in auth) {
    return auth.response;
  }
  const { user } = auth;

  const formData = await request.formData();
  const conversationId = String(formData.get("conversationId") ?? "");
  const tag = String(formData.get("tag") ?? "");

  if (conversationId && tag) {
    const updated = await toggleTag(conversationId, tag, user.id);
    if (!updated) {
      return dashboardRedirect(request, {
        error: "not-found"
      });
    }
  }

  return dashboardRedirect(request, {
    conversationId
  });
}

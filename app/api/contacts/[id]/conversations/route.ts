import { getDashboardContactConversations } from "@/lib/data";
import { jsonError, jsonOk, requireJsonRouteUser } from "@/lib/route-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireJsonRouteUser();
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;
  const conversations = await getDashboardContactConversations(auth.user.id, id);
  if (!conversations) {
    return jsonError("contact-not-found", 404);
  }

  return jsonOk({ conversations });
}

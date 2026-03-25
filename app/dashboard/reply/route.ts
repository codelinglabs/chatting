import { addFounderReply, getConversationEmail } from "@/lib/data";
import { sendFounderReplyEmail } from "@/lib/email";
import { dashboardRedirect, requireRouteUser } from "@/lib/route-helpers";

export async function POST(request: Request) {
  const auth = await requireRouteUser(request);
  if ("response" in auth) {
    return auth.response;
  }
  const { user } = auth;

  const formData = await request.formData();
  const conversationId = String(formData.get("conversationId") ?? "");
  const content = String(formData.get("content") ?? "").trim();

  if (!content) {
    return dashboardRedirect(request, {
      conversationId,
      error: "empty-reply"
    });
  }

  const conversation = await getConversationEmail(conversationId, user.id);
  if (!conversation) {
    return dashboardRedirect(request, {
      error: "not-found"
    });
  }

  if (!conversation.email) {
    return dashboardRedirect(request, {
      conversationId,
      error: "no-email"
    });
  }

  try {
    await sendFounderReplyEmail({
      conversationId,
      to: conversation.email,
      content
    });
    await addFounderReply(conversationId, content, user.id);
  } catch (error) {
    console.error("reply send failed", error);
    return dashboardRedirect(request, {
      conversationId,
      error: "send-failed"
    });
  }

  return dashboardRedirect(request, {
    conversationId,
    success: "reply-sent"
  });
}

import { getPublicConversationTypingStatus } from "@/lib/data";
import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";

export function OPTIONS() {
  return publicNoContentResponse();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = String(searchParams.get("siteId") ?? "").trim();
    const sessionId = String(searchParams.get("sessionId") ?? "").trim();
    const conversationId = String(searchParams.get("conversationId") ?? "").trim();

    if (!siteId || !sessionId || !conversationId) {
      return publicJsonResponse(
        { error: "siteId, sessionId, and conversationId are required." },
        { status: 400 }
      );
    }

    const status = await getPublicConversationTypingStatus({
      siteId,
      sessionId,
      conversationId
    });

    if (!status) {
      return publicJsonResponse({ error: "Conversation not found." }, { status: 404 });
    }

    return publicJsonResponse({
      ok: true,
      teamTyping: status.teamTyping
    });
  } catch (error) {
    console.error("public conversation status error", error);
    return publicJsonResponse({ error: "Unable to load conversation status." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createUserMessage } from "@/lib/data";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders()
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const siteId = String(body.siteId ?? "").trim();
    const sessionId = String(body.sessionId ?? "").trim();
    const content = String(body.content ?? "").trim();
    const conversationId = body.conversationId ? String(body.conversationId) : null;
    const email = body.email ? String(body.email) : null;

    if (!siteId || !sessionId || !content) {
      return NextResponse.json(
        { error: "siteId, sessionId, and content are required." },
        {
          status: 400,
          headers: corsHeaders()
        }
      );
    }

    const result = await createUserMessage({
      siteId,
      sessionId,
      conversationId,
      email,
      content,
      metadata: {
        pageUrl: body.pageUrl ? String(body.pageUrl) : null,
        referrer: body.referrer ? String(body.referrer) : null,
        userAgent: request.headers.get("user-agent")
      }
    });

    return NextResponse.json(
      { ok: true, conversationId: result.conversationId },
      {
        headers: corsHeaders()
      }
    );
  } catch (error) {
    console.error("public message error", error);
    const status = error instanceof Error && error.message === "SITE_NOT_FOUND" ? 404 : 500;
    const message =
      status === 404 ? "Unknown siteId. Create a site in the dashboard first." : "Unable to store message.";

    return NextResponse.json(
      { error: message },
      {
        status,
        headers: corsHeaders()
      }
    );
  }
}

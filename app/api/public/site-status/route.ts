import { getSitePresenceStatus, recordSiteWidgetSeen } from "@/lib/data";
import { publicJsonResponse, publicNoContentResponse } from "@/lib/public-api";

export function OPTIONS() {
  return publicNoContentResponse();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = String(searchParams.get("siteId") ?? "").trim();
    const pageUrl = String(searchParams.get("pageUrl") ?? "").trim();

    if (!siteId) {
      return publicJsonResponse({ error: "siteId is required." }, { status: 400 });
    }

    const status = await getSitePresenceStatus(siteId);
    if (!status) {
      return publicJsonResponse({ error: "Site not found." }, { status: 404 });
    }

    await recordSiteWidgetSeen(siteId, pageUrl || null);

    return publicJsonResponse({
      ok: true,
      online: status.online,
      lastSeenAt: status.lastSeenAt
    });
  } catch (error) {
    console.error("public site status error", error);
    return publicJsonResponse({ error: "Unable to load site status." }, { status: 500 });
  }
}

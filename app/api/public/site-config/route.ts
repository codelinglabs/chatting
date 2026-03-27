import { getSiteWidgetConfig, recordSiteWidgetSeen } from "@/lib/data";
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

    const config = await getSiteWidgetConfig(siteId);
    if (!config) {
      return publicJsonResponse({ error: "Site not found." }, { status: 404 });
    }

    await recordSiteWidgetSeen(siteId, pageUrl || null);

    return publicJsonResponse({
      ok: true,
      site: config
    });
  } catch (error) {
    console.error("public site config error", error);
    return publicJsonResponse({ error: "Unable to load site config." }, { status: 500 });
  }
}

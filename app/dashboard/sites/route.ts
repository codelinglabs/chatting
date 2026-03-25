import { createSiteForUser } from "@/lib/data";
import { dashboardRedirect, requireRouteUser } from "@/lib/route-helpers";

export async function POST(request: Request) {
  const auth = await requireRouteUser(request);
  if ("response" in auth) {
    return auth.response;
  }
  const { user } = auth;

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const domain = String(formData.get("domain") ?? "").trim();
  const brandColor = String(formData.get("brandColor") ?? "").trim();
  const greetingText = String(formData.get("greetingText") ?? "").trim();

  if (!name) {
    return dashboardRedirect(request, {
      error: "missing-site"
    });
  }

  await createSiteForUser(user.id, {
    name,
    domain,
    brandColor,
    greetingText
  });

  return dashboardRedirect(request, {
    success: "site-created"
  });
}
